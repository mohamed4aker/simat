import { notFound } from 'next/navigation';
import { fill, getDictionary, hasLocale } from '@/i18n';
import { pageMeta } from '@/lib/page-meta';
import { STORE } from '@/lib/constants';

export const generateMetadata = ({ params }: PageProps<'/[lang]/privacy'>) =>
  pageMeta(params, '/privacy', (l) => ({ title: getDictionary(l).pages.privacy.title }));

export default async function PrivacyPage({ params }: PageProps<'/[lang]/privacy'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const t = getDictionary(lang).pages.privacy;
  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-4xl font-serif text-noir">{t.title}</h1>
      <p className="mt-3 text-xs text-stone-500">{fill(t.updated, { year: new Date().getFullYear() })}</p>
      <div className="mt-10 space-y-8">
        {t.sections.map((s) => (
          <section key={s.title}>
            <h2 className="text-lg font-serif text-noir font-bold">{s.title}</h2>
            <p className="mt-2 text-sm text-stone-600 leading-relaxed">{fill(s.body, { email: STORE.email })}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
