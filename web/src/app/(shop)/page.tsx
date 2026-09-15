import Link from 'next/link';
import {
  Flame, Flower2, TreePine, Gem, Droplets, Gift, Sparkles,
  Truck, ShieldCheck, RefreshCw, Package,
} from 'lucide-react';

import { SimatMark } from '@/components/brand/SimatLogo';
import { ProductGrid } from '@/components/product/ProductCard';
import { SectionTitle, buttonStyles } from '@/components/ui';
import { FREE_SHIPPING_THRESHOLD, STORE } from '@/lib/constants';
import { price } from '@/lib/format';
import {
  getBestSellers, getCategories, getFeatured, getNewArrivals, getOffers,
} from '@/lib/store';

// الصفحة بتتولّد على السيرفر وبتتحدّث كل دقيقة، فأي منتج تضيفه
// من لوحة التحكم بيظهر على طول تقريباً.
export const revalidate = 60;

const ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  flame: Flame,
  flower: Flower2,
  wood: TreePine,
  diamond: Gem,
  drop: Droplets,
  gift: Gift,
  bottle: Sparkles,
};

export default async function HomePage() {
  const [categories, featured, offers, bestSellers, newArrivals] =
    await Promise.all([
      getCategories(),
      getFeatured(8),
      getOffers(4),
      getBestSellers(8),
      getNewArrivals(4),
    ]);

  return (
    <>
      {/* ── البانر الرئيسي ── */}
      <section className="relative overflow-hidden bg-wine text-white">
        <div className="absolute inset-0 simat-pattern opacity-60" />
        <div className="absolute -left-10 -bottom-16 opacity-10 text-ivory hidden sm:block">
          <SimatMark size={340} />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-28">
          <span className="inline-block rounded-full bg-copper px-3 py-1 text-xs font-extrabold">
            مجموعة ٢٠٢٦
          </span>
          <h1 className="mt-5 text-4xl sm:text-6xl font-extrabold leading-tight">
            {STORE.tagline}
          </h1>
          <p className="mt-4 max-w-xl text-white/85 leading-8">
            تشكيلة مختارة بعناية من العود والورد والعنبر. خامات أصلية،
            تعبئة مصرية بمعايير عالمية، وشحن لكل محافظات مصر.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className={`${buttonStyles.copper} !px-8`}>
              تسوّق دلوقتي
            </Link>
            <Link
              href="/shop?offers=1"
              className="inline-flex items-center justify-center rounded-xl border border-white/40 px-8 py-3 font-bold hover:bg-white hover:text-wine transition-colors"
            >
              شوف العروض
            </Link>
          </div>
        </div>
      </section>

      {/* ── مميزات سريعة ── */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
          <Feature
            icon={<Truck size={20} />}
            title="شحن مجاني"
            text={`للطلبات فوق ${price(FREE_SHIPPING_THRESHOLD)}`}
          />
          <Feature
            icon={<Package size={20} />}
            title="الدفع عند الاستلام"
            text="تدفع لما الطلب يوصلك"
          />
          <Feature
            icon={<ShieldCheck size={20} />}
            title="أصلي ١٠٠٪"
            text="خامات مضمونة ومختبرة"
          />
          <Feature
            icon={<RefreshCw size={20} />}
            title="استبدال ١٤ يوم"
            text="لو المنتج مش زي ما توقّعت"
          />
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4">
        {/* ── التصنيفات ── */}
        <section className="py-14">
          <SectionTitle
            title="تسوّق حسب التصنيف"
            subtitle="اختار العائلة العطرية اللي تناسبك"
            href="/shop"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((c) => {
              const Icon = ICONS[c.iconKey] ?? Sparkles;
              return (
                <Link
                  key={c.id}
                  href={`/shop?category=${c.slug}`}
                  className="group bg-surface border border-line rounded-2xl p-5 text-center hover:border-copper hover:-translate-y-0.5 transition-all"
                >
                  <span className="inline-grid place-items-center w-12 h-12 rounded-xl bg-sand/60 text-wine group-hover:bg-wine group-hover:text-white transition-colors">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-3 text-sm font-bold">{c.name}</h3>
                  <p className="mt-1 text-[11px] text-faint leading-5">
                    {c.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ── مختارات سِمة ── */}
        {featured.length > 0 && (
          <section className="pb-14">
            <SectionTitle
              title="مختارات سِمة"
              subtitle="أكتر العطور اللي عملت فرق مع عملائنا"
              href="/shop"
            />
            <ProductGrid products={featured} />
          </section>
        )}
      </div>

      {/* ── بانر العروض ── */}
      {offers.length > 0 && (
        <section className="bg-charcoal text-white">
          <div className="mx-auto max-w-6xl px-4 py-14">
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold">عروض الأسبوع</h2>
                <p className="text-white/60 text-sm mt-1">
                  خصومات حقيقية على تشكيلة محدودة
                </p>
              </div>
              <Link
                href="/shop?offers=1"
                className="text-sm font-bold text-copper-light hover:text-white transition-colors"
              >
                كل العروض ←
              </Link>
            </div>
            <ProductGrid products={offers} />
          </div>
        </section>
      )}

      <div className="mx-auto max-w-6xl px-4">
        {/* ── الأكثر مبيعاً ── */}
        <section className="py-14">
          <SectionTitle
            title="الأكثر مبيعاً"
            subtitle="اللي بيطلبه العملاء تاني وتالت"
            href="/shop?sort=best-selling"
          />
          <ProductGrid products={bestSellers} />
        </section>

        {/* ── وصل حديثاً ── */}
        <section className="pb-14">
          <SectionTitle
            title="وصل حديثاً"
            subtitle="آخر إصدارات سِمة"
            href="/shop?sort=newest"
          />
          <ProductGrid products={newArrivals} />
        </section>

        {/* ── قصة العلامة ── */}
        <section className="pb-16">
          <div className="bg-surface border border-line rounded-3xl p-8 sm:p-12 text-center">
            <div className="inline-flex text-wine">
              <SimatMark size={60} />
            </div>
            <h2 className="mt-5 text-2xl font-bold">سِمة — الأثر اللي بيفضل</h2>
            <p className="mt-4 mx-auto max-w-2xl text-muted leading-8">
              بنختار كل زيت ونوتة بإيدينا، وبنعبّي كل زجاجة في مصر بمعايير
              عالمية. عطرك مش مجرد ريحة — ده أثرك اللي الناس تفتكره.
            </p>
            <Link href="/about" className={`${buttonStyles.outline} mt-7`}>
              اعرف أكتر عن سِمة
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid place-items-center w-10 h-10 rounded-xl bg-sand/60 text-copper shrink-0">
        {icon}
      </span>
      <div className="min-w-0">
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="text-xs text-faint leading-5">{text}</p>
      </div>
    </div>
  );
}
