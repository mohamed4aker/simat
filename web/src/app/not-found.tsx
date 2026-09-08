import Link from 'next/link';
import { SimatMark } from '@/components/brand/SimatLogo';
import { buttonStyles } from '@/components/ui';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <div className="inline-flex text-wine opacity-60">
        <SimatMark size={72} />
      </div>
      <h1 className="mt-6 text-3xl font-extrabold">الصفحة مش موجودة</h1>
      <p className="mt-3 text-muted">
        يمكن الرابط اتغيّر أو المنتج اتشال من المتجر.
      </p>
      <div className="mt-8 flex gap-3 justify-center">
        <Link href="/" className={buttonStyles.primary}>الرئيسية</Link>
        <Link href="/shop" className={buttonStyles.outline}>المتجر</Link>
      </div>
    </div>
  );
}
