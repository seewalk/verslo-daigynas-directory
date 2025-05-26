import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FAQIntroduction = () => {
  // Language state - matches the pattern from Header component
  const [language, setLanguage] = useState('lt');

  // Get language from localStorage on component mount, if it exists
  useEffect(() => {
    const storedLanguage = localStorage.getItem('preferredLanguage');
    if (storedLanguage) {
      setLanguage(storedLanguage);
    }
  }, []);

  // Language-specific content
  const content = {
    lt: {
      title: 'Raskite atsakymus į dažniausiai užduodamus klausimus',
      description: 'Šiame puslapyje rasite atsakymus į dažniausiai užduodamus klausimus apie Verslo Daigyną, mūsų platformą ir teikiamas paslaugas. Jei nerandate atsakymo į savo klausimą, galite susisiekti su mūsų klientų aptarnavimo komanda.',
    },
    en: {
      title: 'Find answers to frequently asked questions',
      description: 'On this page you will find answers to frequently asked questions about Verslo Daigynas, our platform and the services we provide. If you cannot find the answer to your question, you can contact our customer service team.',
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
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

  return (
    <motion.div
      className="mb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2 
        className="text-2xl sm:text-3xl font-semibold text-gray-800 mb-4"
        variants={itemVariants}
      >
        {content[language].title}
      </motion.h2>
      
      <motion.div 
        className="bg-blue-50 border-l-4 border-blue-500 p-4 sm:p-6 rounded-r-lg mb-8"
        variants={itemVariants}
      >
        <p className="text-gray-700">
          {content[language].description}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default FAQIntroduction;