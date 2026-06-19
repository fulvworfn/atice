import type { Review } from "../types";

export const STORE_NAME = import.meta.env.VITE_STORE_NAME || "Mi Proyecto";
export const STORE_INITIALS = import.meta.env.VITE_STORE_INITIALS || "CC";

export function avgRating(reviews: Review[] | undefined): number {
  if (!reviews?.length) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

export function relativeDate(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const days = Math.floor((now.getTime() - then.getTime()) / 86_400_000);
  if (days <= 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  if (days < 30) return `hace ${Math.floor(days / 7)} sem.`;
  if (days < 365) return `hace ${Math.floor(days / 30)} mes.`;
  const years = Math.floor(days / 365);
  return `hace ${years} año${years > 1 ? "s" : ""}`;
}

/** Combina clases CSS condicionalmente, ignorando valores falsy. */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
