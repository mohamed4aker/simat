import { ChevronDown } from 'lucide-react';
import { fill, getDictionary, type Locale } from '@/i18n';
import { pick, whatsappHref } from '@/lib/site-content';
import { getSiteContent } from '@/lib/site-content.server';
import { Eyebrow } from '@/components/ui/store';

/**
 * الأسئلة الشائعة (بتتعدل من لوحة التحكم ← تصميم الموقع). بتتعرض في الرئيسية وصفحة المنتج وصفحة FAQ،
 * ومعاها بيانات FAQPage لجوجل.
 */
export async function Faq({
  lang,
  variant = 'section',
  headingLevel = 'h2',
}: {
  lang: Locale;
  variant?: 'section' | 'compact';
  headingLevel?: 'h1' | 'h2';
}) {
  const t = getDictionary(lang).faq;
  const { faq, contact } = await getSiteContent();
  const items = faq
    .map((i) => ({ topic: pick(i.topic, lang), q: pick(i.q, lang), a: fill(pick(i.a, lang), { email: contact.email }) }))
    .filter((i) => i.q && i.a);
  if (items.length === 0) return null;
  const compact = variant === 'compact';
  const Heading = headingLevel;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((i) => ({
      '@type': 'Question',
      name: i.q,
      acceptedAnswer: { '@type': 'Answer', text: i.a },
    })),
  };

  return (
    <section id="faq" className={compact ? '' : 'max-w-4xl mx-auto px-6'}>
      <div className={compact ? 'mb-4' : 'text-center mb-10'}>
        <Eyebrow className={compact ? '!text-[10px] !tracking-wider mb-1' : 'mb-2'}>{t.eyebrow}</Eyebrow>
        <Heading className={compact ? 'text-base font-serif text-noir font-bold' : 'text-3xl sm:text-4xl font-serif text-noir'}>
          {t.title}
        </Heading>
        {!compact && <p className="mt-3 text-xs sm:text-sm text-stone-600">{t.subtitle}</p>}
      </div>

      <div className={compact ? 'space-y-2' : 'space-y-3'}>
        {items.map((item, i) => (
          <details
            key={i}
            className={`group border border-linen-border ${compact ? 'bg-linen-light p-3.5' : 'bg-linen p-5'} open:border-bordeaux/40 transition-colors`}
            open={!compact && i === 0}
          >
            <summary className="flex justify-between items-center gap-4 cursor-pointer">
              <span className="flex flex-col gap-1">
                {!compact && (
                  <span className="text-[10px] uppercase tracking-wider text-bordeaux font-serif font-bold">{item.topic}</span>
                )}
                <span className={`${compact ? 'text-xs' : 'text-sm'} font-medium text-noir`}>{item.q}</span>
              </span>
              <ChevronDown className="chevron w-4 h-4 text-stone-400 transition-transform duration-300 shrink-0" strokeWidth={1.5} />
            </summary>
            <p className={`${compact ? 'text-[11px]' : 'text-xs sm:text-sm'} text-stone-600 mt-3 leading-relaxed`}>{item.a}</p>
          </details>
        ))}
      </div>

      {!compact && (
        <p className="mt-8 text-center">
          <a href={whatsappHref(contact)} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-wider text-bordeaux hover:underline font-medium">
            {t.more}
          </a>
        </p>
      )}

      {!compact && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
    </section>
  );
}
