import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SimpleVendorCTA from '../components/SimpleVendorCTA';

export default function ServicesPage() {
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

  // Free services offered by Verslo Daigynas
  const freeServices = [
    {
      title: "Nemokamas įmonės profilis",
      description: "Sukurkite nemokamą įmonės profilį su pagrindine kontaktine informacija, paslaugų aprašymu ir logotipu.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      title: "Įmonių paieška",
      description: "Naudokitės pažangia paieškos funkcija, kad greitai rastumėte tinkamus verslo partnerius pagal paslaugų tipą ar lokaciją.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      title: "Google vertinimai",
      description: "Automatiškai sinchronizuojami Google vertinimai padeda potencialiems klientams greičiau priimti sprendimus, pasitikint kitų nuomone.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    {
      title: "Viešai prieinami kontaktai",
      description: "Jūsų įmonės kontaktinė informacija tampa lengvai prieinama potencialiems klientams ir partneriams.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  // Value-added premium services (if applicable)
  const premiumServices = [
    {
      title: "Išskirtinis profilis",
      description: "Pasirūpinkite, kad jūsų įmonė būtų labiau pastebima su išskirtiniu profiliu kataloguose ir paieškos rezultatuose.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      title: "Išsamus analitikos portalas",
      description: "Gaukite detalią analitiką, lankytojų demografinius duomenis ir įžvalgas apie tai, kaip vartotojai sąveikauja su jūsų įmonės profiliu.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: "Pagalba ir konsultacijos",
      description: "Gaukite prioritetinę pagalbą ir konsultacijas, kaip optimizuoti jūsų įmonės profilį ir padidinti matomumą.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      title: "Aukščiausios kategorijos profiliai",
      description: "Išskirtiniai profiliai su pasirinktiniais vizualais, išplėstiniais aprašymais ir aukštesniu reitingu paieškos rezultatuose.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      )
    }
  ];

  // How It Works steps
  const howItWorksSteps = [
    {
      number: "01",
      title: "Sukurkite paskyrą",
      description: "Sukurkite nemokamą paskyrą mūsų platformoje per kelias minutes."
    },
    {
      number: "02",
      title: "Užpildykite profilio informaciją",
      description: "Pridėkite savo įmonės kontaktinę informaciją, aprašymą, paslaugų sąrašą ir logotipą."
    },
    {
      number: "03",
      title: "Patvirtinkite savo įmonę",
      description: "Patvirtinkite savo įmonę, kad padidintumėte patikimumą ir matomumą."
    },
    {
      number: "04",
      title: "Būkite matomi klientams",
      description: "Potencialūs klientai gali rasti jūsų įmonę paieškoje ir kataloguose."
    }
  ];

  return (
    <>
      <Head>
        <title>Paslaugos - Verslo Daigynas</title>
        <meta name="description" content="Susipažinkite su Verslo Daigynas nemokamomis paslaugomis. Sukurkite įmonės profilį, didinkite savo matomumą ir raskite patikimus verslo partnerius." />
      </Head>

      <Header />
      
      {/* Hero Banner with gradient overlay */}
      <div className="relative w-full overflow-hidden mb-6">
        <div className="relative">
          <img
            src="/services-banner.jpg" // Replace with your actual services banner image
            alt="Verslo Daigynas paslaugos"
            className="w-full h-[300px] sm:h-[350px] md:h-[400px] object-cover z-0 relative"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-600/40 z-10 pointer-events-none"></div>
        </div>

        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col justify-center items-center px-4 sm:px-6 py-8 text-white z-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl w-full"
          >
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 drop-shadow-md">
              Mūsų paslaugos
            </h1>
            <p className="text-base md:text-xl opacity-90 max-w-2xl mx-auto mb-4 sm:mb-8 drop-shadow">
              Nemokama verslo įmonių katalogo platforma, padedanti augti jūsų verslui
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Introduction Section */}
        <motion.section 
          className="mb-16 text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h2 
            className="text-3xl font-bold text-gray-800 mb-4"
            variants={itemVariants}
          >
            Nemokamas verslo katalogas
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            variants={itemVariants}
          >
            Verslo Daigynas yra nemokama platforma, skirta padėti verslams didinti matomumą, 
            rasti patikimus partnerius ir plėsti savo klientų bazę. Mūsų tikslas - sujungti įmones 
            ir klientus patogiu, skaidriu ir efektyviu būdu.
          </motion.p>
        </motion.section>

        {/* Free Services Grid */}
        <motion.section 
          className="mb-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.div 
            className="flex items-center mb-10"
            variants={itemVariants}
          >
            <div className="flex-1 h-px bg-gray-200"></div>
            <h2 className="px-6 text-2xl font-bold text-gray-800">Nemokamos paslaugos</h2>
            <div className="flex-1 h-px bg-gray-200"></div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {freeServices.map((service, index) => (
              <motion.div 
                key={index}
                className="bg-white p-6 rounded-xl shadow-md flex"
                variants={itemVariants}
              >
                <div className="mr-4 mt-1">
                  <div className="bg-blue-100 p-3 rounded-full">
                    {service.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg mt-8"
            variants={itemVariants}
          >
            <p className="text-gray-700 font-medium">
              Verslo Daigynas yra ir visada išliks nemokama platforma pagrindiniams verslo poreikiams.
              Mūsų misija - padėti verslams augti be papildomų išlaidų.
            </p>
          </motion.div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section 
          className="mb-20 bg-white p-8 md:p-10 rounded-xl shadow-md"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.h2 
            className="text-3xl font-bold text-gray-800 mb-10 text-center"
            variants={itemVariants}
          >
            Kaip tai veikia?
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {howItWorksSteps.map((step, index) => (
              <motion.div 
                key={index} 
                className="text-center"
                variants={itemVariants}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold mb-4">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Premium Services Section (if applicable) - use same layout as Free Services*/}
        <motion.section 
          className="mb-16"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.div 
            className="flex items-center mb-10"
            variants={itemVariants}
          >
            <div className="flex-1 h-px bg-gray-200"></div>
            <h2 className="px-6 text-2xl font-bold text-gray-800">Papildomos paslaugos</h2>
            <div className="flex-1 h-px bg-gray-200"></div>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {premiumServices.map((service, index) => (
              <motion.div 
                key={index}
                className="bg-white p-6 rounded-xl shadow-md flex"
                variants={itemVariants}
              >
                <div className="mr-4 mt-1">
                  <div className="bg-blue-100 p-3 rounded-full">
                    {service.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <motion.div 
            className="mt-10"
            variants={itemVariants}
          >
            <a 
              href="/kontaktai" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg transition-colors shadow-sm"
            >
              Sužinokite daugiau
            </a>
          </motion.div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section 
          className="mb-16 bg-blue-50 p-8 md:p-12 rounded-xl"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.div 
            className="text-center mb-10"
            variants={itemVariants}
          >
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Mūsų klientų atsiliepimai</h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Perskaitykite, ką mūsų klientai sako apie bendradarbiavimą su Verslo Daigynas.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={itemVariants}
            >
              <div className="flex mb-4">
                {Array(5).fill(0).map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 italic mb-4">
                "Verslo Daigynas platforma padėjo mums rasti naujų klientų ir partnerių. Paprastas ir intuityvus naudojimas leido greitai sukurti patrauklų įmonės profilį."
              </p>
              <div className="flex items-center">
                <img src="/testimonial-1.jpg" alt="Testimonial" className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <p className="font-medium text-gray-800">Jonas Jonaitis</p>
                  <p className="text-sm text-gray-500">UAB "Technologijų Sprendimai"</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={itemVariants}
            >
              <div className="flex mb-4">
                {Array(5).fill(0).map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 italic mb-4">
                "Rekomenduojame Verslo Daigynas visiems, kurie nori didinti savo verslo matomumą internete. Puikus sprendimas, ypač mažoms ir vidutinėms įmonėms."
              </p>
              <div className="flex items-center">
                <img src="/testimonial-2.jpg" alt="Testimonial" className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <p className="font-medium text-gray-800">Laura Petraitienė</p>
                  <p className="text-sm text-gray-500">MB "Žalias Dizainas"</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={itemVariants}
            >
              <div className="flex mb-4">
                {Array(5).fill(0).map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 italic mb-4">
                "Per pirmą mėnesį platformoje jau gavome kelias užklausas apie mūsų teikiamas paslaugas. Paprastas ir efektyvus būdas pritraukti naujų klientų."
              </p>
              <div className="flex items-center">
                <img src="/testimonial-3.jpg" alt="Testimonial" className="w-10 h-10 rounded-full mr-3" />
                <div>
                  <p className="font-medium text-gray-800">Marius Kazlauskas</p>
                  <p className="text-sm text-gray-500">UAB "Statybų Partneriai"</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <SimpleVendorCTA />

        {/* FAQ Section */}
        <motion.section 
          className="mb-16 mt-20"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          <motion.h2 
            className="text-3xl font-bold text-gray-800 mb-10 text-center"
            variants={itemVariants}
          >
            Dažniausiai užduodami klausimai
          </motion.h2>
          
          <div className="space-y-4">
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={itemVariants}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Ar tikrai Verslo Daigynas yra visiškai nemokamas?</h3>
              <p className="text-gray-600">
                Taip, pagrindinės Verslo Daigynas platformos funkcijos yra visiškai nemokamos. Jūs galite sukurti įmonės profilį, 
                pridėti kontaktinę informaciją, paslaugų aprašymą ir logotipą be jokių mokesčių.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={itemVariants}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Kaip galiu sukurti savo įmonės profilį?</h3>
              <p className="text-gray-600">
                Sukurti įmonės profilį yra labai paprasta. Užsiregistruokite platformoje, užpildykite pagrindinę informaciją 
                apie savo įmonę, pridėkite kontaktinius duomenis, aprašykite savo paslaugas ir įkelkite logotipą. 
                Visa tai užtrunka vos kelias minutes.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={itemVariants}
            >
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">Ar galiu redaguoti savo įmonės profilį?</h3>
              <p className="text-gray-600">
                Taip, jūs galite bet kada atnaujinti ir redaguoti savo įmonės profilį. Prisijunkite prie savo paskyros, 
                eikite į profilio nustatymus ir atlikite norimus pakeitimus. Atnaujinimai atsispindės iš karto.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={itemVariants}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Kaip veikia Google vertinimų rodymas?</h3>
              <p className="text-gray-600">
                Verslo Daigynas automatiškai sinchronizuoja jūsų įmonės Google vertinimus ir rodo juos jūsų profilyje. 
                Tai padeda potencialiems klientams greitai įvertinti jūsų įmonės patikimumą ir reputaciją.
              </p>
            </motion.div>
            
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-md"
              variants={itemVariants}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Ar galiu pretenduoti į jau sukurtą įmonės profilį?</h3>
              <p className="text-gray-600">
                Taip, jei esate įmonės atstovas, galite pretenduoti į jau esamą įmonės profilį Verslo Daigynas platformoje. 
                Apsilankykite įmonės profilyje ir spauskite mygtuką "Pretenduoti į įrašą". Mūsų komanda patvirtins jūsų tapatybę 
                ir suteiks prieigą prie profilio valdymo.
              </p>
            </motion.div>
          </div>
          
          <motion.div 
            className="mt-10 text-center"
            variants={itemVariants}
          >
            <a 
              href="/daznai-uzduodami-klausimai" 
              className="inline-block border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium py-3 px-8 rounded-lg transition-colors"
            >
              Visi DUK
            </a>
          </motion.div>
        </motion.section>
      </div>
      
      {/* Stats Section */}
      <div className="bg-blue-600 text-white py-16 mb-16">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold mb-4">Verslo Daigynas skaičiais</h2>
            <p className="text-lg opacity-90 max-w-3xl mx-auto">
              Auganti nemokama platforma, padedanti verslams atrasti vieni kitus.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.2, delayChildren: 0.3 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl font-bold mb-2">1,500+</div>
              <div className="text-blue-200">Įmonių profilių</div>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl font-bold mb-2">15+</div>
              <div className="text-blue-200">Lietuvos miestų</div>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl font-bold mb-2">12K+</div>
              <div className="text-blue-200">Mėnesinių lankytojų</div>
            </motion.div>
            
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="text-5xl font-bold mb-2">97%</div>
              <div className="text-blue-200">Klientų pasitenkinimas</div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      
      {/* Get Started Section */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <motion.div 
          className="bg-white p-8 md:p-12 rounded-xl shadow-lg text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Pradėkite naudotis jau šiandien</h2>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Prisijunkite prie augančio Verslo Daigynas tinklo ir leiskite potencialiems klientams jus lengvai surasti. 
            Registracija užtrunka vos kelias minutes ir yra visiškai nemokama.
          </p>
          <motion.a 
            href="/pretenduoti" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-10 rounded-lg transition-colors shadow-sm"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            Užsiregistruoti nemokamai
          </motion.a>
        </motion.div>
      </div>

      <Footer />
    </>
  );
}
