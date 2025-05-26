import React, { useEffect, useRef } from 'react';

const UserBenefitsSection = () => {
  const sectionRef = useRef(null);
  const titleRef = useRef(null);
  const benefitRefs = useRef([]);
  
  // Reset refs array
  benefitRefs.current = [];
  
  // Add to refs array function
  const addToRefs = (el) => {
    if (el && !benefitRefs.current.includes(el)) {
      benefitRefs.current.push(el);
    }
  };

  useEffect(() => {
    const observerOptions = {
      root: null,
      threshold: 0.2,
      rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe elements
    if (sectionRef.current) observer.observe(sectionRef.current);
    if (titleRef.current) observer.observe(titleRef.current);
    
    // Observe all benefit cards
    benefitRefs.current.forEach(ref => {
      observer.observe(ref);
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const benefits = [
    {
      title: 'Greita nauda vartotojams',
      tagline: '"Sutaupykite laiką ir pasitikėkite patikimais partneriais"',
      description: 'Greitai raskite verslo adresų registravimo paslaugas, palyginkite kainas ir išsirinkite geriausiai tinkantį sprendimą – viskas vienoje vietoje.',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      delay: 'delay-200'
    },
    {
      title: 'Bendruomenės rekomendacijos',
      tagline: '"Pasitikėjimas, paremtas patirtimi"',
      description: 'Matykite kitų verslų pasirinkimus, atsiliepimus ir rekomendacijas. Būkite užtikrinti, kad renkatės patikrintus paslaugų teikėjus.',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      ),
      badge: 'Jau greitai',
      delay: 'delay-400'
    },
    {
      title: 'Augimo galimybės',
      tagline: '"Daugiau nei adresas – platforma Jūsų augimui"',
      description: 'Raskite papildomas paslaugas (buhalterija, teisė, marketingas) ir auginkite savo verslą kartu su patikimais partneriais.',
      icon: (
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
        </svg>
      ),
      badge: 'Jau greitai',
      delay: 'delay-600'
    }
  ];

  return (
    <section 
      ref={sectionRef}
      className="relative bg-gradient-to-b from-gray-50 to-gray-100 py-20 px-6 md:px-16 overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-blue-100 rounded-full -translate-x-1/2 -translate-y-1/2 opacity-30"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-50 rounded-full translate-x-1/3 translate-y-1/3 opacity-40"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section heading */}
        <div 
          ref={titleRef}
          className="text-center mb-16 opacity-0 transform translate-y-6 transition-all duration-700 ease-out"
          style={{animationFillMode: 'forwards'}}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 relative inline-block">
            Kodėl verta naudotis Verslo Daigynu?
            <div className="absolute w-24 h-1.5 bg-blue-600 rounded bottom-0 left-1/2 transform -translate-x-1/2 -bottom-3"></div>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              ref={addToRefs}
              className={`bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-500 border border-gray-200 
                          opacity-0 transform translate-y-8 transition-all ease-out ${benefit.delay}
                          relative overflow-hidden group`}
              style={{animationFillMode: 'forwards'}}
            >
              {/* Card accent */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              
              {/* Icon */}
              <div className="mb-5 p-3 bg-blue-50 inline-flex rounded-xl transform transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-110">
                {benefit.icon}
              </div>
              
              {/* Content */}
              <div className="relative">
                {benefit.badge && (
                  <span className="absolute -right-1 -top-1 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium animate-pulse">
                    {benefit.badge}
                  </span>
                )}
                
                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-700 transition-colors duration-300">
                  {benefit.title}
                </h3>
                
                <h4 className="text-md text-blue-600 font-medium mb-3 italic">
                  {benefit.tagline}
                </h4>
                
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </div>

              {/* Arrow indicator on hover */}
              <div className="mt-5 flex justify-end">
                <div className="text-blue-600 opacity-0 transform translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* CTA button */}
        <div className="mt-12 text-center opacity-0 transform translate-y-6 transition-all duration-700 delay-700 ease-out animate-in" style={{animationFillMode: 'forwards'}}>
          <a 
            href="/paslaugos" 
            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 text-white rounded-lg text-base font-medium transition-all duration-300 shadow-sm hover:shadow"
          >
            Sužinoti daugiau
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </a>
        </div>
      </div>

      {/* Add CSS to handle the animations */}
      <style jsx>{`
        .animate-in {
          opacity: 1;
          transform: translate(0, 0);
        }
      `}</style>
    </section>
  );
};

export default UserBenefitsSection;
