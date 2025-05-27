// utils/slugUtils.js
export const generateVendorSlug = (vendorName) => {
  if (!vendorName) return '';
  return vendorName.toLowerCase().replace(/\s+/g, '-');
};