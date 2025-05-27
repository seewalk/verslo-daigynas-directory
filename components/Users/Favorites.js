// components/users/Favorites.js
import React, { useState, useEffect, useRef } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import VendorCard from '../VendorCard';
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
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // Firebase app already initialized
  app = initializeApp(firebaseConfig, "favorites-component");
}
const auth = getAuth(app);
const db = getFirestore(app);

const Favorites = ({ maxDisplay = 0, showTitle = true }) => {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [favoriteVendors, setFavoriteVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const sectionRef = useRef(null);
  const titleRef = useRef(null);

  // Animation effect
  useEffect(() => {
    if (sectionRef.current) {
      setTimeout(() => {
        sectionRef.current.classList.add('animate-in');
      }, 100);
    }
    if (titleRef.current) {
      setTimeout(() => {
        titleRef.current.classList.add('animate-in');
      }, 200);
    }
  }, []);

  // Load favorites and vendor data
  useEffect(() => {
    // This function handles all the data fetching in a single async flow
    const loadFavoritesAndVendors = async (currentUser) => {
      try {
        // Step 1: Get user favorites
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (!userDoc.exists()) {
          console.log("User document not found");
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        const userFavorites = userData.favorites || [];
        setFavorites(userFavorites);
        
        if (userFavorites.length === 0) {
          console.log("No favorites found for user");
          setLoading(false);
          return;
        }

        // Step 2: Get all vendors
        const vendorsSnapshot = await getDocs(collection(db, "vendors"));
        const allVendors = [];
        
        vendorsSnapshot.forEach((doc) => {
          allVendors.push({
            id: doc.id,
            ...doc.data()
          });
        });

        console.log("All vendors:", allVendors.map(v => v.name));
        console.log("User favorites:", userFavorites);

        // Step 3: Find matching vendors
        const matched = [];
        
        // First look for exact matches
        for (const favorite of userFavorites) {
          const exactMatch = allVendors.find(v => v.name === favorite);
          if (exactMatch) {
            console.log(`Found exact match for "${favorite}": ${exactMatch.name}`);
            matched.push(exactMatch);
            continue;
          }
          
          // If no exact match, try case-insensitive match
          const caseInsensitiveMatch = allVendors.find(
            v => v.name && favorite && v.name.toLowerCase() === favorite.toLowerCase()
          );
          if (caseInsensitiveMatch) {
            console.log(`Found case-insensitive match for "${favorite}": ${caseInsensitiveMatch.name}`);
            matched.push(caseInsensitiveMatch);
          } else {
            console.log(`No match found for favorite: "${favorite}"`);
          }
        }
        
        console.log(`Found ${matched.length} vendors matching ${userFavorites.length} favorites`);
        
        // Apply display limit if needed
        const displayVendors = maxDisplay > 0 ? matched.slice(0, maxDisplay) : matched;
        setFavoriteVendors(displayVendors);
        
      } catch (error) {
        console.error("Error loading favorites and vendors:", error);
      } finally {
        setLoading(false);
      }
    };

    // Start the data loading process when the auth state is determined
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        loadFavoritesAndVendors(currentUser);
      } else {
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [maxDisplay]);

  // Don't render anything if not logged in
  if (!user && !loading) {
    return null;
  }

  return (
    <section 
      ref={sectionRef} 
      className="py-12 px-4 md:px-8 bg-gray-50 opacity-0 translate-y-8 transition-all duration-700 ease-out"
    >
      <div className="max-w-6xl mx-auto">
        {showTitle && (
          <div className="mb-8 text-center">
            <h2 
              ref={titleRef} 
              className="text-3xl font-bold text-gray-900 mb-3 opacity-0 translate-y-6 transition-all duration-700 delay-100 ease-out"
            >
              Mėgstamos įmonės
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Jūsų išsaugotos ir pažymėtos įmonės ir paslaugos.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : favoriteVendors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteVendors.map((vendor, index) => (
              <motion.div
                key={vendor.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <VendorCard
                  id={vendor.id}
                  name={vendor.name}
                  city={vendor.city}
                  services={vendor.services || []}
                  price={vendor.price}
                  website={vendor.website}
                  logo={vendor.logo}
                  description={vendor.description}
                  email={vendor.email}
                  phone={vendor.phone}
                  googleReview={vendor.googleReview}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <svg 
              className="w-16 h-16 text-gray-300 mx-auto mb-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Dar neturite mėgstamų įmonių</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Naršykite katalogą ir pridėkite įmones prie mėgstamų, spausdami širdutės ikoną.
            </p>
            <a 
              href="/tiekejai" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Naršyti katalogą
            </a>
          </div>
        )}

        {/* Show "View All" link if maxDisplay is set and there are more favorites */}
        {maxDisplay > 0 && favoriteVendors.length > 0 && favorites.length > maxDisplay && (
          <div className="mt-8 text-center">
            <a 
              href="/dashboard/favorites" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              Peržiūrėti visas mėgstamas įmones
              <svg 
                className="ml-2 w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                ></path>
              </svg>
            </a>
          </div>
        )}
      </div>
      
      {/* Add CSS for animations */}
      <style jsx>{`
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
    </section>
  );
};

export default Favorites;

