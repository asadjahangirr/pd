import { Link } from "react-router-dom";
import { useSiteContent } from "../context/SiteContentContext.jsx";

export default function Footer() {
  const year = new Date().getFullYear();
  const { text } = useSiteContent();

  return (
    <footer className="bg-brand-900 text-brand-100">
      <div className="mx-auto max-w-7xl px-5 py-9 lg:px-8">
        {/* Contact us */}
        <div className="text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-brand-400">Get in touch</p>
          <h2 className="mt-1.5 font-display text-xl font-semibold text-white">Contact Us</h2>

          <div className="mt-5 flex flex-col flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:flex-row">
            {/* Phone — tap to call */}
            <a href={`tel:${text.phone}`} className="group inline-flex items-center gap-2 font-body text-sm text-brand-100 transition-colors hover:text-white">
              <i className="fa-solid fa-phone text-brand-400 transition-transform group-hover:scale-110 group-hover:text-brand-200"></i>
              {text.phone}
            </a>

            {/* Email — tap to compose */}
            <a href={`mailto:${text.email}`} className="group inline-flex items-center gap-2 font-body text-sm text-brand-100 transition-colors hover:text-white">
              <i className="fa-solid fa-envelope text-brand-400 transition-transform group-hover:scale-110 group-hover:text-brand-200"></i>
              {text.email}
            </a>

            {/* Address — opens in maps */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text.address)}`}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 font-body text-sm text-brand-100 transition-colors hover:text-white"
            >
              <i className="fa-solid fa-location-dot text-brand-400 transition-transform group-hover:scale-110 group-hover:text-brand-200"></i>
              {text.address}
            </a>
          </div>
        </div>

        {/* Bottom bar: track link + copyright */}
        <div className="mt-7 border-t border-brand-800 pt-5 text-center">
          <Link to="/track" className="font-body text-xs font-semibold text-brand-200 transition-colors hover:text-white">
            <i className="fa-solid fa-location-dot mr-1"></i> Track your order
          </Link>
          <p className="mt-2 font-body text-xs text-brand-300">© {year} Delight Pharma. All rights reserved. | Made by <b>2Pac-is-tan</b></p>
        </div>
      </div>
    </footer>
  );
}
