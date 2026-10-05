'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import useSWR from 'swr';
import { ArrowRight, Save } from 'lucide-react';

import { BottleArt } from '@/components/brand/BottleArt';
import { adminInput } from '@/components/admin/ui';
import { browserSupabase } from '@/lib/supabase-browser';

/** صف التصنيف زي ما بيرجع من قاعدة البيانات. */
interface CategoryRow {
  id: string;
  name: string;
}

interface FormState {
  name: string;
  name_en: string;
  slug: string;
  brand: string;
  category_id: string;
  description: string;
  description_en: string;
  family: string;
  family_en: string;
  kind: string;
  label_style: string;
  secondary_line: string;
  tagline_en: string;
  short_description_en: string;
  scent_character_en: string;
  accords_en: string;
  wear_profile_en: string;
  occasion_en: string;
  related: string;
  price_40: string;
  price_60: string;
  price_100: string;
  image_hover_url: string;
  price: string;
  old_price: string;
  size_ml: string;
  stock: string;
  gender: string;
  concentration: string;
  longevity_hours: string;
  top_notes: string;
  heart_notes: string;
  base_notes: string;
  top_notes_en: string;
  heart_notes_en: string;
  base_notes_en: string;
  image_url: string;
  is_featured: boolean;
  is_active: boolean;
}

const EMPTY: FormState = {
  name: '', name_en: '', slug: '', brand: 'SIMAT', category_id: '',
  description: '', description_en: '', family: '', family_en: '',
  kind: 'bottle', label_style: 'bordeaux', secondary_line: '', tagline_en: '',
  short_description_en: '', scent_character_en: '', accords_en: '', wear_profile_en: '',
  occasion_en: '', related: '', price_40: '450', price_60: '600', price_100: '850',
  image_hover_url: '', price: '', old_price: '', size_ml: '100', stock: '0',
  gender: 'unisex', concentration: 'edp', longevity_hours: '8',
  top_notes: '', heart_notes: '', base_notes: '',
  top_notes_en: '', heart_notes_en: '', base_notes_en: '', image_url: '',
  is_featured: false, is_active: true,
};

/** بيحوّل الاسم العربي لرابط إنجليزي بسيط. */
function toSlug(value: string): string {
  const latin = value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  return latin || `p-${Date.now().toString(36)}`;
}

/** سعر حجم معيّن من عمود variants. */
function variantPrice(row: Record<string, unknown>, size: number): string {
  const list = (row.variants as { size_ml: number; price: number }[] | null) ?? [];
  const found = list.find((v) => Number(v.size_ml) === size);
  return found ? String(found.price) : '';
}

const notesToArray = (v: string) =>
  v.split(/[،,]/).map((s) => s.trim()).filter(Boolean);

