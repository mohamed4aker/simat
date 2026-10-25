import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';
import { getDictionary, type Locale } from '@/i18n';
import { STORE_VISIT } from '@/lib/constants';
import { Eyebrow } from '@/components/ui/store';

/**
 * «زورنا في المحل»: صورة المحل + العنوان + زرار يفتح اللوكيشن على Google Maps.
 * بيظهر لما لينك اللوكيشن يتحط في STORE_VISIT (src/lib/constants.ts)، والعنوان لو اتكتب.
 */
export function VisitStore({ lang }: { lang: Locale }) {
  const address = lang === 'en' ? STORE_VISIT.addressEn || STORE_VISIT.addressAr : STORE_VISIT.addressAr || STORE_VISIT.addressEn;
  if (!STORE_VISIT.mapsUrl) return null;
  const t = getDictionary(lang).visit;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 md:grid-cols-5 border border-linen-border overflow-hidden shadow-sm">
        <div className="relative md:col-span-3 aspect-[4/3] md:aspect-auto md:min-h-[460px] bg-bordeaux-deep">
          {STORE_VISIT.image && (
            <Image
              src={STORE_VISIT.image}
              alt={t.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover"
            />
          )}
          <span className="absolute bottom-4 end-4 w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-bordeaux-dark/90 text-linen-light text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide flex items-center justify-center text-center p-3 leading-tight shadow-lg">
            {t.badge}
          </span>
        </div>
        <div className="md:col-span-2 bg-linen flex items-center px-6 sm:px-10 py-10 md:py-12">
          <div className="space-y-5 max-w-sm">
            <Eyebrow>{t.eyebrow}</Eyebrow>
            <h2 className="text-4xl sm:text-5xl font-serif text-noir leading-[1.1]">{t.title}</h2>
            <p className="text-sm text-stone-600 leading-relaxed">{t.body}</p>
            {address && (
              <div>
                <span className="block text-[11px] uppercase tracking-wider text-stone-500 mb-1">{t.findUs}</span>
                <p className="text-base font-semibold text-noir">{address}</p>
              </div>
            )}
            <a
              href={STORE_VISIT.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-between gap-3 bg-bordeaux hover:bg-bordeaux-light text-linen-light px-6 py-4 text-sm font-bold uppercase tracking-wide transition-colors shadow-md"
            >
              {t.cta}
              <ArrowUpRight className="w-5 h-5" strokeWidth={1.8} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
