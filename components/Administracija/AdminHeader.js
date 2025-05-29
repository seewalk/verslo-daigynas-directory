// components/Administracija/AdminHeader.js
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getAuth, signOut } from 'firebase/auth';
import { useAdminAuth } from '../../components/Contexts/AdminAuthContext'; // Adjust the import path as necessary

const AdminHeader = ({ transparent = false }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const auth = getAuth();
  const { adminUser } = useAdminAuth();
  const dropdownRef = React.useRef(null);

  // Navigation items for admin section
  const navigation = [
    { name: 'Valdymo Skydas', href: '/administracija/dashboard', current: router.pathname === '/administracija/dashboard' },
    { name: 'Tiekėjai', href: '/administracija/dashboard/tiekejai', current: router.pathname.startsWith('/administracija/dashboard/tiekejai') },
    { name: 'Verslo Prašymai', href: '/administracija/dashboard/claims', current: router.pathname.startsWith('/administracija/dashboard/claims') },
    { name: 'Vartotojai', href: '/administracija/dashboard/vartotojai', current: router.pathname.startsWith('/administracija/dashboard/vartotojai') },
  ];

  // Handle scroll events for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

  // Handle admin logout
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/administracija/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  // Animation variants for smooth transitions
  const mobileMenuVariants = {
    closed: { opacity: 0, height: 0 },
    open: { opacity: 1, height: 'auto' }
  };

  // Dynamic header style based on scroll position
  const headerClass = isScrolled || !transparent
    ? 'bg-white shadow dark:bg-gray-900'
    : 'bg-transparent';

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${headerClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3 md:justify-start md:space-x-10">
          {/* Logo section */}
          <div className="flex justify-start lg:w-0 lg:flex-1">
            <Link 
            href="/administracija/dashboard">
              <a className="flex items-center">
                <span className="sr-only">Admin Dashboard</span>
                <img
                  className="h-8 w-auto sm:h-10"
                  src="/logo.svg"
                  alt="Logo"
                />
                <span className="ml-2 text-lg font-bold text-indigo-700 dark:text-indigo-300">Admin Panel</span>
              </a>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="-mr-2 -my-2 md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:hover:bg-gray-800"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">{isMobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Desktop navigation */}
          <nav className="hidden md:flex space-x-10">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <a
                  className={`text-base font-medium ${
                    item.current
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'
                  }`}
                >
                  {item.name}
                </a>
              </Link>
            ))}
          </nav>

          {/* Admin profile dropdown */}
          <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
            {adminUser ? (
              <div className="ml-3 relative" ref={dropdownRef}>
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-gray-100 dark:bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900"
                    id="user-menu"
                    aria-expanded="false"
                    aria-haspopup="true"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-800 dark:text-indigo-200">
                      {adminUser.email ? adminUser.email.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <span className="ml-2 text-gray-700 dark:text-gray-300 text-sm font-medium truncate">
                      {adminUser.email || 'Admin'}
                    </span>
                    <svg
                      className={`ml-2 h-5 w-5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'transform rotate-180' : ''}`}
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.1 }}
                      className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="user-menu"
                    >
                      <Link href="/administracija/dashboard/profilis">
                        <a
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          Profilis
                        </a>
                      </Link>
                      <Link href="/administracija/dashboard/nustatymai">
                        <a
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          role="menuitem"
                        >
                          Nustatymai
                        </a>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        role="menuitem"
                      >
                        Atsijungti
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link href="/administracija/login">
                <a className="ml-8 whitespace-nowrap inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                  Prisijungti
                </a>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden"
          >
            <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white dark:bg-gray-900 divide-y-2 divide-gray-50 dark:divide-gray-800">
              <div className="pt-5 pb-6 px-5">
                <div className="flex items-center justify-between">
                  <div>
                    <img
                      className="h-8 w-auto"
                      src="/logo.svg"
                      alt="Logo"
                    />
                  </div>
                  <div className="-mr-2">
                    <button
                      type="button"
                      className="rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 dark:hover:bg-gray-800"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span className="sr-only">Close menu</span>
                      <svg
                        className="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="mt-6">
                  <nav className="grid gap-y-8">
                    {navigation.map((item) => (
                      <Link key={item.name} href={item.href}>
                        <a
                          className={`-m-3 p-3 flex items-center rounded-md ${
                            item.current
                              ? 'bg-indigo-50 text-indigo-600 dark:bg-gray-800 dark:text-indigo-400'
                              : 'text-gray-900 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <span className="ml-3 text-base font-medium">
                            {item.name}
                          </span>
                        </a>
                      </Link>
                    ))}
                  </nav>
                </div>
              </div>
              <div className="py-6 px-5 space-y-6">
                {adminUser ? (
                  <div className="flex flex-col space-y-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-800">
                        {adminUser.email ? adminUser.email.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <span className="ml-3 text-base font-medium text-gray-900 dark:text-gray-200">
                        {adminUser.email || 'Admin'}
                      </span>
                    </div>
                    <Link href="/administracija/dashboard/profilis">
                      <a className="text-base font-medium text-gray-900 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-400">
                        Profilis
                      </a>
                    </Link>
                    <Link href="/administracija/dashboard/nustatymai">
                      <a className="text-base font-medium text-gray-900 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-400">
                        Nustatymai
                      </a>
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Atsijungti
                    </button>
                  </div>
                ) : (
                  <div>
                    <Link href="/administracija/login">
                      <a className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                        Prisijungti
                      </a>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default AdminHeader;