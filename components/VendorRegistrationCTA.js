import React from 'react';
import { motion } from 'framer-motion';

const VendorRegistrationCTA = () => {
  return (
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
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
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
                href="/registracija/tiekejai" 
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
  );
};

export default VendorRegistrationCTA;
