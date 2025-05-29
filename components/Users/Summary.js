// components/users/Summary.js
import React, { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import Link from 'next/link';
import { motion } from 'framer-motion';
import RegisterBusinessButton from './RegisterBusinessButton';
import ManageBusinessButton from './ManageBusinessButton';
import VendorManageModal from './VendorManageModal';

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

const UserSummary = (props) => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRegisterVendor, setShowRegisterVendor] = useState(false);
  const [hasApprovedClaims, setHasApprovedClaims] = useState(false);
  const [approvedClaimCount, setApprovedClaimCount] = useState(0);
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
const [selectedVendorId, setSelectedVendorId] = useState(null);
const [showManageModal, setShowManageModal] = useState(false);
const dropdownButtonRef = useRef(null);
const dropdownRef = useRef(null);

// This effect will close the dropdown when clicking outside of it
useEffect(() => {
  if (!showVendorDropdown) return;
  
  const handleClickOutside = (event) => {
    if (
      dropdownButtonRef.current && 
      !dropdownButtonRef.current.contains(event.target) && 
      dropdownRef.current && 
      !dropdownRef.current.contains(event.target)
    ) {
      setShowVendorDropdown(false);
    }
  };
  
  document.addEventListener("mousedown", handleClickOutside);
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [showVendorDropdown]);

  // If props.user is provided, use it directly (for integration with the dashboard page)
  // Otherwise fetch user data from Firebase (standalone usage)
  useEffect(() => {
    const fetchData = async () => {
      // If props.user is provided, use that and check for approved claims
      if (props.user) {
        setUserProfile(props.user);
        
        // If props.approvedClaims is provided, use that
        if (props.approvedClaims && Array.isArray(props.approvedClaims)) {
          setHasApprovedClaims(props.approvedClaims.length > 0);
          setApprovedClaimCount(props.approvedClaims.length);
        } 
        // Otherwise, if we have a user ID, check for approved claims in Firestore
        else if (props.user.id) {
          try {
            const claimsQuery = query(
              collection(db, "businessClaims"),
              where("userId", "==", props.user.id),
              where("status", "==", "approved")
            );
            
            const claimsSnapshot = await getDocs(claimsQuery);
            setHasApprovedClaims(!claimsSnapshot.empty);
            setApprovedClaimCount(claimsSnapshot.size);
          } catch (error) {
            console.error("Error checking for approved business claims:", error);
          }
        }
        
        setLoading(false);
        return;
      }
      
      // If no props.user, use auth state to fetch user data
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          try {
            // Get user document from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            
            if (userDoc.exists()) {
              const userData = userDoc.data();
              setUserProfile({
                id: user.uid,
                ...userData,
                email: user.email // Ensure email is always available
              });
            } else {
              // Basic profile if user document doesn't exist
              setUserProfile({
                id: user.uid,
                email: user.email,
                role: "user"
              });
            }
            
            // Check for approved business claims
            const claimsQuery = query(
              collection(db, "businessClaims"),
              where("userId", "==", user.uid),
              where("status", "==", "approved")
            );
            
            const claimsSnapshot = await getDocs(claimsQuery);
            setHasApprovedClaims(!claimsSnapshot.empty);
            setApprovedClaimCount(claimsSnapshot.size);
            
          } catch (error) {
            console.error("Error fetching user data:", error);
          } finally {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      });
      
      return () => unsubscribe();
    };
    
    fetchData();
  }, [props.user, props.approvedClaims]);

  // Handle vendor registration modal
  const handleRegisterVendor = () => {
    setShowRegisterVendor(true);
  };

  // Calculate account type based on role and approved claims
  const getAccountType = () => {
    if (!userProfile) return "Vartotojas";
    
    // Props.isVendor takes priority if provided (from parent component)
    if (props.isVendor) return "Tiekėjas";
    
    // Check role
    if (userProfile.role === "admin") return "Administratorius";
    if (userProfile.role === "vendor") return "Tiekėjas";
    
    // Check for approved claims
    if (hasApprovedClaims) return "Tiekėjas";
    
    // Check for vendors array in user document
    if (userProfile.vendors && userProfile.vendors.length > 0) return "Tiekėjas";
    
    // Check for vendorId in user document (legacy format)
    if (userProfile.vendorId) return "Tiekėjas";
    
    // Default to regular user
    return "Vartotojas";
  };

  // Get badge color based on account type
  const getAccountBadgeColor = () => {
    const accountType = getAccountType();
    
    if (accountType === "Administratorius") return "bg-purple-100 text-purple-800";
    if (accountType === "Tiekėjas") return "bg-blue-100 text-blue-800";
    return "bg-green-100 text-green-800";
  };

  if (loading) {
    return (
      <div className="bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="bg-gray-50 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-500">Prisijunkite, kad pamatytumėte savo informaciją.</p>
          </div>
        </div>
      </div>
    );
  }

  // Format date helper for consistent display
  const formatDate = (timestamp) => {
    if (!timestamp) return "Nenurodyta";
    
    try {
      if (timestamp.toDate) {
        // Firestore timestamp
        return timestamp.toDate().toLocaleDateString('lt-LT');
      } else if (timestamp.seconds) {
        // Firestore timestamp object
        return new Date(timestamp.seconds * 1000).toLocaleDateString('lt-LT');
      } else if (typeof timestamp === 'string') {
        // ISO string
        return new Date(timestamp).toLocaleDateString('lt-LT');
      } else if (timestamp instanceof Date) {
        // Date object
        return timestamp.toLocaleDateString('lt-LT');
      }
      // Default fallback
      return new Date(timestamp).toLocaleDateString('lt-LT');
    } catch (e) {
      return "Nenurodyta";
    }
  };

  // Calculate display name
  const displayName = userProfile.displayName || 
                      (userProfile.firstName && userProfile.lastName ? 
                        `${userProfile.firstName} ${userProfile.lastName}` : 
                        userProfile.email?.split('@')[0] || "Vartotojau");

  const accountType = getAccountType();
  const accountBadge = getAccountBadgeColor();
  
  // Calculate if user has vendor capabilities
  const hasVendorAccess = accountType === "Tiekėjas" || accountType === "Administratorius";
  
  // Calculate vendor count from multiple sources
  const vendorCount = (props.vendors ? props.vendors.length : 0) || 
                     (userProfile.vendors ? userProfile.vendors.length : 0) || 
                     (userProfile.vendorId ? 1 : 0) ||
                     approvedClaimCount;

  return (
    <section className="bg-gray-50 py-10">
      <motion.div 
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-gray-200">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Sveiki, {displayName}!
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Paskyra sukurta: {formatDate(userProfile.createdAt)}
              </p>
            </div>
            
            {/* Account type badge */}
            <div className="mt-4 sm:mt-0 flex items-center">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${accountBadge}`}>
                {accountType}
              </span>
              
              {/* If vendor, show how many businesses they manage */}
              {hasVendorAccess && vendorCount > 0 && (
                <span className="ml-2 text-sm text-gray-500">
                  {vendorCount === 1 
                    ? '1 valdomas verslas' 
                    : `${vendorCount} valdomi verslai`}
                </span>
              )}
            </div>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* User Email */}
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">El. paštas</dt>
                <dd className="mt-1 text-sm text-gray-900">{userProfile.email || 'Nenurodyta'}</dd>
              </div>
              
              {/* Account Type */}
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Paskyros tipas</dt>
                <dd className="mt-1 text-sm text-gray-900">{accountType}</dd>
              </div>
              
              {/* Full Name */}
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Vardas ir pavardė</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {(userProfile.firstName && userProfile.lastName) 
                    ? `${userProfile.firstName} ${userProfile.lastName}`
                    : userProfile.displayName || 'Nenurodyta'}
                </dd>
              </div>
            </dl>
            
            {/* Account actions */}
            <div className="mt-6 border-t border-gray-200 pt-6">
              <div className="flex flex-wrap gap-3">
                {/* Profile settings link */}
                <Link
                  href="/dashboard/settings"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Profilio nustatymai
                </Link>

                      {/* Vendor registration modal */}
      {showRegisterVendor && (
        <RegisterAsVendor 
          onClose={() => setShowRegisterVendor(false)}
          userId={userProfile.id}
          userEmail={userProfile.email}
        />
      )}
                
                {/* Vendor registration for regular users */}
                {accountType === "Vartotojas" && (
                  <button
                    onClick={handleRegisterVendor}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Tapti tiekėju
                  </button>
                )}

{/* Register business button - always shown */}
<RegisterBusinessButton />

{/* Manage business buttons - only shown when there are vendors */}
{props.vendors && props.vendors.length > 0 && (
  <>
    {/* If there's only one vendor, show a single button */}
    {props.vendors.length === 1 ? (
      <ManageBusinessButton vendorId={props.vendors[0].id} />
    ) : (
      /* If there are multiple vendors, show a dropdown with improved positioning */
      <div className="relative inline-block text-left">
        <button
  type="button"
  className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
  id="options-menu"
  aria-haspopup="true"
  aria-expanded="true"
  onClick={() => setShowVendorDropdown(!showVendorDropdown)}
  ref={dropdownButtonRef}  // Add this ref
>
          Valdyti verslus
          {/* Dropdown icon */}
          <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Fixed dropdown menu with portal rendering to avoid cutoff */}
        {showVendorDropdown && (
          <div 
            className="fixed z-50" 
            style={{
              top: dropdownButtonRef.current ? dropdownButtonRef.current.getBoundingClientRect().bottom + window.scrollY : 0,
              left: dropdownButtonRef.current ? dropdownButtonRef.current.getBoundingClientRect().left + window.scrollX : 0,
              width: '220px'
            }}
            ref={dropdownRef}
          >
            <div className="mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                {props.vendors.map(vendor => (
                  <a
                    key={vendor.id}
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      setSelectedVendorId(vendor.id);
                      setShowManageModal(true);
                      setShowVendorDropdown(false);
                    }}
                  >
                    {vendor.name || vendor.id}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    )}
  </>
)}

{/* Conditional render of the manage modal */}
{showManageModal && selectedVendorId && (
  <VendorManageModal 
    isOpen={showManageModal}
    onClose={() => setShowManageModal(false)}
    vendorId={selectedVendorId}
  />
)}
                
                {/* If approved claims but no vendors, show pending message */}
                {hasApprovedClaims && (!props.vendors || props.vendors.length === 0) && (
                  <div className="inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-800 bg-yellow-50">
                    Verslo prieiga patvirtinta - laukiama aktyvavimo
                  </div>
                )}
              </div>
              
              {/* Additional information for vendors */}
              {hasVendorAccess && (
                <div className="mt-4 text-sm text-gray-500">
                  {vendorCount > 0 ? (
                    props.vendors && props.vendors.length > 0 ? (
                      <p>Jūs turite prieigą prie {vendorCount} verslo profilių. Juos galite valdyti mygtuko „Valdyti verslą" pagalba.</p>
                    ) : hasApprovedClaims ? (
                      <p>Jūsų verslo prašymai buvo patvirtinti. Verslo profilis bus netrukus aktyvuotas.</p>
                    ) : (
                      <p>Jūs turite verslo tiekėjo priviliegijas.</p>
                    )
                  ) : (
                    <p>Jūs esate registruotas kaip tiekėjas, tačiau dar neturite valdomo verslo.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default UserSummary;