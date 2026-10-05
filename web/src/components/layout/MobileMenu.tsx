'use client';

import Link from 'next/link';
import { ChevronDown, X } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { to } from '@/lib/href';
import { useUi, uiStore } from '@/components/cart/CartProvider';
import { useLockScroll } from '@/components/ui/Modal';
import { LanguageSwitch } from './LanguageSwitch';

/** قائمة الموبايل الجانبية — نفس محتوى الـ Mega Menu في أقسام بتتفتح. */
export function MobileMenu() {
  const { lang, dict } = useI18n();
  const open = useUi().panel === 'menu';
  useLockScroll(open);
  const close = () => uiStore.close();
  const t = dict.mega;

  const groups = [
    {
      label: dict.nav.shop,
      links: [
        [t.shop.all, '/shop'],
        [t.shop.women, '/shop?gender=women'],
        [t.shop.men, '/shop?gender=men'],
        [t.shop.unisex, '/shop?gender=unisex'],
        [t.shop.bestSellers, '/shop?sort=best-selling'],
        [dict.shop.families.amber, '/shop?family=amber'],
        [dict.shop.families.woody, '/shop?family=woody'],
        [dict.shop.families.floral, '/shop?family=floral'],
        [dict.shop.families.fresh, '/shop?family=fresh'],
      ],
    },
    {
      label: dict.nav.discover,
      links: [
        [t.discover.finder, '#scent-finder'],
        [t.discover.layering, '#layering'],
        [t.discover.tryAtHome, '#discovery-set'],
        [t.discover.story, '/about'],
      ],
    },
    {
      label: dict.nav.collections,
      links: [
        [t.collections.signature, '/shop?category=signature'],
        [t.collections.discovery, '/product/discovery-set'],
        [t.collections.duos, '#layering'],
      ],
    },
    {
      label: dict.nav.about,
      links: [
        [t.about.story, '/about'],
        [t.about.shipping, '/shipping'],
        [t.about.faq, '/faq'],
        [t.about.track, '/track'],
        [t.about.contact, '/contact'],
      ],
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-[60] lg:hidden transition-opacity duration-300 ${
        open ? 'opacity-100' : 'opacity-0 pointer-events-none invisible'
      }`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-noir/70 backdrop-blur-sm" onClick={close} />
      <aside
        aria-label={dict.mobile.menu}
        className={`absolute inset-y-0 start-0 w-full max-w-xs bg-linen-light shadow-2xl p-6 flex flex-col justify-between overflow-y-auto transition-transform duration-300 ${
          open ? 'translate-x-0' : 'ltr:-translate-x-full rtl:translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-linen-border">
            <span className="text-base font-serif text-noir uppercase tracking-wider">{dict.mobile.menu}</span>
            <button type="button" onClick={close} className="p-2 text-stone-500 hover:text-bordeaux" aria-label={dict.common.close}>
              <X className="w-5 h-5" strokeWidth={1.3} />
            </button>
          </div>

          <div className="py-4 text-xs uppercase tracking-wider text-noir divide-y divide-linen-border">
            {groups.map((g) => (
              <details key={g.label} className="group py-2">
                <summary className="flex justify-between items-center py-2 cursor-pointer">
                  <span>{g.label}</span>
                  <ChevronDown className="chevron w-4 h-4 text-stone-400 transition-transform" strokeWidth={1.5} />
                </summary>
                <div className="ps-4 pb-2 pt-1 space-y-3 text-stone-600 normal-case tracking-normal text-[13px]">
                  {g.links.map(([label, path]) => (
                    <Link key={label} href={to(lang, path)} onClick={close} className="block hover:text-bordeaux">
                      {label}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="border-t border-linen-border pt-6 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-stone-500">{dict.mobile.language}</span>
            <LanguageSwitch variant="full" />
          </div>
          <p className="text-[11px] text-stone-500">{dict.mobile.currency}</p>
        </div>
      </aside>
    </div>
  );
}
