// components/Chat/ChatServiceRequestsWidget.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc,
  serverTimestamp,
  onSnapshot,
  collectionGroup,
  writeBatch // Add this import
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ServiceRequestsList from '../Users/ServiceRequestList';

// Utility function to safely format timestamps
const formatTimestamp = (timestamp) => {
  if (!timestamp) return null;
  
  try {
    // If it's a Firestore timestamp with seconds and nanoseconds
    if (typeof timestamp === 'object' && timestamp !== null && 'seconds' in timestamp) {
      return new Date(timestamp.seconds * 1000).toLocaleString('lt-LT');
    }
    
    // If it's already a Date object
    if (timestamp instanceof Date) {
      return timestamp.toLocaleString('lt-LT');
    }
    
    // If it's already a string
    if (typeof timestamp === 'string') {
      return timestamp;
    }
    
    return 'Nenurodyta';
  } catch (error) {
    console.error("Error formatting timestamp:", error);
    return 'Nenurodyta';
  }
};

const ChatServiceRequestsWidget = ({ isVendor = false }) => {
  const [requests, setRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeListeners, setActiveListeners] = useState([]); // Add this to track active listeners
  
  const messagesEndRef = useRef(null);
  const db = getFirestore();
  const auth = getAuth();

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper function to clean up listeners
  const cleanupListeners = () => {
    activeListeners.forEach(listener => {
      if (typeof listener === 'function') {
        try {
          listener();
        } catch (e) {
          console.error("Error cleaning up listener:", e);
        }
      }
    });
    setActiveListeners([]);
  };

  // Authentication check and data loading
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // Clean up existing listeners first
      cleanupListeners();
      
      setUser(currentUser);
      if (currentUser) {
        let listener;
        if (isVendor) {
          listener = await fetchVendorRequests(currentUser.uid);
        } else {
          listener = await fetchUserRequests(currentUser.uid);
        }
        
        if (typeof listener === 'function') {
          setActiveListeners(prev => [...prev, listener]);
        }
      } else {
        setRequests([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      cleanupListeners();
    };
  }, [auth, isVendor]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages when active request changes
  useEffect(() => {
    let messageListener = null;
    
    if (activeRequest) {
      messageListener = loadMessages(activeRequest.id);
      if (typeof messageListener === 'function') {
        setActiveListeners(prev => [...prev, messageListener]);
      }
    } else {
      setMessages([]);
    }
    
    return () => {
      if (typeof messageListener === 'function') {
        try {
          messageListener();
        } catch (e) {
          console.error("Error cleaning up message listener:", e);
        }
      }
    };
  }, [activeRequest]);

  // Handle selecting a request safely
  const handleSelectRequest = (request) => {
    // Make sure all timestamps are properly formatted
    const safeRequest = {
      ...request,
      createdAtFormatted: formatTimestamp(request.createdAt) || request.createdAtFormatted || 'Nenurodyta',
      updatedAtFormatted: formatTimestamp(request.updatedAt) || request.updatedAtFormatted || 'Nenurodyta',
      responseDateFormatted: formatTimestamp(request.responseDate) || request.responseDateFormatted || null
    };
    
    setActiveRequest(safeRequest);
  };

// Fix existing service requests - add more detailed logging
const fixExistingRequests = async (userId, vendorIds) => {
  if (!userId || !vendorIds || vendorIds.length === 0) return;
  
  try {
    console.log("Running fixExistingRequests for user:", userId, "vendors:", vendorIds);
    
    // Find all responded requests without ownerUid
    const requestsToFixQuery = query(
      collection(db, "serviceRequests"),
      where("vendorId", "in", vendorIds)
    );
    
    const snapshot = await getDocs(requestsToFixQuery);
    console.log("Found", snapshot.size, "total vendor requests");
    
    // Filter for requests that need fixing
    const requestsNeedingFix = snapshot.docs.filter(doc => {
      const data = doc.data();
      return (data.status === 'inProgress' || data.status === 'completed') && !data.ownerUid;
    });
    
    console.log("Found", requestsNeedingFix.length, "requests needing owner UID fix");
    
    if (requestsNeedingFix.length === 0) return;
    
    const batch = writeBatch(db);
    requestsNeedingFix.forEach(docSnapshot => {
      console.log("Fixing request:", docSnapshot.id, "with status:", docSnapshot.data().status);
      batch.update(doc(db, "serviceRequests", docSnapshot.id), { 
        ownerUid: userId 
      });
    });
    
    await batch.commit();
    console.log("Fixed", requestsNeedingFix.length, "requests with batch update");
  } catch (error) {
    console.error("Error fixing existing requests:", error);
  }
};


  // Load messages for a specific request
  const loadMessages = async (requestId) => {
    setMessagesLoading(true);
    
    try {
      // Create a query for messages in this request, ordered by timestamp
      const messagesQuery = query(
        collection(db, "serviceRequests", requestId, "messages"),
        orderBy("createdAt", "asc")
      );
      
      // Set up real-time listener for messages
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const loadedMessages = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAtFormatted: formatTimestamp(data.createdAt),
          };
        });
        
        setMessages(loadedMessages);
        setMessagesLoading(false);
        
        // Scroll to bottom after loading messages
        setTimeout(scrollToBottom, 100);
      }, (error) => {
        console.error("Error in messages snapshot:", error);
        setMessagesLoading(false);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error("Error loading messages:", error);
      setError("Nepavyko užkrauti žinučių.");
      setMessagesLoading(false);
      return null;
    }
  };

