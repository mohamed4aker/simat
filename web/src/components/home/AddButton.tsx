'use client';

import { useBag } from '@/components/product/useBag';
import type { Product } from '@/lib/types';

/** زرار «أضف للسلة» صغير نقدر نحطه جوه أي قسم من السيرفر. */
export function AddButton({
  product,
  className,
  children,
}: {
  product: Product;
  className: string;
  children: React.ReactNode;
}) {
  const bag = useBag();
  return (
    <button type="button" onClick={() => bag.add(product)} className={className}>
      {children}
    </button>
  );
}
