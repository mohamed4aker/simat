import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { fill, getDictionary, type Locale } from '@/i18n';
import { to } from '@/lib/href';
import { DEVELOPER, STORE, whatsappLink } from '@/lib/constants';
import Image from 'next/image';
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

function TikTok({ className = '' }: { className?: string; strokeWidth?: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.6 3c.4 2.1 1.7 3.6 3.9 3.8v3.1c-1.4.1-2.7-.3-3.9-1.1v6.1c0 3.6-2.6 6.1-6 6.1-3.3 0-5.8-2.5-5.8-5.7 0-3.6 3.1-6.2 6.8-5.6v3.2c-1.8-.4-3.6.8-3.6 2.5 0 1.4 1.1 2.5 2.6 2.5 1.6 0 2.7-1 2.7-3V3h3.3Z" />
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
    { icon: Instagram, href: `https://www.instagram.com/${STORE.instagram}`, label: 'Instagram' },
    { icon: TikTok, href: `https://www.tiktok.com/@${STORE.tiktok}`, label: 'TikTok' },
    { icon: Facebook, href: STORE.facebookUrl, label: 'Facebook' },
    { icon: MessageCircle, href: whatsappLink(), label: 'WhatsApp' },
  ];

  return (
    <footer className="bg-bordeaux-dark text-linen-light mt-24">
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-10 grid grid-cols-2 lg:grid-cols-12 gap-10">
        {/* سِمة */}
        <div className="col-span-2 lg:col-span-4 space-y-4">
          <Image src="/brand/simat-logo-light.png" alt="SIMAT سِمة" width={378} height={360} className="h-24 w-auto" />
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
        {/* مطوّر الموقع — كل جزء في سطر لوحده لو المساحة ضيقة */}
        <p className="max-w-7xl mx-auto px-6 pb-5 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-center text-[11px] text-linen-light/50">
          <span className="whitespace-nowrap">
            {t.developedBy}: <span className="text-linen-light/80">{lang === 'en' ? DEVELOPER.nameEn : DEVELOPER.nameAr}</span>
          </span>
          <span aria-hidden="true">·</span>
          <a href={`mailto:${DEVELOPER.email}`} className="hover:text-gold whitespace-nowrap" dir="ltr">{DEVELOPER.email}</a>
          <span aria-hidden="true">·</span>
          <a
            href={`https://wa.me/${DEVELOPER.phone.replace(/^0/, '20')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold whitespace-nowrap"
            dir="ltr"
          >
            {DEVELOPER.phone}
          </a>
        </p>
      </div>
    </footer>
  );
}
