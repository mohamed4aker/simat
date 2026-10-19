import { Star } from 'lucide-react';
import { getDictionary, type Locale } from '@/i18n';
import { testimonials } from '@/lib/testimonials';
import { SectionTitle } from '@/components/ui/store';

/** آراء العملاء — بيظهر بس لما يبقى فيه آراء حقيقية في src/lib/testimonials.ts. */
export function Testimonials({ lang }: { lang: Locale }) {
  if (testimonials.length === 0) return null;
  const t = getDictionary(lang).testimonials;
  return (
    <section className="max-w-7xl mx-auto px-6">
      <div className="mb-10">
        <SectionTitle center eyebrow={t.eyebrow} title={t.title} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.slice(0, 6).map((r) => (
          <figure key={r.name + r.text.ar} className="bg-linen border border-linen-border p-6 space-y-4">
            <div className="flex gap-0.5 text-gold" aria-label={`${r.rating}/5`}>
              {Array.from({ length: 5 }, (_, i) => (
                <Star key={i} className="w-4 h-4" fill={i < r.rating ? 'currentColor' : 'none'} strokeWidth={1.4} />
              ))}
            </div>
            <blockquote className="text-sm text-stone-700 leading-relaxed">
              «{lang === 'en' && r.text.en ? r.text.en : r.text.ar}»
            </blockquote>
            <figcaption className="text-xs font-medium text-noir">
              {r.name}
              {r.product && <span className="latin text-stone-500 uppercase ms-2">· {r.product}</span>}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
