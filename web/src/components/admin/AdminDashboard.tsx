'use client';

import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { AlertTriangle, RefreshCw } from 'lucide-react';

import { Kpi, Panel, SalesChart, StatusPill } from '@/components/admin/ui';
import { browserSupabase } from '@/lib/supabase-browser';
import { dateTimeAr, number, price } from '@/lib/format';
import { orderStatusLabels, type OrderStatus } from '@/lib/types';

interface Stats {
  ok: boolean;
  revenue: number;
  previous_revenue: number;
  orders: number;
  items_sold: number;
  customers: number;
  average_order: number;
  open_orders: number;
  lifetime_revenue: number;
  products: number;
  low_stock: { id: string; name: string; stock: number }[];
  by_status: Record<string, number>;
  daily: { day: string; revenue: number; orders: number }[];
  top_products: { name: string; quantity: number; revenue: number }[];
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: OrderStatus;
  created_at: string;
}

const RANGES = [
  { days: 7, label: 'آخر ٧ أيام' },
  { days: 30, label: 'آخر ٣٠ يوم' },
  { days: 90, label: 'آخر ٣ شهور' },
  { days: 365, label: 'آخر سنة' },
];

export function AdminDashboard() {
  const [days, setDays] = useState(30);

  const { data, isLoading, isValidating, mutate } = useSWR(
    ['admin-dashboard', days],
    async () => {
      const db = browserSupabase();
      const [statsResult, ordersResult] = await Promise.all([
        db.rpc('admin_stats', { p_days: days }),
        db
          .from('orders')
          .select('id, order_number, customer_name, total, status, created_at')
          .order('created_at', { ascending: false })
          .limit(8),
      ]);
      return {
        stats: statsResult.data as Stats | null,
        recent: (ordersResult.data as RecentOrder[]) ?? [],
      };
    },
    { revalidateOnFocus: false, keepPreviousData: true },
  );

  const stats = data?.stats ?? null;
  const recent = data?.recent ?? [];
  const loading = isLoading || isValidating;
  const load = () => void mutate();

  const growth =
    stats && stats.previous_revenue > 0
      ? ((stats.revenue - stats.previous_revenue) / stats.previous_revenue) * 100
      : null;

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">لوحة التحكم</h1>
          <p className="text-sm text-muted">ملخّص أداء المتجر</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="rounded-xl border border-line bg-surface px-3 py-2 text-sm font-bold outline-none focus:border-wine"
            aria-label="الفترة"
          >
            {RANGES.map((r) => (
              <option key={r.days} value={r.days}>
                {r.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={load}
            className="rounded-xl border border-line bg-surface p-2.5 text-wine hover:border-copper"
            aria-label="تحديث"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {loading && !stats ? (
        <div className="h-64 animate-pulse rounded-2xl bg-sand/40" />
      ) : !stats?.ok ? (
        <p className="rounded-2xl border border-bad/30 bg-bad/10 p-5 text-sm">
          مش قادرين نجيب الإحصائيات. اتأكد إن حسابك مضاف في جدول
          <code> admin_users</code>.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Kpi
              label="مبيعات الفترة"
              value={price(stats.revenue)}
              growth={growth}
              hint={`إجمالي كلّي ${price(stats.lifetime_revenue)}`}
            />
            <Kpi
              label="عدد الطلبات"
              value={number(stats.orders)}
              hint={`${stats.open_orders} طلب محتاج متابعة`}
            />
            <Kpi
              label="متوسط قيمة الطلب"
              value={price(stats.average_order)}
              hint={`${number(stats.items_sold)} قطعة مباعة`}
            />
            <Kpi
              label="عملاء الفترة"
              value={number(stats.customers)}
              hint={`${stats.products} منتج مفعّل`}
            />
          </div>

          <Panel title="منحنى المبيعات">
            <SalesChart
              points={stats.daily.map((d) => ({
                day: new Date(d.day).toLocaleDateString('ar-EG', {
                  day: 'numeric',
                  month: 'short',
                }),
                revenue: Number(d.revenue),
              }))}
            />
          </Panel>

          <div className="grid lg:grid-cols-2 gap-5">
            <Panel
              title="أحدث الطلبات"
              action={
                <Link href="/admin/orders" className="text-sm font-bold text-wine">
                  الكل ←
                </Link>
              }
            >
              {recent.length === 0 ? (
                <p className="py-6 text-center text-sm text-faint">
                  لسه مفيش طلبات
                </p>
              ) : (
                <ul className="divide-y divide-line">
                  {recent.map((o) => (
                    <li key={o.id}>
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="flex items-center gap-3 py-2.5 hover:opacity-70"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold truncate" dir="ltr">
                            {o.order_number}
                          </p>
                          <p className="text-[11px] text-faint truncate">
                            {o.customer_name} · {dateTimeAr(o.created_at)}
                          </p>
                        </div>
                        <b className="text-sm text-wine shrink-0">
                          {price(Number(o.total))}
                        </b>
                        <StatusPill
                          status={o.status}
                          label={orderStatusLabels[o.status] ?? o.status}
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="الأكثر مبيعاً">
              {stats.top_products.length === 0 ? (
                <p className="py-6 text-center text-sm text-faint">
                  مفيش مبيعات في الفترة دي
                </p>
              ) : (
                <ul className="space-y-3">
                  {stats.top_products.map((p, i) => {
                    const max = Number(stats.top_products[0].revenue) || 1;
                    return (
                      <li key={p.name}>
                        <div className="flex justify-between gap-2 text-sm">
                          <span className="truncate">
                            <b className="text-faint me-1">{i + 1}.</b>
                            {p.name}
                          </span>
                          <b className="shrink-0 text-wine">
                            {price(Number(p.revenue))}
                          </b>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-sand overflow-hidden">
                          <div
                            className="h-full bg-wine"
                            style={{
                              width: `${(Number(p.revenue) / max) * 100}%`,
                            }}
                          />
                        </div>
                        <p className="mt-0.5 text-[11px] text-faint">
                          {p.quantity} قطعة
                        </p>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Panel>
          </div>

          {stats.low_stock.length > 0 && (
            <Panel
              title="مخزون على وشك النفاد"
              action={
                <AlertTriangle size={18} className="text-warn" />
              }
            >
              <ul className="divide-y divide-line">
                {stats.low_stock.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 py-2.5">
                    <span className="flex-1 truncate text-sm">{p.name}</span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                        p.stock === 0
                          ? 'bg-bad/12 text-bad'
                          : 'bg-warn/12 text-warn'
                      }`}
                    >
                      {p.stock === 0 ? 'نفد' : `باقي ${p.stock}`}
                    </span>
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="text-xs font-bold text-wine shrink-0"
                    >
                      تعديل
                    </Link>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </>
      )}
    </div>
  );
}
