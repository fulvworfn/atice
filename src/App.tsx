import { useState } from "react";
import type { Page, Product } from "./types";
import { useAuth } from "./hooks/useAuth";
import { useProducts } from "./hooks/useProducts";
import { Navbar } from "./components/Navbar";
import { DetailModal } from "./components/DetailModal";
import { ProductForm } from "./components/ProductForm";
import { AdminLogin } from "./components/AdminLogin";
import { XI } from "./components/Icons";
import { Productos } from "./pages/Productos";
import { SobreMi } from "./pages/SobreMi";
import { Contacto } from "./pages/Contacto";
import type { SortOrder } from "./types";

function errMsg(e: unknown): string {
  return e instanceof Error ? e.message : "Ocurrió un error inesperado.";
}

export default function App() {
  const [page, setPage] = useState<Page>("productos");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<SortOrder>("default");

  const [detail, setDetail] = useState<Product | null>(null);
  const [isForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const { user, isAdmin, login, logout } = useAuth();
  const {
    products,
    loading,
    error,
    saving,
    addProduct,
    editProduct,
    removeProduct,
    addReviewToProduct,
    removeReviewFromProduct,
  } = useProducts();

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4500);
  };

  const onAdminClick = () => {
    if (isAdmin) {
      logout();
    } else {
      setShowLogin(true);
    }
  };

  const handleSaveProduct = async (form: Parameters<typeof addProduct>[0]) => {
    try {
      if (editing) {
        await editProduct(editing.id, form);
      } else if (user) {
        await addProduct(form, user.id);
      }
      closeForm();
    } catch (e) {
      showToast(`No se pudo guardar el producto: ${errMsg(e)}`);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await removeProduct(id);
    } catch (e) {
      showToast(`No se pudo eliminar el producto: ${errMsg(e)}`);
    }
  };

  const handleAddReview = async (review: { author: string; rating: number; comment: string }) => {
    if (!detail) return;
    try {
      await addReviewToProduct(detail.id, review);
    } catch (e) {
      showToast(`No se pudo publicar la reseña: ${errMsg(e)}`);
      throw e; // re-lanzamos para que ReviewsSection muestre también su propio error inline
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!detail) return;
    try {
      await removeReviewFromProduct(detail.id, reviewId);
    } catch (e) {
      showToast(`No se pudo eliminar la reseña: ${errMsg(e)}`);
    }
  };

  return (
    <>
      <Navbar page={page} setPage={setPage} isAdmin={isAdmin} onAdminClick={onAdminClick} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      <div style={{ height: 64 }} />

      {page === "productos" && (
        <Productos
          products={products}
          loading={loading}
          error={error}
          saving={saving}
          isAdmin={isAdmin}
          searchQuery={searchQuery}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onProductClick={setDetail}
          onNewProduct={() => {
            setShowForm(true);
            setEditing(null);
          }}
        />
      )}

      {page === "sobre" && <SobreMi />}
      {page === "contacto" && <Contacto />}

      {detail && (
        <DetailModal
          product={detail}
          isAdmin={isAdmin}
          onClose={() => setDetail(null)}
          onEdit={(p) => {
            setDetail(null);
            setEditing(p);
            setShowForm(true);
          }}
          onDelete={(id) => {
            setDetail(null);
            handleDelete(id);
          }}
          onAddReview={handleAddReview}
          onDeleteReview={handleDeleteReview}
        />
      )}

      {isForm && (
        <div
          onClick={closeForm}
          style={{ position: "fixed", inset: 0, background: "rgba(8,3,1,.88)", backdropFilter: "blur(10px)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
          role="dialog"
          aria-modal="true"
          aria-label={editing ? "Editar producto" : "Nuevo producto"}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "linear-gradient(160deg,#2A0E04 0%,#1C0902 100%)", border: "1px solid rgba(224,122,92,.18)", borderRadius: 22, padding: "30px 30px 26px", width: "100%", maxWidth: 495, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 32px 90px rgba(0,0,0,.85), 0 0 0 1px rgba(224,122,92,.05) inset" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "var(--text)" }}>{editing ? "Editar producto" : "Nuevo producto"}</h2>
              <button type="button" onClick={closeForm} aria-label="Cerrar formulario" className="modal-close-icon-btn">
                <XI />
              </button>
            </div>
            <ProductForm initial={editing} onSave={handleSaveProduct} onCancel={closeForm} />
          </div>
        </div>
      )}

      {showLogin && (
        <AdminLogin
          onLogin={async (email, password) => {
            await login(email, password);
            setShowLogin(false);
          }}
          onCancel={() => setShowLogin(false)}
        />
      )}

      {toast && (
        <div
          role="alert"
          style={{
            position: "fixed",
            bottom: 22,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            maxWidth: "92vw",
            background: "linear-gradient(140deg,#3A1A0F,#2C1208)",
            border: "1px solid rgba(220,100,100,.4)",
            borderRadius: 12,
            padding: "12px 18px",
            color: "#F8EDE4",
            fontFamily: "'DM Mono',monospace",
            fontSize: 12.5,
            boxShadow: "0 12px 40px rgba(0,0,0,.5)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span>⚠ {toast}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Cerrar aviso"
            style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(248,237,228,.6)", flexShrink: 0, display: "flex" }}
          >
            <XI s={14} />
          </button>
        </div>
      )}
    </>
  );
}
