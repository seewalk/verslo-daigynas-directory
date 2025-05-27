// components/FavoriteHeart.js
import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore";
import { initializeApp } from "firebase/app";

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
  app = initializeApp(firebaseConfig, "favorite-heart-component");
}
const auth = getAuth(app);
const db = getFirestore(app);

const FavoriteHeart = ({ vendorName, size = 'medium', className = '' }) => {
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);

  // Size variants
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  useEffect(() => {
    // Check if vendorName is provided
    if (!vendorName) {
      console.error('FavoriteHeart: No vendorName provided');
      setLoading(false);
      return;
    }

    // Check if user is authenticated and if vendor is in favorites
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser && vendorName) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Look for the vendor name in the favorites array
            const favorites = userData.favorites || [];
            setIsFavorite(favorites.includes(vendorName));
          }
          
          setLoading(false);
        } catch (error) {
          console.error("Error checking favorites:", error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [vendorName]);

  const toggleFavorite = async () => {
    // Validate we have a vendorName
    if (!vendorName) {
      console.error('Cannot toggle favorite: vendorName is undefined');
      return;
    }
    
    // If not logged in, redirect to login
    if (!user) {
      window.location.href = `/auth?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }
    
    setAnimating(true);
    
    try {
      const userRef = doc(db, "users", user.uid);
      
      // Get current user data to check if favorites array exists
      const userDoc = await getDoc(userRef);
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      // Ensure the favorites array exists
      if (!userData.favorites) {
        await updateDoc(userRef, {
          favorites: []
        });
      }
      
      // Optimistically update UI
      setIsFavorite(!isFavorite);
      
      if (!isFavorite) {
        // Add to favorites
        await updateDoc(userRef, {
          favorites: arrayUnion(vendorName),
          updatedAt: serverTimestamp()
        });
        console.log(`Added vendor ${vendorName} to favorites`);
      } else {
        // Remove from favorites
        await updateDoc(userRef, {
          favorites: arrayRemove(vendorName),
          updatedAt: serverTimestamp()
        });
        console.log(`Removed vendor ${vendorName} from favorites`);
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      // Revert UI on error
      setIsFavorite(isFavorite);
    } finally {
      // End animation after a delay for visual feedback
      setTimeout(() => setAnimating(false), 300);
    }
  };

  // SVG for filled heart (favorite)
  const FilledHeart = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`${sizeClasses[size]} ${animating ? 'scale-125' : ''} transition-all duration-300`}
    >
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  );

  // SVG for empty heart (not favorite)
  const EmptyHeart = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
      className={`${sizeClasses[size]} ${animating ? 'scale-125' : ''} transition-all duration-300`}
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} 
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );

  // Don't render anything while loading
  if (loading) {
    return null;
  }

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // Prevent parent click events (like clicking on a card)
        e.stopPropagation();
        toggleFavorite();
      }}
      className={`favorite-heart-btn ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'} focus:outline-none transition-colors duration-200 ${className}`}
      aria-label={isFavorite ? 'Pašalinti iš mėgstamų' : 'Pridėti į mėgstamus'}
      title={isFavorite ? 'Pašalinti iš mėgstamų' : 'Pridėti į mėgstamus'}
    >
      {isFavorite ? <FilledHeart /> : <EmptyHeart />}
    </button>
  );
};

export default FavoriteHeart;
