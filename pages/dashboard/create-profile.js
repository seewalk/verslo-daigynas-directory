// pages/dashboard/create-profile.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  getAuth, 
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  updateDoc,
  getDoc,
  serverTimestamp 
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeApp } from "firebase/app";
import Footer from '../../components/Footer';
import HeaderMenu from '../../components/Users/HeaderMenu';

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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export default function CreateProfile() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  // Vendor form data
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    services: [''],
    price: '',
    website: '',
    description: '',
    email: '',
    phone: ''
  });
  
  // Handle authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setFormData(prev => ({
          ...prev,
          email: user.email // Pre-fill with user's email
        }));
        setLoading(false);
      } else {
        // User is not logged in, redirect to login page
        router.push('/');
      }
    });
    
    return () => unsubscribe();
  }, [router]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle service input changes
  const handleServiceChange = (index, value) => {
    const updatedServices = [...formData.services];
    updatedServices[index] = value;
    setFormData(prev => ({
      ...prev,
      services: updatedServices
    }));
  };
  
  // Add a new service input field
  const addServiceField = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, '']
    }));
  };
  
  // Remove a service input field
  const removeServiceField = (index) => {
    if (formData.services.length > 1) {
      const updatedServices = formData.services.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        services: updatedServices
      }));
    }
  };
  
  
  // Generate a vendor ID from company name
  const generateVendorId = (name) => {
    // Convert to lowercase, replace spaces with hyphens, remove special chars
    const base = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .substring(0, 30); // Limit length
    
    // Add random suffix for uniqueness
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `${base}-${randomSuffix}`;
  };
  
  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.city || !formData.email) {
      setError('Prašome užpildyti privalomus laukus: įmonės pavadinimas, miestas ir el. paštas.');
      return;
    }
    
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      // 1. Generate a vendor ID
      const vendorId = generateVendorId(formData.name);
      
      // 3. Create vendor document
      const vendorData = {
        id: vendorId,
        name: formData.name,
        city: formData.city,
        services: formData.services.filter(service => service.trim() !== ''),
        price: formData.price,
        website: formData.website,
        description: formData.description,
        email: formData.email,
        phone: formData.phone,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ownerUid: user.uid,
        isVerified: false
      };
      
      await setDoc(doc(db, "vendors", vendorId), vendorData);
      
      // 4. Update user document with vendorId
      const userRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        await updateDoc(userRef, {
          vendorId: vendorId,
          companyName: formData.name
        });
      } else {
        // Create user document if it doesn't exist
        await setDoc(userRef, {
          email: user.email,
          vendorId: vendorId,
          companyName: formData.name,
          createdAt: serverTimestamp()
        });
      }
      
      // Success! Show message and redirect after a delay
      setSuccess('Įmonės profilis sėkmingai sukurtas!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error("Error creating profile:", error);
      setError(`Klaida kuriant profilį: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <>
        <HeaderMenu />
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Loading...
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <HeaderMenu />
      
      <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: 0 }}>Sukurti naują profilį</h1>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Grįžti į valdymo skydelį
          </button>
        </div>
        
        {error && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#FFEEEE', 
            color: '#CC0000', 
            border: '1px solid #CC0000', 
            borderRadius: '4px',
            marginBottom: '20px' 
          }}>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{ 
            padding: '10px', 
            backgroundColor: '#EEFFEE', 
            color: '#00CC00', 
            border: '1px solid #00CC00', 
            borderRadius: '4px',
            marginBottom: '20px' 
          }}>
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}>
          <div style={{ marginBottom: '20px' }}>
            <h3>Pagrindinė informacija</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                Įmonės pavadinimas*
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="UAB Verslo Daigynas"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '4px' 
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                Miestas*
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Vilnius"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '4px' 
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                Aprašymas
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Trumpas įmonės aprašymas..."
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '4px',
                  minHeight: '100px'
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3>Paslaugos</h3>
            
            {formData.services.map((service, index) => (
              <div key={index} style={{ display: 'flex', marginBottom: '10px' }}>
                <input
                  type="text"
                  value={service}
                  onChange={(e) => handleServiceChange(index, e.target.value)}
                  placeholder="Paslauga (pvz., Virtualus biuras)"
                  style={{ 
                    flex: 1, 
                    padding: '10px', 
                    border: '1px solid #d1d5db', 
                    borderRadius: '4px' 
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeServiceField(index)}
                  style={{
                    padding: '10px',
                    marginLeft: '10px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  -
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addServiceField}
              style={{
                padding: '8px 16px',
                backgroundColor: '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              + Pridėti paslaugą
            </button>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3>Kainodara</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                Kaina
              </label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="nuo €35/mėn"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '4px' 
                }}
              />
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h3>Kontaktinė informacija</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                El. paštas*
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="info@example.com"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '4px' 
                }}
                required
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                Telefonas
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+370 XXXXXXX"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '4px' 
                }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 500 }}>
                Svetainė
              </label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid #d1d5db', 
                  borderRadius: '4px' 
                }}
              />
            </div>
          </div>
          
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', textAlign: 'right' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 24px',
                backgroundColor: submitting ? '#93c5fd' : '#2563EB',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: submitting ? 'not-allowed' : 'pointer'
              }}
            >
              {submitting ? 'Kuriama...' : 'Sukurti profilį'}
            </button>
          </div>
        </form>
      </div>
      
      <Footer />
    </>
  );
}
