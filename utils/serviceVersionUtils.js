import semver from 'semver'; // You may need to add this to your dependencies

/**
 * Compare two version strings
 * @param {string} v1 First version
 * @param {string} v2 Second version
 * @returns {number} 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
export const compareVersions = (v1, v2) => {
  return semver.compare(v1, v2);
};

/**
 * Check if a feature should be shown based on when it was added and app version
 * @param {string} featureVersion Version when feature was added
 * @param {string} appVersion Current app version
 * @returns {boolean} Whether to show the feature
 */
export const shouldShowFeature = (featureVersion, appVersion) => {
  return semver.gte(appVersion, featureVersion);
};

/**
 * Generate version tag text
 * @param {string} version Version string
 * @returns {string} Formatted version text
 */
export const getVersionTag = (version) => {
  return `v${version}`;
};

/**
 * Parse package.json to get features
 * @param {Object} packageJson The package.json object
 * @returns {Object} Features extracted from package.json
 */
export const getFeaturesFromPackage = (packageJson) => {
  // If you decide to add a features field to package.json
  return packageJson.features || {};
};