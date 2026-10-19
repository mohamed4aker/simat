import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/i18n';
import { pageMeta } from '@/lib/page-meta';

export const generateMetadata = ({ params }: PageProps<'/[lang]/returns'>) =>
  pageMeta(params, '/returns', (l) => {
    const t = getDictionary(l).pages.returns;
    return { title: t.title, description: t.intro };
  });

/**
 * سياسة الاسترجاع والاستبدال. (مفيش جدول أسعار شحن — الشحن بيتحسب
 * تلقائي في صفحة الطلب حسب المحافظة.)
 */
export default async function ReturnsPage({ params }: PageProps<'/[lang]/returns'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).pages.returns;
  const card = 'bg-linen border border-linen-border p-6';
  const h2 = 'text-lg font-serif text-noir font-bold';

  return (
    <div className="mx-auto max-w-3xl px-6 py-14 space-y-5">
      <h1 className="text-4xl font-serif text-noir">{t.title}</h1>
      <p className="text-sm text-stone-600 leading-relaxed mb-6">{t.intro}</p>
      <section className={card}>
        <h2 className={h2}>{t.policyTitle}</h2>
        <ul className="mt-3 space-y-2.5 text-sm text-stone-600 leading-relaxed list-disc ps-5">
          {t.policy.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </section>
      <section className={card}>
        <h2 className={h2}>{t.shippingTitle}</h2>
        <p className="mt-2 text-sm text-stone-600 leading-relaxed">{t.shippingBody}</p>
      </section>
    </div>
  );
}
