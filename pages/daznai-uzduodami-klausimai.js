import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FAQ from '../components/FAQ';
import FaqIntroduction from '../components/FaqIntroduction';

const FAQPage = () => {
  // Animation variants - match the style from other components
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

  return (
    <>
      <Header />
      
      {/* Hero Banner with gradient overlay - exactly matching provided design */}
      <div className="relative w-full overflow-hidden mb-6">
        {/* Image with gradient overlay */}
        <div className="relative">
          <img
            src="/faq-banner.jpg"
            alt="Dažnai užduodami klausimai"
            className="w-full h-[300px] sm:h-[350px] md:h-[400px] object-cover z-0 relative"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-600/40 z-10 pointer-events-none"></div>
        </div>

        {/* Hero content - exactly matching provided structure */}
        <div className="absolute inset-0 flex flex-col justify-center items-center px-4 sm:px-6 py-8 text-white z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl w-full"
          >
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 drop-shadow-md">
              Dažnai užduodami klausimai
            </h1>
            <p className="text-base md:text-xl opacity-90 max-w-2xl mx-auto mb-4 sm:mb-8 drop-shadow">
              Raskite atsakymus į dažniausiai užduodamus klausimus apie mūsų paslaugas
            </p>
          </motion.div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* FAQ Introduction Component */}
        <FaqIntroduction />
        
        {/* FAQ Container - styled like other content containers */}
        <motion.div 
          className="bg-white rounded-xl shadow-lg p-6 md:p-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <FAQ />
        </motion.div>
        
        {/* Contact Section - styled consistently with other sections */}
        <motion.div
          className="bg-gray-50 border border-gray-200 rounded-xl p-6 md:p-8 shadow-sm mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.h2 
            className="text-2xl font-semibold text-gray-800 mb-4"
            variants={itemVariants}
          >
            Neradote atsakymo?
          </motion.h2>
          
          <motion.p 
            className="text-gray-600 mb-6"
            variants={itemVariants}
          >
            Jeigu neradote atsakymo į savo klausimą, susisiekite su mumis ir mes mielai padėsime.
          </motion.p>
          
          <motion.div 
            className="flex flex-wrap gap-4"
            variants={itemVariants}
          >
            <Link 
              href="/contact" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors shadow-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Susisiekite su mumis
            </Link>
          </motion.div>
        </motion.div>
      </div>
      
      <Footer />
    </>
  );
};

export default FAQPage;

