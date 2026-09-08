'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import Link from 'next/link';
import { AlertCircle, BadgePercent, Banknote, CreditCard, Smartphone, Wallet } from 'lucide-react';

import { useCart } from '@/components/cart/CartProvider';
import { buttonStyles, Card } from '@/components/ui';
import { checkCoupon, submitOrder } from '@/app/checkout/actions';
import { GOVERNORATES, shippingFor } from '@/lib/constants';
import { price } from '@/lib/format';
import type { PaymentMethod } from '@/lib/types';

const PAYMENTS: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: 'cod', label: 'الدفع عند الاستلام', icon: <Banknote size={18} /> },
  { value: 'instapay', label: 'إنستا باي', icon: <Smartphone size={18} /> },
  { value: 'wallet', label: 'محفظة إلكترونية', icon: <Wallet size={18} /> },
  { value: 'card', label: 'بطاقة ائتمانية', icon: <CreditCard size={18} /> },
];

const inputClass =
  'w-full rounded-xl border border-line bg-surface px-4 py-3 text-sm ' +
  'outline-none focus:border-wine transition-colors';

export function CheckoutForm() {
  const router = useRouter();
  const { lines, subtotal, clear, ready } = useCart();
  const [pending, startTransition] = useTransition();

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: '',
    governorate: GOVERNORATES[0],
    city: '',
    street: '',
    building: '',
    addressNotes: '',
    notes: '',
  });
  const [payment, setPayment] = useState<PaymentMethod>('cod');
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState<{ ok: boolean; discount?: number; error?: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const shipping = shippingFor(form.governorate, subtotal);
  const discount = coupon?.ok ? (coupon.discount ?? 0) : 0;
  const total = subtotal + shipping - discount;

  function applyCoupon() {
    startTransition(async () => {
      const result = await checkCoupon(couponCode, subtotal);
      setCoupon(result);
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await submitOrder({
        ...form,
        paymentMethod: payment,
        couponCode: coupon?.ok ? couponCode : '',
        items: lines.map((l) => ({
          productId: l.productId,
          quantity: l.quantity,
        })),
      });

      if (!result.ok) {
        setError(result.error ?? 'حصلت مشكلة، جرّب تاني');
        return;
      }

      try {
        sessionStorage.setItem(
          'simat.lastOrder',
          JSON.stringify({
            orderNumber: result.orderNumber,
            total: result.total,
            subtotal: result.subtotal,
            shipping: result.shipping,
            discount: result.discount,
            phone: form.phone,
            name: form.fullName,
            demo: result.demo ?? false,
          }),
        );
      } catch {
        // لو التخزين مقفول، صفحة الشكر هتعرض رقم الطلب من الرابط.
      }
      clear();
      router.push(`/order-received?number=${result.orderNumber}`);
    });
  }

  if (!ready) {
    return <div className="h-64 animate-pulse rounded-2xl bg-sand/40" />;
  }

  if (lines.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="font-bold">العربة فاضية</p>
        <Link href="/shop" className={`${buttonStyles.primary} mt-5`}>
          تصفّح المتجر
        </Link>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_330px] gap-8 items-start">
      <div className="space-y-6">
        <Card className="p-5">
          <h2 className="font-bold mb-4">١. بياناتك</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <input
              required value={form.fullName} onChange={set('fullName')}
              placeholder="الاسم بالكامل *" className={inputClass}
              aria-label="الاسم بالكامل"
            />
            <input
              required value={form.phone} onChange={set('phone')}
              placeholder="رقم الموبايل *  01012345678" className={inputClass}
              dir="ltr" inputMode="tel" aria-label="رقم الموبايل"
            />
            <input
              value={form.email} onChange={set('email')} type="email"
              placeholder="البريد الإلكتروني (اختياري)"
              className={`${inputClass} sm:col-span-2`} dir="ltr"
              aria-label="البريد الإلكتروني"
            />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-bold mb-4">٢. عنوان الشحن</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <select
              value={form.governorate} onChange={set('governorate')}
              className={inputClass} aria-label="المحافظة"
            >
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            <input
              required value={form.city} onChange={set('city')}
              placeholder="المنطقة / المدينة *" className={inputClass}
              aria-label="المنطقة"
            />
            <input
              required value={form.street} onChange={set('street')}
              placeholder="الشارع *" className={inputClass} aria-label="الشارع"
            />
            <input
              value={form.building} onChange={set('building')}
              placeholder="رقم العقار / الشقة" className={inputClass}
              aria-label="رقم العقار"
            />
            <input
              value={form.addressNotes} onChange={set('addressNotes')}
              placeholder="علامة مميزة (جنب صيدلية... — الدور الثالث)"
              className={`${inputClass} sm:col-span-2`}
              aria-label="علامة مميزة"
            />
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-bold mb-4">٣. طريقة الدفع</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {PAYMENTS.map((p) => (
              <button
                key={p.value} type="button" onClick={() => setPayment(p.value)}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  payment === p.value
                    ? 'border-wine bg-wine/5 text-wine'
                    : 'border-line bg-surface hover:border-copper'
                }`}
              >
                <span className="text-copper">{p.icon}</span>
                {p.label}
              </button>
            ))}
          </div>
          {payment !== 'cod' && (
            <p className="mt-3 text-xs text-muted leading-6">
              هنتواصل معاك على الموبايل بتفاصيل التحويل قبل الشحن.
            </p>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-bold mb-4">٤. ملاحظات (اختياري)</h2>
          <textarea
            value={form.notes} onChange={set('notes')} rows={3}
            placeholder="أي تعليمات خاصة بالتوصيل أو التغليف..."
            className={inputClass} aria-label="ملاحظات"
          />
        </Card>
      </div>

      <Card className="p-5 lg:sticky lg:top-24">
        <h2 className="font-bold mb-4">ملخّص الطلب</h2>

        <ul className="space-y-2 mb-4 max-h-52 overflow-auto">
          {lines.map((l) => (
            <li key={l.productId} className="flex justify-between gap-2 text-sm">
              <span className="text-muted truncate">
                {l.name} <span className="text-faint">×{l.quantity}</span>
              </span>
              <b className="shrink-0">{price(l.price * l.quantity)}</b>
            </li>
          ))}
        </ul>

        <div className="flex gap-2 mb-4">
          <input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="كود الخصم"
            className={`${inputClass} py-2.5`} dir="ltr"
            aria-label="كود الخصم"
          />
          <button
            type="button" onClick={applyCoupon} disabled={pending}
            className="shrink-0 rounded-xl border border-wine px-4 text-sm font-bold text-wine hover:bg-wine hover:text-white transition-colors"
          >
            تطبيق
          </button>
        </div>
        {coupon && (
          <p
            className={`mb-3 text-xs font-semibold flex items-center gap-1.5 ${
              coupon.ok ? 'text-ok' : 'text-bad'
            }`}
          >
            <BadgePercent size={14} />
            {coupon.ok
              ? `تم الخصم — وفّرت ${price(coupon.discount ?? 0)}`
              : coupon.error}
          </p>
        )}

        <div className="h-px bg-line my-3" />
        <Row label="المجموع الفرعي" value={price(subtotal)} />
        <Row
          label="الشحن"
          value={shipping === 0 ? 'مجاني' : price(shipping)}
          highlight={shipping === 0}
        />
        {discount > 0 && (
          <Row label="الخصم" value={`- ${price(discount)}`} highlight />
        )}
        <div className="h-px bg-line my-3" />
        <div className="flex justify-between items-center">
          <span className="font-bold">الإجمالي</span>
          <b className="text-wine text-xl">{price(total)}</b>
        </div>

        {error && (
          <p className="mt-4 flex items-start gap-2 rounded-xl bg-bad/10 px-3 py-2.5 text-xs text-bad">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            {error}
          </p>
        )}

        <button
          type="submit" disabled={pending}
          className={`${buttonStyles.primary} w-full mt-5`}
        >
          {pending ? 'بنسجّل الطلب...' : `تأكيد الطلب · ${price(total)}`}
        </button>
        <p className="mt-3 text-[11px] text-faint leading-5 text-center">
          بتأكيدك للطلب أنت موافق على شروط البيع وسياسة الاستبدال.
        </p>
      </Card>
    </form>
  );
}

function Row({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex justify-between text-sm py-1">
      <span className="text-muted">{label}</span>
      <b className={highlight ? 'text-ok' : ''}>{value}</b>
    </div>
  );
}
