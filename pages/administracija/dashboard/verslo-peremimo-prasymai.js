// pages/administracija/dashboard/Verslo-peremimo-prasymai.js
import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  getFirestore, collection, getDocs, doc, getDoc, updateDoc, writeBatch,
  query, where, orderBy, Timestamp, serverTimestamp, limit, arrayUnion
} from 'firebase/firestore';
import AdminHeader from '../../../components/Administracija/AdminHeader';
import Footer from '../../../components/Footer';
import { useAdminAuth } from '../../../components/Contexts/AdminAuthContext';

const VersloPeremimoPrasymai = () => {
  // State for claims and UI
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending'); // Default to showing pending requests
  const [sortBy, setSortBy] = useState('date'); // 'date', 'business', 'status'
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc', 'desc'
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Get admin user and router
  const { adminUser, loading: authLoading } = useAdminAuth();
  const router = useRouter();
  const db = getFirestore();

  // Check if user is authenticated and redirect if not
  useEffect(() => {
    if (!authLoading && !adminUser) {
      router.push('/administracija/login');
    }
  }, [adminUser, authLoading, router]);

  // Fetch claims data - UPDATED to use businessClaims collection
  useEffect(() => {
    if (!adminUser) return;

    const fetchClaims = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Updated to use businessClaims collection instead of claims
        let claimsQuery;
        
        if (statusFilter !== 'all') {
          claimsQuery = query(
            collection(db, 'businessClaims'), 
            where('status', '==', statusFilter),
            orderBy('createdAt', 'desc')
          );
        } else {
          claimsQuery = query(
            collection(db, 'businessClaims'),
            orderBy('createdAt', 'desc')
          );
        }
        
        console.log('Fetching business claims with filter:', statusFilter);
        const snapshot = await getDocs(claimsQuery);
        let claimsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        console.log(`Fetched ${claimsData.length} business claims from Firestore`);
        
        // Apply client-side sorting
        if (sortBy === 'business') {
          claimsData = claimsData.sort((a, b) => {
            const nameA = (a.businessName || '').toLowerCase();
            const nameB = (b.businessName || '').toLowerCase();
            return sortDirection === 'asc' 
              ? nameA.localeCompare(nameB)
              : nameB.localeCompare(nameA);
          });
        } else if (sortBy === 'status') {
          claimsData = claimsData.sort((a, b) => {
            const statusOrder = { pending: 0, approved: 1, rejected: 2 };
            const orderA = statusOrder[a.status] || 0;
            const orderB = statusOrder[b.status] || 0;
            return sortDirection === 'asc' 
              ? orderA - orderB
              : orderB - orderA;
          });
        } else if (sortBy === 'date' && sortDirection === 'asc') {
          // Date is already sorted desc from Firestore, reverse if asc is needed
          claimsData = claimsData.reverse();
        }
        
        setClaims(claimsData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching business claims:', error);
        setError('Klaida gaunant verslo prašymus. Bandykite dar kartą.');
        setLoading(false);
      }
    };
    
    fetchClaims();
  }, [adminUser, db, statusFilter, sortBy, sortDirection]);

