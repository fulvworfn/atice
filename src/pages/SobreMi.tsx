import { STORE_NAME } from "../lib/utils";

const CARDS = [
  {
    tag: "¿Qué es esto?",
    txt: "Este sitio es un proyecto personal donde publico artículos propios que están en venta. Cosas que ya no uso y que pueden servir a alguien más.",
  },
  {
    tag: "¿Cómo comprar?",
    txt: "Revisa los productos en el catálogo y contáctame directamente por Instagram, email o teléfono. Coordinamos todo por ahí.",
  },
];

export function SobreMi() {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "64px 28px 88px" }}>
      <div className="hero-label">sobre mí</div>
      <h2 style={{ fontFamily: "'Bradley Hand ITC','Bradley Hand',cursive", fontSize: 38, fontWeight: 700, color: "var(--text)", marginBottom: 10, lineHeight: 1.15, textShadow: "0 2px 24px rgba(224,122,92,.18)" }}>
        Hola, soy Cristóbal
      </h2>
      <p style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "'Lora',serif", marginBottom: 10, lineHeight: 1.7, fontStyle: "italic" }}>
        creador de {STORE_NAME}
      </p>
      <div style={{ height: 2, width: 48, background: "linear-gradient(90deg,var(--accent),var(--accent2))", borderRadius: 2, marginBottom: 32 }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {CARDS.map((c) => (
          <div key={c.tag} style={{ padding: "22px 24px", background: "linear-gradient(140deg,var(--card-bg2),var(--card-bg))", borderRadius: 16, border: "1px solid rgba(224,122,92,.14)", boxShadow: "0 4px 24px rgba(0,0,0,.3)" }}>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".14em", marginBottom: 10 }}>{c.tag}</div>
            <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.88 }}>{c.txt}</p>
          </div>
        ))}
        <div style={{ padding: "16px 22px", background: "rgba(224,122,92,.07)", borderRadius: 14, border: "1px solid rgba(224,122,92,.13)", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 20, opacity: 0.8 }} aria-hidden="true">
            📦
          </span>
          <p style={{ fontSize: 13, color: "var(--text-dim)", fontFamily: "'DM Mono',monospace", lineHeight: 1.75 }}>
            El sitio puede ir cambiando con el tiempo — esto es solo el comienzo.
          </p>
        </div>
      </div>
    </div>
  );
}
