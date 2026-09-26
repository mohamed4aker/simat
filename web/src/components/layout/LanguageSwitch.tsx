'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { useI18n } from '@/i18n/I18nProvider';
import { LOCALE_COOKIE, switchLocalePath, type Locale } from '@/i18n/config';

function remember(lang: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax`;
}

function useSwitchHref(target: Locale) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  return switchLocalePath(pathname, target) + (search ? `?${search}` : '');
}

function Links({ variant }: { variant: 'compact' | 'full' }) {
  const { lang, dict } = useI18n();
  const enHref = useSwitchHref('en');
  const arHref = useSwitchHref('ar');

  const item = (target: Locale, href: string, label: string) => {
    const active = lang === target;
    return (
      <Link
        href={href}
        hrefLang={target}
        lang={target}
        onClick={() => remember(target)}
        aria-current={active ? 'true' : undefined}
        className={
          variant === 'compact'
            ? `latin ${active ? 'text-gold font-bold' : 'text-stone-400 hover:text-noir'} transition-colors`
            : `${active ? 'text-noir font-bold' : 'text-stone-500 hover:text-bordeaux'} transition-colors`
        }
      >
        {label}
      </Link>
    );
  };

  return (
    <div
      role="group"
      aria-label={dict.common.language}
      className={
        variant === 'compact'
          ? 'flex items-center gap-2 text-xs tracking-wider uppercase'
          : 'flex items-center gap-2 text-xs'
      }
    >
      {variant === 'compact' ? item('en', enHref, 'EN') : item('en', enHref, dict.common.english)}
      <span className="text-stone-300">/</span>
      {variant === 'compact' ? item('ar', arHref, 'AR') : item('ar', arHref, dict.common.arabic)}
    </div>
  );
}

/** EN / AR — بينقل لنفس الصفحة باللغة التانية ويفتكر الاختيار. */
export function LanguageSwitch({ variant = 'compact' }: { variant?: 'compact' | 'full' }) {
  return (
    <Suspense fallback={<span className="text-xs text-stone-400 latin">EN / AR</span>}>
      <Links variant={variant} />
    </Suspense>
  );
}
