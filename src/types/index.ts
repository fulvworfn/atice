/**
 * Tipos de dominio usados en toda la UI. Son la forma "limpia" que
 * usan los componentes, distinta de la forma cruda de las filas de
 * la base de datos (esa vive en src/types/database.ts).
 * Las funciones de src/lib/products.ts son las encargadas de
 * convertir entre ambas.
 */

export type ContactType = "email" | "phone";

export interface MediaItem {
  url: string;
  type: string;
  /** Solo se usa en el cliente mientras un archivo se está subiendo. */
  uploading?: boolean;
}

export interface Review {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: number;
  ownerId: string;
  name: string;
  price: string;
  description: string;
  contact: string;
  contactType: ContactType;
  media: MediaItem[];
  reviews: Review[];
  createdAt: string;
}

/** Datos del formulario antes de guardarse (sin id, ownerId, reviews, etc). */
export interface ProductFormData {
  name: string;
  price: string;
  description: string;
  contact: string;
  contactType: ContactType;
  media: MediaItem[];
}

export type SortOrder = "default" | "oldest" | "priceLow" | "priceHigh";

export type Page = "productos" | "sobre" | "contacto";
