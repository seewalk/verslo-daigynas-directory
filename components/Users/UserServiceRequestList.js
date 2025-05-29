// components/Users/UserServiceRequestsList.js
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const UserServiceRequestsList = () => {
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [error, setError] = useState('');

  const db = getFirestore();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserServiceRequests(currentUser.uid);
      } else {
        setServiceRequests([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  const fetchUserServiceRequests = async (userId) => {
    setLoading(true);
    try {
      // Get service requests made by this user
      const requestsQuery = query(
        collection(db, "serviceRequests"),
        where("userId", "==", userId),
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
      console.error("Error fetching user service requests:", error);
      setError("Įvyko klaida gaunant jūsų užklausas. Bandykite vėliau.");
    }
    setLoading(false);
  };

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
        <h2 className="text-2xl font-bold mb-4">Mano paslaugų užklausos</h2>
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <h3 className="text-lg font-medium mt-2">Nėra paslaugų užklausų</h3>
          <p className="text-gray-500 mt-1">Jūs dar nesate pateikę jokių paslaugų užklausų.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Mano paslaugų užklausos</h2>

      {selectedRequest ? (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold mb-1">{selectedRequest.requestTitle}</h3>
                <p className="text-sm text-blue-600">Siųsta: {selectedRequest.vendorName}</p>
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
              <h4 className="font-semibold mb-2">Jūsų užklausos detalės</h4>
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
                  <p className="font-medium">{selectedRequest.userEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Telefono numeris:</p>
                  <p className="font-medium">{selectedRequest.userPhone}</p>
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
                <h4 className="font-semibold mb-2">Paslaugų teikėjo atsakymas</h4>
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.responseText}</p>
                  <p className="text-sm text-gray-500 mt-2">Atsakyta: {selectedRequest.responseDate}</p>
                </div>
              </div>
            ) : (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <div className="bg-yellow-50 p-4 rounded-md">
                  <p className="text-yellow-700">
                    Laukiama paslaugų teikėjo atsakymo. Įprastai atsakymas pateikiamas per 1-3 darbo dienas.
                  </p>
                </div>
              </div>
            )}
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Grįžti į sąrašą
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serviceRequests.map(request => (
            <div key={request.id} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1 truncate">{request.requestTitle}</h3>
                <p className="text-blue-600 text-sm mb-1">
                  {request.vendorName}
                </p>
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
                
                {request.responseText && (
                  <div className="border-t border-gray-100 pt-3 text-sm">
                    <p className="font-medium">Atsakymas gautas</p>
                    <p className="text-gray-500 text-sm">
                      {request.responseDate}
                    </p>
                  </div>
                )}
                
                <button
                  onClick={() => setSelectedRequest(request)}
                  className={`mt-4 w-full py-2 px-4 rounded-md transition-colors ${
                    request.status === 'completed' 
                      ? 'bg-blue-500 text-white hover:bg-blue-600' 
                      : 'bg-amber-500 text-white hover:bg-amber-600'
                  }`}
                >
                  {request.status === 'completed' ? 'Peržiūrėti atsakymą' : 'Peržiūrėti užklausą'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default UserServiceRequestsList;