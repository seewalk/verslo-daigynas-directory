// components/Users/TeamMemberModal.js
import React, { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const TeamMemberModal = ({ isOpen, onClose, onSubmit, initialData = {}, vendorId }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    position: '',
    photoUrl: '',
    bio: '',
    email: '',
    phone: '',
    featured: false,
    order: 999,
    socialMedia: {
      linkedin: '',
      twitter: '',
      github: ''
    },
    qualifications: [],
    languages: []
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [newQualification, setNewQualification] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const storage = getStorage();
  // Check in your settings.js file that you have these state variables:
const [showTeamMemberModal, setShowTeamMemberModal] = useState(false);
const [currentTeamMember, setCurrentTeamMember] = useState(null);
const [editingTeamMemberIndex, setEditingTeamMemberIndex] = useState(-1);

  // Load initial data when editing
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        ...formData,
        ...initialData,
        socialMedia: initialData.socialMedia || { linkedin: '', twitter: '', github: '' }
      });
      
      if (initialData.photoUrl) {
        setPhotoPreview(initialData.photoUrl);
      }
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('socialMedia.')) {
      const socialField = name.split('.')[1];
      setFormData({
        ...formData,
        socialMedia: {
          ...formData.socialMedia,
          [socialField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const addQualification = () => {
    if (newQualification.trim()) {
      setFormData({
        ...formData,
        qualifications: [...(formData.qualifications || []), newQualification.trim()]
      });
      setNewQualification('');
    }
  };

  const removeQualification = (index) => {
    const updatedQualifications = [...formData.qualifications];
    updatedQualifications.splice(index, 1);
    setFormData({ ...formData, qualifications: updatedQualifications });
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages?.includes(newLanguage.trim())) {
      setFormData({
        ...formData,
        languages: [...(formData.languages || []), newLanguage.trim()]
      });
      setNewLanguage('');
    }
  };

  const removeLanguage = (index) => {
    const updatedLanguages = [...formData.languages];
    updatedLanguages.splice(index, 1);
    setFormData({ ...formData, languages: updatedLanguages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let photoUrl = formData.photoUrl;

      // Upload photo if a new one is selected
      if (photoFile) {
        const photoStorageRef = ref(storage, `team-photos/${vendorId}_${formData.name.replace(/\s+/g, '-')}_${Date.now()}`);
        await uploadBytes(photoStorageRef, photoFile);
        photoUrl = await getDownloadURL(photoStorageRef);
      }

      // Create final team member data
      const teamMemberData = {
        ...formData,
        photoUrl,
        // Ensure unique ID if not provided
        id: formData.id || formData.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
      };

      onSubmit(teamMemberData);
    } catch (error) {
      console.error("Error saving team member:", error);
      alert('Klaida išsaugant komandos narį. Bandykite dar kartą.');
    } finally {
      setSubmitting(false);
    }
  };

  {showTeamMemberModal && (
  <TeamMemberModal
    isOpen={showTeamMemberModal}
    onClose={() => {
      setShowTeamMemberModal(false);
      setCurrentTeamMember(null);
      setEditingTeamMemberIndex(-1);
    }}
    onSubmit={handleTeamMemberSubmit}
    initialData={currentTeamMember}
    vendorId={userProfile.vendorId}
  />
)}

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold">
            {initialData.id ? 'Redaguoti komandos narį' : 'Pridėti komandos narį'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vardas ir pavardė *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pareigos *
                </label>
                <input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  El. paštas
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefono numeris
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aprašymas *
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                  Išskirtas komandos narys
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rodymo tvarka (mažesnis skaičius rodomas anksčiau)
                </label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>
            
            {/* Right column */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nuotrauka
                </label>
                <div className="flex items-start gap-4">
                  <div className="w-24 h-24 bg-gray-100 border rounded-md overflow-hidden flex items-center justify-center">
                    {photoPreview ? (
                      <img 
                        src={photoPreview} 
                        alt="Team member preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400">Nėra nuotraukos</span>
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      id="photoUpload"
                      onChange={handlePhotoChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <label 
                      htmlFor="photoUpload"
                      className="inline-block px-3 py-1.5 bg-gray-200 text-gray-700 font-medium rounded-md hover:bg-gray-300 cursor-pointer"
                    >
                      Pasirinkti nuotrauką
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Rekomenduojamas dydis: 400x400px
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kvalifikacijos
                </label>
                <div className="flex items-center mb-2">
                  <input 
                    type="text" 
                    value={newQualification}
                    onChange={(e) => setNewQualification(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Kvalifikacija"
                  />
                  <button 
                    type="button"
                    onClick={addQualification}
                    className="px-3 py-2 bg-blue-600 text-white font-medium rounded-r-md hover:bg-blue-700"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.qualifications?.map((qual, index) => (
                    <div key={index} className="bg-gray-100 rounded-full px-3 py-1 flex items-center">
                      <span className="mr-1">{qual}</span>
                      <button 
                        type="button" 
                        onClick={() => removeQualification(index)}
                        className="text-gray-500 hover:text-red-500 focus:outline-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {(!formData.qualifications || formData.qualifications.length === 0) && (
                    <p className="text-sm text-gray-500">Nėra pridėtų kvalifikacijų</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kalbos
                </label>
                <div className="flex items-center mb-2">
                  <input 
                    type="text" 
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Kalba"
                  />
                  <button 
                    type="button"
                    onClick={addLanguage}
                    className="px-3 py-2 bg-blue-600 text-white font-medium rounded-r-md hover:bg-blue-700"
                  >
                    +
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.languages?.map((lang, index) => (
                    <div key={index} className="bg-gray-100 rounded-full px-3 py-1 flex items-center">
                      <span className="mr-1">{lang}</span>
                      <button 
                        type="button" 
                        onClick={() => removeLanguage(index)}
                        className="text-gray-500 hover:text-red-500 focus:outline-none"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {(!formData.languages || formData.languages.length === 0) && (
                    <p className="text-sm text-gray-500">Nėra pridėtų kalbų</p>
                  )}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-1">
                  Socialiniai tinklai
                </h4>
                <div className="space-y-3 mt-2">
                  <div>
                    <label className="text-xs text-gray-500 block">LinkedIn URL</label>
                    <input
                      type="url"
                      name="socialMedia.linkedin"
                      value={formData.socialMedia?.linkedin || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://linkedin.com/in/username"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block">Twitter URL</label>
                    <input
                      type="url"
                      name="socialMedia.twitter"
                      value={formData.socialMedia?.twitter || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://twitter.com/username"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block">GitHub URL</label>
                    <input
                      type="url"
                      name="socialMedia.github"
                      value={formData.socialMedia?.github || ''}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://github.com/username"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Atšaukti
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Išsaugoma...' : initialData.id ? 'Atnaujinti' : 'Pridėti'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamMemberModal;
