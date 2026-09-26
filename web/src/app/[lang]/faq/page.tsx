import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/i18n';
import { pageMeta } from '@/lib/page-meta';
import { Faq } from '@/components/home/Faq';

export const generateMetadata = ({ params }: PageProps<'/[lang]/faq'>) =>
  pageMeta(params, '/faq', (l) => {
    const t = getDictionary(l).faq;
    return { title: t.title, description: t.subtitle };
  });

export default async function FaqPage({ params }: PageProps<'/[lang]/faq'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <div className="py-14">
      <Faq lang={lang} headingLevel="h1" />
    </div>
  );
}
