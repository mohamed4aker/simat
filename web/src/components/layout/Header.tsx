'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, Search, ShoppingBag, X, Package } from 'lucide-react';
import { SimatLogoBar } from '@/components/brand/SimatLogo';
import { useCart } from '@/components/cart/CartProvider';
import type { Category } from '@/lib/types';

const NAV = [
  { href: '/', label: 'الرئيسية' },
  { href: '/shop', label: 'المتجر' },
  { href: '/shop?offers=1', label: 'العروض' },
  { href: '/track', label: 'تتبّع طلبك' },
  { href: '/about', label: 'عن سِمة' },
];

export function Header({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const { count, ready } = useCart();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-ivory/95 backdrop-blur border-b border-line">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex h-16 items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden p-2 -mr-2 text-wine"
            aria-label="القائمة"
            aria-expanded={open}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>

          <Link href="/" aria-label="سِمة — الصفحة الرئيسية">
            <SimatLogoBar height={32} />
          </Link>

          <nav className="hidden md:flex items-center gap-1 mr-6">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                  pathname === item.href
                    ? 'text-wine bg-sand/50'
                    : 'text-charcoal hover:text-wine'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex-1" />

          <Link
            href="/shop"
            className="p-2 text-charcoal hover:text-wine transition-colors"
            aria-label="بحث"
          >
            <Search size={20} />
          </Link>

          <Link
            href="/cart"
            className="relative p-2 text-charcoal hover:text-wine transition-colors"
            aria-label="عربة التسوق"
          >
            <ShoppingBag size={20} />
            {ready && count > 0 && (
              <span className="absolute -top-0.5 -left-0.5 min-w-5 h-5 px-1 rounded-full bg-wine text-white text-[11px] font-bold grid place-items-center">
                {count}
              </span>
            )}
          </Link>
        </div>

        {/* شريط التصنيفات */}
        <div className="hidden md:flex items-center gap-1 pb-2 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/shop?category=${c.slug}`}
              className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold text-muted hover:text-wine hover:bg-sand/40 transition-colors"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* قائمة الموبايل */}
      {open && (
        <div className="md:hidden border-t border-line bg-surface">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex flex-col">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2.5 font-bold text-charcoal hover:text-wine"
              >
                {item.label}
              </Link>
            ))}
            <div className="h-px bg-line my-2" />
            <p className="text-xs text-faint mb-1">التصنيفات</p>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/shop?category=${c.slug}`}
                onClick={() => setOpen(false)}
                className="py-2 text-sm text-muted hover:text-wine"
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/track"
              onClick={() => setOpen(false)}
              className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-wine"
            >
              <Package size={16} /> تتبّع طلبك
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
