import { createContext, useContext, useEffect, useState } from "react";
import { fetchProducts } from "../api/products.js";
import { fetchCategories } from "../api/admin.js";
import { useAutoRefresh } from "../lib/useAutoRefresh.js";

/* ============================================================
   Loads all products from the API once, and shares them app-wide.
   Replaces the old hardcoded array in data/products.js while
   keeping the same access pattern: useProducts() gives you
   { products, loading, error, getProductById, reload }.
   ============================================================ */

const ProductsContext = createContext();
export const useProducts = () => useContext(ProductsContext);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    Promise.all([fetchProducts(), fetchCategories().catch(() => [])])
      .then(([prods, cats]) => {
        setProducts(prods);
        setCategories(cats);
      })
      .catch((err) => setError(err.message || "Failed to load products"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  // Keep data fresh automatically (tab focus + light interval + admin actions),
  // so edits show up on the storefront without a manual refresh.
  useAutoRefresh(() => {
    fetchProducts().then(setProducts).catch(() => {});
    fetchCategories().then(setCategories).catch(() => {});
  }, 30000);

  // Same helper the pages already rely on — now backed by API data.
  const getProductById = (id) => products.find((p) => p.id === id);

  return (
    <ProductsContext.Provider value={{ products, categories, loading, error, getProductById, reload: load }}>
      {children}
    </ProductsContext.Provider>
  );
}
