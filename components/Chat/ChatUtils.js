// components/Chat/ChatUtils.js

import { 
  collection, 
  addDoc,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Unified function to send messages from both user and vendor sides
export const sendChatMessage = async (db, user, activeRequest, messageText, senderType) => {
  if (!activeRequest || !messageText.trim() || !user) return;
  
  // Create message data object
  const messageData = {
    content: messageText,
    senderType: senderType,
    senderName: senderType === "vendor" ? activeRequest.vendorName : user.displayName || "User",
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
    lastMessageSender: senderType
  };
  
  // If vendor is responding to a pending request, update status
   if (senderType === 'vendor' && (activeRequest.status === 'pending' || !activeRequest.ownerUid)) {
    console.log("Setting ownership for vendor:", user.uid);
    
    updateData.status = 'inProgress';
    updateData.responseDate = serverTimestamp();
    updateData.ownerUid = user.uid;  // CRITICAL FIX: Set to vendor's UID
  }
  
  console.log("Updating request with data:", updateData);
  await updateDoc(doc(db, "serviceRequests", activeRequest.id), updateData);
  
  // Create notification for the recipient
  const recipientId = senderType === 'vendor' ? activeRequest.userId : activeRequest.ownerUid;
  
  if (recipientId) {
    await addDoc(collection(db, "notifications"), {
      type: 'service_request_message',
      title: 'Nauja žinutė užklausoje',
      message: `${messageData.senderName}: ${messageText.substring(0, 50)}${messageText.length > 50 ? '...' : ''}`,
      userId: recipientId,
      requestId: activeRequest.id,
      read: false,
      createdAt: serverTimestamp()
    });
  }
};

const debugAndFixOwnership = async () => {
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

// Function to count unread messages for users
export const countUserUnreadMessages = async (db, userId) => {
  if (!userId) return 0;
  
  // Implementation depends on your data structure
  // This is a placeholder - you'll need to implement based on your schema
  return 0;
};

// Function to count unread messages for vendors
export const countVendorUnreadMessages = async (db, vendorIds) => {
  if (!vendorIds || vendorIds.length === 0) return 0;
  
  // Implementation depends on your data structure
  // This is a placeholder - you'll need to implement based on your schema
  return 0;
};
