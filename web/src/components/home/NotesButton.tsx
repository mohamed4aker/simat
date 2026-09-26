'use client';

import { useState } from 'react';
import { NotesModal } from '@/components/product/NotesModal';
import type { Product } from '@/lib/types';

export function NotesButton({
  product,
  className,
  children,
}: {
  product: Product;
  className: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <NotesModal product={product} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
