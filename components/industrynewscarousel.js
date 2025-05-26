import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const IndustryNewsCarousel = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const autoPlayRef = useRef(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        const data = await response.json();

        if (data.articles) {
          // Filter out articles without images or descriptions, and take first 10
          const validArticles = data.articles
            .filter(article => article.urlToImage && article.description)
            .slice(0, 10);
            
          setArticles(validArticles);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('lt-LT', options);
  };
  
  // Handle auto-rotation of carousel
  useEffect(() => {
    // Don't start auto-rotation until content is loaded
    if (loading || articles.length === 0) return;
    
    const autoPlayCarousel = () => {
      if (!isPaused) {
        setActiveIndex((current) => 
          current === articles.length - 1 ? 0 : current + 1
        );
      }
    };
    
    autoPlayRef.current = setTimeout(autoPlayCarousel, 6000); // Change slide every 6 seconds
    
    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [activeIndex, isPaused, loading, articles.length]);
  
  // Navigation functions
  const goToSlide = (index) => {
    if (autoPlayRef.current) {
      clearTimeout(autoPlayRef.current);
    }
    setActiveIndex(index);
  };
  
  const goToPrev = () => {
    if (autoPlayRef.current) {
      clearTimeout(autoPlayRef.current);
    }
    setActiveIndex((current) => 
      current === 0 ? articles.length - 1 : current - 1
    );
  };
  
  const goToNext = () => {
    if (autoPlayRef.current) {
      clearTimeout(autoPlayRef.current);
    }
    setActiveIndex((current) => 
      current === articles.length - 1 ? 0 : current + 1
    );
  };
  
  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 100) {
      // Swipe left
      goToNext();
    }
    
    if (touchStart - touchEnd < -100) {
      // Swipe right
      goToPrev();
    }
  };

  // Loading state
  if (loading) {
    return (
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Kraunamos verslo naujienos...</p>
        </div>
      </section>
    );
  }

  // Error state (no articles)
  if (!articles.length) {
    return (
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <div className="text-center bg-red-50 py-10 px-4 rounded-xl border border-red-100">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Naujienų nepavyko gauti</h3>
          <p className="text-gray-600">Bandykite atnaujinti puslapį vėliau</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative inline-block"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Verslo naujienos ir įžvalgos</h2>
            <div className="absolute w-24 h-1.5 bg-blue-600 bottom-0 left-1/2 transform -translate-x-1/2 rounded-full"></div>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600 max-w-3xl mx-auto"
          >
            Sekite naujausias verslo tendencijas ir ekspertų įžvalgas, kurios padės jūsų verslui augti
          </motion.p>
        </div>
        
        {/* Carousel container */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="relative"
          ref={carouselRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Carousel slides */}
          <div className="overflow-hidden relative rounded-2xl shadow-lg">
            {/* Progress bar */}
            <div className="absolute top-0 left-0 right-0 z-10 h-1 bg-gray-200">
              <motion.div 
                className="h-full bg-blue-600"
                initial={{ width: "0%" }}
                animate={{ width: isPaused ? "100%" : "100%" }}
                transition={{ 
                  duration: isPaused ? 0 : 6,
                  ease: "linear",
                  repeat: isPaused ? 0 : Infinity,
                }}
                key={activeIndex}
              />
            </div>
            
            {/* Carousel items */}
            <div className="relative aspect-[16/9] md:aspect-[21/9]">
              {articles.map((article, index) => (
                <motion.div
                  key={`slide-${index}`}
                  className={`absolute inset-0 ${activeIndex === index ? 'block' : 'hidden'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: activeIndex === index ? 1 : 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="h-full flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="w-full md:w-1/2 relative overflow-hidden">
                      <img 
                        src={article.urlToImage} 
                        alt={article.title}
                        className="w-full h-full object-cover"
                        loading={index === 0 ? "eager" : "lazy"}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/600x400?text=Verslo+naujienos";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 to-transparent"></div>
                      
                      {/* Category badge */}
                      <span className="absolute top-4 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        {article.source?.name || 'Verslo naujienos'}
                      </span>
                      
                      {/* Date badge */}
                      <span className="absolute top-4 right-4 bg-white/90 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                        {formatDate(article.publishedAt)}
                      </span>
                    </div>
                    
                    {/* Content */}
                    <div className="w-full md:w-1/2 bg-white p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <span className="font-medium text-blue-600">{article.source?.name || 'Verslo naujienos'}</span>
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">{article.title}</h3>
                        <p className="text-gray-600 line-clamp-3 md:line-clamp-4 mb-6">{article.description}</p>
                      </div>
                      
                      <a 
                        href={article.url} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center font-medium text-blue-600 hover:text-blue-800 transition-colors group"
                      >
                        Skaityti daugiau
                        <svg className="w-5 h-5 ml-2 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Navigation arrows */}
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-md transition-all transform hover:scale-110 z-20"
              onClick={goToPrev}
              aria-label="Previous news"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
            </button>
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-3 rounded-full shadow-md transition-all transform hover:scale-110 z-20"
              onClick={goToNext}
              aria-label="Next news"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </button>
          </div>
          
          {/* Carousel indicators */}
          <div className="flex items-center justify-center mt-5 space-x-2">
            {articles.map((_, index) => (
              <button
                key={`indicator-${index}`}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  activeIndex === index ? 'bg-blue-600 w-6' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={activeIndex === index ? 'true' : 'false'}
              />
            ))}
          </div>
        </motion.div>
        
        {/* Browse more news link */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-10"
        >
          <a 
            href="/verslo-naujienos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors group"
          >
            <span className="font-medium text-gray-800">Peržiūrėti visas naujienas</span>
            <svg className="w-5 h-5 ml-2 text-blue-600 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default IndustryNewsCarousel;
