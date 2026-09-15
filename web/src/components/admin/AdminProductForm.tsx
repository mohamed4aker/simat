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
  image_url: string;
  is_featured: boolean;
  is_active: boolean;
}

const EMPTY: FormState = {
  name: '', name_en: '', slug: '', brand: 'SIMAT', category_id: '',
  description: '', price: '', old_price: '', size_ml: '100', stock: '0',
  gender: 'unisex', concentration: 'edp', longevity_hours: '8',
  top_notes: '', heart_notes: '', base_notes: '', image_url: '',
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

    const priceValue = Number(form.price);
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
      price: priceValue,
      old_price: form.old_price.trim() ? Number(form.old_price) : null,
      size_ml: Number(form.size_ml) || 100,
      stock: Number(form.stock) || 0,
      gender: form.gender,
      concentration: form.concentration,
      longevity_hours: Number(form.longevity_hours) || 8,
      top_notes: notesToArray(form.top_notes),
      heart_notes: notesToArray(form.heart_notes),
      base_notes: notesToArray(form.base_notes),
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

        <Field label="الوصف">
          <textarea value={form.description} onChange={set('description')} rows={4} className={adminInput} />
        </Field>
      </section>

      <section className="rounded-2xl border border-line bg-surface p-5 space-y-3">
        <h2 className="font-bold mb-1">السعر والمخزون</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="السعر (ج.م) *">
            <input value={form.price} onChange={set('price')} inputMode="decimal" className={adminInput} required />
          </Field>
          <Field label="السعر قبل الخصم (اختياري)">
            <input value={form.old_price} onChange={set('old_price')} inputMode="decimal" className={adminInput} />
          </Field>
          <Field label="الكمية في المخزن">
            <input value={form.stock} onChange={set('stock')} inputMode="numeric" className={adminInput} />
          </Field>
          <Field label="الحجم (مل)">
            <input value={form.size_ml} onChange={set('size_ml')} inputMode="numeric" className={adminInput} />
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
              <option value="parfum">Parfum</option>
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
