import { notFound } from 'next/navigation';
import { getDictionary, hasLocale } from '@/i18n';
import { pageMeta } from '@/lib/page-meta';
import { getProducts } from '@/lib/store';
import { ScentFinder } from '@/components/home/ScentFinder';

export const revalidate = 60;

export const generateMetadata = ({ params }: PageProps<'/[lang]/find-your-scent'>) =>
  pageMeta(params, '/find-your-scent', (l) => {
    const t = getDictionary(l).quiz;
    return { title: t.title, description: t.subtitle };
  });

/** اكتشف عطرك — 4 أسئلة سريعة وبيرشّح عطر من الكتالوج (من القائمة اللي فوق). */
export default async function FindYourScentPage({ params }: PageProps<'/[lang]/find-your-scent'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const products = (await getProducts()).filter((p) => p.kind === 'bottle');
  return (
    <div className="py-10 md:py-16">
      <ScentFinder products={products} />
    </div>
  );
}
