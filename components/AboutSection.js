import React, { useRef, useEffect } from 'react';

const AboutSection = () => {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const observerOptions = {
      root: null,
      threshold: 0.15,
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
    if (imageRef.current) observer.observe(imageRef.current);
    if (textRef.current) observer.observe(textRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section 
      ref={sectionRef}
      className="py-16 px-6 md:px-16 max-w-6xl mx-auto opacity-0 transition-all duration-700 ease-out transform translate-y-8"
      style={{animationFillMode: 'forwards'}}
    >
      <div className="flex flex-col md:flex-row items-center gap-12 relative">
        {/* Decorative element */}
        <div className="absolute -z-10 w-64 h-64 bg-blue-50 rounded-full -left-12 -top-12 opacity-60 hidden md:block"></div>
        
        {/* Image with animation */}
        <div 
          ref={imageRef}
          className="w-full md:w-1/2 opacity-0 transition-all duration-700 delay-300 ease-out transform -translate-x-8"
          style={{animationFillMode: 'forwards'}}
        >
          <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 relative group">
            {/* Blue accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-600 z-10"></div>
            
            <img
              src="/about.jpg"
              alt="Apie Verslo Daigyną"
              className="w-full h-auto object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
            
            {/* Overlay effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>

        {/* Text content with animation */}
        <div 
          ref={textRef}
          className="w-full md:w-1/2 opacity-0 transition-all duration-700 delay-500 ease-out transform translate-x-8"
          style={{animationFillMode: 'forwards'}}
        >
          <div className="p-1">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 relative">
              Apie Verslo Daigyną
              <span className="absolute -bottom-2 left-0 w-16 h-1 bg-blue-600"></span>
            </h2>
            
            <p className="text-gray-700 text-base leading-relaxed mb-5">
              Verslo Daigynas – tai iniciatyva, gimusi iš poreikio suteikti lengvesnį startą mažiems verslams.
              Čia jungiame juridinių asmenų bendruomenę. Šie asmenys teikia įvairius įrankius ir paslaugas jūsų verslo augimui, 
              ko pasekoje jūsų verslas tampa geriau matomas Lietuvos rinkoje.
            </p>
            
            <p className="text-gray-600 text-base mb-8">
              Dirbame ne tik kaip bendruomenės vystytojai, bet ir kaip partneris – siūlome papildomas paslaugas,
              kurios padeda Jūsų verslui ne tik startuoti, bet ir augti tvariai.
            </p>
            
            <a 
              href="/apie-mus" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-all duration-300 group"
            >
              Sužinoti daugiau
              <svg 
                className="w-5 h-5 ml-2 transform transition-transform duration-300 group-hover:translate-x-1.5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
              </svg>
            </a>
          </div>
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

export default AboutSection;