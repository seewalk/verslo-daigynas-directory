// pages/tiekejai/[id].js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import VendorRegistrationCTA from '../../components/VendorRegistrationCTA';
import ContentHighlightDivider from '../../components/ContentHighLightDivider';
import FavoriteHeart from '../../components/Users/FavoriteHeart';
import TeamProfiles from '../../components/Users/TeamProfiles';
import ClaimBusinessModal from '../../components/Users/ClaimBusinessModal';
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
import ServiceRequestModal from '../../components/Users/ServiceRequestModal';





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

// Helper function to generate URL-friendly vendor slug
const generateVendorSlug = (name) => {
  if (!name) return '';
  return name.toLowerCase().replace(/\s+/g, '-');
};

let app = null;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  if (!/already exists/.test(error.message)) {
    console.error("Firebase initialization error", error.stack);
  }
}

const db = getFirestore();


// Trust Badge Component
const TrustBadge = ({ verificationLevel = 'none', trustScore = null }) => {
  const badgeStyle = {
    premium: {
      bgColor: 'bg-gradient-to-r from-blue-500 to-purple-500',
      textColor: 'text-white',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      label: 'Premium Verified'
    },
    enhanced: {
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      label: 'Enhanced Verification'
    },
    standard: {
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      label: 'Verified Business'
    },
    none: {
      bgColor: 'bg-gray-200',
      textColor: 'text-gray-600',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      ),
      label: 'Listing Unverified'
    }
  };

  const badge = badgeStyle[verificationLevel] || badgeStyle.none;

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full ${badge.bgColor} ${badge.textColor} text-sm font-medium`}>
      {badge.icon}
      <span className="ml-1">{badge.label}</span>
      {trustScore !== null && (
        <span className="ml-2 pl-2 border-l border-white border-opacity-30">
          {trustScore}% Trust
        </span>
      )}
    </div>
  );
};

// Business Status Component
const BusinessStatusIndicator = ({ businessHours }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  useEffect(() => {
    if (!businessHours) {
      setStatusMessage('Darbo laikas nenustatytas');
      return;
    }

    
    
    // Calculate if business is currently open
    const now = new Date();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = dayNames[now.getDay()];
    
    // Convert current time to HH:MM format
    const currentTime = now.toTimeString().substring(0, 5);
    
    // Get today's hours
    const todayHours = businessHours[today];
    
    if (!todayHours) {
      setIsOpen(false);
      setStatusMessage('Šiandien uždaryta');
      return;
    }
    
    if (todayHours.isClosed) {
      setIsOpen(false);
      setStatusMessage('Šiandien uždaryta');
    } else if (todayHours.isOpen24Hours) {
      setIsOpen(true);
      setStatusMessage('Atidaryta visą parą');
    } else if (todayHours.open && todayHours.close) {
      // Check if current time is between open and close times
      if (currentTime >= todayHours.open && currentTime < todayHours.close) {
        setIsOpen(true);
        setStatusMessage(`Atidaryta iki ${todayHours.close}`);
      } else {
        setIsOpen(false);
        if (currentTime < todayHours.open) {
          setStatusMessage(`Atidarys ${todayHours.open}`);
        } else {
          setStatusMessage(`Uždaryta, atsidarys rytoj ${businessHours[dayNames[(now.getDay() + 1) % 7]]?.open || ''}`);
        }
      }
    }
  }, [businessHours]);
  
  if (!businessHours) return null;
  
  return (
    <div className={`flex items-center ${isOpen ? 'text-green-600' : 'text-red-500'}`}>
      <div className={`h-3 w-3 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
      <span className="text-sm font-medium">{statusMessage}</span>
    </div>
  );
};

