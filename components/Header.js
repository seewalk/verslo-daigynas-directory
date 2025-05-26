// TODO: Add header component code here
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';


const Header = () => {
  const [language, setLanguage] = useState('lt');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [stickManPosition, setStickManPosition] = useState(-40); // Start offscreen
  const [stickManState, setStickManState] = useState('walking'); // 'walking', 'entering', 'inside'
  const animationRef = useRef(null);
  const headerRef = useRef(null);
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Animate stick man
  useEffect(() => {
    // Start the animation after a brief delay
    const startDelay = setTimeout(() => {
      if (animationRef.current) return;
      
      // Set up animation interval
      let position = -40; // Start off-screen to the left
      let housePosition = 0; // Will be calculated later
      let startTime = Date.now();
      const speed = 3; // Pixels to move per frame
      const animationDuration = 3000; // 3 seconds until house entry
      
      animationRef.current = setInterval(() => {
        // Get header width to determine house position
        if (headerRef.current && housePosition === 0) {
          const headerWidth = headerRef.current.offsetWidth;
          // Position house at 80% of header width
          housePosition = headerWidth * 0.8;
        }
        
        // Calculate how far along we are in the animation
        const elapsedTime = Date.now() - startTime;
        
        // If time's up and stick man is still walking, start entering the house
        if (elapsedTime >= animationDuration && stickManState === 'walking' && position < housePosition - 10) {
          // If we're not close to the house yet, speed up to get there
          position += speed * 2;
          setStickManPosition(position);
        } 
        // Normal walking until we reach the house
        else if (stickManState === 'walking' && position < housePosition - 10) {
          position += speed;
          setStickManPosition(position);
        } 
        // Entering the house
        else if (stickManState === 'walking' && position >= housePosition - 10) {
          setStickManState('entering');
          
          // Give stick man time to enter house
          setTimeout(() => {
            setStickManState('inside');
            // Clear the interval as animation is done
            if (animationRef.current) {
              clearInterval(animationRef.current);
              animationRef.current = null;
            }
          }, 500);
        }
      }, 50);
      
      return () => {
        if (animationRef.current) {
          clearInterval(animationRef.current);
          animationRef.current = null;
        }
      };
    }, 100); // Short delay to ensure component is fully mounted
    
    // Clean up on component unmount
    return () => {
      clearTimeout(startDelay);
      if (animationRef.current) {
        clearInterval(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [stickManState]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'lt' ? 'en' : 'lt'));
    // Add i18n logic here later
  };

  // Stick man animation frames
  const stickManFrame = () => {
    // Different rendering based on state
    switch(stickManState) {
      case 'entering':
        // Entering house pose (leaning forward)
        return (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600 scale-90 origin-bottom">
            <circle cx="12" cy="6" r="4" />
            <line x1="12" y1="10" x2="14" y2="16" />
            <line x1="14" y1="16" x2="12" y2="20" />
            <line x1="14" y1="16" x2="16" y2="18" />
            <line x1="8" y1="13" x2="16" y2="13" />
          </svg>
        );
      case 'inside':
        // Inside house (hidden)
        return null;
      default:
        // Regular walking poses, alternating based on position
        return (stickManPosition / 15) % 2 === 0 ? (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
            <circle cx="12" cy="6" r="4" />
            <line x1="12" y1="10" x2="12" y2="16" />
            <line x1="12" y1="16" x2="9" y2="20" />
            <line x1="12" y1="16" x2="15" y2="20" />
            <line x1="8" y1="14" x2="16" y2="14" />
          </svg>
        ) : (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
            <circle cx="12" cy="6" r="4" />
            <line x1="12" y1="10" x2="12" y2="16" />
            <line x1="12" y1="16" x2="8" y2="19" />
            <line x1="12" y1="16" x2="16" y2="19" />
            <line x1="7" y1="13" x2="17" y2="13" />
          </svg>
        );
    }
  };

  // House SVG component
  const House = () => (
    <div className="absolute top-1/2 right-[20%] transform -translate-y-1/3">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-blue-700">
        {/* Roof */}
        <path d="M3 12L12 5L21 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {/* House body */}
        <rect x="6" y="10" width="12" height="10" stroke="currentColor" strokeWidth="2" />
        {/* Door */}
        <rect x="10" y="14" width="4" height="6" stroke="currentColor" strokeWidth="1.5" />
        {/* Window */}
        <rect x="8" y="11" width="2" height="2" stroke="currentColor" strokeWidth="1" />
        <rect x="14" y="11" width="2" height="2" stroke="currentColor" strokeWidth="1" />
        
        {/* Light from inside the house - visible when stick man is inside */}
        {stickManState === 'inside' && (
          <rect x="10.5" y="15" width="3" height="3" fill="#FFEB3B" stroke="none" />
        )}
      </svg>
    </div>
  );

  return (
    <motion.header 
      ref={headerRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 15 }}
      className={`relative top-0 left-0 right-0 z-50 transition-all duration-300 overflow-hidden ${
        scrolled 
          ? 'bg-white shadow-md py-2' 
          : 'bg-gray-50/90 backdrop-blur-sm border-b border-gray-200 py-3'
      }`}
    >
      {/* House */}
      <House />
      
      {/* Stick Man Animation */}
      <div 
        className="absolute top-1/2 transform -translate-y-1/2 transition-none"
        style={{ 
          left: `${stickManPosition}px`,
          opacity: stickManState === 'inside' ? 0 : 1,
          transition: stickManState === 'entering' ? 'opacity 0.5s' : 'none'
        }}
      >
        {stickManFrame()}
      </div>
      
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between relative">
        {/* Logo + Brand */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <motion.div 
              whileHover={{ rotate: 10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            >
              <img
                src="/logo.png"
                alt="Verslų Daigyno logotipas"
                className="w-10 h-10 object-contain rounded-md border border-gray-100 shadow-sm group-hover:shadow-md transition-all"
              />
            </motion.div>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white hidden sm:block"></div>
          </div>
          <div>
            <span className="font-bold text-gray-800 text-lg">Verslo Daigynas</span>
            <span className="hidden sm:block text-xs text-blue-600 font-medium">Jūsų verslo partneris</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <nav>
            <ul className="flex items-center space-x-6">
              <li>
                <a 
                  href="/index" 
                  className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors relative group"
                >
                  Pradžia
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </a>
              </li>
              <li>
                <a 
                  href="/apie-mus"
                  className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors relative group"
                >
                  Apie mus
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </a>
              </li>
              <li>
                <a 
                  href="/verslo-naujienos"
                  className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors relative group"
                >
                  Verslo naujienos
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </a>
              </li>
              <li>
                <a 
                  href="/kontaktai" 
                  className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors relative group"
                >
                  Kontaktai
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </a>
              </li>
            </ul>
          </nav>
          
          {/* Language Toggle */}
          <motion.button
            onClick={toggleLanguage}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1 text-sm rounded-md flex items-center gap-1.5 font-medium transition-all ${
              language === 'lt' 
                ? 'bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100' 
                : 'bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100'
            }`}
            aria-label="Perjungti kalbą"
          >
            <span className="hidden sm:inline">{language === 'lt' ? 'English' : 'Lietuvių'}</span>
            <span className="sm:hidden">{language === 'lt' ? 'EN' : 'LT'}</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </motion.button>
        </div>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t border-gray-100"
          >
            <div className="px-4 py-3 space-y-3">
              <nav>
                <ul className="space-y-3 py-2">
                  <li>
                    <a 
                      href="#" 
                      className="block px-2 py-1.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Pradžia
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#about" 
                      className="block px-2 py-1.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Apie mus
                    </a>
                  </li>
                  <li>
                <a 
                  href="/verslo-naujienos"
                  className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors relative group"
                >
                  Verslo naujienos
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
                </a>
              </li>
                  <li>
                    <a 
                      href="#contact" 
                      className="block px-2 py-1.5 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Kontaktai
                    </a>
                  </li>
                </ul>
              </nav>
              
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <span className="text-xs text-gray-500">Verslo Daigynas © 2023</span>
                
                {/* Mobile Language Toggle */}
                <button
                  onClick={toggleLanguage}
                  className={`px-3 py-1 text-sm rounded-md font-medium ${
                    language === 'lt' 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'bg-indigo-50 text-indigo-700'
                  }`}
                  aria-label="Perjungti kalbą"
                >
                  {language === 'lt' ? 'EN' : 'LT'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Add some space after the header to account for fixed positioning */}
      <div className="h-16" /> 
    </motion.header>
  );
};

export default Header;
