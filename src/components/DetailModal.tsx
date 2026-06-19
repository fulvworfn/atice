import { useEffect, useState } from "react";
import type React from "react";
import type { Product } from "../types";
import { Slider } from "./Slider";
import { ZoomModal } from "./ZoomModal";
import { ReviewsSection } from "./ReviewsSection";
import { EditI, MailI, PhoneI, TrashI } from "./Icons";

interface DetailModalProps {
  product: Product;
  isAdmin: boolean;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: (id: number) => void;
  onAddReview: (review: { author: string; rating: number; comment: string }) => Promise<void>;
  onDeleteReview: (reviewId: number) => Promise<void>;
}

export function DetailModal({ product, isAdmin, onClose, onEdit, onDelete, onAddReview, onDeleteReview }: DetailModalProps) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState<number | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => requestAnimationFrame(() => setOpen(true)));
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    setOpen(false);
    setTimeout(onClose, 420);
  };

  const href = product.contactType === "email" ? `mailto:${product.contact}` : `tel:${product.contact}`;

  const actionBtn = (label: string, icon: React.ReactNode, color: string, fn: () => void) => (
    <button
      key={label}
      type="button"
      onClick={fn}
      className="detail-action-btn"
      style={{ color }}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <>
      <div className={`card-overlay${open ? " open" : ""}`} onClick={close} role="dialog" aria-modal="true" aria-label="Detalle del producto">
        <div className={`card-expanded${open ? " open" : ""}`} onClick={(e) => e.stopPropagation()}>
          {product.media?.length > 0 && (
            <div style={{ borderRadius: "22px 22px 0 0", overflow: "hidden" }}>
              <Slider media={product.media} onZoom={setZoom} />
            </div>
          )}
          <div style={{ padding: "30px 32px 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 18 }}>
              <h2 style={{ fontFamily: "'Bradley Hand ITC','Bradley Hand',cursive", fontSize: 28, fontWeight: 700, color: "var(--text)", lineHeight: 1.25 }}>
                {product.name}
              </h2>
              {product.price && <span className="price-tag" style={{ fontSize: 18, padding: "5px 15px" }}>${product.price}</span>}
            </div>

            <div style={{ height: 1, background: "linear-gradient(90deg,rgba(224,122,92,.4),transparent)", marginBottom: 22 }} />

            {product.description && (
              <p style={{ fontSize: 15.5, color: "var(--text-muted)", lineHeight: 1.9, marginBottom: 26 }}>{product.description}</p>
            )}

            {product.contact && (
              <a href={href} onClick={(e) => e.stopPropagation()} className="contact-cta">
                {product.contactType === "email" ? <MailI /> : <PhoneI />}
                {product.contactType === "email" ? "Enviar mensaje" : "Llamar ahora"}
                <span style={{ opacity: 0.6, fontSize: 11 }}>— {product.contact}</span>
              </a>
            )}

            <ReviewsSection product={product} isAdmin={isAdmin} onAddReview={onAddReview} onDeleteReview={onDeleteReview} />

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", borderTop: "1px solid rgba(224,122,92,.12)", paddingTop: 20, marginTop: 28 }}>
              {isAdmin &&
                actionBtn("editar", <EditI />, "var(--text-muted)", () => {
                  close();
                  setTimeout(() => onEdit(product), 420);
                })}
              {isAdmin &&
                actionBtn("eliminar", <TrashI />, "rgba(220,100,100,.8)", () => {
                  close();
                  setTimeout(() => onDelete(product.id), 420);
                })}
              <button type="button" onClick={close} className="detail-close-btn">
                cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
      {zoom !== null && <ZoomModal media={product.media} startIdx={zoom} onClose={() => setZoom(null)} />}
    </>
  );
}
