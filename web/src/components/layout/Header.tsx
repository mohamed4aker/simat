'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ChevronDown, Heart, Menu, Search, ShoppingCart } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { to } from '@/lib/href';
import { useCart, useHydrated, useWishlist, uiStore } from '@/components/cart/CartProvider';
import { LanguageSwitch } from './LanguageSwitch';
import { MobileMenu } from './MobileMenu';
import { SearchModal } from './SearchModal';
import { WishlistModal } from './WishlistModal';
import { navLinks, shopLinks } from './nav-links';
import { ProductImage } from '@/components/product/ProductImage';
import { displayName, subLine } from '@/lib/localize';
import type { Product } from '@/lib/types';

/**
 * الهيدر: القائمة على جنب، اللوجو في النص، والأيقونات على الجنب التاني.
 * القائمة: الصفحة الرئيسية | تسوق ▾ | اكتشف عطرك | قصتنا | الأسئلة الشائعة | تواصل معنا
 */
export function Header({ products }: { products: Product[] }) {
  const { lang, dict } = useI18n();
  const pathname = usePathname();
  const { count } = useCart();
  const wishlist = useWishlist();
  const hydrated = useHydrated();
  const cartCount = hydrated ? count : 0;
  const featured =
    [...products].filter((p) => p.isFeatured && p.kind === 'bottle').sort((a, b) => b.soldCount - a.soldCount)[0] ??
    null;
  const linkClass = (path: string) =>
    `relative py-2 transition-colors hover:text-bordeaux after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:bg-bordeaux after:transition-transform after:duration-300 ${
      isActive(path) ? 'text-bordeaux after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100'
    }`;

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
              className="xl:hidden p-2 -ms-2 text-noir hover:text-bordeaux"
              aria-label={dict.nav.openMenu}
            >
              <Menu className="w-6 h-6" strokeWidth={1.3} />
            </button>
            <nav aria-label={dict.mobile.menu} className="hidden xl:block">
              <ul className="flex items-center gap-6 2xl:gap-8 text-[13px] font-medium text-noir whitespace-nowrap">
                {navLinks(dict.nav).map(([label, path]) =>
                  path === '/shop' ? (
                    /* تسوق + القائمة المنسدلة (بتفتح بالماوس أو بالكيبورد) */
                    <li key={path} className="group/shop relative">
                      <Link
                        href={to(lang, path)}
                        aria-current={isActive(path) ? 'page' : undefined}
                        aria-haspopup="true"
                        className={`${linkClass(path)} inline-flex items-center gap-1`}
                      >
                        {label}
                        <ChevronDown className="w-3.5 h-3.5 transition-transform group-hover/shop:rotate-180" strokeWidth={1.6} />
                      </Link>
                      <div className="absolute start-0 top-full pt-5 invisible opacity-0 translate-y-1 group-hover/shop:visible group-hover/shop:opacity-100 group-hover/shop:translate-y-0 group-focus-within/shop:visible group-focus-within/shop:opacity-100 group-focus-within/shop:translate-y-0 transition-all duration-200 z-50">
                        <div className="w-[520px] bg-linen-light border border-linen-border shadow-2xl p-6 grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-[11px] tracking-wider uppercase text-bordeaux font-bold pb-2 mb-3 border-b border-linen-border">
                              {dict.nav.byCategory}
                            </p>
                            <ul className="space-y-3 text-[13px] font-normal">
                              {shopLinks(dict).map(([l, href]) => (
                                <li key={href}>
                                  <Link href={to(lang, href)} className="text-stone-700 hover:text-bordeaux transition-colors">
                                    {l}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                          {featured && (
                            <Link
                              href={to(lang, `/product/${featured.slug}`)}
                              className="group/feat block bg-linen border border-linen-border p-4 hover:border-bordeaux/40 transition-colors whitespace-normal"
                            >
                              <span className="block text-[10px] tracking-wider uppercase text-bordeaux font-bold">{dict.nav.signature}</span>
                              <span className="latin block mt-1 text-sm font-serif font-bold text-noir">
                                <bdi>{displayName(featured, lang, dict.concentration)}</bdi>
                              </span>
                              <span className="block text-[11px] text-stone-500 mt-0.5 line-clamp-1">
                                {subLine(featured, lang, dict.genderTag, dict.product.inspiredBy)}
                              </span>
                              {featured.imageUrl && (
                                <span className="relative block h-28 mt-3">
                                  <ProductImage src={featured.imageUrl} alt={featured.nameEn} fit="contain" sizes="200px" />
                                </span>
                              )}
                              <span className="block mt-3 text-[11px] text-bordeaux font-medium group-hover/feat:underline">
                                {dict.nav.viewProduct}
                              </span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </li>
                  ) : (
                    <li key={path}>
                      <Link href={to(lang, path)} aria-current={isActive(path) ? 'page' : undefined} className={linkClass(path)}>
                        {label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          </div>

          {/* اللوجو في النص */}
          <Link href={to(lang)} aria-label="SIMAT سِمة" className="justify-self-center">
            <Image
              src="/brand/simat-logo.png"
              alt="SIMAT سِمة"
              width={378}
              height={360}
              priority
              className="h-14 md:h-20 w-auto"
            />
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
