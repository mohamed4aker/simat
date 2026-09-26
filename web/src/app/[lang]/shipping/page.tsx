import { notFound } from 'next/navigation';
import { fill, getDictionary, hasLocale } from '@/i18n';
import { price, priceNumber } from '@/lib/format';
import { pageMeta } from '@/lib/page-meta';
import { FREE_SHIPPING_THRESHOLD, GOVERNORATE_EN, SHIPPING_RATES } from '@/lib/constants';

export const generateMetadata = ({ params }: PageProps<'/[lang]/shipping'>) =>
  pageMeta(params, '/shipping', (l) => {
    const t = getDictionary(l).pages.shipping;
    return { title: t.title, description: t.deliveryBody };
  });

export default async function ShippingPage({ params }: PageProps<'/[lang]/shipping'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).pages.shipping;
  const card = 'bg-linen border border-linen-border p-6';
  const h2 = 'text-lg font-serif text-noir font-bold';

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 space-y-5">
      <h1 className="text-4xl font-serif text-noir mb-8">{t.title}</h1>
      <section className={card}>
        <h2 className={h2}>{t.deliveryTitle}</h2>
        <p className="mt-2 text-sm text-stone-600 leading-relaxed">{t.deliveryBody}</p>
      </section>
      <section className={card}>
        <h2 className={h2}>{t.freeTitle}</h2>
        <p className="mt-2 text-sm text-stone-600 leading-relaxed">
          {fill(t.freeBody, { amount: priceNumber(FREE_SHIPPING_THRESHOLD) })}
        </p>
      </section>
      <section className={card}>
        <h2 className={`${h2} mb-4`}>{t.ratesTitle}</h2>
        <div className="grid sm:grid-cols-2 gap-x-8">
          {Object.entries(SHIPPING_RATES).map(([g, p]) => (
            <div key={g} className="flex justify-between border-b border-linen-border py-2 text-sm">
              <span className="text-stone-600">{lang === 'en' ? GOVERNORATE_EN[g] : g}</span>
              <span className="latin text-noir">{price(p, lang)}</span>
            </div>
          ))}
        </div>
      </section>
      <section id="returns" className={card}>
        <h2 className={h2}>{t.returnsTitle}</h2>
        <ul className="mt-3 space-y-2.5 text-sm text-stone-600 leading-relaxed list-disc ps-5">
          {t.returns.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
