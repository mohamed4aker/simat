import Link from 'next/link';
import { Phone, Mail } from 'lucide-react';
import { SimatLogo } from '@/components/brand/SimatLogo';
import { STORE, FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import { price } from '@/lib/format';
import type { Category } from '@/lib/types';

/** أيقونات السوشيال — مرسومة هنا لأنها مش موجودة في lucide. */
function InstagramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function FacebookIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H7v3h2v9h3v-9h2.5l.5-3H12V6.5a1 1 0 0 1 1-1h2z" />
    </svg>
  );
}

export function Footer({ categories }: { categories: Category[] }) {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-wine">
              <SimatLogo size={54} />
            </div>
            <p className="mt-4 text-sm leading-7 text-muted">
              {STORE.description}
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-3">التصنيفات</h3>
            <ul className="space-y-2 text-sm text-muted">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/shop?category=${c.slug}`}
                    className="hover:text-wine transition-colors"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3">المتجر</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/shop" className="hover:text-wine">كل المنتجات</Link></li>
              <li><Link href="/shop?offers=1" className="hover:text-wine">العروض</Link></li>
              <li><Link href="/track" className="hover:text-wine">تتبّع طلبك</Link></li>
              <li><Link href="/shipping" className="hover:text-wine">الشحن والاستبدال</Link></li>
              <li><Link href="/privacy" className="hover:text-wine">سياسة الخصوصية</Link></li>
              <li><Link href="/about" className="hover:text-wine">عن سِمة</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-3">تواصل معانا</h3>
            <ul className="space-y-3 text-sm text-muted">
              <li>
                <a
                  href={`tel:${STORE.phone}`}
                  className="inline-flex items-center gap-2 hover:text-wine"
                >
                  <Phone size={15} />
                  <span dir="ltr">{STORE.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${STORE.email}`}
                  className="inline-flex items-center gap-2 hover:text-wine"
                >
                  <Mail size={15} />
                  <span dir="ltr">{STORE.email}</span>
                </a>
              </li>
              <li className="flex items-center gap-3 pt-1">
                <a
                  href={`https://instagram.com/${STORE.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="إنستجرام"
                  className="hover:text-wine"
                >
                  <InstagramIcon />
                </a>
                <a
                  href={`https://facebook.com/${STORE.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="فيسبوك"
                  className="hover:text-wine"
                >
                  <FacebookIcon />
                </a>
              </li>
            </ul>
            <p className="mt-4 text-xs text-faint leading-6">
              شحن مجاني للطلبات فوق {price(FREE_SHIPPING_THRESHOLD)}
              <br />
              الدفع عند الاستلام متاح لكل المحافظات
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-line flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-faint">
          <p>© {new Date().getFullYear()} SIMAT — سِمة. كل الحقوق محفوظة.</p>
          <p>{STORE.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
