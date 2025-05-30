// components/Header.js
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import AuthModal from './AuthModal';
import HeaderMenu from './Users/HeaderMenu';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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

const Header = () => {
  const [language, setLanguage] = useState('lt');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [stickManPosition, setStickManPosition] = useState(-40);
  const [stickManState, setStickManState] = useState('walking');
  const animationRef = useRef(null);
  const headerRef = useRef(null);
  const router = useRouter();
  
  // Auth state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState(''); // For debugging
  const [userId, setUserId] = useState('');
  
  // Check authentication state on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const isUserLoggedIn = !!user;
      setIsLoggedIn(isUserLoggedIn);
      
      if (user) {
        setUserEmail(user.email || 'No email');
        setUserId(user.uid);
        
        try {
          // Check Firestore for admin role
          const userRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Check if role is 'admin' or if role array includes 'admin'
            let adminStatus = false;
            
            if (Array.isArray(userData.role)) {
              // If role is an array, check if it includes 'admin'
              adminStatus = userData.role.includes('admin');
            } else {
              // If role is a string, check if it equals 'admin'
              adminStatus = userData.role === 'admin';
            }
            
            console.log('User role from Firestore:', userData.role);
            console.log('Admin status:', adminStatus);
            
            setIsAdmin(adminStatus);
          } else {
            console.log('User document not found in Firestore');
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setUserEmail('');
        setUserId('');
        setIsAdmin(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Debug log for admin status changes
  useEffect(() => {
    console.log('Current auth state:', { isLoggedIn, isAdmin, userEmail, userId });
  }, [isLoggedIn, isAdmin, userEmail, userId]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Animation for stick man
  useEffect(() => {
    let animationFrame;
    let startTime;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (stickManState === 'walking' && elapsed > 2000) {
        setStickManPosition(prev => Math.min(prev + 0.5, 0));
        if (stickManPosition >= -1) {
          setStickManState('entering');
          startTime = timestamp;
        }
      } else if (stickManState === 'entering' && elapsed > 500) {
        setStickManState('inside');
        setStickManPosition(0);
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [stickManPosition, stickManState]);

  // Handle auth modal functions
  const openAuthModal = (tab) => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Manual logout function with explicit admin flag reset
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUserEmail('');
      setUserId('');
      setMenuOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  // Determine if user should see admin links
  const showAdminLinks = isLoggedIn && isAdmin;
  
  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      }`}
    >
      {/* Debug info div - only visible in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-0 right-0 bg-black text-white text-xs p-2 z-50">
          Logged in: {isLoggedIn ? 'Yes' : 'No'} | 
          Admin: {isAdmin ? 'Yes' : 'No'} | 
          Email: {userEmail}
        </div>
      )}
      
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center relative">
          {/* Logo */}
          <Link href={showAdminLinks ? "/administracija/dashboard" : "/"} legacyBehavior>
            <a className="flex items-center">
              <div className="relative">
                <div
                  className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center"
                  style={{ transform: `translateX(${stickManPosition}px)` }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="white"
                    className="w-6 h-6"
                  >
                    <path d="M12 2c-4.42 0-8 3.58-8 8 0 1.95.7 3.73 1.86 5.12L12 22l6.14-6.88C19.3 13.73 20 11.95 20 10c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
                  </svg>
                </div>
              </div>
              <span className={`ml-2 font-bold text-xl ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                {showAdminLinks ? 'Admin Panel' : 'Verslo Daigynas'}
              </span>
            </a>
          </Link>

          {/* Navigation links - desktop */}
          <div className="hidden md:flex items-center space-x-6">
            <nav className="flex space-x-6">
              {showAdminLinks ? (
                // Admin navigation links - only show prasymai and tiekejai
                <>
                  <Link href="/administracija/dashboard/verslo-peremimo-prasymai" legacyBehavior>
                    <a className={`nav-link ${scrolled ? 'text-gray-800' : 'text-white'} hover:text-blue-500 transition-colors`}>
                      Prašymai
                    </a>
                  </Link>
                  <Link href="/administracija/dashboard/tiekejai" legacyBehavior>
                    <a className={`nav-link ${scrolled ? 'text-gray-800' : 'text-white'} hover:text-blue-500 transition-colors`}>
                      Tiekėjai
                    </a>
                  </Link>
                </>
              ) : (
                // Regular user navigation links
                <>
                  <Link href="/" legacyBehavior>
                    <a className={`nav-link ${scrolled ? 'text-gray-800' : 'text-white'} hover:text-blue-500 transition-colors`}>
                      Pagrindinis
                    </a>
                  </Link>
                  <Link href="/tiekejai" legacyBehavior>
                    <a className={`nav-link ${scrolled ? 'text-gray-800' : 'text-white'} hover:text-blue-500 transition-colors`}>
                      Katalogas
                    </a>
                  </Link>
                  <Link href="/apie-mus" legacyBehavior>
                    <a className={`nav-link ${scrolled ? 'text-gray-800' : 'text-white'} hover:text-blue-500 transition-colors`}>
                      Apie mus
                    </a>
                  </Link>
                  <Link href="/kontaktai" legacyBehavior>
                    <a className={`nav-link ${scrolled ? 'text-gray-800' : 'text-white'} hover:text-blue-500 transition-colors`}>
                      Kontaktai
                    </a>
                  </Link>
                </>
              )}
            </nav>

            {/* Authentication section */}
            <div className="flex items-center">
              {isLoggedIn ? (
                // Render HeaderMenu for logged in users
                <HeaderMenu isAdmin={isAdmin} onLogout={handleLogout} />
              ) : (
                // Render sign in buttons for guests
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => openAuthModal('login')}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      scrolled
                        ? 'text-blue-600 hover:text-blue-800'
                        : 'text-white hover:text-blue-200'
                    }`}
                  >
                    Prisijungti
                  </button>
                  <button
                    onClick={() => openAuthModal('register')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Registruotis
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-500 focus:outline-none"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-6 w-6 ${scrolled ? 'text-gray-800' : 'text-white'}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden mt-4"
            >
              <div className="bg-white shadow-lg rounded-lg p-4">
                <nav className="flex flex-col space-y-3">
                  {showAdminLinks ? (
                    // Admin mobile navigation - only prasymai and tiekejai
                    <>
                      <Link href="/administracija/dashboard/verslo-peremimo-prasymai" legacyBehavior>
                        <a 
                          className="nav-link text-gray-800 hover:text-blue-500 transition-colors" 
                          onClick={() => setMenuOpen(false)}
                        >
                          Prašymai
                        </a>
                      </Link>
                      <Link href="/administracija/dashboard/tiekejai" legacyBehavior>
                        <a 
                          className="nav-link text-gray-800 hover:text-blue-500 transition-colors" 
                          onClick={() => setMenuOpen(false)}
                        >
                          Tiekėjai
                        </a>
                      </Link>
                    </>
                  ) : (
                    // Regular mobile navigation
                    <>
                      <Link href="/" legacyBehavior>
                        <a 
                          className="nav-link text-gray-800 hover:text-blue-500 transition-colors" 
                          onClick={() => setMenuOpen(false)}
                        >
                          Pagrindinis
                        </a>
                      </Link>
                      <Link href="/tiekejai" legacyBehavior>
                        <a 
                          className="nav-link text-gray-800 hover:text-blue-500 transition-colors" 
                          onClick={() => setMenuOpen(false)}
                        >
                          Katalogas
                        </a>
                      </Link>
                      <Link href="/apie-mus" legacyBehavior>
                        <a 
                          className="nav-link text-gray-800 hover:text-blue-500 transition-colors" 
                          onClick={() => setMenuOpen(false)}
                        >
                          Apie mus
                        </a>
                      </Link>
                      <Link href="/kontaktai" legacyBehavior>
                        <a 
                          className="nav-link text-gray-800 hover:text-blue-500 transition-colors" 
                          onClick={() => setMenuOpen(false)}
                        >
                          Kontaktai
                        </a>
                      </Link>
                    </>
                  )}
                </nav>

                {/* Mobile authentication buttons */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {isLoggedIn ? (
                    <div className="space-y-3">
                      {showAdminLinks ? (
                        // Admin actions
                        <Link href="/administracija/dashboard" legacyBehavior>
                          <a 
                            className="block w-full py-2 text-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" 
                            onClick={() => setMenuOpen(false)}
                          >
                            Admin skydelis
                          </a>
                        </Link>
                      ) : (
                        // User actions
                        <Link href="/dashboard" legacyBehavior>
                          <a 
                            className="block w-full py-2 text-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors" 
                            onClick={() => setMenuOpen(false)}
                          >
                            Valdymo skydelis
                          </a>
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full py-2 text-center bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                      >
                        Atsijungti
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        onClick={() => {
                          openAuthModal('login');
                          setMenuOpen(false);
                        }}
                        className="block w-full py-2 text-center bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                      >
                        Prisijungti
                      </button>
                      <button
                        onClick={() => {
                          openAuthModal('register');
                          setMenuOpen(false);
                        }}
                        className="block w-full py-2 text-center bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Registruotis
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        initialTab={authModalTab}
      />
    </header>
  );
};

export default Header;