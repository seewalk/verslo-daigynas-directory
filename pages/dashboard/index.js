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
  getDoc
} from "firebase/firestore";
import { initializeApp } from "firebase/app";
import HeaderMenu from '../../components/Users/HeaderMenu';
import Footer from '../../components/Footer';
import UserSummary from '../../components/Users/Summary';
import Favorites from '../../components/Users/Favorites';
import TeamProfiles from '../../components/Users/TeamProfiles';

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

// Helper function to generate URL-friendly vendor slug
const generateVendorSlug = (name) => {
  if (!name) return '';
  return name.toLowerCase().replace(/\s+/g, '-');
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
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const fetchUserData = async (user) => {
      try {
        // Get user document
        const userDoc = await getDoc(doc(db, "users", user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile({
            id: user.uid,
            ...userData
          });
          
          // If user is a vendor, fetch vendor profile
          if (userData.role === 'vendor' && userData.vendorId) {
            const vendorDoc = await getDoc(doc(db, "vendors", userData.vendorId));
            if (vendorDoc.exists()) {
              setVendorProfile({
                id: vendorDoc.id,
                ...vendorDoc.data()
              });
            }
          }
        } else {
          // If user document doesn't exist yet, set basic info
          setUserProfile({
            id: user.uid,
            email: user.email,
            createdAt: user.metadata.creationTime,
            role: 'user'
          });
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
  }, []);
  
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
        <HeaderMenu />
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4">Kraunama...</h2>
          <p>Prašome palaukti, kol gausime įmonės informaciją.</p>
        </div>
        <Footer />
      </>
    );
  }
    return (
   <>
      <HeaderMenu />
      <main>
        <UserSummary />
        <TeamProfiles />
        <Favorites userId={user?.uid} />
      </main>
      <Footer />
    </>
  );
};

export default Dashboard;
