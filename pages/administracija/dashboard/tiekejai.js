// pages/administracija/dashboard/tiekejai.js
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { useAdminAuth } from '../../../components/Contexts/AdminAuthContext';
import EnhancedVendorsTable from '../../../components/Administracija/EnhancedVendorsTable';
import Header from '../../../components/Header';

const VENDORS_PER_PAGE = 10;

const TiekejaiPage = () => {
  const { adminUser, isAdmin, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteConfirmed, setIsDeleteConfirmed] = useState(false);
  const db = getFirestore();
  
  // Check admin authentication
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/administracija/login');
    }
  }, [isAdmin, authLoading, router]);
  
  // Fetch vendors data
  useEffect(() => {
    const fetchVendors = async () => {
      if (!isAdmin) return;
      
      setLoading(true);
      try {
        const vendorsRef = collection(db, 'vendors');
        const q = query(
          vendorsRef,
          orderBy(sortField, sortDirection),
          limit(VENDORS_PER_PAGE)
        );
        
        const querySnapshot = await getDocs(q);
        const vendorsData = [];
        
        querySnapshot.forEach((doc) => {
          vendorsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setVendors(vendorsData);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === VENDORS_PER_PAGE);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching vendors:', err);
        setError('Klaida gaunant pardavėjų duomenis');
        setLoading(false);
      }
    };
    
    if (isAdmin) {
      fetchVendors();
    }
  }, [isAdmin, db, sortField, sortDirection]);
  
  // Load more vendors
  const handleLoadMore = async () => {
    if (!lastVisible || !hasMore) return;
    
    try {
      const vendorsRef = collection(db, 'vendors');
      const q = query(
        vendorsRef,
        orderBy(sortField, sortDirection),
        startAfter(lastVisible),
        limit(VENDORS_PER_PAGE)
      );
      
      const querySnapshot = await getDocs(q);
      const newVendorsData = [];
      
      querySnapshot.forEach((doc) => {
        newVendorsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      if (newVendorsData.length > 0) {
        setVendors([...vendors, ...newVendorsData]);
        setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
        setHasMore(querySnapshot.docs.length === VENDORS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Error fetching more vendors:', err);
      setError('Klaida gaunant daugiau pardavėjų duomenų');
    }
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Delete vendor
  const handleDeleteVendor = async () => {
    if (!selectedVendor) return;
    
    try {
      await deleteDoc(doc(db, 'vendors', selectedVendor.id));
      setVendors(vendors.filter((v) => v.id !== selectedVendor.id));
      setIsDeleteModalOpen(false);
      setSelectedVendor(null);
      setIsDeleteConfirmed(false);
    } catch (err) {
      console.error('Error deleting vendor:', err);
      setError('Klaida trinant pardavėją');
    }
  };
  
  // Edit vendor modal
  const EditVendorModal = () => {
    if (!selectedVendor) return null;
    
    // Edit vendor modal implementation here
    // (Assuming you have a separate component or implementation for this)
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full p-6 overflow-y-auto max-h-[90vh]">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Redaguoti pardavėją - {selectedVendor.name}
          </h3>
          
          {/* Edit form would go here */}
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Atšaukti
            </button>
            <button
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Išsaugoti
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  // Delete confirmation modal
  const DeleteConfirmationModal = () => {
    if (!selectedVendor) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Ištrinti pardavėją
          </h3>
          
          <p className="text-gray-500 mb-6">
            Ar tikrai norite ištrinti pardavėją <strong>{selectedVendor.name}</strong>? Šis veiksmas negrįžtamas.
          </p>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Atšaukti
            </button>
            <button
              onClick={handleDeleteVendor}
              className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              Ištrinti
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return null; // Redirect handled by useEffect
  }
  
  return (
    <>
      <Head>
        <title>Pardavėjų administravimas | Verslo Daigynas</title>
        <meta name="description" content="Pardavėjų administravimas" />
      </Head>

        <Header />
      
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Pardavėjų administravimas</h1>
          <p className="mt-2 text-sm text-gray-600">
            Peržiūrėkite ir administruokite visus platformos pardavėjus
          </p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        ) : (
          <>
            <EnhancedVendorsTable 
              vendors={vendors}
              handleSort={handleSort}
              sortField={sortField}
              sortDirection={sortDirection}
              setSelectedVendor={setSelectedVendor}
              setIsEditModalOpen={setIsEditModalOpen}
              setIsDeleteModalOpen={setIsDeleteModalOpen}
            />
            
            {hasMore && (
              <div className="mt-6 text-center">
                <button
                  onClick={handleLoadMore}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Rodyti daugiau
                </button>
              </div>
            )}
          </>
        )}
      </div>
      
      {isEditModalOpen && (
        <EditVendorModal />
      )}
      
      {isDeleteModalOpen && (
        <DeleteConfirmationModal />
      )}
    </>
  );
};

export default TiekejaiPage;
