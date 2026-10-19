import { permanentRedirect } from 'next/navigation';

/** صفحة الشحن اتلغت — معلومات الشحن بقت في سياسة الاسترجاع والأسئلة الشائعة. */
export default async function ShippingPage({ params }: PageProps<'/[lang]/shipping'>) {
  const { lang } = await params;
  permanentRedirect(`/${lang}/returns`);
}
