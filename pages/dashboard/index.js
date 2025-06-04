// pages/dashboard/index.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import Footer from '../../components/Footer';
import UserSummary from '../../components/Users/Summary';
import Favorites from '../../components/Users/Favorites';
import TeamProfiles from '../../components/Users/TeamProfiles';
import ManageBusinessButton from '../../components/Users/ManageBusinessButton';
import ServiceRequestsList from '../../components/Users/ServiceRequestList';
import UserServiceRequestsList from '../../components/Users/UserServiceRequestList';

// Firebase initialization
const firebaseConfig = {
  apiKey: "AIzaSyDh1UzH616RKW5kNs35rAZogLofmTCQefI",
  authDomain: "verslo-daigynas.firebaseapp.com",
  projectId: "verslo-daigynas",
  storageBucket: "verslo-daigynas.firebasestorage.app",
  messagingSenderId: "972798978146",
  appId: "1:972798978146:web:1d2e8191f5f79ef010493b",
  measurementId: "G-6HQLW76K5C"
};

// Format date helper function
const formatDate = (timestamp) => {
  if (!timestamp) return 'Not available';
  
  if (timestamp.toDate) {
    // Firestore timestamp
    return timestamp.toDate().toLocaleString();
  } else if (typeof timestamp === 'string') {
    // ISO string
    return new Date(timestamp).toLocaleString();
  } else {
    // Date object or other
    return new Date(timestamp).toLocaleString();
  }
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [vendorProfiles, setVendorProfiles] = useState([]);
  const [approvedClaims, setApprovedClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const fetchUserData = async (user) => {
      try {
        // Get user document
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        let userData = {};
        
        if (userDoc.exists()) {
          userData = userDoc.data();
          setUserProfile({
            id: user.uid,
            ...userData
          });
        } else {
          // If user document doesn't exist yet, set basic info
          userData = {
            email: user.email,
            createdAt: user.metadata.creationTime,
            role: 'user'
          };
          setUserProfile({
            id: user.uid,
            ...userData
          });
        }
        
        // 1. Check for approved business claims first
        const claimsQuery = query(
          collection(db, "businessClaims"),
          where("userId", "==", user.uid),
          where("status", "==", "approved")
        );
        
        const claimsSnapshot = await getDocs(claimsQuery);
        const claimsData = [];
// Update user role if needed based on claims
if (claimsData.length > 0 && userData.role !== 'admin' && userData.role !== 'vendor' && user?.uid) {
  // User has approved claims but no vendor role yet
  console.log("User has approved claims but no vendor role - updating role");
  
  // Update the Firestore document with the new role
  try {
    await updateDoc(doc(db, "users", user.uid), {
      role: 'vendor',
      roleUpdatedAt: serverTimestamp()
    });
    
    console.log(`Updated user ${user.uid} role to vendor in database`);
    
    // Also update local state
    setUserProfile(prevProfile => ({
      ...prevProfile,
      role: 'vendor'
    }));
  } catch (error) {
    console.error("Error updating user role in Firestore:", error);
  }
}
        const claimVendorIds = new Set();
        
        // Process approved claims
        if (!claimsSnapshot.empty) {
          for (const doc of claimsSnapshot.docs) {
            const claimData = doc.data();
            claimsData.push({
              id: doc.id,
              ...claimData
            });
            
            // Add vendor ID to the set
            if (claimData.vendorId) {
              claimVendorIds.add(claimData.vendorId);
            } else if (claimData.businessId) {
              claimVendorIds.add(claimData.businessId);
            }
          }
          
          setApprovedClaims(claimsData);
          
          // Update user role if needed based on claims
          if (claimsData.length > 0 && userData.role !== 'admin' && userData.role !== 'vendor') {
            // User has approved claims but no vendor role yet
            console.log("User has approved claims but no vendor role - updating role");
            // Note: We're not updating the Firestore document here,
            // just updating the local state for display purposes
            setUserProfile(prevProfile => ({
              ...prevProfile,
              role: 'vendor'
            }));
          }
        }
        
        // 2. Fetch vendor information from various sources
        const vendorsToFetch = new Set();
        
        // a. Add vendors from approved claims
        claimVendorIds.forEach(id => vendorsToFetch.add(id));
        
        // b. Add vendors from user document's vendors array
        if (userData.vendors && Array.isArray(userData.vendors)) {
          userData.vendors.forEach(id => vendorsToFetch.add(id));
        }
        
        // c. Add single vendor if old format is used
        if (userData.vendorId) {
          vendorsToFetch.add(userData.vendorId);
        }
        
        // 3. Fetch all vendor documents
        const vendorData = [];
        for (const vendorId of vendorsToFetch) {
          const vendorDoc = await getDoc(doc(db, "vendors", vendorId));
          if (vendorDoc.exists()) {
            vendorData.push({
              id: vendorDoc.id,
              ...vendorDoc.data()
            });
          }
        }
        
        // 4. Supplement with vendor-user relationships
        const relationshipsQuery = query(
          collection(db, "vendorUserRelationships"),
          where("userId", "==", user.uid),
          where("status", "==", "active")
        );
        
        const relationshipsSnapshot = await getDocs(relationshipsQuery);
        
        if (!relationshipsSnapshot.empty) {
          for (const doc of relationshipsSnapshot.docs) {
            const relationshipData = doc.data();
            
            // Skip if we already have this vendor
            if ([...vendorsToFetch].includes(relationshipData.vendorId)) {
              continue;
            }
            
            const vendorDoc = await getDoc(doc(db, "vendors", relationshipData.vendorId));
            if (vendorDoc.exists()) {
              vendorData.push({
                id: vendorDoc.id,
                ...vendorDoc.data(),
                relationshipType: relationshipData.type,
                permissions: relationshipData.permissions
              });
              
              // Add to set of fetched vendors
              vendorsToFetch.add(relationshipData.vendorId);
            }
          }
        }
        
        setVendorProfiles(vendorData);
        
 // 5. Final logic check for role determination
if (userData.role !== 'admin' && vendorData.length > 0 && userData.role !== 'vendor' && user?.uid) {
  // User has associated vendors but no vendor role
  console.log("User has associated vendors but no vendor role - updating role");
  
  // Update the Firestore document with the new role
  try {
    await updateDoc(doc(db, "users", user.uid), {
      role: 'vendor',
      roleUpdatedAt: serverTimestamp()
    });
    
    console.log(`Updated user ${user.uid} role to vendor in database`);
    
    // Also update local state
    setUserProfile(prevProfile => ({
      ...prevProfile,
      role: 'vendor'
    }));
  } catch (error) {
    console.error("Error updating user role in Firestore:", error);
  }
}

setLoading(false);
} catch (error) {
  console.error("Error fetching user data:", error);
  setLoading(false);
}
};

const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  if (currentUser) {
    setUser(currentUser);
    fetchUserData(currentUser);
  } else {
    router.push('/');
  }
});

