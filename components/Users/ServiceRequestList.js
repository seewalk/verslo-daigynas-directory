// components/Vendors/ServiceRequestsList.js
import React, { useState, useEffect } from 'react';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  doc, 
  updateDoc, 
  serverTimestamp,
  writeBatch, // Add this import
  addDoc // Add this import
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const ServiceRequestsList = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [responseLoading, setResponseLoading] = useState(false);
  const [error, setError] = useState('');  

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchServiceRequests(currentUser.uid);
      } else {
        setServiceRequests([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const fetchServiceRequests = async (userId) => {
    setLoading(true);
    try {
      // Get businesses owned by this user
      const businessClaimsQuery = query(
        collection(db, "businessClaims"),
        where("userId", "==", userId),
        where("status", "==", "approved")
      );
      
      const businessClaimsSnapshot = await getDocs(businessClaimsQuery);
      const vendorIds = businessClaimsSnapshot.docs.map(doc => doc.data().vendorId);
      
      if (vendorIds.length === 0) {
        setServiceRequests([]);
        setLoading(false);
        return;
      }
      
      // Get service requests for these businesses
      const requestsQuery = query(
        collection(db, "serviceRequests"),
        where("vendorId", "in", vendorIds),
        orderBy("createdAt", "desc")
      );
      
      const requestsSnapshot = await getDocs(requestsQuery);
      const requests = requestsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAtFormatted: doc.data().createdAt ? new Date(doc.data().createdAt.toDate()).toLocaleString('lt-LT') : 'Nenurodyta',
        responseDate: doc.data().responseDate ? new Date(doc.data().responseDate.toDate()).toLocaleString('lt-LT') : null,
      }));
      
      setServiceRequests(requests);
    } catch (error) {
      console.error("Error fetching service requests:", error);
      setError("Įvyko klaida gaunant užklausas. Bandykite vėliau.");
    }
    setLoading(false);
  };
const handleRespond = async (e) => {
  e.preventDefault();
  if (!selectedRequest || !responseText.trim()) return;
  
  setResponseLoading(true);
  try {
    // Update the document with response and set ownerUid
    await updateDoc(doc(db, "serviceRequests", selectedRequest.id), {
      responseText: responseText,
      responseDate: serverTimestamp(),
      status: 'completed',
      updatedAt: serverTimestamp(),
      ownerUid: user.uid  // Add this line
    });
    
    // Create notification for the user
    try {
      await addDoc(collection(db, "notifications"), {
        type: 'service_request_response',
        title: 'Atsakymas į jūsų užklausą',
        message: `${selectedRequest.vendorName} atsakė į jūsų užklausą "${selectedRequest.requestTitle}"`,
        userId: selectedRequest.userId,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
      // Continue even if notification fails
    }
    
    // Update local state
    setServiceRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === selectedRequest.id 
          ? { 
              ...req, 
              responseText, 
              responseDate: new Date().toLocaleString('lt-LT'), 
              status: 'completed',
              ownerUid: user.uid  // Also update the local state
            } 
          : req
      )
    );
    
    setSelectedRequest({
      ...selectedRequest,
      responseText,
      responseDate: new Date().toLocaleString('lt-LT'),
      status: 'completed',
      ownerUid: user.uid  // And update the selected request state
    });
    
    // Reset form
    setResponseLoading(false);
  } catch (error) {
    console.error("Error responding to request:", error);
    setError("Įvyko klaida siunčiant atsakymą. Bandykite vėliau.");
    setResponseLoading(false);
  }
};

// Fix existing service requests
const fixExistingRequests = async (userId) => {
  // Make sure we have a valid user ID
  if (!userId) {
    console.error("Cannot fix requests: No user ID provided");
    return;
  }
  
  try {
    // Get businesses owned by this user
    const businessClaimsQuery = query(
      collection(db, "businessClaims"),
      where("userId", "==", userId), // Use the passed userId parameter
      where("status", "==", "approved")
    );
    
    const businessClaimsSnapshot = await getDocs(businessClaimsQuery);
    const vendorIds = businessClaimsSnapshot.docs.map(doc => doc.data().vendorId);
    
    if (vendorIds.length === 0) {
      console.log("No approved business claims found");
      return;
    }
    
    // Find completed requests with null ownerUid
    const requestsToFixQuery = query(
      collection(db, "serviceRequests"),
      where("vendorId", "in", vendorIds),
      where("status", "==", "completed")
    );
    
    const requestsSnapshot = await getDocs(requestsToFixQuery);
    
    // Use a batch to update all documents at once
    const batch = writeBatch(db);
    let updateCount = 0;
    
    requestsSnapshot.forEach(docSnapshot => {
      const data = docSnapshot.data();
      if (!data.ownerUid) {
        batch.update(doc(db, "serviceRequests", docSnapshot.id), {
          ownerUid: userId // Use the passed userId parameter
        });
        updateCount++;
      }
    });
    
    if (updateCount > 0) {
      await batch.commit();
      console.log(`Fixed ${updateCount} completed requests`);
    }
  } catch (error) {
    console.error("Error fixing existing requests:", error);
  }
};

