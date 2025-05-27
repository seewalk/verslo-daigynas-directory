// utils/helpers.js
/**
 * Generates a URL-friendly slug from a vendor name
 * @param {string} vendorName - The vendor name to convert to a slug
 * @returns {string} - The URL-friendly slug
 */
export const generateVendorSlug = (vendorName) => {
  if (!vendorName) return '';
  return vendorName.toLowerCase().replace(/\s+/g, '-');
};
