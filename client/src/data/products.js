// ============================================================
//  Product DATA now lives in the database and is fetched from the
//  API — see src/api/products.js and src/context/ProductsContext.jsx.
//  Use the useProducts() hook to read products / getProductById.
//
//  Only the category filter labels remain here, since they define
//  the shop's filter UI (order + the "All" option) rather than data.
// ============================================================

export const categories = [
  "All",
  "Serums",
  "Acne Care",
  "Anti-Aging",
  "Sun Protection",
  "Scar Care",
  "Medicated Soaps",
];
