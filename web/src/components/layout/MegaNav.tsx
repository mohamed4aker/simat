'use client';

/**
 * القوائم الرئيسية (Shop · Discover · Collections · About) —
 * كل واحدة بتفتح Mega Menu بمجرد ما الماوس يعدّي عليها، من غير ضغط.
 *
 * عشان الحركة تبقى ناعمة ومتقفلش فجأة:
 *  - بنستنى لحظة صغيرة قبل الفتح (عشان المرور العابر ميفتحش قائمة).
 *  - لو فيه قائمة مفتوحة، التنقّل بين العناوين بيبدّل فوراً.
 *  - بنستنى شوية قبل القفل، فالماوس يلحق ينزل للقائمة.
 *
 * وبالكيبورد: التركيز (Tab) على العنوان بيفتح القائمة، و Esc بيقفلها.
 * كل قائمة مكتوبة في الـ DOM بعد عنوانها مباشرة، فالـ Tab بيدخل جواها.
 */
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { to } from '@/lib/href';
import { productText, shortName } from '@/lib/localize';
import { whatsappLink } from '@/lib/constants';
import { Coffret, Flacon } from '@/components/brand/Flacon';
import type { Product } from '@/lib/types';

type MenuKey = 'shop' | 'discover' | 'collections' | 'about';

const OPEN_DELAY = 90;
const CLOSE_DELAY = 180;

