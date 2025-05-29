// components/users/HeaderMenu.js
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import RegisterAsVendor from './RegisterAsVendor';
import { motion, AnimatePresence } from 'framer-motion';

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
const auth = getAuth();
const db = getFirestore();

const HeaderMenu = ({ transparent = false }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showRegisterVendor, setShowRegisterVendor] = useState(false);
  const [hasApprovedClaims, setHasApprovedClaims] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const menuRef = useRef(null);
  
  // Handle clicks outside menu to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  // Check user auth status and get profile data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Get user document
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile({
              id: currentUser.uid,
              ...userData
            });
            
            // Check for approved business claims
            const claimsQuery = query(
              collection(db, "businessClaims"),
              where("userId", "==", currentUser.uid),
              where("status", "==", "approved")
            );
            
            const claimsSnapshot = await getDocs(claimsQuery);
            setHasApprovedClaims(!claimsSnapshot.empty);
            
          } else {
            setUserProfile({
              id: currentUser.uid,
              email: currentUser.email,
              role: "user"
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Handle user sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  // Open vendor registration modal
  const handleRegisterVendor = () => {
    setIsMenuOpen(false);
    setShowRegisterVendor(true);
  };
  
  // Determine if user has vendor capabilities
  const isVendor = 
    userProfile?.role === 'vendor' || 
    userProfile?.role === 'admin' || 
    hasApprovedClaims || 
    (userProfile?.vendors && userProfile.vendors.length > 0);
  
  // Determine user account type for display
  const getAccountType = () => {
    if (!userProfile) return null;
    if (userProfile.role === 'admin') return 'Administratorius';
    if (isVendor) return 'Tiekėjas';
    return 'Vartotojas';
  };
  
  // Get badge color for account type
  const getAccountBadgeColor = () => {
    const accountType = getAccountType();
    if (!accountType) return '';
    
    if (accountType === 'Administratorius') return 'bg-purple-100 text-purple-800';
    if (accountType === 'Tiekėjas') return 'bg-blue-100 text-blue-800';
    return 'bg-green-100 text-green-800';
  };
  
  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return '?';
    
    if (userProfile?.firstName && userProfile?.lastName) {
      return `${userProfile.firstName[0]}${userProfile.lastName[0]}`;
    }
    
    if (userProfile?.displayName) {
      const nameParts = userProfile.displayName.split(' ');
      if (nameParts.length >= 2) {
        return `${nameParts[0][0]}${nameParts[1][0]}`;
      }
      return userProfile.displayName[0];
    }
    
    return user.email[0].toUpperCase();
  };
  
  // Menu dropdown animation variants
  const dropdownVariants = {
    hidden: { 
      opacity: 0, 
      y: -10,
      transition: { duration: 0.2 } 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 24, 
        duration: 0.3 
      } 
    }
  };
  
  return (
    <>
      <div className={`relative z-10 ${transparent && !scrolled ? 'text-white' : ''}`} ref={menuRef}>
        {user ? (
          <div className="relative">
            {/* User avatar button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex items-center space-x-2 focus:outline-none ${
                transparent && !scrolled 
                  ? 'hover:text-gray-200' 
                  : 'hover:text-indigo-500'
              } transition-colors duration-200`}
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
              aria-label="User menu"
            >
              <div className={`relative h-10 w-10 rounded-full overflow-hidden flex items-center justify-center ${
                isVendor ? 'bg-blue-100' : 'bg-gray-100'
              } text-sm font-medium border-2 ${
                isMenuOpen 
                  ? 'border-indigo-500' 
                  : transparent && !scrolled 
                    ? 'border-white'
                    : 'border-gray-200'
              }`}>
                {userProfile?.photoURL ? (
                  <img 
                    src={userProfile.photoURL} 
                    alt={userProfile.displayName || user.email} 
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentNode.style.display = 'flex';
                    }}
                  />
                ) : (
                  <span className={`${
                    isVendor ? 'text-blue-700' : 'text-gray-700'
                  }`}>
                    {getUserInitials()}
                  </span>
                )}
                
                {/* Badge for account type */}
                <span className={`absolute -bottom-1 -right-1 h-4 w-4 ${
                  userProfile?.role === 'admin' 
                    ? 'bg-purple-500'
                    : isVendor 
                      ? 'bg-blue-500'
                      : 'bg-green-500'
                } rounded-full border-2 border-white flex items-center justify-center`}>
                  <span className="sr-only">{getAccountType()}</span>
                </span>
              </div>
              
              <span className={`hidden md:block font-medium max-w-[120px] truncate ${
                scrolled || !transparent ? 'text-gray-800' : 'text-white'
              }`}>
                {userProfile?.firstName || userProfile?.displayName || user.email.split('@')[0]}
              </span>
              
              {/* Dropdown arrow */}
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                className={`h-5 w-5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`}
              >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>
            
            {/* Dropdown menu */}
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  className="absolute right-0 z-20 mt-2 w-60 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                >
                  {/* User info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      {/* Account type badge */}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAccountBadgeColor()}`}>
                        {getAccountType()}
                      </span>
                      
                      {userProfile?.verified && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg className="mr-1 h-3 w-3 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 mt-1 truncate">
                      {userProfile?.displayName || user.email}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.email}
                    </p>
                  </div>
                  
                  {/* Navigation links */}
                  <div className="py-1">
                    <Link 
                      href="/dashboard" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                      </svg>
                      Vartotojo panelė
                    </Link>
                    
                    {isVendor && (
                      <Link 
                        href="/dashboard/vendor" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" />
                          <path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                        Valdyti verslą
                      </Link>
                    )}
                    
                    {userProfile?.role === 'admin' && (
                      <Link 
                        href="/administracija/dashboard" 
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="mr-3 h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                        </svg>
                        Administravimo skydas
                      </Link>
                    )}
                    
                    <Link 
                      href="/dashboard/settings" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="mr-3 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                      </svg>
                      Nustatymai
                    </Link>
                  </div>
                  
                  {/* Vendor registration */}
                  {!isVendor && (
                    <div className="py-1 border-t border-gray-100">
                      <button
                        onClick={handleRegisterVendor}
                        className="flex w-full items-center px-4 py-2 text-left text-sm text-indigo-700 hover:bg-indigo-50 focus:outline-none"
                      >
                        <svg className="mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Tapti tiekėju
                      </button>
                    </div>
                  )}
                  
                  {/* Sign out */}
                  <div className="py-1 border-t border-gray-100">
                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 focus:outline-none"
                    >
                      <svg className="mr-3 h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Atsijungti
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          // Login/Register buttons for non-authenticated users
          <div className="flex items-center space-x-4">
            <Link 
              href="/prisijungti" 
              className={`text-sm font-medium ${
                transparent && !scrolled 
                  ? 'text-white hover:text-gray-200' 
                  : 'text-gray-700 hover:text-indigo-600'
              } transition-colors duration-200`}
            >
              Prisijungti
            </Link>
            
            <Link 
              href="/registruotis" 
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                transparent && !scrolled 
                  ? 'bg-white text-indigo-600 hover:bg-opacity-90' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              } shadow-sm transition-colors duration-200`}
            >
              Registruotis
            </Link>
          </div>
        )}
      </div>
      
      {/* Vendor registration modal */}
      {showRegisterVendor && (
        <RegisterAsVendor 
          onClose={() => setShowRegisterVendor(false)} 
          userId={user?.uid}
          userEmail={user?.email}
        />
      )}
    </>
  );
};

export default HeaderMenu;
