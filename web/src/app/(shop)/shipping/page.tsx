import type { Metadata } from 'next';
import { Card } from '@/components/ui';
import {
  DELIVERY_DAYS, FREE_SHIPPING_THRESHOLD, SHIPPING_RATES,
} from '@/lib/constants';
import { price } from '@/lib/format';

export const metadata: Metadata = {
  title: 'الشحن والاستبدال',
  description:
    'أسعار الشحن لكل محافظات مصر، مدة التوصيل، وسياسة الاستبدال والاسترجاع.',
  alternates: { canonical: '/shipping' },
};

export default function ShippingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <h1 className="text-3xl font-extrabold">الشحن والاستبدال</h1>

      <Card className="mt-8 p-6">
        <h2 className="font-bold text-lg">مدة التوصيل</h2>
        <p className="mt-2 text-muted leading-8">
          بنشحن خلال {DELIVERY_DAYS.min} إلى {DELIVERY_DAYS.max} أيام عمل من
          وقت تأكيد الطلب. الطلبات اللي بتتعمل يوم الجمعة بتتجهّز يوم السبت.
        </p>
      </Card>

      <Card className="mt-5 p-6">
        <h2 className="font-bold text-lg">شحن مجاني</h2>
        <p className="mt-2 text-muted leading-8">
          كل طلب قيمته {price(FREE_SHIPPING_THRESHOLD)} أو أكتر، الشحن عليه
          مجاني لأي محافظة في مصر.
        </p>
      </Card>

      <Card className="mt-5 p-6">
        <h2 className="font-bold text-lg mb-4">أسعار الشحن حسب المحافظة</h2>
        <div className="grid sm:grid-cols-2 gap-x-8">
          {Object.entries(SHIPPING_RATES).map(([g, p]) => (
            <div
              key={g}
              className="flex justify-between border-b border-line py-2 text-sm"
            >
              <span className="text-muted">{g}</span>
              <b>{price(p)}</b>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mt-5 p-6">
        <h2 className="font-bold text-lg">الاستبدال والاسترجاع</h2>
        <ul className="mt-3 space-y-2.5 text-muted leading-8 list-disc ps-5">
          <li>لك حق الاستبدال خلال ١٤ يوم من تاريخ الاستلام.</li>
          <li>
            المنتج لازم يكون بحالته الأصلية وغلافه مفكوكش (لأسباب صحية،
            العطور المفتوحة مش بتترجع).
          </li>
          <li>
            لو وصلك منتج تالف أو غلط، بنستبدله على حسابنا بالكامل — كلّمنا
            في خلال ٤٨ ساعة من الاستلام.
          </li>
          <li>الاسترجاع النقدي بيتم خلال ٧ أيام عمل بعد استلام المنتج.</li>
        </ul>
      </Card>
    </div>
  );
}
