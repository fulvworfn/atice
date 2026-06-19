import { useEffect, useRef, useState } from "react";
import type { SortOrder } from "../types";
import { ChevD, SortI } from "./Icons";
import { cx } from "../lib/utils";

interface SortDropdownProps {
  sortOrder: SortOrder;
  setSortOrder: (order: SortOrder) => void;
}

const OPTIONS: { id: SortOrder; label: string }[] = [
  { id: "default", label: "Más recientes" },
  { id: "oldest", label: "Más antiguos" },
  { id: "priceLow", label: "Precio: menor a mayor" },
  { id: "priceHigh", label: "Precio: mayor a menor" },
];

export function SortDropdown({ sortOrder, setSortOrder }: SortDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const current = OPTIONS.find((o) => o.id === sortOrder) || OPTIONS[0];

  return (
    <div className="sort-wrapper" ref={ref}>
      <button type="button" className={cx("sort-btn", open && "open")} onClick={() => setOpen(!open)} aria-label="Ordenar productos">
        <SortI />
        Ordenar: <span style={{ color: "var(--accent)" }}>{current.label}</span>
        <ChevD s={13} />
      </button>
      <div className={cx("sort-menu", open && "open")} role="listbox" aria-label="Opciones de orden">
        {OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            role="option"
            className={cx("sort-item", sortOrder === o.id && "active")}
            aria-selected={sortOrder === o.id}
            onClick={() => {
              setSortOrder(o.id);
              setOpen(false);
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
