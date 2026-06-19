import type { MediaItem } from "../types";

const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/upload`;

/**
 * Sube un archivo a Cloudinary usando un "unsigned upload preset".
 *
 * Nota de seguridad: el cloud name y el preset NO son secretos (se
 * ven en cualquier request de red, igual que antes), pero a
 * diferencia de una API key con permisos de borrado/admin, un
 * unsigned preset configurado correctamente en el dashboard de
 * Cloudinary solo permite SUBIR archivos nuevos con restricciones
 * (carpeta, tamaño máximo, formatos permitidos, etc.). No permite
 * borrar ni listar el resto de tu galería. Configúralo así:
 *   Cloudinary → Settings → Upload → Upload presets → modo "Unsigned"
 *   + restricciones de tamaño/formato/carpeta.
 */
export function uploadToCloudinary(
  file: File,
  onProgress: (percent: number) => void
): Promise<MediaItem> {
  if (!CLOUDINARY_CLOUD || !CLOUDINARY_PRESET) {
    return Promise.reject(
      new Error("Cloudinary no está configurado. Revisa VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en tu .env.")
    );
  }

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", CLOUDINARY_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", CLOUDINARY_URL);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        try {
          const d = JSON.parse(xhr.responseText);
          resolve({ url: d.secure_url, type: file.type });
        } catch {
          reject(new Error("Respuesta inesperada de Cloudinary."));
        }
      } else {
        reject(new Error(`Error al subir archivo (status ${xhr.status}).`));
      }
    };
    xhr.onerror = () => reject(new Error("Error de red al subir el archivo."));
    xhr.send(form);
  });
}

export const isVideo = (media: Pick<MediaItem, "url" | "type"> | undefined): boolean =>
  Boolean(media?.type?.startsWith("video") || /\.(mp4|webm|ogg|mov)$/i.test(media?.url ?? ""));
