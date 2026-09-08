'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { AddToCartButton } from '@/components/product/AddToCartButton';
import { price } from '@/lib/format';
import type { Product } from '@/lib/types';

export function ProductBuyBox({ product }: { product: Product }) {
  const max = product.stock > 0 ? product.stock : 1;
  const [qty, setQty] = useState(1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="inline-flex items-center rounded-xl border border-line bg-surface">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            aria-label="تقليل الكمية"
            className="grid place-items-center w-11 h-11 text-wine disabled:text-faint"
          >
            <Minus size={16} />
          </button>
          <span className="w-10 text-center font-extrabold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            disabled={qty >= max}
            aria-label="زيادة الكمية"
            className="grid place-items-center w-11 h-11 text-wine disabled:text-faint"
          >
            <Plus size={16} />
          </button>
        </div>
        <span className="text-sm text-muted">
          الإجمالي: <b className="text-wine">{price(product.price * qty)}</b>
        </span>
      </div>

      <AddToCartButton product={product} quantity={qty} />
    </div>
  );
}
