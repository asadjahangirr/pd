import { useState } from "react";

/* Reusable star rating.
   - Display:  <StarRating value={4.5} />
   - Input:    <StarRating value={n} interactive onChange={setN} />
   Half stars are shown in display mode. */
export default function StarRating({ value = 0, onChange, interactive = false, size = "text-base" }) {
  const [hover, setHover] = useState(0);
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`inline-flex items-center gap-0.5 ${size}`}>
      {stars.map((s) => {
        let style = "fa-regular";
        let icon = "fa-star";
        if (interactive) {
          style = (hover || value) >= s ? "fa-solid" : "fa-regular";
        } else if (value >= s) {
          style = "fa-solid";
        } else if (value >= s - 0.5) {
          style = "fa-solid";
          icon = "fa-star-half-stroke";
        }

        const starEl = <i className={`${style} ${icon} text-accent`}></i>;

        if (!interactive) return <span key={s}>{starEl}</span>;

        return (
          <button
            key={s}
            type="button"
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange && onChange(s)}
            className="cursor-pointer transition-transform hover:scale-110"
            aria-label={`${s} star${s > 1 ? "s" : ""}`}
          >
            {starEl}
          </button>
        );
      })}
    </div>
  );
}