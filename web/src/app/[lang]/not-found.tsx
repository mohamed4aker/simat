'use client';

import Link from 'next/link';
import { useI18n } from '@/i18n/I18nProvider';
import { to } from '@/lib/href';
import { Drop } from '@/components/brand/Wordmark';
import { btn } from '@/components/ui/store';

export default function NotFound() {
  const { lang, dict } = useI18n();
  return (
    <div className="mx-auto max-w-lg px-6 py-28 text-center">
      <Drop className="w-8 h-12 text-bordeaux/60 mx-auto" />
      <h1 className="mt-6 text-3xl font-serif text-noir">{dict.notFound.title}</h1>
      <p className="mt-3 text-sm text-stone-600">{dict.notFound.body}</p>
      <div className="mt-8 flex gap-3 justify-center">
        <Link href={to(lang)} className={btn.primary}>{dict.notFound.cta}</Link>
        <Link href={to(lang, '/shop')} className={btn.outline}>{dict.nav.shop}</Link>
      </div>
    </div>
  );
}
