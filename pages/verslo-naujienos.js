import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function VersloNaujienos() {
  // State management
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [visibleArticles, setVisibleArticles] = useState(18); // Initially show 18 articles (show more)
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);
  
// Define news categories
const categories = [
  { id: 'all', name: 'Visos naujienos' },

  {
    id: 'finansai',
    name: 'Finansai',
    keywords: [
      'finansai',
      'bankas',
      'investicijos',
      'mokesčiai',
      'finansų technologijos',
      'finansavimas',
      'VMI',
    ],
  },

  {
    id: 'technologijos',
    name: 'Technologijos',
    keywords: [
      'technologijos',
      'inovacijos',
      'startuoliai',
      'IT',
      'ekonomikos augimas',
    ],
  },

  {
    id: 'teisė',
    name: 'Teisė',
    keywords: [
      'teisė',
      'įstatymas',
      'teisinis',
      'reguliavimas',
      'juridinis adresas',
      'verslo registracija',
      'įmonių steigimas',
    ],
  },

  {
    id: 'rinkodara',
    name: 'Rinkodara',
    keywords: [
      'rinkodara',
      'marketingas',
      'reklama',
      'prekės ženklas',
      'verslo strategija',
    ],
  },

  {
    id: 'ekonomika',
    name: 'Ekonomika',
    keywords: [
      'ekonomika',
      'darbo rinka',
      'verslo tendencijos',
      'ekonomikos augimas',
      'eksporto rinka',
      'verslo aplinka',
    ],
  },

  {
    id: 'verslas',
    name: 'Verslas',
    keywords: [
      'verslas',
      'smulkus verslas',
      'įmonė',
      'Lietuvos verslas',
      'verslo plėtra',
      'rinkos analizė',
      'investicinė aplinka',
    ],
  },
];
  
  // Determine article category based on content
  const getArticleCategory = (article) => {
    const title = article.title?.toLowerCase() || '';
    const description = article.description?.toLowerCase() || '';
    const content = title + ' ' + description;
    
    // Check each category's keywords
    for (const category of categories) {
      if (category.id === 'all') continue;
      
      if (category.keywords.some(keyword => content.includes(keyword))) {
        return category.id;
      }
    }
    
    return 'other'; // Default category
  };
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString('lt-LT', options);
    } catch (e) {
      return '';
    }
  };

  // Fetch news with pagination
  const fetchNews = useCallback(async (pageNum, append = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      
      // Fetch articles with pagination support
      const response = await fetch(`/api/news?page=${pageNum}&pageSize=20`);
      const data = await response.json();
      
      if (data.articles) {
        // Process and categorize articles
        const enhancedArticles = data.articles
          .filter(article => article.title && article.url) // Filter invalid articles
          .map(article => ({
            ...article,
            category: getArticleCategory(article),
            formattedDate: formatDate(article.publishedAt),
            source: article.source?.name || 'Verslo naujienos'
          }));
        
        // Either append to existing or replace
        if (append) {
          setArticles(prev => [...prev, ...enhancedArticles]);
        } else {
          setArticles(enhancedArticles);
        }
        
        // Update pagination state
        setHasMore(data.hasMore);
        
        // Preload next page if available (for smoother UX)
        if (data.hasMore) {
          fetch(`/api/news?page=${pageNum + 1}&pageSize=20`);
        }
      }
    } catch (error) {
      console.error('Nepavyko įkelti naujienų:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setInitialLoad(false);
    }
  }, []);
  
  // Initial load
  useEffect(() => {
    fetchNews(1, false);
  }, []);
  
  // Load more function
  const loadMore = () => {
  if (!loading && !loadingMore && hasMore) {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNews(nextPage, true);
    setVisibleArticles((prev) => prev + 18);
  }
};
  
  // Set up intersection observer for load more trigger
  useEffect(() => {
    if (loadMoreRef.current && !initialLoad) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          const [entry] = entries;
          if (entry.isIntersecting && hasMore && !loading && !loadingMore) {
            loadMore();
          }
        },
        { rootMargin: '200px' }
      );
      
      observerRef.current.observe(loadMoreRef.current);
      
      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }
  }, [hasMore, loading, loadingMore, initialLoad]);
  
  // Filter articles based on category and search query
  const filteredArticles = articles.filter(article => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    const matchesSearch = !searchQuery || 
      article.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      article.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesCategory && matchesSearch;
  });
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  // Handle category change
  const handleCategoryChange = (categoryId) => {
    setActiveCategory(categoryId);
  };

  return (
    <>
      <Head>
        <title>Verslo naujienos | Verslo Daigynas</title>
        <meta name="description" content="Naujausios Lietuvos verslo naujienos – sužinokite, kas vyksta ekonomikos ir smulkaus verslo pasaulyje." />
      </Head>
<Header />
      <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
        {/* Hero section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="max-w-5xl mx-auto px-6 text-center">
            <motion.h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Verslo naujienos
            </motion.h1>
            <motion.p 
              className="text-xl text-blue-100 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Sekite svarbiausias verslo naujienas ir tendencijas, kurios gali paveikti jūsų verslą
            </motion.p>
            
            {/* Search box */}
            <motion.div 
              className="mt-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Ieškoti naujienų..."
                  className="w-full bg-white bg-opacity-20 backdrop-blur-md focus:bg-white focus:bg-opacity-100 text-white focus:text-gray-800 border border-blue-300 rounded-full py-3 px-5 pl-12 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors"
                  aria-label="Ieškoti naujienų"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-200">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* Category tabs */}
          <motion.div 
            className="mb-10 overflow-x-auto scrollbar-hide"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex space-x-2 min-w-max pb-2">
              {categories.map((category, index) => (
                <motion.button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.2 }}
                >
                  {category.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
          
          {/* Status display */}
          <div className="mb-6 flex justify-between items-center">
            <div className="text-gray-600">
              {!initialLoad && filteredArticles.length > 0 && (
                <span>Rasta {filteredArticles.length} {filteredArticles.length === 1 ? 'naujiena' : 'naujienos'}</span>
              )}
            </div>
            
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Išvalyti paiešką
              </button>
            )}
          </div>

          {/* Initial loading state */}
          {initialLoad && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 mb-4 relative">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full animate-spin border-t-transparent"></div>
              </div>
              <p className="text-lg text-gray-600">Kraunamos verslo naujienos...</p>
            </div>
          )}

          {/* Empty state */}
          {!initialLoad && filteredArticles.length === 0 && (
            <motion.div 
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-10 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="mx-auto w-20 h-20 text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Naujienų nerasta</h3>
              <p className="text-gray-600 mb-6">Nepavyko rasti naujienų pagal pasirinktus kriterijus.</p>
              <button
                onClick={() => {
                  setActiveCategory('all');
                  setSearchQuery('');
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition-colors"
              >
                Rodyti visas naujienas
              </button>
            </motion.div>
          )}

          {/* Articles grid */}
          {!initialLoad && filteredArticles.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredArticles.slice(0, visibleArticles).map((article, i) => (
                  <motion.a
                    key={`${article.url}-${i}`}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow transition overflow-hidden h-full transform hover:-translate-y-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: i % 3 * 0.1 }}
                  >
                    <div className="relative">
                      {article.urlToImage ? (
                        <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                          <img 
                            src={article.urlToImage} 
                            alt={article.title} 
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/640x360?text=Verslo+naujienos";
                            }}
                            loading="lazy"
                          />
                        </div>
                      ) : (
                        <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center">
                          <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      
                      {/* Category tag */}
                      <div className="absolute top-3 left-3">
                        <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full 
                          ${article.category === 'finansai' ? 'bg-green-100 text-green-800' : 
                            article.category === 'technologijos' ? 'bg-purple-100 text-purple-800' : 
                            article.category === 'teisė' ? 'bg-red-100 text-red-800' : 
                            article.category === 'rinkodara' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-blue-100 text-blue-800'}`}
                        >
                          {article.category === 'finansai' ? 'Finansai' : 
                           article.category === 'technologijos' ? 'Technologijos' : 
                           article.category === 'teisė' ? 'Teisė' : 
                           article.category === 'rinkodara' ? 'Rinkodara' : 
                           'Verslas'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <h2 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {article.title}
                      </h2>
                      
                      <p className="text-gray-600 line-clamp-3 mb-4 text-sm flex-grow">
                        {article.description || "Skaitykite daugiau apie šią naujieną originaliame straipsnyje."}
                      </p>
                      
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 text-sm">
                        <div className="text-gray-500 truncate pr-2">
                          {article.source}
                        </div>
                        <div className="text-gray-400">
                          {article.formattedDate}
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center group-hover:bg-blue-50 transition-colors">
                      <span className="text-xs text-gray-500">
                        {article.url ? new URL(article.url).hostname.replace('www.', '') : ''}
                      </span>
                      <span className="inline-flex items-center text-sm font-medium text-blue-600 group-hover:text-blue-700">
                        Skaityti
                        <svg className="w-4 h-4 ml-1.5 transform transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </span>
                    </div>
                  </motion.a>
                ))}
              </AnimatePresence>
            </div>
          )}
          
          {/* Load more button */}
          {!initialLoad && filteredArticles.length > visibleArticles && (
            <div className="flex justify-center mt-12">
              <button 
                onClick={() => setVisibleArticles(prev => prev + 9)}
                className="bg-white hover:bg-gray-50 text-gray-800 font-medium py-3 px-6 border border-gray-300 rounded-lg shadow-sm transition-colors flex items-center"
              >
                Rodyti daugiau naujienų
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
            </div>
          )}
          
          {/* Auto load more trigger */}
          {!initialLoad && hasMore && !loadingMore && (
            <div 
              ref={loadMoreRef}
              className="h-10 w-full mt-10"
              aria-hidden="true"
            />
          )}
          
          {/* Loading more indicator */}
          {loadingMore && (
            <div className="flex justify-center mt-8 mb-10">
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="w-5 h-5 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin"></div>
                <span>Kraunama daugiau naujienų...</span>
              </div>
            </div>
          )}
          
          {/* End of results */}
          {!initialLoad && !hasMore && articles.length > 0 && (
            <div className="text-center mt-12 text-gray-500">
              <p>Jūs pasiekėte visų naujienų pabaigą</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

