import React from 'react';
import { motion } from 'framer-motion';

const SimpleVendorCTA = () => {
  return (
    <section className="py-10 px-4 relative overflow-hidden">
      {/* Decorative accent line */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-blue-600 rounded-full"></div>
      
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Left side - background pattern */}
            <div className="hidden md:block absolute left-0 top-0 h-full w-1/3 opacity-10">
              <div className="absolute left-0 top-0 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-white"></div>
              <div className="absolute right-0 bottom-0 transform translate-x-1/3 translate-y-1/3 w-32 h-32 rounded-full bg-white"></div>
            </div>
            
            {/* Content */}
            <div className="md:w-8/12 p-6 md:p-8 text-white z-10">
              <motion.h3 
                className="text-xl md:text-2xl font-bold mb-2"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Ar teikiate paslaugas verslui?
              </motion.h3>
              <motion.p
                className="text-blue-100 mb-0"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Prisijunkite prie Verslo Daigyno ir pasiekite daugiau potencialių klientų.
              </motion.p>
            </div>
            
            {/* Button */}
            <div className="p-6 md:p-8 md:pr-10">
              <motion.a
                href="/registracija/tiekejai"
                className="inline-flex items-center justify-center whitespace-nowrap bg-white text-blue-700 px-5 py-2.5 rounded-lg font-medium shadow-sm hover:shadow hover:bg-gray-100 transition-all"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ y: -2, shadow: "0 4px 8px rgba(0,0,0,0.1)" }}
                whileTap={{ y: 0 }}
              >
                Registruotis kaip tiekėjas
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimpleVendorCTA;
