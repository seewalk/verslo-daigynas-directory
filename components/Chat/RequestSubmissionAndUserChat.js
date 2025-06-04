// components/Chat/RequestSubmissionAndUserChat.js
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
  onSnapshot
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { sendChatMessage } from './ChatUtils';

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

const RequestSubmissionAndUserChat = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [activeRequest, setActiveRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeListeners, setActiveListeners] = useState([]); 
  const messageInputRef = useRef(null);
  const [inputFocused, setInputFocused] = useState(false);
  
  const messagesEndRef = useRef(null);
  const db = getFirestore();
  
  console.log("RequestSubmissionAndUserChat - Component rendering with user:", user?.uid);

  // Direct test query to check all requests and user's requests
  const testDirectQuery = async () => {
    console.group("RequestSubmissionAndUserChat - Direct Query Test");
    
    if (!user?.uid) {
      console.log("No user ID available for direct query test");
      console.groupEnd();
      return;
    }
    
    try {
      console.log("Starting direct query test with user ID:", user.uid);
      
      // 1. First check all service requests (no filters)
      console.log("Querying ALL service requests...");
      const allRequestsQuery = query(collection(db, "serviceRequests"));
      const allSnapshot = await getDocs(allRequestsQuery);
      console.log(`Found ${allSnapshot.size} total service requests`);
      
      // 2. Then check specifically for this user's requests
      console.log(`Querying specifically for user ${user.uid} requests...`);
      const userRequestsQuery = query(
        collection(db, "serviceRequests"),
        where("userId", "==", user.uid)
      );
      
      const userSnapshot = await getDocs(userRequestsQuery);
      console.log(`Found ${userSnapshot.size} requests specifically for user ${user.uid}`);
      
      // Log all user requests
      userSnapshot.forEach(doc => {
        console.log(`User request: ${doc.id}`, doc.data());
      });
      
      // 3. Check for any requests that might match this user with different case/format
      const allUserRequests = allSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.userId && (
          data.userId === user.uid ||
          data.userId.toLowerCase?.() === user.uid.toLowerCase?.()
        );
      });
      
      console.log(`Found ${allUserRequests.length} potential matches including case-insensitive`);
      allUserRequests.forEach(doc => {
        console.log(`Potential match: ${doc.id}`, {
          userId: doc.data().userId,
          title: doc.data().requestTitle,
          status: doc.data().status
        });
      });
      
    } catch (error) {
      console.error("Error in direct query test:", error);
    }
    
    console.groupEnd();
  };

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper function to clean up listeners
  const cleanupListeners = () => {
    console.log(`RequestSubmissionAndUserChat - Cleaning up ${activeListeners.length} listeners`);
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

// Then use it in your render:
const messageGroups = groupMessagesByDate(messages);

// And in the JSX:
{messageGroups.map((group, groupIndex) => (
  <div key={groupIndex}>
    <div className="text-center my-4">
      <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
        {new Date(group.date).toLocaleDateString('lt-LT', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </span>
    </div>
    
    {group.messages.map(message => {
      // Your existing message rendering code
    })}
  </div>
))}

  // Check user object details
  useEffect(() => {
    console.group("RequestSubmissionAndUserChat - User Object Analysis");
    
    if (user) {
      console.log("User object received:", {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        isAnonymous: user.isAnonymous
      });
      
      // Run the direct test query
      testDirectQuery();
    } else {
      console.log("No user object available");
    }
    
    console.groupEnd();
  }, [user]);

  const isMyMessage = (message) => {
  // For a customer view, their messages are ones where:
// A customer's message will have senderType="user"
  return message.senderType === 'user' && message.senderUid === user.uid;
};

// When rendering messages, replace your existing message map function with:
{messages.map(message => {
  const isOwnMessage = isMyMessage(message);
  
  return (
    <div key={message.id} className={`flex mb-3 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`flex flex-col max-w-[80%] p-3 rounded-lg ${
          isOwnMessage 
            ? 'bg-blue-100 rounded-br-none mr-1' 
            : 'bg-amber-100 rounded-bl-none ml-1'
        }`}
      >
        <div className={`flex items-center mb-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
          {!isOwnMessage ? (
            <>
              <div className="bg-amber-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-semibold mr-2">
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
                <p className="font-semibold text-sm text-right">You</p>
                <p className="text-xs text-gray-600 text-right">{message.createdAtFormatted}</p>
              </div>
              <div className="bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-semibold ml-2">
                {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
              </div>
            </>
          )}
        </div>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
})}

  // Fetch user requests when component mounts or user changes
  useEffect(() => {
    console.group("RequestSubmissionAndUserChat - Requests Fetch Effect");
    console.log("Effect triggered with user ID:", user?.uid);
    
    if (user?.uid) {
      const fetchRequests = async () => {
        console.log("Starting fetchRequests for user:", user.uid);
        setLoading(true);
        
        try {
          console.log("Building query for user requests with userId:", user.uid);
          const requestsQuery = query(
            collection(db, "serviceRequests"),
            where("userId", "==", user.uid),
            orderBy("updatedAt", "desc")
          );
          
          console.log("Executing initial getDocs to check if any requests exist...");
          const initialSnapshot = await getDocs(requestsQuery);
          console.log(`Initial check found ${initialSnapshot.size} user requests`);
          
          initialSnapshot.docs.forEach(doc => {
            console.log(`Request ${doc.id}:`, {
              title: doc.data().requestTitle,
              status: doc.data().status,
              vendorId: doc.data().vendorId,
              updatedAt: doc.data().updatedAt ? 
                new Date(doc.data().updatedAt.seconds * 1000).toISOString() : 'null'
            });
          });
          
          console.log("Setting up onSnapshot listener...");
          const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
            console.log(`onSnapshot fired with ${snapshot.size} requests`);
            
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
            
            console.log("Setting state with fetchedRequests:", fetchedRequests);
            setRequests(fetchedRequests);
            setLoading(false);
          }, (error) => {
            console.error("Error in onSnapshot:", error);
            setError("Nepavyko gauti užklausų. Bandykite vėliau.");
            setLoading(false);
          });
          
          console.log("Added snapshot listener to activeListeners");
          setActiveListeners(prev => [...prev, unsubscribe]);
        } catch (error) {
          console.error("Error setting up requests listener:", error);
          setError("Įvyko klaida. Bandykite vėliau.");
          setLoading(false);
        }
      };
      
      fetchRequests();
    } else {
      console.log("No user ID, setting empty requests and loading=false");
      setRequests([]);
      setLoading(false);
    }
    
    return () => {
      console.log("Cleanup function called in requests fetch effect");
      cleanupListeners();
    };
    
    console.groupEnd();
  }, [user?.uid, db]);

  // Load messages when active request changes
  useEffect(() => {
    console.log("RequestSubmissionAndUserChat - Active Request Changed:", activeRequest?.id);
    let messageListener = null;
    
    if (activeRequest) {
      console.log("Loading messages for request:", activeRequest.id);
      messageListener = loadMessages(activeRequest.id);
      if (typeof messageListener === 'function') {
        setActiveListeners(prev => [...prev, messageListener]);
      }
    } else {
      console.log("No active request, clearing messages");
      setMessages([]);
    }
    
    return () => {
      if (typeof messageListener === 'function') {
        try {
          console.log("Cleaning up message listener");
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

  // Handle selecting a request safely
  const handleSelectRequest = (request) => {
    console.log("Request selected:", request.id, request);
    // Make sure all timestamps are properly formatted
    const safeRequest = {
      ...request,
      createdAtFormatted: formatTimestamp(request.createdAt) || request.createdAtFormatted || 'Nenurodyta',
      updatedAtFormatted: formatTimestamp(request.updatedAt) || request.updatedAtFormatted || 'Nenurodyta',
      responseDateFormatted: formatTimestamp(request.responseDate) || request.responseDateFormatted || null
    };
    
    setActiveRequest(safeRequest);
  };

  // Load messages for a specific request
  const loadMessages = async (requestId) => {
    console.log("RequestSubmissionAndUserChat - Loading messages for request:", requestId);
    setMessagesLoading(true);
    
    try {
      // Create a query for messages in this request, ordered by timestamp
      const messagesQuery = query(
        collection(db, "serviceRequests", requestId, "messages"),
        orderBy("createdAt", "asc")
      );
      
      // Set up real-time listener for messages
      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        console.log(`Messages snapshot received with ${snapshot.size} messages`);
        const loadedMessages = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAtFormatted: formatTimestamp(data.createdAt),
          };
        });
        
        console.log("Setting messages state with:", loadedMessages);
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

  // Function to send a message

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
      senderUid: user.uid,
      createdAt: serverTimestamp()
    };
    
    // Add the message to the subcollection
    await addDoc(
      collection(db, "serviceRequests", activeRequest.id, "messages"), 
      messageData
    );
    
    // Update the main request document - IMPORTANT CHANGE: Don't set status to completed
    const updateData = {
      updatedAt: serverTimestamp(),
      lastMessage: messageText.substring(0, 100),
      lastMessageSender: "vendor",
      ownerUid: user.uid // Always set ownerUid when vendor sends a message
    };
    
    // If this is the first response from the vendor, update status to inProgress
    if (activeRequest.status === 'pending') {
      updateData.status = 'inProgress';
      updateData.responseDate = serverTimestamp();
    }
    
    await updateDoc(doc(db, "serviceRequests", activeRequest.id), updateData);
    
    // Update local state if needed
    if (activeRequest.status === 'pending') {
      setActiveRequest({
        ...activeRequest,
        status: 'inProgress',
        responseDateFormatted: new Date().toLocaleString('lt-LT'),
        ownerUid: user.uid
      });
    }
    
    // Create notification for the user
    await addDoc(collection(db, "notifications"), {
      type: 'service_request_message',
      title: 'Nauja žinutė užklausoje',
      message: `${messageData.senderName}: ${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}`,
      userId: activeRequest.userId,
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

useEffect(() => {
  console.log("messageText state changed:", messageText);
}, [messageText]);

useEffect(() => {
  if (activeRequest) {
    console.log("Active request status:", activeRequest.status);
    console.log("Is textarea disabled:", sending || activeRequest.status === 'completed');
  }
}, [activeRequest, sending]);


  // Log current state before rendering
  console.log("RequestSubmissionAndUserChat - Render state:", { 
    userID: user?.uid,
    requestsCount: requests.length,
    loading, 
    error,
    activeRequestId: activeRequest?.id || 'none'
  });
  
  if (requests.length > 0) {
    console.log("RequestSubmissionAndUserChat - Requests in state:", requests);
  }

  // Loading state
  if (loading) {
    console.log("RequestSubmissionAndUserChat - Rendering loading state");
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        <p className="ml-2">Kraunama...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    console.log("RequestSubmissionAndUserChat - Rendering error state:", error);
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
    console.log("RequestSubmissionAndUserChat - Rendering empty state (no requests)");
    return (
      <div className="h-full flex flex-col items-center justify-center p-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <h3 className="text-lg font-medium mt-4 text-gray-700">Nėra užklausų</h3>
        <p className="text-gray-500 text-center mt-2">
          Jūs dar nesate pateikę jokių paslaugų užklausų.
        </p>
      </div>
    );
  }
  
  // The chat interface with request list and messages
  console.log("RequestSubmissionAndUserChat - Rendering chat interface with", requests.length, "requests");
  return (
  <div className="flex h-full overflow-hidden bg-white rounded-lg shadow-lg">
    {/* Chat list sidebar */}
    <div className="w-1/3 border-r border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-lg">Mano užklausos</h2>
      </div>
      {/* Make sure overflow only applies to this inner container */}
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
    <p className="text-xs text-gray-500">
      {activeRequest.vendorName} • {activeRequest.createdAtFormatted}
      {activeRequest.ownerUid && activeRequest.status !== 'pending' && (
        <span className="ml-1 text-green-600">• Assigned</span>
      )}
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
    
    {/* Only users can mark their own requests as completed */}
    {activeRequest.status === 'inProgress' && (
      <button
        onClick={markAsCompleted}
        className="text-xs bg-green-500 text-white rounded-full px-2 py-1 hover:bg-green-600"
      >
        Žymėti kaip užbaigtą
      </button>
    )}
  </div>
</div>
            
            {/* Chat messages - Improved scrolling area */}
          <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50" id="chat-messages">
            {/* Original request message - Update styling for consistency */}
<div className="flex flex-col max-w-[80%] bg-gray-200 rounded-lg rounded-tl-none p-3 ml-1 mb-4 border-l-4 border-gray-400">
  <div className="flex items-center mb-1">
    <div className="bg-gray-400 rounded-full h-8 w-8 flex items-center justify-center text-white font-semibold mr-2">
      {activeRequest.userFullName.charAt(0)}
    </div>
    <div>
      <p className="font-semibold text-sm">Original Request</p>
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

{/* Add status change notifications */}
{activeRequest.status !== 'pending' && (
  <div className="text-center my-4">
    <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs">
      Tiekėjas atsakė {activeRequest.responseDateFormatted || 'N/A'}
    </div>
  </div>
)}

{activeRequest.status === 'completed' && (
  <div className="text-center my-4">
    <div className="inline-block px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">
      Užklausa užbaigta {activeRequest.responseDateFormatted || 'N/A'}
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
              
              {/* Additional messages - UPDATED for clear sender differentiation */}
{messages.map(message => {
  // Determine if this message is from the current user (customer)
  const isCurrentUser = message.senderType === 'user';
  
  return (
    <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`flex flex-col max-w-[80%] p-3 rounded-lg ${
          isCurrentUser 
            ? 'bg-blue-100 rounded-br-none mr-1' 
            : 'bg-amber-100 rounded-bl-none ml-1'
        }`}
      >
        <div className={`flex items-center mb-1 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
          {!isCurrentUser ? (
            <>
              <div className="bg-amber-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-semibold mr-2">
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
                <p className="font-semibold text-sm text-right">You</p>
                <p className="text-xs text-gray-600 text-right">{message.createdAtFormatted}</p>
              </div>
              <div className="bg-blue-500 rounded-full h-8 w-8 flex items-center justify-center text-white font-semibold ml-2">
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
            
            {/* Message input area - Always visible now for ongoing chat */}
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

export default RequestSubmissionAndUserChat;