// components/Vendors/ServiceRequestModal.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const ServiceRequestModal = ({ isOpen, onClose, vendorId, vendorName }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('user'); // 'user', 'vendor', 'admin'
  
  // Form data structure tailored for service requests
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    requestTitle: '',
    requestDetails: '',
    preferredContactMethod: 'email',
    urgency: 'normal', // 'low', 'normal', 'high'
    acceptTerms: false,
  });
  
  // Router, DB, Auth setup
  const router = useRouter();
  const db = getFirestore();
  const auth = getAuth();
  
  // Check authentication and get user role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        if (currentUser.email) {
          setFormData(prev => ({ ...prev, email: currentUser.email }));
        }
        
        // Check if user is admin or vendor
        try {
          // Check for admin role
          const adminDoc = await getDoc(doc(db, "admins", currentUser.uid));
          if (adminDoc.exists()) {
            setUserRole('admin');
            return;
          }
          
          // Check if user is vendor owner for this vendor
          const claimQuery = await getDoc(doc(db, "businessClaims", `${currentUser.uid}_${vendorId}`));
          if (claimQuery.exists() && claimQuery.data().status === 'approved') {
            setUserRole('vendor');
            return;
          }
          
          // Default to regular user
          setUserRole('user');
        } catch (error) {
          console.error("Error checking user role:", error);
          setUserRole('user'); // Default to regular user on error
        }
      } else {
        setUser(null);
      }
    });
    
    return () => unsubscribe();
  }, [auth, db, vendorId]);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  // Go to next step
  const handleNextStep = () => {
    // Validation for each step
    if (currentStep === 1) {
      if (!formData.fullName || !formData.phone || !formData.email) {
        setError('Prašome užpildyti visus privalomus laukus');
        return;
      }
      if (!validateEmail(formData.email)) {
        setError('Įveskite teisingą el. pašto adresą');
        return;
      }
      if (!validatePhone(formData.phone)) {
        setError('Įveskite teisingą telefono numerį');
        return;
      }
    } else if (currentStep === 2) {
      if (!formData.requestTitle || !formData.requestDetails) {
        setError('Prašome užpildyti visus privalomus laukus');
        return;
      }
      if (!formData.acceptTerms) {
        setError('Turite sutikti su sąlygomis');
        return;
      }
    }
    
    setError('');
    setCurrentStep(currentStep + 1);
  };
  
  // Go to previous step
  const handlePrevStep = () => {
    setError('');
    setCurrentStep(currentStep - 1);
  };
  
  // Submit service request
  const handleSubmitRequest = async () => {
    if (!user) {
      // Save form data to session storage and redirect to login
      sessionStorage.setItem('serviceRequestData', JSON.stringify({
        formData,
        vendorId,
        vendorName,
        redirectPath: router.asPath
      }));
      router.push(`/auth?redirect=${encodeURIComponent(router.asPath)}&action=service-request`);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Create the service request document
      await addDoc(collection(db, "serviceRequests"), {
        vendorId: vendorId,
        vendorName: vendorName,
        userId: user.uid,
        userEmail: user.email,
        userFullName: formData.fullName,
        userPhone: formData.phone,
        requestTitle: formData.requestTitle,
        requestDetails: formData.requestDetails,
        preferredContactMethod: formData.preferredContactMethod,
        urgency: formData.urgency,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        responseText: null,
        responseDate: null,
        isArchived: false,
        // Set ownerUid if available from vendor data, otherwise leave null
        ownerUid: null, // Will be filled in by a backend function or admin assignment
      });
      
      // Optional: Create a notification document for the vendor
      try {
        await addDoc(collection(db, "notifications"), {
          type: 'service_request',
          title: 'Nauja paslaugų užklausa',
          message: `${formData.fullName} pateikė naują užklausą: "${formData.requestTitle}"`,
          vendorId: vendorId,
          userId: user.uid,
          read: false,
          createdAt: serverTimestamp()
        });
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
        // Continue even if notification fails
      }
      
      setSuccess(true);
      setLoading(false);
    } catch (error) {
      console.error("Error submitting service request:", error);
      setError('Įvyko klaida. Bandykite dar kartą vėliau.');
      setLoading(false);
    }
  };
  
  // Validation helpers
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  };
  
  const validatePhone = (phone) => {
    // Basic Lithuanian phone validation (allows +370 format or 8 format)
    const re = /^(\+370|8)([0-9]{8}|[0-9]{7})$/;
    return re.test(String(phone).replace(/\s/g, ''));
  };
  
  // Modal variants for animations
  const modalVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 }
  };
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  // Block access if user is the vendor owner (they can't send requests to themselves)
  if (userRole === 'vendor' && user?.uid === vendorId) {
    return (
      <AnimatePresence>
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <motion.div 
            className="bg-white rounded-lg max-w-md w-full"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: 'spring', damping: 25, stiffness: 500 }}
          >
            <div className="bg-amber-100 p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800">Paslaugos užklausa</h2>
                <button 
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-800"
                  aria-label="Uždaryti"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 text-center">
              <div className="mb-4 text-amber-600">
                <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Negalite siųsti užklausų savo verslui</h3>
              <p className="text-gray-600 mt-2">Jūs jau esate šio verslo valdytojas.</p>
              <button 
                className="mt-6 px-5 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
                onClick={onClose}
              >
                Uždaryti
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    );
  }
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div 
          className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ type: 'spring', damping: 25, stiffness: 500 }}
        >
          {/* Header */}
          <div className="bg-amber-100 p-6 rounded-t-lg">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Paslaugų užklausa</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-800"
                aria-label="Uždaryti"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {!success && (
              <div className="flex items-center mt-4">
                {[1, 2, 3].map((step) => (
                  <React.Fragment key={step}>
                    <div 
                      className={`rounded-full h-8 w-8 flex items-center justify-center ${
                        currentStep >= step 
                          ? 'bg-amber-500 text-white' 
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step}
                    </div>
                    {step < 3 && (
                      <div 
                        className={`h-1 w-12 ${
                          currentStep > step ? 'bg-amber-500' : 'bg-gray-200'
                        }`}
                      ></div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
          
          {/* Content */}
          <div className="p-6">
            {error && (
              <div className="mb-4 bg-red-50 text-red-700 p-3 rounded-md border border-red-200">
                {error}
              </div>
            )}
            
            {success ? (
              <div className="text-center py-6">
                <div className="bg-green-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Užklausa išsiųsta!</h3>
                <p className="text-gray-600">
                  Jūsų paslaugos užklausa įmonei "{vendorName}" buvo sėkmingai išsiųsta. Įmonės atstovai su jumis susisieks artimiausiu metu.
                </p>
                <button
                  className="mt-6 px-5 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 transition-colors"
                  onClick={onClose}
                >
                  Uždaryti
                </button>
              </div>
            ) : currentStep === 1 ? (
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Kontaktinė informacija</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Pateikite savo kontaktinius duomenis, kad paslaugos teikėjas galėtų su jumis susisiekti.
                </p>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="fullName">
                      Vardas ir pavardė *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">
                      Telefono numeris *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+370"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                      El. pašto adresas *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pageidaujamas kontaktavimo būdas *
                    </label>
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="preferredContactMethod"
                          value="email"
                          checked={formData.preferredContactMethod === 'email'}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">El. paštu</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="preferredContactMethod"
                          value="phone"
                          checked={formData.preferredContactMethod === 'phone'}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Telefonu</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ) : currentStep === 2 ? (
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Užklausos informacija</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Pateikite informaciją apie paslaugą, kurią norėtumėte gauti iš {vendorName}.
                </p>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="requestTitle">
                      Užklausos tema *
                    </label>
                    <input
                      type="text"
                      id="requestTitle"
                      name="requestTitle"
                      value={formData.requestTitle}
                      onChange={handleInputChange}
                      placeholder="Pvz.: Konsultacija dėl buhalterijos paslaugų"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="requestDetails">
                      Išsami užklausos informacija *
                    </label>
                    <textarea
                      id="requestDetails"
                      name="requestDetails"
                      value={formData.requestDetails}
                      onChange={handleInputChange}
                      rows="5"
                      placeholder="Aprašykite kokios paslaugos pageidaujate, kokį projektą norite įgyvendinti, ar turite specialių reikalavimų..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      required
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="urgency">
                      Užklausos skubumas
                    </label>
                    <select
                      id="urgency"
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    >
                      <option value="low">Neskubu (atsakyti per 5 d.d.)</option>
                      <option value="normal">Vidutinis (atsakyti per 2-3 d.d.)</option>
                      <option value="high">Skubu (atsakyti per 1 d.d.)</option>
                    </select>
                  </div>
                  
                  <div className="mt-4">
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        name="acceptTerms"
                        checked={formData.acceptTerms}
                        onChange={handleInputChange}
                        className="mt-1 h-4 w-4 text-amber-500 focus:ring-amber-500"
                        required
                      />
                      <span className="ml-3 text-sm text-gray-600">
                        Sutinku su <a href="/terms" target="_blank" className="text-amber-600 hover:underline">paslaugų teikimo sąlygomis</a> ir 
                        sutinku, kad mano pateikti duomenys būtų naudojami susisiekimo tikslais.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Patvirtinkite užklausą</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Peržiūrėkite žemiau pateiktą informaciją ir paspauskite "Siųsti užklausą" norėdami užbaigti procesą.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-md mt-4">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Užklausos informacija</h4>
                  <p className="text-sm text-gray-900 font-medium">{formData.requestTitle}</p>
                  <p className="text-sm text-gray-700 mt-1">{formData.requestDetails}</p>
                  
                  <h4 className="font-semibold text-sm text-gray-700 mt-4 mb-2">Kontaktinė informacija</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Vardas, pavardė:</p>
                      <p className="text-gray-900">{formData.fullName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">El. paštas:</p>
                      <p className="text-gray-900">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Telefono numeris:</p>
                      <p className="text-gray-900">{formData.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pageidaujamas kontaktavimo būdas:</p>
                      <p className="text-gray-900">
                        {formData.preferredContactMethod === 'email' ? 'El. paštu' : 'Telefonu'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Skubumas:</p>
                      <p className="text-gray-900">
                        {formData.urgency === 'low' && 'Neskubu'}
                        {formData.urgency === 'normal' && 'Vidutinis'}
                        {formData.urgency === 'high' && 'Skubu'}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-xs text-gray-500 mt-4">
                  <p>
                    Išsiuntus užklausą, {vendorName} atstovai gaus pranešimą ir su jumis susisieks jūsų nurodytu būdu.
                    Atsakymo laikas priklauso nuo užklausos tipo ir pasirinkto skubumo lygio.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer */}
          {!success && (
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  Atgal
                </button>
              ) : (
                <div></div>
              )}
              
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600"
                >
                  Tęsti
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitRequest}
                  disabled={loading}
                  className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:bg-amber-300 flex items-center"
                >
                  {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Siųsti užklausą
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ServiceRequestModal;