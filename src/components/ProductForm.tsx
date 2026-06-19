import { useEffect, useRef, useState } from "react";
import type React from "react";
import type { ContactType, MediaItem, Product, ProductFormData } from "../types";
import { Thumb } from "./Thumb";
import { ImgI, SpinnerI } from "./Icons";
import { uploadToCloudinary } from "../lib/uploadMedia";

interface ProductFormProps {
  initial: Product | null;
  onSave: (form: ProductFormData) => void;
  onCancel: () => void;
}

export function ProductForm({ initial, onSave, onCancel }: ProductFormProps) {
  const [name, setName] = useState(initial?.name || "");
  const [price, setPrice] = useState(initial?.price || "");
  const [desc, setDesc] = useState(initial?.description || "");
  const [contact, setContact] = useState(initial?.contact || "");
  const [contactType, setContactType] = useState<ContactType>(initial?.contactType || "email");
  const [media, setMedia] = useState<MediaItem[]>(initial?.media || []);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<number, number>>({});
  const fileRef = useRef<HTMLInputElement>(null);

  // Rastreamos qué URLs fueron creadas localmente con
  // URL.createObjectURL para poder revocarlas y evitar memory leaks
  // (el bug original nunca llamaba a URL.revokeObjectURL).
  const localUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Al desmontar el formulario, liberamos cualquier object URL que
    // haya quedado huérfano (ej. el usuario canceló antes de que
    // terminara de subir).
    return () => {
      localUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      localUrlsRef.current.clear();
    };
  }, []);

  const addFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setUploading(true);
    const startIndex = media.length;

    const previews: MediaItem[] = files.map((f) => {
      const objectUrl = URL.createObjectURL(f);
      localUrlsRef.current.add(objectUrl);
      return { url: objectUrl, type: f.type, uploading: true };
    });
    setMedia((prev) => [...prev, ...previews]);

    const uploaded: (MediaItem | null)[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const result = await uploadToCloudinary(files[i], (pct) => setProgress((p) => ({ ...p, [startIndex + i]: pct })));
        uploaded.push({ ...result, uploading: false });
      } catch {
        uploaded.push(null);
      }
    }

    setMedia((prev) => {
      const copy = [...prev];
      for (let i = 0; i < uploaded.length; i++) {
        const previewUrl = previews[i].url;
        if (uploaded[i]) {
          copy[startIndex + i] = uploaded[i]!;
        } else {
          copy.splice(startIndex + i, 1);
        }
        // El preview local ya no se necesita: lo reemplazamos por la
        // URL final de Cloudinary (o lo quitamos si falló), así que
        // podemos revocar la URL local liberando memoria.
        URL.revokeObjectURL(previewUrl);
        localUrlsRef.current.delete(previewUrl);
      }
      return copy;
    });

    setProgress({});
    setUploading(false);
  };

  const removeMedia = (i: number) => {
    const item = media[i];
    if (item.url.startsWith("blob:")) {
      URL.revokeObjectURL(item.url);
      localUrlsRef.current.delete(item.url);
    }
    setMedia((prev) => prev.filter((_, j) => j !== i));
  };

  const lbl: React.CSSProperties = {
    fontSize: 11,
    letterSpacing: "0.1em",
    color: "var(--text-muted)",
    fontFamily: "'DM Mono',monospace",
    textTransform: "uppercase",
    marginBottom: 6,
    display: "block",
  };
  const allOk = !media.some((m) => m.uploading);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <label style={lbl} htmlFor="pf-name">
          Nombre
        </label>
        <input id="pf-name" className="form-inp" value={name} onChange={(e) => setName(e.target.value)} placeholder="ej. Bolso artesanal" />
      </div>
      <div>
        <label style={lbl} htmlFor="pf-price">
          Precio
        </label>
        <input id="pf-price" className="form-inp" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="ej. 150.00" />
      </div>
      <div>
        <label style={lbl} htmlFor="pf-desc">
          Descripción
        </label>
        <textarea
          id="pf-desc"
          className="form-inp"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          placeholder="Describe tu producto…"
          rows={4}
          style={{ resize: "vertical", lineHeight: 1.7 }}
        />
      </div>
      <div>
        <label style={lbl}>Contacto</label>
        <div style={{ display: "flex", gap: 8 }}>
          <select
            value={contactType}
            onChange={(e) => setContactType(e.target.value as ContactType)}
            className="form-inp"
            style={{ width: "auto", paddingRight: 24, flexShrink: 0, cursor: "pointer" }}
            aria-label="Tipo de contacto"
          >
            <option value="email">Gmail</option>
            <option value="phone">Teléfono</option>
          </select>
          <input
            className="form-inp"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder={contactType === "email" ? "tu@email.com" : "+56 9 1234 5678"}
          />
        </div>
      </div>
      <div>
        <label style={lbl}>Imágenes &amp; Videos</label>
        <input ref={fileRef} type="file" multiple accept="image/*,video/*" onChange={addFiles} style={{ display: "none" }} aria-label="Seleccionar archivos" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "flex-start" }}>
          {media.map((m, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <Thumb file={m} onRemove={m.uploading ? null : () => removeMedia(i)} />
              {m.uploading && (
                <div className="upload-progress">
                  <div className="upload-progress-bar" style={{ width: `${progress[i] || 0}%` }} />
                </div>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            aria-label="Agregar imagen o video"
            className="add-media-btn"
            style={{ color: uploading ? "rgba(224,122,92,.35)" : "var(--accent)", cursor: uploading ? "not-allowed" : "pointer" }}
          >
            <ImgI />
            {uploading ? "subiendo" : "adjuntar"}
          </button>
        </div>
        {uploading && (
          <div style={{ marginTop: 8, fontSize: 11, color: "var(--accent)", fontFamily: "'DM Mono',monospace", display: "flex", alignItems: "center", gap: 6 }}>
            <SpinnerI size={12} />
            Subiendo a Cloudinary…
          </div>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
        <button type="button" onClick={onCancel} className="btn-secondary" style={{ flex: 1 }}>
          cancelar
        </button>
        <button
          type="button"
          onClick={() => {
            if (!name.trim() || !allOk) return;
            onSave({ name, price, description: desc, contact, contactType, media });
          }}
          disabled={!allOk || !name.trim()}
          className="btn-primary"
          style={{ flex: 2, opacity: allOk && name.trim() ? 1 : 0.5, cursor: allOk && name.trim() ? "pointer" : "not-allowed" }}
        >
          {initial ? "guardar cambios" : "agregar producto"}
        </button>
      </div>
    </div>
  );
}