const fetchVendorRequests = async (userId) => {
  setLoading(true);
  try {
    // First, find all businesses owned by this vendor
    const businessClaimsQuery = query(
      collection(db, "businessClaims"),
      where("userId", "==", userId),
      where("status", "==", "approved")
    );
    
    const businessClaimsSnapshot = await getDocs(businessClaimsQuery);
    const vendorIds = businessClaimsSnapshot.docs.map(doc => doc.data().vendorId);
    
    if (vendorIds.length === 0) {
      setRequests([]);
      setLoading(false);
      return null;
    }
    
    // Use a combination of two queries to find all relevant requests
    const requestsByVendorIdQuery = query(
      collection(db, "serviceRequests"),
      where("vendorId", "in", vendorIds)
    );
    
    // Use getDocs to retrieve all requests
    const requestsSnapshot = await getDocs(requestsByVendorIdQuery);
    
    // Process the requests
    const fetchedRequests = requestsSnapshot.docs.map(docSnapshot => {
      const data = docSnapshot.data();
      return {
        id: docSnapshot.id,
        ...data,
        createdAtFormatted: formatTimestamp(data.createdAt),
        updatedAtFormatted: formatTimestamp(data.updatedAt),
        responseDateFormatted: formatTimestamp(data.responseDate),
        messagePreview: data.requestDetails ? data.requestDetails.substring(0, 60) + '...' : 'No details',
        isRead: true,
      };
    });
    
    setRequests(fetchedRequests);
    setLoading(false);
    
    // Set up real-time listener for future updates
    const unsubscribe = onSnapshot(requestsByVendorIdQuery, (snapshot) => {
      const updatedRequests = snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          ...data,
          createdAtFormatted: formatTimestamp(data.createdAt),
          updatedAtFormatted: formatTimestamp(data.updatedAt),
          responseDateFormatted: formatTimestamp(data.responseDate),
          messagePreview: data.requestDetails ? data.requestDetails.substring(0, 60) + '...' : 'No details',
          isRead: true,
        };
      });
      
      setRequests(updatedRequests);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error("Error setting up requests listener:", error);
    setError("Įvyko klaida. Bandykite vėliau.");
    setLoading(false);
    return null;
  }
};

