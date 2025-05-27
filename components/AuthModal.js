import React, { useState, useEffect } from 'react';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail 
} from "firebase/auth";
import { initializeApp } from "firebase/app";

import {
  getFirestore,
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";


const AuthModal = ({ isOpen, onClose, initialTab = 'login' }) => {
  // Initialize Firebase (directly in the component for simplicity)
  const firebaseConfig = {
    apiKey: "AIzaSyDh1UzH616RKW5kNs35rAZogLofmTCQefI",
    authDomain: "verslo-daigynas.firebaseapp.com",
    projectId: "verslo-daigynas",
    storageBucket: "verslo-daigynas.firebasestorage.app",
    messagingSenderId: "972798978146",
    appId: "1:972798978146:web:1d2e8191f5f79ef010493b",
    measurementId: "G-6HQLW76K5C"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);

  // State for controlling tab switching (login/register)
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  // Register form state
  const [registerForm, setRegisterForm] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  
  // Form errors state
  const [errors, setErrors] = useState({});
  
  // Loading state for buttons
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Success messages
  const [successMessage, setSuccessMessage] = useState('');
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  // Reset form when tab changes
  useEffect(() => {
    setErrors({});
    setSuccessMessage('');
  }, [activeTab]);
  
  // Handle login form changes
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginForm({
      ...loginForm,
      [name]: value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Handle register form changes
  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setRegisterForm({
      ...registerForm,
      [name]: type === 'checkbox' ? checked : value
    });
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Simple validation
    let formErrors = {};
    if (!loginForm.email) formErrors.email = 'El. pašto adresas yra privalomas';
    if (!loginForm.password) formErrors.password = 'Slaptažodis yra privalomas';
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    // Start loading
    setIsSubmitting(true);
    
    try {
      // Sign in with Firebase
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
      
      // Success - close modal after a short delay to show success message
      setSuccessMessage('Sėkmingai prisijungta!');
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Login error:', error.code);
      
      // Translate Firebase errors to user-friendly Lithuanian messages
      switch (error.code) {
        case 'auth/invalid-email':
          setErrors({ email: 'Neteisingas el. pašto formatas' });
          break;
        case 'auth/user-not-found':
          setErrors({ email: 'Vartotojas su šiuo el. paštu nerastas' });
          break;
        case 'auth/wrong-password':
          setErrors({ password: 'Neteisingas slaptažodis' });
          break;
        case 'auth/too-many-requests':
          setErrors({ general: 'Per daug bandymų prisijungti. Bandykite vėliau.' });
          break;
        default:
          setErrors({ general: 'Klaida prisijungiant. Bandykite dar kartą.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Register form submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setErrors({});
    
    // Simple validation
    let formErrors = {};
    if (!registerForm.companyName) formErrors.companyName = 'Įmonės pavadinimas yra privalomas';
    if (!registerForm.email) formErrors.email = 'El. pašto adresas yra privalomas';
    if (!registerForm.password) formErrors.password = 'Slaptažodis yra privalomas';
    if (registerForm.password.length < 6) formErrors.password = 'Slaptažodis turi būti bent 6 simbolių ilgio';
    if (registerForm.password !== registerForm.confirmPassword) {
      formErrors.confirmPassword = 'Slaptažodžiai nesutampa';
    }
    if (!registerForm.agreeTerms) {
      formErrors.agreeTerms = 'Turite sutikti su taisyklėmis ir sąlygomis';
    }
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    // Start loading
    setIsSubmitting(true);
    
    try {
      // Register with Firebase
      await createUserWithEmailAndPassword(auth, registerForm.email, registerForm.password);
      
      // Success - close modal after a short delay to show success message
      setSuccessMessage('Registracija sėkminga!');
      setTimeout(() => {
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Registration error:', error.code);
      
      // Translate Firebase errors to user-friendly Lithuanian messages
      switch (error.code) {
        case 'auth/email-already-in-use':
          setErrors({ email: 'Šis el. pašto adresas jau užregistruotas' });
          break;
        case 'auth/invalid-email':
          setErrors({ email: 'Neteisingas el. pašto formatas' });
          break;
        case 'auth/weak-password':
          setErrors({ password: 'Per silpnas slaptažodis, naudokite bent 6 simbolius' });
          break;
        default:
          setErrors({ general: 'Klaida registruojantis. Bandykite dar kartą.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Forgot password handler
  const handleForgotPassword = async () => {
    // Reset errors for this action
    setErrors({
      ...errors,
      email: '',
      general: ''
    });
    
    if (!loginForm.email) {
      setErrors({
        ...errors,
        email: 'Įveskite el. pašto adresą slaptažodžio atkūrimui'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await sendPasswordResetEmail(auth, loginForm.email);
      setSuccessMessage('Slaptažodžio atkūrimo nuoroda išsiųsta el. paštu');
    } catch (error) {
      console.error('Forgot password error:', error.code);
      
      // Translate Firebase errors to user-friendly Lithuanian messages
      switch (error.code) {
        case 'auth/invalid-email':
          setErrors({ email: 'Neteisingas el. pašto formatas' });
          break;
        case 'auth/user-not-found':
          setErrors({ email: 'Vartotojas su šiuo el. paštu nerastas' });
          break;
        default:
          setErrors({ general: 'Klaida siunčiant slaptažodžio atkūrimo nuorodą' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Error display helper component
  const ErrorMessage = ({ name }) => {
    return errors[name] ? (
      <p className="text-red-500 text-xs mt-1">{errors[name]}</p>
    ) : null;
  };
  
  // General error message component
  const GeneralError = () => {
    return errors.general ? (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 text-sm">
        {errors.general}
      </div>
    ) : null;
  };
  
  // Success message component
  const SuccessMessage = () => {
    return successMessage ? (
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4 text-sm">
        {successMessage}
      </div>
    ) : null;
  };
  
  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };
  
  const modalVariants = {
    hidden: { opacity: 0, y: -50, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    exit: { 
      opacity: 0, 
      y: 50, 
      scale: 0.95,
      transition: { duration: 0.2 }
    }
  };
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Modal Overlay */}
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={onClose}
          >
            {/* Modal Content */}
            <motion.div 
              className="bg-white rounded-xl shadow-xl max-w-md w-full mx-auto overflow-hidden"
              variants={modalVariants}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                <h3 className="text-xl font-bold">
                  {activeTab === 'login' ? 'Prisijungti' : 'Registruotis'}
                </h3>
                <button 
                  onClick={onClose}
                  className="text-white hover:text-blue-100 transition-colors"
                  aria-label="Uždaryti"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Tab Navigation */}
              <div className="flex border-b border-gray-200">
                <button
                  className={`flex-1 py-3 font-medium ${activeTab === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                  onClick={() => setActiveTab('login')}
                >
                  Prisijungimas
                </button>
                <button
                  className={`flex-1 py-3 font-medium ${activeTab === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'}`}
                  onClick={() => setActiveTab('register')}
                >
                  Registracija
                </button>
              </div>
              
              {/* Login Form */}
              {activeTab === 'login' && (
                <div className="p-6">
                  <GeneralError />
                  <SuccessMessage />
                  
                  <form onSubmit={handleLoginSubmit}>
                    <div className="mb-4">
                      <label htmlFor="email" className="block font-medium text-gray-700 mb-2">
                        El. paštas
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={loginForm.email}
                        onChange={handleLoginChange}
                        className={`w-full py-2 px-4 rounded-lg bg-gray-50 border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring focus:ring-red-200' : 'border-transparent focus:border-blue-500 focus:ring focus:ring-blue-200'} transition-all text-gray-800`}
                        placeholder="jusu@email.lt"
                        disabled={isSubmitting}
                      />
                      <ErrorMessage name="email" />
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <label htmlFor="password" className="block font-medium text-gray-700">
                          Slaptažodis
                        </label>
                        <button
                          type="button"
                          onClick={handleForgotPassword}
                          className="text-sm text-blue-600 hover:underline"
                          disabled={isSubmitting}
                        >
                          Pamiršote slaptažodį?
                        </button>
                      </div>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={loginForm.password}
                        onChange={handleLoginChange}
                        className={`w-full py-2 px-4 rounded-lg bg-gray-50 border ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring focus:ring-red-200' : 'border-transparent focus:border-blue-500 focus:ring focus:ring-blue-200'} transition-all text-gray-800`}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                      />
                      <ErrorMessage name="password" />
                    </div>
                    
                    <button
                      type="submit"
                      className={`w-full ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm flex justify-center items-center`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Jungiamasi...
                        </>
                      ) : 'Prisijungti'}
                    </button>
                  </form>
                  
                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      Neturite paskyros?{' '}
                      <button
                        onClick={() => setActiveTab('register')}
                        className="text-blue-600 hover:underline font-medium"
                        disabled={isSubmitting}
                      >
                        Registruokitės čia
                      </button>
                    </p>
                  </div>
                </div>
              )}
              
              {/* Register Form */}
              {activeTab === 'register' && (
                <div className="p-6">
                  <GeneralError />
                  <SuccessMessage />
                  
                  <form onSubmit={handleRegisterSubmit}>
                    <div className="mb-4">
                      <label htmlFor="companyName" className="block font-medium text-gray-700 mb-2">
                        Įmonės pavadinimas
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={registerForm.companyName}
                        onChange={handleRegisterChange}
                        className={`w-full py-2 px-4 rounded-lg bg-gray-50 border ${errors.companyName ? 'border-red-500 focus:border-red-500 focus:ring focus:ring-red-200' : 'border-transparent focus:border-blue-500 focus:ring focus:ring-blue-200'} transition-all text-gray-800`}
                        placeholder="UAB Kompanija"
                        disabled={isSubmitting}
                      />
                      <ErrorMessage name="companyName" />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="register-email" className="block font-medium text-gray-700 mb-2">
                        El. paštas
                      </label>
                      <input
                        type="email"
                        id="register-email"
                        name="email"
                        value={registerForm.email}
                        onChange={handleRegisterChange}
                        className={`w-full py-2 px-4 rounded-lg bg-gray-50 border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring focus:ring-red-200' : 'border-transparent focus:border-blue-500 focus:ring focus:ring-blue-200'} transition-all text-gray-800`}
                        placeholder="jusu@email.lt"
                        disabled={isSubmitting}
                      />
                      <ErrorMessage name="email" />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="register-password" className="block font-medium text-gray-700 mb-2">
                        Slaptažodis
                      </label>
                      <input
                        type="password"
                        id="register-password"
                        name="password"
                        value={registerForm.password}
                        onChange={handleRegisterChange}
                        className={`w-full py-2 px-4 rounded-lg bg-gray-50 border ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring focus:ring-red-200' : 'border-transparent focus:border-blue-500 focus:ring focus:ring-blue-200'} transition-all text-gray-800`}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                      />
                      <ErrorMessage name="password" />
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="confirmPassword" className="block font-medium text-gray-700 mb-2">
                        Pakartoti slaptažodį
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={registerForm.confirmPassword}
                        onChange={handleRegisterChange}
                        className={`w-full py-2 px-4 rounded-lg bg-gray-50 border ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring focus:ring-red-200' : 'border-transparent focus:border-blue-500 focus:ring focus:ring-blue-200'} transition-all text-gray-800`}
                        placeholder="••••••••"
                        disabled={isSubmitting}
                      />
                      <ErrorMessage name="confirmPassword" />
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-start">
                        <input
                          type="checkbox"
                          id="agreeTerms"
                          name="agreeTerms"
                          checked={registerForm.agreeTerms}
                          onChange={handleRegisterChange}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={isSubmitting}
                        />
                        <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-700">
                          Sutinku su{' '}
                          <a href="/terms" className="text-blue-600 hover:underline">
                            taisyklėmis ir sąlygomis
                          </a>{' '}
                          bei{' '}
                          <a href="/privacy" className="text-blue-600 hover:underline">
                            privatumo politika
                          </a>
                        </label>
                      </div>
                      <ErrorMessage name="agreeTerms" />
                    </div>
                    
                    <button
                      type="submit"
                      className={`w-full ${isSubmitting ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-sm flex justify-center items-center`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Registruojama...
                        </>
                      ) : 'Registruotis'}
                    </button>
                  </form>
                  
                  <div className="mt-6 text-center">
                    <p className="text-gray-600">
                      Jau turite paskyrą?{' '}
                      <button
                        onClick={() => setActiveTab('login')}
                        className="text-blue-600 hover:underline font-medium"
                        disabled={isSubmitting}
                      >
                        Prisijunkite čia
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModal;
