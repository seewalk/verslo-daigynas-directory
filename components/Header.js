// TODO: Add header component code here
import React, { useState } from 'react';

const Header = () => {
  const [language, setLanguage] = useState('lt');

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'lt' ? 'en' : 'lt'));
    // Add i18n logic here later
  };

  return (
    <header className="bg-gray-50 border-b border-gray-200 px-4 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        
        {/* Logo + Brand */}
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Verslų Daigyno logotipas"
            className="w-10 h-10 object-contain rounded-md border border-gray-100"
          />
          <span className="font-semibold text-gray-800 text-base">Verslo Daigynas</span>
        </div>

        {/* Language Toggle */}
        <button
          onClick={toggleLanguage}
          className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md border border-blue-100 hover:bg-blue-100 transition"
          aria-label="Perjungti kalbą"
        >
          {language === 'lt' ? 'EN' : 'LT'}
        </button>
      </div>
    </header>
  );
};

export default Header;
