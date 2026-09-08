import type { Metadata } from 'next';
import { STORE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية',
  description: 'إزاي بنتعامل مع بياناتك في متجر سِمة.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-extrabold">سياسة الخصوصية</h1>
      <p className="mt-3 text-sm text-faint">
        آخر تحديث: {new Date().getFullYear()}
      </p>

      <div className="mt-8 space-y-7 text-muted leading-9">
        <section>
          <h2 className="font-bold text-charcoal text-lg">البيانات اللي بنجمعها</h2>
          <p className="mt-2">
            بنجمع البيانات اللازمة لتنفيذ طلبك بس: اسمك، رقم موبايلك،
            وعنوان الشحن. البريد الإلكتروني اختياري وبنستخدمه لإرسال تأكيد
            الطلب لو كتبته.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-charcoal text-lg">إزاي بنستخدمها</h2>
          <p className="mt-2">
            بياناتك بتُستخدم في تجهيز الطلب وشحنه والتواصل معاك بخصوصه بس.
            بنشارك الاسم والعنوان والموبايل مع شركة الشحن عشان الطلب يوصلك.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-charcoal text-lg">الدفع</h2>
          <p className="mt-2">
            إحنا ما بنخزّنش أي بيانات بطاقات بنكية على سيرفراتنا إطلاقاً.
            المدفوعات الإلكترونية بتتم من خلال بوابة دفع مرخّصة.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-charcoal text-lg">الكوكيز</h2>
          <p className="mt-2">
            بنستخدم تخزين المتصفح عشان نحتفظ بعربة التسوق بتاعتك بس. مفيش
            تتبّع إعلاني من غير إذنك.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-charcoal text-lg">حقوقك</h2>
          <p className="mt-2">
            تقدر تطلب في أي وقت إننا نحذف بياناتك من عندنا — كلّمنا على{' '}
            <a href={`mailto:${STORE.email}`} dir="ltr" className="text-wine font-bold">
              {STORE.email}
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
