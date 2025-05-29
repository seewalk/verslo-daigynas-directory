// components/Administracija/Prisijungimas.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc 
} from 'firebase/firestore';

const AdminLoginModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();
  
  // Check authentication status on initial load
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Check if user is an admin
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists() && userDoc.data().role === 'admin') {
            setIsAdmin(true);
            
            // If modal was opened but user is already admin, close it and redirect
            if (isOpen) {
              onClose();
              router.push('/administracija/dashboard');
            }
          } else {
            setIsAdmin(false);
            setError('Jūs neturite administratoriaus teisių.');
            // Sign out if the user is not an admin
            auth.signOut();
          }
        } catch (err) {
          console.error("Error checking admin status:", err);
          setError('Klaida tikrinant administratoriaus teises.');
        }
      } else {
        setIsAdmin(false);
      }
    });
    
    return () => unsubscribe();
  }, [auth, db, isOpen, onClose, router]);
  
  // Handle login submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // Sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);
      
      // Admin check is handled in the onAuthStateChanged listener
    } catch (err) {
      console.error("Error signing in:", err);
      
      // Localized error messages
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Neteisingas el. pašto formatas.');
          break;
        case 'auth/user-disabled':
          setError('Šis vartotojas užblokuotas.');
          break;
        case 'auth/user-not-found':
          setError('Vartotojas su tokiu el. paštu nerastas.');
          break;
        case 'auth/wrong-password':
          setError('Neteisingas slaptažodis.');
          break;
        case 'auth/too-many-requests':
          setError('Per daug bandymų prisijungti. Bandykite vėliau.');
          break;
        default:
          setError('Klaida bandant prisijungti. Bandykite dar kartą.');
      }
      
      setLoading(false);
    }
  };
  
  // Handle password reset
  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email) {
      setError('Įveskite el. pašto adresą.');
      setLoading(false);
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      console.error("Error sending password reset:", err);
      
      switch (err.code) {
        case 'auth/invalid-email':
          setError('Neteisingas el. pašto formatas.');
          break;
        case 'auth/user-not-found':
          setError('Vartotojas su tokiu el. paštu nerastas.');
          break;
        default:
          setError('Klaida siunčiant slaptažodžio atkūrimo nuorodą.');
      }
    }
    
    setLoading(false);
  };
  
  // Animation variants
  const modalVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 }
  };
  
  // If modal is not open, don't render
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div 
          className="bg-white rounded-lg max-w-md w-full shadow-xl"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: 'spring', damping: 25, stiffness: 500 }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {showForgotPassword 
                  ? 'Slaptažodžio atkūrimas' 
                  : 'Administratoriaus prisijungimas'}
              </h2>
              <button 
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Uždaryti"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Display errors */}
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            {/* Login form */}
            {!showForgotPassword ? (
              <form onSubmit={handleLogin}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="email">
                    El. pašto adresas
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin@example.com"
                    required
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="password">
                    Slaptažodis
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="********"
                    required
                  />
                </div>
                
                <div className="flex items-center justify-between mb-6">
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Pamiršote slaptažodį?
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Jungiamasi...
                    </>
                  ) : (
                    'Prisijungti'
                  )}
                </button>
              </form>
            ) : (
              // Forgot password form
              resetSent ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl text-gray-800 mb-2">Nuoroda išsiųsta!</h3>
                  <p className="text-gray-600 mb-6">
                    Slaptažodžio atkūrimo nuoroda išsiųsta į {email}. Patikrinkite savo el. paštą.
                  </p>
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setResetSent(false);
                    }}
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Grįžti į prisijungimą
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePasswordReset}>
                  <div className="mb-4">
                    <p className="text-gray-600 mb-4">
                      Įveskite savo el. pašto adresą ir mes atsiųsime jums slaptažodžio atkūrimo nuorodą.
                    </p>
                    <label className="block text-gray-700 text-sm font-medium mb-2" htmlFor="reset-email">
                      El. pašto adresas
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="admin@example.com"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      className="text-gray-600 hover:text-gray-800 font-medium"
                      onClick={() => setShowForgotPassword(false)}
                    >
                      Atšaukti
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 flex items-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Siunčiama...
                        </>
                      ) : (
                        'Siųsti nuorodą'
                      )}
                    </button>
                  </div>
                </form>
              )
            )}
            
            <div className="mt-6 pt-4 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Ši sritis skirta tik administratoriams.
                {!showForgotPassword && (
                  <a 
                    href="/" 
                    className="ml-2 text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Grįžti į svetainę
                  </a>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdminLoginModal;
