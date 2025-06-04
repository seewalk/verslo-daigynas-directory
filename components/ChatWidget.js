// components/ChatWidget.js
import React, { useState, useEffect } from 'react';
import ServiceRequestModal from './Users/ServiceRequestModal';
import RequestSubmissionAndUserChat from './Chat/RequestSubmissionAndUserChat';
import VendorInboxAndResponderChat from './Chat/VendorInboxAndResponderChat';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { countUserUnreadMessages, countVendorUnreadMessages } from './Chat/ChatUtils';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [widgetMode, setWidgetMode] = useState('closed'); // 'closed', 'form', 'chat'
  const [user, setUser] = useState(null);
  const [isVendor, setIsVendor] = useState(false);
  const [vendorIds, setVendorIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userUnreadCount, setUserUnreadCount] = useState(0);
  const [vendorUnreadCount, setVendorUnreadCount] = useState(0);
  
  const auth = getAuth();
  const db = getFirestore();

  // Check if user is authenticated and determine if they're a vendor
  useEffect(() => {
    const checkUserStatus = async (currentUser) => {
      if (!currentUser) {
        setIsVendor(false);
        setVendorIds([]);
        setLoading(false);
        return;
      }

      try {
        console.log("Checking user status for:", currentUser.uid);
        
        // Check if user has any approved business claims (vendor status)
        const claimsQuery = query(
          collection(db, "businessClaims"),
          where("userId", "==", currentUser.uid),
          where("status", "==", "approved")
        );
        
        const claimsSnapshot = await getDocs(claimsQuery);
        
        if (!claimsSnapshot.empty) {
          console.log(`Found ${claimsSnapshot.size} approved business claims`);
          const foundVendorIds = claimsSnapshot.docs.map(doc => doc.data().vendorId);
          setVendorIds(foundVendorIds);
          setIsVendor(true);
          
          // Get unread count for vendor
          const vendorUnread = await countVendorUnreadMessages(db, foundVendorIds);
          setVendorUnreadCount(vendorUnread);
        } else {
          console.log("No approved business claims found");
          setVendorIds([]);
          setIsVendor(false);
        }
        
        // Always check for user unread messages
        const userUnread = await countUserUnreadMessages(db, currentUser.uid);
        setUserUnreadCount(userUnread);
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking user status:", error);
        setIsVendor(false);
        setVendorIds([]);
        setLoading(false);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed, user:", currentUser?.uid);
      setUser(currentUser);
      if (currentUser) {
        checkUserStatus(currentUser);
      } else {
        setIsVendor(false);
        setVendorIds([]);
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [auth, db]);

  const handleButtonClick = () => {
    if (widgetMode === 'closed') {
      setWidgetMode(user ? 'chat' : 'form'); // If logged in, show chat, otherwise show form
    } else {
      setWidgetMode('closed');
    }
  };

  // Handle successful request submission
  const handleRequestSubmitted = () => {
    if (user) {
      // If user is logged in, switch to chat view to see the new request
      setWidgetMode('chat');
    } else {
      // If not logged in, just close the widget
      setWidgetMode('closed');
    }
  };

  return (
    <>
      {/* Fixed button */}
      <div className="fixed bottom-6 right-6 z-[1000]">
        <button
          onClick={handleButtonClick}
          className="bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-full shadow-lg flex items-center justify-center w-14 h-14 transition-all"
          aria-label={widgetMode === 'closed' ? 'Atidaryti pokalbį' : 'Uždaryti pokalbį'}
        >
          {widgetMode === 'closed' ? (
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          ) : (
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </button>
      </div>

      {/* Widget panel with animated transition */}
      {widgetMode !== 'closed' && (
        <div className="fixed bottom-24 right-6 w-[90vw] sm:w-[80vw] max-w-4xl h-[70vh] max-h-[800px] bg-white rounded-lg shadow-2xl overflow-hidden z-[1000] border border-gray-200 animate-fade-in flex flex-col">
          {widgetMode === 'form' ? (
            <div className="h-full flex flex-col">
              <div className="bg-amber-100 p-4 flex justify-between items-center">
                <h3 className="font-semibold">Nauja paslaugų užklausa</h3>
                <button 
                  onClick={() => setWidgetMode('closed')}
                  className="text-gray-500 hover:text-gray-800 transition-colors"
                  aria-label="Uždaryti"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex-grow overflow-auto">
                <ServiceRequestModal
                  isOpen={true}
                  onClose={() => setWidgetMode('closed')}
                  vendorId="universal"
                  vendorName="Pagalbos centras"
                  isWidget={true}
                  onRequestSubmitted={handleRequestSubmitted}
                />
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="bg-amber-100 p-4 flex justify-between items-center">
                <h3 className="font-semibold">
                  {isVendor ? 'Paslaugų Užklausos' : 'Mano užklausos'}
                </h3>
                <div className="flex">
                  {!isVendor && (
                    <button 
                      onClick={() => setWidgetMode('form')}
                      className="text-amber-700 hover:text-amber-900 bg-amber-200 rounded-lg px-3 py-1 text-sm mr-2 transition-colors"
                    >
                      + Nauja užklausa
                    </button>
                  )}
                  <button 
                    onClick={() => setWidgetMode('closed')}
                    className="text-gray-500 hover:text-gray-800 transition-colors"
                    aria-label="Uždaryti"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Content with flex structure - This is the key change for proper scrolling */}
              <div className="flex-grow flex flex-col overflow-hidden">
                {loading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                    <p className="ml-2">Kraunama...</p>
                  </div>
                ) : user ? (
                  <>
                    {/* Tabs */}
<div className="flex border-b border-gray-200">
  <button
    className={`flex-1 py-2 px-4 ${!isVendor ? 'font-medium text-amber-600 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700'} relative`}
    onClick={() => setIsVendor(false)}
  >
    Mano Užklausos
    {userUnreadCount > 0 && (
      <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {userUnreadCount > 9 ? '9+' : userUnreadCount}
      </span>
    )}
  </button>
  {vendorIds.length > 0 && (
    <button
      className={`flex-1 py-2 px-4 ${isVendor ? 'font-medium text-amber-600 border-b-2 border-amber-500' : 'text-gray-500 hover:text-gray-700'} relative`}
      onClick={() => setIsVendor(true)}
    >
      Gautos Užklausos
      {vendorUnreadCount > 0 && (
        <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {vendorUnreadCount > 9 ? '9+' : vendorUnreadCount}
        </span>
      )}
    </button>
  )}
</div>
                    
                    {/* Chat content with overflow handling */}
                    <div className="flex-grow overflow-hidden">
  {isVendor ? (
    <VendorInboxAndResponderChat 
      user={user} 
      vendorIds={vendorIds}
    />
  ) : (
    <RequestSubmissionAndUserChat 
      user={user}
    />
  )}
</div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-6">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <h3 className="text-lg font-medium mt-4 text-gray-700">Prisijunkite, kad peržiūrėtumėte užklausas</h3>
                    <p className="text-gray-500 text-center mt-2">
                      Jūs nesate prisijungę. Prašome prisijungti, kad galėtumėte matyti savo užklausų istoriją.
                    </p>
                    <button
                      onClick={() => setWidgetMode('form')}
                      className="mt-4 bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
                    >
                      Siųsti naują užklausą
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add fade-in animation CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};

export default ChatWidget;