// pages/dashboard/favorites.js
import React, { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Favorites from '../../components/Users/Favorites';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/router';

const FavoritesPage = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = getAuth();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/auth?redirect=/dashboard/favorites');
      } else {
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [auth, router]);
  
  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Kraunama...</p>
        </div>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Header />
      <main>
        <div className="py-8 px-4 bg-blue-600 text-white">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-3xl font-bold">Mėgstamos įmonės</h1>
            <p className="mt-2 text-blue-100">
              Visos jūsų išsaugotos įmonės ir paslaugos vienoje vietoje
            </p>
          </div>
        </div>
        
        {/* Show all favorites */}
        <Favorites maxDisplay={0} showTitle={false} />
        
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-4">Kaip naudotis mėgstamų funkcija</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong>Pridėti įmonę prie mėgstamų</strong>
                  <p className="text-gray-600">Naršydami katalogą, spauskite širdutės ikoną, kad pridėtumėte įmonę prie mėgstamų.</p>
                </div>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong>Peržiūrėti mėgstamų įmonių sąrašą</strong>
                  <p className="text-gray-600">Šiame puslapyje galite peržiūrėti visas jūsų mėgstamas įmones.</p>
                </div>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 text-blue-600 mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <strong>Pašalinti iš mėgstamų</strong>
                  <p className="text-gray-600">Norėdami pašalinti įmonę iš mėgstamų sąrašo, dar kartą spauskite širdutės ikoną.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default FavoritesPage;