// The handleApproveClaim function stays mostly the same as you provided
const handleApproveClaim = async (claimId) => {
  if (processingId) return; // Prevent multiple simultaneous actions
  
  try {
    setProcessingId(claimId);
    
    // 1. Get the claim data
    const claimRef = doc(db, 'businessClaims', claimId);
    const claimSnapshot = await getDoc(claimRef);
    
    if (!claimSnapshot.exists()) {
      throw new Error('Prašymas nerastas');
    }
    
    const claimData = claimSnapshot.data();
    const userId = claimData.userId;
    const vendorId = claimData.vendorId || claimData.businessId;
    
    if (!vendorId) {
      throw new Error('Verslo ID nerastas prašyme');
    }
    
    // 2. Start a batch write
    const batch = writeBatch(db);
    
    // 3. Update the claim status
    batch.update(claimRef, {
      status: 'approved',
      processedBy: adminUser.uid,
      processedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // 4. Get the vendor document
    const vendorRef = doc(db, 'vendors', vendorId);
    const vendorSnapshot = await getDoc(vendorRef);
    
    if (!vendorSnapshot.exists()) {
      throw new Error('Verslas nerastas');
    }
    
    // 5. Update the vendor with the new owner
    batch.update(vendorRef, {
      ownerUid: userId, // Update owner to the user who claimed it (using ownerUid as per your schema)
      isVerified: true, // Mark as verified
      updatedAt: serverTimestamp(),
      verifiedBy: adminUser.uid, // Add verification details
      verifiedAt: serverTimestamp()
    });
    
    // 6. Create an admin log entry
    const logRef = doc(collection(db, 'adminLogs'));
    batch.set(logRef, {
      action: 'business_claim_approved',
      adminId: adminUser.uid,
      adminEmail: adminUser.email || 'Unknown',
      vendorId: vendorId,
      vendorName: vendorSnapshot.data().name || 'Nenustatytas',
      newOwnerId: userId,
      previousOwnerId: vendorSnapshot.data().ownerUid || null,
      claimId: claimId,
      timestamp: serverTimestamp()
    });
    
    // 7. Create notification for the user
    const notificationRef = doc(collection(db, 'notifications'));
    batch.set(notificationRef, {
      type: 'business_claim_approved',
      userId: userId,
      vendorId: vendorId,
      vendorName: vendorSnapshot.data().name || 'Nenustatytas',
      title: 'Verslo prašymas patvirtintas',
      message: `Jūsų prašymas perimti verslą "${vendorSnapshot.data().name || 'Nenustatytas'}" buvo patvirtintas.`,
      isRead: false,
      createdAt: serverTimestamp()
    });
    
    // 8. Execute all the batched writes
    await batch.commit();
    
    // 9. Update local state
    setClaims(claims.map(claim => 
      claim.id === claimId 
        ? { ...claim, status: 'approved', processedAt: new Date(), processedBy: adminUser.uid }
        : claim
    ));
    
    setProcessingId(null);
    
    // 10. Show success message
    setSuccessMessage(`Verslo perėmimo prašymas patvirtintas. Verslas "${vendorSnapshot.data().name || 'Nenustatytas'}" priskirtas naujam savininkui.`);
    setTimeout(() => setSuccessMessage(null), 5000);
    
  } catch (error) {
    console.error('Error approving claim:', error);
    setProcessingId(null);
    setError(`Klaida tvirtinant prašymą: ${error.message}`);
  }
};
  // Handle claim rejection - UPDATED to use businessClaims collection
  const handleRejectClaim = async (claimId) => {
    if (processingId) return; // Prevent multiple simultaneous actions
    
    try {
      setProcessingId(claimId);
      // Updated reference to businessClaims collection
      const claimRef = doc(db, 'businessClaims', claimId);
      await updateDoc(claimRef, {
        status: 'rejected',
        processedBy: adminUser.uid,
        processedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setClaims(claims.map(claim => 
        claim.id === claimId 
          ? { ...claim, status: 'rejected', processedAt: new Date(), processedBy: adminUser.uid }
          : claim
      ));
      
      setProcessingId(null);
      // Show success notification here if needed
    } catch (error) {
      console.error('Error rejecting claim:', error);
      setProcessingId(null);
      setError('Klaida atmetant prašymą. Bandykite dar kartą.');
    }
  };

  // Handle opening claim details modal
  const openClaimModal = (claim) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
  };

  // Format date function
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Nežinoma';
    
    let date;
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      // Firestore Timestamp
      date = timestamp.toDate();
    } else if (timestamp instanceof Date) {
      // JavaScript Date
      date = timestamp;
    } else if (typeof timestamp === 'object' && timestamp.seconds) {
      // Firestore timestamp in object form
      date = new Date(timestamp.seconds * 1000);
    } else {
      // Try to parse as string or number
      date = new Date(timestamp);
    }
    
    if (isNaN(date.getTime())) {
      return 'Nežinoma';
    }
    
    return date.toLocaleDateString('lt-LT', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.05
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
  // Render loading state
  if (authLoading) {
    return <div className="flex items-center justify-center min-h-screen">Kraunama...</div>;
  }
  
  if (!adminUser) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>Verslo perėmimo prašymai | Administravimo skydas</title>
      </Head>
      
      <main className="flex-grow pt-24 pb-10 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <motion.h1 
              className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Verslo perėmimo prašymai
            </motion.h1>
            
            <motion.div
              className="mt-4 md:mt-0 flex flex-wrap gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 self-center mr-2">
                Filtruoti:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="all">Visi prašymai</option>
                <option value="pending">Laukiantys</option>
                <option value="approved">Patvirtinti</option>
                <option value="rejected">Atmesti</option>
              </select>
            </motion.div>
          </div>
          
          {/* Error display */}
          {error && (
            <motion.div 
              className="mt-4 bg-red-50 border-l-4 border-red-400 p-4 dark:bg-red-900 dark:border-red-700"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400 dark:text-red-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Success message display */}
{successMessage && (
  <motion.div 
    className="mt-4 bg-green-50 border-l-4 border-green-400 p-4 dark:bg-green-900 dark:border-green-700"
    initial={{ opacity: 0, y: -10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-green-400 dark:text-green-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <p className="text-sm text-green-700 dark:text-green-300">
          {successMessage}
        </p>
      </div>
    </div>
  </motion.div>
)}
          
          {/* Claims List */}
          <motion.div
            className="mt-8 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {loading ? (
              <div className="p-6 text-center">
                <svg className="animate-spin h-10 w-10 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-2">Kraunami verslo perėmimo prašymai...</p>
              </div>
            ) : claims.length > 0 ? (
              <>
                {/* Table Header */}
                <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div 
                      className="w-1/3 cursor-pointer text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      onClick={() => handleSortChange('business')}
                    >
                      <div className="flex items-center">
                        <span>Įmonės pavadinimas</span>
                        {sortBy === 'vendorName' && (
                          <svg 
                            className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div 
                      className="w-1/4 cursor-pointer text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      onClick={() => handleSortChange('date')}
                    >
                      <div className="flex items-center">
                        <span>Pateikimo data</span>
                        {sortBy === 'date' && (
                          <svg 
                            className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div 
                      className="w-1/5 cursor-pointer text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                      onClick={() => handleSortChange('status')}
                    >
                      <div className="flex items-center">
                        <span>Statusas</span>
                        {sortBy === 'status' && (
                          <svg 
                            className={`ml-1 h-4 w-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </div>
                    <div className="w-1/5 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Veiksmai
                    </div>
                  </div>
                </div>
                
                {/* Table Body */}
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {claims.map((claim) => (
                    <motion.li 
                      key={claim.id} 
                      variants={itemVariants}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
                    >
                      <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                        <div className="w-1/3">
                          <div className="text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                            {claim.vendorId || 'Įmonės pavadinimas nenustatytas'}
                          </div>
                          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            Kontaktas: {claim.fullName || 'Nenustatyta'} ({claim.email || 'El. paštas nenustatytas'})
                          </div>
                        </div>
                        <div className="w-1/4 text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(claim.createdAt)}
                        </div>
                        <div className="w-1/5">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${claim.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                              : claim.status === 'approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                            }`}
                          >
                            {claim.status === 'pending' ? 'Laukiantis'
                              : claim.status === 'approved' ? 'Patvirtintas'
                              : 'Atmestas'}
                          </span>
                        </div>
                        <div className="w-1/5 flex justify-end gap-2">
                          <button
                            onClick={() => openClaimModal(claim)}
                            className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 text-xs font-medium rounded shadow-sm text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Peržiūrėti
                          </button>
                          
                          {claim.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveClaim(claim.id)}
                                disabled={processingId === claim.id}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                              >
                                {processingId === claim.id ? 'Vykdoma...' : 'Patvirtinti'}
                              </button>
                              <button
                                onClick={() => handleRejectClaim(claim.id)}
                                disabled={processingId === claim.id}
                                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                              >
                                {processingId === claim.id ? 'Vykdoma...' : 'Atmesti'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </>
            ) : (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                Nėra verslo perėmimo prašymų pagal pasirinktus filtrus
              </div>
            )}
            
            {claims.length > 0 && (
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-center">
                <Link 
                  href="/administracija/dashboard/claims" 
                  className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                >
                  Peržiūrėti visus prašymus &rarr;
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </main>
      
      {/* Modal for claim details */}
      {isModalOpen && selectedClaim && (
        <div className="fixed z-50 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                      Prašymo informacija
                    </h3>
                    <div className="mt-4">
                      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-t-md">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Įmonės pavadinimas</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                          {selectedClaim.vendorName || 'Nenustatyta'}
                        </dd>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Kontaktinis asmuo</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                          {selectedClaim.fullName || 'Nenustatyta'}
                        </dd>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">El. paštas</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                          {selectedClaim.email || 'Nenustatyta'}
                        </dd>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Telefono numeris</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                          {selectedClaim.phone || 'Nenustatyta'}
                        </dd>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Pateikimo data</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                          {formatDate(selectedClaim.createdAt)}
                        </dd>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Statusas</dt>
                        <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${selectedClaim.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                              : selectedClaim.status === 'approved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                            }`}
                          >
                            {selectedClaim.status === 'pending' ? 'Laukiantis'
                              : selectedClaim.status === 'approved' ? 'Patvirtintas'
                              : 'Atmestas'}
                          </span>
                        </dd>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Pagrindimas</dt>
                        <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                          {selectedClaim.verificationMethod || 'Nenustatyta'}
                        </dd>
                      </div>
                      
                      {selectedClaim.additionalInfo && (
                        <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-b-md">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Papildoma informacija</dt>
                          <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                            {selectedClaim.proofDescription || 'Nenurodyta'}
                          </dd>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Modal footer */}
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {selectedClaim.status === 'pending' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleApproveClaim(selectedClaim.id);
                        setIsModalOpen(false);
                      }}
                      disabled={processingId === selectedClaim.id}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      Patvirtinti
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleRejectClaim(selectedClaim.id);
                        setIsModalOpen(false);
                      }}
                      disabled={processingId === selectedClaim.id}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                    >
                      Atmesti
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Uždaryti
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default VersloPeremimoPrasymai;