import Link from 'next/link';
import { fill, getDictionary, type Locale } from '@/i18n';
import { to } from '@/lib/href';
import { STORE, whatsappLink } from '@/lib/constants';
import { Drop } from '@/components/brand/Wordmark';

export function Footer({ lang }: { lang: Locale }) {
  const dict = getDictionary(lang);
  const t = dict.footer;
  const shop = dict.mega.shop;

  const col = 'space-y-3 text-xs';
  const heading = 'font-serif uppercase tracking-wider text-noir font-bold text-sm';
  const link = 'hover:text-bordeaux transition-colors';

  return (
    <footer className="bg-linen border-t border-linen-border pt-16 pb-12 mt-24">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-4 space-y-4">
          <div className="latin flex items-center gap-2" dir="ltr">
            <Drop className="w-4 h-6 text-bordeaux" />
            <span className="text-xl tracking-widest text-noir uppercase font-medium" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
              SIMAT
            </span>
          </div>
          <p className="text-xs text-stone-600 leading-relaxed">{t.about}</p>
          <p className="text-[11px] text-stone-500 leading-relaxed">{t.sampleBadge}</p>
        </div>

        <div className={`md:col-span-2 ${col}`}>
          <h4 className={heading}>{t.colFragrances}</h4>
          <ul className="space-y-2 text-stone-600">
            <li><Link href={to(lang, '/shop')} className={link}>{shop.all}</Link></li>
            <li><Link href={to(lang, '/shop?sort=best-selling')} className={link}>{shop.bestSellers}</Link></li>
            <li><Link href={to(lang, '/product/discovery-set')} className={link}>{shop.discoverySets}</Link></li>
            <li><Link href={to(lang, '#layering')} className={link}>{shop.duos}</Link></li>
          </ul>
        </div>

        <div className={`md:col-span-3 ${col}`}>
          <h4 className={heading}>{t.colCare}</h4>
          <ul className="space-y-2 text-stone-600">
            <li><Link href={to(lang, '/shipping#returns')} className={link}>{t.returns}</Link></li>
            <li><Link href={to(lang, '/shipping')} className={link}>{t.shipping}</Link></li>
            <li><Link href={to(lang, '/faq')} className={link}>{t.faq}</Link></li>
            <li><Link href={to(lang, '/track')} className={link}>{t.track}</Link></li>
            <li><Link href={to(lang, '/privacy')} className={link}>{t.privacy}</Link></li>
          </ul>
        </div>

        <div className={`md:col-span-3 ${col}`} id="footer-contact">
          <h4 className={heading}>{t.colContact}</h4>
          <p className="text-stone-600">{t.contactLine}</p>
          <div className="space-y-1 text-stone-800">
            <p>
              WhatsApp:{' '}
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" dir="ltr" className={link}>
                {STORE.phoneDisplay}
              </a>
            </p>
            <p>
              <a href={`mailto:${STORE.email}`} className={link}>{STORE.email}</a>
            </p>
            <p>
              <a href={`https://instagram.com/${STORE.instagram}`} target="_blank" rel="noopener noreferrer" className={link}>
                @{STORE.instagram}
              </a>
            </p>
          </div>
          <p className="text-[11px] text-stone-500">{t.location}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 pt-6 border-t border-linen-border flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-4">
        <p>
          {fill(t.copyright, { year: new Date().getFullYear() })}
          <span className="mx-2 text-stone-300">·</span>
          <Link href="/admin" className="hover:text-bordeaux" rel="nofollow">{t.admin}</Link>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="text-stone-400 uppercase tracking-wider text-[10px]">{t.payments}</span>
          <span className="px-2 py-0.5 bg-white border border-linen-border text-[10px]">{t.cod}</span>
          {['Visa', 'Mastercard', 'Meeza'].map((m) => (
            <span key={m} className="latin px-2 py-0.5 bg-white border border-linen-border text-[10px]">{m}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}