return () => unsubscribe();
}, [router]);
  
  // Function to handle sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  // Handle loading state
  if (router.isFallback || loading) {
    return (
      <>
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4">Kraunama...</h2>
          <p>Prašome palaukti, kol gausime informaciją.</p>
        </div>
        <Footer />
      </>
    );
  }
  
  // Determine if user has vendor capabilities
  const isVendor = userProfile?.role === 'vendor' || userProfile?.role === 'admin' || approvedClaims.length > 0;
  
  return (
    <>
      <main>
        <UserSummary 
          user={userProfile} 
          vendors={vendorProfiles} 
          approvedClaims={approvedClaims}
          isVendor={isVendor}
        />

        <ServiceRequestsList />

        <UserServiceRequestsList />
        
      {vendorProfiles.length > 0 && (
  <section className="max-w-6xl mx-auto px-4 py-8">
    <h2 className="text-2xl font-bold mb-4">Jūsų verslai</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {vendorProfiles.map(vendor => (
        <div key={vendor.id} className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6">
            <h3 className="text-xl font-bold mb-2">{vendor.name}</h3>
            <p className="text-gray-600 mb-4 text-sm truncate">{vendor.description || 'Nėra aprašymo'}</p>
            <div className="flex justify-between items-center">
              <span className={`px-2 py-1 text-xs rounded-full ${
                vendor.verificationLevel === 'premium' 
                  ? 'bg-green-100 text-green-800' 
                  : vendor.verificationLevel === 'enhanced' 
                    ? 'bg-blue-100 text-blue-800'
                    : vendor.verificationLevel === 'standard'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
              }`}>
                {vendor.verificationLevel === 'premium' 
                  ? 'Premium' 
                  : vendor.verificationLevel === 'enhanced' 
                    ? 'Išplėstinis' 
                    : vendor.verificationLevel === 'standard'
                      ? 'Standartinis'
                      : 'Nepatvirtinta'}
              </span>
              
              {/* Replace Link with ManageBusinessButton */}
              <ManageBusinessButton vendorId={vendor.id} />
              
              {/* Keep the Link as a fallback or for users who prefer page navigation */}
              {/* 
              <Link 
                href={`/dashboard/vendor/${vendor.id}`}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium ml-2"
              >
                Peržiūrėti &rarr;
              </Link>
              */}
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
)}
        
        {approvedClaims.length > 0 && vendorProfiles.length === 0 && (
          <section className="max-w-6xl mx-auto px-4 py-8 bg-yellow-50 rounded-lg border border-yellow-100">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800">Jūsų verslo prašymai buvo patvirtinti</h3>
                <p className="mt-2 text-sm text-yellow-700">
                  Jūsų verslo prašymai buvo patvirtinti, bet verslo profiliai dar nėra pilnai integruoti. 
                  Susisiekite su administratoriumi dėl papildomos pagalbos.
                </p>
              </div>
            </div>
          </section>
        )}
        
        <TeamProfiles userId={user?.uid} />
        <Favorites userId={user?.uid} />
      </main>
      
      {/* Sign out button */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex justify-end">
        <button
          onClick={handleSignOut}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Atsijungti
        </button>
      </div>
      
      <Footer />
    </>
  );
};

export default Dashboard;
