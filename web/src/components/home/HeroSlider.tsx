'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { to } from '@/lib/href';
import type { HomeSlide } from '@/lib/home-slides';

const INTERVAL = 6000;

/**
 * سلايدر أول الصفحة: صورة + رسالة + زرار SHOP NOW لكل سلايد.
 * بيتقلب لوحده، وبيقف لما الماوس يقف عليه، وبيتسحب بالصباع في الموبايل.
 */
export function HeroSlider({ slides }: { slides: HomeSlide[] }) {
  const { lang, dict } = useI18n();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const count = slides.length;

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    if (paused || count < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setTimeout(next, INTERVAL);
    return () => window.clearTimeout(id);
  }, [index, paused, count, next]);

  // في العربي الاتجاه بيتعكس: السهم اللي على اليمين هو «اللي قبله».
  const rtl = lang === 'ar';
  const StartIcon = rtl ? ChevronRight : ChevronLeft;
  const EndIcon = rtl ? ChevronLeft : ChevronRight;

  return (
    <section
      aria-roledescription="carousel"
      aria-label={dict.hero.sliderLabel}
      className="relative bg-bordeaux-deep overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) < 40) return;
        // السحب لبرّه بيروح للسلايد اللي بعده (عكس الاتجاه في العربي).
        if (dx < 0 !== rtl) next();
        else prev();
      }}
    >
      <div className="relative grid">
        {slides.map((s, i) => {
          const active = i === index;
          return (
            <div
              key={s.href + i}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} / ${count}`}
              aria-hidden={!active}
              className={`col-start-1 row-start-1 grid md:grid-cols-2 transition-opacity duration-700 ease-out ${
                active ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <div className="relative aspect-square md:aspect-auto md:min-h-[540px] lg:min-h-[600px] md:order-2">
                <Image
                  src={s.image}
                  alt={s.title[lang]}
                  fill
                  unoptimized
                  priority={i === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className={`object-cover transition-transform duration-[7000ms] ease-out ${active ? 'scale-105' : 'scale-100'}`}
                />
              </div>
              <div className="relative flex items-center bg-gradient-to-br from-bordeaux-dark via-bordeaux to-bordeaux-light px-6 sm:px-12 lg:px-16 py-12 md:py-16">
                <div className="max-w-md space-y-5">
                  <span className="latin block text-[11px] tracking-[0.3em] uppercase text-gold">{s.eyebrow[lang]}</span>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-linen-light leading-tight">{s.title[lang]}</h2>
                  <p className="text-sm sm:text-base text-linen-light/80 leading-relaxed">{s.body[lang]}</p>
                  <Link
                    href={to(lang, s.href)}
                    tabIndex={active ? 0 : -1}
                    className="latin inline-flex items-center gap-2 bg-linen-light text-bordeaux hover:bg-gold hover:text-noir px-9 py-3.5 text-xs tracking-[0.2em] font-semibold uppercase transition-colors shadow-lg"
                  >
                    SHOP NOW
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label={dict.hero.prev}
            className="absolute z-20 start-3 top-1/2 -translate-y-1/2 hidden md:flex w-11 h-11 items-center justify-center rounded-full bg-linen-light/85 text-bordeaux hover:bg-linen-light shadow"
          >
            <StartIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label={dict.hero.next}
            className="absolute z-20 end-3 top-1/2 -translate-y-1/2 hidden md:flex w-11 h-11 items-center justify-center rounded-full bg-linen-light/85 text-bordeaux hover:bg-linen-light shadow"
          >
            <EndIcon className="w-5 h-5" />
          </button>
          <div className="absolute z-20 bottom-4 inset-x-0 flex justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.href + i}
                type="button"
                onClick={() => go(i)}
                aria-label={`${i + 1}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all ${i === index ? 'w-8 bg-gold' : 'w-3 bg-linen-light/50 hover:bg-linen-light'}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
