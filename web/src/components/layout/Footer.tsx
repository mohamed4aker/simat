import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { fill, getDictionary, type Locale } from '@/i18n';
import { to } from '@/lib/href';
import { STORE, whatsappLink } from '@/lib/constants';
import { Drop } from '@/components/brand/Wordmark';
import { FooterNewsletter } from './FooterNewsletter';

// lucide شالت أيقونات البراندات، فدول مرسومين هنا.
function Instagram({ className = '' }: { className?: string; strokeWidth?: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Facebook({ className = '' }: { className?: string; strokeWidth?: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z" />
    </svg>
  );
}

/**
 * الفوتر بلون الهوية، 4 أعمدة:
 *   سِمة (لوجو + تعريف + سوشيال) · تسوق · معلومات · النشرة البريدية
 * وتحت: طرق الدفع، الحقوق، والروابط القانونية.
 */
export function Footer({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const t = dict.footer;

  const heading = 'text-gold text-sm font-bold mb-4 pb-2 border-b border-white/15';
  const link = 'text-linen-light/75 hover:text-gold transition-colors';

  const shop: [string, string][] = [
    [t.allProducts, '/shop'],
    [t.bestSellers, '/shop?sort=best-selling'],
    [t.newArrivals, '/shop?sort=newest'],
    [dict.categories.women.title, '/shop?gender=women'],
    [dict.categories.men.title, '/shop?gender=men'],
    [dict.categories.unisex.title, '/shop?gender=unisex'],
  ];
  const info: [string, string][] = [
    [dict.nav.story, '/about'],
    [dict.nav.faq, '/faq'],
    [t.returns, '/returns'],
    [t.privacy, '/privacy'],
    [t.track, '/track'],
    [dict.nav.contact, '/contact'],
  ];
  const social = [
    { icon: Instagram, href: `https://instagram.com/${STORE.instagram}`, label: 'Instagram' },
    { icon: Facebook, href: `https://facebook.com/${STORE.facebook}`, label: 'Facebook' },
    { icon: MessageCircle, href: whatsappLink(), label: 'WhatsApp' },
  ];

  return (
    <footer className="bg-bordeaux-dark text-linen-light mt-24">
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-10 grid grid-cols-2 lg:grid-cols-12 gap-10">
        {/* سِمة */}
        <div className="col-span-2 lg:col-span-4 space-y-4">
          <div className="latin flex items-center gap-2" dir="ltr">
            <Drop className="w-5 h-7 text-gold" />
            <span className="text-2xl tracking-[0.28em] uppercase" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
              SIMAT
            </span>
          </div>
          <p className="text-sm text-linen-light/75 leading-relaxed max-w-xs">{t.about}</p>
          <div className="flex gap-3">
            {social.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-9 h-9 rounded-full border border-white/25 flex items-center justify-center hover:bg-gold hover:text-noir hover:border-gold transition-colors"
              >
                <Icon className="w-4 h-4" strokeWidth={1.6} />
              </a>
            ))}
          </div>
        </div>

        {/* تسوق */}
        <nav className="lg:col-span-2 text-sm" aria-label={t.colShop}>
          <h4 className={heading}>{t.colShop}</h4>
          <ul className="space-y-2.5">
            {shop.map(([label, path]) => (
              <li key={path}><Link href={to(lang, path)} className={link}>{label}</Link></li>
            ))}
          </ul>
        </nav>

        {/* معلومات */}
        <nav className="lg:col-span-2 text-sm" aria-label={t.colInfo}>
          <h4 className={heading}>{t.colInfo}</h4>
          <ul className="space-y-2.5">
            {info.map(([label, path]) => (
              <li key={path}><Link href={to(lang, path)} className={link}>{label}</Link></li>
            ))}
          </ul>
        </nav>

        {/* النشرة البريدية */}
        <div className="col-span-2 lg:col-span-4 text-sm">
          <h4 className={heading}>{dict.newsletter.title}</h4>
          <p className="text-linen-light/75 leading-relaxed mb-4">{dict.newsletter.body}</p>
          <FooterNewsletter />
          <p className="mt-5 text-xs text-linen-light/60">
            WhatsApp:{' '}
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" dir="ltr" className={link}>
              {STORE.phoneDisplay}
            </a>
          </p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-linen-light/60">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span>{t.payments}</span>
            <span className="px-2 py-1 bg-white/10 border border-white/15 text-linen-light">{t.cod}</span>
            {['Visa', 'Mastercard', 'Meeza'].map((m) => (
              <span key={m} className="latin px-2 py-1 bg-white/10 border border-white/15 text-linen-light">{m}</span>
            ))}
          </div>
          <p>{fill(t.copyright, { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-4">
            <Link href={to(lang, '/privacy')} className="hover:text-gold">{t.privacy}</Link>
            <Link href={to(lang, '/returns')} className="hover:text-gold">{t.returns}</Link>
            <Link href="/admin" className="hover:text-gold" rel="nofollow">{t.admin}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
