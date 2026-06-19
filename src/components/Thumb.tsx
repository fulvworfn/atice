import type { MediaItem } from "../types";
import { isVideo } from "../lib/uploadMedia";
import { XI } from "./Icons";

interface ThumbProps {
  file: MediaItem;
  onRemove?: (() => void) | null;
}

export function Thumb({ file, onRemove }: ThumbProps) {
  return (
    <div style={{ position: "relative", width: 72, height: 72, borderRadius: 9, overflow: "hidden", background: "#1A0805", flexShrink: 0, border: "1px solid rgba(224,122,92,.15)" }}>
      {isVideo(file) ? (
        <video src={file.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted aria-label="Vista previa de video" />
      ) : (
        <img src={file.url} alt="Vista previa" loading="lazy" decoding="async" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Eliminar imagen"
          style={{
            position: "absolute",
            top: 3,
            right: 3,
            background: "rgba(194,74,42,.85)",
            border: "none",
            borderRadius: "50%",
            width: 20,
            height: 20,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            color: "#fff",
          }}
        >
          <XI s={9} />
        </button>
      )}
    </div>
  );
}
