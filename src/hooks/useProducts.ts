import { useCallback, useEffect, useState } from "react";
import * as productsApi from "../lib/products";
import type { Product, ProductFormData } from "../types";

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  addProduct: (form: ProductFormData, ownerId: string) => Promise<void>;
  editProduct: (id: number, form: ProductFormData) => Promise<void>;
  removeProduct: (id: number) => Promise<void>;
  addReviewToProduct: (productId: number, review: { author: string; rating: number; comment: string }) => Promise<void>;
  removeReviewFromProduct: (productId: number, reviewId: number) => Promise<void>;
}

/**
 * Hook que encapsula el estado de productos + todas las mutaciones.
 * Cada función actualiza el estado local de forma optimista mínima
 * (solo después de que la operación contra Supabase confirma éxito,
 * para no mostrar datos que después podrían fallar por RLS).
 */
export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    productsApi
      .fetchProducts()
      .then((data) => {
        if (mounted) setProducts(data);
      })
      .catch((e: Error) => {
        if (mounted) setError(e.message);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const addProduct = useCallback(async (form: ProductFormData, ownerId: string) => {
    setSaving(true);
    try {
      const created = await productsApi.createProduct(form, ownerId);
      setProducts((prev) => [created, ...prev]);
    } finally {
      setSaving(false);
    }
  }, []);

  const editProduct = useCallback(async (id: number, form: ProductFormData) => {
    setSaving(true);
    try {
      const updated = await productsApi.updateProduct(id, form);
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...updated, reviews: p.reviews } : p)));
    } finally {
      setSaving(false);
    }
  }, []);

  const removeProduct = useCallback(async (id: number) => {
    setSaving(true);
    try {
      await productsApi.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } finally {
      setSaving(false);
    }
  }, []);

  const addReviewToProduct = useCallback(
    async (productId: number, review: { author: string; rating: number; comment: string }) => {
      const created = await productsApi.addReview(productId, review);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, reviews: [created, ...p.reviews] } : p))
      );
    },
    []
  );

  const removeReviewFromProduct = useCallback(async (productId: number, reviewId: number) => {
    await productsApi.deleteReview(reviewId);
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, reviews: p.reviews.filter((r) => r.id !== reviewId) } : p))
    );
  }, []);

  return {
    products,
    loading,
    error,
    saving,
    addProduct,
    editProduct,
    removeProduct,
    addReviewToProduct,
    removeReviewFromProduct,
  };
}
