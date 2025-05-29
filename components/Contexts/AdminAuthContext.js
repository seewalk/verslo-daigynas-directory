// contexts/AdminAuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/router';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDh1UzH616RKW5kNs35rAZogLofmTCQefI",
  authDomain: "verslo-daigynas.firebaseapp.com",
  projectId: "verslo-daigynas",
  storageBucket: "verslo-daigynas.firebasestorage.app",
  messagingSenderId: "972798978146",
  appId: "1:972798978146:web:1d2e8191f5f79ef010493b",
  measurementId: "G-6HQLW76K5C"
};

// Initialize Firebase - make sure this only happens once
let firebaseApp;
try {
  firebaseApp = initializeApp(firebaseConfig);
} catch (error) {
  if (!/already exists/.test(error.message)) {
    console.error('Firebase initialization error', error.stack);
  }
  firebaseApp = initializeApp(firebaseConfig, 'adminContext');
}

// Create context
const AdminAuthContext = createContext();

// Provider component
export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const db = getFirestore(firebaseApp);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is an admin
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setAdminUser(user);
            setAdminData(userDoc.data());
          } else {
            setAdminUser(null);
            setAdminData(null);
            
            // If on admin page but not admin, redirect
            if (router.pathname.startsWith('/administracija') && 
                router.pathname !== '/administracija/login') {
              router.push('/administracija/login');
            }
          }
        } catch (err) {
          console.error("Error checking admin status:", err);
          setAdminUser(null);
          setAdminData(null);
        }
      } else {
        setAdminUser(null);
        setAdminData(null);
        
        // If on admin page but not logged in, redirect
        if (router.pathname.startsWith('/administracija') && 
            router.pathname !== '/administracija/login') {
          router.push('/administracija/login');
        }
      }
      
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [auth, db, router]);
  
  const value = {
    adminUser,
    adminData,
    loading,
    isAdmin: !!adminUser
  };
  
  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

// Hook for using the context
export const useAdminAuth = () => {
  return useContext(AdminAuthContext);
};

export default AdminAuthContext;