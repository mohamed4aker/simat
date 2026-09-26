'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * نافذة منبثقة بخلفية معتمة: بتتقفل بـ Esc أو بالضغط برّه،
 * وبتمنع تمرير الصفحة وهي مفتوحة.
 */
export function Modal({
  open,
  onClose,
  label,
  children,
  className = 'max-w-xl',
  closeLabel,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
  closeLabel: string;
}) {
  const panel = useRef<HTMLDivElement>(null);
  useLockScroll(open);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    panel.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[70] flex items-center justify-center p-4 bg-noir/70 backdrop-blur-sm transition-opacity duration-300 ${
        open ? 'opacity-100' : 'opacity-0 pointer-events-none invisible'
      }`}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      aria-hidden={!open}
    >
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`relative w-full ${className} max-h-[90vh] overflow-y-auto bg-linen-light border border-linen-border shadow-2xl p-6 sm:p-8 outline-none transition-transform duration-300 ${
          open ? 'translate-y-0' : 'translate-y-3'
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 end-5 p-1 text-stone-400 hover:text-bordeaux"
          aria-label={closeLabel}
        >
          <X className="w-5 h-5" strokeWidth={1.3} />
        </button>
        {children}
      </div>
    </div>
  );
}

/** بيمنع تمرير الصفحة ورا النافذة المفتوحة. */
export function useLockScroll(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [locked]);
}
