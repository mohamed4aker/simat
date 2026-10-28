import { notFound } from 'next/navigation';
import { AtSign, Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { getDictionary, hasLocale } from '@/i18n';
import { pageMeta } from '@/lib/page-meta';
import { pick, whatsappHref } from '@/lib/site-content';
import { getSiteContent } from '@/lib/site-content.server';

export const generateMetadata = ({ params }: PageProps<'/[lang]/contact'>) =>
  pageMeta(params, '/contact', (l) => {
    const t = getDictionary(l).pages.contact;
    return { title: t.title, description: t.body };
  });

export default async function ContactPage({ params }: PageProps<'/[lang]/contact'>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const dict = getDictionary(lang);
  const t = dict.pages.contact;
  const { contact: c, visit } = await getSiteContent();

  const rows = [
    { icon: MessageCircle, label: t.whatsapp, value: c.phoneDisplay, href: whatsappHref(c), ltr: true },
    { icon: Phone, label: t.phone, value: c.phoneDisplay, href: `tel:${c.phone}`, ltr: true },
    { icon: Mail, label: t.email, value: c.email, href: `mailto:${c.email}`, ltr: true },
    { icon: AtSign, label: t.instagram, value: c.instagram ? `@${c.instagram}` : '', href: `https://www.instagram.com/${c.instagram}`, ltr: true },
    { icon: AtSign, label: 'TikTok', value: c.tiktok ? `@${c.tiktok}` : '', href: `https://www.tiktok.com/@${c.tiktok}`, ltr: true },
    { icon: AtSign, label: 'Facebook', value: c.facebookUrl ? 'SIMAT' : '', href: c.facebookUrl, ltr: true },
    {
      icon: MapPin,
      label: t.address,
      value: pick(visit.address, lang),
      href: visit.mapsUrl || undefined,
    },
    { icon: Clock, label: '', value: t.hours },
  ].filter((r) => r.value);

  return (
    <div className="mx-auto max-w-3xl px-6 py-14">
      <h1 className="text-4xl font-serif text-noir">{t.title}</h1>
      <p className="mt-3 text-sm text-stone-600">{t.body}</p>
      <ul className="mt-10 grid sm:grid-cols-2 gap-4">
        {rows.map(({ icon: Icon, label, value, href, ltr }) => {
          const body = (
            <>
              <Icon className="w-5 h-5 text-bordeaux shrink-0" strokeWidth={1.3} />
              <span>
                {label && <span className="block text-[11px] uppercase tracking-wider text-stone-500">{label}</span>}
                <span className="text-sm text-noir" dir={ltr ? 'ltr' : undefined}>{value}</span>
              </span>
            </>
          );
          return (
            <li key={value + label}>
              {href ? (
                <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className="flex items-center gap-4 bg-linen border border-linen-border p-5 hover:border-bordeaux/50 transition-colors">
                  {body}
                </a>
              ) : (
                <div className="flex items-center gap-4 bg-linen border border-linen-border p-5">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
