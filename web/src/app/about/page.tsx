import type { Metadata } from 'next';
import Link from 'next/link';
import { SimatLogo } from '@/components/brand/SimatLogo';
import { buttonStyles, Card } from '@/components/ui';
import { STORE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'عن سِمة',
  description:
    'سِمة علامة عطور مصرية بتقدّم تركيبات فاخرة بخامات أصلية وأسعار عادلة.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <div className="text-center text-wine">
        <SimatLogo size={80} />
      </div>

      <h1 className="mt-8 text-3xl font-extrabold text-center">
        {STORE.tagline}
      </h1>

      <div className="mt-8 space-y-5 text-[15px] leading-9 text-muted">
        <p>
          <b className="text-charcoal">سِمة</b> علامة عطور مصرية اتأسست على
          فكرة واحدة: إن العطر مش مجرد ريحة حلوة — ده أثر بيفضل في ذاكرة
          الناس بعد ما تمشي.
        </p>
        <p>
          بنشتغل مع موردين خامات موثوقين في الشرق الأوسط وفرنسا، وبنختار كل
          زيت ونوتة بإيدينا. التعبئة كلها بتتم في مصر تحت رقابة جودة، وكل
          زجاجة بتتراجع يدوياً قبل ما توصلك.
        </p>
        <p>
          بنؤمن إن العطر الفاخر مالوش لازمة يكون سعره مبالغ فيه. عشان كده
          بنبيع مباشرة من غير وسطاء، والفرق ده بيرجعلك في الجودة والسعر.
        </p>
      </div>

      <div className="mt-10 grid sm:grid-cols-3 gap-4">
        {[
          { n: '٢٠+', t: 'تركيبة عطرية' },
          { n: '٢٧', t: 'محافظة بنشحن ليها' },
          { n: '١٤ يوم', t: 'حق الاستبدال' },
        ].map((s) => (
          <Card key={s.t} className="p-6 text-center">
            <p className="text-2xl font-extrabold text-wine">{s.n}</p>
            <p className="mt-1 text-sm text-muted">{s.t}</p>
          </Card>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link href="/shop" className={buttonStyles.primary}>
          تصفّح التشكيلة
        </Link>
      </div>
    </div>
  );
}
