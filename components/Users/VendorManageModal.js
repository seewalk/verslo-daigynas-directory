// components/BusinessManagement/VendorManageModal.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
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

const VendorManageModal = ({ isOpen, onClose, vendorId }) => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('general');
  
  // State for form data
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    city: '',
    services: [],
    price: '',
    website: '',
    logo: null, // File object
    logoPreview: '', // URL for preview
    logoUrl: '', // Existing logo URL
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
  
  const [editingTeamMemberId, setEditingTeamMemberId] = useState(null);
  
  // State for temporary inputs
  const [tempQualification, setTempQualification] = useState('');
  const [tempLanguage, setTempLanguage] = useState('');
  const [tempService, setTempService] = useState('');
  
  // State for form submission
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
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
  
  // Fetch vendor data when the modal opens
  useEffect(() => {
  const fetchVendorData = async () => {
    if (!isOpen) return;
    
    if (!vendorId) {
      setError('Nepateiktas verslo ID');
      setLoading(false);
      return;
    }
    
    console.log('Fetching vendor data for ID:', vendorId); // Debug log
    
    setLoading(true);
    try {
      // Fetch vendor data from Firestore
      const vendorRef = doc(db, "vendors", vendorId);
      const vendorSnap = await getDoc(vendorRef);
      
      if (vendorSnap.exists()) {
        const vendorData = vendorSnap.data();
        
        // Format data for the form
        setFormData({
          id: vendorId,
          name: vendorData.name || '',
            city: vendorData.city || '',
            services: vendorData.services || [],
            price: vendorData.price || '',
            website: vendorData.website || '',
            logo: null,
            logoPreview: '',
            logoUrl: vendorData.logo || '',
            description: vendorData.description || '',
            email: vendorData.email || '',
            phone: vendorData.phone || '',
            businessHours: vendorData.businessHours || {
              monday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
              tuesday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
              wednesday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
              thursday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
              friday: { open: "09:00", close: "18:00", isOpen24Hours: false, isClosed: false },
              saturday: { isClosed: true, open: "00:00", close: "00:00", isOpen24Hours: false },
              sunday: { isClosed: true, open: "00:00", close: "00:00", isOpen24Hours: false },
            },
            team: vendorData.team || []
          });
          
          setStatusMessage(`Statuso lygis: ${vendorData.verificationLevel || 'none'}`);
        } else {
          setError('Verslo duomenys nerasti');
        }
      } catch (err) {
        console.error('Error fetching vendor data:', err);
        setError(`Klaida gaunant verslo duomenis: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    
    fetchVendorData();
  }, [isOpen, vendorId]);
  
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
  
  // Start editing a team member
  const handleEditTeamMember = (member) => {
    setTeamMember({
      ...member,
      photoFile: null,
      photoPreview: ''
    });
    setEditingTeamMemberId(member.id);
  };
  
  // Save team member changes
  const handleSaveTeamMember = () => {
    // Validate required fields
    if (!teamMember.name || !teamMember.position) {
      setError('Vardas ir pareigos yra privalomi');
      return;
    }
    
    // Update existing or add new team member
    setFormData(prev => {
      if (editingTeamMemberId) {
        // Update existing team member
        return {
          ...prev,
          team: prev.team.map(member => 
            member.id === editingTeamMemberId ? 
              { ...teamMember, id: teamMember.id || slugify(teamMember.name) } : 
              member
          )
        };
      } else {
        // Add new team member
        return {
          ...prev,
          team: [
            ...prev.team, 
            { 
              ...teamMember,
              id: teamMember.id || slugify(teamMember.name),
              order: prev.team.length + 1
            }
          ]
        };
      }
    });
    
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
      order: formData.team.length + 1,
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
    
    setEditingTeamMemberId(null);
    setError('');
  };
  
  // Cancel team member editing
  const handleCancelTeamMemberEdit = () => {
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
      order: formData.team.length + 1,
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
    
    setEditingTeamMemberId(null);
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
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      
      // Get current user
      const user = auth.currentUser;
      if (!user) {
        setError('Turite būti prisijungę, kad galėtumėte redaguoti verslo duomenis');
        setSubmitting(false);
        return;
      }
      
      // Upload logo if provided
      let logoUrl = formData.logoUrl;
      if (formData.logo) {
        const logoRef = ref(storage, `business-logos/${formData.id}/${formData.logo.name}`);
        await uploadBytes(logoRef, formData.logo);
        logoUrl = await getDownloadURL(logoRef);
      }
      
      // Upload team photos and prepare team data
      const teamWithPhotos = [];
      for (const member of formData.team) {
        let photoUrl = member.photoUrl;
        
        // Upload new photo if provided
        if (member.photoFile) {
          const photoRef = ref(storage, `team-photos/${formData.id}/${member.id}/${member.photoFile.name}`);
          await uploadBytes(photoRef, member.photoFile);
          photoUrl = await getDownloadURL(photoRef);
        }
        
        // Remove photoFile and photoPreview from data to be stored
        const { photoFile, photoPreview, ...memberData } = member;
        teamWithPhotos.push({
          ...memberData,
          photoUrl
        });
      }
      
      // Prepare vendor data for update
      const vendorUpdateData = {
        name: formData.name,
        city: formData.city,
        services: formData.services,
        price: formData.price,
        website: formData.website,
        description: formData.description,
        email: formData.email,
        phone: formData.phone,
        businessHours: formData.businessHours,
        team: teamWithPhotos,
        lastUpdated: serverTimestamp()
      };
      
      // Add logo URL if updated
      if (logoUrl) {
        vendorUpdateData.logo = logoUrl;
      }
      
      // Update vendor document in Firestore
      const vendorRef = doc(db, "vendors", formData.id);
      await updateDoc(vendorRef, vendorUpdateData);
      
      // Show success message
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error('Error updating business:', err);
      setError(`Klaida atnaujinant verslo duomenis: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
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
              className="bg-white rounded-xl shadow-xl w-full max-w-5xl mx-auto overflow-hidden"
              variants={modalVariants}
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-bold">
                  Valdyti verslą: {formData.name}
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
              
              {/* Status Message */}
              {statusMessage && (
                <div className="px-6 pt-4">
                  <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">{statusMessage}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Loading Indicator */}
              {loading && (
                <div className="px-6 py-10 flex justify-center">
                  <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}
              
              {!loading && (
                <>
                  {/* Tabs Navigation */}
                  <div className="px-6 pt-4">
                    <div className="border-b border-gray-200">
                      <nav className="-mb-px flex space-x-8">
                        <button
                          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'general' 
                              ? 'border-blue-500 text-blue-600' 
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => setActiveTab('general')}
                        >
                          Pagrindinė informacija
                        </button>
                        <button
                          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'hours' 
                              ? 'border-blue-500 text-blue-600' 
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => setActiveTab('hours')}
                        >
                          Darbo valandos
                        </button>
                        <button
                          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'services' 
                              ? 'border-blue-500 text-blue-600' 
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => setActiveTab('services')}
                        >
                          Paslaugos
                        </button>
                        <button
                          className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'team' 
                              ? 'border-blue-500 text-blue-600' 
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          }`}
                          onClick={() => setActiveTab('team')}
                        >
                          Komanda
                        </button>
                      </nav>
                    </div>
                  </div>
                  
                  {/* Error Message */}
                  {error && (
                    <div className="px-6 pt-4">
                      <div className="bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Success Message */}
                  {success && (
                    <div className="px-6 pt-4">
                      <div className="bg-green-50 border-l-4 border-green-400 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm text-green-700">Verslo duomenys sėkmingai atnaujinti!</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Tab Content */}
                  <div className="px-6 py-4 max-h-[65vh] overflow-y-auto">
                    {/* General Information Tab */}
                    {activeTab === 'general' && (
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
                        </div>
                        
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
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            rows="4"
                            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Trumpas jūsų paslaugų aprašymas"
                          ></textarea>
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
                              ) : formData.logoUrl ? (
                                <img
                                  src={formData.logoUrl}
                                  alt="Current logo"
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
                                {formData.logoUrl ? 'Pakeisti logotipą' : 'Įkelti logotipą'}
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
                    
                    {/* Business Hours Tab */}
                    {activeTab === 'hours' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">Darbo valandos</h3>
                        
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
                    )}
                    
                    {/* Services Tab */}
                    {activeTab === 'services' && (
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
                    
                    {/* Team Tab */}
                    {activeTab === 'team' && (
                      <div className="space-y-6">
                        <h3 className="text-lg font-medium text-gray-900">Komandos nariai</h3>
                        
                        {/* Add/Edit team member form */}
                        <div className="bg-gray-50 p-4 rounded-md">
                          <h4 className="font-medium text-gray-700 mb-3">
                            {editingTeamMemberId ? 'Redaguoti komandos narį' : 'Pridėti komandos narį'}
                          </h4>
                          
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
                                ) : teamMember.photoUrl ? (
                                  <img
                                    src={teamMember.photoUrl}
                                    alt="Team member"
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
                                  {teamMember.photoUrl ? 'Pakeisti nuotrauką' : 'Įkelti nuotrauką'}
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
                          
                          <div className="flex space-x-3">
                            {editingTeamMemberId ? (
                              <>
                                <button
                                  type="button"
                                  onClick={handleSaveTeamMember}
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  Išsaugoti pakeitimus
                                </button>
                                <button
                                  type="button"
                                  onClick={handleCancelTeamMemberEdit}
                                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                  Atšaukti
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSaveTeamMember}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Pridėti komandos narį
                              </button>
                            )}
                          </div>
                        </div>
                        
                        {/* Team members list */}
                        {formData.team.length > 0 ? (
                          <div>
                            <h4 className="font-medium text-gray-700 mb-3">Komandos nariai</h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {formData.team.map((member) => (
                                <div key={member.id} className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                                  <div className="p-4">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center space-x-3">
                                        {member.photoUrl ? (
                                          <img
                                            src={member.photoUrl}
                                            alt={member.name}
                                            className="h-10 w-10 rounded-full object-cover"
                                          />
                                        ) : (
                                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                          </div>
                                        )}
                                        <div>
                                          <div className="font-medium text-gray-900">{member.name}</div>
                                          <div className="text-sm text-gray-500">{member.position}</div>
                                        </div>
                                      </div>
                                      
                                      <div className="flex space-x-2">
                                        <button
                                          type="button"
                                          onClick={() => handleEditTeamMember(member)}
                                          className="inline-flex items-center p-1 border border-gray-300 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-50"
                                        >
                                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                          </svg>
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveTeamMember(member.id)}
                                          className="inline-flex items-center p-1 border border-gray-300 rounded-md text-red-500 hover:text-red-600 hover:bg-gray-50"
                                        >
                                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                          </svg>
                                        </button>
                                      </div>
                                    </div>
                                    
                                    {member.featured && (
                                      <div className="mt-2">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                          Pagrindinis komandos narys
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 py-4">
                            Dar nėra pridėtų komandos narių. Pridėkite pirmąjį komandos narį!
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Footer with save button */}
                  <div className="px-6 py-4 bg-gray-50 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                        submitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Išsaugoma...
                        </>
                      ) : 'Išsaugoti pakeitimus'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default VendorManageModal;