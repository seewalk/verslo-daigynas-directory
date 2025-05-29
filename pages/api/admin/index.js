// pages/api/admin/index.js
import { getAuth, verifyIdToken } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if it hasn't been already
let admin;
try {
  admin = initializeApp();
} catch (error) {
  // If already initialized, use the existing app
  admin = initializeApp(
    {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    },
    'admin-api'
  );
}

// Auth middleware
const authenticateAdmin = async (req, res) => {
  try {
    // Get token from authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }
    
    const token = authHeader.split('Bearer ')[1];
    // Verify token
    const decodedToken = await verifyIdToken(token);
    
    // Get user from Firestore and check if admin
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists || userDoc.data().role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Not an admin user' });
    }
    
    // Add user info to request for further use
    req.adminUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      ...userDoc.data()
    };
    
    return null; // Authentication successful
  } catch (error) {
    console.error('Error authenticating admin:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

export default async function handler(req, res) {
  // Authenticate the request
  const authError = await authenticateAdmin(req, res);
  if (authError) return authError; // Stop if authentication failed
  
  // Handle different methods
  switch (req.method) {
    case 'GET':
      try {
        // Get admin dashboard data
        const db = getFirestore();
        
        // Get counts for dashboard
        const [
          vendorsSnapshot,
          claimsSnapshot,
          businessClaimsSnapshot
        ] = await Promise.all([
          db.collection('vendors').count().get(),
          db.collection('businessClaims').where('status', '==', 'pending').count().get(),
          db.collection('businessClaims').count().get()
        ]);
        
        // Get recent notifications
        const notificationsSnapshot = await db.collection('adminNotifications')
          .where('status', '==', 'unread')
          .where('forAdmins', 'array-contains', req.adminUser.uid)
          .orderBy('createdAt', 'desc')
          .limit(5)
          .get();
        
        const notifications = [];
        notificationsSnapshot.forEach(doc => {
          notifications.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        res.status(200).json({
          counts: {
            totalVendors: vendorsSnapshot.data().count,
            pendingClaims: claimsSnapshot.data().count,
            totalClaims: businessClaimsSnapshot.data().count
          },
          notifications,
          adminUser: req.adminUser
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
        res.status(500).json({ error: 'Failed to fetch admin data' });
      }
      break;
      
    case 'POST':
      // Handle admin actions
      try {
        const { action, data } = req.body;
        const db = getFirestore();
        
        let result;
        switch (action) {
          case 'update_claim_status':
            // Update a business claim status
            const { claimId, status, notes } = data;
            
            await db.collection('businessClaims').doc(claimId).update({
              status,
              adminNotes: notes,
              processedBy: req.adminUser.uid,
              processedAt: new Date(),
              updatedAt: new Date()
            });
            
            // Log the activity
            await db.collection('adminLogs').add({
              adminId: req.adminUser.uid,
              adminEmail: req.adminUser.email,
              action: 'update_claim_status',
              description: `Business claim status updated to ${status}`,
              relatedDocId: claimId,
              relatedCollection: 'businessClaims',
              ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
              userAgent: req.headers['user-agent'],
              timestamp: new Date()
            });
            
            result = { success: true, message: 'Claim status updated successfully' };
            break;
            
          default:
            return res.status(400).json({ error: 'Invalid action' });
        }
        
        res.status(200).json(result);
      } catch (error) {
        console.error('Error processing admin action:', error);
        res.status(500).json({ error: 'Failed to process admin action' });
      }
      break;
      
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
