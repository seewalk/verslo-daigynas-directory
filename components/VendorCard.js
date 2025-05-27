import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';



/**
 * VendorCard component with Google reviews
 * @param {Object} props - Component props
 * @param {string} props.id - Unique vendor ID (used for dynamic routing)
 * @param {string} props.name - Vendor name
 * @param {string} props.city - Vendor city
 * @param {Array} props.services - Vendor services
 * @param {string} props.price - Vendor price
 * @param {string} props.website - Vendor website
 * @param {string} props.logo - Vendor logo URL
 * @param {string} props.description - Vendor description
 * @param {string} props.email - Vendor email
 * @param {string} props.phone - Vendor phone
 * @param {Object} props.googleReview - Google review data
 * @param {number} props.googleReview.rating - Rating out of 5
 * @param {number} props.googleReview.reviewCount - Number of reviews
 * @param {Array} props.googleReview.reviews - Sample reviews (optional)
 * @returns {JSX.Element} The VendorCard component
 */
const VendorCard = ({
  id,
  name,
  city,
  services,
  price,
  website,
  logo,
  description,
  email,
  phone,
  googleReview,
  showProfileButton = true
}) => {

  console.log("Google review for", name, googleReview);
  // Handle keyboard focus for accessibility
  const handleCardFocus = (e) => {
    if (e.key === 'Enter') {
      window.open(website, '_blank', 'noopener,noreferrer');
    }
  };

  // Generate stars for ratings
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`star-${i}`} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    // Half star
    if (hasHalfStar) {
      stars.push(
        <svg key="half-star" className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="half-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill="url(#half-gradient)" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    }
    
    // Empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between h-full overflow-hidden relative text-sm group"
      tabIndex={0}
      onKeyDown={handleCardFocus}
      role="article"
      aria-label={`${name} vendor information`}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      
      <div className="space-y-4 relative z-10">
        {/* Header with logo */}
        <div className="flex items-start gap-4">
          <motion.div 
            className="flex-shrink-0"
            whileHover={{ scale: 1.05, rotate: 3 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            {logo ? (
              <div className="relative rounded-md overflow-hidden border border-gray-100 shadow-sm bg-white p-1">
                <img 
                  src={logo} 
                  alt={`${name} logo`}
                  loading="lazy" 
                  className="w-14 h-14 object-contain"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/5 to-transparent"></div>
              </div>
            ) : (
              <div className="w-14 h-14 rounded-md bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-400 border border-gray-100 shadow-sm">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                </svg>
              </div>
            )}
          </motion.div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 line-clamp-2 mb-1 group-hover:text-blue-700 transition-colors duration-300">{name}</h3>
            
            {/* Google Reviews Section */}
            {googleReview && (
              <div className="flex items-center mb-2">
                <div className="flex mr-1">
                  {renderStars(googleReview.rating)}
                </div>
                <span className="text-sm text-gray-600">
                  {googleReview.rating.toFixed(1)} ({googleReview.reviewCount})
                </span>
                <a 
                  href={`https://www.google.com/search?q=${encodeURIComponent(name + ' ' + city)}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="ml-1"
                >
                  <img 
                    src="https://www.gstatic.com/images/branding/googlelogo/svg/googlelogo_clr_74x24px.svg" 
                    alt="Google" 
                    className="h-3 w-auto"
                  />
                </a>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {city}
              </span>
              <span className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {price}
              </span>
            </div>
          </div>
        </div>

        {/* Featured Google Reviews */}
        {googleReview && googleReview.reviews && googleReview.reviews.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
            <div className="flex items-center mb-2">
              <svg className="w-4 h-4 text-gray-500 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd"></path>
              </svg>
              <span className="font-medium text-gray-700">Google Įvertinimai</span>
            </div>
            {/* Show only the first review */}
            <div className="text-gray-600 text-xs italic line-clamp-2">
              "{googleReview.reviews[0].text}"
            </div>
            <div className="text-right mt-1">
              <a 
                href={`https://www.google.com/search?q=${encodeURIComponent(name + ' ' + city)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Skaityti daugiau
              </a>
            </div>
          </div>
        )}

        {/* Description (Optional) */}
        {description && !googleReview?.reviews?.length && (
          <div className="bg-gray-50/50 rounded-lg p-3 border border-gray-100">
            <p className="text-gray-600 line-clamp-3 italic">{description}</p>
          </div>
        )}

        {/* Services */}
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 shadow-sm">
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1.5 text-blue-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-3.76 0-7.17-.83-10-2.308z" />
            </svg>
            Teikiamos paslaugos
          </h4>
          <ul className="space-y-1.5">
            {Array.isArray(services) && services.map((service, index) => (
              <li key={index} className="flex items-start">
                <svg className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-600">{service}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100 shadow-sm">
          <h4 className="font-semibold text-blue-700 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            Kontaktai
          </h4>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {phone && (
              <a 
                href={`tel:${phone}`} 
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors group"
              >
                <svg className="w-4 h-4 mr-1.5 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                {phone}
              </a>
            )}
            {email && (
              <a 
                href={`mailto:${email}`} 
                className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors group"
              >
                <svg className="w-4 h-4 mr-1.5 group-hover:animate-pulse" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                {email}
              </a>
            )}
          </div>
        </div>
      </div>

       {/* Website Button */}
    <motion.a
      href={website}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center relative overflow-hidden group"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      aria-label={`Visit ${name}'s website`}
    >
      <span className="relative z-10 flex items-center">
        Apsilankyti svetainėje
        <svg className="w-4 h-4 ml-2 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </span>
    </motion.a>
    
    {/* Profile Button - with updated URL path from /vendor/ to /tiekejai/ */}
    {showProfileButton && (
      <motion.a
        href={`/tiekejai/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))}`}
        className="border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center mt-2 w-full"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        aria-label={`View ${name}'s profile`}
      >
        <span className="relative z-10 flex items-center">
          Žiūrėti profilį
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </span>
      </motion.a>
    )}

    </motion.div>
  );
};

export default VendorCard;