import React from 'react';
import { motion } from 'framer-motion';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SimpleVendorCTA from '../components/SimpleVendorCTA';
import ContentHighlightDivider from '../components/ContentHighLightDivider';

export default function AboutUs() {
  // Company history timeline
  const historyTimeline = [
    {
      year: 2021,
      title: "Įkūrimas",
      description: "Verslo Daigynas pradėjo veiklą kaip virtualaus biuro paslaugų lyginimo platforma, padedanti naujoms įmonėms rasti patikimus adresus."
    },
    {
      year: 2022,
      title: "Plėtra",
      description: "Išplėtėme paslaugų spektrą ir pradėjome bendradarbiauti su daugiau nei 15 virtualaus biuro paslaugų teikėjų visoje Lietuvoje."
    },
    {
      year: 2023,
      title: "Augimas",
      description: "Mūsų platforma pasiekė 500+ aktyvių vartotojų ir padėjo daugiau nei 300 naujų verslų rasti tinkamus registracijos adresus."
    },
    {
      year: 2024,
      title: "Atnaujinimas",
      description: "Atnaujinome platformos dizainą ir funkcionalumą, įtraukdami palyginimo įrankius ir naujus filtrus, palengvinančius paslaugų paiešką."
    }
  ];

  // Team members
  const teamMembers = [
    {
      name: "Jonas Petraitis",
      position: "Įkūrėjas ir Generalinis Direktorius",
      photo: "/team/jonas.jpg",
      description: "10+ metų patirtis verslo konsultavimo srityje. Anksčiau dirbo tarptautinėje konsultavimo įmonėje.",
      linkedin: "https://linkedin.com/in/jonaspetraitis"
    },
    {
      name: "Milda Kazlauskienė",
      position: "Rinkodaros Vadovė",
      photo: "/team/milda.jpg",
      description: "Patyrusi rinkodaros specialistė su 8 metų patirtimi startuolių ekosistemoje.",
      linkedin: "https://linkedin.com/in/mildakazlauskiene"
    },
    {
      name: "Tomas Balčiūnas",
      position: "Technologijų Vadovas",
      photo: "/team/tomas.jpg",
      description: "Full-stack programuotojas, anksčiau kūręs technologinius sprendimus fintech sektoriuje.",
      linkedin: "https://linkedin.com/in/tomasbalciunas"
    }
  ];

  // Values
  const companyValues = [
    {
      icon: (
        <svg className="w-10 h-10 text-blue-600 mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      title: "Skaidrumas",
      description: "Teikiame išsamią ir objektyvią informaciją apie visus paslaugų teikėjus, kad mūsų vartotojai galėtų priimti geriausius sprendimus."
    },
    {
      icon: (
        <svg className="w-10 h-10 text-blue-600 mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
        </svg>
      ),
      title: "Bendruomeniškumas",
      description: "Kuriame aktyvią verslo bendruomenę, kurioje verslininkai gali dalintis patirtimi ir rasti naujų partnerių."
    },
    {
      icon: (
        <svg className="w-10 h-10 text-blue-600 mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
        </svg>
      ),
      title: "Inovatyvumas",
      description: "Nuolat tobuliname savo platformą ir ieškome naujų būdų, kaip palengvinti verslo kūrimo ir plėtros procesą Lietuvoje."
    },
    {
      icon: (
        <svg className="w-10 h-10 text-blue-600 mb-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M6.672 1.911a1 1 0 10-1.932.518l.259.966a1 1 0 001.932-.518l-.26-.966zM2.429 4.74a1 1 0 10-.517 1.932l.966.259a1 1 0 00.517-1.932l-.966-.26zm8.814-.569a1 1 0 00-1.415-1.414l-.707.707a1 1 0 101.415 1.415l.707-.708zm-7.071 7.072l.707-.707A1 1 0 003.465 9.12l-.708.707a1 1 0 001.415 1.415zm3.2-5.171a1 1 0 00-1.3 1.3l4 10a1 1 0 001.823.075l1.38-2.759 3.018 3.02a1 1 0 001.414-1.415l-3.019-3.02 2.76-1.379a1 1 0 00-.076-1.822l-10-4z" clipRule="evenodd" />
        </svg>
      ),
      title: "Patikimumas",
      description: "Dirbame tik su patikrintais paslaugų teikėjais ir užtikriname, kad mūsų platformoje pateikta informacija būtų tiksli ir aktuali."
    }
  ];

  return (
    <>
      <Head>
        <title>Apie Mus | Verslo Daigynas</title>
        <meta name="description" content="Sužinokite daugiau apie Verslo Daigyną - platformą, padedančią verslui rasti patikimus paslaugų teikėjus vienoje vietoje." />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Hero Section */}
        <section className="relative bg-blue-600 text-white">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute right-0 bottom-0 w-96 h-96 bg-white rounded-full transform translate-x-1/3 translate-y-1/3"></div>
            <div className="absolute left-0 top-0 w-64 h-64 bg-white rounded-full transform -translate-x-1/3 -translate-y-1/3"></div>
          </div>
          
          <div className="max-w-6xl mx-auto px-4 py-20 relative z-10 text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Mūsų Misija
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Padėti Lietuvos verslui kurti ir augti, suteikiant prieinamą prieigą prie kokybiškų paslaugų ir patikimų partnerių.
            </motion.p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 relative inline-block">
                Mūsų Istorija
                <div className="absolute w-24 h-1.5 bg-blue-600 bottom-0 left-1/2 transform -translate-x-1/2 -bottom-3 rounded-full"></div>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-6">
                Verslo Daigynas pradėjo savo kelią iš idėjos palengvinti verslo kūrimo procesą Lietuvoje. Šiandien mes jungiame paslaugų teikėjus ir verslininkus, padėdami verslui augti.
              </p>
            </motion.div>

            {/* Timeline */}
            <div className="relative max-w-3xl mx-auto">
              {/* Timeline line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200"></div>
              
              {/* Timeline items */}
              {historyTimeline.map((item, index) => (
                <motion.div 
                  key={item.year}
                  className="relative z-10 mb-12"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                    {/* Year bubble */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
                      <div className="bg-blue-600 text-white rounded-full h-12 w-12 flex items-center justify-center font-bold shadow-lg">
                        {item.year}
                      </div>
                    </div>
                    
                    {/* Content box */}
                    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-5/12 ${
                      index % 2 === 0 ? 'mr-auto pr-8' : 'ml-auto pl-8'
                    }`}>
                      <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Statistics Divider */}
        <ContentHighlightDivider />

        {/* Our Values Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 relative inline-block">
                Mūsų Vertybės
                <div className="absolute w-24 h-1.5 bg-blue-600 bottom-0 left-1/2 transform -translate-x-1/2 -bottom-3 rounded-full"></div>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-6">
                Šios vertybės apibrėžia mūsų kasdienį darbą ir santykius su klientais bei partneriais.
              </p>
            </motion.div>

            {/* Values Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {companyValues.map((value, index) => (
                <motion.div
                  key={value.title}
                  className="bg-gray-50 rounded-xl p-6 text-center border border-gray-100 shadow-sm hover:shadow-md transition-all"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <div className="flex justify-center">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <SimpleVendorCTA />

        {/* Team Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 relative inline-block">
                Mūsų Komanda
                <div className="absolute w-24 h-1.5 bg-blue-600 bottom-0 left-1/2 transform -translate-x-1/2 -bottom-3 rounded-full"></div>
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mt-6">
                Susipažinkite su žmonėmis, kurie kuria ir vysto Verslo Daigyno platformą.
              </p>
            </motion.div>

            {/* Team Members */}
            <div className="grid md:grid-cols-3 gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 group"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <div className="aspect-w-4 aspect-h-3 relative overflow-hidden">
                    <img 
                      src={member.photo || "https://via.placeholder.com/400x300?text=Team+Member"}
                      alt={member.name}
                      className="w-full h-64 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-1">{member.name}</h3>
                    <p className="text-blue-600 font-medium mb-3">{member.position}</p>
                    <p className="text-gray-600 mb-4">{member.description}</p>
                    <a 
                      href={member.linkedin}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854V1.146zm4.943 12.248V6.169H2.542v7.225h2.401zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248-.822 0-1.359.54-1.359 1.248 0 .694.521 1.248 1.327 1.248h.016zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016a5.54 5.54 0 0 1 .016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225h2.4z"/>
                      </svg>
                      LinkedIn profilis
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ CTA Section */}
        <section className="py-12 px-4 bg-gray-100">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              className="text-2xl md:text-3xl font-bold text-gray-800 mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Turite klausimų apie Verslo Daigyną?
            </motion.h2>
            <motion.p
              className="text-gray-600 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Peržiūrėkite dažniausiai užduodamus klausimus arba susisiekite su mumis tiesiogiai
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <a 
                href="/daznai-uzduodami-klausimai" 
                className="px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors shadow-sm font-medium"
              >
                DUK
              </a>
              <a 
                href="/kontaktai" 
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium"
              >
                Susisiekite su mumis
              </a>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}
