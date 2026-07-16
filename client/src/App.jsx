import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Products from "./pages/Products.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";

// As we build more pages, import them here and add a <Route> for each.
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetail />} />
      {/* <Route path="/contact" element={<Contact />} /> */}
      {/* <Route path="/about" element={<About />} /> */}
      {/* <Route path="/login" element={<Login />} /> */}
      {/* <Route path="/cart" element={<Cart />} /> */}
    </Routes>
  );
}