import { useMemo, useState } from "react";
import type React from "react";
import type { Product } from "../types";
import { StarPicker, StarsDisplay } from "./StarRating";
import { TrashI, CheckI } from "./Icons";
import { avgRating, relativeDate } from "../lib/utils";

interface ReviewsSectionProps {
  product: Product;
  isAdmin: boolean;
  onAddReview: (review: { author: string; rating: number; comment: string }) => Promise<void>;
  onDeleteReview: (reviewId: number) => Promise<void>;
}

export function ReviewsSection({ product, isAdmin, onAddReview, onDeleteReview }: ReviewsSectionProps) {
  const reviews = useMemo(() => [...(product.reviews || [])].sort((a, b) => b.id - a.id), [product.reviews]);
  const avg = avgRating(reviews);

  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!author.trim()) {
      setErr("Escribe tu nombre.");
      return;
    }
    if (rating === 0) {
      setErr("Selecciona una calificación.");
      return;
    }
    if (!comment.trim()) {
      setErr("Escribe un comentario.");
      return;
    }
    setErr("");
    setSending(true);
    try {
      await onAddReview({ author: author.trim(), rating, comment: comment.trim() });
      setAuthor("");
      setRating(0);
      setComment("");
      setSent(true);
      setTimeout(() => setSent(false), 3000);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo publicar la reseña.");
    } finally {
      setSending(false);
    }
  };

  const lbl: React.CSSProperties = {
    fontSize: 10,
    letterSpacing: ".12em",
    color: "var(--text-muted)",
    fontFamily: "'DM Mono',monospace",
    textTransform: "uppercase",
    marginBottom: 6,
    display: "block",
  };

  return (
    <div style={{ marginTop: 32 }}>
      <div style={{ height: 1, background: "linear-gradient(90deg,rgba(224,122,92,.3),transparent)", marginBottom: 26 }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22, flexWrap: "wrap" }}>
        <div>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 600, color: "var(--text)", marginBottom: 6 }}>
            Reseñas
          </h3>
          {reviews.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 26, fontWeight: 500, color: "var(--accent)", lineHeight: 1 }}>
                {avg.toFixed(1)}
              </span>
              <div>
                <StarsDisplay rating={avg} size={15} />
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>
                  {reviews.length} reseña{reviews.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--text-dim)" }}>
              Sin reseñas aún — ¡sé el primero!
            </div>
          )}
        </div>
      </div>

      {reviews.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          {reviews.map((r) => (
            <div key={r.id} className="review-item">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,rgba(224,122,92,.28),rgba(122,12,12,.38))",
                      border: "1px solid rgba(224,122,92,.22)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'DM Mono',monospace",
                      fontSize: 12,
                      color: "var(--accent)",
                      flexShrink: 0,
                      textTransform: "uppercase",
                    }}
                  >
                    {r.author.charAt(0)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "'DM Mono',monospace",
                        fontSize: 12,
                        color: "var(--text)",
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {r.author}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <StarsDisplay rating={r.rating} size={11} />
                      <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--text-dim)" }}>
                        {relativeDate(r.date)}
                      </span>
                    </div>
                  </div>
                </div>
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => onDeleteReview(r.id)}
                    aria-label="Eliminar reseña"
                    className="review-delete-btn"
                  >
                    <TrashI />
                  </button>
                )}
              </div>
              <p style={{ fontSize: 13.5, color: "var(--text-muted)", lineHeight: 1.75, paddingLeft: 40, fontFamily: "'Lora',serif" }}>
                {r.comment}
              </p>
            </div>
          ))}
        </div>
      )}

      <div style={{ background: "rgba(15,7,3,.55)", border: "1px solid rgba(224,122,92,.14)", borderRadius: 14, padding: "20px 20px 22px" }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, color: "var(--text)", marginBottom: 16, fontStyle: "italic" }}>
          ¿Qué te pareció este producto?
        </div>

        <div style={{ marginBottom: 14 }}>
          <span style={lbl}>Tu calificación</span>
          <StarPicker value={rating} onChange={setRating} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={lbl} htmlFor="rv-author">
            Tu nombre
          </label>
          <input
            id="rv-author"
            className="form-inp"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="ej. María G."
          />
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={lbl} htmlFor="rv-comment">
            Comentario
          </label>
          <textarea
            id="rv-comment"
            className="review-textarea"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Cuéntanos tu experiencia con el producto…"
          />
        </div>

        {err && (
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "rgba(220,100,100,.9)", marginBottom: 10 }} role="alert">
            {err}
          </div>
        )}

        {sent && (
          <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "rgba(100,200,130,.9)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <CheckI />
            ¡Reseña publicada!
          </div>
        )}

        <button type="button" onClick={submit} disabled={sending} className="btn-primary" style={{ width: "100%" }}>
          {sending ? "Publicando…" : "Publicar reseña"}
        </button>
      </div>
    </div>
  );
}
