import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import AuthModal from './AuthModal'; // Import the AuthModal component

const Header = () => {
  const [language, setLanguage] = useState('lt');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [stickManPosition, setStickManPosition] = useState(-40); // Start offscreen
  const [stickManState, setStickManState] = useState('walking'); // 'walking', 'entering', 'inside'
  const animationRef = useRef(null);
  const headerRef = useRef(null);

  // New state for auth modal
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' or 'register'

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

  // StickMan animation with requestAnimationFrame
  useEffect(() => {
    let walkingSpeed = 0.7;
    let targetPosition = -40;
    let frameCount = 0;
    let frameDuration = 1000 / 60; // 60fps
    let lastTime = 0;

    const animate = (time) => {
      if (lastTime === 0) lastTime = time;
      const elapsed = time - lastTime;

      if (elapsed > frameDuration) {
        lastTime = time;

        // Only animate if the menu is closed
        if (!menuOpen) {
          frameCount += 1;

          // Change target position based on mouse hover
          if (stickManState === 'walking') {
            targetPosition = -40;
          } else if (stickManState === 'entering') {
            targetPosition = -15;
          } else if (stickManState === 'inside') {
            targetPosition = -5;
          }

          // Smoothly move stick man position toward target
          setStickManPosition(current => {
            if (Math.abs(current - targetPosition) < 0.5) {
              return targetPosition;
            }
            return current + (targetPosition - current) * 0.08;
          });
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [menuOpen, stickManState]);

  // Functions to open auth modal
  const openLoginModal = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);

    // Close mobile menu if open
    if (menuOpen) {
      setMenuOpen(false);
    }
  };

  const openRegisterModal = () => {
    setAuthModalTab('register');
    setIsAuthModalOpen(true);

    // Close mobile menu if open
    if (menuOpen) {
      setMenuOpen(false);
    }
  };

  return (
    <header 
      ref={headerRef}
      className={`sticky top-0 z-30 w-full transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-2' : 'bg-white/95 py-3'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex justify-between items-center">
        {/* Logo */}
        <Link href="/">
          <div className="relative flex items-center cursor-pointer">
            {/* StickMan Animation */}
            <div 
              className="absolute right-[-10px] bottom-[-2px] h-10 w-10 overflow-visible"
              onMouseEnter={() => setStickManState('entering')}
              onMouseLeave={() => setStickManState('walking')}
            >
              <div 
                className="absolute bottom-0"
                style={{ 
                  transform: `translateX(${stickManPosition}px)`,
                  transition: 'transform 0.1s ease-out'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" className="text-blue-700">
                  <circle cx="12" cy="4" r="4" fill="currentColor" />
                  <path
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    d="M12 8v8m-4-4h8m-8 8l4-8m4 8l-4-8"
                  />
                </svg>
              </div>
            </div>

            {/* Logo Text */}
            <div className="flex flex-col">
              <span className="text-blue-700 font-bold text-lg sm:text-xl leading-none">
                Verslo Daigynas
              </span>
              <span className="text-gray-500 text-xs sm:text-sm leading-tight">
                Verslo adresÅ³ platforma
              </span>
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex items-center space-x-6">
            <Link 
              href="/" 
              className="text-gray-800 hover:text-blue-600 font-medium transition-colors"
            >
              Pagrindinis
            </Link>
            <Link 
              href="/paslaugos" 
              className="text-gray-800 hover:text-blue-600 font-medium transition-colors"
            >
              Paslaugos
            </Link>
            <Link 
              href="/apie-mus" 
              className="text-gray-800 hover:text-blue-600 font-medium transition-colors"
            >
              Apie mus
            </Link>
            <Link 
              href="/duk" 
              className="text-gray-800 hover:text-blue-600 font-medium transition-colors"
            >
              DUK
            </Link>
            <Link 
              href="/kontaktai" 
              className="text-gray-800 hover:text-blue-600 font-medium transition-colors"
            >
              Kontaktai
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {/* Language Switcher */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="appearance-none bg-transparent pl-2 pr-8 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
              >
                <option value="lt">LT</option>
                <option value="en">EN</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Auth Button - NEW */}
            <button 
              onClick={openLoginModal}
              className="text-blue-600 hover:text-blue-800 border border-blue-600 hover:border-blue-800 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Prisijungti / Registruotis
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-white border-t"
          >
            <div className="max-w-6xl mx-auto px-4 py-3">
              <nav className="flex flex-col space-y-3">
                <Link
                  href="/"
                  className="text-gray-800 hover:text-blue-600 font-medium py-2 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Pagrindinis
                </Link>
                <Link
                  href="/paslaugos"
                  className="text-gray-800 hover:text-blue-600 font-medium py-2 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Paslaugos
                </Link>
                <Link
                  href="/apie-mus"
                  className="text-gray-800 hover:text-blue-600 font-medium py-2 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Apie mus
                </Link>
                <Link
                  href="/duk"
                  className="text-gray-800 hover:text-blue-600 font-medium py-2 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  DUK
                </Link>
                <Link
                  href="/kontaktai"
                  className="text-gray-800 hover:text-blue-600 font-medium py-2 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Kontaktai
                </Link>

                {/* Auth Option in Mobile Menu - NEW */}
                <button
                  onClick={openLoginModal}
                  className="text-blue-600 hover:text-blue-800 font-medium py-2 text-left transition-colors"
                >
                  Prisijungti / Registruotis
                </button>

                <div className="py-2">
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="appearance-none bg-transparent pl-2 pr-8 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="lt">LietuviÅ³</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal Integration - NEW */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        initialTab={authModalTab} 
      />
    </header>
  );
};

export default Header;