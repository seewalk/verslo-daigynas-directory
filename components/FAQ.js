import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  // FAQ data array with questions and answers
  const faqItems = [
    {
      question: "Kaip veikia Verslo Daigynas?",
      answer: "Verslo Daigynas yra platforma, jungianti verslininkus su reikiamais paslaugų tiekėjais. Mes padedame rasti patikimus verslo adresų registravimo paslaugų teikėjus, palyginti jų pasiūlymus ir pasirinkti geriausią sprendimą. Taip pat teikiame aktualią informaciją apie verslo tendencijas ir naujoves."
    },
    {
      question: "Kodėl turėčiau naudotis Verslo Daigynu, o ne ieškoti paslaugų teikėjų savarankiškai?",
      answer: "Naudodamiesi Verslo Daigynu, taupote laiką ir sumažinate klaidų riziką. Mūsų platformoje rasite patikrintus paslaugų teikėjus, galėsite palyginti jų kainas ir paslaugas vienoje vietoje. Be to, suteikiame prieigą prie aktualių verslo naujienų ir ekspertų įžvalgų, kurios padės priimti geresnius sprendimus."
    },
    {
      question: "Ar Verslo Daigyno paslaugos yra mokamos?",
      answer: "Verslo Daigyno pagrindinės paslaugos yra nemokamos. Galite nemokamai naršyti po platformą, ieškoti paslaugų teikėjų ir skaityti naujienas. Kai kurioms papildomoms funkcijoms gali būti taikomi mokesčiai, tačiau apie tai būsite aiškiai informuoti prieš jomis naudojantis."
    },
    {
      question: "Kaip užtikrinate platformoje esančių paslaugų teikėjų patikimumą?",
      answer: "Visi Verslo Daigyno platformoje esantys paslaugų teikėjai yra patikrinti. Mes tikriname jų veiklos istoriją, klientų atsiliepimus ir teisinius dokumentus, kad užtikrintume jų patikimumą. Be to, nuolat stebime teikėjų veiklą ir atnaujintų informaciją apie jų teikiamas paslaugas bei kainas."
    },
    {
      question: "Ar galiu rekomenduoti paslaugų teikėją, kurio nėra jūsų platformoje?",
      answer: "Taip, visuomet laukiame jūsų rekomendacijų! Jei žinote patikimą paslaugų teikėją, kurio dar nėra mūsų platformoje, galite jį rekomenduoti per kontaktinę formą. Mes susisieksime su juo ir, jei jis atitiks mūsų kokybės standartus, įtrauksime į platformą."
    },
    {
      question: "Kaip galiu susisiekti su Verslo Daigyno komanda?",
      answer: "Su mumis galite susisiekti keliais būdais: per kontaktinę formą svetainėje, el. paštu info@verslodaigynas.lt arba telefonu +370 600 00000. Mūsų komanda mielai atsakys į visus jūsų klausimus ir padės išspręsti iškilusias problemas."
    },
    {
      question: "Ar teikiate konsultacijas verslo steigimo klausimais?",
      answer: "Mes tiesiogiai neteikiame verslo steigimo konsultacijų, tačiau mūsų platformoje galite rasti kvalifikuotus specialistus, kurie teikia tokias paslaugas. Be to, mūsų naujienų skiltyje reguliariai publikuojame naudingus straipsnius ir patarimus verslo steigimo bei valdymo temomis."
    }
  ];

  // Toggle FAQ item open/closed state
  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 relative inline-block">
            Dažniausiai užduodami klausimai
            <div className="absolute w-24 h-1.5 bg-blue-600 bottom-0 left-1/2 transform -translate-x-1/2 -bottom-3 rounded-full"></div>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-6">
            Atsakymai į dažniausius klausimus apie Verslo Daigyno platformą ir jos teikiamas paslaugas
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqItems.map((item, index) => (
            <motion.div
              key={`faq-${index}`}
              className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Question header */}
              <button
                className={`w-full flex justify-between items-center p-5 text-left transition-colors ${
                  openIndex === index ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => toggleItem(index)}
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <h3 className="text-lg font-semibold text-gray-800">{item.question}</h3>
                <div className={`flex-shrink-0 ml-4 text-blue-600 transition-transform duration-300 ${
                  openIndex === index ? 'transform rotate-180' : ''
                }`}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>
              
              {/* Answer content with animation */}
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    id={`faq-answer-${index}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden border-t border-gray-100"
                  >
                    <motion.div
                      initial={{ y: -10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -10, opacity: 0 }}
                      transition={{ duration: 0.3, delay: 0.1 }}
                      className="p-5 bg-white"
                    >
                      <p className="text-gray-600">{item.answer}</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Call To Action */}
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-gray-600 mb-6">
            Neradote atsakymo į savo klausimą? Susisiekite su mumis tiesiogiai.
          </p>
          <a 
            href="/kontaktai"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            Susisiekite su mumis
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;