/** بيحوّل صف المنتج من قاعدة البيانات لحقول النموذج. */
function rowToForm(
  row: Record<string, unknown> | null,
  categories: CategoryRow[],
): FormState {
  if (!row) return { ...EMPTY, category_id: categories[0]?.id ?? '' };
  return {
    name: String(row.name ?? ''),
    name_en: String(row.name_en ?? ''),
    slug: String(row.slug ?? ''),
    brand: String(row.brand ?? 'SIMAT'),
    category_id: String(row.category_id ?? ''),
    description: String(row.description ?? ''),
    description_en: String(row.description_en ?? ''),
    family: String(row.family ?? ''),
    family_en: String(row.family_en ?? ''),
    kind: String(row.kind ?? 'bottle'),
    label_style: String(row.label_style ?? 'bordeaux'),
    secondary_line: String(row.secondary_line ?? ''),
    tagline_en: String(row.tagline_en ?? ''),
    short_description_en: String(row.short_description_en ?? ''),
    scent_character_en: String(row.scent_character_en ?? ''),
    accords_en: ((row.accords_en as string[]) ?? []).join(', '),
    wear_profile_en: String(row.wear_profile_en ?? ''),
    occasion_en: String(row.occasion_en ?? ''),
    related: ((row.related as string[]) ?? []).join(', '),
    price_40: variantPrice(row, 40),
    price_60: variantPrice(row, 60),
    price_100: variantPrice(row, 100),
    image_hover_url: String(row.image_hover_url ?? ''),
    price: String(row.price ?? ''),
    old_price: row.old_price == null ? '' : String(row.old_price),
    size_ml: String(row.size_ml ?? 100),
    stock: String(row.stock ?? 0),
    gender: String(row.gender ?? 'unisex'),
    concentration: String(row.concentration ?? 'edp'),
    longevity_hours: String(row.longevity_hours ?? 8),
    top_notes: ((row.top_notes as string[]) ?? []).join('، '),
    heart_notes: ((row.heart_notes as string[]) ?? []).join('، '),
    base_notes: ((row.base_notes as string[]) ?? []).join('، '),
    top_notes_en: ((row.top_notes_en as string[]) ?? []).join(', '),
    heart_notes_en: ((row.heart_notes_en as string[]) ?? []).join(', '),
    base_notes_en: ((row.base_notes_en as string[]) ?? []).join(', '),
    image_url: String(row.image_url ?? ''),
    is_featured: Boolean(row.is_featured),
    is_active: row.is_active !== false,
  };
}

