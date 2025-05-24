// TODO: Add homepage code here
import React, { useState } from 'react';
import vendors from '../data/vendors';
import VendorCard from '../components/VendorCard';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AboutSection from '../components/AboutSection';
import UserBenefitsSection from '../components/UserBenefitsSection';

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

  return (
    <>
      <Header />
 <div className="relative w-full max-h-[400px] overflow-hidden mb-6 shadow">
  {/* Banner Image */}
  <img
    src="/banner.jpg"
    alt="Verslo Daigynas hero banner"
    className="w-full h-[250px] sm:h-[350px] object-cover"
  />

  {/* Overlay Content */}
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 text-center px-4">
    <h2 className="text-white text-xl sm:text-3xl font-bold mb-4">
      Sveiki atvykę į <span className="text-blue-300">Verslo Daigyną</span>
    </h2>
    <a
      href="#vendor-section"
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2 rounded-md shadow transition"
    >
      Surask savo verslui namus
    </a>
  </div>
</div>

<AboutSection />

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
        <h1 id="vendor-section" className="text-3xl font-bold mb-6 text-center">
  Paslaugos Verslui Vienoje Vietoje
</h1>
        {/* Filter Menu */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-6 flex flex-wrap gap-6 items-start justify-start text-sm">

          {/* Miestas */}
          <div>
            <label className="block font-medium text-gray-600 mb-1">Miestas</label>
            <select
              value={selectedCity}
              onChange={(e) => {
                setSelectedCity(e.target.value);
                setVisibleCount(10);
              }}
              className="px-3 py-1 border border-gray-300 rounded-md"
            >
              {cities.map((city, i) => (
                <option key={i} value={city}>{city}</option>
              ))}
            </select>
          </div>

          {/* Kaina */}
          <div>
            <label className="block font-medium text-gray-600 mb-1">Kaina</label>
            <select
              value={selectedPrice}
              onChange={(e) => {
                setSelectedPrice(e.target.value);
                setVisibleCount(10);
              }}
              className="px-3 py-1 border border-gray-300 rounded-md"
            >
              {['Visos kainos', 'Iki 30€', '30–50€', 'Virš 50€'].map((p, i) => (
                <option key={i} value={p}>{p}</option>
              ))}
            </select>
          </div>

         {/* Paslaugos */}
<div>
  <label className="block font-medium text-gray-600 mb-1">Paslauga</label>
  <select
    value={selectedServices[0] || 'Visos paslaugos'}
    onChange={(e) => {
      const value = e.target.value;
      setSelectedServices(value === 'Visos paslaugos' ? [] : [value]);
      setVisibleCount(10);
    }}
    className="px-3 py-1 border border-gray-300 rounded-md"
  >
    <option value="Visos paslaugos">Visos paslaugos</option>
    {serviceOptions.map((service, i) => (
      <option key={i} value={service}>{service}</option>
    ))}
  </select>
</div>
        </div>

        {/* Vendor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {visibleVendors.map((vendor, i) => (
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
/>
          ))}
        </div>

        {/* Load More Button */}
        {visibleCount < filteredVendors.length && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              className="px-5 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition"
            >
              Rodyti daugiau
            </button>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
