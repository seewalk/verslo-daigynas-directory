// components/users/Summary.js 
import React, { useState, useEffect, useRef } from 'react'; 
import { getAuth, onAuthStateChanged } from "firebase/auth"; 
import { getFirestore, doc, getDoc } from "firebase/firestore"; 
import { initializeApp } from "firebase/app"; 
import Link from 'next/link'; 
import RegisterAsVendor from './RegisterAsVendor';
import { motion } from 'framer-motion';

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

// Format date helper function 
const formatDate = (timestamp) => {
  if (!timestamp) return 'Not available';
  
  if (timestamp && timestamp.toDate) {
    // Firestore timestamp
    return timestamp.toDate().toLocaleDateString('lt-LT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else if (typeof timestamp === 'string') {
    // ISO string
    return new Date(timestamp).toLocaleDateString('lt-LT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } else {
    try {
      return new Date(timestamp).toLocaleDateString('lt-LT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  }
};

// Calculate profile completion percentage
const calculateProfileCompletion = (user, userProfile, vendorProfile) => {
  // Profile completion calculation logic...
  // You can keep your existing logic here
  return Math.min(100, Math.max(0, Math.round((userProfile ? 70 : 30) + (vendorProfile ? 30 : 0))));
};

const UserSummary = ({ compact = false }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [showTips, setShowTips] = useState(false);
  const summaryRef = useRef(null);

  useEffect(() => {
    // Animation effect using Intersection Observer
    const observerOptions = {
      root: null,
      threshold: 0.2,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe summary element
    if (summaryRef.current) observer.observe(summaryRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async (user) => {
      try {
        // Get user document
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        let userData = null;
        if (userDoc.exists()) {
          userData = {
            id: user.uid,
            ...userDoc.data()
          };
          setUserProfile(userData);
          
          // If user is a vendor, fetch vendor profile
          if (userData.role === 'vendor' && userData.vendorId) {
            const vendorDoc = await getDoc(doc(db, "vendors", userData.vendorId));
            if (vendorDoc.exists()) {
              const vendorData = {
                id: vendorDoc.id,
                ...vendorDoc.data()
              };
              setVendorProfile(vendorData);
              
              // Calculate profile completeness
              setProfileCompleteness(calculateProfileCompletion(user, userData, vendorData));
            } else {
              setProfileCompleteness(calculateProfileCompletion(user, userData, null));
            }
          } else {
            // Calculate profile completeness for non-vendor users
            setProfileCompleteness(calculateProfileCompletion(user, userData, null));
          }
        } else {
          // If user document doesn't exist yet, set basic info
          setProfileCompleteness(calculateProfileCompletion(user, null, null));
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
        setUser(null);
        setUserProfile(null);
        setVendorProfile(null);
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Show nothing if not logged in or loading
  if (loading || !user) {
    return null;
  }

  // Compact version (for header, sidebar, etc.)
  if (compact) {
    return (
      <div className="user-summary-compact flex items-center">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-medium shadow-sm">
          {user.email.charAt(0).toUpperCase()}
        </div>
        <div className="ml-3">
          <p className="font-medium text-gray-800">{user.displayName || user.email.split('@')[0]}</p>
          <p className="text-xs text-gray-500">
            {userProfile?.role === 'vendor' ? 'Verslo paskyra' : 'Vartotojo paskyra'}
          </p>
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div 
      ref={summaryRef}
      className="user-summary bg-white rounded-xl shadow-md overflow-hidden transition-all duration-500"
    >
      {/* Background accent */}
      <div className="h-3 bg-gradient-to-r from-blue-500 to-blue-600"></div>
      
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* User basic info & avatar */}
          <motion.div 
            className="md:w-1/3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-medium shadow-md">
                {user.email.charAt(0).toUpperCase()}
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-bold text-gray-800">
                  {user.displayName || user.email.split('@')[0]}
                </h2>
                <p className="text-gray-500">{user.email}</p>
              </div>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Paskyros tipas:</span>
                <span className="font-medium">{userProfile?.role === 'vendor' ? 'Verslo' : 'Vartotojo'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Narys nuo:</span>
                <span className="font-medium">{formatDate(user.metadata.creationTime)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Paskutinis prisijungimas:</span>
                <span className="font-medium">{formatDate(user.metadata.lastSignInTime)}</span>
              </div>
              
              {userProfile?.companyName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Įmonė:</span>
                  <span className="font-medium">{userProfile.companyName}</span>
                </div>
              )}
            </div>
            
            {!userProfile?.role || userProfile?.role !== 'vendor' ? (
              <div className="mt-6">
                <RegisterAsVendor buttonStyle="primary" className="w-full py-2 flex justify-center" />
              </div>
            ) : null}
          </motion.div>
          
          {/* Profile completeness & action items */}
          <motion.div 
            className="md:w-2/3 md:border-l md:pl-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Profile completion bar */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <h3 className="font-semibold text-gray-800">Profilio užpildymas</h3>
                <span className="font-medium text-blue-600">{profileCompleteness}%</span>
              </div>
              
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${profileCompleteness}%` }}
                ></div>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* User verification status */}
              {!user.emailVerified && (
                <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">Patvirtinkite el. paštą</h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>Patikrinkite savo el. paštą ir spustelėkite patvirtinimo nuorodą.</p>
                      </div>
                      <div className="mt-2">
                        <button 
                          className="text-sm font-medium text-amber-800 hover:text-amber-600"
                          onClick={() => {/* Add email verification logic */}}
                        >
                          Siųsti patvirtinimą iš naujo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Vendor profile creation reminder */}
              {userProfile?.role === 'vendor' && !vendorProfile && (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Sukurkite įmonės profilį</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>Papildykite savo verslo informaciją, kad būtumėte matomi kataloge.</p>
                      </div>
                      <div className="mt-2">
                        <Link href="/dashboard/create-profile" legacyBehavior>
                          <a className="text-sm font-medium text-blue-800 hover:text-blue-600">
                            Sukurti profilį
                          </a>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Quick action buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                <Link href="/dashboard/settings" legacyBehavior>
                  <a className="flex items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                    <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Nustatymai
                  </a>
                </Link>
                
                <Link href="/dashboard/favorites" legacyBehavior>
                  <a className="flex items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                    <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Mėgstami
                  </a>
                </Link>
                
                {userProfile?.role === 'vendor' && vendorProfile && (
                  <Link href={`/dashboard/edit-profile/${userProfile.vendorId}`} legacyBehavior>
                    <a className="flex items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
                      <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Redaguoti profilį
                    </a>
                  </Link>
                )}
                
                {/* Help & tips button */}
                <button 
                  onClick={() => setShowTips(!showTips)}
                  className="flex items-center justify-center p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Patarimai
                </button>
              </div>
              
              {/* Tips & help section */}
              {showTips && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 bg-gray-50 p-4 rounded-lg overflow-hidden"
                >
                  <h4 className="font-medium text-gray-800 mb-3">Keletas patarimų:</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Užpildykite savo profilį, kad gautumėte geresnius pasiūlymus</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Pridėkite įmones prie mėgstamų spausdami širdutės ikoną</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-4 h-4 text-blue-500 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Reguliariai atnaujinkite savo verslo informaciją</span>
                    </li>
                  </ul>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Add CSS for animations */}
      <style jsx>{`
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </div>
  );
};

export default UserSummary;