export function MegaNav({ featured }: { featured: Product | null }) {
  const { lang, dict } = useI18n();
  const [open, setOpen] = useState<MenuKey | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const pathname = usePathname();

  const clearTimers = () => {
    clearTimeout(openTimer.current);
    clearTimeout(closeTimer.current);
  };

  const enter = useCallback(
    (key: MenuKey) => {
      clearTimers();
      if (open) setOpen(key);
      else openTimer.current = setTimeout(() => setOpen(key), OPEN_DELAY);
    },
    [open],
  );

  const leave = () => {
    clearTimers();
    closeTimer.current = setTimeout(() => setOpen(null), CLOSE_DELAY);
  };

  const close = () => {
    clearTimers();
    setOpen(null);
  };

  // قفل القائمة عند الانتقال لصفحة تانية أو الضغط على Esc.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(null);
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(null);
      (document.getElementById(`nav-${open}`) as HTMLElement | null)?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => clearTimers, []);

  const items: { key: MenuKey; label: string; href: string }[] = [
    { key: 'shop', label: dict.nav.shop, href: to(lang, '/shop') },
    { key: 'discover', label: dict.nav.discover, href: to(lang, '#scent-finder') },
    { key: 'collections', label: dict.nav.collections, href: to(lang, '/shop?category=signature') },
    { key: 'about', label: dict.nav.about, href: to(lang, '/about') },
  ];

  const panels: Record<MenuKey, React.ReactNode> = {
    shop: <ShopPanel featured={featured} />,
    discover: <DiscoverPanel />,
    collections: <CollectionsPanel />,
    about: <AboutPanel />,
  };

  return (
    <nav aria-label={dict.nav.shop} className="hidden lg:flex items-center gap-8 h-full">
      {items.map((item) => {
        const isOpen = open === item.key;
        return (
          <div
            key={item.key}
            className="h-full flex items-center"
            onPointerEnter={(e) => e.pointerType === 'mouse' && enter(item.key)}
            onPointerLeave={(e) => e.pointerType === 'mouse' && leave()}
            onFocus={() => {
              clearTimers();
              setOpen(item.key);
            }}
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) leave();
            }}
          >
            <Link
              id={`nav-${item.key}`}
              href={item.href}
              aria-expanded={isOpen}
              aria-controls={`mega-${item.key}`}
              onClick={close}
              className={`relative h-full flex items-center gap-1.5 text-[12px] uppercase tracking-widest font-medium transition-colors ${
                isOpen ? 'text-bordeaux' : 'text-noir hover:text-bordeaux'
              }`}
            >
              {item.label}
              <ChevronDown
                className={`w-3 h-3 opacity-60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                strokeWidth={1.5}
              />
              {/* خط صغير تحت العنوان المفتوح */}
              <span
                className={`absolute bottom-0 inset-x-0 h-px bg-bordeaux origin-center transition-transform duration-300 ${
                  isOpen ? 'scale-x-100' : 'scale-x-0'
                }`}
              />
            </Link>

            {/* القائمة نفسها — بتتمركز تحت الهيدر كله (الهيدر هو اللي relative) */}
            <div
              id={`mega-${item.key}`}
              onClick={(e) => (e.target as HTMLElement).closest('a') && close()}
              className={`absolute top-full inset-x-0 z-50 bg-linen-light border-y border-linen-border dropdown-shadow transition-[opacity,transform,visibility] duration-300 ease-[var(--ease-lux)] ${
                isOpen
                  ? 'opacity-100 translate-y-0 visible'
                  : 'opacity-0 -translate-y-1 invisible pointer-events-none'
              }`}
            >
              <div className="max-w-7xl mx-auto px-6 py-10">{panels[item.key]}</div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

// ── محتوى القوائم ─────────────────────────────────────────────

function ColumnTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-[11px] uppercase tracking-wider text-bordeaux font-serif font-bold mb-4 border-b border-linen-border pb-2">
      {children}
    </h4>
  );
}

function MenuLink({ href, children, sub }: { href: string; children: React.ReactNode; sub?: string }) {
  return (
    <li>
      <Link href={href} className="group/link block text-xs tracking-wide text-stone-700 hover:text-bordeaux transition-colors">
        <span className="inline-flex items-center gap-1">
          {children}
          <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all rtl:-scale-x-100" />
        </span>
        {sub && <span className="block text-[11px] text-stone-500 mt-0.5 normal-case">{sub}</span>}
      </Link>
    </li>
  );
}

function ShopPanel({ featured }: { featured: Product | null }) {
  const { lang, dict } = useI18n();
  const t = dict.mega.shop;
  const text = featured ? productText(featured, lang) : null;
  return (
    <div className="grid grid-cols-4 gap-10">
      <div>
        <ColumnTitle>{t.byCategory}</ColumnTitle>
        <ul className="space-y-3">
          <MenuLink href={to(lang, '/shop')}>{t.all}</MenuLink>
          <MenuLink href={to(lang, '/shop?gender=women')}>{t.women}</MenuLink>
          <MenuLink href={to(lang, '/shop?gender=men')}>{t.men}</MenuLink>
          <MenuLink href={to(lang, '/shop?gender=unisex')}>{t.unisex}</MenuLink>
        </ul>
      </div>
      <div>
        <ColumnTitle>{t.byCollection}</ColumnTitle>
        <ul className="space-y-3">
          <MenuLink href={to(lang, '/shop?sort=best-selling')}>{t.bestSellers}</MenuLink>
          <MenuLink href={to(lang, '/product/discovery-set')}>{t.discoverySets}</MenuLink>
          <MenuLink href={to(lang, '#layering')}>{t.duos}</MenuLink>
          <MenuLink href={to(lang, '/shop?category=discovery')}>{t.travel}</MenuLink>
        </ul>
      </div>
      <div>
        <ColumnTitle>{t.byFamily}</ColumnTitle>
        <ul className="space-y-3">
          {(['amber', 'woody', 'floral', 'fresh', 'gourmand'] as const).map((f) => (
            <MenuLink key={f} href={to(lang, `/shop?family=${f}`)}>{dict.shop.families[f]}</MenuLink>
          ))}
        </ul>
      </div>
      {featured && text && (
        <Link
          href={to(lang, `/product/${featured.slug}`)}
          className="group/card bg-linen p-5 border border-linen-border flex gap-4 items-center hover:border-bordeaux/40 transition-colors"
        >
          <div className="w-24 aspect-[3/4] bg-gradient-to-b from-[#ece5da] to-[#dfd6c7] border border-linen-border flex items-center justify-center overflow-hidden shrink-0">
            <div className="scale-[0.55] group-hover/card:scale-[0.6] transition-transform duration-500">
              <Flacon
                labelStyle={featured.labelStyle}
                name={shortName(featured)}
                concentration={dict.concentrationShort[featured.concentration]}
                size="sm"
              />
            </div>
          </div>
          <div className="min-w-0">
            <span className="text-[9px] uppercase tracking-wider text-bordeaux font-serif block mb-1 font-bold">
              {t.featuredLabel}
            </span>
            <h5 className="text-sm font-serif text-noir font-bold">{shortName(featured)}</h5>
            <p className="text-[11px] text-stone-600 mt-1 line-clamp-2">{featured.secondaryLine}</p>
            <span className="mt-3 inline-block text-[10px] uppercase tracking-wider text-bordeaux group-hover/card:underline font-medium">
              {t.featuredCta}
            </span>
          </div>
        </Link>
      )}
    </div>
  );
}

function DiscoverPanel() {
  const { lang, dict } = useI18n();
  const t = dict.mega.discover;
  return (
    <div className="grid grid-cols-12 gap-10 items-start">
      <div className="col-span-8">
        <ColumnTitle>{t.title}</ColumnTitle>
        <ul className="grid grid-cols-2 gap-x-10 gap-y-6">
          <MenuLink href={to(lang, '#scent-finder')} sub={t.finderSub}>{t.finder}</MenuLink>
          <MenuLink href={to(lang, '#layering')} sub={t.layeringSub}>{t.layering}</MenuLink>
          <MenuLink href={to(lang, '#discovery-set')} sub={t.tryAtHomeSub}>{t.tryAtHome}</MenuLink>
          <MenuLink href={to(lang, '/about')} sub={t.storySub}>{t.story}</MenuLink>
        </ul>
      </div>
      <Link
        href={to(lang, '#scent-finder')}
        className="col-span-4 group/card bg-noir text-linen-light p-6 border border-stone-800 block hover:bg-noir-soft transition-colors"
      >
        <span className="text-[10px] uppercase tracking-wider text-gold font-serif font-bold">{t.cardEyebrow}</span>
        <h5 className="mt-2 text-lg font-serif">{t.cardTitle}</h5>
        <p className="mt-2 text-xs text-stone-400 leading-relaxed">{t.cardBody}</p>
        <div className="mt-4 flex gap-1.5" aria-hidden="true">
          {[1, 2, 3, 4].map((n) => (
            <span key={n} className={`h-1 w-8 ${n === 1 ? 'bg-gold' : 'bg-stone-700'} group-hover/card:bg-gold transition-colors`} style={{ transitionDelay: `${n * 70}ms` }} />
          ))}
        </div>
        <span className="mt-4 inline-block text-[11px] uppercase tracking-wider text-gold group-hover/card:underline">{t.cardCta}</span>
      </Link>
    </div>
  );
}

function CollectionsPanel() {
  const { lang, dict } = useI18n();
  const t = dict.mega.collections;
  const cards = [
    {
      href: to(lang, '/shop?category=signature'),
      title: t.signature,
      sub: t.signatureSub,
      art: (
        <div className="flex items-end gap-2 scale-[0.6]">
          <Flacon labelStyle="bordeaux" name="Nocturne" concentration="EDP" size="sm" />
          <Flacon labelStyle="linen" name="Imprint" concentration="EDP" size="sm" />
        </div>
      ),
      tone: 'from-[#f2ece1] to-[#e5ddd0]',
    },
    {
      href: to(lang, '/product/discovery-set'),
      title: t.discovery,
      sub: t.discoverySub,
      art: <div className="scale-[0.75]"><Coffret size="sm" /></div>,
      tone: 'from-[#ece5da] to-[#dfd6c7]',
    },
    {
      href: to(lang, '#layering'),
      title: t.duos,
      sub: t.duosSub,
      art: (
        <div className="flex items-end -space-x-4 scale-[0.6]">
          <Flacon labelStyle="noir" name="Clarity" concentration="EDP" size="sm" />
          <Flacon labelStyle="velvet" name="Soma" concentration="EDP" size="sm" />
        </div>
      ),
      tone: 'from-[#efe9df] to-[#e2d8c9]',
    },
  ];
  return (
    <div>
      <ColumnTitle>{t.title}</ColumnTitle>
      <div className="grid grid-cols-3 gap-6">
        {cards.map((c) => (
          <Link key={c.title} href={c.href} className="group/card border border-linen-border bg-linen hover:border-bordeaux/40 transition-colors">
            <div className={`h-36 bg-gradient-to-b ${c.tone} flex items-center justify-center overflow-hidden`}>
              <div className="transition-transform duration-700 ease-[var(--ease-lux)] group-hover/card:scale-105">{c.art}</div>
            </div>
            <div className="p-4 flex items-end justify-between gap-3">
              <div>
                <h5 className="text-sm font-serif text-noir font-bold">{c.title}</h5>
                <p className="text-[11px] text-stone-500 mt-0.5">{c.sub}</p>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-bordeaux whitespace-nowrap group-hover/card:underline">{t.explore}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function AboutPanel() {
  const { lang, dict } = useI18n();
  const t = dict.mega.about;
  return (
    <div className="grid grid-cols-12 gap-10 items-start">
      <div className="col-span-8">
        <ColumnTitle>{t.title}</ColumnTitle>
        <ul className="grid grid-cols-2 gap-x-10 gap-y-3.5">
          <MenuLink href={to(lang, '/about')}>{t.story}</MenuLink>
          <MenuLink href={to(lang, '/shipping')}>{t.shipping}</MenuLink>
          <MenuLink href={to(lang, '/shipping#returns')}>{t.returns}</MenuLink>
          <MenuLink href={to(lang, '/faq')}>{t.faq}</MenuLink>
          <MenuLink href={to(lang, '/track')}>{t.track}</MenuLink>
          <MenuLink href={to(lang, '/contact')}>{t.contact}</MenuLink>
        </ul>
      </div>
      <a
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="col-span-4 group/card bg-linen p-6 border border-linen-border block hover:border-bordeaux/40 transition-colors"
      >
        <span className="text-[10px] uppercase tracking-wider text-bordeaux font-serif font-bold">{t.cardEyebrow}</span>
        <p className="mt-2 text-xs text-stone-600 leading-relaxed">{t.cardBody}</p>
        <span className="mt-4 inline-block text-[11px] uppercase tracking-wider text-bordeaux group-hover/card:underline">{t.cardCta}</span>
      </a>
    </div>
  );
}
