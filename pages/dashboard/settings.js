// pages/dashboard/settings.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { 
  getAuth, 
  onAuthStateChanged, 
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendEmailVerification
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { motion } from 'framer-motion';
import TeamMemberModal from '../../components/Users/TeamMemberModal';

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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const Settings = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Vendor form states
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [price, setPrice] = useState('');
  const [services, setServices] = useState([]);
  const [newService, setNewService] = useState('');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  // Add these state variables with your other state declarations
const [teamMembers, setTeamMembers] = useState([]);
const [showTeamMemberModal, setShowTeamMemberModal] = useState(false);
const [currentTeamMember, setCurrentTeamMember] = useState(null);
const [editingTeamMemberIndex, setEditingTeamMemberIndex] = useState(-1);


  // NEW: Business Hours & Trust section states
  const [businessHours, setBusinessHours] = useState(null);
  const [verificationLevel, setVerificationLevel] = useState('none');
  const [verificationStatus, setVerificationStatus] = useState({
    email: { verified: false, verifiedAt: null },
    phone: { verified: false, verifiedAt: null },
    address: { verified: false, verifiedAt: null },
    documents: { verified: false, verifiedAt: null },
    physicalAudit: { verified: false, verifiedAt: null }
  });
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [verifyingAddress, setVerifyingAddress] = useState(false);
  const [documentFile, setDocumentFile] = useState(null);
  const [complianceBadges, setComplianceBadges] = useState([]);
  
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      setUser(currentUser);
      setNewEmail(currentUser.email);
      
      try {
        // Get user document
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile(userData);
          
          // If user is a vendor, fetch vendor profile
          if (userData.role === 'vendor' && userData.vendorId) {
            const vendorDoc = await getDoc(doc(db, "vendors", userData.vendorId));
            if (vendorDoc.exists()) {
              const vendorData = vendorDoc.data();
              setVendorProfile(vendorData);
              
              // Set initial form values from vendor data
              setCompanyName(vendorData.name || '');
              setDescription(vendorData.description || '');
              setCity(vendorData.city || '');
              setPhone(vendorData.phone || '');
              setWebsite(vendorData.website || '');
              setPrice(vendorData.price || '');
              setServices(vendorData.services || []);
              setLogoPreview(vendorData.logo || '');
              
              // NEW: Load team members
              setTeamMembers(vendorData.team || []);
              
              // Load verification-related data...
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setMessage({ 
          type: 'error', 
          text: 'Įvyko klaida gaunant vartotojo duomenis. Bandykite dar kartą vėliau.' 
        });
        setLoading(false);
      }
    } else {
      router.push('/auth?redirect=/dashboard/settings');
    }
  });
  
  return () => unsubscribe();
}, [router]);

// Team member management functions
const editTeamMember = (index) => {
  setEditingTeamMemberIndex(index);
  setCurrentTeamMember({ ...teamMembers[index] });
  setShowTeamMemberModal(true);
};

const removeTeamMember = (index) => {
  const updatedTeamMembers = [...teamMembers];
  updatedTeamMembers.splice(index, 1);
  setTeamMembers(updatedTeamMembers);
};

