// pages/dashboard/debug-favorites.js
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import Header from '../../components/Header';
import Footer from '../../components/Footer';

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

const DebugFavoritesPage = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch user data
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
          
          // Fetch all vendors
          const vendorsRef = collection(db, "vendors");
          const vendorsSnapshot = await getDocs(vendorsRef);
          const vendorsList = [];
          
          vendorsSnapshot.forEach((doc) => {
            vendorsList.push({
              id: doc.id,
              ...doc.data()
            });
          });
          
          setVendors(vendorsList);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
        
        setLoading(false);
      } else {
        window.location.href = '/auth';
      }
    });
    
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">Loading...</div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Debug Favorites</h1>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-bold mb-2">User Info</h2>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>UID:</strong> {user?.uid}</p>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-bold mb-2">User Data from Firestore</h2>
          <pre className="bg-white p-4 rounded overflow-auto max-h-64">
            {JSON.stringify(userData, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-lg font-bold mb-2">Favorites</h2>
          {userData?.favorites && userData.favorites.length > 0 ? (
            <ul className="list-disc pl-6">
              {userData.favorites.map((fav, index) => (
                <li key={index} className="mb-2">
                  <strong>{fav}</strong> 
                  - {vendors.some(v => v.name === fav) ? 
                      'Matches vendor exactly' : 
                      vendors.some(v => v.name.toLowerCase() === fav.toLowerCase()) ? 
                        'Matches vendor (case-insensitive)' : 
                        'No matching vendor found'
                    }
                </li>
              ))}
            </ul>
          ) : (
            <p>No favorites found.</p>
          )}
        </div>
        
        <div className="bg-gray-100 p-4 rounded-lg">
          <h2 className="text-lg font-bold mb-2">All Vendors</h2>
          {vendors.length > 0 ? (
            <ul className="list-disc pl-6">
              {vendors.map((vendor) => (
                <li key={vendor.id} className="mb-2">
                  <strong>{vendor.name}</strong> (ID: {vendor.id})
                  {userData?.favorites?.includes(vendor.name) && 
                    <span className="ml-2 text-green-600 font-bold">★ Favorited (exact match)</span>
                  }
                  {!userData?.favorites?.includes(vendor.name) && 
                   userData?.favorites?.some(fav => fav.toLowerCase() === vendor.name.toLowerCase()) &&
                    <span className="ml-2 text-orange-500 font-bold">★ Favorited (case-insensitive match)</span>
                  }
                </li>
              ))}
            </ul>
          ) : (
            <p>No vendors found.</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DebugFavoritesPage;
