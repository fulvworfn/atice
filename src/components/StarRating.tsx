import { useState } from "react";

interface StarsDisplayProps {
  rating: number;
  size?: number;
}

export function StarsDisplay({ rating, size = 13 }: StarsDisplayProps) {
  return (
    <span className="stars-display" aria-label={`${rating.toFixed(1)} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} style={{ fontSize: size }} className={i <= Math.round(rating) ? "star-filled" : "star-empty"}>
          ★
        </span>
      ))}
    </span>
  );
}

interface StarPickerProps {
  value: number;
  onChange: (value: number) => void;
}

export function StarPicker({ value, onChange }: StarPickerProps) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: 2 }} role="radiogroup" aria-label="Calificación">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          className={`star-btn${i <= (hover || value) ? " filled" : ""}`}
          aria-label={`${i} estrella${i > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
