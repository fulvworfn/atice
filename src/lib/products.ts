import { supabase } from "./supabaseClient";
import type { Product, ProductFormData, Review } from "../types";
import type { MediaItemRow } from "../types/database";

/**
 * Capa de acceso a datos para productos y reseñas.
 * Reemplaza por completo a fetchProducts()/saveProducts() de JSONBin.
 *
 * Diferencia clave de seguridad: antes, saveProducts() reescribía
 * TODO el bin con una sola PUT request usando una API key maestra.
 * Ahora cada operación (crear, editar, borrar) es una llamada
 * independiente y específica, autenticada con la sesión del usuario,
 * y el servidor de Postgres decide si se permite o no según las
 * políticas RLS — el cliente nunca tiene más permisos de los que
 * Supabase le otorga.
 */

function mapRowToProduct(row: {
  id: number;
  owner_id: string;
  name: string;
  price: number | null;
  description: string | null;
  contact: string | null;
  contact_type: "email" | "phone" | null;
  media: MediaItemRow[];
  created_at: string;
  reviews?: Review[];
}): Product {
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    price: row.price !== null ? String(row.price) : "",
    description: row.description ?? "",
    contact: row.contact ?? "",
    contactType: row.contact_type ?? "email",
    media: row.media ?? [],
    reviews: row.reviews ?? [],
    createdAt: row.created_at,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products_with_reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(mapRowToProduct);
}

export async function createProduct(form: ProductFormData, ownerId: string): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      owner_id: ownerId,
      name: form.name.trim(),
      price: form.price ? Number(form.price) : null,
      description: form.description.trim(),
      contact: form.contact.trim(),
      contact_type: form.contactType,
      media: form.media.map((m) => ({ url: m.url, type: m.type })),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRowToProduct({ ...data, reviews: [] });
}

export async function updateProduct(id: number, form: ProductFormData): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .update({
      name: form.name.trim(),
      price: form.price ? Number(form.price) : null,
      description: form.description.trim(),
      contact: form.contact.trim(),
      contact_type: form.contactType,
      media: form.media.map((m) => ({ url: m.url, type: m.type })),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRowToProduct({ ...data, reviews: [] });
}

export async function deleteProduct(id: number): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function addReview(
  productId: number,
  review: { author: string; rating: number; comment: string }
): Promise<Review> {
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      product_id: productId,
      author: review.author.trim(),
      rating: review.rating,
      comment: review.comment.trim(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return {
    id: data.id,
    author: data.author,
    rating: data.rating,
    comment: data.comment,
    date: data.created_at,
  };
}

export async function deleteReview(reviewId: number): Promise<void> {
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) throw new Error(error.message);
}
