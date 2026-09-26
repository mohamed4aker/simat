'use client';

import Link from 'next/link';
import { Heart, Menu, Search, ShoppingBag } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { to } from '@/lib/href';
import { Wordmark } from '@/components/brand/Wordmark';
import { useCart, useHydrated, useWishlist, uiStore } from '@/components/cart/CartProvider';
import { MegaNav } from './MegaNav';
import { LanguageSwitch } from './LanguageSwitch';
import { MobileMenu } from './MobileMenu';
import { SearchModal } from './SearchModal';
import { WishlistModal } from './WishlistModal';
import type { Product } from '@/lib/types';

export function Header({ products }: { products: Product[] }) {
  const { lang, dict } = useI18n();
  const { count } = useCart();
  const wishlist = useWishlist();
  const hydrated = useHydrated();
  const featured =
    products.find((p) => p.slug === 'simat-bordeaux') ??
    products.find((p) => p.isFeatured) ??
    null;

  return (
    <>
      <header className="sticky top-0 z-40 bg-linen-light/95 backdrop-blur-md border-b border-linen-border">
        <div className="relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 md:h-24 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
            {/* القوائم (أو زرار القائمة في الموبايل) */}
            <div className="flex items-center h-full">
              <button
                type="button"
                onClick={() => uiStore.open('menu')}
                className="lg:hidden p-2 -ms-2 text-noir hover:text-bordeaux"
                aria-label={dict.nav.openMenu}
              >
                <Menu className="w-6 h-6" strokeWidth={1.3} />
              </button>
              <MegaNav featured={featured} />
            </div>

            {/* الشعار في النص */}
            <Link href={to(lang)} aria-label="SIMAT" className="justify-self-center">
              <Wordmark tagline={dict.nav.tagline} />
            </Link>

            {/* اللغة، البحث، المفضلة، السلة */}
            <div className="flex items-center justify-end gap-4 sm:gap-6 text-noir">
              <div className="hidden sm:block border-e border-linen-border pe-4">
                <LanguageSwitch />
              </div>
              <button
                type="button"
                onClick={() => uiStore.open('search')}
                className="p-1 hover:text-bordeaux transition-colors"
                aria-label={dict.nav.search}
              >
                <Search className="w-5 h-5" strokeWidth={1.3} />
              </button>
              <button
                type="button"
                onClick={() => uiStore.open('wishlist')}
                className="relative p-1 hover:text-bordeaux transition-colors hidden sm:block"
                aria-label={dict.nav.wishlist}
              >
                <Heart className="w-5 h-5" strokeWidth={1.3} />
                {hydrated && wishlist.length > 0 && (
                  <span className="latin absolute -top-1 -end-1 bg-bordeaux text-linen-light text-[9px] w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => uiStore.open('cart')}
                className="relative p-1 hover:text-bordeaux transition-colors flex items-center"
                aria-label={dict.nav.bag}
              >
                <ShoppingBag className="w-5 h-5" strokeWidth={1.3} />
                <span className="latin ms-1 bg-bordeaux text-linen-light text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center font-medium">
                  {hydrated ? count : 0}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <MobileMenu />
      <SearchModal products={products} />
      <WishlistModal products={products} />
    </>
  );
}
