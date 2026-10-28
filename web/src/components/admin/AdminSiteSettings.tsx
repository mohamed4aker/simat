'use client';

import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { ArrowDown, ArrowUp, Check, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { browserSupabase } from '@/lib/supabase-browser';
import { refreshSiteNow } from '@/lib/upload';
import { SHIPPING_RATES } from '@/lib/constants';
import type { HomeSlide } from '@/lib/home-slides';
import {
  CATEGORY_KEYS,
  parseSiteContent,
  SITE_CONTENT_KEY,
  type Bi,
  type FaqItem,
  type SiteContent,
} from '@/lib/site-content';
import { ImageField } from './ImageField';
import { adminInput } from './ui';

type Shipping = { freeThreshold: string; rates: Record<string, string> };

const TABS = [
  { key: 'slider', label: 'السلايدر' },
  { key: 'categories', label: 'الفئات' },
  { key: 'announcement', label: 'شريط الإعلان' },
  { key: 'story', label: 'قصتنا' },
  { key: 'faq', label: 'الأسئلة الشائعة' },
  { key: 'visit', label: 'زورنا في المحل' },
  { key: 'contact', label: 'التواصل' },
  { key: 'shipping', label: 'الشحن' },
] as const;
type Tab = (typeof TABS)[number]['key'];

const CATEGORY_LABEL = { women: 'نسائي', men: 'رجالي', unisex: 'للجنسين' } as const;

const LINK_PRESETS = [
  { label: 'عطور نسائي', href: '/shop?gender=women' },
  { label: 'عطور رجالي', href: '/shop?gender=men' },
  { label: 'عطور للجنسين', href: '/shop?gender=unisex' },
  { label: 'كل العطور', href: '/shop' },
  { label: 'اكتشف عطرك', href: '/find-your-scent' },
];

const emptyBi = (): Bi => ({ ar: '', en: '' });
const newSlide = (): HomeSlide => ({
  image: '',
  href: '/shop',
  eyebrow: emptyBi(),
  title: emptyBi(),
  body: emptyBi(),
});

function move<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/** صفحة «تصميم الموقع»: كل المحتوى اللي بيظهر في الموقع غير المنتجات. */
export function AdminSiteSettings() {
  const { data, mutate } = useSWR(
    'admin-site-settings',
    async () => {
      const db = browserSupabase();
      const [settings, rates] = await Promise.all([
        db.from('settings').select('key, value').in('key', [SITE_CONTENT_KEY, 'free_shipping_threshold']),
        db.from('shipping_rates').select('governorate, price'),
      ]);
      if (settings.error || rates.error) throw new Error('load');
      const byKey = Object.fromEntries((settings.data ?? []).map((r) => [r.key, r.value as string]));
      const shipping: Shipping = {
        freeThreshold: byKey.free_shipping_threshold ?? '1500',
        rates: Object.fromEntries(Object.entries(SHIPPING_RATES).map(([g, p]) => [g, String(p)])),
      };
      for (const r of rates.data ?? []) shipping.rates[String(r.governorate)] = String(r.price);
      return { content: parseSiteContent(byKey[SITE_CONTENT_KEY]), shipping };
    },
    { revalidateOnFocus: false },
  );

  const [tab, setTab] = useState<Tab>('slider');
  const [content, setContent] = useState<SiteContent | null>(null);
  const [shipping, setShipping] = useState<Shipping | null>(null);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState('');

  // أول ما البيانات توصل بنحطها في الفورم (مرة واحدة).
  if (data && !content) {
    setContent(data.content);
    setShipping(data.shipping);
  }

  // تنبيه لو حد قفل الصفحة من غير ما يحفظ.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (!content || !shipping) {
    return <div className="h-96 animate-pulse rounded-2xl bg-sand/40" />;
  }

  const edit = (fn: (draft: SiteContent) => void) => {
    const next = structuredClone(content);
    fn(next);
    setContent(next);
    setDirty(true);
    setStatus('idle');
  };
  const editShipping = (fn: (draft: Shipping) => void) => {
    const next = structuredClone(shipping);
    fn(next);
    setShipping(next);
    setDirty(true);
    setStatus('idle');
  };

  async function save() {
    if (!content || !shipping) return;
    setError('');
    const free = Number(shipping.freeThreshold);
    if (!Number.isFinite(free) || free < 0) {
      setTab('shipping');
      setError('حد الشحن المجاني لازم يكون رقم');
      return;
    }
    const rates = Object.entries(shipping.rates).map(([governorate, p]) => ({ governorate, price: Number(p) }));
    const badRate = rates.find((r) => !Number.isFinite(r.price) || r.price < 0);
    if (badRate) {
      setTab('shipping');
      setError(`سعر الشحن لـ ${badRate.governorate} لازم يكون رقم`);
      return;
    }

    // البانر بيتحفظ بس لو فيه صورة (والموبايل بياخد صورة الكمبيوتر لو فاضي).
    const clean = structuredClone(content);
    clean.slides = clean.slides.map((s) => {
      const desktop = s.banner?.desktop.trim() || s.banner?.mobile.trim() || '';
      const mobile = s.banner?.mobile.trim() || desktop;
      const { banner: _drop, ...rest } = s;
      void _drop;
      return desktop ? { ...rest, banner: { desktop, mobile } } : rest;
    });

    setStatus('saving');
    const db = browserSupabase();
    const results = await Promise.all([
      db.from('settings').upsert([
        { key: SITE_CONTENT_KEY, value: JSON.stringify(clean) },
        { key: 'free_shipping_threshold', value: String(free) },
      ]),
      db.from('shipping_rates').upsert(rates),
    ]);
    if (results.some((r) => r.error)) {
      setStatus('error');
      setError('مش قادرين نحفظ — اتأكد إنك داخل بحساب الأدمن وجرّب تاني');
      return;
    }
    await refreshSiteNow();
    setContent(clean);
    setDirty(false);
    setStatus('saved');
    mutate();
  }

  return (
    <div className="max-w-4xl space-y-5 pb-24">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">تصميم الموقع</h1>
          <p className="mt-1 text-sm text-muted">
            الصور والنصوص وبيانات التواصل والشحن. اكتب بالعربي والإنجليزي — لو سبت الإنجليزي فاضي بيظهر العربي.
          </p>
        </div>
        <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-wine">
          افتح الموقع <ExternalLink size={15} />
        </a>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tab === t.key ? 'bg-wine text-white' : 'border border-line bg-surface text-muted hover:text-wine'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'slider' && (
        <Section
          title="السلايدر (أول الصفحة الرئيسية)"
          hint="كل سلايد ليه صورة وكلام ولينك. لو عايز بانرات بعرض الصفحة كلها: حط «بانر الكمبيوتر» (1920 × 800) و«بانر الموبايل» (1080 × 1350) لكل السلايدات — ولو سلايد واحد ناقصه بانر، كلهم بيظهروا بالشكل العادي (صورة مربعة 1600 × 1600 والكلام جنبها)."
        >
          {content.slides.map((s, i) => (
            <ItemCard
              key={i}
              title={`سلايد ${i + 1}`}
              onUp={i > 0 ? () => edit((d) => void (d.slides = move(d.slides, i, i - 1))) : undefined}
              onDown={i < content.slides.length - 1 ? () => edit((d) => void (d.slides = move(d.slides, i, i + 1))) : undefined}
              onRemove={content.slides.length > 1 ? () => edit((d) => void d.slides.splice(i, 1)) : undefined}
            >
              <div className="grid sm:grid-cols-3 gap-4">
                <ImageField
                  label="الصورة (مربعة)"
                  folder="slides"
                  value={s.image}
                  onChange={(v) => edit((d) => void (d.slides[i].image = v))}
                />
                <ImageField
                  label="بانر الكمبيوتر (اختياري)"
                  folder="slides"
                  aspect="aspect-[12/5]"
                  value={s.banner?.desktop ?? ''}
                  onChange={(v) => edit((d) => void (d.slides[i].banner = { desktop: v, mobile: d.slides[i].banner?.mobile ?? '' }))}
                />
                <ImageField
                  label="بانر الموبايل (اختياري)"
                  folder="slides"
                  aspect="aspect-[4/5]"
                  value={s.banner?.mobile ?? ''}
                  onChange={(v) => edit((d) => void (d.slides[i].banner = { desktop: d.slides[i].banner?.desktop ?? '', mobile: v }))}
                />
              </div>
              <LinkField value={s.href} onChange={(v) => edit((d) => void (d.slides[i].href = v))} />
              <BiField label="سطر صغير فوق العنوان" value={s.eyebrow} onChange={(v) => edit((d) => void (d.slides[i].eyebrow = v))} />
              <BiField label="العنوان" value={s.title} onChange={(v) => edit((d) => void (d.slides[i].title = v))} />
              <BiField label="الوصف" value={s.body} onChange={(v) => edit((d) => void (d.slides[i].body = v))} multiline />
            </ItemCard>
          ))}
          <AddButton label="ضيف سلايد" onClick={() => edit((d) => void d.slides.push(newSlide()))} />
        </Section>
      )}

      {tab === 'categories' && (
        <Section title="تسوق حسب الفئة" hint="التلات صور اللي تحت السلايدر. أحسن مقاس: 900 × 1200 (طولي).">
          {CATEGORY_KEYS.map((key) => (
            <ItemCard key={key} title={CATEGORY_LABEL[key]}>
              <ImageField
                label="الصورة"
                folder="categories"
                aspect="aspect-[3/4]"
                value={content.categories[key].image}
                onChange={(v) => edit((d) => void (d.categories[key].image = v))}
              />
              <BiField label="الاسم" value={content.categories[key].title} onChange={(v) => edit((d) => void (d.categories[key].title = v))} />
            </ItemCard>
          ))}
        </Section>
      )}

      {tab === 'announcement' && (
        <Section title="شريط الإعلان (أعلى الموقع)" hint="اكتب {amount} مكان رقم الشحن المجاني وهيتحط لوحده من إعدادات الشحن. سيبه فاضي عشان الشريط يختفي.">
          <BiField
            label="الجملة"
            value={content.announcement}
            onChange={(v) => edit((d) => void (d.announcement = v))}
          />
        </Section>
      )}

      {tab === 'story' && (
        <Section title="قصتنا" hint="بتظهر في الصفحة الرئيسية وفي صفحة «قصتنا».">
          <ImageField label="الصورة" folder="story" value={content.story.image} onChange={(v) => edit((d) => void (d.story.image = v))} />
          <BiField label="سطر صغير فوق العنوان" value={content.story.eyebrow} onChange={(v) => edit((d) => void (d.story.eyebrow = v))} />
          <BiField label="العنوان / الجملة" value={content.story.quote} onChange={(v) => edit((d) => void (d.story.quote = v))} multiline />
          <BiField label="النص" value={content.story.body} onChange={(v) => edit((d) => void (d.story.body = v))} multiline rows={6} />
          {content.story.points.map((p, i) => (
            <BiField key={i} label={`نقطة ${i + 1}`} value={p} onChange={(v) => edit((d) => void (d.story.points[i] = v))} />
          ))}
        </Section>
      )}

      {tab === 'faq' && (
        <Section title="الأسئلة الشائعة" hint="بتظهر في الرئيسية وصفحة المنتج وصفحة الأسئلة. اكتب {email} مكان الإيميل وهيتحط لوحده.">
          {content.faq.map((item, i) => (
            <ItemCard
              key={i}
              title={`سؤال ${i + 1}`}
              onUp={i > 0 ? () => edit((d) => void (d.faq = move(d.faq, i, i - 1))) : undefined}
              onDown={i < content.faq.length - 1 ? () => edit((d) => void (d.faq = move(d.faq, i, i + 1))) : undefined}
              onRemove={() => edit((d) => void d.faq.splice(i, 1))}
            >
              <BiField label="الموضوع (كلمة صغيرة)" value={item.topic} onChange={(v) => edit((d) => void (d.faq[i].topic = v))} />
              <BiField label="السؤال" value={item.q} onChange={(v) => edit((d) => void (d.faq[i].q = v))} />
              <BiField label="الإجابة" value={item.a} onChange={(v) => edit((d) => void (d.faq[i].a = v))} multiline rows={4} />
            </ItemCard>
          ))}
          <AddButton
            label="ضيف سؤال"
            onClick={() => edit((d) => void d.faq.push({ topic: emptyBi(), q: emptyBi(), a: emptyBi() } satisfies FaqItem))}
          />
        </Section>
      )}

      {tab === 'visit' && (
        <Section title="زورنا في المحل" hint="القسم اللي فوق الفوتر في الرئيسية.">
          <label className="flex items-center gap-2.5 text-sm font-semibold">
            <input
              type="checkbox"
              checked={content.visit.show}
              onChange={(e) => edit((d) => void (d.visit.show = e.target.checked))}
              className="w-4 h-4 accent-wine"
            />
            اعرض القسم ده في الموقع
          </label>
          <ImageField label="صورة المحل" folder="store" aspect="aspect-[4/3]" value={content.visit.image} onChange={(v) => edit((d) => void (d.visit.image = v))} />
          <TextField label="لينك اللوكيشن (Google Maps)" value={content.visit.mapsUrl} onChange={(v) => edit((d) => void (d.visit.mapsUrl = v))} ltr />
          <BiField label="العنوان" value={content.visit.address} onChange={(v) => edit((d) => void (d.visit.address = v))} multiline />
          <BiField label="سطر صغير فوق العنوان" value={content.visit.eyebrow} onChange={(v) => edit((d) => void (d.visit.eyebrow = v))} />
          <BiField label="العنوان الكبير" value={content.visit.title} onChange={(v) => edit((d) => void (d.visit.title = v))} />
          <BiField label="النص" value={content.visit.body} onChange={(v) => edit((d) => void (d.visit.body = v))} multiline />
          <BiField label="الدايرة اللي على الصورة" value={content.visit.badge} onChange={(v) => edit((d) => void (d.visit.badge = v))} />
        </Section>
      )}

      {tab === 'contact' && (
        <Section title="بيانات التواصل" hint="بتظهر في الفوتر وصفحة «تواصل معنا» وزراير الواتساب.">
          <div className="grid sm:grid-cols-2 gap-4">
            <TextField label="رقم التليفون" value={content.contact.phone} onChange={(v) => edit((d) => void (d.contact.phone = v))} ltr placeholder="01273162855" />
            <TextField label="الرقم زي ما بيظهر للناس" value={content.contact.phoneDisplay} onChange={(v) => edit((d) => void (d.contact.phoneDisplay = v))} ltr placeholder="+20 12 73162855" />
            <TextField label="رقم الواتساب (بالكود الدولي من غير +)" value={content.contact.whatsapp} onChange={(v) => edit((d) => void (d.contact.whatsapp = v))} ltr placeholder="201273162855" />
            <TextField label="الإيميل" value={content.contact.email} onChange={(v) => edit((d) => void (d.contact.email = v))} ltr />
            <TextField label="Instagram (اسم الحساب بس)" value={content.contact.instagram} onChange={(v) => edit((d) => void (d.contact.instagram = v.replace(/^@/, '')))} ltr placeholder="simatt_eg" />
            <TextField label="TikTok (اسم الحساب بس)" value={content.contact.tiktok} onChange={(v) => edit((d) => void (d.contact.tiktok = v.replace(/^@/, '')))} ltr placeholder="simatt.eg" />
            <TextField label="لينك Facebook" value={content.contact.facebookUrl} onChange={(v) => edit((d) => void (d.contact.facebookUrl = v))} ltr />
          </div>
        </Section>
      )}

      {tab === 'shipping' && (
        <Section title="الشحن" hint="الأسعار دي هي اللي بتتحسب فعلاً في الطلب. الطلب اللي قيمته (قبل الخصم) توصل لحد الشحن المجاني شحنه ببلاش.">
          <TextField
            label="حد الشحن المجاني (ج.م)"
            value={shipping.freeThreshold}
            onChange={(v) => editShipping((d) => void (d.freeThreshold = v))}
            ltr
            inputMode="numeric"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.keys(shipping.rates).map((g) => (
              <TextField
                key={g}
                label={g}
                value={shipping.rates[g]}
                onChange={(v) => editShipping((d) => void (d.rates[g] = v))}
                ltr
                inputMode="numeric"
              />
            ))}
          </div>
        </Section>
      )}

      {/* زرار الحفظ ثابت تحت */}
      <div className="fixed bottom-0 inset-x-0 md:start-60 z-30 border-t border-line bg-surface/95 backdrop-blur px-4 py-3">
        <div className="max-w-4xl flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={save}
            disabled={status === 'saving' || !dirty}
            className="rounded-xl bg-wine px-8 py-3 font-bold text-white disabled:opacity-50"
          >
            {status === 'saving' ? 'بيتحفظ…' : 'احفظ التعديلات'}
          </button>
          {status === 'saved' && !dirty && (
            <span className="inline-flex items-center gap-1.5 text-sm font-bold text-ok">
              <Check size={16} /> اتحفظ وظهر على الموقع
            </span>
          )}
          {dirty && status !== 'saving' && <span className="text-xs text-warn font-bold">فيه تعديلات لسه متحفظتش</span>}
          {error && <span className="text-sm font-bold text-bad">{error}</span>}
        </div>
      </div>
    </div>
  );
}

