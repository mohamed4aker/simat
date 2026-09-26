import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/i18n';
import { to } from '@/lib/href';
import { pageMeta } from '@/lib/page-meta';
import { Eyebrow, btn } from '@/components/ui/store';

export const generateMetadata = ({ params }: PageProps<'/[lang]/about'>) =>
  pageMeta(params, '/about', (l) => {
    const t = getDictionary(l).pages.about;
    return { title: t.title, description: t.intro };
  });

export default async function AboutPage({ params }: PageProps<'/[lang]/about'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.pages.about;
  return (
    <div>
      <section className="bg-linen border-b border-linen-border py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Eyebrow className="mb-3">{dict.story.eyebrow}</Eyebrow>
          <h1 className="text-4xl sm:text-5xl font-serif text-noir leading-tight">{dict.story.quote}</h1>
          <p className="mt-6 text-sm text-stone-700 leading-relaxed">{t.intro}</p>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        {t.sections.map((s, i) => (
          <div key={s.title} className="border-t border-bordeaux pt-5">
            <span className="latin text-xs text-gold-dark">0{i + 1}</span>
            <h2 className="mt-1 text-xl font-serif text-noir">{s.title}</h2>
            <p className="mt-3 text-sm text-stone-600 leading-relaxed">{s.body}</p>
          </div>
        ))}
      </div>
      <div className="text-center">
        <Link href={to(lang, '/shop')} className={btn.primary}>{dict.hero.ctaPrimary}</Link>
      </div>
    </div>
  );
}
