import { Star } from "lucide-react";

export function StarRating({ value = 0, size = 16, className = "" }) {
  const full = Math.round(value);
  return (
    <div className={`flex items-center gap-0.5 ${className}`} data-testid="star-rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= full ? "fill-[#FFB300] text-[#FFB300]" : "text-neutral-700"}
        />
      ))}
    </div>
  );
}

export function StarInput({ value, onChange, size = 28 }) {
  return (
    <div className="flex items-center gap-1" data-testid="star-input">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          data-testid={`star-btn-${i}`}
          className="transition-transform hover:scale-110"
          aria-label={`${i} star`}
        >
          <Star
            size={size}
            className={
              i <= value
                ? "fill-[#FFB300] text-[#FFB300]"
                : "text-neutral-600 hover:text-[#FFB300]/70"
            }
          />
        </button>
      ))}
    </div>
  );
}
