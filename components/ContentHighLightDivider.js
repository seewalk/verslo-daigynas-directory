import React from 'react';
import { motion } from 'framer-motion';

const ContentHighlightDivider = () => {
  // Stats to display - can be replaced with actual data
  const statistics = [
    { value: '100+', label: 'Tiekėjų' },
    { value: '500+', label: 'Verslo klientų' },
    { value: '15+', label: 'Lietuvos miestų' },
    { value: '97%', label: 'Klientų pasitenkinimas' }
  ];
  
  return (
    <section className="py-10 px-4 relative overflow-hidden">
      {/* Top accent line for consistency with previous divider */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-blue-600 rounded-full"></div>
      
      {/* Background with light pattern */}
      <div className="absolute inset-0 bg-gray-50 opacity-80">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle, #e1e7fa 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      {/* Subtle divider lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      
      <div className="max-w-5xl mx-auto relative z-10"> {/* Matching max-width with previous component */}
        {/* Quote or highlight */}
        <motion.div 
          className="max-w-3xl mx-auto text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <svg className="w-10 h-10 text-blue-400 mx-auto mb-3 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-2"> {/* Matching font sizes with previous component */}
            Padedame verslui augti su patikimais partneriais
          </h2>
          <p className="text-blue-600"> {/* Matching text color scheme */}
            Atlikus klientų apklausą, net <span className="font-semibold">94%</span> verslininkų rekomenduoja mūsų platformą.
          </p>
        </motion.div>
        
        {/* Stats Row */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center p-6 md:p-8 bg-white rounded-xl shadow-sm border border-gray-200" /* Added card style to match previous component */
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ 
            duration: 0.5, 
            delay: 0.2,
          }}
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
  );
};

export default ContentHighlightDivider;

