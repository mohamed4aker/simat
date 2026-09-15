import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, Droplet, Ruler, Users, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

import { BottleArt } from '@/components/brand/BottleArt';
import { ProductBuyBox } from '@/components/product/ProductBuyBox';
import { ProductGrid } from '@/components/product/ProductCard';
import { Badge, Card, Price, SectionTitle, Stars } from '@/components/ui';
import { DELIVERY_DAYS, SITE_URL, STORE } from '@/lib/constants';
import { dateAr, discountPercent, number } from '@/lib/format';
import {
  getCategories, getProductBySlug, getProducts, getRelated, getReviews,
} from '@/lib/store';
import { concentrationShort, genderLabels } from '@/lib/types';

// الصفحة بتتولّد على السيرفر وبتتحدّث كل دقيقة، فأي منتج تضيفه
// من لوحة التحكم بيظهر على طول تقريباً.
export const revalidate = 60;

/** بنولّد صفحات المنتجات وقت البناء عشان تفتح فوراً وتتفهرس في جوجل. */
export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'المنتج مش موجود' };

  const title = `${product.name} — ${product.sizeMl} مل`;
  const description = product.description.slice(0, 155);

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: 'website',
      title: `${title} | ${STORE.name}`,
      description,
      url: `${SITE_URL}/product/${product.slug}`,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [reviews, related, categories] = await Promise.all([
    getReviews(product.id),
    getRelated(product, 4),
    getCategories(),
  ]);

  const category = categories.find((c) => c.id === product.categoryId);
  const off = discountPercent(product.price, product.oldPrice);

  // بيانات منظّمة عشان جوجل يعرض السعر والتقييم في نتائج البحث.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    alternateName: product.nameEn,
    description: product.description,
    sku: product.id,
    brand: { '@type': 'Brand', name: product.brand },
    category: category?.name,
    offers: {
      '@type': 'Offer',
      url: `${SITE_URL}/product/${product.slug}`,
      priceCurrency: 'EGP',
      price: product.price,
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: STORE.name },
    },
    ...(product.ratingCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.ratingCount,
      },
    }),
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-xs text-faint mb-6 flex items-center gap-2 flex-wrap">
        <Link href="/" className="hover:text-wine">الرئيسية</Link>
        <span>/</span>
        <Link href="/shop" className="hover:text-wine">المتجر</Link>
        {category && (
          <>
            <span>/</span>
            <Link
              href={`/shop?category=${category.slug}`}
              className="hover:text-wine"
            >
              {category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-charcoal">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10">
        <div className="self-start rounded-3xl overflow-hidden border border-line bg-surface">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
          ) : (
            <BottleArt seed={product.id} className="w-full aspect-square" />
          )}
        </div>

        <div>
          <div className="flex items-start gap-3">
            <h1 className="text-3xl font-extrabold flex-1">{product.name}</h1>
            {off > 0 && <Badge>وفّر {off}%</Badge>}
          </div>
          <p className="mt-1.5 text-sm text-faint">
            {product.brand} · {product.nameEn}
          </p>

          <div className="mt-4 flex items-center gap-4 flex-wrap">
            <Stars rating={product.rating} count={product.ratingCount} size={17} />
            <span className="text-xs text-faint">
              اتباع {number(product.soldCount)} مرة
            </span>
          </div>

          <div className="mt-5 text-2xl">
            <Price value={product.price} oldValue={product.oldPrice} />
          </div>

          <div className="mt-5">
            <StockLine stock={product.stock} />
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <Spec icon={<Droplet size={16} />} label="التركيز"
              value={concentrationShort[product.concentration]} />
            <Spec icon={<Ruler size={16} />} label="الحجم"
              value={`${product.sizeMl} مل`} />
            <Spec icon={<Users size={16} />} label="الفئة"
              value={genderLabels[product.gender]} />
            <Spec icon={<Clock size={16} />} label="الثبات"
              value={`${product.longevityHours} ساعة`} />
          </div>

          <div className="mt-7">
            <ProductBuyBox product={product} />
          </div>

          <p className="mt-4 text-xs text-faint leading-6">
            الدفع عند الاستلام متاح · التوصيل خلال {DELIVERY_DAYS.min}–
            {DELIVERY_DAYS.max} أيام عمل · استبدال خلال ١٤ يوم
          </p>

          <div className="mt-8">
            <h2 className="font-bold mb-2">الوصف</h2>
            <p className="text-muted leading-8 text-[15px]">
              {product.description}
            </p>
          </div>

          <Pyramid product={product} />
        </div>
      </div>

      {/* التقييمات */}
      {reviews.length > 0 && (
        <section className="mt-16">
          <SectionTitle title="آراء العملاء" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.slice(0, 6).map((r) => (
              <Card key={r.id} className="p-5">
                <div className="flex items-center gap-3">
                  <span className="grid place-items-center w-9 h-9 rounded-full bg-sand text-wine font-bold text-sm">
                    {r.userName.slice(0, 1)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{r.userName}</p>
                    <p className="text-[11px] text-faint">
                      {dateAr(r.createdAt)}
                    </p>
                  </div>
                  <Stars rating={r.rating} size={13} />
                </div>
                {r.comment && (
                  <p className="mt-3 text-sm text-muted leading-7">
                    {r.comment}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="mt-16">
          <SectionTitle title="ممكن يعجبك كمان" href="/shop" />
          <ProductGrid products={related} />
        </section>
      )}
    </div>
  );
}

function Spec({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface px-4 py-3">
      <span className="inline-flex items-center gap-1.5 text-[11px] text-faint">
        <span className="text-copper">{icon}</span>
        {label}
      </span>
      <p className="mt-0.5 text-sm font-bold">{value}</p>
    </div>
  );
}

function StockLine({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <p className="inline-flex items-center gap-2 text-sm font-bold text-bad">
        <XCircle size={17} /> نفد المخزون — هيرجع قريب
      </p>
    );
  }
  if (stock <= 5) {
    return (
      <p className="inline-flex items-center gap-2 text-sm font-bold text-warn">
        <AlertTriangle size={17} /> باقي {stock} قطع بس — اطلب بسرعة
      </p>
    );
  }
  return (
    <p className="inline-flex items-center gap-2 text-sm font-bold text-ok">
      <CheckCircle2 size={17} /> متوفر وجاهز للشحن
    </p>
  );
}

function Pyramid({
  product,
}: {
  product: { topNotes: string[]; heartNotes: string[]; baseNotes: string[] };
}) {
  const layers = [
    { title: 'النوتات العليا', notes: product.topNotes, opacity: 'opacity-100' },
    { title: 'نوتات القلب', notes: product.heartNotes, opacity: 'opacity-70' },
    { title: 'نوتات القاعدة', notes: product.baseNotes, opacity: 'opacity-45' },
  ].filter((l) => l.notes.length > 0);

  if (layers.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="font-bold mb-4">الهرم العطري</h2>
      <div className="space-y-4">
        {layers.map((l) => (
          <div key={l.title} className="flex gap-3">
            <span
              className={`mt-2 w-2.5 h-2.5 rounded-full bg-copper shrink-0 ${l.opacity}`}
            />
            <div>
              <p className="text-xs font-bold text-muted">{l.title}</p>
              <p className="text-[15px] mt-0.5">{l.notes.join(' · ')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
