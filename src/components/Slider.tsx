import { useRef, useState } from "react";
import type React from "react";
import type { MediaItem } from "../types";
import { isVideo } from "../lib/uploadMedia";
import { ChevL, ChevR } from "./Icons";
import { cx } from "../lib/utils";

interface SliderProps {
  media: MediaItem[];
  onZoom: (index: number) => void;
}

export function Slider({ media, onZoom }: SliderProps) {
  const [idx, setIdx] = useState(0);
  const touchX = useRef<number | null>(null);

  const go = (i: number) => setIdx(((i % media.length) + media.length) % media.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) (dx < 0 ? go(idx + 1) : go(idx - 1));
    touchX.current = null;
  };

  if (!media?.length) return null;

  return (
    <div style={{ position: "relative", overflow: "hidden", background: "#0A0401", userSelect: "none" }} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className="slider-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
        {media.map((m, i) => (
          <div key={i} className="slider-item" onClick={(e) => { e.stopPropagation(); onZoom(idx); }}>
            {isVideo(m) ? (
              <video
                src={m.url}
                style={{ width: "100%", height: 390, objectFit: "cover" }}
                muted
                loop
                autoPlay
                playsInline
                aria-label={`Video del producto ${i + 1}`}
              />
            ) : (
              <img
                src={m.url}
                alt={`Foto del producto ${i + 1}`}
                loading="lazy"
                decoding="async"
                onError={(e) => { e.currentTarget.dataset.broken = "true"; }}
              />
            )}
            <div
              style={{
                position: "absolute",
                bottom: 13,
                right: 14,
                background: "rgba(15,7,3,.72)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(224,122,92,.28)",
                borderRadius: 8,
                padding: "5px 10px",
                color: "var(--text)",
                fontSize: 11,
                fontFamily: "'DM Mono',monospace",
                display: "flex",
                alignItems: "center",
                gap: 5,
                pointerEvents: "none",
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35M11 8v6M8 11h6" />
              </svg>
              zoom
            </div>
          </div>
        ))}
      </div>
      {media.length > 1 && (
        <>
          <button type="button" className="nav-btn left" aria-label="Foto anterior" onClick={(e) => { e.stopPropagation(); go(idx - 1); }}>
            <ChevL s={16} />
          </button>
          <button type="button" className="nav-btn right" aria-label="Foto siguiente" onClick={(e) => { e.stopPropagation(); go(idx + 1); }}>
            <ChevR s={16} />
          </button>
          <div style={{ position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 7 }} role="tablist" aria-label="Indicadores de imagen">
            {media.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                className={cx("dot", i === idx && "active")}
                aria-label={`Ver imagen ${i + 1}`}
                aria-selected={i === idx}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