// Then call this function in useEffect when loading
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    if (currentUser) {
      fetchServiceRequests(currentUser.uid);
      // Add this line to fix existing requests
      fixExistingRequests(currentUser.uid);
    } else {
      setServiceRequests([]);
      setLoading(false);
    }
  });

  return () => unsubscribe();
}, [auth]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Laukiama atsakymo</span>;
      case 'inProgress':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Vykdoma</span>;
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Atsakyta</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Atmesta</span>;
      default:
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">Nežinoma</span>;
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'high':
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">Skubu</span>;
      case 'normal':
        return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">Vidutinis</span>;
      case 'low':
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Neskubu</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
        <p className="mt-2">Kraunama...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (serviceRequests.length === 0) {
    return (
      <section className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Paslaugų užklausos</h2>
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <h3 className="text-lg font-medium mt-2">Nėra paslaugų užklausų</h3>
          <p className="text-gray-500 mt-1">Jūs dar negavote jokių paslaugų užklausų.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Paslaugų užklausos</h2>

      {selectedRequest ? (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold mb-1">{selectedRequest.requestTitle}</h3>
                <p className="text-gray-500 text-sm">Pateikta: {selectedRequest.createdAtFormatted}</p>
              </div>
              <button 
                onClick={() => setSelectedRequest(null)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {getStatusBadge(selectedRequest.status)}
              {getUrgencyBadge(selectedRequest.urgency)}
            </div>
            
            <div className="mt-4 bg-gray-50 p-4 rounded-md">
              <h4 className="font-semibold mb-2">Užklausos detalės</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.requestDetails}</p>
            </div>
            
            <div className="mt-4">
              <h4 className="font-semibold mb-2">Kontaktinė informacija</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-gray-500">Vardas, pavardė:</p>
                  <p className="font-medium">{selectedRequest.userFullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">El. paštas:</p>
                  <p className="font-medium">
                    <a href={`mailto:${selectedRequest.userEmail}`} className="text-blue-600 hover:underline">
                      {selectedRequest.userEmail}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefono numeris:</p>
                  <p className="font-medium">
                    <a href={`tel:${selectedRequest.userPhone}`} className="text-blue-600 hover:underline">
                      {selectedRequest.userPhone}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pageidaujamas kontaktavimo būdas:</p>
                  <p className="font-medium">
                    {selectedRequest.preferredContactMethod === 'email' ? 'El. paštu' : 'Telefonu'}
                  </p>
                </div>
              </div>
            </div>
            
            {selectedRequest.responseText ? (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h4 className="font-semibold mb-2">Jūsų atsakymas</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.responseText}</p>
                <p className="text-sm text-gray-500 mt-2">Atsakyta: {selectedRequest.responseDate}</p>
              </div>
            ) : (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h4 className="font-semibold mb-2">Pateikti atsakymą</h4>
                <form onSubmit={handleRespond}>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    rows="5"
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="Įveskite atsakymą į užklausą..."
                    required
                  ></textarea>
                  <div className="mt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={responseLoading}
                      className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600 disabled:bg-amber-300 flex items-center"
                    >
                      {responseLoading && (
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      Siųsti atsakymą
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceRequests.map(request => (
            <div key={request.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1 truncate">{request.requestTitle}</h3>
                <p className="text-gray-500 text-sm mb-3">
                  {request.createdAtFormatted}
                </p>
                
                <div className="flex flex-wrap gap-2 mb-3">
                  {getStatusBadge(request.status)}
                  {getUrgencyBadge(request.urgency)}
                </div>
                
                <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                  {request.requestDetails}
                </p>
                
                <div className="border-t border-gray-100 pt-3 text-sm">
                  <p>
                    <span className="font-medium">Nuo: </span> 
                    {request.userFullName}
                  </p>
                  <p className="truncate">
                    <span className="font-medium">El. paštas: </span>
                    <a href={`mailto:${request.userEmail}`} className="text-blue-600 hover:underline">
                      {request.userEmail}
                    </a>
                  </p>
                </div>
                
                <button
                  onClick={() => setSelectedRequest(request)}
                  className="mt-4 w-full bg-amber-500 text-white py-2 px-4 rounded-md hover:bg-amber-600 transition-colors"
                >
                  {request.status === 'completed' ? 'Peržiūrėti' : 'Atsakyti'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ServiceRequestsList;