export function AdminProductForm({ productId }: { productId: string | null }) {
  const router = useRouter();
  const isNew = productId === null;
  const formKey = productId ?? 'new';

  const [draft, setDraft] = useState<FormState | null>(null);
  const [draftKey, setDraftKey] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data } = useSWR(
    ['admin-product-form', productId],
    async () => {
      const db = browserSupabase();
      const { data: cats } = await db
        .from('categories')
        .select('id, name')
        .order('sort_order');
      const list = (cats ?? []) as CategoryRow[];

      if (isNew) return { categories: list, product: null };

      const { data: row } = await db
        .from('products')
        .select('*')
        .eq('id', productId)
        .maybeSingle();

      return { categories: list, product: row as Record<string, unknown> | null };
    },
    { revalidateOnFocus: false },
  );

  const categories = data?.categories ?? [];

  // أول ما البيانات توصل بنملا النموذج مرة واحدة. ضبط الحالة أثناء
  // الرسم ده هو الأسلوب اللي React نفسها بتوصي بيه بدل useEffect.
  if (data && draftKey !== formKey) {
    setDraftKey(formKey);
    setDraft(rowToForm(data.product, data.categories));
  }

  const form = draft;
  const setForm = setDraft;

  const set =
    (key: keyof FormState) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((f) => (f ? { ...f, [key]: e.target.value } : f));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setError(null);

    const variants = ([40, 60, 100] as const)
      .map((size) => ({ size_ml: size, price: Number(form[`price_${size}`]) }))
      .filter((v) => Number.isFinite(v.price) && v.price > 0);
    const defaultVariant = variants.find((v) => v.size_ml === 60) ?? variants[0];
    const priceValue = defaultVariant ? defaultVariant.price : Number(form.price);
    if (!form.name.trim()) return setError('اكتب اسم المنتج');
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      return setError('السعر لازم يكون رقم أكبر من صفر');
    }
    if (!form.category_id) return setError('اختار التصنيف');

    setSaving(true);
    const db = browserSupabase();

    const payload = {
      name: form.name.trim(),
      name_en: form.name_en.trim(),
      slug: form.slug.trim() || toSlug(form.name_en || form.name),
      brand: form.brand.trim() || 'SIMAT',
      category_id: form.category_id,
      description: form.description.trim(),
      description_en: form.description_en.trim(),
      family: form.family.trim(),
      family_en: form.family_en.trim(),
      kind: form.kind === 'set' ? 'set' : 'bottle',
      label_style: form.label_style,
      secondary_line: form.secondary_line.trim(),
      tagline_en: form.tagline_en.trim(),
      short_description_en: form.short_description_en.trim(),
      scent_character_en: form.scent_character_en.trim(),
      accords_en: notesToArray(form.accords_en),
      wear_profile_en: form.wear_profile_en.trim(),
      occasion_en: form.occasion_en.trim(),
      related: notesToArray(form.related),
      variants,
      image_hover_url: form.image_hover_url.trim() || null,
      price: priceValue,
      old_price: form.old_price.trim() ? Number(form.old_price) : null,
      size_ml: defaultVariant ? defaultVariant.size_ml : Number(form.size_ml) || 100,
      stock: Number(form.stock) || 0,
      gender: form.gender,
      concentration: form.concentration,
      longevity_hours: Number(form.longevity_hours) || 8,
      top_notes: notesToArray(form.top_notes),
      heart_notes: notesToArray(form.heart_notes),
      base_notes: notesToArray(form.base_notes),
      top_notes_en: notesToArray(form.top_notes_en),
      heart_notes_en: notesToArray(form.heart_notes_en),
      base_notes_en: notesToArray(form.base_notes_en),
      image_url: form.image_url.trim() || null,
      is_featured: form.is_featured,
      is_active: form.is_active,
    };

    const { error: saveError } = isNew
      ? await db
          .from('products')
          .insert({ ...payload, id: `p_${Date.now().toString(36)}` })
      : await db.from('products').update(payload).eq('id', productId);

    setSaving(false);

    if (saveError) {
      setError(
        saveError.message.includes('duplicate')
          ? 'الرابط (slug) مستخدم في منتج تاني — غيّره'
          : 'مش قادرين نحفظ المنتج، جرّب تاني',
      );
      return;
    }
    router.push('/admin/products');
    router.refresh();
  }

  if (!form) {
    return <div className="h-96 animate-pulse rounded-2xl bg-sand/40" />;
  }

  return (
    <form onSubmit={save} className="max-w-3xl space-y-5">
      <header className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="rounded-lg p-2 text-muted hover:bg-sand/50"
          aria-label="رجوع"
        >
          <ArrowRight size={20} />
        </Link>
        <h1 className="text-2xl font-extrabold">
          {isNew ? 'منتج جديد' : 'تعديل المنتج'}
        </h1>
      </header>

      <section className="rounded-2xl border border-line bg-surface p-5 space-y-3">
        <h2 className="font-bold mb-1">البيانات الأساسية</h2>

        <Field label="اسم المنتج *">
          <input value={form.name} onChange={set('name')} className={adminInput} required />
        </Field>

        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="الاسم بالإنجليزية">
            <input value={form.name_en} onChange={set('name_en')} dir="ltr" className={adminInput} />
          </Field>
          <Field label="الرابط في الموقع (اختياري)">
            <input
              value={form.slug} onChange={set('slug')} dir="ltr"
              placeholder="هيتولّد تلقائي" className={adminInput}
            />
          </Field>
        </div>

        <Field label="التصنيف *">
          <select value={form.category_id} onChange={set('category_id')} className={adminInput}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </Field>

        <Field label="الوصف (عربي)">
          <textarea value={form.description} onChange={set('description')} rows={4} className={adminInput} />
        </Field>
        <Field label="الوصف (إنجليزي)">
          <textarea value={form.description_en} onChange={set('description_en')} rows={4} dir="ltr" className={adminInput} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="العائلة العطرية (عربي)">
            <input value={form.family} onChange={set('family')} placeholder="زهري شرقي وعود معتق" className={adminInput} />
          </Field>
          <Field label="العائلة العطرية (إنجليزي)">
            <input value={form.family_en} onChange={set('family_en')} dir="ltr" placeholder="Floral Oriental & Aged Oud" className={adminInput} />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 space-y-3">
        <h2 className="font-bold mb-1">محتوى صفحة المنتج</h2>
        <Field label="Secondary Line — السطر الصغير تحت الاسم">
          <input value={form.secondary_line} onChange={set('secondary_line')} dir="ltr" placeholder="Inspired by Black Opium" className={adminInput} />
        </Field>
        <div className="grid sm:grid-cols-2 gap-3" dir="ltr">
          <Field label="Tagline">
            <input value={form.tagline_en} onChange={set('tagline_en')} placeholder="Awaken the night." className={adminInput} />
          </Field>
          <Field label="Short Description">
            <input value={form.short_description_en} onChange={set('short_description_en')} className={adminInput} />
          </Field>
          <Field label="Character — Scent Character">
            <input value={form.scent_character_en} onChange={set('scent_character_en')} placeholder="Seductive, Energetic, Bold" className={adminInput} />
          </Field>
          <Field label="Best for — Occasion">
            <input value={form.occasion_en} onChange={set('occasion_en')} placeholder="Evening wear, Night out" className={adminInput} />
          </Field>
          <Field label="Main Accords">
            <input value={form.accords_en} onChange={set('accords_en')} placeholder="Vanilla, Coffee, Sweet" className={adminInput} />
          </Field>
          <Field label="Layer It With (slugs)">
            <input value={form.related} onChange={set('related')} placeholder="duality, alter, velvet-ego" className={adminInput} />
          </Field>
        </div>
        <Field label="Wear Profile — The Scent">
          <textarea value={form.wear_profile_en} onChange={set('wear_profile_en')} rows={2} dir="ltr" className={adminInput} />
        </Field>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 space-y-3">
        <h2 className="font-bold mb-1">الأحجام والأسعار والمخزون</h2>
        <p className="text-[11px] text-faint">
          سيب سعر الحجم فاضي لو الحجم ده مش متاح. حجم 60 مل هو اللي بيبقى مختار
          افتراضياً في صفحة المنتج.
        </p>
        <div className="grid grid-cols-3 gap-3">
          <Field label="40 مل (ج.م)">
            <input value={form.price_40} onChange={set('price_40')} inputMode="decimal" className={adminInput} />
          </Field>
          <Field label="60 مل (ج.م)">
            <input value={form.price_60} onChange={set('price_60')} inputMode="decimal" className={adminInput} />
          </Field>
          <Field label="100 مل (ج.م)">
            <input value={form.price_100} onChange={set('price_100')} inputMode="decimal" className={adminInput} />
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="السعر (لو المنتج حجم واحد بس)">
            <input value={form.price} onChange={set('price')} inputMode="decimal" className={adminInput} />
          </Field>
          <Field label="الكمية في المخزن">
            <input value={form.stock} onChange={set('stock')} inputMode="numeric" className={adminInput} />
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 space-y-3">
        <h2 className="font-bold mb-1">خصائص العطر</h2>
        <div className="grid sm:grid-cols-3 gap-3">
          <Field label="الفئة">
            <select value={form.gender} onChange={set('gender')} className={adminInput}>
              <option value="men">رجالي</option>
              <option value="women">حريمي</option>
              <option value="unisex">للجنسين</option>
            </select>
          </Field>
          <Field label="التركيز">
            <select value={form.concentration} onChange={set('concentration')} className={adminInput}>
              <option value="parfum">Extrait de Parfum</option>
              <option value="edp">EDP</option>
              <option value="edt">EDT</option>
              <option value="oil">زيت</option>
              <option value="mist">ميست</option>
            </select>
          </Field>
          <Field label="الثبات (ساعات)">
            <input value={form.longevity_hours} onChange={set('longevity_hours')} inputMode="numeric" className={adminInput} />
          </Field>
        </div>
        <Field label="النوتات العليا">
          <input value={form.top_notes} onChange={set('top_notes')} placeholder="برغموت، ليمون، هيل" className={adminInput} />
        </Field>
        <Field label="نوتات القلب">
          <input value={form.heart_notes} onChange={set('heart_notes')} placeholder="ورد، ياسمين" className={adminInput} />
        </Field>
        <Field label="نوتات القاعدة">
          <input value={form.base_notes} onChange={set('base_notes')} placeholder="عنبر، مسك، صندل" className={adminInput} />
        </Field>
        <p className="text-[11px] text-faint">النوتات بالإنجليزي (للنسخة الإنجليزية من الموقع — افصل بينهم بفاصلة):</p>
        <div className="grid sm:grid-cols-3 gap-3" dir="ltr">
          <input value={form.top_notes_en} onChange={set('top_notes_en')} placeholder="Top: Bergamot, Cardamom" className={adminInput} />
          <input value={form.heart_notes_en} onChange={set('heart_notes_en')} placeholder="Heart: Rose, Jasmine" className={adminInput} />
          <input value={form.base_notes_en} onChange={set('base_notes_en')} placeholder="Base: Amber, Musk" className={adminInput} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="نوع المنتج">
            <select value={form.kind} onChange={set('kind')} className={adminInput}>
              <option value="bottle">زجاجة</option>
              <option value="set">طقم عينات</option>
            </select>
          </Field>
          <Field label="لون ملصق الزجاجة (لو مفيش صورة)">
            <select value={form.label_style} onChange={set('label_style')} className={adminInput}>
              <option value="bordeaux">عنابي</option>
              <option value="noir">أسود</option>
              <option value="linen">عاجي</option>
              <option value="velvet">مخملي وذهبي</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 space-y-3">
        <h2 className="font-bold mb-1">الصورة والعرض</h2>
        <div className="flex gap-4 items-start">
          <div className="shrink-0 w-24 h-24 overflow-hidden rounded-xl border border-line">
            {form.image_url.trim() ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.image_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <BottleArt seed={productId ?? 'new'} className="w-full h-full" />
            )}
          </div>
          <div className="flex-1">
            <Field label="رابط الصورة (اختياري)">
              <input
                value={form.image_url} onChange={set('image_url')} dir="ltr"
                placeholder="https://..." className={adminInput}
              />
            </Field>
            <Field label="صورة الهوفر — الزجاجة وسط المكونات (اختياري)">
              <input
                value={form.image_hover_url} onChange={set('image_hover_url')} dir="ltr"
                placeholder="https://..." className={adminInput}
              />
            </Field>
            <p className="mt-1.5 text-[11px] text-faint leading-5">
              ارفع الصورة في Supabase → Storage، وانسخ اللينك هنا. من غير
              صورة بيتعرض رسم زجاجة بألوان الهوية.
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-sm font-semibold">
          <input
            type="checkbox" checked={form.is_featured}
            onChange={(e) =>
              setForm((f) => (f ? { ...f, is_featured: e.target.checked } : f))
            }
            className="w-4 h-4 accent-[#6b1f2a]"
          />
          اعرضه في «مختارات سِمة» على الصفحة الرئيسية
        </label>
        <label className="flex items-center gap-2.5 text-sm font-semibold">
          <input
            type="checkbox" checked={form.is_active}
            onChange={(e) =>
              setForm((f) => (f ? { ...f, is_active: e.target.checked } : f))
            }
            className="w-4 h-4 accent-[#6b1f2a]"
          />
          ظاهر في المتجر
        </label>
      </section>

      {error && (
        <p className="rounded-xl bg-bad/10 px-4 py-3 text-sm text-bad">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="submit" disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-wine px-6 py-3 font-bold text-white hover:bg-wine-dark disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? 'بنحفظ...' : isNew ? 'إضافة المنتج' : 'حفظ التعديلات'}
        </button>
        <Link
          href="/admin/products"
          className="rounded-xl border border-line px-6 py-3 font-bold text-muted hover:border-copper"
        >
          إلغاء
        </Link>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-muted">{label}</span>
      {children}
    </label>
  );
}
