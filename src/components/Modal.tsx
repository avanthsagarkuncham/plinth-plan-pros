import { useEffect, type ReactNode } from "react";

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className="panel w-full max-w-md animate-rise" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-4 font-display text-2xl text-gold">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export const fieldCls = "w-full rounded-md border border-input bg-input/40 px-3 py-2 text-sm outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/30";
