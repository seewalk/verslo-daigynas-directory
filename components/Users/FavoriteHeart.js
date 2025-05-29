// components/FavoriteHeart.js
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom'; // Import ReactDOM for portals
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { setDoc } from "firebase/firestore";
import AuthModal from '../AuthModal';
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

// Component for the login message overlay
const LoginMessageOverlay = ({ onClose }) => {
  // Effect to auto-close the message after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Close after 5 seconds
    
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div 
      className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-blue-50 border-l-4 border-blue-400 p-4 shadow-lg rounded-r-md max-w-md w-[calc(100%-3rem)]"
      style={{ marginBottom: '16px' }}
    >
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-grow">
          <p className="text-sm text-blue-700">Prašome prisijungti norint pamėgti tiekėjus</p>
        </div>
        <button 
          onClick={onClose}
          className="text-blue-400 hover:text-blue-600 focus:outline-none"
          aria-label="Close message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const FavoriteHeart = ({ vendorName, size = 'medium', className = '' }) => {
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [animating, setAnimating] = useState(false);
  
  // State for auth modal and message
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  
  // Ref to track if component is mounted
  const isMounted = React.useRef(true);

  // Size variants
  const sizeClasses = {
    small: 'w-5 h-5',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  // Set isMounted to false on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Check if vendorName is provided
    if (!vendorName) {
      console.error('FavoriteHeart: No vendorName provided');
      setLoading(false);
      return;
    }

    // Check if user is authenticated and if vendor is in favorites
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted.current) return;
      
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

  const toggleFavorite = async (e) => {
    if (!vendorName) {
      console.error('Cannot toggle favorite: vendorName is undefined');
      return;
    }

    // If user is not logged in, show AuthModal and message
    if (!user) {
      e.preventDefault();
      e.stopPropagation();
      setShowAuthModal(true);
      setShowMessage(true);
      return;
    }

    setAnimating(true);

    try {
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);

      // If user doc doesn't exist, create it first
      if (!userDoc.exists()) {
        await setDoc(userRef, {
          favorites: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      // Optimistically update UI
      setIsFavorite(!isFavorite);

      if (!isFavorite) {
        await updateDoc(userRef, {
          favorites: arrayUnion(vendorName),
          updatedAt: serverTimestamp()
        });
        console.log(`Added vendor ${vendorName} to favorites`);
      } else {
        await updateDoc(userRef, {
          favorites: arrayRemove(vendorName),
          updatedAt: serverTimestamp()
        });
        console.log(`Removed vendor ${vendorName} from favorites`);
      }
    } catch (error) {
      console.error("Error updating favorites:", error);
      setIsFavorite(isFavorite); // Revert UI if error
    } finally {
      setTimeout(() => {
        if (isMounted.current) {
          setAnimating(false);
        }
      }, 300);
    }
  };

  // Handle closing the auth modal
  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  }
  
  // Handle closing the message
  const handleCloseMessage = () => {
    setShowMessage(false);
  }

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

  // Render portal components (only in browser)
  const renderPortals = () => {
    if (typeof window === 'undefined') return null;
    
    return (
      <>
        {/* Auth Modal Portal */}
        {showAuthModal && ReactDOM.createPortal(
          <AuthModal
            isOpen={showAuthModal}
            onClose={handleCloseAuthModal}
            initialTab='login'
          />,
          document.body
        )}
        
        {/* Message Overlay Portal */}
        {showMessage && ReactDOM.createPortal(
          <LoginMessageOverlay onClose={handleCloseMessage} />,
          document.body
        )}
      </>
    );
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault(); 
          e.stopPropagation();
          toggleFavorite(e);
        }}
        className={`favorite-heart-btn ${isFavorite ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'} focus:outline-none transition-colors duration-200 ${className}`}
        aria-label={isFavorite ? 'Pašalinti iš mėgstamų' : 'Pridėti į mėgstamus'}
        title={isFavorite ? 'Pašalinti iš mėgstamų' : 'Pridėti į mėgstamus'}
      >
        {isFavorite ? <FilledHeart /> : <EmptyHeart />}
      </button>
      
      {renderPortals()}
    </>
  );
};

export default FavoriteHeart;