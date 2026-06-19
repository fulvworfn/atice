import { useMemo } from "react";
import type React from "react";
import type { Product, SortOrder } from "../types";
import { ProductCard } from "../components/ProductCard";
import { SortDropdown } from "../components/SortDropdown";
import { SearchI, SpinnerI, PlusI, UnlockI } from "../components/Icons";

interface ProductosProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  saving: boolean;
  isAdmin: boolean;
  searchQuery: string;
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
  onProductClick: (product: Product) => void;
  onNewProduct: () => void;
}

export function Productos({
  products,
  loading,
  error,
  saving,
  isAdmin,
  searchQuery,
  sortOrder,
  setSortOrder,
  onProductClick,
  onNewProduct,
}: ProductosProps) {
  const sortedProducts = useMemo(() => {
    let copy = [...products];
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      copy = copy.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (sortOrder === "priceLow") return copy.sort((a, b) => parseFloat(a.price || "0") - parseFloat(b.price || "0"));
    if (sortOrder === "priceHigh") return copy.sort((a, b) => parseFloat(b.price || "0") - parseFloat(a.price || "0"));
    if (sortOrder === "oldest") return copy.sort((a, b) => a.id - b.id);
    return copy.sort((a, b) => b.id - a.id);
  }, [products, sortOrder, searchQuery]);

  const mono: React.CSSProperties = { fontFamily: "'DM Mono',monospace" };

  return (
    <div>
      <div className="hero-banner">
        <div className="ember" style={{ width: 6, height: 6, top: "30%", left: "8%", ["--dur" as string]: "5s", ["--del" as string]: "0s" }} />
        <div className="ember" style={{ width: 4, height: 4, top: "62%", left: "16%", ["--dur" as string]: "6.5s", ["--del" as string]: "1s" }} />
        <div className="ember" style={{ width: 5, height: 5, top: "22%", right: "11%", ["--dur" as string]: "4.5s", ["--del" as string]: ".7s" }} />
        <div className="ember" style={{ width: 3, height: 3, top: "72%", right: "22%", ["--dur" as string]: "7s", ["--del" as string]: "2s" }} />
        <div style={{ maxWidth: 1000, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div className="hero-label">catálogo</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontFamily: "'Bradley Hand ITC','Bradley Hand',cursive", fontSize: 40, fontWeight: 700, color: "var(--text)", lineHeight: 1.12, marginBottom: 12, textShadow: "0 2px 30px rgba(224,122,92,.22)" }}>
                Nuestros Productos
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ ...mono, fontSize: 11, color: "var(--text-muted)", background: "rgba(224,122,92,.09)", border: "1px solid rgba(224,122,92,.18)", borderRadius: 20, padding: "3px 12px" }}>
                  {products.length} {products.length === 1 ? "artículo" : "artículos"}
                </span>
                {searchQuery.trim() && (
                  <span className="search-badge">
                    <SearchI />
                    {sortedProducts.length} resultado{sortedProducts.length !== 1 ? "s" : ""} para «{searchQuery}»
                  </span>
                )}
              </div>
            </div>
            {isAdmin && (
              <button type="button" onClick={onNewProduct} className="new-product-btn" aria-label="Agregar nuevo producto">
                <PlusI /> nuevo producto
              </button>
            )}
          </div>
        </div>
      </div>

      {isAdmin && (
        <div style={{ maxWidth: 1000, margin: "16px auto 0", padding: "0 28px" }}>
          <div style={{ background: "rgba(58,26,15,.5)", border: "1px solid rgba(224,122,92,.22)", borderRadius: 12, padding: "10px 18px", display: "flex", alignItems: "center", gap: 8, ...mono, fontSize: 12, color: "var(--accent)" }}>
            <UnlockI /> Modo administrador activo.
            {saving && (
              <span style={{ marginLeft: "auto", opacity: 0.7, display: "flex", alignItems: "center", gap: 5 }}>
                <SpinnerI size={11} />
                Guardando…
              </span>
            )}
          </div>
        </div>
      )}

      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 28px 88px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "96px 20px", color: "var(--text-muted)", ...mono, fontSize: 13 }}>
            <div style={{ display: "block", margin: "0 auto 12px", color: "var(--accent)", width: 20 }}>
              <SpinnerI size={20} />
            </div>
            Cargando productos…
          </div>
        ) : error ? (
          <div style={{ maxWidth: 500, margin: "40px auto", background: "rgba(122,12,12,.2)", border: "1px solid rgba(220,100,100,.3)", borderRadius: 14, padding: "26px", ...mono, fontSize: 13, color: "rgba(220,130,130,.9)" }} role="alert">
            ⚠ {error}
          </div>
        ) : products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "96px 20px", color: "var(--text-muted)", fontStyle: "italic" }}>
            <div style={{ fontSize: 44, opacity: 0.18, marginBottom: 16, color: "var(--accent)" }}>◈</div>
            <div style={{ fontSize: 17, color: "var(--text-muted)" }}>Aún no hay productos.</div>
            {isAdmin && (
              <div style={{ fontSize: 13, marginTop: 8, ...mono, fontStyle: "normal", opacity: 0.6 }}>
                Presiona <strong>nuevo producto</strong> para comenzar.
              </div>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, flexWrap: "wrap", gap: 10 }}>
              <div style={{ ...mono, fontSize: 11, color: "var(--text-dim)" }}>
                {searchQuery.trim() ? `${sortedProducts.length} de ${products.length} artículos` : `${products.length} artículo${products.length !== 1 ? "s" : ""}`}
              </div>
              <SortDropdown sortOrder={sortOrder} setSortOrder={setSortOrder} />
            </div>

            <div className="section-divider" style={{ marginBottom: 28 }} />

            {sortedProducts.length === 0 && searchQuery.trim() ? (
              <div style={{ textAlign: "center", padding: "72px 20px" }}>
                <div style={{ fontSize: 36, opacity: 0.18, marginBottom: 14, color: "var(--accent)" }}>⌕</div>
                <div style={{ fontSize: 16, color: "var(--text-muted)", marginBottom: 8 }}>Sin resultados para «{searchQuery}»</div>
                <div style={{ ...mono, fontSize: 12, color: "var(--text-dim)" }}>Intenta con otro nombre</div>
              </div>
            ) : (
              <div className="products-grid">
                {sortedProducts.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} onClick={() => onProductClick(p)} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