// Compliance Badge Component
const ComplianceBadge = ({ type }) => {
  const badgeInfo = {
    GDPR_compliant: {
      name: 'GDPR Compliant',
      icon: 'shield-check',
      color: 'bg-blue-100 text-blue-800',
      description: 'This business complies with EU General Data Protection Regulation'
    },
    ISO_27001: {
      name: 'ISO 27001',
      icon: 'badge-check',
      color: 'bg-indigo-100 text-indigo-800',
      description: 'Certified for information security management'
    },
    sustainable: {
      name: 'Eco Friendly',
      icon: 'leaf',
      color: 'bg-green-100 text-green-800',
      description: 'Uses sustainable practices'
    }
  };
  
  const badge = badgeInfo[type];
  if (!badge) return null;
  
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded ${badge.color} text-xs font-medium`} title={badge.description}>
      <span>{badge.name}</span>
    </div>
  );
};



export default function VendorProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showClaimBusinessModal, setShowClaimBusinessModal] = useState(false);
  // This line should be exactly here, at this scope
  const [showServiceRequestModal, setShowServiceRequestModal] = useState(false);
  const auth = getAuth(app);
  const [user] = useAuthState(auth);


  useEffect(() => {
  const fetchVendorData = async () => {
    if (!id) return;

    try {
      setLoading(true);
      let resolvedVendor = null;

      // Try direct document ID first
      try {
        const vendorDoc = await getDoc(doc(db, "vendors", id));
        if (vendorDoc.exists()) {
          resolvedVendor = { id: vendorDoc.id, ...vendorDoc.data() };
        }
      } catch (e) {
        console.log("Not a direct document ID, continuing search...");
      }

      // If not found by ID, try by slug
      if (!resolvedVendor) {
        const vendorsRef = collection(db, "vendors");
        const querySnapshot = await getDocs(vendorsRef);

        querySnapshot.forEach((docSnap) => {
          const vendorData = docSnap.data();
          const normalizedName = generateVendorSlug(vendorData.name);
          if (normalizedName === id) {
            resolvedVendor = { id: docSnap.id, ...vendorData };
          }
        });
      }

      if (resolvedVendor) {
        // Check ownership claim (if user is logged in)
        let isOwner = false;

        if (user) {
          const claimQuery = query(
            collection(db, "businessClaims"),
            where("vendorId", "==", resolvedVendor.id),
            where("userId", "==", user.uid),
            where("status", "==", "approved")
          );

          const claimSnapshot = await getDocs(claimQuery);
          if (!claimSnapshot.empty) {
            isOwner = true;
          }
        }

        // Attach verification info
        setVendor({
          ...resolvedVendor,
          isOwner,
          verificationLevel: isOwner ? "standard" : "unverified"
        });
        setLoading(false);
      } else {
        setNotFound(true);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching vendor data:", error);
      setLoading(false);
      setNotFound(true);
    }
  };

  if (id) {
    fetchVendorData();
  }
}, [id, user]);

  // Handle loading state
  if (router.isFallback || loading) {
    return (
      <>
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-4">Kraunama...</h2>
          <p>Prašome palaukti, kol gausime įmonės informaciją.</p>
        </div>
        <Footer />
      </>
    );
  }

  // Handle not found case
  if (notFound || !vendor) {
    return (
      <>
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <h2 className="text-2xl font-bold mb-4">Įmonė nerasta</h2>
          <p className="mb-8">Nepavyko rasti ieškamos įmonės.</p>
          <button 
            onClick={() => router.push('/tiekejai')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Grįžti į katalogą
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{vendor.name} - Verslo Daigynas</title>
        <meta name="description" content={vendor.description} />
      </Head>
      
      <Header />
      
      <main>
        <div className="vendor-hero bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-start">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{vendor.name}</h1>
                
                {/* Favorite button */}
                {vendor.name && (
                  <FavoriteHeart 
                    vendorName={vendor.name} 
                    size="large" 
                    className="text-white hover:text-red-500" 
                  />
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
                {/* Verification Badge */}
                <TrustBadge 
                  verificationLevel={vendor.verificationLevel || 'none'} 
                  trustScore={vendor.trustMetrics?.overallScore}
                />
                
                {/* Business hours status */}
                {vendor.businessHours && (
                  <BusinessStatusIndicator businessHours={vendor.businessHours} />
                )}
                
                {/* Compliance badges */}
                {vendor.complianceBadges?.map((badge, index) => (
                  <ComplianceBadge key={index} type={badge.type} />
                ))}
              </div>
              
              <p className="text-xl opacity-90 max-w-3xl">{vendor.description}</p>
              
              <div className="mt-8">
                {vendor.website && (
                  <a 
                    href={vendor.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block bg-white text-blue-600 px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-all mr-4"
                  >
                    Apsilankyti svetainėje
                  </a>
                )}
                
                <a 
                  href={`mailto:${vendor.email}`}
                  className="inline-block bg-transparent border-2 border-white text-white px-6 py-[10px] rounded-md font-medium hover:bg-white hover:bg-opacity-10 transition-all"
                >
                  Susisiekti
                </a>
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Company Details */}
            <div className="md:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-xl shadow-md p-6 mb-8"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold mb-4">Apie {vendor.name}</h2>
                  
                  {/* Trust Score visualization if available */}
                  {vendor.trustMetrics?.overallScore && (
                    <div className="flex items-center">
                      <div className="text-sm text-gray-500 mr-2">Pasitikėjimo reitingas:</div>
                      <div className="w-20 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" 
                          style={{ width: `${vendor.trustMetrics.overallScore}%` }}
                        ></div>
                      </div>
                      <div className="ml-2 text-sm font-medium">{vendor.trustMetrics.overallScore}%</div>
                    </div>
                  )}
                </div>
                
                <p className="text-gray-700 mb-6">{vendor.description}</p>
                
                {/* Verification details */}
                {vendor.verificationLevel && vendor.verificationLevel !== 'none' && (
                  <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Patikrinta informacija</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {vendor.verificationStatus?.email?.verified && (
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Patikrintas el. paštas</span>
                        </div>
                      )}
                      
                      {vendor.verificationStatus?.phone?.verified && (
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Patikrintas telefono numeris</span>
                        </div>
                      )}
                      
                      {vendor.verificationStatus?.address?.verified && (
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Patikrintas adresas</span>
                        </div>
                      )}
                      
                      {vendor.verificationStatus?.documents?.verified && (
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Patikrinta verslo registracija</span>
                        </div>
                      )}
                      
                      {vendor.verificationStatus?.physicalAudit?.verified && (
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          <span>Asmeninė apžiūra atlikta</span>
                        </div>
                      )}
                    </div>
                    
                    {vendor.verificationLevel === 'premium' && (
                      <div className="mt-3 text-sm text-blue-700">
                        Šiam verslo subjektui suteiktas aukščiausias patikimumo lygis, nes jis atitinka visus patikros kriterijus.
                      </div>
                    )}
                  </div>
                )}
                
                {vendor.services && vendor.services.length > 0 && (
                  <>
                    <h3 className="text-xl font-semibold mb-3">Paslaugos</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                      {vendor.services.map((service, index) => (
                        <li key={index} className="flex items-center">
                          <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {service}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                
                {vendor.price && (
                  <>
                    <h3 className="text-xl font-semibold mb-3">Kainodara</h3>
                    <p className="text-gray-700 mb-6">{vendor.price}</p>
                  </>
                )}
                
                {/* Business hours if available */}
                {vendor.businessHours && (
                  <>
                    <h3 className="text-xl font-semibold mb-3">Darbo laikas</h3>
                    <div className="grid grid-cols-2 gap-2 mb-6">
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
                        const dayHours = vendor.businessHours[day];
                        if (!dayHours) return null;
                        
                        const dayNames = {
                          monday: 'Pirmadienis',
                          tuesday: 'Antradienis',
                          wednesday: 'Trečiadienis',
                          thursday: 'Ketvirtadienis',
                          friday: 'Penktadienis',
                          saturday: 'Šeštadienis',
                          sunday: 'Sekmadienis'
                        };
                        
                        return (
                          <div key={day} className="flex justify-between">
                            <span className="font-medium">{dayNames[day]}:</span>
                            <span>
                              {dayHours.isClosed && 'Uždaryta'}
                              {dayHours.isOpen24Hours && 'Atidaryta visą parą'}
                              {!dayHours.isClosed && !dayHours.isOpen24Hours && `${dayHours.open} - ${dayHours.close}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </motion.div>
              
              <ContentHighlightDivider />
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white rounded-xl shadow-md p-6 mb-8"
              >
                <h2 className="text-2xl font-bold mb-4">Kodėl rinktis mus</h2>
                <div className="prose max-w-none text-gray-700">
                  <p>
                    {vendor.whyChooseUs || `Turime ilgametę patirtį ir esame įsipareigoję teikti aukščiausios kokybės paslaugas, pritaikytas konkretiems jūsų verslo poreikiams. Mūsų ekspertų komanda pasirengusi padėti jūsų verslui sėkmingai vystytis.`}
                  </p>
                </div>
              </motion.div>
            </div>
            
            {/* Contact Information */}
            <div className="md:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-xl shadow-md p-6 sticky top-8"
              >
                <div className="flex items-center justify-center mb-6">
                  {vendor.logo ? (
                    <img 
                      src={vendor.logo} 
                      alt={`${vendor.name} logo`} 
                      className="w-32 h-32 object-contain"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold text-blue-400">
                        {vendor.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-semibold mb-4">Kontaktinė informacija</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mt-1 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Vieta</p>
                      <p className="text-gray-600">{vendor.city || "Vieta nenurodyta"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <svg className="w-5 h-5 text-blue-500 mt-1 mr-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">El. paštas</p>
                      <a href={`mailto:${vendor.email}`} className="text-blue-600 hover:underline">
                        {vendor.email}
                      </a>
                    </div>
                  </div>
                  
                  {vendor.phone && (
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mt-1 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">Telefono numeris</p>
                        <a href={`tel:${vendor.phone}`} className="text-blue-600 hover:underline">
                          {vendor.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  
                  {vendor.website && (
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-500 mt-1 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">Svetainė</p>
                        <a 
                          href={vendor.website} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:underline"
                        >
                          Apsilankyti svetainėje
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Trust metrics */}
                {vendor.trustMetrics && (
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Patikimumo metrikos</h4>
                    
                    {vendor.trustMetrics.responseRate && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Atsakymo dažnis</span>
                        <span className="text-sm font-medium">{vendor.trustMetrics.responseRate}%</span>
                      </div>
                    )}
                    
                    {vendor.trustMetrics.responseTime !== undefined && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Vid. atsakymo laikas</span>
                        <span className="text-sm font-medium">{vendor.trustMetrics.responseTime} val.</span>
                      </div>
                    )}
                    
                    {vendor.trustMetrics.yearsInBusiness && (
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Veiklos metai</span>
                        <span className="text-sm font-medium">{vendor.trustMetrics.yearsInBusiness}</span>
                      </div>
                    )}
                    
                    {vendor.trustMetrics.reviewScore && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Įvertinimas</span>
                        <span className="text-sm font-medium">{vendor.trustMetrics.reviewScore}/5</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Compliance badges section */}
                {vendor.complianceBadges && vendor.complianceBadges.length > 0 && (
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Atitikties sertifikatai</h4>
                    <div className="flex flex-wrap gap-2">
                      {vendor.complianceBadges.map((badge, index) => (
                        <ComplianceBadge key={index} type={badge.type} />
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-4 border-t border-gray-200">
                  <button 
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                    onClick={() => window.location.href = `mailto:${vendor.email}`}
                  >
                    Susisiekti dabar
                  </button>
                </div>

                <div className="mt-3">
  <button 
    className="w-full flex items-center justify-center bg-white border border-dashed border-amber-500 text-amber-600 py-2 px-4 rounded-md hover:bg-amber-50 transition-colors relative group"
    onClick={() => setShowClaimBusinessModal(true)}
  >
    <span className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">Naujiena</span>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
    <span className="group-hover:underline">Perimti šį verslą</span>
  </button>
</div>

<div className="mt-3">
  <button 
    className="w-full flex items-center justify-center bg-white border border-dashed border-blue-500 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-50 transition-colors relative group"
    onClick={() => setShowServiceRequestModal(true)}
  >
    <span className="absolute top-0 right-0 transform -translate-y-1/2 translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">Naujiena</span>
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    </svg>
    <span className="group-hover:underline">Siųsti paslaugų užklausą</span>
  </button>
</div>

              </motion.div>
            </div>
          </div>
        </div>

                       {/* Add the Team Profiles section here - before the similar vendors and after main vendor info */}
      {vendor && vendor.team && vendor.team.length > 0 && (
        <section className="my-16">
          <div className="container mx-auto">
            <ContentHighlightDivider 
              title="Komanda" 
              text="Susipažinkite su profesionalais, kurie teikia mūsų paslaugas"
              align="center"
            />
            <div className="mt-8">
              <TeamProfiles teamMembers={vendor.team} />
            </div>
          </div>
        </section>
      )}
        
        <VendorRegistrationCTA />

      </main>

      {/* Add the modal at the end */}
      <ClaimBusinessModal
        isOpen={showClaimBusinessModal}
        onClose={() => setShowClaimBusinessModal(false)}
        vendorId={vendor?.id}
        vendorName={vendor?.name}
      />

      <ServiceRequestModal
  isOpen={showServiceRequestModal}
  onClose={() => setShowServiceRequestModal(false)}
  vendorId={vendor?.id}
  vendorName={vendor?.name}
/>
      
      <Footer />
      
      <style jsx global>{`
        .vendor-hero {
          position: relative;
          overflow: hidden;
        }
        
        .vendor-hero::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('/patterns/dots.svg');
          opacity: 0.1;
          z-index: 1;
        }
        
        .vendor-hero > div {
          position: relative;
          z-index: 2;
        }
      `}</style>
    </>
  );
}