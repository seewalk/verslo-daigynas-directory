// components/Administracija/EnhancedVendorsTable.js
import React from 'react';
import { useState, useEffect } from 'react';
import { doc, getDoc, collection, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const EnhancedVendorsTable = ({
  vendors,
  handleSort,
  sortField,
  sortDirection,
  setSelectedVendor,
  setIsEditModalOpen,
  setIsDeleteModalOpen
}) => {
  const [claimsMap, setClaimsMap] = useState({});
  const [expandedRows, setExpandedRows] = useState([]);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [vendorToVerify, setVendorToVerify] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [verificationFilter, setVerificationFilter] = useState('all');

  // Fetch business claims
  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const claimsSnapshot = await getDocs(collection(db, 'businessClaims'));
        const claims = {};
        claimsSnapshot.forEach((doc) => {
          claims[doc.data().userId] = doc.data();
        });
        setClaimsMap(claims);
      } catch (error) {
        console.error("Error fetching business claims:", error);
      }
    };

    fetchClaims();
  }, []);

  // Filter vendors based on search term and verification level
  useEffect(() => {
    let result = [...vendors];
    
    // Apply search filter
    if (searchTerm) {
      result = result.filter(vendor => 
        vendor.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply verification filter
    if (verificationFilter !== 'all') {
      result = result.filter(vendor => vendor.verificationLevel === verificationFilter);
    }
    
    setFilteredVendors(result);
  }, [vendors, searchTerm, verificationFilter]);

  // Toggle row expansion
  const toggleRow = (vendorId) => {
    setExpandedRows((prev) =>
      prev.includes(vendorId) ? prev.filter((id) => id !== vendorId) : [...prev, vendorId]
    );
  };

  // Open verification modal for a vendor
  const openVerificationModal = (vendor) => {
    setVendorToVerify(vendor);
    setIsVerificationModalOpen(true);
  };

  // Update vendor verification level
  const updateVerificationLevel = async (vendorId, newLevel) => {
    try {
      const vendorRef = doc(db, "vendors", vendorId);
      await updateDoc(vendorRef, {
        verificationLevel: newLevel
      });
      
      // Close modal and reset state
      setIsVerificationModalOpen(false);
      setVendorToVerify(null);
      
      // Update local state (needs to be handled by the parent component)
    } catch (error) {
      console.error("Error updating verification level:", error);
    }
  };

  // Get badge class based on verification level
  const getVerificationBadgeClass = (level) => {
    switch (level) {
      case 'premium':
        return 'bg-gradient-to-r from-green-500 to-emerald-600 text-white';
      case 'enhanced':
        return 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white';
      case 'standard':
        return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
      case 'none':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get verification level label
  const getVerificationLabel = (level) => {
    switch (level) {
      case 'premium':
        return 'Premium';
      case 'enhanced':
        return 'Išplėstinis';
      case 'standard':
        return 'Standartinis';
      case 'none':
      default:
        return 'Nepatikrintas';
    }
  };

  // Verification Modal Component
  const VerificationModal = () => {
    if (!vendorToVerify) return null;
    
    const verificationLevels = [
      { id: 'none', label: 'Nepatikrintas', description: 'Jokių patikrinimų nebuvo atlikta' },
      { id: 'standard', label: 'Standartinis', description: 'Patikrintas el. paštas ir telefonas' },
      { id: 'enhanced', label: 'Išplėstinis', description: 'Patikrinti dokumentai ir verslo informacija' },
      { id: 'premium', label: 'Premium', description: 'Pilnai patikrinta, įskaitant fizinį patikrinimą' }
    ];
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Keisti patikrinimo lygį - {vendorToVerify.name}
          </h3>
          
          <div className="space-y-4 mb-6">
            {verificationLevels.map(level => (
              <div 
                key={level.id}
                onClick={() => updateVerificationLevel(vendorToVerify.id, level.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  vendorToVerify.verificationLevel === level.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {level.label}
                    </div>
                    <div className="text-sm text-gray-500">
                      {level.description}
                    </div>
                  </div>
                  
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getVerificationBadgeClass(level.id)}`}>
                    {level.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsVerificationModalOpen(false)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Atšaukti
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Main component rendering
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Table header with search and filters */}
      <div className="p-5 border-b border-gray-200 bg-gray-50">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-3 md:space-y-0">
          <h2 className="text-lg font-medium text-gray-900">
            Pardavėjų sąrašas
          </h2>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Ieškoti..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            
            <select
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">Visi patikros lygiai</option>
              <option value="none">Nepatikrinti</option>
              <option value="standard">Standartinis</option>
              <option value="enhanced">Išplėstinis</option>
              <option value="premium">Premium</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Main table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Plėsti
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  <span>Pavadinimas</span>
                  {sortField === 'name' && (
                    <span className="ml-2">
                      {sortDirection === 'asc' ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('city')}
              >
                <div className="flex items-center">
                  <span>Miestas</span>
                  {sortField === 'city' && (
                    <span className="ml-2">
                      {sortDirection === 'asc' ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kontaktai
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paslaugos
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort('verificationLevel')}
              >
                <div className="flex items-center">
                  <span>Patikrinimas</span>
                  {sortField === 'verificationLevel' && (
                    <span className="ml-2">
                      {sortDirection === 'asc' ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </span>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Veiksmai
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredVendors.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-10 text-center text-gray-500">
                  {vendors.length === 0 
                    ? 'Nėra pardavėjų sąraše' 
                    : 'Nerasta pardavėjų pagal pasirinktus filtrus'}
                </td>
              </tr>
            ) : (
              filteredVendors.map((vendor) => (
                <React.Fragment key={vendor.id}>
                  <tr className={`${expandedRows.includes(vendor.id) ? 'bg-blue-50' : 'hover:bg-gray-50'} transition-colors`}>
                    {/* Expand/Collapse button */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button 
                        onClick={() => toggleRow(vendor.id)}
                        className="text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                        aria-label={expandedRows.includes(vendor.id) ? "Suskleisti" : "Išplėsti"}
                      >
                        {expandedRows.includes(vendor.id) ? (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        ) : (
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        )}
                      </button>
                    </td>
                    
                    {/* Name and Logo */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {vendor.logo ? (
                          <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-md overflow-hidden">
                            <img 
                              className="h-12 w-12 object-contain" 
                              src={vendor.logo} 
                              alt={vendor.name} 
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/48?text=No+Logo';
                              }}
                            />
                          </div>
                        ) : (
                          <div className="flex-shrink-0 h-12 w-12 bg-gray-100 flex items-center justify-center rounded-md">
                            <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{vendor.name}</div>
                          <div className="text-xs text-gray-500 mt-1">ID: {vendor.vendorId}</div>
                          <div className="text-xs text-gray-500">{vendor.price}</div>
                        </div>
                      </div>
                    </td>
                    
                    {/* City */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{vendor.city}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        <span className="inline-flex items-center">
                          <svg className="mr-1 h-3 w-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {vendor.processedAt || 'Nežinoma'}
                        </span>
                      </div>
                    </td>
                    
                    {/* Contacts */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <a href={`tel:${vendor.phone}`} className="hover:text-blue-600 flex items-center">
                          <svg className="mr-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          {vendor.phone}
                        </a>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        <a href={`mailto:${vendor.email}`} className="hover:text-blue-600 flex items-center">
                          <svg className="mr-1 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {vendor.email}
                        </a>
                      </div>
                    </td>
                    
                    {/* Services */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {vendor.services?.slice(0, 3).map((service, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {service.length > 15 ? service.substring(0, 15) + '...' : service}
                          </span>
                        ))}
                        {vendor.services?.length > 3 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{vendor.services.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    {/* Verification Level */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getVerificationBadgeClass(vendor.verificationLevel || 'none')}`}>
                        {getVerificationLabel(vendor.verificationLevel || 'none')}
                      </span>
                    </td>
                    
                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => openVerificationModal(vendor)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                        aria-label="Keisti patikrinimo lygį"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVendor(vendor);
                          setIsEditModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedVendor(vendor);
                          setIsDeleteModalOpen(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                  
                  {/* Expanded Row with Business Claims */}
                  {expandedRows.includes(vendor.id) && (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 bg-blue-50 border-b border-gray-200">
                        <div className="bg-white rounded-lg shadow-sm p-4">
                          <h4 className="font-medium text-gray-900 mb-3">Verslo pretenzijos ir informacija</h4>
                          
                          {vendor.userId && claimsMap[vendor.userId] ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2">Kontaktinis asmuo</h5>
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-sm font-medium text-gray-500">Vardas Pavardė:</span>
                                    <span className="text-sm ml-2">{claimsMap[vendor.userId].fullName || 'Nenurodyta'}</span>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-500">El. paštas:</span>
                                    <span className="text-sm ml-2">{claimsMap[vendor.userId].email || 'Nenurodyta'}</span>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-500">Telefonas:</span>
                                    <span className="text-sm ml-2">{claimsMap[vendor.userId].phone || 'Nenurodyta'}</span>
                                  </div>
                                  <div>
                                    <span className="text-sm font-medium text-gray-500">Pareigos:</span>
                                    <span className="text-sm ml-2">{claimsMap[vendor.userId].position || 'Nenurodyta'}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2">Pardavėjo informacija</h5>
                                <div className="space-y-2">
                                  <div>
                                    <span className="text-sm font-medium text-gray-500">Patikrinimo būsena:</span>
                                    <div className="mt-1">
                                      <div className="flex flex-col space-y-1">
                                        <div className="flex items-center">
                                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${vendor.verificationStatus?.email?.verified ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                          <span className="text-sm">El. paštas: {vendor.verificationStatus?.email?.verified ? 'Patvirtintas' : 'Nepatvirtintas'}</span>
                                        </div>
                                                                             <div className="flex items-center">
                                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${vendor.verificationStatus?.documents?.verified ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                          <span className="text-sm">Dokumentai: {vendor.verificationStatus?.documents?.verified ? 'Patvirtinti' : 'Nepatvirtinti'}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${vendor.verificationStatus?.address?.verified ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                          <span className="text-sm">Adresas: {vendor.verificationStatus?.address?.verified ? 'Patvirtintas' : 'Nepatvirtintas'}</span>
                                        </div>
                                        <div className="flex items-center">
                                          <span className={`inline-block w-3 h-3 rounded-full mr-2 ${vendor.verificationStatus?.physicalAudit?.verified ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                          <span className="text-sm">Fizinis patikrinimas: {vendor.verificationStatus?.physicalAudit?.verified ? 'Atliktas' : 'Neatliktas'}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 italic">
                              Nėra susijusių verslo pretenzijų informacijos
                            </div>
                          )}
                          
                          {/* Additional vendor information */}
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <h5 className="font-medium text-gray-700 mb-2">Papildoma informacija</h5>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* Business hours */}
                              <div>
                                <h6 className="text-sm font-medium text-gray-600 mb-1">Darbo valandos:</h6>
                                <div className="space-y-1 text-xs">
                                  {vendor.businessHours?.monday && !vendor.businessHours?.monday.isClosed && (
                                    <div className="flex justify-between">
                                      <span>Pirmadienis:</span>
                                      <span>{vendor.businessHours.monday.open} - {vendor.businessHours.monday.close}</span>
                                    </div>
                                  )}
                                  {vendor.businessHours?.tuesday && !vendor.businessHours?.tuesday.isClosed && (
                                    <div className="flex justify-between">
                                      <span>Antradienis:</span>
                                      <span>{vendor.businessHours.tuesday.open} - {vendor.businessHours.tuesday.close}</span>
                                    </div>
                                  )}
                                  {vendor.businessHours?.wednesday && !vendor.businessHours?.wednesday.isClosed && (
                                    <div className="flex justify-between">
                                      <span>Trečiadienis:</span>
                                      <span>{vendor.businessHours.wednesday.open} - {vendor.businessHours.wednesday.close}</span>
                                    </div>
                                  )}
                                  {vendor.businessHours?.thursday && !vendor.businessHours?.thursday.isClosed && (
                                    <div className="flex justify-between">
                                      <span>Ketvirtadienis:</span>
                                      <span>{vendor.businessHours.thursday.open} - {vendor.businessHours.thursday.close}</span>
                                    </div>
                                  )}
                                  {vendor.businessHours?.friday && !vendor.businessHours?.friday.isClosed && (
                                    <div className="flex justify-between">
                                      <span>Penktadienis:</span>
                                      <span>{vendor.businessHours.friday.open} - {vendor.businessHours.friday.close}</span>
                                    </div>
                                  )}
                                  {vendor.businessHours?.saturday && !vendor.businessHours?.saturday.isClosed && (
                                    <div className="flex justify-between">
                                      <span>Šeštadienis:</span>
                                      <span>{vendor.businessHours.saturday.open} - {vendor.businessHours.saturday.close}</span>
                                    </div>
                                  )}
                                  {vendor.businessHours?.sunday && !vendor.businessHours?.sunday.isClosed && (
                                    <div className="flex justify-between">
                                      <span>Sekmadienis:</span>
                                      <span>{vendor.businessHours.sunday.open} - {vendor.businessHours.sunday.close}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              {/* Trust metrics */}
                              <div>
                                <h6 className="text-sm font-medium text-gray-600 mb-1">Pasitikėjimo metrika:</h6>
                                <div className="space-y-1 text-xs">
                                  <div className="flex justify-between">
                                    <span>Bendras įvertinimas:</span>
                                    <span>{vendor.trustMetrics?.overallScore || 0}/10</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Atsako greitis:</span>
                                    <span>{vendor.trustMetrics?.responseRate || 0}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Atsako laikas:</span>
                                    <span>{vendor.trustMetrics?.responseTime || 0} val.</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Profilio užbaigimas:</span>
                                    <span>{vendor.trustMetrics?.profileCompleteness || 0}%</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Įmonės amžius:</span>
                                    <span>{vendor.trustMetrics?.yearsInBusiness || 0} m.</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Google Reviews */}
                              <div>
                                <h6 className="text-sm font-medium text-gray-600 mb-1">Google įvertinimai:</h6>
                                {vendor.googleReview ? (
                                  <div className="space-y-1 text-xs">
                                    <div className="flex items-center">
                                      <div className="flex text-yellow-400 mr-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                          <svg 
                                            key={star}
                                            className={`h-4 w-4 ${star <= Math.round(vendor.googleReview.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                                            xmlns="http://www.w3.org/2000/svg" 
                                            viewBox="0 0 20 20" 
                                            fill="currentColor"
                                          >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                        ))}
                                      </div>
                                      <span>{vendor.googleReview.rating}/5</span>
                                      <span className="ml-2">({vendor.googleReview.reviewCount} atsiliepimai)</span>
                                    </div>
                                    
                                    {vendor.googleReview.reviews && vendor.googleReview.reviews.length > 0 && (
                                      <div className="mt-2 p-2 bg-gray-50 rounded-md">
                                        <div className="text-xs italic">
                                          "{vendor.googleReview.reviews[0].text}"
                                          <div className="mt-1 font-medium text-gray-700">
                                            — {vendor.googleReview.reviews[0].author}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-500 italic">
                                    Nėra įvertinimų
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Services list */}
                          {vendor.services && vendor.services.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h5 className="font-medium text-gray-700 mb-2">Visos paslaugos</h5>
                              <div className="flex flex-wrap gap-2">
                                {vendor.services.map((service, index) => (
                                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {service}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Vendor description */}
                          {vendor.description && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h5 className="font-medium text-gray-700 mb-2">Aprašymas</h5>
                              <p className="text-sm text-gray-600">{vendor.description}</p>
                            </div>
                          )}
                          
                          {/* Team members */}
                          {vendor.team && vendor.team.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h5 className="font-medium text-gray-700 mb-2">Komanda</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {vendor.team.map((member) => (
                                  <div key={member.id} className="flex items-center p-2 bg-gray-50 rounded-lg">
                                    {member.photoUrl ? (
                                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200">
                                        <img 
                                          src={member.photoUrl}
                                          alt={member.name}
                                          className="h-10 w-10 object-cover"
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'https://via.placeholder.com/40?text=No+Photo';
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                      </div>
                                    )}
                                    <div className="ml-3">
                                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                      <div className="text-xs text-gray-500">{member.position}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Verification Modal */}
      {isVerificationModalOpen && (
        <VerificationModal />
      )}
    </div>
  );
};

export default EnhancedVendorsTable;