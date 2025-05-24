// TODO: Add footer component code here
import React from 'react';

const Footer = () => (
  <footer className="bg-gray-50 border-t border-gray-200 px-4 py-4 mt-12">
    <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
      
      {/* Logo and project name */}
      <div className="flex items-center gap-2">
        <img
          src="/logo.png"
          alt="Verslo Daigynas logotipas"
          className="w-10 h-10 object-contain rounded-md border border-gray-100"
        />
        <span className="font-semibold text-gray-800 text-base">Verslo Daigynas</span>
      </div>

      {/* Year */}
      <div className="text-gray-500 text-sm text-center sm:text-right">
        © {new Date().getFullYear()} Visos teisės saugomos
      </div>
    </div>
  </footer>
);

export default Footer;
