'use client';

import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

import { BottleArt } from '@/components/brand/BottleArt';
import { useCart } from '@/components/cart/CartProvider';
import { buttonStyles, Card } from '@/components/ui';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import { price } from '@/lib/format';

export function CartView() {
  const { lines, subtotal, setQuantity, remove, ready } = useCart();

  if (!ready) {
    return <div className="h-40 animate-pulse rounded-2xl bg-sand/40" />;
  }

  if (lines.length === 0) {
    return (
      <div className="py-16 text-center">
        <ShoppingBag size={56} className="mx-auto text-sand" />
        <h2 className="mt-5 text-lg font-bold">العربة فاضية</h2>
        <p className="mt-2 text-muted text-sm">
          ابدأ تتصفّح المتجر وضيف العطور اللي عجبتك.
        </p>
        <Link href="/shop" className={`${buttonStyles.primary} mt-6`}>
          تصفّح المتجر
        </Link>
      </div>
    );
  }

  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;

  return (
    <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
      <div className="space-y-3">
        {remaining > 0 && (
          <div className="rounded-xl bg-sand/50 border border-line px-4 py-3 text-sm">
            ضيف <b>{price(remaining)}</b> كمان وتحصل على شحن مجاني 🎁
          </div>
        )}

        {lines.map((line) => (
          <Card key={line.productId} className="p-3 flex gap-4">
            <Link
              href={`/product/${line.slug}`}
              className="shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-line"
            >
              {line.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={line.imageUrl}
                  alt={line.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <BottleArt seed={line.productId} className="w-full h-full" />
              )}
            </Link>

            <div className="flex-1 min-w-0">
              <Link
                href={`/product/${line.slug}`}
                className="font-bold hover:text-wine transition-colors line-clamp-1"
              >
                {line.name}
              </Link>
              <p className="text-xs text-faint mt-0.5">{line.sizeMl} مل</p>

              <div className="mt-3 flex items-center gap-3 flex-wrap">
                <div className="inline-flex items-center rounded-lg border border-line">
                  <button
                    type="button"
                    onClick={() => setQuantity(line.productId, line.quantity - 1)}
                    aria-label="تقليل"
                    className="grid place-items-center w-8 h-8 text-wine"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center text-sm font-bold">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(line.productId, line.quantity + 1)}
                    aria-label="زيادة"
                    className="grid place-items-center w-8 h-8 text-wine"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => remove(line.productId)}
                  className="inline-flex items-center gap-1 text-xs text-bad font-semibold"
                >
                  <Trash2 size={14} /> حذف
                </button>

                <span className="ms-auto font-extrabold text-wine">
                  {price(line.price * line.quantity)}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-5 lg:sticky lg:top-24">
        <h2 className="font-bold mb-4">ملخّص الطلب</h2>
        <div className="flex justify-between text-sm py-1.5">
          <span className="text-muted">المجموع الفرعي</span>
          <b>{price(subtotal)}</b>
        </div>
        <div className="flex justify-between text-sm py-1.5">
          <span className="text-muted">الشحن</span>
          <span className="text-faint text-xs">بيتحسب حسب المحافظة</span>
        </div>
        <div className="h-px bg-line my-3" />
        <div className="flex justify-between">
          <span className="font-bold">الإجمالي المبدئي</span>
          <b className="text-wine text-lg">{price(subtotal)}</b>
        </div>

        <Link href="/checkout" className={`${buttonStyles.primary} w-full mt-5`}>
          إتمام الطلب
        </Link>
        <Link
          href="/shop"
          className="block text-center text-sm text-muted hover:text-wine mt-3"
        >
          أكمل التسوّق
        </Link>
      </Card>
    </div>
  );
}
