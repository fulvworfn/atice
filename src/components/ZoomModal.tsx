import { useEffect, useRef, useState } from "react";
import type React from "react";
import type { MediaItem } from "../types";
import { isVideo } from "../lib/uploadMedia";
import { ChevL, ChevR, XI } from "./Icons";

interface ZoomModalProps {
  media: MediaItem[];
  startIdx: number;
  onClose: () => void;
}

export function ZoomModal({ media, startIdx, onClose }: ZoomModalProps) {
  const [idx, setIdx] = useState(startIdx);
  const touchX = useRef<number | null>(null);

  const go = (i: number) => setIdx(((i % media.length) + media.length) % media.length);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") go(idx - 1);
      if (e.key === "ArrowRight") go(idx + 1);
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  });

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) (dx < 0 ? go(idx + 1) : go(idx - 1));
    touchX.current = null;
  };

  const m = media[idx];

  const navBtnStyle = (dir: "left" | "right"): React.CSSProperties => ({
    position: "fixed",
    [dir]: 18,
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(224,122,92,.12)",
    border: "1px solid rgba(224,122,92,.28)",
    borderRadius: "50%",
    width: 48,
    height: 48,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--text)",
    transition: "background .18s, box-shadow .18s",
  });

  return (
    <div
      className="zoom-overlay open"
      role="dialog"
      aria-modal="true"
      aria-label="Vista ampliada"
      onClick={onClose}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {isVideo(m) ? (
        <video
          src={m.url}
          controls
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: "92vw", maxHeight: "88vh", borderRadius: 12 }}
          aria-label="Video del producto"
        />
      ) : (
        <img
          src={m.url}
          className="zoom-img"
          alt="Imagen ampliada del producto"
          onClick={(e) => e.stopPropagation()}
          draggable="false"
          loading="lazy"
          decoding="async"
        />
      )}
      {media.length > 1 && (
        <>
          <button type="button" style={navBtnStyle("left")} aria-label="Imagen anterior" onClick={(e) => { e.stopPropagation(); go(idx - 1); }}>
            <ChevL s={22} />
          </button>
          <button type="button" style={navBtnStyle("right")} aria-label="Imagen siguiente" onClick={(e) => { e.stopPropagation(); go(idx + 1); }}>
            <ChevR s={22} />
          </button>
          <div style={{ position: "fixed", bottom: 22, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
            {media.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Imagen ${i + 1}`}
                onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  background: i === idx ? "var(--accent)" : "rgba(248,237,228,.22)",
                  transform: i === idx ? "scale(1.45)" : "scale(1)",
                  transition: "all .22s",
                  boxShadow: i === idx ? "0 0 8px rgba(224,122,92,.5)" : "none",
                }}
              />
            ))}
          </div>
        </>
      )}
      <div style={{ position: "fixed", top: 18, left: "50%", transform: "translateX(-50%)", color: "rgba(248,237,228,.4)", fontFamily: "'DM Mono',monospace", fontSize: 12 }} aria-live="polite">
        {idx + 1} / {media.length}
      </div>
      <button
        type="button"
        aria-label="Cerrar zoom"
        onClick={onClose}
        style={{
          position: "fixed",
          top: 14,
          right: 14,
          background: "rgba(224,122,92,.12)",
          border: "1px solid rgba(224,122,92,.28)",
          borderRadius: "50%",
          width: 44,
          height: 44,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text)",
        }}
      >
        <XI s={18} />
      </button>
    </div>
  );
}
