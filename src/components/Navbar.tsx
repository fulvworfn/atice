import { useEffect, useRef, useState } from "react";
import type React from "react";
import type { Page } from "../types";
import { LockI, SearchI, UnlockI, XI } from "./Icons";
import { STORE_NAME, STORE_INITIALS, cx } from "../lib/utils";

interface NavbarProps {
  page: Page;
  setPage: (page: Page) => void;
  isAdmin: boolean;
  onAdminClick: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const LINKS: { id: Page; label: string }[] = [
  { id: "productos", label: "Productos" },
  { id: "sobre", label: "Sobre mí" },
  { id: "contacto", label: "Contacto" },
];

export function Navbar({ page, setPage, isAdmin, onAdminClick, searchQuery, setSearchQuery }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 50);
    if (page !== "productos") setPage("productos");
  };
  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  useEffect(() => {
    if (!searchOpen) return;
    const fn = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) closeSearch();
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchOpen]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSearch();
        setMenuOpen(false);
      }
    };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = (id: Page) => {
    setPage(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const adminBtnStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: isAdmin ? "linear-gradient(135deg,#E07A5C,#7A0C0C)" : "none",
    border: isAdmin ? "none" : "1px solid rgba(224,122,92,.32)",
    borderRadius: 9,
    padding: "7px 14px",
    cursor: "pointer",
    color: isAdmin ? "#fff" : "rgba(248,237,228,.45)",
    fontFamily: "'DM Mono',monospace",
    fontSize: 12,
    boxShadow: isAdmin ? "0 2px 16px rgba(224,122,92,.38)" : "none",
    transition: "all .22s",
  };

  return (
    <>
      <nav className={cx("navbar", scrolled && "scrolled")} role="navigation" aria-label="Navegación principal">
        <div className="navbar-inner">
          <a className="nav-logo" onClick={() => go("productos")} aria-label={`Ir al inicio — ${STORE_NAME}`}>
            <div className="nav-logo-mark" aria-hidden="true">
              {STORE_INITIALS}
            </div>
            <span className="nav-logo-text">{STORE_NAME}</span>
          </a>

          <ul className="nav-links" role="list">
            {LINKS.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  className={cx("nav-link", page === l.id && "active")}
                  onClick={() => go(l.id)}
                  aria-current={page === l.id ? "page" : undefined}
                >
                  {l.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="nav-right-desktop" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div className="nav-search-wrap" ref={searchRef}>
              <div className={cx("nav-search-input-wrap", searchOpen && "open")}>
                <input
                  ref={inputRef}
                  className="nav-search-input"
                  type="search"
                  placeholder="buscar producto…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  aria-label="Buscar producto"
                />
              </div>
              <button
                type="button"
                className={cx("nav-search-btn", searchOpen && "active")}
                onClick={searchOpen ? closeSearch : openSearch}
                aria-label={searchOpen ? "Cerrar búsqueda" : "Abrir búsqueda"}
                title={searchOpen ? "Cerrar" : "Buscar producto"}
              >
                {searchOpen ? <XI s={15} /> : <SearchI />}
              </button>
            </div>

            <button
              type="button"
              onClick={onAdminClick}
              aria-label={isAdmin ? "Cerrar sesión de administrador" : "Acceder como administrador"}
              style={adminBtnStyle}
            >
              {isAdmin ? (
                <>
                  <UnlockI /> admin
                </>
              ) : (
                <>
                  <LockI /> admin
                </>
              )}
            </button>
          </div>

          <button
            type="button"
            className="nav-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Abrir menú"
            aria-expanded={menuOpen}
          >
            <span style={{ transform: menuOpen ? "rotate(45deg) translateY(6.5px)" : "none" }} />
            <span style={{ opacity: menuOpen ? 0 : 1, transform: menuOpen ? "scaleX(0)" : "none" }} />
            <span style={{ transform: menuOpen ? "rotate(-45deg) translateY(-6.5px)" : "none" }} />
          </button>
        </div>
      </nav>

      <div className={cx("nav-mobile", menuOpen && "open")} role="menu">
        <div style={{ padding: "6px 4px 10px", borderBottom: "1px solid rgba(224,122,92,.14)", marginBottom: 4 }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <span style={{ position: "absolute", left: 12, color: "var(--text-dim)", pointerEvents: "none" }}>
              <SearchI />
            </span>
            <input
              className="nav-search-input"
              type="search"
              style={{ width: "100%", paddingLeft: 38 }}
              placeholder="buscar producto…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (page !== "productos") setPage("productos");
              }}
              aria-label="Buscar producto"
            />
          </div>
        </div>
        {LINKS.map((l) => (
          <button key={l.id} type="button" className={cx("nav-link", page === l.id && "active")} onClick={() => go(l.id)} role="menuitem">
            {l.label}
          </button>
        ))}
        <div style={{ borderTop: "1px solid rgba(224,122,92,.18)", marginTop: 6, paddingTop: 10 }}>
          <button
            type="button"
            onClick={() => {
              onAdminClick();
              setMenuOpen(false);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              width: "100%",
              background: isAdmin ? "linear-gradient(135deg,#E07A5C,#7A0C0C)" : "none",
              border: isAdmin ? "none" : "1px solid rgba(224,122,92,.28)",
              borderRadius: 9,
              padding: "10px 14px",
              cursor: "pointer",
              color: isAdmin ? "#fff" : "rgba(248,237,228,.5)",
              fontFamily: "'DM Mono',monospace",
              fontSize: 12,
              boxShadow: isAdmin ? "0 2px 12px rgba(224,122,92,.38)" : "none",
            }}
          >
            {isAdmin ? (
              <>
                <UnlockI /> admin — cerrar sesión
              </>
            ) : (
              <>
                <LockI /> acceso administrador
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}
