// TODO: Add homepage code here
import React, { useState } from 'react';
import vendors from '../data/vendors';
import VendorCard from '../components/VendorCard';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AboutSection from '../components/AboutSection';
import UserBenefitsSection from '../components/UserBenefitsSection';
import { motion } from 'framer-motion';
import IndustryNewsCarousel from '../components/industrynewscarousel';
import FAQ from '../components/FAQ';
import VendorRegistrationCTA from '../components/VendorRegistrationCTA';
import SimpleVendorCTA from '../components/SimpleVendorCTA';
import ContentHighlightDivider from '../components/ContentHighLightDivider';

export default function HomePage() {
  const [visibleCount, setVisibleCount] = useState(10);
  const [selectedCity, setSelectedCity] = useState('Visi miestai');
  const [selectedPrice, setSelectedPrice] = useState('Visos kainos');
  const [selectedServices, setSelectedServices] = useState([]);

  const cities = ['Visi miestai', ...Array.from(new Set(vendors.map(v => v.city.trim())))];
  const serviceOptions = Array.from(new Set(vendors.flatMap(v => v.services.map(s => s.trim())))).sort();

  const filteredVendors = vendors.filter(v => {
    const cityMatch = selectedCity === 'Visi miestai' || v.city.trim() === selectedCity;

    const priceNumber = parseFloat(v.price.replace(/[^\d]/g, '')) || 0;
    let priceMatch = true;
    if (selectedPrice === 'Iki 30€') priceMatch = priceNumber <= 30;
    if (selectedPrice === '30–50€') priceMatch = priceNumber > 30 && priceNumber <= 50;
    if (selectedPrice === 'Virš 50€') priceMatch = priceNumber > 50;

    const servicesMatch =
      selectedServices.length === 0 ||
      selectedServices.every(s => v.services.includes(s));

    return cityMatch && priceMatch && servicesMatch;
  });

  const visibleVendors = filteredVendors.slice(0, visibleCount);

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  // Add a handler for the "Ieškoti" button
  const handleSearch = (e) => {
    e.preventDefault();
    setVisibleCount(10);
    // Optionally, you could trigger analytics or scroll to vendor section here
    // Example: window.gtag && window.gtag('event', 'search', { city: selectedCity });
    const vendorSection = document.getElementById('vendor-section');
    if (vendorSection) {
      vendorSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <Header />
      <div className="relative w-full overflow-hidden mb-6">
        {/* Image with gradient overlay */}
        <div className="relative">
          <img
            src="/banner.jpg"
            alt="Verslo Daigynas hero banner"
            className="w-full h-[300px] sm:h-[350px] md:h-[400px] object-cover z-0 relative"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-600/40 z-10 pointer-events-none"></div>
        </div>

        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center px-4 sm:px-6 py-8 text-white z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl w-full"
          >
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 drop-shadow-md">
              Raskite patikimus verslo partnerius
            </h1>
            <p className="text-base md:text-xl opacity-90 max-w-2xl mx-auto mb-4 sm:mb-8 drop-shadow">
              Verslo Daigynas padeda jūsų verslui surasti geriausius adresų registravimo paslaugų teikėjus vienoje vietoje.
            </p>

            {/* Hero search */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.7, delay: 0.3 }}
              className="max-w-2xl mx-auto w-full mt-2 sm:mt-0"
            >
              <div className="bg-white rounded-xl shadow-lg p-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-grow">
                    <select 
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full py-2 sm:py-3 px-4 rounded-lg bg-gray-50 border-transparent focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all text-gray-800"
                      aria-label="Filtruoti pagal miestą"
                    >
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors shadow-sm flex-shrink-0"
                  >
                    Ieškoti
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      <AboutSection />

      <VendorRegistrationCTA />

      <UserBenefitsSection />

      <div className="max-w-6xl mx-auto px-6">
        <div className="relative w-full overflow-hidden mb-6 rounded-xl shadow">
          <img
            src="/kodelvertanaudotisverslodaigynu.jpg"
            alt="kodel verta naudotis verslo daigynu"
            className="w-full h-[200px] sm:h-[300px] md:h-[280px] object-cover"
          />
        </div>
      </div>

      <main className="max-w-5xl mx-auto p-6">
  {/* Main Heading with Animation */}
  <motion.h1 
    id="vendor-section" 
    className="text-3xl md:text-4xl font-bold mb-8 text-center relative"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
  >
    Paslaugos Verslui Vienoje Vietoje
    <div className="absolute w-24 h-1.5 bg-blue-600 bottom-0 left-1/2 transform -translate-x-1/2 -bottom-3 rounded-full"></div>
  </motion.h1>
  
  {/* Filter Menu - Enhanced */}
  <motion.div 
    className="bg-white border border-gray-200 rounded-xl px-6 py-5 mb-8 shadow-sm"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
  >
    <div className="flex items-center mb-4">
      <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"></path>
      </svg>
      <h2 className="text-lg font-semibold text-gray-800">Filtravimo galimybės</h2>
    </div>

    
    <div className="flex flex-wrap gap-6 items-start justify-start">
      {/* Miestas */}
      <div className="flex-grow min-w-[180px]">
        <label className="block font-medium text-gray-700 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-1.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
          </svg>
          Miestas
        </label>
        <div className="relative">
          <select
            value={selectedCity}
            onChange={(e) => {
              setSelectedCity(e.target.value);
              setVisibleCount(10);
            }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors pl-4 pr-10 shadow-sm hover:border-blue-400"
            aria-label="Pasirinkite miestą"
          >
            {cities.map((city, i) => (
              <option key={i} value={city}>{city}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Kaina */}
      <div className="flex-grow min-w-[180px]">
        <label className="block font-medium text-gray-700 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-1.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
          </svg>
          Kaina
        </label>
        <div className="relative">
          <select
            value={selectedPrice}
            onChange={(e) => {
              setSelectedPrice(e.target.value);
              setVisibleCount(10);
            }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors pl-4 pr-10 shadow-sm hover:border-blue-400"
            aria-label="Pasirinkite kainą"
          >
            {['Visos kainos', 'Iki 30€', '30–50€', 'Virš 50€'].map((p, i) => (
              <option key={i} value={p}>{p}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </div>
        </div>
      </div>

      {/* Paslaugos */}
      <div className="flex-grow min-w-[180px]">
        <label className="block font-medium text-gray-700 mb-2 flex items-center">
          <svg className="w-4 h-4 mr-1.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path>
            <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-3.76 0-7.17-.83-10-2.308z"></path>
          </svg>
          Paslauga
        </label>
        <div className="relative">
          <select
            value={selectedServices[0] || 'Visos paslaugos'}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedServices(value === 'Visos paslaugos' ? [] : [value]);
              setVisibleCount(10);
            }}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-500 transition-colors pl-4 pr-10 shadow-sm hover:border-blue-400"
            aria-label="Pasirinkite paslaugą"
          >
            <option value="Visos paslaugos">Visos paslaugos</option>
            {serviceOptions.map((service, i) => (
              <option key={i} value={service}>{service}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </div>
        </div>
      </div>
      
      {/* Reset Button */}
      {(selectedCity !== 'Visi miestai' || selectedPrice !== 'Visos kainos' || selectedServices.length > 0) && (
        <div className="flex items-end">
          <motion.button
            onClick={() => {
              setSelectedCity('Visi miestai');
              setSelectedPrice('Visos kainos');
              setSelectedServices([]);
              setVisibleCount(10);
            }}
            className="px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg flex items-center transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            aria-label="Išvalyti filtrus"
          >
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
            Išvalyti filtrus
          </motion.button>
        </div>
      )}
    </div>
    
    {/* Filter results summary - new component */}
    {(selectedCity !== 'Visi miestai' || selectedPrice !== 'Visos kainos' || selectedServices.length > 0) && (
      <div className="mt-4 pt-3 border-t border-gray-100">
        <div className="flex flex-wrap gap-2 items-center text-sm">
          <span className="text-gray-600">Filtravimo rezultatai:</span>
          
          {selectedCity !== 'Visi miestai' && (
            <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full flex items-center">
              <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"></path>
              </svg>
              {selectedCity}
            </span>
          )}
          
          {selectedPrice !== 'Visos kainos' && (
            <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full flex items-center">
              <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z"></path>
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd"></path>
              </svg>
              {selectedPrice}
            </span>
          )}
          
          {selectedServices.length > 0 && selectedServices.map((service, i) => (
            <span key={i} className="bg-green-50 text-green-700 px-3 py-1 rounded-full flex items-center">
              <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd"></path>
                <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-3.76 0-7.17-.83-10-2.308z"></path>
              </svg>
              {service}
            </span>
          ))}
          
          <span className="ml-auto text-blue-600 font-medium">
            {filteredVendors.length} {filteredVendors.length === 1 ? 'rezultatas' : 'rezultatai'}
          </span>
        </div>
      </div>
    )}
  </motion.div>

  {/* Results Grid with Animation */}
  <motion.div 
    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.4 }}
  >
    {visibleVendors.length > 0 ? (
      visibleVendors.map((vendor, i) => (
        <VendorCard
          key={vendor.id || i}
          name={vendor.name}
          city={vendor.city}
          services={vendor.services}
          price={vendor.price}
          website={vendor.website}
          logo={vendor.logo}
          description={vendor.description}
          email={vendor.email}
          phone={vendor.phone}
          googleReview={vendor.googleReview}
        />
      ))
    ) : (
      <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
        <svg className="w-16 h-16 text-gray-300 mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd"></path>
        </svg>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">Rezultatų nerasta</h3>
        <p className="text-gray-600 max-w-md">
          Pagal jūsų filtrus neradome jokių rezultatų. Bandykite pakeisti filtravimo kriterijus.
        </p>
        <button
          onClick={() => {
            setSelectedCity('Visi miestai');
            setSelectedPrice('Visos kainos');
            setSelectedServices([]);
          }}
          className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Išvalyti filtrus
        </button>
      </div>
    )}
  </motion.div>
  
  {/* Load More Button */}
  {visibleVendors.length < filteredVendors.length && (
    <motion.div 
      className="mt-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
    >
      <motion.button
        onClick={() => setVisibleCount(prev => prev + 10)}
        className="px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 rounded-lg shadow-sm transition-colors inline-flex items-center"
        whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
        whileTap={{ y: 0 }}
        aria-label="Rodyti daugiau rezultatų"
      >
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd"></path>
        </svg>
        Rodyti daugiau
      </motion.button>
    </motion.div>
  )}
<SimpleVendorCTA />

<IndustryNewsCarousel />

<ContentHighlightDivider />

<FAQ />

</main>

      <Footer />
    </>
    
  );
  
}
