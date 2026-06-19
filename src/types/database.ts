/**
 * Tipos que describen el esquema de Supabase (tablas, columnas).
 *
 * En un proyecto real, estos tipos se generan automáticamente con:
 *   npx supabase gen types typescript --project-id TU_PROYECTO_ID > src/types/database.ts
 *
 * Aquí los escribimos a mano para que el proyecto compile sin
 * depender del CLI de Supabase, pero la estructura es la misma
 * que generaría ese comando. Cuando tengas el CLI conectado a tu
 * proyecto, puedes reemplazar este archivo con la versión generada.
 */

export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: number;
          owner_id: string;
          name: string;
          price: number | null;
          description: string | null;
          contact: string | null;
          contact_type: "email" | "phone" | null;
          media: MediaItemRow[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          owner_id: string;
          name: string;
          price?: number | null;
          description?: string | null;
          contact?: string | null;
          contact_type?: "email" | "phone" | null;
          media?: MediaItemRow[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          owner_id?: string;
          name?: string;
          price?: number | null;
          description?: string | null;
          contact?: string | null;
          contact_type?: "email" | "phone" | null;
          media?: MediaItemRow[];
          created_at?: string;
          updated_at?: string;
        };
      };
      reviews: {
        Row: {
          id: number;
          product_id: number;
          author: string;
          rating: number;
          comment: string;
          created_at: string;
        };
        Insert: {
          id?: number;
          product_id: number;
          author: string;
          rating: number;
          comment: string;
          created_at?: string;
        };
        Update: {
          id?: number;
          product_id?: number;
          author?: string;
          rating?: number;
          comment?: string;
          created_at?: string;
        };
      };
    };
    Views: {
      products_with_reviews: {
        Row: {
          id: number;
          owner_id: string;
          name: string;
          price: number | null;
          description: string | null;
          contact: string | null;
          contact_type: "email" | "phone" | null;
          media: MediaItemRow[];
          created_at: string;
          updated_at: string;
          reviews: ReviewRow[];
        };
      };
    };
  };
}

export interface MediaItemRow {
  url: string;
  type: string;
}

export interface ReviewRow {
  id: number;
  author: string;
  rating: number;
  comment: string;
  date: string;
}
