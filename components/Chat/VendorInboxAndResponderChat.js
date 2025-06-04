// components/Chat/VendorInboxAndResponderChat.js
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
  writeBatch,
  limit
} from 'firebase/firestore';

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

// Helper function to group messages by date - this is fine outside the component
const groupMessagesByDate = (messages) => {
  const groups = [];
  let currentDate = null;
  let currentGroup = [];
  
  messages.forEach(message => {
    // Extract just the date part (no time)
    const messageDate = message.createdAt?.toDate?.() 
      ? new Date(message.createdAt.toDate()).toLocaleDateString() 
      : new Date(message.createdAt).toLocaleDateString();
    
    if (messageDate !== currentDate) {
      if (currentGroup.length > 0) {
        groups.push({
          date: currentDate,
          messages: currentGroup
        });
      }
      currentDate = messageDate;
      currentGroup = [message];
    } else {
      currentGroup.push(message);
    }
  });
  
  if (currentGroup.length > 0) {
    groups.push({
      date: currentDate,
      messages: currentGroup
    });
  }
  
  return groups;
};

const VendorInboxAndResponderChat = ({ user, vendorIds: propVendorIds = [] }) => {
  const [requests, setRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeListeners, setActiveListeners] = useState([]); 
  const [vendorIds, setVendorIds] = useState(propVendorIds);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const messageInputRef = useRef(null);
  const db = getFirestore();

  // For checking message ownership - MOVED INSIDE the component
  const isMyMessage = (message) => {
    // Check if this message was sent by the current user acting as a vendor
    return message.senderType === 'vendor' && message.senderUid === user.uid;
  };

  // Check if the vendor owns this request - MOVED INSIDE the component
  const isMyRequest = () => {
    return activeRequest && activeRequest.ownerUid === user.uid;
  };

  // Debug and fix ownership - MOVED INSIDE the component
  const debugAndFixOwnership = async () => {
    if (!activeRequest || !user) return;
    
    console.log("Debugging ownership for request:", activeRequest?.id);
    console.log("Current user:", user?.uid);
    console.log("Request data:", activeRequest);
    
    // Check for incorrect ownership
    if (activeRequest && activeRequest.userId === activeRequest.ownerUid) {
      console.log("OWNERSHIP BUG DETECTED: userId and ownerUid are the same!");
      
      // Fix ownership if it's incorrect - Only do this if you're sure this user should be the owner
      try {
        await updateDoc(doc(db, "serviceRequests", activeRequest.id), {
          ownerUid: user.uid
        });
        
        console.log("Fixed ownership by setting ownerUid to:", user.uid);
        
        // Update local state
        setActiveRequest({
          ...activeRequest,
          ownerUid: user.uid
        });
        
      } catch (error) {
        console.error("Error fixing ownership:", error);
      }
    }
  };

  // Function to scroll to the bottom - MOVED INSIDE the component
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper function to clean up listeners - MOVED INSIDE the component
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

  // Enhanced fixExistingRequests function - MOVED INSIDE the component
  const fixExistingRequests = async (userId, vendorIds) => {
    if (!userId || !vendorIds || vendorIds.length === 0) {
      console.log("Cannot fix requests: Missing userId or vendorIds", { userId, vendorIds });
      console.log("Current requests in state:", requests);
      console.log("Is loading:", loading);
      console.log("Has error:", error ? error : "none");
      return;
    }
    
    try {
      console.log("Running fixExistingRequests for vendor requests", { userId, vendorIds });
      
      // Find all responded requests (both with and without ownerUid)
      const requestsQuery = query(
        collection(db, "serviceRequests"),
        where("vendorId", "in", vendorIds),
        where("status", "in", ["inProgress", "completed"])
      );
      
      console.log("Querying for requests with status inProgress or completed");
      const requestsSnapshot = await getDocs(requestsQuery);
      console.log(`Found ${requestsSnapshot.size} requests for these vendors`);
      
      if (requestsSnapshot.empty) {
        console.log("No responded requests found to fix");
        return;
      }
      
      // Log all found requests for debugging
      requestsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        console.log(`Request ID: ${doc.id}`, {
          status: data.status,
          vendorId: data.vendorId,
          ownerUid: data.ownerUid || 'null',
          title: data.requestTitle
        });
      });
      
      // Filter requests that need fixing
      const requestsToFix = requestsSnapshot.docs.filter(doc => !doc.data().ownerUid);
      console.log(`Found ${requestsToFix.length} requests with null ownerUid that need fixing`);
      
      if (requestsToFix.length === 0) {
        console.log("No requests need to be fixed (all already have ownerUid set)");
        return;
      }
      
      const batch = writeBatch(db);
      
      requestsToFix.forEach(docSnapshot => {
        const docRef = doc(db, "serviceRequests", docSnapshot.id);
        batch.update(docRef, { ownerUid: userId });
        console.log(`Adding request ${docSnapshot.id} to batch update with ownerUid=${userId}`);
      });
      
      console.log(`Committing batch update for ${requestsToFix.length} requests...`);
      await batch.commit();
      console.log(`Successfully fixed ${requestsToFix.length} requests with missing ownerUid`);
      
      // Verify the fix worked
      const verifyQuery = query(
        collection(db, "serviceRequests"),
        where("vendorId", "in", vendorIds),
        where("status", "in", ["inProgress", "completed"]),
        where("ownerUid", "==", null)
      );
      
      const verifySnapshot = await getDocs(verifyQuery);
      console.log(`After fix: ${verifySnapshot.size} requests still have null ownerUid`);
      
    } catch (error) {
      console.error("Error fixing existing requests:", error);
    }
  };

  // Fetch vendor requests - MOVED INSIDE the component
  const fetchVendorRequests = async () => {
    if (!user?.uid || vendorIds.length === 0) {
      console.log("Cannot fetch vendor requests: No user ID or vendor IDs");
      setRequests([]);
      setLoading(false);
      return null;
    }
    
    setLoading(true);
    
    try {
      // Fix existing requests that might not have ownerUid set
      await fixExistingRequests(user.uid, vendorIds);
      
      // Get all service requests for these businesses
      console.log("Fetching requests for vendor IDs:", vendorIds);
      const requestsQuery = query(
        collection(db, "serviceRequests"),
        where("vendorId", "in", vendorIds),
        orderBy("updatedAt", "desc")
      );
      
      const requestsSnapshot = await getDocs(requestsQuery);
      console.log(`Found ${requestsSnapshot.size} total requests for these vendors`);
      
      // Process all requests
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
      
      console.log(`Processed ${fetchedRequests.length} requests for display`);
      setRequests(fetchedRequests);
      setLoading(false);
      
      return requestsSnapshot;
    } catch (error) {
      console.error("Error fetching vendor requests:", error);
      setError("Įvyko klaida. Bandykite vėliau.");
      setLoading(false);
      return null;
    }
  };

  // Handle selecting a request safely - MOVED INSIDE the component
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

  // Load messages for a specific request - MOVED INSIDE the component
  const loadMessages = async (requestId) => {
    setMessagesLoading(true);
    
    try {
      // Create a query for messages in this request, ordered by timestamp
      const messagesQuery = query(
        collection(db, "serviceRequests", requestId, "messages"),
        orderBy("createdAt", "asc")
      );
      
      // Set up real-time listener for messages
      const unsubscribe = onSnapshot(messagesQuery, (requestsSnapshot) => {
        const loadedMessages = requestsSnapshot.docs.map(doc => {
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
        console.error("Error in messages Snapshot:", error);
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

  // Function to send a message - MOVED INSIDE the component
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!activeRequest || !messageText.trim() || !user) return;
    
    setSending(true);
    
    try {
      // Create message data object
      const messageData = {
        content: messageText,
        senderType: "vendor",
        senderName: activeRequest.vendorName,
        senderUid: user.uid,  // Vendor's UID
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
        lastMessageSender: "vendor"
      };
      
      // If this is the first response from the vendor, update status and ownership
      if (activeRequest.status === 'pending' || !activeRequest.ownerUid) {
        console.log("Setting ownership for vendor:", user.uid);
        
        updateData.status = 'inProgress';
        updateData.responseDate = serverTimestamp();
        updateData.ownerUid = user.uid;  // CRITICAL FIX: Set to vendor's UID, not customer's
      }
      
      console.log("Updating request with data:", updateData);
      await updateDoc(doc(db, "serviceRequests", activeRequest.id), updateData);
      
      // Update local state if needed
      if (activeRequest.status === 'pending' || !activeRequest.ownerUid) {
        setActiveRequest({
          ...activeRequest,
          status: 'inProgress',
          responseDateFormatted: new Date().toLocaleString('lt-LT'),
          ownerUid: user.uid  // CRITICAL FIX: Update local state with vendor's UID
        });
      }
      
      // Create notification for the user
      await addDoc(collection(db, "notifications"), {
        type: 'service_request_message',
        title: 'Nauja žinutė užklausoje',
        message: `${messageData.senderName}: ${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}`,
        userId: activeRequest.userId,  // Send notification to customer
        requestId: activeRequest.id,
        read: false,
        createdAt: serverTimestamp()
      });
      
      // Clear input field
      setMessageText('');
      setSending(false);
      
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Nepavyko išsiųsti žinutės. Bandykite vėliau.");
      setSending(false);
    }
  };

  // Mark request as completed - MOVED INSIDE the component
  const markAsCompleted = async () => {
    if (!activeRequest || !user) return;
    
    try {
      await updateDoc(doc(db, "serviceRequests", activeRequest.id), {
        status: 'completed',
        updatedAt: serverTimestamp(),
        ownerUid: user.uid
      });
      
      // Update local state
      setActiveRequest({
        ...activeRequest,
        status: 'completed'
      });
      
      // Create notification for the user
      await addDoc(collection(db, "notifications"), {
        type: 'service_request_status',
        title: 'Užklausa užbaigta',
        message: `Jūsų užklausa "${activeRequest.requestTitle}" buvo pažymėta kaip užbaigta.`,
        userId: activeRequest.userId,
        requestId: activeRequest.id,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error updating status:", error);
      setError("Nepavyko pakeisti būsenos.");
    }
  };

  // Fetch vendor IDs if not provided via props
  useEffect(() => {
    if (propVendorIds && propVendorIds.length > 0) {
      console.log("Using provided vendor IDs:", propVendorIds);
      setVendorIds(propVendorIds);
    } else if (user?.uid) {
      console.log("Fetching vendor IDs for user:", user.uid);
      const fetchVendorIds = async () => {
        try {
          const businessClaimsQuery = query(
            collection(db, "businessClaims"),
            where("userId", "==", user.uid),
            where("status", "==", "approved")
          );
          
          const businessClaimsSnapshot = await getDocs(businessClaimsQuery);
          const ids = businessClaimsSnapshot.docs.map(doc => doc.data().vendorId);
          console.log("Fetched vendor IDs:", ids);
          setVendorIds(ids);
        } catch (error) {
          console.error("Error fetching vendor IDs:", error);
        }
      };
      
      fetchVendorIds();
    }
  }, [user?.uid, propVendorIds]);  

  // Debug and fix ownership issues for active request
  useEffect(() => {
    if (activeRequest) {
      debugAndFixOwnership();
    }
  }, [activeRequest?.id]);

  // Fetch vendor requests when component mounts or user changes
  useEffect(() => {
    if (user?.uid) {
      const fetchVendorRequests = async () => {
        setLoading(true);
        
        try {
          // First, find all businesses owned by this vendor
          const businessClaimsQuery = query(
            collection(db, "businessClaims"),
            where("userId", "==", user.uid),
            where("status", "==", "approved")
          );
          
          const businessClaimsSnapshot = await getDocs(businessClaimsQuery);
          const vendorIds = businessClaimsSnapshot.docs.map(doc => doc.data().vendorId);
          
          if (vendorIds.length === 0) {
            setRequests([]);
            setLoading(false);
            return;
          }
          
          // Fix existing requests that might not have ownerUid set
          await fixExistingRequests(user.uid, vendorIds);
          
          // Get all service requests for these businesses
          const requestsQuery = query(
            collection(db, "serviceRequests"),
            where("vendorId", "in", vendorIds),
            orderBy("updatedAt", "desc")
          );
          
          // Use getDocs first to quickly get all requests
          const requestsSnapshot = await getDocs(requestsQuery);
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
          console.log("Requests loaded into state:", fetchedRequests);
          setLoading(false);
          
          // Then set up real-time listener for future updates
          const unsubscribe = onSnapshot(requestsQuery, (requestsSnapshot) => {
            const updatedRequests = requestsSnapshot.docs.map(docSnapshot => {
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
          }, (error) => {
            console.error("Error in real-time updates:", error);
          });
          
          setActiveListeners(prev => [...prev, unsubscribe]);
        } catch (error) {
          console.error("Error setting up vendor requests:", error);
          setError("Įvyko klaida. Bandykite vėliau.");
          setLoading(false);
        }
      };
      
      fetchVendorRequests();
    } else {
      setRequests([]);
      setLoading(false);
    }
    
    return () => cleanupListeners();
  }, [user?.uid, db]);

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

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Debug logging for message text state
  useEffect(() => {
    console.log("messageText state changed:", messageText);
  }, [messageText]);

  // Debug logging for active request status
  useEffect(() => {
    if (activeRequest) {
      console.log("Active request status:", activeRequest.status);
      console.log("Is textarea disabled:", sending || activeRequest.status === 'completed');
    }
  }, [activeRequest, sending]);

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
          Jūs dar negavote jokių paslaugų užklausų.
        </p>
      </div>
    );
  }
  
  // The chat interface with request list and messages
  return (
    <div className="flex h-full overflow-hidden bg-white rounded-lg shadow-lg">
      {/* Chat list sidebar */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col h-full">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg">Gautos užklausos</h2>
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
      <div className="w-2/3 flex flex-col h-full">
        {activeRequest ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="font-semibold">{activeRequest.requestTitle}</h3>
                <div className="flex items-center">
                  <p className="text-xs text-gray-500">
                    {activeRequest.userFullName} • {activeRequest.createdAtFormatted}
                  </p>
                  {isMyRequest() && (
                    <span className="ml-2 text-xs bg-amber-100 text-amber-800 rounded-full px-2 py-0.5">
                      Priskirta jums
                    </span>
                  )}
                </div>
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
                
                {/* Only show completion button to the assigned vendor */}
                {isMyRequest() && activeRequest.status === 'inProgress' && (
                  <button
                    onClick={markAsCompleted}
                    className="text-xs bg-green-500 text-white rounded-full px-2 py-1 hover:bg-green-600"
                  >
                    Žymėti kaip užbaigtą
                  </button>
                )}
              </div>
            </div>
            
            {/* Chat messages */}
            <div 
              ref={chatContainerRef} 
              className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50" 
              id="vendor-chat-messages"
            >
              {/* Original request message */}
              <div className="flex flex-col max-w-[80%] bg-gray-200 rounded-lg rounded-tl-none p-3 ml-1 mb-4 border-l-4 border-gray-400">
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

              {/* Status change notifications */}
              {activeRequest.status === 'inProgress' && activeRequest.responseDate && (
                <div className="text-center my-4">
                  <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
                    Jūsų atsakėte {activeRequest.responseDateFormatted || 'N/A'}
                  </div>
                </div>
              )}

              {activeRequest.status === 'completed' && (
                <div className="text-center my-4">
                  <div className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                    Ši užklausa yra baigta
                  </div>
                </div>
              )}
              
              {/* Loading messages indicator */}
              {messagesLoading && (
                <div className="text-center py-2">
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-amber-500"></div>
                  <p className="text-xs text-gray-500 mt-1">Kraunamos žinutės...</p>
                </div>
              )}
              
              {/* Messages */}
              {messages.map(message => {
                // Determine if this message is from the current user
                const isCurrentUser = isMyMessage(message);
                
                return (
                  <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`flex flex-col max-w-[80%] p-3 rounded-lg ${
                        isCurrentUser 
                          ? 'bg-amber-100 rounded-br-none mr-1' 
                          : 'bg-gray-200 rounded-bl-none ml-1'
                      }`}
                    >
                      <div className={`flex items-center mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                        {!isCurrentUser ? (
                          <>
                            <div className="bg-gray-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-semibold mr-2">
                              {message.senderName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{message.senderName}</p>
                              <p className="text-xs text-gray-600">{message.createdAtFormatted}</p>
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <p className="font-semibold text-sm text-right">Jūs</p>
                              <p className="text-xs text-gray-600 text-right">{message.createdAtFormatted}</p>
                            </div>
                            <div className="bg-amber-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-semibold ml-2">
                              {message.senderName.charAt(0)}
                            </div>
                          </>
                        )}
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                );
              })}
              
              {/* Empty div for scrolling to bottom */}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message input area */}
            {activeRequest && (
              <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
                <div className="flex items-center">
                  {/* This is a hidden textarea that's controlled by React state */}
                  <div className="flex-grow relative">
                    <textarea
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      rows="2"
                      placeholder="Rašykite žinutę..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onFocus={() => setInputFocused(true)}
                      onBlur={() => setInputFocused(false)}
                      style={{
                        backgroundColor: (activeRequest && activeRequest.status === 'completed') ? '#f3f4f6' : 'white',
                      }}
                      disabled={sending || (activeRequest && activeRequest.status === 'completed')}
                    ></textarea>
                    
                    {/* Visual indicator when input is disabled */}
                    {(activeRequest && activeRequest.status === 'completed') && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 rounded-lg">
                        <span className="text-gray-500">Užklausa jau užbaigta</span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={sending || !messageText.trim() || (activeRequest && activeRequest.status === 'completed')}
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
            )}
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

export default VendorInboxAndResponderChat;