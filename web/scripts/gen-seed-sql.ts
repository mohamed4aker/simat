/**
 * بيولّد supabase/seed.sql من نفس بيانات الموقع في src/lib/seed.ts
 * عشان الكتالوج في قاعدة البيانات يبقى مطابق للكتالوج في الكود.
 *
 *   npm run gen:seed
 */
import { writeFileSync } from 'node:fs';
import { categories, coupons, products } from '../src/lib/seed.ts';
import { SHIPPING_RATES, FREE_SHIPPING_THRESHOLD } from '../src/lib/constants.ts';

const q = (v: string | null) =>
  v === null ? 'null' : `'${v.replace(/'/g, "''")}'`;
const arr = (v: string[]) =>
  `array[${v.map((e) => q(e)).join(',')}]::text[]`;
const num = (v: number | null) => (v === null ? 'null' : String(v));
const bool = (v: boolean) => (v ? 'true' : 'false');

const lines: string[] = [
  '-- ═══════════════════════════════════════════════════════════════',
  '--  SIMAT — بيانات المتجر الابتدائية',
  '--  مولّد تلقائياً من src/lib/seed.ts — متعدّلش الملف ده بإيدك.',
  '--  شغّله بعد schema.sql في: Supabase → SQL Editor',
  '-- ═══════════════════════════════════════════════════════════════',
  '',
  '-- إعدادات عامة',
  `insert into public.settings (key, value) values`,
  `  ('free_shipping_threshold', '${FREE_SHIPPING_THRESHOLD}')`,
  `on conflict (key) do update set value = excluded.value;`,
  '',
  '-- أسعار الشحن',
  'insert into public.shipping_rates (governorate, price) values',
];

lines.push(
  Object.entries(SHIPPING_RATES)
    .map(([g, p]) => `  (${q(g)}, ${p})`)
    .join(',\n') + '\non conflict (governorate) do update set price = excluded.price;',
);

lines.push('', '-- التصنيفات', 'insert into public.categories');
lines.push('  (id, slug, name, name_en, description, description_en, icon_key, sort_order) values');
lines.push(
  categories
    .map(
      (c) =>
        `  (${q(c.id)}, ${q(c.slug)}, ${q(c.name)}, ${q(c.nameEn)}, ` +
        `${q(c.description)}, ${q(c.descriptionEn)}, ${q(c.iconKey)}, ${c.sortOrder})`,
    )
    .join(',\n') + '\non conflict (id) do update set',
);
lines.push(
  '  slug = excluded.slug, name = excluded.name, name_en = excluded.name_en,',
  '  description = excluded.description, description_en = excluded.description_en,',
  '  icon_key = excluded.icon_key, sort_order = excluded.sort_order,',
  '  is_active = true;',
);

lines.push('', '-- المنتجات', 'insert into public.products');
lines.push(
  '  (id, slug, name, name_en, brand, category_id, description, description_en,',
  '   family, family_en, kind, label_style, price,',
  '   old_price, size_ml, gender, concentration, top_notes, heart_notes,',
  '   base_notes, top_notes_en, heart_notes_en, base_notes_en,',
  '   longevity_hours, stock, rating, rating_count, sold_count,',
  '   is_featured, is_active, image_url, created_at) values',
);
lines.push(
  products
    .map(
      (p) =>
        `  (${q(p.id)}, ${q(p.slug)}, ${q(p.name)}, ${q(p.nameEn)}, ${q(p.brand)},\n` +
        `   ${q(p.categoryId)}, ${q(p.description)}, ${q(p.descriptionEn)},\n` +
        `   ${q(p.family)}, ${q(p.familyEn)}, ${q(p.kind)}, ${q(p.labelStyle)},\n` +
        `   ${p.price}, ${num(p.oldPrice)},\n` +
        `   ${p.sizeMl}, ${q(p.gender)}, ${q(p.concentration)},\n` +
        `   ${arr(p.topNotes)}, ${arr(p.heartNotes)}, ${arr(p.baseNotes)},\n` +
        `   ${arr(p.topNotesEn)}, ${arr(p.heartNotesEn)}, ${arr(p.baseNotesEn)},\n` +
        `   ${p.longevityHours}, ${p.stock}, ${p.rating}, ${p.ratingCount},\n` +
        `   ${p.soldCount}, ${bool(p.isFeatured)}, ${bool(p.isActive)},\n` +
        `   ${q(p.imageUrl)}, ${q(p.createdAt)})`,
    )
    .join(',\n') + '\non conflict (id) do update set',
);
lines.push(
  '  slug = excluded.slug, name = excluded.name, name_en = excluded.name_en,',
  '  brand = excluded.brand, category_id = excluded.category_id,',
  '  description = excluded.description, description_en = excluded.description_en,',
  '  family = excluded.family, family_en = excluded.family_en,',
  '  kind = excluded.kind, label_style = excluded.label_style,',
  '  top_notes_en = excluded.top_notes_en, heart_notes_en = excluded.heart_notes_en,',
  '  base_notes_en = excluded.base_notes_en, price = excluded.price,',
  '  old_price = excluded.old_price, size_ml = excluded.size_ml,',
  '  gender = excluded.gender, concentration = excluded.concentration,',
  '  top_notes = excluded.top_notes, heart_notes = excluded.heart_notes,',
  '  base_notes = excluded.base_notes, longevity_hours = excluded.longevity_hours,',
  '  is_featured = excluded.is_featured, is_active = excluded.is_active,',
  '  image_url = excluded.image_url;',
);

lines.push('', '-- الكوبونات', 'insert into public.coupons');
lines.push('  (code, type, value, min_order, max_discount, expires_at,');
lines.push('   usage_limit, used_count, is_active) values');
lines.push(
  coupons
    .map(
      (c) =>
        `  (${q(c.code)}, ${q(c.type)}, ${c.value}, ${c.minOrder}, ` +
        `${num(c.maxDiscount)}, ${q(c.expiresAt)}, ${c.usageLimit}, ` +
        `${c.usedCount}, ${bool(c.isActive)})`,
    )
    .join(',\n') + '\non conflict (code) do nothing;',
);

lines.push(
  '',
  '-- إخفاء كتالوج العرض القديم (قبل تصميم الـ Prototype) لو كان متزرع.',
  '-- المنتجات اللي الأدمن ضافها بنفسه مش بتتأثر.',
  "update public.products set is_active = false where id in (",
  "  'p_001','p_002','p_003','p_004','p_005','p_006','p_007','p_008','p_009','p_010',",
  "  'p_011','p_012','p_013','p_014','p_015','p_016','p_017','p_018','p_019','p_020');",
  "update public.categories set is_active = false where id in (",
  "  'cat_oriental','cat_french','cat_oud','cat_niche','cat_body','cat_gift');",
);

lines.push('');
writeFileSync(new URL('../supabase/seed.sql', import.meta.url), lines.join('\n'));
console.log('✓ supabase/seed.sql');
