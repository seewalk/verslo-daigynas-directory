import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { motion } from 'framer-motion';
import vendors from '../../data/vendors.json';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import VendorRegistrationCTA from '../../components/VendorRegistrationCTA';
import ContentHighlightDivider from '../../components/ContentHighLightDivider';

export default function VendorProfile() {
  const router = useRouter();
  const { id } = router.query;

  // Find the vendor by normalized name/slug
  const vendor = vendors.find(v => v.name.toLowerCase().replace(/\s+/g, '-') === id);

  // Handle loading state and not found case
  if (router.isFallback || !vendor) {
    return (
      <>
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            {router.isFallback ? 'Kraunama...' : 'Tiekėjas nerastas'}
          </h1>
          {!router.isFallback && (
            <button 
              onClick={() => router.push('/')} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Grįžti į pradžią
            </button>
          )}
        </div>
        <Footer />
      </>
    );
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 10 }
    }
  };

  // Function to render star ratings
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <svg 
            key={i} 
            className={`w-5 h-5 ${i < Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{vendor.name} - Verslo Daigynas</title>
        <meta name="description" content={`${vendor.name} - ${vendor.services.join(', ')}. ${vendor.description.substring(0, 120)}...`} />
      </Head>

      <Header />
      
      {/* Hero Banner with gradient overlay */}
      <div className="relative w-full overflow-hidden mb-6">
        <div className="relative">
          <img
            src={vendor.bannerImage || "/vendor-banner.jpg"} // Use vendor banner if available or fallback
            alt={`${vendor.name} banner`}
            className="w-full h-[300px] sm:h-[350px] md:h-[400px] object-cover z-0 relative"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-600/40 z-10 pointer-events-none"></div>
        </div>

        {/* Hero content with vendor name */}
        <div className="absolute inset-0 flex flex-col justify-center items-center px-4 sm:px-6 py-8 text-white z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl w-full"
          >
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 drop-shadow-md">
              {vendor.name}
            </h1>
            <p className="text-base md:text-xl opacity-90 max-w-2xl mx-auto mb-4 sm:mb-8 drop-shadow">
              {vendor.city} • {vendor.services.join(', ')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* "Claim Your Listing" Banner */}
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6 mb-8 relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full bg-white opacity-10"></div>
          <div className="absolute -bottom-10 right-10 w-32 h-32 rounded-full bg-white opacity-10"></div>
          
          <div className="flex flex-col md:flex-row items-center justify-between relative z-10">
            <div className="mb-4 md:mb-0 md:mr-6">
              <h3 className="text-xl font-bold text-white mb-2">Ar jūs esate šios įmonės atstovas?</h3>
              <p className="text-blue-100">Pretenduokite į šį įrašą, kad galėtumėte valdyti įmonės informaciją</p>
            </div>
            <motion.a
              href={`/pretenduoti?id=${vendor.id}`}
              className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium shadow-sm flex items-center whitespace-nowrap flex-shrink-0"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Pretenduoti į įrašą
            </motion.a>
          </div>
        </motion.div>

        {/* Logo and Basic Info Section */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Left column with logo */}
          <motion.div 
            className="lg:col-span-4"
            variants={itemVariants}
          >
            <div className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center">
              <img
                src={vendor.logo || '/logo.png'}
                alt={`${vendor.name} logo`}
                className="w-full max-w-xs object-contain h-48 mb-6"
              />
              
              {/* Website Button */}
              <motion.a
                href={vendor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center w-full"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-label={`Visit ${vendor.name}'s website`}
              >
                <span className="relative z-10 flex items-center">
                  Apsilankyti svetainėje
                  <svg className="w-4 h-4 ml-2 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </span>
              </motion.a>
            </div>
            
            {/* Contact Information Card */}
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md mt-6"
              variants={itemVariants}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Kontaktai
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href={`mailto:${vendor.email}`} className="text-blue-600 hover:underline">
                    {vendor.email}
                  </a>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href={`tel:${vendor.phone}`} className="text-blue-600 hover:underline">
                    {vendor.phone}
                  </a>
                </div>
                
                <div className="flex items-center text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{vendor.city}</span>
                </div>
              </div>
            </motion.div>

            {/* Google Reviews Summary */}
            {vendor.googleReview && (
              <motion.div 
                className="bg-white p-6 rounded-xl shadow-md mt-6"
                variants={itemVariants}
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Google įvertinimas
                </h3>
                
                <div className="flex items-center mb-2">
                  {renderStars(vendor.googleReview.rating)}
                  <span className="ml-2 font-semibold text-gray-800">
                    {vendor.googleReview.rating.toFixed(1)}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-2">
                  Pagrįsta {vendor.googleReview.reviewCount} atsiliepimais
                </p>
              </motion.div>
            )}
          </motion.div>
          
          {/* Right column with description and services */}
          <motion.div 
            className="lg:col-span-8"
            variants={itemVariants}
          >
            <div className="bg-white p-6 md:p-8 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 pb-3 border-b border-gray-100">Apie {vendor.name}</h2>
              <div className="prose prose-blue max-w-none text-gray-700 mb-8">
                <p>{vendor.description}</p>
              </div>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Teikiamos paslaugos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                {vendor.services.map((service, i) => (
                  <div key={i} className="flex items-center text-gray-700">
                    <svg className="w-5 h-5 mr-2 text-blue-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{service}</span>
                  </div>
                ))}
              </div>
              
              {vendor.price && (
                <>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Kainodara</h3>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mb-8">
                    <p className="text-gray-700">{vendor.price}</p>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
        
        {/* Google Reviews Section */}
        {vendor.googleReview && vendor.googleReview.reviews && vendor.googleReview.reviews.length > 0 && (
          <motion.section 
            className="mb-16"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            viewport={{ once: true }}
          >
            <motion.h2 
              className="text-3xl font-bold text-gray-800 mb-8 text-center"
              variants={itemVariants}
            >
              Atsiliepimai
            </motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendor.googleReview.reviews.map((review, index) => (
                <motion.div 
                  key={index}
                  className="bg-white p-6 rounded-xl shadow-md"
                  variants={itemVariants}
                >
                  <div className="flex mb-3">
                    {renderStars(review.rating)}
                  </div>
                  <p className="text-gray-600 italic mb-4">"{review.text}"</p>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">- {review.author}</span>
                    {review.date && <span className="text-sm text-gray-500">{review.date}</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
        
        {/* Back to vendors button */}
        <div className="text-center mt-12 mb-8">
          <motion.a
            href="/"
            className="inline-block border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-6 rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Grįžti į sąrašą
            </span>
          </motion.a>
        </div>
      </div>
      
      <VendorRegistrationCTA />

      <ContentHighlightDivider />

      <Footer />
    </>
  );
}

export async function getStaticPaths() {
  // Generate paths for all vendors
  const paths = vendors.map(vendor => ({
    params: { id: vendor.name.toLowerCase().replace(/\s+/g, '-') }
  }));
  
  return { paths, fallback: true };
}

export async function getStaticProps({ params }) {
  // Find the vendor data
  const vendor = vendors.find(v => v.name.toLowerCase().replace(/\s+/g, '-') === params.id);
  
  // If vendor not found, return 404
  if (!vendor) {
    return { notFound: true };
  }
  
  return {
    props: { vendor },
    // Re-generate the page at most once per day
    revalidate: 86400,
  };
}
