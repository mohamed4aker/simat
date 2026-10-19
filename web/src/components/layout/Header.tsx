'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Menu, Search, ShoppingCart } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { to } from '@/lib/href';
import { Wordmark } from '@/components/brand/Wordmark';
import { useCart, useHydrated, useWishlist, uiStore } from '@/components/cart/CartProvider';
import { LanguageSwitch } from './LanguageSwitch';
import { MobileMenu } from './MobileMenu';
import { SearchModal } from './SearchModal';
import { WishlistModal } from './WishlistModal';
import { navLinks } from './nav-links';
import type { Product } from '@/lib/types';

/**
 * الهيدر: القائمة على جنب، اللوجو في النص، والأيقونات على الجنب التاني.
 * القائمة: الصفحة الرئيسية | تسوق | قصتنا | الأسئلة الشائعة | تواصل معنا
 */
export function Header({ products }: { products: Product[] }) {
  const { lang, dict } = useI18n();
  const pathname = usePathname();
  const { count } = useCart();
  const wishlist = useWishlist();
  const hydrated = useHydrated();
  const cartCount = hydrated ? count : 0;

  const isActive = (path: string) => {
    const href = to(lang, path);
    return path === '/' ? pathname === href : pathname.startsWith(href);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-linen-light/95 backdrop-blur-md border-b border-linen-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 md:h-24 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* القائمة (أو زرار القائمة في الموبايل) */}
          <div className="flex items-center h-full">
            <button
              type="button"
              onClick={() => uiStore.open('menu')}
              className="lg:hidden p-2 -ms-2 text-noir hover:text-bordeaux"
              aria-label={dict.nav.openMenu}
            >
              <Menu className="w-6 h-6" strokeWidth={1.3} />
            </button>
            <nav aria-label={dict.mobile.menu} className="hidden lg:block">
              <ul className="flex items-center gap-6 xl:gap-8 text-[13px] font-medium text-noir">
                {navLinks(dict.nav).map(([label, path]) => (
                  <li key={path}>
                    <Link
                      href={to(lang, path)}
                      aria-current={isActive(path) ? 'page' : undefined}
                      className={`relative py-2 transition-colors hover:text-bordeaux after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-bordeaux after:transition-transform after:duration-300 ${
                        isActive(path) ? 'text-bordeaux after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'
                      }`}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* اللوجو في النص */}
          <Link href={to(lang)} aria-label="SIMAT" className="justify-self-center">
            <Wordmark tagline={dict.nav.tagline} />
          </Link>

          {/* اللغة، البحث، المفضلة، السلة */}
          <div className="flex items-center justify-end gap-3 sm:gap-5 text-noir">
            <div className="hidden sm:block border-e border-linen-border pe-4">
              <LanguageSwitch />
            </div>
            <button
              type="button"
              onClick={() => uiStore.open('search')}
              className="p-1 hover:text-bordeaux transition-colors"
              aria-label={dict.nav.search}
            >
              <Search className="w-5 h-5" strokeWidth={1.4} />
            </button>
            <button
              type="button"
              onClick={() => uiStore.open('wishlist')}
              className="relative p-1 hover:text-bordeaux transition-colors hidden sm:block"
              aria-label={dict.nav.wishlist}
            >
              <Heart className="w-5 h-5" strokeWidth={1.4} />
              {hydrated && wishlist.length > 0 && (
                <span className="latin absolute -top-1 -end-1 bg-gold-dark text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>
            {/* السلة: أيقونة واضحة بلون الهوية وعليها عدد المنتجات */}
            <button
              type="button"
              onClick={() => uiStore.open('cart')}
              className="relative w-11 h-11 rounded-full bg-bordeaux text-linen-light hover:bg-bordeaux-light transition-colors flex items-center justify-center shadow-md"
              aria-label={`${dict.nav.cart} (${cartCount})`}
            >
              <ShoppingCart className="w-5 h-5" strokeWidth={1.7} />
              {cartCount > 0 && (
                <span className="latin absolute -top-1 -end-1 bg-gold text-noir text-[11px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center ring-2 ring-linen-light">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <MobileMenu />
      <SearchModal products={products} />
      <WishlistModal products={products} />
    </>
  );
}
