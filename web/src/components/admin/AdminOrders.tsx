'use client';

import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { Search, MapPin, Phone } from 'lucide-react';

import { StatusPill, adminInput } from '@/components/admin/ui';
import { browserSupabase } from '@/lib/supabase-browser';
import { dateTimeAr, price } from '@/lib/format';
import { orderStatusLabels, type OrderStatus } from '@/lib/types';

interface Row {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  governorate: string;
  city: string;
  total: number;
  status: OrderStatus;
  payment_method: string;
  created_at: string;
}

const STATUSES: (OrderStatus | 'all')[] = [
  'all', 'pending', 'confirmed', 'preparing',
  'shipped', 'delivered', 'cancelled', 'returned',
];

export function AdminOrders() {
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const [query, setQuery] = useState('');

  const { data, isLoading } = useSWR(
    ['admin-orders', status],
    async () => {
      let request = browserSupabase()
        .from('orders')
        .select(
          'id, order_number, customer_name, customer_phone, governorate, city, total, status, payment_method, created_at',
        )
        .order('created_at', { ascending: false })
        .limit(200);

      if (status !== 'all') request = request.eq('status', status);

      const { data: list } = await request;
      return (list as Row[]) ?? [];
    },
    { revalidateOnFocus: false, keepPreviousData: true },
  );

  const rows = data ?? [];
  const loading = isLoading;

  const filtered = query.trim()
    ? rows.filter(
        (r) =>
          r.order_number.includes(query.trim()) ||
          r.customer_name.includes(query.trim()) ||
          r.customer_phone.includes(query.trim()),
      )
    : rows;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-extrabold">الطلبات</h1>
        <p className="text-sm text-muted">{rows.length} طلب</p>
      </header>

      <div className="relative">
        <Search
          size={17}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-faint"
        />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث برقم الطلب أو اسم/موبايل العميل"
          className={`${adminInput} pr-10`}
          aria-label="بحث"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatus(s)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold border transition-colors ${
              status === s
                ? 'bg-wine text-white border-wine'
                : 'bg-surface border-line hover:border-copper'
            }`}
          >
            {s === 'all' ? 'الكل' : orderStatusLabels[s]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-sand/40" />
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface py-16 text-center text-sm text-faint">
          مفيش طلبات هنا
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((row) => (
            <li key={row.id}>
              <Link
                href={`/admin/orders/${row.id}`}
                className="block rounded-2xl border border-line bg-surface p-4 hover:border-copper transition-colors"
              >
                <div className="flex items-center justify-between gap-3">
                  <b className="text-sm" dir="ltr">{row.order_number}</b>
                  <StatusPill
                    status={row.status}
                    label={orderStatusLabels[row.status] ?? row.status}
                  />
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Phone size={13} className="text-faint" />
                    {row.customer_name} · <span dir="ltr">{row.customer_phone}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={13} className="text-faint" />
                    {row.governorate} — {row.city}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 border-t border-line pt-3">
                  <b className="text-wine">{price(Number(row.total))}</b>
                  <span className="text-[11px] text-faint">
                    {dateTimeAr(row.created_at)}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
