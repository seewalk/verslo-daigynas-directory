// components/BusinessManagement/ManageBusinessButton.js
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import VendorManageModal from './VendorManageModal';

const ManageBusinessButton = ({ vendorId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openModal = () => {
    if (vendorId) {
      setIsModalOpen(true);
    } else {
      console.error('No vendor ID provided to ManageBusinessButton');
    }
  };
  
  const closeModal = () => {
    setIsModalOpen(false);
  };
  
  return (
    <>
      <motion.button
        onClick={openModal}
        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        disabled={!vendorId}
      >
        Valdyti &rarr;
      </motion.button>
      
      {isModalOpen && vendorId && (
        <VendorManageModal 
          isOpen={isModalOpen}
          onClose={closeModal}
          vendorId={vendorId}
        />
      )}
    </>
  );
};

export default ManageBusinessButton;