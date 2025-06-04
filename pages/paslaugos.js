import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import FeatureCard from '../components/FeatureCard';
import featuresData from '../data/features';

const PlatformFeaturesPage = () => {
  // Get features from our data
  const { userFeatures, vendorFeatures, platformFeatures } = featuresData;
  
  // Statistics for highlight section
  const statistics = [
    { value: '100+', label: 'Tiekėjų' },
    { value: '500+', label: 'Verslo klientų' },
    { value: '15+', label: 'Lietuvos miestų' },
    { value: '97%', label: 'Klientų pasitenkinimas' }
  ];
  
  const renderFeaturesSection = (features, title) => {
    return (
      <div className="mt-12 mb-16">
        <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          {title}
          <div className="mt-2 mx-auto w-20 h-1 bg-blue-600 rounded"></div>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    );
  };

  // Get all coming soon features
  const comingSoonFeatures = [
    ...userFeatures.filter(f => f.comingSoon),
    ...vendorFeatures.filter(f => f.comingSoon),
    ...platformFeatures.filter(f => f.comingSoon)
  ];

  // Coming Soon Features section
  const renderComingSoonFeaturesSection = () => {
    if (comingSoonFeatures.length === 0) return null;
    
    return (
      <div className="mt-12 mb-16 bg-gray-50 py-8 px-4 rounded-2xl border border-dashed border-gray-300">
        <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          Ruošiamos Funkcijos
          <div className="mt-2 mx-auto w-20 h-1 bg-amber-500 rounded"></div>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {comingSoonFeatures.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
       <Header />
      <div className="relative w-full overflow-hidden mb-6">
        {/* Image with gradient overlay */}
        <div className="relative">
          <img
            src="/banner.jpg"
            alt="Verslo Daigynas hero banner"
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
              Verslo Daigyno Funkcijos
            </h1>
            <p className="text-base md:text-xl opacity-90 max-w-2xl mx-auto mb-4 sm:mb-8 drop-shadow">
              Viskas, ko reikia jūsų verslui augti – nuo administracinių paslaugų iki verslo partnerių paieškos. 
            Atraskite platformos galimybes ir kaip jos gali padėti jūsų verslui.
            </p>
          </motion.div>
          
            {/* Navigation Section */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6 mb-8">
        <a 
          href="/paslaugos" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium inline-flex items-center shadow-md transition-all hover:shadow-lg"
        >
          Naršyti paslaugas
          <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
        <a 
          href="/pretenduoti" 
          className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-3 rounded-lg font-medium inline-flex items-center shadow-sm transition-all"
        >
          Tapti tiekėju
        </a>
      </div>
    </div>
      
  </div>     

      {/* Statistics Section */}
      <section className="py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gray-50 opacity-80">
          <div className="absolute inset-0" style={{ 
            backgroundImage: 'radial-gradient(circle, #e1e7fa 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}></div>
        </div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <svg className="w-10 h-10 text-blue-400 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
              Verslo Daigynas skaičiais
            </h2>
            <p className="text-blue-600">
              Pasitikėjimu pagrįsta verslo ekosistema, jungianti tiekėjus ir klientus
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center p-6 md:p-8 bg-white rounded-xl shadow-sm border border-gray-200"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {statistics.map((stat, index) => (
              <motion.div 
                key={index}
                className="flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
              >
                <span className="text-3xl font-bold text-blue-600 mb-1">
                  {stat.value}
                </span>
                <span className="text-sm text-gray-600">
                  {stat.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main features content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* User Features */}
        {renderFeaturesSection(userFeatures.filter(f => !f.comingSoon), "Verslui ieškančiam paslaugų")}
        
        {/* Vendor Features */}
        {renderFeaturesSection(vendorFeatures.filter(f => !f.comingSoon), "Paslaugų teikėjams")}
        
        {/* Platform Features */}
        {renderFeaturesSection(platformFeatures.filter(f => !f.comingSoon), "Unikalios platformos funkcijos")}
        
        {/* Coming Soon Features */}
        {renderComingSoonFeaturesSection()}
      </div>
      
      {/* CTA Section */}
      <section className="py-16 overflow-hidden relative">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 z-0"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full opacity-10 transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full opacity-10 transform -translate-x-1/3 translate-y-1/3"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            {/* Left content - Text section */}
            <motion.div 
              className="md:w-7/12 mb-10 md:mb-0 text-white"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.span 
                className="inline-block py-1 px-3 bg-white bg-opacity-20 rounded-full text-sm font-medium mb-4"
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                Teikėjams
              </motion.span>
              
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Prisijunkite prie Verslo Daigyno ir plėskite savo klientų ratą
              </motion.h2>
              
              <motion.p 
                className="text-blue-100 text-lg mb-8 max-w-xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Tapkite Verslo Daigyno paslaugų tiekėju ir pasiekite tūkstančius potencialių klientų, ieškančių būtent jūsų teikiamų paslaugų. Padidinkite savo verslo matomumą ir pritraukite daugiau užsakymų.
              </motion.p>
              
              {/* Benefits list */}
              <motion.div 
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "Pasiekite tikslinę auditoriją",
                    "Padidinkite savo matomumą",
                    "Gaukite naujų klientų srautą",
                    "Paprasta registracija ir valdymas",
                    "Kurkite patikimo tiekėjo reputaciją",
                    "Išsiskirkite iš konkurentų"
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-center">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              
              {/* CTAs */}
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <a 
                  href="/pretenduoti" 
                  className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-lg font-medium inline-flex items-center shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  Registruotis dabar
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
                <a 
                  href="/tiekeju-info" 
                  className="bg-transparent border border-white text-white hover:bg-white hover:bg-opacity-10 px-6 py-3 rounded-lg font-medium inline-flex items-center transition-all"
                >
                  Sužinoti daugiau
                </a>
              </motion.div>
            </motion.div>
            
            {/* Right content - Form card */}
            <motion.div 
              className="md:w-5/12 md:pl-10"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform -rotate-1 hover:rotate-0 transition-all duration-500">
                <div className="p-6 sm:p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Greita registracija</h3>
                  <p className="text-gray-600 mb-6">Užpildykite formą ir mes su jumis susisieksime per 24 val.</p>
                  
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="company-name" className="block text-sm font-medium text-gray-700 mb-1">Įmonės pavadinimas</label>
                      <input 
                        type="text" 
                        id="company-name" 
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                        placeholder="UAB Pavyzdys"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">El. paštas</label>
                      <input 
                        type="email" 
                        id="email" 
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors" 
                        placeholder="info@jusuimone.lt"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="service-type" className="block text-sm font-medium text-gray-700 mb-1">Paslaugų tipas</label>
                      <select 
                        id="service-type" 
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      >
                        <option value="">Pasirinkite paslaugų tipą</option>
                        <option value="address">Juridinis adresas</option>
                        <option value="accounting">Buhalterija</option>
                        <option value="legal">Teisės paslaugos</option>
                        <option value="marketing">Marketingas</option>
                        <option value="other">Kita</option>
                      </select>
                    </div>
                    
                    <div className="pt-2">
                      <button 
                        type="submit" 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors shadow-md hover:shadow-lg flex items-center justify-center"
                      >
                        Registruotis kaip tiekėjas
                        <svg className="w-5 h-5 ml-2 animate-pulse" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </form>
                  
                  <p className="text-xs text-gray-500 mt-4 text-center">
                    Paspausdami mygtuką „Registruotis", sutinkate su mūsų <a href="/privatumo-politika" className="text-blue-600 hover:underline">privatumo politika</a> ir <a href="/naudojimo-salygos" className="text-blue-600 hover:underline">naudojimo sąlygomis</a>.
                  </p>
                </div>
              </div>
              
              {/* Trust indicators */}
              <div className="mt-6 text-center">
                <p className="text-blue-100 mb-2 text-sm">Mumis pasitiki</p>
                <div className="flex justify-center items-center space-x-6">
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <span className="text-white text-xs font-medium">100+</span>
                    <p className="text-blue-100 text-xs">tiekėjų</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <span className="text-white text-xs font-medium">500+</span>
                    <p className="text-blue-100 text-xs">užklausų/mėn.</p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-2 rounded-lg">
                    <span className="text-white text-xs font-medium">98%</span>
                    <p className="text-blue-100 text-xs">pasitenkinimas</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Dažniausiai užduodami klausimai
            <div className="mt-2 mx-auto w-20 h-1 bg-blue-600 rounded"></div>
          </h2>
          
          <div className="space-y-6">
            {[
              {
                question: "Ar galiu išbandyti platformą nemokamai?",
                answer: "Taip, Verslo Daigynas siūlo nemokamą registraciją ir pagrindinių funkcijų naudojimą. Galite peržiūrėti tiekėjus, susisiekti su jais ir valdyti savo profilį be jokių įsipareigojimų."
              },
              {
                question: "Kaip tapti paslaugų teikėju?",
                answer: "Norėdami tapti paslaugų teikėju, užpildykite registracijos formą platformoje arba susisiekite su mumis el. paštu. Po registracijos patikros gausite prieigą prie įmonės profilio valdymo įrankių."
              },
              {
                question: "Kokius dokumentus reikia pateikti registruojant verslą?",
                answer: "Registruojant verslą kaip tiekėją, reikia pateikti įmonės registracijos dokumentus, atstovo tapatybės dokumentą ir papildomai, priklausomai nuo teikiamų paslaugų pobūdžio, gali būti reikalingi licencijų ar kvalifikacijos patvirtinimo dokumentai."
              },
              {
                question: "Kaip veikia paslaugų užklausos?",
                answer: "Paslaugų užklausas galite siųsti tiesiogiai pasirinktiems teikėjams per platformos žinučių sistemą. Užpildykite užklausos formą, nurodydami savo poreikius, ir tiekėjai su jumis susisieks per platformą arba jūsų nurodytu kontaktu."
              },
              {
                question: "Kada bus prieinamos naujos funkcijos?",
                answer: "Verslo Daigynas nuolat tobulina platformą. Funkcijos, pažymėtos kaip 'Jau greitai', planuojamos įdiegti artimiausių 3-6 mėnesių laikotarpiu. Sekite mūsų naujienlaiškį, kad nepražiopsotumėte atnaujinimų!"
              }
            ].map((faq, index) => (
              <motion.div 
                key={index}
                className="bg-gray-50 rounded-lg p-6 border border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <p className="text-gray-600 mb-4">Neradote atsakymo į savo klausimą?</p>
            <a 
              href="/kontaktai" 
              className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
            >
              Susisiekite su mumis
              <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PlatformFeaturesPage;