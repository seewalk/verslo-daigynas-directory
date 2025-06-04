// components/FeatureCard.js
import React from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ feature, index }) => {
  const { title, description, icon, isAvailable, comingSoon } = feature;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-500 border border-gray-200 relative overflow-hidden group"
    >
      {/* Top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      
      {/* Feature badge */}
      {!isAvailable && comingSoon && (
        <span className="absolute right-3 top-3 bg-amber-500 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
          Jau greitai
        </span>
      )}
      
      {/* Icon */}
      <div className="mb-5 p-3 bg-blue-50 inline-flex rounded-xl transform transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110">
        {icon}
      </div>
      
      {/* Content */}
      <h4 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors duration-300">
        {title}
      </h4>
      
      <p className="text-gray-600 leading-relaxed">
        {description}
      </p>
      
      {/* Available indicator */}
      <div className="mt-4 flex items-center">
        {isAvailable ? (
          <span className="text-sm text-green-600 font-medium flex items-center">
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Jau veikia
          </span>
        ) : (
          <span className="text-sm text-amber-600 font-medium flex items-center">
            <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Ruošiama
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default FeatureCard;