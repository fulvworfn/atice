import { ChevR, InstaI, MailI, PhoneI } from "../components/Icons";

const CONTACTS = [
  { icon: <MailI />, label: "Email", val: "cristobal.cubillos.cadenas@gmail.com", href: "mailto:cristobal.cubillos.cadenas@gmail.com", desc: "Escríbeme directamente" },
  { icon: <PhoneI />, label: "Teléfono", val: "+56 9 7924 7399", href: "tel:+56979247399", desc: "Llama o escribe por WhatsApp" },
  { icon: <InstaI />, label: "Instagram", val: "@krlstubal", href: "https://instagram.com/krlstubal", desc: "Sígueme en Instagram" },
];

export function Contacto() {
  return (
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "64px 28px 88px" }}>
      <div className="hero-label">contacto</div>
      <h2 style={{ fontFamily: "'Bradley Hand ITC','Bradley Hand',cursive", fontSize: 36, fontWeight: 700, color: "var(--text)", marginBottom: 10, lineHeight: 1.2, textShadow: "0 2px 24px rgba(224,122,92,.18)" }}>
        ¿Tienes alguna pregunta?
      </h2>
      <p style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "'Lora',serif", marginBottom: 10, lineHeight: 1.72, fontStyle: "italic" }}>
        Puedes contactarme por cualquiera de estos medios. Respondo a la brevedad.
      </p>
      <div style={{ height: 2, width: 48, background: "linear-gradient(90deg,var(--accent),var(--accent2))", borderRadius: 2, marginBottom: 32 }} />

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {CONTACTS.map((c) => (
          <a
            key={c.label}
            href={c.href}
            target={c.label === "Instagram" ? "_blank" : undefined}
            rel="noopener noreferrer"
            aria-label={`${c.label}: ${c.val}`}
            className="contact-link"
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 13,
                background: "linear-gradient(135deg,rgba(224,122,92,.25),rgba(122,12,12,.35))",
                border: "1px solid rgba(224,122,92,.28)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent)",
                flexShrink: 0,
                boxShadow: "0 4px 18px rgba(224,122,92,.18)",
              }}
            >
              {c.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: "var(--text-dim)", textTransform: "uppercase", letterSpacing: ".13em", marginBottom: 3 }}>{c.label}</div>
              <div style={{ fontFamily: "'Lora',serif", fontSize: 15, color: "var(--text)", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.val}</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "var(--accent)", opacity: 0.7 }}>{c.desc}</div>
            </div>
            <div style={{ color: "var(--accent)", opacity: 0.35, flexShrink: 0 }}>
              <ChevR s={16} />
            </div>
          </a>
        ))}
      </div>

      <div style={{ marginTop: 34, padding: "18px 22px", background: "rgba(224,122,92,.06)", border: "1px solid rgba(224,122,92,.12)", borderRadius: 14 }}>
        <p style={{ fontSize: 12, color: "var(--text-dim)", fontFamily: "'DM Mono',monospace", lineHeight: 1.8, textAlign: "center" }}>
          Prefiero el contacto por Instagram o WhatsApp 🙌
        </p>
      </div>
    </div>
  );
}
