import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/i18n';
import { TrackForm } from '@/components/cart/TrackForm';

export async function generateMetadata({ params }: PageProps<'/[lang]/track'>): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const t = getDictionary(lang).track;
  return { title: t.title, description: t.body, alternates: { canonical: `/${lang}/track` } };
}

export default async function TrackPage({ params }: PageProps<'/[lang]/track'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).track;
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-3xl font-serif text-noir">{t.title}</h1>
      <p className="mt-2 mb-8 text-sm text-stone-600">{t.body}</p>
      <Suspense>
        <TrackForm />
      </Suspense>
    </div>
  );
}
