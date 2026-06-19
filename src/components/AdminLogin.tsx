import { useState } from "react";
import { LockI } from "./Icons";

interface AdminLoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onCancel: () => void;
}

export function AdminLogin({ onLogin, onCancel }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const tryLogin = async () => {
    if (!email.trim() || !password) {
      setErr("Completa email y contraseña.");
      return;
    }
    setErr("");
    setLoading(true);
    try {
      await onLogin(email.trim(), password);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={onCancel}
      style={{ position: "fixed", inset: 0, background: "rgba(8,3,1,.88)", backdropFilter: "blur(10px)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
      role="dialog"
      aria-modal="true"
      aria-label="Acceso administrador"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "linear-gradient(160deg,#2A0E04 0%,#1C0902 100%)",
          border: "1px solid rgba(224,122,92,.2)",
          borderRadius: 22,
          padding: "36px 32px",
          width: "100%",
          maxWidth: 370,
          boxShadow: "0 32px 90px rgba(0,0,0,.85), 0 0 50px rgba(224,122,92,.07), 0 0 0 1px rgba(224,122,92,.05) inset",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "linear-gradient(135deg,rgba(224,122,92,.2),rgba(122,12,12,.3))",
            border: "1px solid rgba(224,122,92,.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--accent)",
            marginBottom: 18,
          }}
        >
          <LockI />
        </div>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "var(--text)", marginBottom: 6 }}>Acceso administrador</h2>
        <p style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "'DM Mono',monospace", marginBottom: 24 }}>Solo el dueño puede publicar productos.</p>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && tryLogin()}
          placeholder="tu@email.com"
          aria-label="Email de administrador"
          autoComplete="username"
          className="form-inp"
          style={{ marginBottom: 12 }}
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && tryLogin()}
          placeholder="Contraseña"
          aria-label="Contraseña de administrador"
          autoComplete="current-password"
          className="form-inp"
          style={{ borderColor: err ? "rgba(220,80,80,.6)" : undefined, marginBottom: err ? 6 : 20 }}
        />

        {err && (
          <div style={{ fontSize: 12, color: "rgba(220,100,100,.9)", fontFamily: "'DM Mono',monospace", marginBottom: 14 }} role="alert">
            {err}
          </div>
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" onClick={onCancel} className="btn-secondary" style={{ flex: 1 }}>
            cancelar
          </button>
          <button type="button" onClick={tryLogin} disabled={loading} className="btn-primary" style={{ flex: 2 }}>
            {loading ? "entrando…" : "entrar"}
          </button>
        </div>
      </div>
    </div>
  );
}
