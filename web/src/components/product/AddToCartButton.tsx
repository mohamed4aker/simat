'use client';

import { useState } from 'react';
import { Check, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/cart/CartProvider';
import { buttonStyles } from '@/components/ui';
import type { Product } from '@/lib/types';

export function AddToCartButton({
  product,
  compact = false,
  quantity = 1,
}: {
  product: Product;
  compact?: boolean;
  quantity?: number;
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const disabled = product.stock <= 0;

  function handleAdd() {
    if (disabled) return;
    add(product, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleAdd}
        disabled={disabled}
        aria-label={`أضف ${product.name} للعربة`}
        className={`shrink-0 grid place-items-center w-9 h-9 rounded-xl transition-colors ${
          disabled
            ? 'bg-sand text-faint cursor-not-allowed'
            : added
              ? 'bg-ok text-white'
              : 'bg-wine text-white hover:bg-wine-dark'
        }`}
      >
        {added ? <Check size={17} /> : <ShoppingBag size={17} />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      disabled={disabled}
      className={`${buttonStyles.primary} w-full ${added ? 'bg-ok hover:bg-ok' : ''}`}
    >
      {added ? <Check size={19} /> : <ShoppingBag size={19} />}
      {disabled ? 'نفد المخزون' : added ? 'اتضاف للعربة' : 'أضف للعربة'}
    </button>
  );
}
