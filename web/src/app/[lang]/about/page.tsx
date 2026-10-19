import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/i18n';
import { to } from '@/lib/href';
import { pageMeta } from '@/lib/page-meta';
import { Eyebrow, btn } from '@/components/ui/store';

export const generateMetadata = ({ params }: PageProps<'/[lang]/about'>) =>
  pageMeta(params, '/about', (l) => {
    const t = getDictionary(l).story;
    return { title: t.eyebrow, description: t.body };
  });

/** قصتنا — نفس نص القصة اللي في الصفحة الرئيسية بالظبط (نسخة واحدة في dict.story). */
export default async function AboutPage({ params }: PageProps<'/[lang]/about'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.story;
  return (
    <div className="max-w-6xl mx-auto px-6 py-14 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
      <div className="relative aspect-square overflow-hidden shadow-xl">
        <Image
          src="/products/aureate-notes.webp"
          alt={t.eyebrow}
          fill
          unoptimized
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
        />
      </div>
      <div className="space-y-6">
        <Eyebrow>{t.eyebrow}</Eyebrow>
        <h1 className="text-3xl sm:text-5xl font-serif text-noir leading-tight">{t.quote}</h1>
        <p className="text-sm sm:text-base text-stone-700 leading-relaxed">{t.body}</p>
        <ul className="grid grid-cols-3 gap-3 text-center">
          {[t.point1, t.point2, t.point3].map((p) => (
            <li key={p} className="border-t-2 border-bordeaux bg-linen p-3 text-xs text-stone-700 font-medium">{p}</li>
          ))}
        </ul>
        <Link href={to(lang, '/shop')} className={btn.primary}>{dict.hero.ctaPrimary}</Link>
      </div>
    </div>
  );
}
