import { features as baseFeatures } from '../data/features';
import packageInfo from '../package.json';

/**
 * Map icon name to actual icon component
 * @param {string} iconName Name of the icon
 * @returns {JSX.Element} Icon component
 */
const getIconForFeature = (iconName = 'default') => {
  const icons = {
    building: (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
      </svg>
    ),
    chat: (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
      </svg>
    ),
    // Add more icons here
    default: (
      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
      </svg>
    )
  };
  
  return icons[iconName] || icons.default;
};

/**
 * Process package.json features and add required properties
 * @param {Object} packageFeatures Features from package.json
 * @returns {Object} Processed features
 */
const processPackageFeatures = (packageFeatures) => {
  const result = { userFeatures: [], vendorFeatures: [], platformFeatures: [] };
  
  // Process user features
  if (packageFeatures.userFeatures) {
    result.userFeatures = packageFeatures.userFeatures.map(feature => ({
      ...feature,
      icon: getIconForFeature(feature.icon),
      comingSoon: false
    }));
  }
  
  // Process vendor features
  if (packageFeatures.vendorFeatures) {
    result.vendorFeatures = packageFeatures.vendorFeatures.map(feature => ({
      ...feature,
      icon: getIconForFeature(feature.icon),
      comingSoon: false
    }));
  }
  
  // Process coming soon features
  if (packageFeatures.comingSoon) {
    packageFeatures.comingSoon.forEach(feature => {
      // Determine category based on feature ID or default to platform features
      const category = 
        feature.id.includes('vendor') ? 'vendorFeatures' :
        feature.id.includes('user') ? 'userFeatures' : 'platformFeatures';
      
      result[category].push({
        ...feature,
        icon: getIconForFeature(feature.icon),
        isAvailable: false,
        comingSoon: true,
        versionAdded: feature.plannedVersion
      });
    });
  }
  
  return result;
};

/**
 * Merge base features with package.json features
 */
const mergedFeatures = (() => {
  try {
    // Get features from package.json
    const packageFeatures = packageInfo.features || {};
    const processedPackageFeatures = processPackageFeatures(packageFeatures);
    
    // Merge with base features
    return {
      userFeatures: [...baseFeatures.userFeatures, ...processedPackageFeatures.userFeatures],
      vendorFeatures: [...baseFeatures.vendorFeatures, ...processedPackageFeatures.vendorFeatures],
      platformFeatures: [...baseFeatures.platformFeatures, ...processedPackageFeatures.platformFeatures]
    };
  } catch (error) {
    console.error("Error merging features:", error);
    return baseFeatures;
  }
})();

/**
 * Get all features by category
 * @param {string} category Category name
 * @returns {Array} Features for that category
 */
export const getFeaturesByCategory = (category) => {
  return mergedFeatures[category] || [];
};

/**
 * Get new features based on version
 * @param {string} currentVersion Current app version 
 * @returns {Array} New features for the current version
 */
export const getNewFeatures = (currentVersion) => {
  const allFeatures = [
    ...mergedFeatures.userFeatures,
    ...mergedFeatures.vendorFeatures,
    ...mergedFeatures.platformFeatures
  ];
  
  return allFeatures.filter(feature => feature.versionAdded === currentVersion);
};

/**
 * Get coming soon features
 * @returns {Array} Coming soon features
 */
export const getComingSoonFeatures = () => {
  const allFeatures = [
    ...mergedFeatures.userFeatures,
    ...mergedFeatures.vendorFeatures,
    ...mergedFeatures.platformFeatures
  ];
  
  return allFeatures.filter(feature => feature.comingSoon === true);
};

export default mergedFeatures;