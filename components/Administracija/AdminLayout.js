// components/Administracija/AdminLayout.js
import React from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { getAuth } from 'firebase/auth';
// Update the import path to the correct location
import { useAdminAuth } from '../../../contexts/AdminAuthContext';

const AdminLayout = ({ children, title = 'Administravimo panelė' }) => {
  const router = useRouter();
  
  // Use the AdminAuth context
  const { adminUser } = useAdminAuth();

  // Define navigation items
  const navigation = [
    { name: 'Pagrindinė', href: '/administracija/dashboard', current: router.pathname === '/administracija/dashboard' },
    { name: 'Verslo prašymai', href: '/administracija/dashboard/claims', current: router.pathname === '/administracija/dashboard/claims' },
    { name: 'Tiekėjai', href: '/administracija/dashboard/tiekejai', current: router.pathname === '/administracija/dashboard/tiekejai' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{title}</title>
        <meta name="description" content="Administravimo panelė" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/administracija/dashboard">
                  <a>
                    <img
                      className="block h-8 w-auto"
                      src="/logo.svg"
                      alt="Logo"
                    />
                  </a>
                </Link>
              </div>
              
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        item.current
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      {item.name}
                    </a>
                  </Link>
                ))}
              </div>
            </div>
            
            <div className="flex items-center">
              {adminUser ? (
                <div className="ml-3 relative">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-700 mr-2">
                      {adminUser.email}
                    </span>
                    <button
                      type="button"
                      className="bg-gray-100 p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={() => {
                        const auth = getAuth();
                        auth.signOut().then(() => {
                          router.push('/administracija/login');
                        });
                      }}
                    >
                      Atsijungti
                    </button>
                  </div>
                </div>
              ) : (
                <Link href="/administracija/login">
                  <a className="text-sm font-medium text-gray-700">Prisijungti</a>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">{title}</h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
