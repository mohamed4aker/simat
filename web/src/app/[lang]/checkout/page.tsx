import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/i18n';
import { isLive } from '@/lib/store';
import { CheckoutForm } from '@/components/cart/CheckoutForm';
import { Eyebrow } from '@/components/ui/store';

export async function generateMetadata({ params }: PageProps<'/[lang]/checkout'>): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  return { title: getDictionary(lang).checkout.eyebrow, robots: { index: false, follow: false } };
}

export default async function CheckoutPage({ params }: PageProps<'/[lang]/checkout'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).checkout;
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <Eyebrow className="mb-1 !text-[10px] !tracking-wider">{t.eyebrow}</Eyebrow>
      <h1 className="text-3xl font-serif text-noir mb-8">{t.title}</h1>
      <CheckoutForm demo={!isLive} />
    </div>
  );
}
