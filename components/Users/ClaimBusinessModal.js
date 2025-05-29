// components/Vendors/ClaimBusinessModal.js
import React, { useState } from 'react';
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

const ClaimBusinessModal = ({ isOpen, onClose, vendorId, vendorName }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    position: '',
    phone: '',
    email: '',
    verificationMethod: 'document',
    proofDescription: '',
    acceptTerms: false,
  });
  
  const router = useRouter();
  const db = getFirestore();
  const auth = getAuth();
  
  // Check user authentication status
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser?.email) {
        setFormData(prev => ({ ...prev, email: currentUser.email }));
      }
    });
    return () => unsubscribe();
  }, [auth]);
  
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
      if (!formData.fullName || !formData.position || !formData.phone || !formData.email) {
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
      if (formData.verificationMethod === 'document' && !formData.proofDescription) {
        setError('Prašome nurodyti, kokius dokumentus pateiksite');
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
  
  // Submit claim
  const handleSubmitClaim = async () => {
    if (!user) {
      // Save form data to session storage and redirect to login
      sessionStorage.setItem('claimBusinessData', JSON.stringify({
        formData,
        vendorId,
        vendorName,
        redirectPath: router.asPath
      }));
      router.push(`/auth?redirect=${encodeURIComponent(router.asPath)}&action=claim-business`);
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Check if user has already submitted a claim for this business
      const existingClaimsRef = collection(db, "businessClaims");
      const existingClaimDoc = await getDoc(doc(db, "businessClaims", `${user.uid}_${vendorId}`));
      
      if (existingClaimDoc.exists()) {
        setError('Jūs jau esate pateikę prašymą perimti šį verslą');
        setLoading(false);
        return;
      }
      
      // Submit the claim
      await addDoc(collection(db, "businessClaims"), {
        vendorId: vendorId,
        vendorName: vendorName,
        userId: user.uid,
        userEmail: user.email,
        fullName: formData.fullName,
        position: formData.position,
        phone: formData.phone,
        email: formData.email,
        verificationMethod: formData.verificationMethod,
        proofDescription: formData.proofDescription,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setSuccess(true);
      setLoading(false);
    } catch (error) {
      console.error("Error submitting business claim:", error);
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
              <h2 className="text-xl font-semibold text-gray-800">Perimkite savo verslą</h2>
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
                  Jūsų prašymas perimti verslą "{vendorName}" buvo gautas. Mūsų komanda jį peržiūrės ir su jumis susisieks per 1-2 darbo dienas.
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
                  Įveskite savo kontaktinius duomenis, kad galėtume patvirtinti jūsų tapatybę ir susisiekti dėl verslo perėmimo.
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
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="position">
                      Pareigos įmonėje *
                    </label>
                    <input
                      type="text"
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="Pvz.: Direktorius, Savininkas"
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
                </div>
              </div>
            ) : currentStep === 2 ? (
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Verslo patvirtinimas</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Pasirinkite, kaip norite patvirtinti, kad esate {vendorName} verslo atstovas.
                </p>
                
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Patvirtinimo būdas *
                    </label>
                    
                    <div className="mt-2 space-y-2">
                      <label className="flex items-start">
                        <input
                          type="radio"
                          name="verificationMethod"
                          value="document"
                          checked={formData.verificationMethod === 'document'}
                          onChange={handleInputChange}
                          className="mt-1 h-4 w-4 text-amber-500 focus:ring-amber-500"
                        />
                        <div className="ml-3">
                          <span className="block text-sm font-medium text-gray-700">Verslo dokumentai</span>
                          <span className="block text-xs text-gray-500">
                            Pateikite įmonės registracijos dokumentus, direktoriaus tapatybę patvirtinantį dokumentą ar kitą įrodymą.
                          </span>
                        </div>
                      </label>
                      
                      <label className="flex items-start">
                        <input
                          type="radio"
                          name="verificationMethod"
                          value="email"
                          checked={formData.verificationMethod === 'email'}
                          onChange={handleInputChange}
                          className="mt-1 h-4 w-4 text-amber-500 focus:ring-amber-500"
                        />
                        <div className="ml-3">
                          <span className="block text-sm font-medium text-gray-700">Įmonės el. pašto patvirtinimas</span>
                          <span className="block text-xs text-gray-500">
                            Patvirtinkite savo tapatybę naudodami oficialų įmonės el. pašto adresą.
                          </span>
                        </div>
                      </label>
                      
                      <label className="flex items-start">
                        <input
                          type="radio"
                          name="verificationMethod"
                          value="phone"
                          checked={formData.verificationMethod === 'phone'}
                          onChange={handleInputChange}
                          className="mt-1 h-4 w-4 text-amber-500 focus:ring-amber-500"
                        />
                        <div className="ml-3">
                          <span className="block text-sm font-medium text-gray-700">Telefonu</span>
                          <span className="block text-xs text-gray-500">
                            Susisiekime telefonu nurodytais kontaktiniais duomenimis.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                  
                  {formData.verificationMethod === 'document' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="proofDescription">
                        Kokius dokumentus pateiksite? *
                      </label>
                      <textarea
                        id="proofDescription"
                        name="proofDescription"
                        value={formData.proofDescription}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                        placeholder="Pvz.: Įmonės registracijos pažymėjimas, direktoriaus pasas"
                      ></textarea>
                    </div>
                  )}
                  
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
                        patvirtinu, kad esu įgaliotas atstovauti šį verslą.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Patvirtinkite informaciją</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Peržiūrėkite žemiau pateiktą informaciją ir paspauskite "Pateikti" norėdami užbaigti procesą.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-md mt-4">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Verslo informacija</h4>
                  <p className="text-sm text-gray-900">{vendorName}</p>
                  
                  <h4 className="font-semibold text-sm text-gray-700 mt-4 mb-2">Kontaktinė informacija</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Vardas, pavardė:</p>
                      <p className="text-gray-900">{formData.fullName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Pareigos:</p>
                      <p className="text-gray-900">{formData.position}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Telefono numeris:</p>
                      <p className="text-gray-900">{formData.phone}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">El. paštas:</p>
                      <p className="text-gray-900">{formData.email}</p>
                    </div>
                  </div>
                  
                  <h4 className="font-semibold text-sm text-gray-700 mt-4 mb-2">Patvirtinimo būdas</h4>
                  <p className="text-sm text-gray-900">
                    {formData.verificationMethod === 'document' && 'Verslo dokumentai'}
                    {formData.verificationMethod === 'email' && 'Įmonės el. pašto patvirtinimas'}
                    {formData.verificationMethod === 'phone' && 'Patvirtinimas telefonu'}
                  </p>
                  {formData.verificationMethod === 'document' && formData.proofDescription && (
                    <p className="text-sm text-gray-600 mt-1">{formData.proofDescription}</p>
                  )}
                </div>
                
                <div className="text-xs text-gray-500 mt-4">
                  <p>
                    Gavę jūsų užklausą, mes ją peržiūrėsime ir susisieksime su jumis per 1-2 darbo dienas. 
                    Gali būti, kad paprašysime papildomų dokumentų jūsų tapatybei ir ryšiui su verslu patvirtinti.
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
                  onClick={handleSubmitClaim}
                  disabled={loading}
                  className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:bg-amber-300 flex items-center"
                >
                  {loading && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Pateikti
                </button>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ClaimBusinessModal;
