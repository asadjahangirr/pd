import { useState, useEffect } from "react";

/* ============================================================
   Product image with a hover reveal.
   • image   = the main/cover image (shown by default, everywhere).
   • image2  = the hover image (crossfades in on hover; on touch
               devices the two auto-alternate like a slideshow).

   Backwards-compat: if image2 isn't set but `image` is a bundled
   "/images/x.png" file, we fall back to the old "x-1.png" convention.
   If the hover image is missing/broken, we just show the main image.
   ============================================================ */

function legacyHover(image) {
  if (image && image.startsWith("/images/")) {
    return image.replace(/(\.[a-z0-9]+)(\?.*)?$/i, "-1$1$2");
  }
  return "";
}

export default function ProductImage({ image, image2, alt, imgClassName = "", className = "" }) {
  const hoverImg = image2 || legacyHover(image);

  const [isTouch, setIsTouch] = useState(false);
  const [showHover, setShowHover] = useState(false);
  const [hoverBroken, setHoverBroken] = useState(false);

  // Detect touch / no-hover devices
  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    const apply = () => setIsTouch(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // On touch devices, gently alternate the two images
  useEffect(() => {
    if (!isTouch || !hoverImg || hoverBroken) return;
    const t = setInterval(() => setShowHover((s) => !s), 2200);
    return () => clearInterval(t);
  }, [isTouch, hoverImg, hoverBroken]);

  const hasHover = hoverImg && !hoverBroken;

  const baseOpacity = !hasHover
    ? "opacity-100"
    : isTouch
    ? showHover
      ? "opacity-0"
      : "opacity-100"
    : "opacity-100 group-hover:opacity-0";

  const hoverOpacity = isTouch ? (showHover ? "opacity-100" : "opacity-0") : "opacity-0 group-hover:opacity-100";

  return (
    <span className={`group block ${className}`}>
      <span className="relative block h-full w-full">
        {/* Main image */}
        <img
          src={image}
          alt={alt}
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${imgClassName} ${baseOpacity}`}
        />
        {/* Hover image */}
        {hasHover && (
          <img
            src={hoverImg}
            alt=""
            aria-hidden="true"
            onError={() => setHoverBroken(true)}
            className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${imgClassName} ${hoverOpacity}`}
          />
        )}
      </span>
    </span>
  );
}
