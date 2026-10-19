'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { to } from '@/lib/href';
import { useUi, uiStore } from '@/components/cart/CartProvider';
import { useLockScroll } from '@/components/ui/Modal';
import { LanguageSwitch } from './LanguageSwitch';
import { navLinks } from './nav-links';

/** قائمة الموبايل الجانبية — نفس روابط القائمة الرئيسية. */
export function MobileMenu() {
  const { lang, dict } = useI18n();
  const open = useUi().panel === 'menu';
  useLockScroll(open);
  const close = () => uiStore.close();

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

          <nav className="py-4 divide-y divide-linen-border">
            {navLinks(dict.nav).map(([label, path]) => (
              <Link
                key={path}
                href={to(lang, path)}
                onClick={close}
                className="block py-4 text-[15px] text-noir hover:text-bordeaux"
              >
                {label}
              </Link>
            ))}
          </nav>
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
