import React from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SimpleVendorCTA from '../components/SimpleVendorCTA';
import ContentHighlightDivider from '../components/ContentHighLightDivider';
import ContactForm from '../components/ContactForm';

export default function KontaktaiPage() {
  // Animation variants - matching the patterns from other pages
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

  // Contact information - can be replaced with dynamic data if needed
  const contactInfo = {
    email: "info@verslodaigynas.lt",
    phone: "+370 600 00000",
    address: "Gedimino pr. 123, Vilnius, Lietuva",
    workingHours: "I-V: 9:00 - 18:00"
  };

  return (
    <>
      <Head>
        <title>Kontaktai - Verslo Daigynas</title>
        <meta name="description" content="Susisiekite su Verslo Daigynas komanda - mes padÄ—sime jums rasti geriausius verslo paslaugÅ³ teikÄ—jus." />
        <meta property="og:title" content="Kontaktai - Verslo Daigynas" />
        <meta property="og:description" content="Susisiekite su Verslo Daigynas komanda - mes padÄ—sime jums rasti geriausius verslo paslaugÅ³ teikÄ—jus." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://verslodaigynas.lt/kontaktai" />
        <meta property="og:image" content="/og-image.jpg" />
      </Head>

      <Header />

      {/* Hero Banner with gradient overlay - matches the site's design pattern */}
      <div className="relative w-full overflow-hidden mb-6">
        {/* Image with gradient overlay */}
        <div className="relative">
          <img
            src="/contact-banner.jpg"
            alt="Susisiekite su mumis"
            className="w-full h-[300px] sm:h-[350px] md:h-[400px] object-cover z-0 relative"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-600/40 z-10 pointer-events-none"></div>
        </div>

        {/* Hero content - follows the exact pattern from homepage */}
        <div className="absolute inset-0 flex flex-col justify-center items-center px-4 sm:px-6 py-8 text-white z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl w-full"
          >
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 drop-shadow-md">
              Susisiekite su mumis
            </h1>
            <p className="text-base md:text-xl opacity-90 max-w-2xl mx-auto mb-4 sm:mb-8 drop-shadow">
              Turite klausimų? Susisiekite su mumis ir mes mielai atsakysime į visus kilusius klausimus.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Contact information section */}
        <motion.section 
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.h2 
            className="text-3xl font-bold text-gray-800 mb-8 text-center"
            variants={itemVariants}
          >
            Kaip mus rasti
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Email */}
            <motion.div
              className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center"
              variants={itemVariants}
            >
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">El. Paštas</h3>
              <p className="text-blue-600">{contactInfo.email}</p>
            </motion.div>

            {/* Phone */}
            <motion.div
              className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center"
              variants={itemVariants}
            >
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Telefonas</h3>
              <p className="text-blue-600">{contactInfo.phone}</p>
            </motion.div>

            {/* Address */}
            <motion.div
              className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center"
              variants={itemVariants}
            >
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Adresas</h3>
              <p className="text-gray-600">{contactInfo.address}</p>
            </motion.div>

            {/* Working Hours */}
            <motion.div
              className="bg-white p-6 rounded-xl shadow-md flex flex-col items-center text-center"
              variants={itemVariants}
            >
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Darbo Laikas</h3>
              <p className="text-gray-600">{contactInfo.workingHours}</p>
            </motion.div>
          </div>
        </motion.section>

        {/* Map section */}
        <motion.section 
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.h2 
            className="text-3xl font-bold text-gray-800 mb-8 text-center"
            variants={itemVariants}
          >
            Mūsų lokacija
          </motion.h2>

          <motion.div 
            className="rounded-xl overflow-hidden shadow-lg"
            variants={itemVariants}
          >
            {/* Replace the placeholder with actual Google Maps or other map provider embed code */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2306.2995081927984!2d25.279903800000003!3d54.6867569!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46dd9417621fb72d%3A0x9f881e6eb7ad7bd9!2sGedimino%20pr.%2C%20Vilnius%2C%20Lithuania!5e0!3m2!1sen!2sus!4v1688516820000!5m2!1sen!2sus" 
              width="100%" 
              height="450" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="MÅ«sÅ³ lokacija"
              className="w-full h-[400px]"
            ></iframe>
          </motion.div>
        </motion.section>

        <ContactForm />

        {/* Call-to-action section reusing SimpleVendorCTA */}
        
        <SimpleVendorCTA />

        {/* Statistics Divider */}
        <ContentHighlightDivider />
      </div>

      <Footer />
    </>
  );
}