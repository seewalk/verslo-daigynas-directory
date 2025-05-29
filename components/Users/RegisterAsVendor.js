// components/users/RegisterAsVendor.js
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import Link from 'next/link';

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

// Initialize Firebase (if not already initialized elsewhere)
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // Firebase app already initialized
  app = initializeApp(firebaseConfig, "register-vendor-component");
}
const auth = getAuth(app);
const db = getFirestore(app);

const RegisterAsVendor = ({ className = "", buttonStyle = "default" }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const checkUserStatus = async (user) => {
      try {
        // Method 1: Check if user has vendorId in their profile
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // If user has a vendorId, check if that vendor actually exists
          if (userData.vendorId) {
            const vendorDoc = await getDoc(doc(db, "vendors", userData.vendorId));
            // Only hide button if the vendor document actually exists
            if (vendorDoc.exists()) {
              setShouldShow(false);
              setLoading(false);
              return;
            }
          }
        }
        
        // Method 2: Check if user is listed as an owner in any vendor document
        const vendorsRef = collection(db, "vendors");
        const q = query(vendorsRef, where("ownerUid", "==", user.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // User owns a vendor profile, don't show button
          setShouldShow(false);
        } else {
          // User doesn't have a vendor profile, show button
          setShouldShow(true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking vendor status:", error);
        setLoading(false);
        // In case of error, don't show the button to be safe
        setShouldShow(false);
      }
    };
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        checkUserStatus(currentUser);
      } else {
        setUser(null);
        setShouldShow(false);
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // If loading or should not show, return null
  if (loading || !shouldShow) {
    return null;
  }

  // Button variants based on style prop
  const getButtonClasses = () => {
    switch (buttonStyle) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors';
      case 'secondary':
        return 'bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors';
      case 'outline':
        return 'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-md transition-colors';
      case 'text':
        return 'bg-transparent text-blue-600 hover:text-blue-800 font-medium py-2 px-4 transition-colors';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors';
    }
  };

  return (
    <Link href="/dashboard/become-vendor" legacyBehavior>
      <a className={`${getButtonClasses()} ${className}`}>
        Registruoti įmonę
      </a>
    </Link>
  );
};

