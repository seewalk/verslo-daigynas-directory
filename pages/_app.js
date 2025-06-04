import React from 'react';
import '../styles/globals.css';
import { appWithTranslation } from 'next-i18next';
import ChatWidget from '../components/ChatWidget';
import { useAuthState } from 'react-firebase-hooks/auth';
import { getAuth } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AdminAuthProvider } from '../components/Contexts/AdminAuthContext';

function MyApp({ Component, pageProps }) {
  const [user] = useAuthState(getAuth()); // for regular users

  return (
    <>
    <AdminAuthProvider>
      <Component {...pageProps} />
      {user && <ChatWidget />}
    </AdminAuthProvider>
    </>
  );
}

export default appWithTranslation(MyApp);