// ── أجزاء الفورم ─────────────────────────────────────────────

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface p-5 space-y-4">
      <div>
        <h2 className="font-bold">{title}</h2>
        {hint && <p className="mt-1 text-xs text-muted leading-6">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function ItemCard({
  title,
  onUp,
  onDown,
  onRemove,
  children,
}: {
  title: string;
  onUp?: () => void;
  onDown?: () => void;
  onRemove?: () => void;
  children: React.ReactNode;
}) {
  const icon = 'grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:text-wine disabled:opacity-30';
  return (
    <div className="rounded-xl border border-line bg-white p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-extrabold text-wine">{title}</h3>
        <div className="flex gap-1.5">
          {(onUp || onDown) && (
            <>
              <button type="button" onClick={onUp} disabled={!onUp} className={icon} aria-label="لفوق"><ArrowUp size={15} /></button>
              <button type="button" onClick={onDown} disabled={!onDown} className={icon} aria-label="لتحت"><ArrowDown size={15} /></button>
            </>
          )}
          {onRemove && (
            <button
              type="button"
              onClick={() => confirm(`متأكد إنك عايز تمسح «${title}»؟`) && onRemove()}
              className={`${icon} hover:!text-bad`}
              aria-label="امسح"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-line py-3 text-sm font-bold text-wine hover:border-wine"
    >
      <Plus size={16} /> {label}
    </button>
  );
}

function TextField({
  label,
  value,
  onChange,
  ltr,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  ltr?: boolean;
  placeholder?: string;
  inputMode?: 'numeric';
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-muted">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={ltr ? 'ltr' : undefined}
        placeholder={placeholder}
        inputMode={inputMode}
        className={adminInput}
      />
    </label>
  );
}

function BiField({
  label,
  value,
  onChange,
  multiline,
  rows = 2,
}: {
  label: string;
  value: Bi;
  onChange: (v: Bi) => void;
  multiline?: boolean;
  rows?: number;
}) {
  const box = (lang: 'ar' | 'en') => {
    const props = {
      value: value[lang],
      dir: lang === 'en' ? 'ltr' : 'rtl',
      placeholder: lang === 'en' ? 'English' : 'عربي',
      className: adminInput,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange({ ...value, [lang]: e.target.value }),
    } as const;
    return multiline ? <textarea rows={rows} {...props} /> : <input {...props} />;
  };
  return (
    <div>
      <span className="mb-1.5 block text-xs font-bold text-muted">{label}</span>
      <div className="grid sm:grid-cols-2 gap-2">
        {box('ar')}
        {box('en')}
      </div>
    </div>
  );
}

function LinkField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const preset = LINK_PRESETS.find((p) => p.href === value);
  return (
    <div>
      <span className="mb-1.5 block text-xs font-bold text-muted">زرار SHOP NOW بيودي على</span>
      <div className="grid sm:grid-cols-2 gap-2">
        <select
          value={preset ? preset.href : 'custom'}
          onChange={(e) => e.target.value !== 'custom' && onChange(e.target.value)}
          className={adminInput}
        >
          {LINK_PRESETS.map((p) => (
            <option key={p.href} value={p.href}>{p.label}</option>
          ))}
          <option value="custom">لينك تاني (منتج أو صفحة)</option>
        </select>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir="ltr"
          placeholder="/product/imprint"
          className={adminInput}
        />
      </div>
      <p className="mt-1 text-[11px] text-faint">لمنتج معيّن: /product/ وبعدها اسم العطر بالإنجليزي، مثلاً /product/imprint</p>
    </div>
  );
}
