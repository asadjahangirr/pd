import { Link } from "react-router-dom";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-900 text-brand-100">
      <div className="mx-auto max-w-7xl px-5 py-16 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand + social (spans 2 columns on large screens) */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              {/* ADD IMAGE: client/public/images/logo.png (a white/light logo reads best on dark) */}
              <img src="/images/logo.png" alt="Delight Pharma" className="h-10 w-10 object-contain" />
              <span className="font-display text-xl font-semibold text-white">Delight Pharma</span>
            </div>
            <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-brand-200">
              Dermatologist-recommended skincare for acne, pigmentation, sun protection, and anti-aging.
            </p>

            <div className="mt-6 flex gap-3">
              {/* Social links — replace # with your real URLs */}
              <a href="#" aria-label="Facebook" className="footer-social"><i className="fa-brands fa-facebook-f"></i></a>
              <a href="#" aria-label="Instagram" className="footer-social"><i className="fa-brands fa-instagram"></i></a>
              <a href="#" aria-label="X" className="footer-social"><i className="fa-brands fa-x-twitter"></i></a>
              <a href="#" aria-label="LinkedIn" className="footer-social"><i className="fa-brands fa-linkedin-in"></i></a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-list">
              <li><Link to="/about" className="footer-link">About</Link></li>
              <li><Link to="/careers" className="footer-link">Careers</Link></li>
              <li><Link to="/contact" className="footer-link">Contact</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="footer-heading">Customer Service</h4>
            <ul className="footer-list">
              <li><Link to="/faqs" className="footer-link">FAQs</Link></li>
              <li><Link to="/returns" className="footer-link">Returns</Link></li>
              <li><Link to="/shipping" className="footer-link">Shipping</Link></li>
              <li><Link to="/privacy" className="footer-link">Privacy Policy</Link></li>
              <li><Link to="/terms" className="footer-link">Terms &amp; Conditions</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="footer-heading">Categories</h4>
            <ul className="footer-list">
              <li><Link to="/products" className="footer-link">Medicines</Link></li>
              <li><Link to="/products" className="footer-link">Vitamins</Link></li>
              <li><Link to="/products" className="footer-link">Personal Care</Link></li>
              <li><Link to="/products" className="footer-link">Baby Care</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="footer-heading">Contact</h4>
            <ul className="footer-list">
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-envelope mt-1 text-brand-400"></i>
                <span>info@delightpharma.com</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-phone mt-1 text-brand-400"></i>
                <span>+92 300 0000000{/* ADD your phone number */}</span>
              </li>
              <li className="flex items-start gap-2">
                <i className="fa-solid fa-location-dot mt-1 text-brand-400"></i>
                <span>Karachi, Pakistan{/* ADD your full address */}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar: copyright + payment methods */}
        <div className="mt-14 flex flex-col items-center justify-between gap-6 border-t border-brand-800 pt-8 md:flex-row">
          <p className="font-body text-xs text-brand-300">© {year} Delight Pharma. All rights reserved.</p>
          <div className="flex items-center gap-4 text-3xl text-brand-200">
            <span className="font-mono text-[11px] uppercase tracking-widest text-brand-400">We accept</span>
            <i className="fa-brands fa-cc-visa" aria-label="Visa"></i>
            <i className="fa-brands fa-cc-mastercard" aria-label="Mastercard"></i>
            {/* <i className="fa-brands fa-cc-paypal" aria-label="PayPal"></i> */}
          </div>
        </div>
      </div>``
    </footer>
  );
}
