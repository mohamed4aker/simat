'use client';

import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { ArrowRight, Phone, MessageCircle } from 'lucide-react';

import { StatusPill } from '@/components/admin/ui';
import { browserSupabase } from '@/lib/supabase-browser';
import { dateTimeAr, price } from '@/lib/format';
import {
  orderStatusLabels, paymentLabels,
  type OrderStatus, type PaymentMethod,
} from '@/lib/types';

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  governorate: string;
  city: string;
  street: string;
  building: string;
  address_notes: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  payment_method: PaymentMethod;
  status: OrderStatus;
  notes: string;
  created_at: string;
}

interface ItemRow {
  id: string;
  name: string;
  unit_price: number;
  size_ml: number;
  quantity: number;
}

interface EventRow {
  id: string;
  status: OrderStatus;
  note: string;
  created_at: string;
}

const FLOW: OrderStatus[] = [
  'pending', 'confirmed', 'preparing', 'shipped',
  'delivered', 'cancelled', 'returned',
];

export function AdminOrderDetail({ orderId }: { orderId: string }) {
  const [saving, setSaving] = useState(false);

  const { data, isLoading, mutate } = useSWR(
    ['admin-order', orderId],
    async () => {
      const db = browserSupabase();
      const [o, i, e] = await Promise.all([
        db.from('orders').select('*').eq('id', orderId).maybeSingle(),
        db.from('order_items').select('*').eq('order_id', orderId),
        db
          .from('order_events')
          .select('*')
          .eq('order_id', orderId)
          .order('created_at', { ascending: false }),
      ]);
      return {
        order: (o.data as OrderRow) ?? null,
        items: (i.data as ItemRow[]) ?? [],
        events: (e.data as EventRow[]) ?? [],
      };
    },
    { revalidateOnFocus: false },
  );

  const order = data?.order ?? null;
  const items = data?.items ?? [];
  const events = data?.events ?? [];
  const loading = isLoading;

  async function setStatus(status: OrderStatus) {
    setSaving(true);
    const { data } = await browserSupabase().rpc('admin_set_order_status', {
      p_order_id: orderId,
      p_status: status,
      p_note: 'تحديث من لوحة التحكم',
    });
    setSaving(false);
    const result = data as { ok?: boolean; error?: string } | null;
    if (!result?.ok) {
      alert(result?.error ?? 'مش قادرين نغيّر الحالة');
      return;
    }
    await mutate();
  }

  if (loading) {
    return <div className="h-96 animate-pulse rounded-2xl bg-sand/40" />;
  }

  if (!order) {
    return (
      <div className="py-20 text-center">
        <p className="font-bold">الطلب ده مش موجود</p>
        <Link href="/admin/orders" className="mt-4 inline-block text-wine font-bold">
          رجوع للطلبات
        </Link>
      </div>
    );
  }

  const waPhone = `2${order.customer_phone.replace(/^0/, '')}`;

  return (
    <div className="max-w-3xl space-y-5">
      <header className="flex items-center gap-3">
        <Link
          href="/admin/orders"
          className="rounded-lg p-2 text-muted hover:bg-sand/50"
          aria-label="رجوع"
        >
          <ArrowRight size={20} />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-extrabold" dir="ltr">
            {order.order_number}
          </h1>
          <p className="text-xs text-faint">{dateTimeAr(order.created_at)}</p>
        </div>
        <StatusPill
          status={order.status}
          label={orderStatusLabels[order.status] ?? order.status}
        />
      </header>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-bold mb-3">تغيير الحالة</h2>
        <div className="flex flex-wrap gap-2">
          {FLOW.map((s) => (
            <button
              key={s}
              type="button"
              disabled={saving || s === order.status}
              onClick={() => void setStatus(s)}
              className={`rounded-full px-3.5 py-2 text-xs font-bold border transition-colors disabled:opacity-40 ${
                s === order.status
                  ? 'bg-wine text-white border-wine'
                  : 'bg-surface border-line hover:border-copper'
              }`}
            >
              {orderStatusLabels[s]}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-bold mb-3">العميل والعنوان</h2>
        <p className="font-bold">{order.customer_name}</p>
        <p className="mt-1 text-sm text-muted" dir="ltr">{order.customer_phone}</p>
        {order.customer_email && (
          <p className="text-sm text-muted" dir="ltr">{order.customer_email}</p>
        )}
        <p className="mt-3 text-sm leading-7 text-muted">
          {order.governorate} — {order.city}، {order.street}
          {order.building && `، عقار ${order.building}`}
        </p>
        {order.address_notes && (
          <p className="text-xs text-faint">علامة مميزة: {order.address_notes}</p>
        )}
        {order.notes && (
          <p className="mt-3 rounded-xl bg-sand/40 px-3 py-2 text-sm">
            <b>ملاحظات العميل:</b> {order.notes}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <a
            href={`tel:${order.customer_phone}`}
            className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-bold hover:border-copper"
          >
            <Phone size={15} /> اتصال
          </a>
          <a
            href={`https://wa.me/${waPhone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-bold hover:border-copper"
          >
            <MessageCircle size={15} /> واتساب
          </a>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-bold mb-3">المنتجات</h2>
        <ul className="divide-y divide-line">
          {items.map((it) => (
            <li key={it.id} className="flex justify-between gap-3 py-2.5 text-sm">
              <span className="text-muted">
                {it.name}{' '}
                <span className="text-faint">
                  {it.size_ml} مل × {it.quantity}
                </span>
              </span>
              <b>{price(Number(it.unit_price) * it.quantity)}</b>
            </li>
          ))}
        </ul>

        <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
          <Row label="المجموع الفرعي" value={price(Number(order.subtotal))} />
          <Row
            label="الشحن"
            value={Number(order.shipping) === 0 ? 'مجاني' : price(Number(order.shipping))}
          />
          {Number(order.discount) > 0 && (
            <Row
              label={`الخصم${order.coupon_code ? ` (${order.coupon_code})` : ''}`}
              value={`- ${price(Number(order.discount))}`}
            />
          )}
          <Row label="طريقة الدفع" value={paymentLabels[order.payment_method]} />
          <div className="flex justify-between border-t border-line pt-3">
            <b>الإجمالي</b>
            <b className="text-wine text-lg">{price(Number(order.total))}</b>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5">
        <h2 className="font-bold mb-3">سجل الحالات</h2>
        <ul className="space-y-2.5">
          {events.map((e) => (
            <li key={e.id} className="flex items-center gap-3 text-sm">
              <StatusPill
                status={e.status}
                label={orderStatusLabels[e.status] ?? e.status}
              />
              <span className="text-muted truncate flex-1">{e.note}</span>
              <span className="text-[11px] text-faint shrink-0">
                {dateTimeAr(e.created_at)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted">{label}</span>
      <b>{value}</b>
    </div>
  );
}