const fixAllServiceRequests = async () => {
  try {
    // Get all service requests
    const requestsQuery = query(collection(db, "serviceRequests"));
    const snapshot = await getDocs(requestsQuery);
    
    const batch = writeBatch(db);
    let updateCount = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      // If ownerUid is null or not set, use userId
      if (!data.ownerUid && data.userId) {
        batch.update(doc.ref, { ownerUid: data.userId });
        updateCount++;
      }
    });
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`Fixed ${updateCount} service requests`);
    }
  } catch (error) {
    console.error("Error fixing service requests:", error);
  }
};

  // Fetch service requests for a user
  const fetchUserRequests = async (userId) => {
    setLoading(true);
    try {
      const requestsQuery = query(
        collection(db, "serviceRequests"),
        where("userId", "==", userId),
        orderBy("updatedAt", "desc")
      );
      
      // Use onSnapshot for real-time updates
      const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
        const fetchedRequests = snapshot.docs.map(docSnapshot => {
          const data = docSnapshot.data();
          return {
            id: docSnapshot.id,
            ...data,
            createdAtFormatted: formatTimestamp(data.createdAt),
            updatedAtFormatted: formatTimestamp(data.updatedAt),
            responseDateFormatted: formatTimestamp(data.responseDate),
            messagePreview: data.requestDetails ? data.requestDetails.substring(0, 60) + '...' : 'No details',
            isRead: true, // You could add an actual read status later
          };
        });
        
        setRequests(fetchedRequests);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching requests:", error);
        setError("Nepavyko gauti užklausų. Bandykite vėliau.");
        setLoading(false);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error("Error setting up requests listener:", error);
      setError("Įvyko klaida. Bandykite vėliau.");
      setLoading(false);
      return null;
    }
  };

  // Send a new message
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!activeRequest || !messageText.trim()) return;
    
    setSending(true);
    
    try {
      // Create message data object
      const messageData = {
        content: messageText,
        senderType: isVendor ? 'vendor' : 'user',
        senderName: isVendor ? activeRequest.vendorName : activeRequest.userFullName,
        senderUid: user.uid,
        createdAt: serverTimestamp()
      };
      
      // Add the message to the subcollection
      await addDoc(
        collection(db, "serviceRequests", activeRequest.id, "messages"), 
        messageData
      );
      
      // Update the main request document
      const updateData = {
        updatedAt: serverTimestamp(),
        lastMessage: messageText.substring(0, 100),
        lastMessageSender: isVendor ? 'vendor' : 'user',
      };
      
      // Always set ownerUid when a vendor responds
      if (isVendor) {
        updateData.ownerUid = user.uid;
      }
      
      await updateDoc(doc(db, "serviceRequests", activeRequest.id), updateData);
      
      // If this is the first response from the vendor, also update status
      if (isVendor && activeRequest.status === 'pending') {
        await updateDoc(doc(db, "serviceRequests", activeRequest.id), {
          status: 'inProgress',
          responseDate: serverTimestamp()
        });
        
        // Update local state
        setActiveRequest({
          ...activeRequest,
          status: 'inProgress',
          responseDateFormatted: new Date().toLocaleString('lt-LT'),
          ownerUid: user.uid
        });
      }
      
      // Create notification for the recipient
      const notificationData = {
        type: 'service_request_message',
        title: 'Nauja žinutė užklausoje',
        message: `${isVendor ? activeRequest.vendorName : activeRequest.userFullName}: ${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}`,
        userId: isVendor ? activeRequest.userId : null,
        vendorId: !isVendor ? activeRequest.vendorId : null,
        requestId: activeRequest.id,
        read: false,
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, "notifications"), notificationData);
      
      // Clear input field
      setMessageText('');
      setSending(false);
      
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Nepavyko išsiųsti žinutės. Bandykite vėliau.");
      setSending(false);
    }
  };

  // The rest of your code stays the same...
  
  // Loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        <p className="ml-2">Kraunama...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="bg-red-50 text-red-700 p-4 rounded-md w-full">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (requests.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <h3 className="text-lg font-medium mt-4 text-gray-700">Nėra užklausų</h3>
        <p className="text-gray-500 text-center mt-2">
          {isVendor ? 
            'Jūs dar negavote jokių paslaugų užklausų.' : 
            'Jūs dar nesate pateikę jokių paslaugų užklausų.'}
        </p>
      </div>
    );
  }
  
  // The rest of your component rendering code stays the same...
  return (
    <div className="flex h-full overflow-hidden bg-white rounded-lg shadow-lg">
      {/* Chat list sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg">
            {isVendor ? 'Gautos užklausos' : 'Mano užklausos'}
          </h2>
        </div>
        <div className="overflow-y-auto flex-grow">
          {requests.map(request => (
            <div 
              key={request.id} 
              onClick={() => handleSelectRequest(request)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                activeRequest?.id === request.id ? 'bg-amber-50' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-semibold truncate w-4/5">{request.requestTitle}</h3>
                {!request.isRead && <span className="bg-amber-500 rounded-full h-2 w-2"></span>}
              </div>
              <p className="text-gray-600 text-sm truncate">
                {request.lastMessage || request.messagePreview}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500">{request.updatedAtFormatted}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  request.status === 'inProgress' ? 'bg-blue-100 text-blue-800' :
                  request.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {request.status === 'pending' ? 'Laukia' :
                   request.status === 'inProgress' ? 'Vyksta' :
                   request.status === 'completed' ? 'Užbaigta' : 'Nežinoma'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Chat main area */}
      <div className="w-2/3 flex flex-col">
        {activeRequest ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{activeRequest.requestTitle}</h3>
                <p className="text-xs text-gray-500">
                  {isVendor ? activeRequest.userFullName : activeRequest.vendorName} • {activeRequest.createdAtFormatted}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  activeRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  activeRequest.status === 'inProgress' ? 'bg-blue-100 text-blue-800' :
                  activeRequest.status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {activeRequest.status === 'pending' ? 'Laukiama atsakymo' :
                   activeRequest.status === 'inProgress' ? 'Vykdoma' :
                   activeRequest.status === 'completed' ? 'Užbaigta' : 'Nežinoma'}
                </span>
                
                {/* Mark as Completed button for vendors */}
                {isVendor && activeRequest.status === 'inProgress' && (
                  <button
                    onClick={async () => {
                      try {
                        await updateDoc(doc(db, "serviceRequests", activeRequest.id), {
                          status: 'completed',
                          updatedAt: serverTimestamp()
                        });
                        
                        setActiveRequest({
                          ...activeRequest,
                          status: 'completed'
                        });
                      } catch (error) {
                        console.error("Error updating status:", error);
                        setError("Nepavyko pakeisti būsenos.");
                      }
                    }}
                    className="text-xs bg-green-500 text-white rounded-full px-2 py-1 hover:bg-green-600"
                  >
                    Žymėti kaip užbaigtą
                  </button>
                )}
              </div>
            </div>
            
            {/* Chat messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
              {/* Original request message */}
              <div className="flex flex-col max-w-3/4 bg-gray-200 rounded-lg rounded-tl-none p-3 ml-4">
                <div className="flex items-center mb-1">
                  <div className="bg-gray-400 rounded-full h-8 w-8 flex items-center justify-center text-white font-semibold mr-2">
                    {activeRequest.userFullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{activeRequest.userFullName}</p>
                    <p className="text-xs text-gray-600">{activeRequest.createdAtFormatted}</p>
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm whitespace-pre-wrap">{activeRequest.requestDetails}</p>
                  
                  {/* Additional information section */}
                  <div className="mt-3 pt-2 border-t border-gray-300">
                    <p className="text-xs text-gray-600">Kontaktinė informacija:</p>
                    <p className="text-xs">
                      {activeRequest.preferredContactMethod === 'email' ? 'El. paštu' : 'Telefonu'}: {' '}
                      {activeRequest.preferredContactMethod === 'email' ? 
                        <a href={`mailto:${activeRequest.userEmail}`} className="text-blue-600">{activeRequest.userEmail}</a> : 
                        <a href={`tel:${activeRequest.userPhone}`} className="text-blue-600">{activeRequest.userPhone}</a>
                      }
                    </p>
                    <p className="text-xs mt-1">
                      Skubumas: <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                        activeRequest.urgency === 'high' ? 'bg-red-100 text-red-800' :
                        activeRequest.urgency === 'normal' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {activeRequest.urgency === 'high' ? 'Skubu' :
                         activeRequest.urgency === 'normal' ? 'Vidutinis' :
                         'Neskubu'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Loading messages indicator */}
              {messagesLoading && (
                <div className="text-center py-2">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-amber-500"></div>
                  <p className="text-xs text-gray-500 mt-1">Kraunamos žinutės...</p>
                </div>
              )}
              
              {/* Additional messages */}
              {messages.map(message => (
                <div key={message.id} className={`flex ${message.senderType === 'vendor' ? 'justify-end' : ''}`}>
                  <div className={`flex flex-col max-w-3/4 ${message.senderType === 'vendor' ? 'bg-amber-100 rounded-lg rounded-tr-none mr-4' : 'bg-gray-200 rounded-lg rounded-tl-none ml-4'} p-3`}>
                    <div className={`flex items-center mb-1 ${message.senderType === 'vendor' ? 'justify-end' : ''}`}>
                      {message.senderType === 'vendor' ? (
                        <>
                          <div>
                            <p className="font-semibold text-sm text-right">{message.senderName}</p>
                            <p className="text-xs text-gray-600 text-right">{message.createdAtFormatted}</p>
                          </div>
                          <div className="bg-amber-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-semibold ml-2">
                            {message.senderName.charAt(0)}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="bg-gray-400 rounded-full h-8 w-8 flex items-center justify-center text-white font-semibold mr-2">
                            {message.senderName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{message.senderName}</p>
                            <p className="text-xs text-gray-600">{message.createdAtFormatted}</p>
                          </div>
                        </>
                      )}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                </div>
              ))}
              
              {/* Empty div for scrolling to bottom */}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message input area - Always visible now for ongoing chat */}
            <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center">
                <textarea
                  className="flex-grow border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows="2"
                  placeholder="Rašykite žinutę..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={sending}
                ></textarea>
                <button
                  type="submit"
                  disabled={sending || !messageText.trim()}
                  className="ml-2 bg-amber-500 text-white rounded-lg px-4 py-2 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-6 bg-gray-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-medium mt-4 text-gray-700">Pasirinkite užklausą</h3>
            <p className="text-gray-500 text-center mt-2">
              Pasirinkite užklausą iš sąrašo kairėje pusėje, kad galėtumėte peržiūrėti pokalbį.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatServiceRequestsWidget;