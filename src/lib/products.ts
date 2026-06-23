import { supabase } from "./supabaseClient";
import type { Product, ProductFormData, Review } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRow = Record<string, any>;

function mapRowToProduct(row: AnyRow): Product {
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
  return ((data ?? []) as AnyRow[]).map(mapRowToProduct);
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
    } as any)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRowToProduct({ ...(data as AnyRow), reviews: [] });
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
    } as any)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return mapRowToProduct({ ...(data as AnyRow), reviews: [] });
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
    } as any)
    .select()
    .single();

  if (error) throw new Error(error.message);
  const row = data as AnyRow;
  return {
    id: row.id,
    author: row.author,
    rating: row.rating,
    comment: row.comment,
    date: row.created_at,
  };
}

export async function deleteReview(reviewId: number): Promise<void> {
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId);
  if (error) throw new Error(error.message);
}