// components/Users/TeamProfiles.js
import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

const TeamProfiles = ({ teamMembers = [] }) => {  // Provide a default empty array
  const [activeFilter, setActiveFilter] = useState('all');
  
  // If no team members, don't render anything
  if (!teamMembers || teamMembers.length === 0) {
    return null;
  }
  
  // Safely handle non-array or null/undefined teamMembers
  const membersArray = Array.isArray(teamMembers) ? teamMembers : [];
  
  // Show featured members first, then sort by order
  const sortedMembers = [...membersArray].sort((a, b) => {
    if (a?.featured && !b?.featured) return -1;  // Add optional chaining
    if (!a?.featured && b?.featured) return 1;   // Add optional chaining
    return (a?.order || 999) - (b?.order || 999); // Add optional chaining and default values
  });
  
  // Filter members based on activeFilter
  const filteredMembers = activeFilter === 'all' 
    ? sortedMembers 
    : sortedMembers.filter(member => member?.position?.toLowerCase().includes(activeFilter.toLowerCase()));
  
  // Extract unique position categories for filter
  const positionCategories = ['all', ...new Set(sortedMembers
    .filter(member => member?.position) // Filter out members without position
    .map(member => member.position.split(' ')[0].toLowerCase())
  )];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="bg-white py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center">
          <motion.h2 
            className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Mūsų komanda
          </motion.h2>
          <motion.p 
            className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Susipažinkite su žmonėmis, kurie kasdien rūpinasi Jūsų verslo sėkme
          </motion.p>
        </div>
        
        {/* Position filters - only show if we have more than one category */}
        {positionCategories.length > 2 && (
          <motion.div 
            className="mt-8 flex flex-wrap justify-center gap-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {positionCategories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-4 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  activeFilter === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'Visi' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </motion.div>
        )}
        
        {/* Team grid */}
        <motion.div 
          className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {filteredMembers.map((member, index) => (
            <motion.div 
              key={member?.id || index} 
              className={`bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 ${
                member?.featured ? 'ring-2 ring-blue-500' : ''
              }`}
              variants={itemVariants}
            >
              <div className="relative h-80 w-full">
                {member?.photoUrl ? (
                  <div className="relative h-full w-full">
                    <Image
                      src={member.photoUrl}
                      alt={member.name || 'Team member'}
                      layout="fill"
                      objectFit="cover"
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <svg className="h-16 w-16 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                )}
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900">{member?.name || 'Team Member'}</h3>
                <p className="mt-1 text-sm font-medium text-blue-600">{member?.position || ''}</p>
                
                {member?.bio && (
                  <div className="mt-4 text-sm text-gray-600 line-clamp-4">
                    {member.bio}
                  </div>
                )}
                
                {/* Qualifications */}
                {member?.qualifications && member.qualifications.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-900">Kvalifikacijos:</h4>
                    <ul className="mt-2 text-sm text-gray-600">
                      {member.qualifications.map((qualification, idx) => (
                        <li key={idx} className="flex items-center">
                          <svg className="h-4 w-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {qualification}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Languages */}
                {member?.languages && member.languages.length > 0 && (
                  <div className="mt-3">
                    <h4 className="text-sm font-medium text-gray-900">Kalbos:</h4>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {member.languages.map((language, idx) => (
                        <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {language}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Contact & Social Media */}
                <div className="mt-6 flex items-center justify-between">
                  <div className="flex space-x-3">
                    {member?.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                        aria-label={`Email ${member.name || 'team member'}`}
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                      </a>
                    )}
                    
                    {member?.phone && (
                      <a
                        href={`tel:${member.phone}`}
                        className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
                        aria-label={`Call ${member.name || 'team member'}`}
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                      </a>
                    )}
                  </div>
                  
                  {/* Social Media Icons */}
                  {member?.socialMedia && (
                    <div className="flex space-x-3">
                      {member.socialMedia?.linkedin && (
                        <a
                          href={member.socialMedia.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                          aria-label={`LinkedIn profile of ${member.name || 'team member'}`}
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </a>
                      )}
                      
                      {member.socialMedia?.twitter && (
                        <a
                          href={member.socialMedia.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-blue-400 transition-colors duration-200"
                          aria-label={`Twitter profile of ${member.name || 'team member'}`}
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 9.99 9.99 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                          </svg>
                        </a>
                      )}
                      
                      {member.socialMedia?.github && (
                        <a
                          href={member.socialMedia.github}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-400 hover:text-gray-900 transition-colors duration-200"
                          aria-label={`GitHub profile of ${member.name || 'team member'}`}
                        >
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {filteredMembers.length === 0 && (
          <div className="mt-8 text-center text-gray-500">
            Nerasta komandos narių atitinkančių filtrą.
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamProfiles;