const handleTeamMemberSubmit = (teamMember) => {
  const updatedTeamMembers = [...teamMembers];
  
  if (editingTeamMemberIndex >= 0) {
    // Edit existing team member
    updatedTeamMembers[editingTeamMemberIndex] = teamMember;
  } else {
    // Add new team member
    // Generate an ID if one doesn't exist
    const newTeamMember = {
      ...teamMember,
      id: teamMember.id || teamMember.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
    };
    updatedTeamMembers.push(newTeamMember);
  }
  
  setTeamMembers(updatedTeamMembers);
  setShowTeamMemberModal(false);
  setEditingTeamMemberIndex(-1);
  setCurrentTeamMember(null);
};


  // NEW: Helper function to get verification level name in Lithuanian
  const getVerificationLevelName = (level) => {
    switch (level) {
      case 'premium':
        return 'Premium (Aukščiausias lygis)';
      case 'enhanced':
        return 'Išplėstinis patikrinimas';
      case 'standard':
        return 'Standartinis patikrinimas';
      case 'none':
      default:
        return 'Nepatvirtinta';
    }
  };

  // NEW: Email verification
  const handleVerifyEmail = async () => {
    setVerifyingEmail(true);
    try {
      // In a real implementation, you would send a verification email here
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Update verification status
      const updatedStatus = {
        ...verificationStatus,
        email: { verified: true, verifiedAt: new Date() }
      };
      setVerificationStatus(updatedStatus);
      
      // Update verification level if applicable
      if (!verificationLevel || verificationLevel === 'none') {
        setVerificationLevel('standard');
      }
      
      setMessage({ type: 'success', text: 'Patvirtinimo el. laiškas išsiųstas. Patikrinkite savo el. paštą.' });
    } catch (error) {
      console.error("Error sending verification email:", error);
      setMessage({ type: 'error', text: 'Klaida siunčiant patvirtinimo el. laišką' });
    } finally {
      setVerifyingEmail(false);
    }
  };

  // NEW: Phone verification
  const handleVerifyPhone = async () => {
    if (!phone) {
      setMessage({ type: 'error', text: 'Pirmiausia įveskite telefono numerį' });
      return;
    }
    
    setVerifyingPhone(true);
    try {
      // In a real implementation, you would send an SMS or make a call here
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Update verification status
      const updatedStatus = {
        ...verificationStatus,
        phone: { verified: true, verifiedAt: new Date() }
      };
      setVerificationStatus(updatedStatus);
      
      // Update verification level if applicable
      updateVerificationLevel(updatedStatus);
      
      setMessage({ type: 'success', text: 'Telefono numeris sėkmingai patvirtintas.' });
    } catch (error) {
      console.error("Error verifying phone:", error);
      setMessage({ type: 'error', text: 'Klaida tvirtinant telefono numerį' });
    } finally {
      setVerifyingPhone(false);
    }
  };

  // NEW: Address verification
  const handleVerifyAddress = async () => {
    if (!city) {
      setMessage({ type: 'error', text: 'Pirmiausia įveskite miestą' });
      return;
    }
    
    setVerifyingAddress(true);
    try {
      // In a real implementation, you would initiate an address verification process
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      // Show instructional message
      setMessage({ 
        type: 'success', 
        text: 'Adreso patvirtinimo procesas pradėtas. Patvirtinimo kodas bus išsiųstas paštu nurodytu adresu per 5-7 darbo dienas.' 
      });
      
      // Don't mark as verified yet - in a real app this would happen after the user enters the code they receive
      // Just for demo purposes we'll pretend it's been verified immediately
      const updatedStatus = {
        ...verificationStatus,
        address: { verified: true, verifiedAt: new Date() }
      };
      setVerificationStatus(updatedStatus);
      
      // Update verification level if applicable
      updateVerificationLevel(updatedStatus);
      
    } catch (error) {
      console.error("Error verifying address:", error);
      setMessage({ type: 'error', text: 'Klaida tvirtinant adresą' });
    } finally {
      setVerifyingAddress(false);
    }
  };

  // NEW: Document upload for verification
  const handleDocumentUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // File size validation (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'Failas per didelis. Maksimalus dydis: 5MB' });
      return;
    }
    
    setDocumentFile(file);
    setMessage({ 
      type: 'success', 
      text: 'Dokumentas įkeltas. Išsaugokite pakeitimus, kad dokumentas būtų pateiktas patikrai.' 
    });
  };

  // NEW: Request premium verification
  const handleRequestPremiumVerification = () => {
    // In a real app, this would open a calendar or form to schedule an audit
    setMessage({ 
      type: 'success', 
      text: 'Premium patikrinimo užklausa gauta. Mūsų komanda susisieks su jumis per 2 darbo dienas dėl audito planavimo.' 
    });
  };

  // NEW: Helper function to update verification level based on verified fields
  const updateVerificationLevel = (status) => {
    const { email, phone, address, documents, physicalAudit } = status;
    
    if (email?.verified && phone?.verified && address?.verified && documents?.verified && physicalAudit?.verified) {
      setVerificationLevel('premium');
    } else if (email?.verified && phone?.verified && address?.verified && documents?.verified) {
      setVerificationLevel('enhanced');
    } else if (email?.verified && (phone?.verified || address?.verified)) {
      setVerificationLevel('standard');
    } else if (email?.verified) {
      setVerificationLevel('standard');
    } else {
      setVerificationLevel('none');
    }
  };

  // NEW: Toggle compliance badges
  const handleComplianceBadgeToggle = (badgeType, isChecked) => {
    if (isChecked) {
      // Add badge if it doesn't exist
      if (!complianceBadges.some(b => b.type === badgeType)) {
        setComplianceBadges([...complianceBadges, {
          type: badgeType,
          issuedAt: new Date(),
          expiresAt: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) // Valid for 1 year
        }]);
      }
    } else {
      // Remove badge
      setComplianceBadges(complianceBadges.filter(b => b.type !== badgeType));
    }
  };

  // NEW: Helper function to calculate trust score
  const calculateTrustScore = () => {
    let score = 0;
    
    // Basic profile completeness (up to 30 points)
    if (companyName) score += 5;
    if (description && description.length > 50) score += 10;
    if (city) score += 5;
    if (phone) score += 5;
    if (website) score += 5;
    
    // Verification level (up to 40 points)
    if (verificationStatus?.email?.verified) score += 10;
    if (verificationStatus?.phone?.verified) score += 10;
    if (verificationStatus?.address?.verified) score += 10;
    if (verificationStatus?.documents?.verified) score += 10;
    
    // Additional trust factors (up to 30 points)
    if (services && services.length > 0) score += 5;
    if (businessHours) score += 5;
    if (vendorProfile?.logo || logoFile) score += 5;
    if (complianceBadges && complianceBadges.length > 0) score += 5;
    if (verificationStatus?.physicalAudit?.verified) score += 10;
    
    return Math.min(100, score); // Cap at 100
  };

  // NEW: Helper function to calculate profile completeness percentage
  const calculateProfileCompleteness = () => {
    let completed = 0;
    let total = 6; // Basic fields: name, description, city, phone, website, services
    
    if (companyName) completed++;
    if (description) completed++;
    if (city) completed++;
    if (phone) completed++;
    if (website) completed++;
    if (services && services.length > 0) completed++;
    
    // Add optional fields
    if (businessHours) { total++; completed++; }
    if (vendorProfile?.logo || logoFile) { total++; completed++; }
    
    return Math.round((completed / total) * 100);
  };

  // Handle email update
  const handleEmailUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!currentPassword) {
      setMessage({ type: 'error', text: 'Įveskite dabartinį slaptažodį' });
      return;
    }
    
    if (!newEmail || newEmail === user.email) {
      setMessage({ type: 'error', text: 'Įveskite naują el. pašto adresą' });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Re-authenticate user before changing email
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update email in Firebase Auth
      await updateEmail(user, newEmail);
      
      // Update email in user document
      await updateDoc(doc(db, "users", user.uid), {
        email: newEmail,
        updatedAt: serverTimestamp()
      });
      
      // If user is a vendor, update vendor email as well
      if (userProfile?.role === 'vendor' && userProfile.vendorId) {
        await updateDoc(doc(db, "vendors", userProfile.vendorId), {
          email: newEmail,
          updatedAt: serverTimestamp()
        });
      }
      
      // Send verification email for new email
      await sendEmailVerification(user);
      
      setMessage({ 
        type: 'success', 
        text: 'El. pašto adresas sėkmingai pakeistas. Patvirtinimo nuoroda išsiųsta į naująjį el. paštą.' 
      });
      setCurrentPassword('');
    } catch (error) {
      console.error("Error updating email:", error);
      setMessage({ 
        type: 'error', 
        text: 'Nepavyko pakeisti el. pašto. Patikrinkite slaptažodį ir bandykite dar kartą.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle password update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    
    if (!currentPassword) {
      setMessage({ type: 'error', text: 'Įveskite dabartinį slaptažodį' });
      return;
    }
    
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Slaptažodis turi būti bent 6 simbolių ilgio' });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Slaptažodžiai nesutampa' });
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Re-authenticate user before changing password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      // Update password
      await updatePassword(user, newPassword);
      
      setMessage({ 
        type: 'success', 
        text: 'Slaptažodis sėkmingai pakeistas.' 
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error("Error updating password:", error);
      setMessage({ 
        type: 'error', 
        text: 'Nepavyko pakeisti slaptažodžio. Patikrinkite dabartinį slaptažodį ir bandykite dar kartą.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle service array management
  const addService = () => {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]);
      setNewService('');
    }
  };
  
  const removeService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };
  
  // Handle logo file change
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle vendor profile update
const handleVendorUpdate = async (e) => {
  e.preventDefault();
  setMessage({ type: '', text: '' });
  
  if (!companyName.trim()) {
    setMessage({ type: 'error', text: 'Įmonės pavadinimas privalomas' });
    return;
  }
  
  setSubmitting(true);
    
    try {
      let logoUrl = vendorProfile?.logo || '';
      
      // Upload logo if a new one is selected
      if (logoFile) {
        const storageRef = ref(storage, `logos/${userProfile.vendorId}_${Date.now()}`);
        await uploadBytes(storageRef, logoFile);
        logoUrl = await getDownloadURL(storageRef);
      }
      
      // NEW: Upload document if selected
      if (documentFile) {
        const docStorageRef = ref(storage, `verification/${userProfile.vendorId}_${Date.now()}`);
        await uploadBytes(docStorageRef, documentFile);
        const docUrl = await getDownloadURL(docStorageRef);
        
        // Add to verification documents in vendor profile
        const verificationDocuments = vendorProfile.verificationDocuments || [];
        verificationDocuments.push({
          type: 'business_registration',
          fileUrl: docUrl,
          uploadedAt: new Date(),
          verifiedAt: null,
          status: 'pending'
        });
        
        // Set document verification status to pending
        const updatedStatus = {
          ...verificationStatus,
          documents: { verified: false, verifiedAt: null, pending: true }
        };
        setVerificationStatus(updatedStatus);
        
        setMessage({
          type: 'success',
          text: 'Dokumentas įkeltas patikrinimui. Patikrinimas gali užtrukti 1-2 darbo dienas.'
        });
        
        setDocumentFile(null);
      }
      
      // NEW: Prepare trust metrics
      const trustMetrics = {
        overallScore: calculateTrustScore(),
        profileCompleteness: calculateProfileCompleteness(),
        verificationLevel: verificationLevel,
        yearsInBusiness: vendorProfile?.trustMetrics?.yearsInBusiness || 0,
        responseRate: vendorProfile?.trustMetrics?.responseRate || 95,
        responseTime: vendorProfile?.trustMetrics?.responseTime || 4.5,
        reviewScore: vendorProfile?.trustMetrics?.reviewScore || 0,
        reviewCount: vendorProfile?.trustMetrics?.reviewCount || 0,
        disputeResolutionRate: vendorProfile?.trustMetrics?.disputeResolutionRate || 100,
        lastUpdated: new Date()
      };
      
      // Update vendor document with all fields including new ones
      const updateData = {
        name: companyName.trim(),
        description: description.trim(),
        city: city.trim(),
        phone: phone.trim(),
        website: website.trim(),
        price: price.trim(),
        services: services,
        logo: logoUrl,
        team: teamMembers, // Add team members to update data
        
        
        // NEW: Add verification and trust fields
        businessHours: businessHours || null,
        verificationLevel: verificationLevel,
        verificationStatus: verificationStatus,
        complianceBadges: complianceBadges,
        trustMetrics: trustMetrics,
        
        updatedAt: serverTimestamp()
      };
      
      // Add verification documents if they exist
      if (vendorProfile.verificationDocuments) {
        updateData.verificationDocuments = vendorProfile.verificationDocuments;
      }
      
      await updateDoc(doc(db, "vendors", userProfile.vendorId), updateData);
      
      // Also update company name in user profile
      await updateDoc(doc(db, "users", user.uid), {
        companyName: companyName.trim(),
        updatedAt: serverTimestamp()
      });
      
      setMessage({ 
        type: 'success', 
        text: 'Įmonės informacija sėkmingai atnaujinta.' 
      });
    } catch (error) {
      console.error("Error updating vendor profile:", error);
      setMessage({ 
        type: 'error', 
        text: 'Nepavyko atnaujinti įmonės informacijos. Bandykite dar kartą vėliau.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="max-w-5xl mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Nustatymai</h1>
          
          {/* Tabs */}
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="flex border-b border-gray-200">
              <button 
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'account' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('account')}
              >
                Paskyros nustatymai
              </button>
              {userProfile?.role === 'vendor' && userProfile.vendorId && (
                <button 
                  className={`px-6 py-4 text-sm font-medium ${activeTab === 'business' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('business')}
                >
                  Įmonės informacija
                </button>
              )}
              <button 
                className={`px-6 py-4 text-sm font-medium ${activeTab === 'notifications' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('notifications')}
              >
                Pranešimai
              </button>
            </div>
            
            {/* Status message */}
            {message.text && (
              <div className={`m-6 p-4 rounded-md ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                {message.text}
              </div>
            )}
            
            {/* Account Settings Tab */}
            {activeTab === 'account' && (
              <div className="p-6">
                <div className="mb-10">
                  <h2 className="text-xl font-semibold mb-6">El. pašto keitimas</h2>
                  <form onSubmit={handleEmailUpdate} className="max-w-md">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dabartinis slaptažodis
                      </label>
                      <input 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Naujas el. pašto adresas
                      </label>
                      <input 
                        type="email" 
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                      disabled={submitting}
                    >
                      {submitting ? 'Vykdoma...' : 'Keisti el. paštą'}
                    </button>
                  </form>
                </div>
                
                <div className="pt-6 border-t border-gray-200">
                  <h2 className="text-xl font-semibold mb-6">Slaptažodžio keitimas</h2>
                  <form onSubmit={handlePasswordUpdate} className="max-w-md">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dabartinis slaptažodis
                      </label>
                      <input 
                        type="password" 
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Naujas slaptažodis
                      </label>
                      <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        minLength="6"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pakartokite naują slaptažodį
                      </label>
                      <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        minLength="6"
                        required
                      />
                    </div>
                    <button 
                      type="submit" 
                      className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                      disabled={submitting}
                    >
                      {submitting ? 'Vykdoma...' : 'Keisti slaptažodį'}
                    </button>
                  </form>
                </div>
                
                <div className="pt-6 border-t border-gray-200 mt-10">
                  <h2 className="text-xl font-semibold mb-6 text-red-600">Paskyros ištrynimas</h2>
                  <p className="text-gray-700 mb-4">
                    Ištrinti paskyrą galima susisiekus su administratoriumi. Tai yra negrįžtamas veiksmas.
                  </p>
                  <button 
                    className="px-4 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    onClick={() => window.location.href = 'mailto:support@example.com?subject=Paskyros%20ištrynimas'}
                  >
                    Susisiekti dėl paskyros ištrynimo
                  </button>
                </div>
              </div>
            )}
            
            {/* Business Settings Tab - UPDATED with new sections */}
            {activeTab === 'business' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Įmonės informacija</h2>
                
                {!userProfile?.vendorId ? (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <p className="text-yellow-800">
                      Jūsų paskyra turi verslo rolę, bet dar neturi sukurto įmonės profilio.
                    </p>
                    <Link href="/dashboard/create-profile">
                      <a className="mt-3 inline-block px-4 py-2 bg-blue-600 text-white rounded-md">
                        Sukurti įmonės profilį
                      </a>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleVendorUpdate}>
                    {/* Basic Business Information Section */}
                    <div className="mb-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Pagrindinė informacija
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Įmonės pavadinimas *
                          </label>
                          <input 
                            type="text" 
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Miestas
                          </label>
                          <input 
                            type="text" 
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Telefono numeris
                          </label>
                          <input 
                            type="tel" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Svetainė
                          </label>
                          <input 
                            type="url" 
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="https://example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kainodaros informacija
                          </label>
                          <input 
                            type="text" 
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Pvz.: nuo €10/mėn."
                          />
                        </div>

  {/* List of existing team members */}
  <div className="space-y-4 mb-6">
    {teamMembers.map((member, index) => (
      <div key={member.id || index} className="border rounded-md p-4">
        <div className="flex justify-between">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-gray-200 rounded-full overflow-hidden">
              {member.photoUrl && (
                <img 
                  src={member.photoUrl} 
                  alt={member.name} 
                  className="h-full w-full object-cover" 
                />
              )}
            </div>
            <div className="ml-4">
              <h4 className="font-medium">{member.name}</h4>
              <p className="text-sm text-gray-500">{member.position}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => editTeamMember(index)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => removeTeamMember(index)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-md"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Aprašymas
                          </label>
                          <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="4"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      {/* Close the grid div here */}
                    </div>

                                {showTeamMemberModal && (
        <TeamMemberModal
          isOpen={true}
          onClose={() => setShowTeamMemberModal(false)}
          onSubmit={handleTeamMemberSubmit}
          initialData={currentTeamMember || {}}
          vendorId={userProfile?.vendorId}
        />
      )}
                       {/* Team Profiles Section (in settings.js) */}
<div className="mb-8">
  <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
    Komandos nariai
  </h3>
  
  <p className="text-sm text-gray-500 mb-4">
    Pridėkite savo komandos narius, kad klientai galėtų geriau pažinti jūsų verslą.
  </p>
                        {/* Add Team Member button */}
  <button
  type="button"
  onClick={() => setShowTeamMemberModal(true)}
  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
>
  <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
  Pridėti komandos narį
</button>
                      
                      {/* Services section */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Paslaugos
                        </label>
                        <div className="flex items-center mb-2">
                          <input 
                            type="text" 
                            value={newService}
                            onChange={(e) => setNewService(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Įveskite paslaugą"
                          />
                          <button 
                            type="button"
                            onClick={addService}
                            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-r-md hover:bg-blue-700"
                          >
                            Pridėti
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {services.map((service, index) => (
                            <div key={index} className="bg-gray-100 rounded-full px-3 py-1 flex items-center">
                              <span className="mr-1">{service}</span>
                              <button 
                                type="button" 
                                onClick={() => removeService(index)}
                                className="text-gray-500 hover:text-red-500 focus:outline-none"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          {services.length === 0 && (
                            <p className="text-sm text-gray-500">Nėra pridėtų paslaugų</p>
                          )}
                        </div>
                      </div>
                      
                      {/* Logo upload section */}
                      <div className="md:col-span-2 mt-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Įmonės logotipas
                        </label>
                        <div className="flex items-start gap-6">
                          <div className="w-24 h-24 bg-gray-100 border rounded-md overflow-hidden flex items-center justify-center">
                            {logoPreview ? (
                              <img 
                                src={logoPreview} 
                                alt="Logo preview" 
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <span className="text-gray-400">Nėra logotipo</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <input
                              type="file"
                              id="logoUpload"
                              onChange={handleLogoChange}
                              accept="image/*"
                              className="hidden"
                            />
                            <label 
                              htmlFor="logoUpload"
                              className="inline-block px-4 py-2 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 cursor-pointer"
                            >
                              Pasirinkti nuotrauką
                            </label>
                            <p className="text-sm text-gray-500 mt-1">
                              Rekomenduojamas dydis: 200x200px. Maksimalus dydis: 2MB.
                            </p>
                            {logoFile && (
                              <p className="text-sm font-medium text-gray-700 mt-2">
                                {logoFile.name} ({Math.round(logoFile.size / 1024)} KB)
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* NEW: Business Hours Section */}
                    <div className="mb-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Darbo laikas
                      </h3>
                      
                      {/* Initialize state for business hours if needed */}
                      {!businessHours && (
                        <button
                          type="button"
                          onClick={() => setBusinessHours({
                            monday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
                            tuesday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
                            wednesday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
                            thursday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
                            friday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
                            saturday: { open: "10:00", close: "16:00", isOpen24Hours: false, isClosed: false },
                            sunday: { open: "", close: "", isOpen24Hours: false, isClosed: true },
                            timezone: "Europe/Vilnius"
                          })}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mb-4"
                        >
                          Nustatyti darbo laiką
                        </button>
                      )}
                      
                      {businessHours && (
                        <>
                          <div className="space-y-4">
                            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                              const dayNames = {
                                monday: 'Pirmadienis',
                                tuesday: 'Antradienis',
                                wednesday: 'Trečiadienis',
                                thursday: 'Ketvirtadienis',
                                friday: 'Penktadienis',
                                saturday: 'Šeštadienis',
                                sunday: 'Sekmadienis'
                              };
                              
                              return (
                                <div key={day} className="grid grid-cols-12 gap-4 items-center">
                                  <div className="col-span-2 font-medium">
                                    {dayNames[day]}
                                  </div>
                                  
                                  <div className="col-span-3">
                                    <label className="inline-flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={businessHours[day]?.isClosed || false}
                                        onChange={(e) => {
                                          setBusinessHours({
                                            ...businessHours,
                                            [day]: {
                                              ...businessHours[day],
                                              isClosed: e.target.checked,
                                              isOpen24Hours: false
                                            }
                                          });
                                        }}
                                        className="form-checkbox h-4 w-4 text-blue-600"
                                      />
                                      <span className="ml-2 text-sm">Uždaryta</span>
                                    </label>
                                  </div>
                                  
                                  <div className="col-span-3">
                                    <label className="inline-flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={businessHours[day]?.isOpen24Hours || false}
                                        onChange={(e) => {
                                          setBusinessHours({
                                            ...businessHours,
                                            [day]: {
                                              ...businessHours[day],
                                              isOpen24Hours: e.target.checked,
                                              isClosed: false
                                            }
                                          });
                                        }}
                                        className="form-checkbox h-4 w-4 text-blue-600"
                                      />
                                      <span className="ml-2 text-sm">Visą parą</span>
                                    </label>
                                  </div>
                                  
                                  {(!businessHours[day]?.isClosed && !businessHours[day]?.isOpen24Hours) && (
                                    <>
                                      <div className="col-span-2">
                                        <input
                                          type="time"
                                          value={businessHours[day]?.open || ''}
                                          onChange={(e) => {
                                            setBusinessHours({
                                              ...businessHours,
                                              [day]: {
                                                ...businessHours[day],
                                                open: e.target.value
                                              }
                                            });
                                          }}
                                          className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                        />
                                      </div>
                                      
                                      <div className="col-span-2">
                                        <input
                                          type="time"
                                          value={businessHours[day]?.close || ''}
                                          onChange={(e) => {
                                            setBusinessHours({
                                              ...businessHours,
                                              [day]: {
                                                ...businessHours[day],
                                                close: e.target.value
                                              }
                                            });
                                          }}
                                          className="w-full px-2 py-1 border border-gray-300 rounded-md"
                                        />
                                      </div>
                                    </>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          
                          <div className="mt-4 text-sm text-gray-500">
                            <p>Laiko juosta: Europe/Vilnius (UTC+2/UTC+3)</p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    {/* NEW: Verification Section */}
                    <div className="mb-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Patikrinimo statusas
                      </h3>
                      
                      <div className="bg-blue-50 p-4 rounded-md mb-6">
                        <h4 className="font-medium text-blue-800">Dabartinis patikrinimo lygis</h4>
                        <p className="text-blue-700 mt-1">{getVerificationLevelName(verificationLevel || 'none')}</p>
                        <p className="text-sm text-blue-600 mt-2">
                          Patvirtinkite savo įmonės informaciją, kad gautumėte aukštesnį patikrinimo lygį ir didesnį pasitikėjimo įvertinimą.
                        </p>
                      </div>
                      
                      <div className="space-y-4">
                        {/* Email verification */}
                        <div className="p-4 border border-gray-200 rounded-md">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium">El. pašto patikrinimas</h4>
                              <p className="text-sm text-gray-500">Patvirtinkite savo verslo el. paštą</p>
                            </div>
                            
                            {verificationStatus?.email?.verified ? (
                              <div className="flex items-center text-green-500">
                                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Patvirtinta
                              </div>
                            ) : (
                              <button 
                                type="button"
                                onClick={handleVerifyEmail}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                disabled={verifyingEmail}
                              >
                                {verifyingEmail ? 'Siunčiama...' : 'Patvirtinti el. paštą'}
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Phone verification */}
                        <div className="p-4 border border-gray-200 rounded-md">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium">Telefono numerio patikrinimas</h4>
                              <p className="text-sm text-gray-500">Patvirtinkite savo verslo telefono numerį</p>
                            </div>
                            
                            {verificationStatus?.phone?.verified ? (
                              <div className="flex items-center text-green-500">
                                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Patvirtinta
                              </div>
                            ) : !phone ? (
                              <p className="text-sm text-gray-500">Pirmiausia įveskite telefono numerį</p>
                            ) : (
                              <button 
                                type="button"
                                onClick={handleVerifyPhone}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                disabled={verifyingPhone}
                              >
                                {verifyingPhone ? 'Siunčiama...' : 'Patvirtinti telefono numerį'}
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Address verification */}
                        <div className="p-4 border border-gray-200 rounded-md">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium">Adreso patikrinimas</h4>
                              <p className="text-sm text-gray-500">Patvirtinkite savo verslo vietą</p>
                            </div>
                            
                            {verificationStatus?.address?.verified ? (
                              <div className="flex items-center text-green-500">
                                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Patvirtinta
                              </div>
                            ) : !city ? (
                              <p className="text-sm text-gray-500">Pirmiausia įveskite miestą</p>
                            ) : (
                              <button 
                                type="button"
                                onClick={handleVerifyAddress}
                                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                disabled={verifyingAddress}
                              >
                                {verifyingAddress ? 'Tvarkoma...' : 'Pradėti adreso patikrą'}
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Document verification */}
                        <div className="p-4 border border-gray-200 rounded-md">
                          <div className="flex justify-between">
                            <div>
                              <h4 className="font-medium">Verslo dokumentų patikrinimas</h4>
                              <p className="text-sm text-gray-500">Įkelkite verslo registracijos dokumentus išplėstiniam patikrinimui</p>
                            </div>
                            
                            {verificationStatus?.documents?.verified ? (
                              <div className="flex items-center text-green-500">
                                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Patvirtinta
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <input
                                  type="file"
                                  id="documentUpload"
                                  onChange={handleDocumentUpload}
                                  accept="application/pdf,image/*"
                                  className="hidden"
                                />
                                <label 
                                  htmlFor="documentUpload"
                                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer"
                                >
                                  Įkelti dokumentus
                                </label>
                                {documentFile && (
                                  <span className="ml-2 text-sm text-gray-600">
                                    {documentFile.name}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Premium verification */}
                        {verificationLevel === 'enhanced' && (
                          <div className="p-4 border border-gray-200 rounded-md">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="font-medium">Premium patikrinimas</h4>
                                <p className="text-sm text-gray-500">Suplanuokite apsilankymą vietoje aukščiausiam patikrinimo lygiui</p>
                              </div>
                              
                              {verificationStatus?.physicalAudit?.verified ? (
                                <div className="flex items-center text-green-500">
                                  <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  Patvirtinta
                                </div>
                              ) : (
                                <button 
                                  type="button"
                                  onClick={handleRequestPremiumVerification}
                                  className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                                >
                                  Užsakyti patikrinimą
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* NEW: Compliance Badges Section */}
                    <div className="mb-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                        Atitikties sertifikatai
                      </h3>
                      
                      <p className="text-sm text-gray-500 mb-4">
                        Pažymėkite, kuriuos atitikties sertifikatus jūsų įmonė turi, kad galėtume juos rodyti jūsų profilyje.
                      </p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="gdpr_compliant"
                            checked={complianceBadges.some(badge => badge.type === 'GDPR_compliant')}
                            onChange={(e) => handleComplianceBadgeToggle('GDPR_compliant', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="gdpr_compliant" className="ml-2 block text-sm text-gray-900">
                            GDPR Atitikimas (Bendrasis duomenų apsaugos reglamentas)
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="iso_27001"
                            checked={complianceBadges.some(badge => badge.type === 'ISO_27001')}
                            onChange={(e) => handleComplianceBadgeToggle('ISO_27001', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="iso_27001" className="ml-2 block text-sm text-gray-900">
                            ISO 27001 (Informacijos saugumo valdymas)
                          </label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="sustainable"
                            checked={complianceBadges.some(badge => badge.type === 'sustainable')}
                            onChange={(e) => handleComplianceBadgeToggle('sustainable', e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                          />
                          <label htmlFor="sustainable" className="ml-2 block text-sm text-gray-900">
                            Tvarus verslas (Naudoja tvarius verslo metodus)
                          </label>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-xs text-gray-500">
                        <p>Pastaba: Pažymėdami šiuos laukelius, jūs patvirtinate, kad turite atitinkamus sertifikatus ar atitinkate reikalavimus.</p>
                        <p>Mes pasiliekame teisę paprašyti papildomų įrodymų.</p>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <button 
                        type="submit" 
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                        disabled={submitting}
                      >
                        {submitting ? 'Vykdoma...' : 'Išsaugoti pakeitimus'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
            
            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-6">Pranešimų nustatymai</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">El. pašto pranešimai</h3>
                      <p className="text-sm text-gray-500">Gauti pranešimus el. paštu</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        defaultChecked 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  {userProfile?.role === 'vendor' && (
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Užklausos dėl paslaugų</h3>
                        <p className="text-sm text-gray-500">Gauti pranešimus apie naujas užklausas</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          defaultChecked 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Naujienlaiškis</h3>
                      <p className="text-sm text-gray-500">Gauti naujienas ir aktualią informaciją</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                <div className="mt-8">
                  <button 
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Išsaugoti nustatymus
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Settings;
                