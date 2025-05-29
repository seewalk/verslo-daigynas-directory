// pages/administracija/dashboard.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAdminAuth } from '../../../components/Contexts/AdminAuthContext';
import AdminLoginModal from '../../../components/Administracija/Prisijungimas';
import { getFirestore, collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const AdminDashboard = () => {
  const { adminUser, adminData, loading, isAdmin } = useAdminAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [stats, setStats] = useState({
    totalVendors: 0,
    pendingClaims: 0,
    activeUsers: 0
  });
  const [recentClaims, setRecentClaims] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  
  const router = useRouter();
  const auth = getAuth();
  const db = getFirestore();
  
  // Load dashboard stats
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAdmin) return;
      
      try {
        // Get total vendors count
        const vendorsSnapshot = await getDocs(collection(db, "vendors"));
        
        // Get pending claims
        const claimsQuery = query(
          collection(db, "businessClaims"),
          where("status", "==", "pending")
        );
        const claimsSnapshot = await getDocs(claimsQuery);
        
        // Get recent claims (all statuses)
        const recentClaimsQuery = query(
          collection(db, "businessClaims"),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        const recentClaimsSnapshot = await getDocs(recentClaimsQuery);
        
        // Get active users
        const usersSnapshot = await getDocs(collection(db, "users"));
        
        // Set stats
        setStats({
          totalVendors: vendorsSnapshot.size,
          pendingClaims: claimsSnapshot.size,
          activeUsers: usersSnapshot.size
        });
        
        // Format recent claims
        const claims = [];
        recentClaimsSnapshot.forEach(doc => {
          claims.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate().toLocaleDateString('lt-LT') || 'Nežinoma data'
          });
        });
        setRecentClaims(claims);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [isAdmin, db]);
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.push('/administracija/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  // If not admin, show login modal
  if (!isAdmin) {
    return (
      <>
        <Head>
          <title>Administratoriaus prisijungimas | Verslo Daigynas</title>
        </Head>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Prieiga apribota</h1>
            <p className="text-gray-600 mb-6">
              Šis puslapis prieinamas tik administratoriams. Prisijunkite norėdami tęsti.
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Prisijungti
            </button>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <a 
                href="/" 
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                Grįžti į pagrindinį puslapį
              </a>
            </div>
          </div>
        </div>
        <AdminLoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        />
      </>
    );
  }
  
  // Admin dashboard content
  return (
    <>
      <Head>
        <title>Administratoriaus valdymo skydas | Verslo Daigynas</title>
      </Head>
      
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <img 
                    className="block h-8 w-auto" 
                    src="/logo.svg" 
                    alt="Verslo Daigynas" 
                  />
                </div>
                <div className="ml-6 flex space-x-8">
                  <a
                    href="/administracija/dashboard"
                    className="border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Valdymo skydas
                  </a>
                  <a
                    href="/administracija/claims"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Verslo perėmimo prašymai
                  </a>
                  <a
                    href="/administracija/dashboard/tiekejai"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    Tiekėjai
                  </a>
                </div>
              </div>
              <div className="flex items-center">
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">
                      {adminUser?.email}
                    </span>
                    <button
                      onClick={handleLogout}
                      className="ml-2 bg-gray-100 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <span className="sr-only">Atsijungti</span>
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="py-10">
          <header>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold text-gray-900">
                Administratoriaus valdymo skydas
              </h1>
            </div>
          </header>
          <main>
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
              {/* Stats cards */}
              <div className="mt-8">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Vendors card */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="ml-5">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Tiekėjų skaičius
                            </dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">
                                {loadingStats ? '...' : stats.totalVendors}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <a href="/administracija/dashboard/tiekejai" className="font-medium text-blue-600 hover:text-blue-500">
                          Peržiūrėti visus
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Claims card */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                          </svg>
                        </div>
                        <div className="ml-5">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Laukiantys prašymai
                            </dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">
                                {loadingStats ? '...' : stats.pendingClaims}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <a href="/administracija/claims" className="font-medium text-blue-600 hover:text-blue-500">
                          Peržiūrėti visus
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Users card */}
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <div className="ml-5">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Aktyvūs vartotojai
                            </dt>
                            <dd>
                              <div className="text-lg font-medium text-gray-900">
                                {loadingStats ? '...' : stats.activeUsers}
                              </div>
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <a href="/administracija/users" className="font-medium text-blue-600 hover:text-blue-500">
                          Peržiūrėti visus
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent claims */}
              <div className="mt-8">
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Naujausi verslo perėmimo prašymai
                    </h3>
                  </div>
                  {loadingStats ? (
                    <div className="flex justify-center items-center h-32">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  ) : recentClaims.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {recentClaims.map((claim) => (
                        <li key={claim.id}>
                          <a href={`/administracija/verslo-peremimo-prasymai/${claim.id}`} className="block hover:bg-gray-50">
                            <div className="px-4 py-4 sm:px-6">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <p className="text-sm font-medium text-blue-600 truncate">
                                    {claim.vendorName || 'Nežinomas'}
                                  </p>
                                  <div className="ml-2 flex-shrink-0 flex">
                                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                      claim.status === 'pending' 
                                        ? 'bg-yellow-100 text-yellow-800' 
                                        : claim.status === 'approved' 
                                          ? 'bg-green-100 text-green-800'
                                          : 'bg-red-100 text-red-800'
                                    }`}>
                                      {claim.status === 'pending' 
                                        ? 'Laukiantis' 
                                        : claim.status === 'approved' 
                                          ? 'Patvirtintas'
                                          : 'Atmestas'}
                                    </p>
                                  </div>
                                </div>
                                <div className="ml-2 flex-shrink-0 flex">
                                  <span className="text-sm text-gray-500">
                                    {claim.createdAt}
                                  </span>
                                </div>
                              </div>
                              <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                  <p className="flex items-center text-sm text-gray-500">
                                    {claim.fullName}
                                  </p>
                                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                    {claim.position}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-5 text-center text-gray-500 sm:px-6">
                      Nėra verslo perėmimo prašymų.
                    </div>
                  )}
                  {recentClaims.length > 0 && (
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="text-sm">
                        <a href="/administracija/claims" className="font-medium text-blue-600 hover:text-blue-500">
                          Peržiūrėti visus prašymus
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;