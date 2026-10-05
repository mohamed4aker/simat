'use client';

import { useI18n } from '@/i18n/I18nProvider';
import { useBag } from './useBag';
import type { Product } from '@/lib/types';

/** «أضف الاتنين للسلة» — العطر الحالي + العطر المقترح (حجم 60 مل). */
export function AddBothButton({ product, partner }: { product: Product; partner: Product }) {
  const { dict } = useI18n();
  const bag = useBag();
  return (
    <button
      type="button"
      onClick={() => bag.add([product, partner])}
      className="shrink-0 px-3 py-2 border border-bordeaux text-bordeaux hover:bg-bordeaux hover:text-linen-light text-[10px] uppercase tracking-wider font-medium transition-colors"
    >
      {dict.product.addBoth}
    </button>
  );
}
