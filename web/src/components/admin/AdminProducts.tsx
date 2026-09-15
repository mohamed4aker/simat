'use client';

import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { Plus, Search, Trash2, Eye, EyeOff } from 'lucide-react';

import { BottleArt } from '@/components/brand/BottleArt';
import { adminInput } from '@/components/admin/ui';
import { browserSupabase } from '@/lib/supabase-browser';
import { normalizeArabic, price } from '@/lib/format';

interface Row {
  id: string;
  slug: string;
  name: string;
  price: number;
  old_price: number | null;
  size_ml: number;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  image_url: string | null;
  sold_count: number;
}

type Tab = 'all' | 'active' | 'hidden' | 'low';

export function AdminProducts() {
  const [query, setQuery] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR(
    'admin-products',
    async () => {
      const { data: list } = await browserSupabase()
        .from('products')
        .select(
          'id, slug, name, price, old_price, size_ml, stock, is_active, is_featured, image_url, sold_count',
        )
        .order('created_at', { ascending: false });
      return (list as Row[]) ?? [];
    },
    { revalidateOnFocus: false },
  );

  const rows = data ?? [];
  const loading = isLoading;

  async function toggleActive(row: Row) {
    setBusyId(row.id);
    await browserSupabase()
      .from('products')
      .update({ is_active: !row.is_active })
      .eq('id', row.id);
    await mutate();
    setBusyId(null);
  }

  async function remove(row: Row) {
    if (!confirm(`هتحذف «${row.name}» نهائياً. متأكد؟`)) return;
    setBusyId(row.id);
    const { error } = await browserSupabase()
      .from('products')
      .delete()
      .eq('id', row.id);
    setBusyId(null);
    if (error) {
      alert(
        'مش قادرين نحذف المنتج ده — غالباً مرتبط بطلبات قديمة. '
        + 'اخفيه بدل ما تحذفه.',
      );
      return;
    }
    await mutate();
  }

  const filtered = rows.filter((r) => {
    if (tab === 'active' && !r.is_active) return false;
    if (tab === 'hidden' && r.is_active) return false;
    if (tab === 'low' && r.stock > 5) return false;
    if (query.trim()) {
      return normalizeArabic(r.name).includes(normalizeArabic(query));
    }
    return true;
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'الكل' },
    { key: 'active', label: 'ظاهر' },
    { key: 'hidden', label: 'مخفي' },
    { key: 'low', label: 'مخزون منخفض' },
  ];

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">المنتجات</h1>
          <p className="text-sm text-muted">{rows.length} منتج في المتجر</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 rounded-xl bg-wine px-5 py-2.5 font-bold text-white hover:bg-wine-dark"
        >
          <Plus size={18} /> منتج جديد
        </Link>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search
            size={17}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-faint"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث باسم المنتج"
            className={`${adminInput} pr-10`}
            aria-label="بحث"
          />
        </div>
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full px-3.5 py-2 text-xs font-bold border transition-colors ${
                tab === t.key
                  ? 'bg-wine text-white border-wine'
                  : 'bg-surface border-line hover:border-copper'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-64 animate-pulse rounded-2xl bg-sand/40" />
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-line bg-surface py-16 text-center text-sm text-faint">
          مفيش منتجات هنا
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((row) => (
            <li
              key={row.id}
              className={`flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 ${
                busyId === row.id ? 'opacity-50' : ''
              }`}
            >
              <Link
                href={`/admin/products/${row.id}`}
                className="shrink-0 w-14 h-14 overflow-hidden rounded-xl border border-line"
              >
                {row.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={row.image_url}
                    alt={row.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <BottleArt seed={row.id} className="w-full h-full" />
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/products/${row.id}`}
                  className="font-bold text-sm hover:text-wine truncate block"
                >
                  {row.name}
                </Link>
                <p className="text-[11px] text-faint">
                  {row.size_ml} مل · اتباع {row.sold_count} مرة
                  {!row.is_active && ' · مخفي'}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <b className="text-sm text-wine">{price(Number(row.price))}</b>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      row.stock === 0
                        ? 'bg-bad/12 text-bad'
                        : row.stock <= 5
                          ? 'bg-warn/12 text-warn'
                          : 'bg-ok/12 text-ok'
                    }`}
                  >
                    مخزون {row.stock}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => void toggleActive(row)}
                title={row.is_active ? 'إخفاء من المتجر' : 'إظهار في المتجر'}
                className="shrink-0 rounded-lg p-2 text-muted hover:bg-sand/50"
              >
                {row.is_active ? <Eye size={17} /> : <EyeOff size={17} />}
              </button>
              <button
                type="button"
                onClick={() => void remove(row)}
                title="حذف"
                className="shrink-0 rounded-lg p-2 text-bad hover:bg-bad/10"
              >
                <Trash2 size={17} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
