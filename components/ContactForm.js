 import React from 'react';
import { motion } from 'framer-motion';

const ContactForm = ({ containerVariants, itemVariants }) => {
  return (
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
        Parašykite mums
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Left side - form description */}
        <motion.div 
          className="md:col-span-2 bg-blue-50 p-6 rounded-xl"
          variants={itemVariants}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Turite klausimų?</h3>
          <p className="text-gray-600 mb-4">
            Užpildykite šią formą ir mes su jumis susisieksime per 24 valandas.
          </p>
          <p className="text-gray-600 mb-4">
            Mūsų komanda mielai padės jums rasti tinkamiausius sprendimus jūsų verslui.
          </p>
          <div className="bg-white p-4 rounded-lg shadow-sm mt-6">
            <p className="text-sm text-gray-500 italic">
              "Verslo Daigynas komanda labai operatyviai atsakinga susitvarė su mūsų užklausa ir padėjo rasti puikų virtualaus biuro paslaugų teikiekėją. Esame labai patenkinti jų profesionalumu ir greitu reagavimu į mūsų poreikius."
            </p>
            <p className="text-right text-sm font-medium text-gray-700 mt-2">Jonas Jonaitis, UAB "Pavyzdys"</p>
          </div>
        </motion.div>

        {/* Right side - contact form */}
        <motion.div 
          className="md:col-span-3"
          variants={itemVariants}
        >
          <form className="bg-white p-6 rounded-xl shadow-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block font-medium text-gray-700 mb-2">Vardas, Pavardė</label>
                <input 
                  type="text" 
                  id="name" 
                  name="name" 
                  className="w-full py-2 sm:py-3 px-4 rounded-lg bg-gray-50 border-transparent focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all text-gray-800"
                  placeholder="jūsų vardas ir pavardė" 
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block font-medium text-gray-700 mb-2">El. Paštas</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  className="w-full py-2 sm:py-3 px-4 rounded-lg bg-gray-50 border-transparent focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all text-gray-800"
                  placeholder="jūsų@email.lt" 
                />
              </div>
            </div>

            {/* Subject */}
            <div className="mb-6">
              <label htmlFor="subject" className="block font-medium text-gray-700 mb-2">Tema</label>
              <input 
                type="text" 
                id="subject" 
                name="subject" 
                className="w-full py-2 sm:py-3 px-4 rounded-lg bg-gray-50 border-transparent focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all text-gray-800"
                placeholder="Užklausos tema" 
              />
            </div>

            {/* Message */}
            <div className="mb-6">
              <label htmlFor="message" className="block font-medium text-gray-700 mb-2">Žinutė</label>
              <textarea 
                id="message" 
                name="message" 
                rows="5" 
                className="w-full py-2 sm:py-3 px-4 rounded-lg bg-gray-50 border-transparent focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all text-gray-800"
                placeholder="Jūsų žinutė" 
              ></textarea>
            </div>

            {/* Submit button */}
            <div className="text-right">
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 sm:py-3 px-8 rounded-lg transition-colors shadow-sm"
              >
                Siųsti užklausą
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ContactForm;
