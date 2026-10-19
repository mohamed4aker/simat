'use client';

import Image from 'next/image';
import { useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';

/**
 * صور صفحة المنتج: صورة كبيرة + صور صغيرة تحتها + أسهم،
 * وسحب بالصباع في الموبايل. لو مفيش صور بيعرض `fallback` (الرسمة).
 */
export function ProductGallery({
  images,
  alt,
  fallback,
}: {
  images: string[];
  alt: string;
  fallback: ReactNode;
}) {
  const { lang, dict } = useI18n();
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const count = images.length;
  const go = (i: number) => setIndex(((i % count) + count) % count);
  const rtl = lang === 'ar';
  const StartIcon = rtl ? ChevronRight : ChevronLeft;
  const EndIcon = rtl ? ChevronLeft : ChevronRight;

  if (count === 0) {
    return (
      <div className="relative aspect-[4/5] bg-gradient-to-b from-[#f2ece1] via-[#ece5d9] to-[#dfd6c7] border border-linen-border flex items-center justify-center shadow-xl overflow-hidden">
        {fallback}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-[4/5] bg-white border border-linen-border overflow-hidden shadow-xl"
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          touchX.current = null;
          if (Math.abs(dx) < 40) return;
          if (dx < 0 !== rtl) go(index + 1);
          else go(index - 1);
        }}
      >
        {images.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt={`${alt} ${i + 1}`}
            fill
            unoptimized
            priority={i === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className={`object-cover transition-opacity duration-500 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label={dict.hero.prev}
              className="absolute start-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-bordeaux shadow flex items-center justify-center"
            >
              <StartIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label={dict.hero.next}
              className="absolute end-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/85 hover:bg-white text-bordeaux shadow flex items-center justify-center"
            >
              <EndIcon className="w-5 h-5" />
            </button>
            <span dir="ltr" className="latin absolute bottom-3 end-3 bg-noir/60 text-white text-[11px] px-2 py-0.5 rounded-full">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`${alt} ${i + 1}`}
              aria-current={i === index}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 overflow-hidden border-2 transition-colors ${
                i === index ? 'border-bordeaux' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={src} alt="" fill unoptimized sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
