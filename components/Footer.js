// TODO: Add footer component code here
import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
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
  
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 pt-12 pb-6 border-t border-gray-200">
      <motion.div 
        className="max-w-6xl mx-auto px-4 sm:px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={containerVariants}
      >
        {/* Footer main content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          {/* Column 1: About */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <img
                  src="/logo.png"
                  alt="Verslų Daigyno logotipas"
                  className="w-10 h-10 object-contain rounded-md border border-gray-100 shadow-sm"
                />
              </div>
              <div className="font-bold text-gray-800 text-xl">Verslo Daigynas</div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Verslo Daigynas – tai iniciatyva, gimusi iš poreikio suteikti lengvesnį startą mažiems verslams.
            </p>
            <div className="flex space-x-3">
              {/* Social media icons */}
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-200 hover:bg-blue-600 hover:text-white text-gray-600 p-2 rounded-full transition-colors duration-300"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-200 hover:bg-blue-700 hover:text-white text-gray-600 p-2 rounded-full transition-colors duration-300"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-gray-200 hover:bg-sky-500 hover:text-white text-gray-600 p-2 rounded-full transition-colors duration-300"
                aria-label="Twitter"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            </div>
          </motion.div>
          
          {/* Column 2: Navigation */}
          <motion.div variants={itemVariants} className="col-span-1">
            <h3 className="font-semibold text-gray-800 text-lg mb-4">Navigacija</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/index" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Pradžia
                </a>
              </li>
              <li>
                <a href="/apie-mus" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Apie mus
                </a>
              </li>
              <li>
                <a href="/paslaugos" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Paslaugos
                </a>
              </li>
              <li>
                <a href="/kontaktai" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Kontaktai
                </a>
              </li>
              <li>
                <a href="/verslo-naujienos" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Verslo naujienos
                </a>
              </li>
              <li>
                <a href="/daznai-uzduodami-klausimai" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  DUK
                </a>
              </li>
            </ul>
          </motion.div>
          
          {/* Column 3: Resources */}
          <motion.div variants={itemVariants} className="col-span-1">
            <h3 className="font-semibold text-gray-800 text-lg mb-4">Ištekliai</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/sitemap.xml" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Sitemap
                </a>
              </li>
              <li>
                <a href="/robots.txt" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Robots.txt
                </a>
              </li>
              <li>
                <a href="/privatumo-politika" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Privatumo politika
                </a>
              </li>
              <li>
                <a href="/naudojimo-salygos" className="text-gray-600 hover:text-blue-600 transition-colors flex items-center">
                  <svg className="w-3 h-3 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Naudojimo sąlygos
                </a>
              </li>
            </ul>
          </motion.div>
          
          {/* Column 4: Contact */}
          <motion.div variants={itemVariants} className="col-span-1 md:col-span-1">
            <h3 className="font-semibold text-gray-800 text-lg mb-4">Susisiekite</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span className="text-gray-600">
                  Verslo Daigyno g. 1<br />
                  LT-12345 Vilnius, Lietuva
                </span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <a href="mailto:info@verslodaigynas.lt" className="text-gray-600 hover:text-blue-600 transition-colors">
                  info@verslodaigynas.lt
                </a>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <a href="tel:+37060000000" className="text-gray-600 hover:text-blue-600 transition-colors">
                  +370 6000 0000
                </a>
              </li>
            </ul>
            
            {/* Newsletter Signup */}
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Gaukite naujienas</h4>
              <form className="flex">
                <input 
                  type="email" 
                  placeholder="Jūsų el. paštas" 
                  className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 flex-grow"
                  required
                />
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 text-sm font-medium rounded-r-md transition-colors"
                >
                  Užsirašyti
                </button>
              </form>
            </div>
          </motion.div>
        </div>
        
        {/* Bottom bar with copyright */}
        <motion.div 
          variants={itemVariants}
          className="pt-6 mt-6 border-t border-gray-200 text-center md:flex md:justify-between md:text-left"
        >
          <p className="text-sm text-gray-600">
            &copy; {currentYear} Verslo Daigynas. Visos teisės saugomos.
          </p>
          <div className="mt-3 md:mt-0 flex justify-center md:justify-end space-x-4 text-xs text-gray-500">
            <a href="/privatumo-politika" className="hover:text-blue-600 transition-colors">Privatumas</a>
            <span className="text-gray-300">|</span>
            <a href="/slapukai" className="hover:text-blue-600 transition-colors">Slapukai</a>
            <span className="text-gray-300">|</span>
            <a href="/accessibility" className="hover:text-blue-600 transition-colors">Prieinamumas</a>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Back to top button */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="bg-blue-600 text-white p-2 rounded-full shadow-lg fixed bottom-6 right-6 z-30 hover:bg-blue-700 transition-colors"
        aria-label="Back to top"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
        </svg>
      </motion.button>
    </footer>
  );
};

export default Footer;
