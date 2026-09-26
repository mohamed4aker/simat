'use client';

import { useI18n } from '@/i18n/I18nProvider';
import { productText } from '@/lib/localize';
import { Modal } from '@/components/ui/Modal';
import type { Product } from '@/lib/types';

/** هرم مكونات العطر: الافتتاحية، القلب، القاعدة. */
export function NotesModal({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const { lang, dict } = useI18n();
  const text = productText(product, lang);
  const rows = [
    [dict.product.topNotes, text.top],
    [dict.product.heartNotes, text.heart],
    [dict.product.baseNotes, text.base],
  ] as const;

  return (
    <Modal open={open} onClose={onClose} label={text.name} closeLabel={dict.common.close} className="max-w-lg">
      <div className="text-center mb-8">
        <span className="text-[11px] uppercase tracking-wider text-bordeaux font-serif font-bold">
          {dict.product.pyramidEyebrow}
        </span>
        <h3 className="text-2xl font-serif text-noir mt-1">{text.name}</h3>
      </div>
      <div className="space-y-5">
        {rows
          .filter(([, notes]) => notes.length > 0)
          .map(([label, notes]) => (
            <div key={label} className="border-b border-linen-border pb-3 last:border-0">
              <span className="text-[11px] uppercase tracking-wider text-bordeaux font-medium">{label}</span>
              <p className="text-sm text-noir mt-1 font-serif">{notes.join(lang === 'ar' ? '، ' : ', ')}</p>
            </div>
          ))}
      </div>
      <p className="mt-8 pt-4 border-t border-linen-border text-center text-[11px] text-stone-600">
        {dict.product.pyramidFooter}
      </p>
    </Modal>
  );
}
