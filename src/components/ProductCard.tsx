import type React from "react";
import type { Product } from "../types";
import { isVideo } from "../lib/uploadMedia";
import { avgRating } from "../lib/utils";
import { ChevR, MailI, PhoneI } from "./Icons";

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  index: number;
}

export function ProductCard({ product, onClick, index }: ProductCardProps) {
  const handleImgError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.dataset.broken = "true";
  };

  return (
    <article
      className="product-card card-animate"
      onClick={onClick}
      style={{ animationDelay: `${index * 0.07}s` }}
      aria-label={`Ver detalle de ${product.name}`}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick();
      }}
    >
      <div className="card-img-wrap">
        {product.media?.length > 0 ? (
          <>
            {isVideo(product.media[0]) ? (
              <video
                src={product.media[0].url}
                muted
                loop
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                aria-label={`Video de ${product.name}`}
              />
            ) : (
              <img src={product.media[0].url} alt={product.name} loading="lazy" decoding="async" onError={handleImgError} />
            )}
            {product.media.length > 1 && (
              <span
                style={{
                  position: "absolute",
                  bottom: 10,
                  right: 10,
                  background: "rgba(15,7,3,.72)",
                  backdropFilter: "blur(6px)",
                  border: "1px solid rgba(224,122,92,.28)",
                  color: "var(--text)",
                  borderRadius: 20,
                  padding: "3px 10px",
                  fontSize: 11,
                  fontFamily: "'DM Mono',monospace",
                }}
              >
                +{product.media.length - 1}
              </span>
            )}
          </>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(224,122,92,.4)",
              flexDirection: "column",
              gap: 8,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, opacity: 0.55 }}>sin imagen</span>
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,.28) 0%,transparent 55%)", pointerEvents: "none" }} />
      </div>

      <div style={{ padding: "20px 22px 24px", display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 17, fontWeight: 600, color: "var(--text)", lineHeight: 1.3, flex: 1 }}>
            {product.name}
          </h3>
          {product.price && <span className="price-tag">${product.price}</span>}
        </div>
        {product.description && (
          <p
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              lineHeight: 1.68,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {product.description}
          </p>
        )}
        {product.contact && (
          <div style={{ display: "flex", alignItems: "center", gap: 5, color: "rgba(224,122,92,.65)", fontSize: 11.5, fontFamily: "'DM Mono',monospace", marginTop: 2 }}>
            {product.contactType === "email" ? <MailI /> : <PhoneI />}
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.contact}</span>
          </div>
        )}
        {product.reviews?.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            <span className="card-stars" aria-label={`${avgRating(product.reviews).toFixed(1)} de 5 estrellas`}>
              {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className={i <= Math.round(avgRating(product.reviews)) ? "card-star-f" : "card-star-e"}>
                  ★
                </span>
              ))}
            </span>
            <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--text-dim)" }}>({product.reviews.length})</span>
          </div>
        )}
        <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid rgba(224,122,92,.12)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--accent)", fontFamily: "'DM Mono',monospace", letterSpacing: ".05em", opacity: 0.75 }}>ver detalle</span>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "linear-gradient(135deg,rgba(224,122,92,.18),rgba(122,12,12,.28))",
              border: "1px solid rgba(224,122,92,.22)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--accent)",
            }}
          >
            <ChevR s={14} />
          </div>
        </div>
      </div>
    </article>
  );
}
