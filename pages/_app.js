import React from 'react';
import '../styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import { AdminAuthProvider } from '../components/Contexts/AdminAuthContext';

  

function MyApp({ Component, pageProps }) {
  return (
    <AdminAuthProvider>
      <Component {...pageProps} />
    </AdminAuthProvider>
  );
}

export default appWithTranslation(MyApp);

