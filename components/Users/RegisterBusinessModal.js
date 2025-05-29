// components/BusinessRegistration/RegisterBusinessModal.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp, arrayUnion } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const RegisterBusinessModal = ({ isOpen, onClose }) => {
  // State for active step
  const [activeStep, setActiveStep] = useState(1);
  const totalSteps = 5;
  
  // State for form data
  const [formData, setFormData] = useState({
    id: '', // Will be slugified from name
    name: '',
    city: '',
    services: [],
    price: '',
    website: '',
    logo: null, // File object
    logoPreview: '', // URL for preview
    description: '',
    email: '',
    phone: '',
    businessHours: {
      monday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
      tuesday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
      wednesday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
      thursday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
      friday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
      saturday: { isClosed: true, open: "00:00", close: "00:00", isOpen24Hours: false },
      sunday: { isClosed: true, open: "00:00", close: "00:00", isOpen24Hours: false },
    },
    team: []
  });
  
  // State for team member being edited
  const [teamMember, setTeamMember] = useState({
    id: '', // Will be generated from name
    name: '',
    position: '',
    photoUrl: '',
    photoFile: null, // File object
    photoPreview: '', // URL for preview
    bio: '',
    email: '',
    phone: '',
    featured: false,
    order: 0,
    socialMedia: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: '',
      github: ''
    },
    qualifications: [],
    languages: []
  });
  
  // State for temporary inputs
  const [tempQualification, setTempQualification] = useState('');
  const [tempLanguage, setTempLanguage] = useState('');
  const [tempService, setTempService] = useState('');
  
  // State for form submission
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  // Available service options
  const serviceOptions = [
    'Registracijos adresas',
    'Virtualus biuras',
    'Dokumentų saugojimas',
    'Buhalterija',
    'Juridinės paslaugos',
    'Verslo konsultacijos',
    'IT paslaugos',
    'Rinkodaros paslaugos',
    'Personalo valdymas',
    'Kita'
  ];
  
  // Function to slugify text for IDs
  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(/[^\w\-]+/g, '') // Remove all non-word chars
      .replace(/\-\-+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, ''); // Trim - from end of text
  };
  
  // Update ID when name changes
  useEffect(() => {
    if (formData.name) {
      setFormData(prev => ({ ...prev, id: slugify(formData.name) }));
    }
  }, [formData.name]);
  
  // Update team member ID when name changes
  useEffect(() => {
    if (teamMember.name) {
      setTeamMember(prev => ({ ...prev, id: slugify(prev.name) }));
    }
  }, [teamMember.name]);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else if (type === 'checkbox') {
      // Handle checkboxes
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      // Handle regular inputs
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Handle business hours changes
  const handleHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      businessHours: {
        ...prev.businessHours,
        [day]: {
          ...prev.businessHours[day],
          [field]: field === 'isClosed' || field === 'isOpen24Hours' ? value : value
        }
      }
    }));
  };
  
  // Handle service selection
  const handleServiceChange = (service, checked) => {
    if (checked) {
      // Add service
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, service]
      }));
    } else {
      // Remove service
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter(s => s !== service)
      }));
    }
  };
  
  // Add custom service
  const handleAddService = () => {
    if (tempService && !formData.services.includes(tempService)) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, tempService]
      }));
      setTempService('');
    }
  };
  
  // Handle team member field changes
  const handleTeamMemberChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested properties
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setTeamMember(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (type === 'checkbox') {
      // Handle checkboxes
      setTeamMember(prev => ({ ...prev, [name]: checked }));
    } else {
      // Handle regular inputs
      setTeamMember(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // Add qualification
  const handleAddQualification = () => {
    if (tempQualification && !teamMember.qualifications.includes(tempQualification)) {
      setTeamMember(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, tempQualification]
      }));
      setTempQualification('');
    }
  };
  
  // Remove qualification
  const handleRemoveQualification = (qualification) => {
    setTeamMember(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter(q => q !== qualification)
    }));
  };
  
  // Add language
  const handleAddLanguage = () => {
    if (tempLanguage && !teamMember.languages.includes(tempLanguage)) {
      setTeamMember(prev => ({
        ...prev,
        languages: [...prev.languages, tempLanguage]
      }));
      setTempLanguage('');
    }
  };
  
  // Remove language
  const handleRemoveLanguage = (language) => {
    setTeamMember(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };
  
// Fix for the handleAddTeamMember function
const handleAddTeamMember = () => {
  // Validate required fields
  if (!teamMember.name || !teamMember.position) {
    setError('Vardas ir pareigos yra privalomi');
    return;
  }
  
  // Add to team array with proper order value
  setFormData(prev => ({
    ...prev,
    team: [...prev.team, { 
      ...teamMember,
      order: formData.team.length + 1, // Fixed: Using formData.team.length instead of prev.team.length
    }]
  }));
  
  // Reset team member form
  setTeamMember({
    id: '',
    name: '',
    position: '',
    photoUrl: '',
    photoFile: null,
    photoPreview: '',
    bio: '',
    email: '',
    phone: '',
    featured: false,
    order: formData.team.length + 1, // Fixed: Using formData.team.length + 1
    socialMedia: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: '',
      github: ''
    },
    qualifications: [],
    languages: []
  });
  
  setError('');
};
  
  // Remove team member
  const handleRemoveTeamMember = (memberId) => {
    setFormData(prev => ({
      ...prev,
      team: prev.team.filter(member => member.id !== memberId)
    }));
  };
  
  // Handle logo file selection
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        logo: file,
        logoPreview: URL.createObjectURL(file)
      }));
    }
  };
  
  // Handle team member photo selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTeamMember(prev => ({
        ...prev,
        photoFile: file,
        photoPreview: URL.createObjectURL(file)
      }));
    }
  };
  
  // Navigate to next step
  const handleNext = () => {
    // Validate current step
    if (activeStep === 1) {
      if (!formData.name || !formData.city) {
        setError('Įmonės pavadinimas ir miestas yra privalomi');
        return;
      }
    } else if (activeStep === 2) {
      if (!formData.email || !formData.phone) {
        setError('El. paštas ir telefono numeris yra privalomi');
        return;
      }
    } else if (activeStep === 3) {
      if (formData.services.length === 0) {
        setError('Pasirinkite bent vieną paslaugą');
        return;
      }
    }
    
    // Clear error and go to next step
    setError('');
    setActiveStep(prev => Math.min(prev + 1, totalSteps));
  };
  
  // Navigate to previous step
  const handlePrevious = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
    setError('');
  };
  
  const handleSubmit = async () => {
  try {
    setSubmitting(true);
    setError('');
    
    // Get current user
    const user = auth.currentUser;
    if (!user) {
      setError('Turite būti prisijungę, kad galėtumėte registruoti verslą');
      setSubmitting(false);
      return;
    }
    
    // Upload logo if provided
    let logoUrl = '';
    if (formData.logo) {
      const logoRef = ref(storage, `business-logos/${formData.id}/${formData.logo.name}`);
      await uploadBytes(logoRef, formData.logo);
      logoUrl = await getDownloadURL(logoRef);
    }
    
    // Upload team photos and prepare team data
    const teamWithPhotos = [];
    for (const member of formData.team) {
      let photoUrl = member.photoUrl;
      
      if (member.photoFile) {
        const photoRef = ref(storage, `team-photos/${formData.id}/${member.id}/${member.photoFile.name}`);
        await uploadBytes(photoRef, member.photoFile);
        photoUrl = await getDownloadURL(photoRef);
      }
      
      // Remove photoFile from data to be stored
      const { photoFile, photoPreview, ...memberData } = member;
      teamWithPhotos.push({
        ...memberData,
        photoUrl
      });
    }
    
    // Get today's date in the format "28 May 2025 at 16:29:35 UTC+1"
    const now = new Date();
    const processedAt = now.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZoneName: 'short'
    });
    
    // Prepare vendor data
    const vendorData = {
      vendorId: formData.id,
      id: formData.id,
      name: formData.name,
      city: formData.city,
      services: formData.services,
      price: formData.price || "nuo €29/mėn",
      website: formData.website || "",
      logo: logoUrl,
      description: formData.description || "",
      email: formData.email,
      phone: formData.phone,
      userId: user.uid,
      processedAt: processedAt,
      processedBy: user.uid,
      businessHours: formData.businessHours,
      team: teamWithPhotos,
      googleReview: {
        rating: 0,
        reviewCount: 0,
        reviews: []
      },
      verificationLevel: "none",
      verificationStatus: {
        email: { verified: false, verifiedAt: null },
        phone: { verified: false, verifiedAt: null },
        address: { verified: false, verifiedAt: null },
        documents: { verified: false, verifiedAt: null },
        physicalAudit: { verified: false, verifiedAt: null, auditor: null }
      },
      verificationDocuments: [],
      complianceBadges: [],
      trustMetrics: {
        overallScore: 0,
        responseRate: 0,
        responseTime: 0,
        profileCompleteness: 0,
        verificationLevel: 0,
        yearsInBusiness: 0,
        reviewScore: 0,
        reviewCount: 0,
        disputeResolutionRate: 0,
        lastUpdated: null
      },
      currentStatus: {
        isOpen: true,
        reopensAt: null,
        closesAt: null,
        specialHours: false
      }
    };
    
    // Create vendor document in Firestore
    await setDoc(doc(db, "vendors", formData.id), vendorData);
    
    // Check if user document exists, and create it if not
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      // If user document exists, update it with the vendor role
      await updateDoc(userRef, {
        role: arrayUnion("vendor"),
        vendorId: formData.id
      });
    } else {
      // If user document doesn't exist, create it
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        role: ["user", "vendor"],
        vendorId: formData.id,
        createdAt: serverTimestamp()
      });
    }
    
    // Show success message
    setSuccess(true);
    
    // Close modal after 3 seconds
    setTimeout(() => {
      onClose();
      // Reset form data
      setFormData({
        id: '',
        name: '',
        city: '',
        services: [],
        price: '',
        website: '',
        logo: null,
        logoPreview: '',
        description: '',
        email: '',
        phone: '',
        businessHours: {
          monday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
          tuesday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
          wednesday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
          thursday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
          friday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
          saturday: { isClosed: true, open: "00:00", close: "00:00", isOpen24Hours: false },
          sunday: { isClosed: true, open: "00:00", close: "00:00", isOpen24Hours: false },
        },
        team: []
      });
      setActiveStep(1);
      setSuccess(false);
    }, 3000);
  } catch (err) {
    console.error('Error registering business:', err);
    setError(`Klaida registruojant verslą: ${err.message}`);
  } finally {
    setSubmitting(false);
  }
};
  
  // Render step indicator
  const StepIndicator = () => {
    return (
      <div className="flex items-center mb-8">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <React.Fragment key={index}>
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeStep > index + 1
                  ? 'bg-green-500 text-white'
                  : activeStep === index + 1
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}
            >
              {activeStep > index + 1 ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            {index < totalSteps - 1 && (
              <div 
                className={`h-1 w-12 ${
                  activeStep > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
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
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            onClick={onClose}
          >
            {/* Modal Content */}
            <motion.div 
              className="bg-white rounded-xl shadow-xl w-full max-w-4xl mx-auto overflow-hidden"
              variants={modalVariants}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  Registruoti verslą
                </h2>
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
              
              {/* Step Indicator */}
              <div className="px-6 pt-6">
                <StepIndicator />
              </div>
              
              {/* Form Content */}
              <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                {/* Success Message */}
                {success && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-800">
                          Verslas sėkmingai užregistruotas! Jūsų informacija bus patikrinta administratorių.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Error Message */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-800">
                          {error}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 1: Basic Information */}
                {activeStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Pagrindinė informacija</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Pavadinimas *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Verslo Vartai"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="id" className="block text-sm font-medium text-gray-700 mb-1">
                          ID (generuojamas automatiškai)
                        </label>
                        <input
                          type="text"
                          id="id"
                          name="id"
                          value={formData.id}
                          className="bg-gray-100 shadow-sm block w-full sm:text-sm border-gray-300 rounded-md"
                          readOnly
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Miestas *
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Kaunas"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Aprašymas
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="3"
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="Trumpas verslo aprašymas..."
                      ></textarea>
                    </div>
                    
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                        Kaina (formatas: "nuo €XX/mėn")
                      </label>
                      <input
                        type="text"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="nuo €29/mėn"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Logotipas
                      </label>
                      <div className="flex items-center space-x-6">
                        <div className="flex-shrink-0">
                          {formData.logoPreview ? (
                            <img
                              src={formData.logoPreview}
                              alt="Logo preview"
                              className="h-24 w-24 object-contain bg-gray-100 rounded-md"
                            />
                          ) : (
                            <div className="h-24 w-24 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center">
                              <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="logo-upload" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                            Įkelti logotipą
                          </label>
                          <input 
                            id="logo-upload" 
                            name="logo" 
                            type="file" 
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 2: Contact Information */}
                {activeStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Kontaktinė informacija</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          El. paštas *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="kontaktai@verslovartai.lt"
                          required
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Telefono numeris *
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="+370 37 777777"
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                        Interneto svetainė
                      </label>
                      <input
                        type="url"
                        id="website"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        placeholder="https://verslovartai.lt"
                      />
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">Darbo valandos</h4>
                      
                      <div className="space-y-4">
                        {/* Monday */}
                        <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 pb-4">
                          <div className="w-full sm:w-1/5 font-medium mb-2 sm:mb-0">
                            <span>Pirmadienis</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.businessHours.monday.isClosed}
                                onChange={(e) => handleHoursChange('monday', 'isClosed', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">Uždaryta</span>
                            </label>
                            
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.businessHours.monday.isOpen24Hours}
                                onChange={(e) => handleHoursChange('monday', 'isOpen24Hours', e.target.checked)}
                                disabled={formData.businessHours.monday.isClosed}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">24 valandas</span>
                            </label>
                            
                            {!formData.businessHours.monday.isClosed && !formData.businessHours.monday.isOpen24Hours && (
                              <div className="flex space-x-2 items-center">
                                <input
                                  type="time"
                                  value={formData.businessHours.monday.open}
                                  onChange={(e) => handleHoursChange('monday', 'open', e.target.value)}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                                />
                                <span>-</span>
                                <input
                                  type="time"
                                  value={formData.businessHours.monday.close}
                                  onChange={(e) => handleHoursChange('monday', 'close', e.target.value)}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Tuesday */}
                        <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 pb-4">
                          <div className="w-full sm:w-1/5 font-medium mb-2 sm:mb-0">
                            <span>Antradienis</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.businessHours.tuesday.isClosed}
                                onChange={(e) => handleHoursChange('tuesday', 'isClosed', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">Uždaryta</span>
                            </label>
                            
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.businessHours.tuesday.isOpen24Hours}
                                onChange={(e) => handleHoursChange('tuesday', 'isOpen24Hours', e.target.checked)}
                                disabled={formData.businessHours.tuesday.isClosed}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">24 valandas</span>
                            </label>
                            
                            {!formData.businessHours.tuesday.isClosed && !formData.businessHours.tuesday.isOpen24Hours && (
                              <div className="flex space-x-2 items-center">
                                <input
                                  type="time"
                                  value={formData.businessHours.tuesday.open}
                                  onChange={(e) => handleHoursChange('tuesday', 'open', e.target.value)}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                                />
                                <span>-</span>
                                <input
                                  type="time"
                                  value={formData.businessHours.tuesday.close}
                                  onChange={(e) => handleHoursChange('tuesday', 'close', e.target.value)}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Wednesday */}
                        <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 pb-4">
                          <div className="w-full sm:w-1/5 font-medium mb-2 sm:mb-0">
                            <span>Trečiadienis</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.businessHours.wednesday.isClosed}
                                onChange={(e) => handleHoursChange('wednesday', 'isClosed', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">Uždaryta</span>
                            </label>
                            
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.businessHours.wednesday.isOpen24Hours}
                                onChange={(e) => handleHoursChange('wednesday', 'isOpen24Hours', e.target.checked)}
                                disabled={formData.businessHours.wednesday.isClosed}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">24 valandas</span>
                            </label>
                            
                            {!formData.businessHours.wednesday.isClosed && !formData.businessHours.wednesday.isOpen24Hours && (
                              <div className="flex space-x-2 items-center">
                                <input
                                  type="time"
                                  value={formData.businessHours.wednesday.open}
                                  onChange={(e) => handleHoursChange('wednesday', 'open', e.target.value)}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                                />
                                <span>-</span>
                                <input
                                  type="time"
                                  value={formData.businessHours.wednesday.close}
                                  onChange={(e) => handleHoursChange('wednesday', 'close', e.target.value)}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Thursday */}
                        <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 pb-4">
                          <div className="w-full sm:w-1/5 font-medium mb-2 sm:mb-0">
                            <span>Ketvirtadienis</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.businessHours.thursday.isClosed}
                                onChange={(e) => handleHoursChange('thursday', 'isClosed', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">Uždaryta</span>
                            </label>
                            
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.businessHours.thursday.isOpen24Hours}
                                onChange={(e) => handleHoursChange('thursday', 'isOpen24Hours', e.target.checked)}
                                disabled={formData.businessHours.thursday.isClosed}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">24 valandas</span>
                            </label>
                            
                            {!formData.businessHours.thursday.isClosed && !formData.businessHours.thursday.isOpen24Hours && (
                              <div className="flex space-x-2 items-center">
                                <input
                                  type="time"
                                  value={formData.businessHours.thursday.open}
                                  onChange={(e) => handleHoursChange('thursday', 'open', e.target.value)}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                                />
                                <span>-</span>
                                <input
                                  type="time"
                                  value={formData.businessHours.thursday.close}
                                  onChange={(e) => handleHoursChange('thursday', 'close', e.target.value)}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Friday */}
                        <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 pb-4">
                          <div className="w-full sm:w-1/5 font-medium mb-2 sm:mb-0">
                            <span>Penktadienis</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.businessHours.friday.isClosed}
                                onChange={(e) => handleHoursChange('friday', 'isClosed', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">Uždaryta</span>
                            </label>
                            
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.businessHours.friday.isOpen24Hours}
                                onChange={(e) => handleHoursChange('friday', 'isOpen24Hours', e.target.checked)}
                                disabled={formData.businessHours.friday.isClosed}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">24 valandas</span>
                            </label>
                            
                            {!formData.businessHours.friday.isClosed && !formData.businessHours.friday.isOpen24Hours && (
                              <div className="flex space-x-2 items-center">
                                <input
                                  type="time"
                                  value={formData.businessHours.friday.open}
                                  onChange={(e) => handleHoursChange('friday', 'open', e.target.value)}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                                />
                                <span>-</span>
                                <input
                                  type="time"
                                  value={formData.businessHours.friday.close}
                                  onChange={(e) => handleHoursChange('friday', 'close', e.target.value)}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Saturday */}
                        <div className="flex flex-col sm:flex-row sm:items-center border-b border-gray-200 pb-4">
                          <div className="w-full sm:w-1/5 font-medium mb-2 sm:mb-0">
                            <span>Šeštadienis</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.businessHours.saturday.isClosed}
                                onChange={(e) => handleHoursChange('saturday', 'isClosed', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">Uždaryta</span>
                            </label>
                            
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.businessHours.saturday.isOpen24Hours}
                                onChange={(e) => handleHoursChange('saturday', 'isOpen24Hours', e.target.checked)}
                                disabled={formData.businessHours.saturday.isClosed}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">24 valandas</span>
                            </label>
                            
                            {!formData.businessHours.saturday.isClosed && !formData.businessHours.saturday.isOpen24Hours && (
                              <div className="flex space-x-2 items-center">
                                <input
                                  type="time"
                                  value={formData.businessHours.saturday.open}
                                  onChange={(e) => handleHoursChange('saturday', 'open', e.target.value)}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                                />
                                <span>-</span>
                                <input
                                  type="time"
                                  value={formData.businessHours.saturday.close}
                                  onChange={(e) => handleHoursChange('saturday', 'close', e.target.value)}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Sunday */}
                        <div className="flex flex-col sm:flex-row sm:items-center">
                          <div className="w-full sm:w-1/5 font-medium mb-2 sm:mb-0">
                            <span>Sekmadienis</span>
                          </div>
                          <div className="flex items-center space-x-4">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.businessHours.sunday.isClosed}
                                onChange={(e) => handleHoursChange('sunday', 'isClosed', e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">Uždaryta</span>
                            </label>
                            
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={formData.businessHours.sunday.isOpen24Hours}
                                onChange={(e) => handleHoursChange('sunday', 'isOpen24Hours', e.target.checked)}
                                disabled={formData.businessHours.sunday.isClosed}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-700">24 valandas</span>
                            </label>
                            
                            {!formData.businessHours.sunday.isClosed && !formData.businessHours.sunday.isOpen24Hours && (
                              <div className="flex space-x-2 items-center">
                                <input
                                  type="time"
                                  value={formData.businessHours.sunday.open}
                                  onChange={(e) => handleHoursChange('sunday', 'open', e.target.value)}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                                />
                                <span>-</span>
                                <input
                                  type="time"
                                  value={formData.businessHours.sunday.close}
                                  onChange={(e) => handleHoursChange('sunday', 'close', e.target.value)}
                                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-24 sm:text-sm border-gray-300 rounded-md"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 3: Services */}
                {activeStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Paslaugos</h3>
                    
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-gray-700 mb-3">Pasirinkite teikiamas paslaugas *</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2">
                        {serviceOptions.map((service, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              id={`service-${index}`}
                              type="checkbox"
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              checked={formData.services.includes(service)}
                              onChange={(e) => handleServiceChange(service, e.target.checked)}
                            />
                            <label htmlFor={`service-${index}`} className="ml-2 text-sm text-gray-700">
                              {service}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-3">Pridėti kitą paslaugą</h4>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={tempService}
                          onChange={(e) => setTempService(e.target.value)}
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Įveskite paslaugos pavadinimą"
                        />
                        <button
                          type="button"
                          onClick={handleAddService}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Pridėti
                        </button>
                      </div>
                    </div>
                    
                    {formData.services.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-3">Pasirinktos paslaugos</h4>
                        <div className="flex flex-wrap gap-2">
                          {formData.services.map((service, index) => (
                            <span key={index} className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                              {service}
                              <button
                                type="button"
                                onClick={() => handleServiceChange(service, false)}
                                className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:text-blue-600 focus:outline-none focus:text-blue-600"
                              >
                                <span className="sr-only">Pašalinti</span>
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Step 4: Team Members */}
                {activeStep === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Komandos nariai</h3>
                    
                    {/* Add team member form */}
                    <div className="bg-gray-50 p-4 rounded-md">
                      <h4 className="font-medium text-gray-700 mb-3">Pridėti komandos narį</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="team-name" className="block text-sm font-medium text-gray-700 mb-1">
                            Vardas Pavardė *
                          </label>
                          <input
                            type="text"
                            id="team-name"
                            name="name"
                            value={teamMember.name}
                            onChange={handleTeamMemberChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Vardas Pavardė"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="team-position" className="block text-sm font-medium text-gray-700 mb-1">
                            Pareigos *
                          </label>
                          <input
                            type="text"
                            id="team-position"
                            name="position"
                            value={teamMember.position}
                            onChange={handleTeamMemberChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Direktorius"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="team-email" className="block text-sm font-medium text-gray-700 mb-1">
                            El. paštas
                          </label>
                          <input
                            type="email"
                            id="team-email"
                            name="email"
                            value={teamMember.email}
                            onChange={handleTeamMemberChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="vardas@imone.lt"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="team-phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Telefono numeris
                          </label>
                          <input
                            type="tel"
                            id="team-phone"
                            name="phone"
                            value={teamMember.phone}
                            onChange={handleTeamMemberChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="+370 600 12345"
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="team-bio" className="block text-sm font-medium text-gray-700 mb-1">
                          Biografija
                        </label>
                        <textarea
                          id="team-bio"
                          name="bio"
                          value={teamMember.bio}
                          onChange={handleTeamMemberChange}
                          rows="3"
                          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                          placeholder="Trumpa biografija..."
                        ></textarea>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nuotrauka
                        </label>
                        <div className="flex items-center space-x-6">
                          <div className="flex-shrink-0">
                            {teamMember.photoPreview ? (
                              <img
                                src={teamMember.photoPreview}
                                alt="Team member preview"
                                className="h-20 w-20 object-cover rounded-full"
                              />
                            ) : (
                              <div className="h-20 w-20 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center">
                                <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          <div>
                            <label htmlFor="photo-upload" className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                              Įkelti nuotrauką
                            </label>
                            <input 
                              id="photo-upload" 
                              name="photo" 
                              type="file" 
                              accept="image/*"
                              onChange={handlePhotoChange}
                              className="hidden" 
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="team-linkedin" className="block text-sm font-medium text-gray-700 mb-1">
                            LinkedIn
                          </label>
                          <input
                            type="url"
                            id="team-linkedin"
                            name="socialMedia.linkedin"
                            value={teamMember.socialMedia.linkedin}
                           onChange={handleTeamMemberChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="https://linkedin.com/in/username"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="team-twitter" className="block text-sm font-medium text-gray-700 mb-1">
                            Twitter
                          </label>
                          <input
                            type="url"
                            id="team-twitter"
                            name="socialMedia.twitter"
                            value={teamMember.socialMedia.twitter}
                            onChange={handleTeamMemberChange}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="https://twitter.com/username"
                          />
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            name="featured"
                            checked={teamMember.featured}
                            onChange={handleTeamMemberChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Išskirti kaip pagrindinį komandos narį
                          </span>
                        </label>
                      </div>
                      
                      {/* Qualifications */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kvalifikacijos
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={tempQualification}
                            onChange={(e) => setTempQualification(e.target.value)}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Verslo administravimo magistras"
                          />
                          <button
                            type="button"
                            onClick={handleAddQualification}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Pridėti
                          </button>
                        </div>
                        
                        {teamMember.qualifications.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {teamMember.qualifications.map((qualification, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {qualification}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQualification(qualification)}
                                  className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:text-blue-600 focus:outline-none focus:text-blue-600"
                                >
                                  <span className="sr-only">Pašalinti</span>
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      {/* Languages */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Kalbos
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={tempLanguage}
                            onChange={(e) => setTempLanguage(e.target.value)}
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Lietuvių"
                          />
                          <button
                            type="button"
                            onClick={handleAddLanguage}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            Pridėti
                          </button>
                        </div>
                        
                        {teamMember.languages.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {teamMember.languages.map((language, index) => (
                              <span key={index} className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                {language}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveLanguage(language)}
                                  className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:text-blue-600 focus:outline-none focus:text-blue-600"
                                >
                                  <span className="sr-only">Pašalinti</span>
                                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <button
                          type="button"
                          onClick={handleAddTeamMember}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Pridėti komandos narį
                        </button>
                      </div>
                    </div>
                    
                    {/* Team members list */}
                    {formData.team.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-3">Komandos nariai</h4>
                        
                        <div className="space-y-4">
                          {formData.team.map((member, index) => (
                            <div key={index} className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                  {member.photoPreview || member.photoUrl ? (
                                    <img
                                      src={member.photoPreview || member.photoUrl}
                                      alt={member.name}
                                      className="h-12 w-12 rounded-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                      <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                      </svg>
                                    </div>
                                  )}
                                  <div>
                                    <h5 className="text-lg font-medium text-gray-900">{member.name}</h5>
                                    <p className="text-sm text-gray-500">{member.position}</p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveTeamMember(member.id)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  Pašalinti
                                </button>
                              </div>
                              
                              <div className="border-t border-gray-200">
                                <dl>
                                  <div className="bg-gray-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                    <dt className="text-sm font-medium text-gray-500">Kontaktinė informacija</dt>
                                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                      <div>{member.email}</div>
                                      <div>{member.phone}</div>
                                    </dd>
                                  </div>
                                  
                                  {member.bio && (
                                    <div className="bg-white px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                      <dt className="text-sm font-medium text-gray-500">Biografija</dt>
                                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {member.bio}
                                      </dd>
                                    </div>
                                  )}
                                  
                                  {member.qualifications.length > 0 && (
                                    <div className="bg-gray-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                      <dt className="text-sm font-medium text-gray-500">Kvalifikacijos</dt>
                                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        <ul className="list-disc pl-5">
                                          {member.qualifications.map((qual, idx) => (
                                            <li key={idx}>{qual}</li>
                                          ))}
                                        </ul>
                                      </dd>
                                    </div>
                                  )}
                                  
                                  {member.languages.length > 0 && (
                                    <div className="bg-white px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                      <dt className="text-sm font-medium text-gray-500">Kalbos</dt>
                                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {member.languages.join(', ')}
                                      </dd>
                                    </div>
                                  )}
                                  
                                  {(member.socialMedia?.linkedin || member.socialMedia?.twitter) && (
                                    <div className="bg-gray-50 px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                      <dt className="text-sm font-medium text-gray-500">Socialiniai tinklai</dt>
                                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                        {member.socialMedia.linkedin && (
                                          <div className="flex items-center space-x-2">
                                            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                              <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z" clipRule="evenodd" />
                                            </svg>
                                            <a href={member.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                              LinkedIn
                                            </a>
                                          </div>
                                        )}
                                        
                                        {member.socialMedia.twitter && (
                                          <div className="flex items-center space-x-2 mt-1">
                                            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                              <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                                            </svg>
                                            <a href={member.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                              Twitter
                                            </a>
                                          </div>
                                        )}
                                      </dd>
                                    </div>
                                  )}
                                </dl>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Step 5: Review */}
                {activeStep === 5 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-gray-900">Patvirtinimas</h3>
                    
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-blue-700">
                            Peržiūrėkite ir patvirtinkite savo verslo informaciją. Po patvirtinimo, jūsų duomenys bus perduoti administratoriams patvirtinimui.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Business Information */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Verslo informacija
                        </h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                          Pagrindinė verslo informacija ir kontaktai
                        </p>
                      </div>
                      <div className="border-t border-gray-200">
                        <dl>
                          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Pavadinimas</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.name}</dd>
                          </div>
                          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">ID</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.id}</dd>
                          </div>
                          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Miestas</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.city}</dd>
                          </div>
                          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">El. paštas</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.email}</dd>
                          </div>
                          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Telefonas</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.phone}</dd>
                          </div>
                          {formData.website && (
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                              <dt className="text-sm font-medium text-gray-500">Svetainė</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                  {formData.website}
                                </a>
                              </dd>
                            </div>
                          )}
                          {formData.price && (
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                              <dt className="text-sm font-medium text-gray-500">Kaina</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.price}</dd>
                            </div>
                          )}
                          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Paslaugos</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                                {formData.services.map((service, index) => (
                                  <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                    <div className="w-0 flex-1 flex items-center">
                                      <span className="ml-2 flex-1 w-0 truncate">{service}</span>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </dd>
                          </div>
                          {formData.description && (
                            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                              <dt className="text-sm font-medium text-gray-500">Aprašymas</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formData.description}</dd>
                            </div>
                          )}
                          {formData.logo && (
                            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                              <dt className="text-sm font-medium text-gray-500">Logotipas</dt>
                              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                <img src={formData.logoPreview} alt="Logo preview" className="h-16 w-16 object-contain bg-gray-100 rounded-md" />
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                    
                    {/* Business Hours */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                      <div className="px-4 py-5 sm:px-6">
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          Darbo valandos
                        </h3>
                      </div>
                      <div className="border-t border-gray-200">
                        <dl>
                          {/* Monday */}
                          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Pirmadienis</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {formData.businessHours.monday.isClosed ? (
                                <span className="text-red-500">Uždaryta</span>
                              ) : formData.businessHours.monday.isOpen24Hours ? (
                                <span>24 valandas</span>
                              ) : (
                                <span>{formData.businessHours.monday.open} - {formData.businessHours.monday.close}</span>
                              )}
                            </dd>
                          </div>
                          
                          {/* Tuesday */}
                          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Antradienis</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {formData.businessHours.tuesday.isClosed ? (
                                <span className="text-red-500">Uždaryta</span>
                              ) : formData.businessHours.tuesday.isOpen24Hours ? (
                                <span>24 valandas</span>
                              ) : (
                                <span>{formData.businessHours.tuesday.open} - {formData.businessHours.tuesday.close}</span>
                              )}
                            </dd>
                          </div>
                          
                          {/* Wednesday */}
                          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Trečiadienis</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {formData.businessHours.wednesday.isClosed ? (
                                <span className="text-red-500">Uždaryta</span>
                              ) : formData.businessHours.wednesday.isOpen24Hours ? (
                                <span>24 valandas</span>
                              ) : (
                                <span>{formData.businessHours.wednesday.open} - {formData.businessHours.wednesday.close}</span>
                              )}
                            </dd>
                          </div>
                          
                          {/* Thursday */}
                          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Ketvirtadienis</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {formData.businessHours.thursday.isClosed ? (
                                <span className="text-red-500">Uždaryta</span>
                              ) : formData.businessHours.thursday.isOpen24Hours ? (
                                <span>24 valandas</span>
                              ) : (
                                <span>{formData.businessHours.thursday.open} - {formData.businessHours.thursday.close}</span>
                              )}
                            </dd>
                          </div>
                          
                          {/* Friday */}
                          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Penktadienis</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {formData.businessHours.friday.isClosed ? (
                                <span className="text-red-500">Uždaryta</span>
                              ) : formData.businessHours.friday.isOpen24Hours ? (
                                <span>24 valandas</span>
                              ) : (
                                <span>{formData.businessHours.friday.open} - {formData.businessHours.friday.close}</span>
                              )}
                            </dd>
                          </div>
                          
                          {/* Saturday */}
                          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Šeštadienis</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {formData.businessHours.saturday.isClosed ? (
                                <span className="text-red-500">Uždaryta</span>
                              ) : formData.businessHours.saturday.isOpen24Hours ? (
                                <span>24 valandas</span>
                              ) : (
                                <span>{formData.businessHours.saturday.open} - {formData.businessHours.saturday.close}</span>
                              )}
                            </dd>
                          </div>
                          
                          {/* Sunday */}
                          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Sekmadienis</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                              {formData.businessHours.sunday.isClosed ? (
                                <span className="text-red-500">Uždaryta</span>
                              ) : formData.businessHours.sunday.isOpen24Hours ? (
                                <span>24 valandas</span>
                              ) : (
                                <span>{formData.businessHours.sunday.open} - {formData.businessHours.sunday.close}</span>
                              )}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </div>
                    
                    {/* Team Members */}
                    {formData.team.length > 0 && (
                      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                          <h3 className="text-lg leading-6 font-medium text-gray-900">
                            Komandos nariai
                          </h3>
                          <p className="mt-1 max-w-2xl text-sm text-gray-500">
                            {formData.team.length} nariai
                          </p>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
                            {formData.team.map((member, index) => (
                              <div key={index} className="border rounded-lg overflow-hidden shadow-sm">
                                <div className="p-4">
                                  <div className="flex items-center space-x-4">
                                    {member.photoPreview || member.photoUrl ? (
                                      <img
                                        src={member.photoPreview || member.photoUrl}
                                        alt={member.name}
                                        className="h-12 w-12 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                                        <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                      </div>
                                    )}
                                    <div>
                                      <h5 className="text-lg font-medium text-gray-900">{member.name}</h5>
                                      <p className="text-sm text-gray-500">{member.position}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Terms and Conditions */}
                    <div className="rounded-md bg-gray-50 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-gray-700">
                            Registruodamiesi patvirtinate, kad visa pateikta informacija yra teisinga ir tiksli. Po patvirtinimo, administratoriai peržiūrės jūsų pateiktą informaciją.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Form Navigation */}
              <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                {activeStep > 1 && !success && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Atgal
                  </button>
                )}
                
                <div className="flex-1"></div>
                
                {activeStep < totalSteps && !success && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Toliau
                    <svg className="-mr-1 ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
                
                {activeStep === totalSteps && !success && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${submitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Siunčiama...
                      </>
                    ) : 'Registruoti verslą'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RegisterBusinessModal;
