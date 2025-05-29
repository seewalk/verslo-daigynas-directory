// components/Administracija/withAdminAuth.js
import React from 'react';
import { useRouter } from 'next/router';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import AdminLoginModal from './Prisijungimas';

export const withAdminAuth = (Component) => {
  return function ProtectedComponent(props) {
    const { adminUser, loading, isAdmin } = useAdminAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const router = useRouter();
    
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
    
    // If admin, render the protected component
    return <Component {...props} />;
  };
};
