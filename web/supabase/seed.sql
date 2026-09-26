-- ═══════════════════════════════════════════════════════════════
--  SIMAT — بيانات المتجر الابتدائية
--  مولّد تلقائياً من src/lib/seed.ts — متعدّلش الملف ده بإيدك.
--  شغّله بعد schema.sql في: Supabase → SQL Editor
-- ═══════════════════════════════════════════════════════════════

-- إعدادات عامة
insert into public.settings (key, value) values
  ('free_shipping_threshold', '1500')
on conflict (key) do update set value = excluded.value;

-- أسعار الشحن
insert into public.shipping_rates (governorate, price) values
  ('القاهرة', 50),
  ('الجيزة', 50),
  ('القليوبية', 55),
  ('الإسكندرية', 65),
  ('الدقهلية', 70),
  ('الشرقية', 70),
  ('الغربية', 70),
  ('المنوفية', 70),
  ('البحيرة', 75),
  ('كفر الشيخ', 75),
  ('دمياط', 75),
  ('بورسعيد', 75),
  ('الإسماعيلية', 75),
  ('السويس', 75),
  ('الفيوم', 80),
  ('بني سويف', 80),
  ('المنيا', 85),
  ('أسيوط', 90),
  ('سوهاج', 95),
  ('قنا', 100),
  ('الأقصر', 105),
  ('أسوان', 110),
  ('البحر الأحمر', 120),
  ('مطروح', 120),
  ('شمال سيناء', 130),
  ('جنوب سيناء', 130),
  ('الوادي الجديد', 130)
on conflict (governorate) do update set price = excluded.price;

-- التصنيفات
insert into public.categories
  (id, slug, name, name_en, description, description_en, icon_key, sort_order) values
  ('cat_signature', 'signature', 'زجاجات سِمة 100 مل', 'Signature 100ml Flacons', 'إكستري وماء عطر بتركيز زيت عالي', 'Extrait and Eau de Parfum with high oil concentration', 'bottle', 1),
  ('cat_discovery', 'discovery', 'أطقم العينات', 'Discovery Sets', 'جرب في البيت قبل ما تقرر', 'Try at home before you decide', 'gift', 2)
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, name_en = excluded.name_en,
  description = excluded.description, description_en = excluded.description_en,
  icon_key = excluded.icon_key, sort_order = excluded.sort_order,
  is_active = true;

-- المنتجات
insert into public.products
  (id, slug, name, name_en, brand, category_id, description, description_en,
   family, family_en, kind, label_style, price,
   old_price, size_ml, gender, concentration, top_notes, heart_notes,
   base_notes, top_notes_en, heart_notes_en, base_notes_en,
   longevity_hours, stock, rating, rating_count, sold_count,
   is_featured, is_active, image_url, created_at) values
  ('simat-bordeaux', 'simat-bordeaux', 'سِمة بوردو', 'SIMAT Bordeaux', 'SIMAT',
   'cat_signature', 'ورد طائفي طبيعي مع زعفران دافي وعود معتق. ريحة فخمة تبدأ بورد راقي وتهدى على خشب وعنبر دافي. مناسب جداً للمساء والخروجات الخاصة والأيام الباردة.', 'Taif rose, warm saffron, and aged agarwood. Rich and warm with a floral opening and a deep woody drydown. Perfect for evenings, dinners, and cooler days.',
   'زهري شرقي وعود معتق', 'Floral Oriental & Aged Oud', 'bottle', 'bordeaux',
   3450, null,
   100, 'unisex', 'parfum',
   array['ورد طائفي دمشقي','زعفران إيراني','حبهان أخضر']::text[], array['خشب عود كمبودي معتق','أرز الأطلس','باتشولي']::text[], array['عنبر طبيعي','مسك أبيض','فانيليا دافية']::text[],
   array['Taif Damascene Rose','Iranian Saffron','Green Cardamom']::text[], array['Aged Cambodian Agarwood','Atlas Cedarwood','Patchouli']::text[], array['Natural Amber','White Musk','Warm Vanilla']::text[],
   12, 40, 0, 0,
   214, true, true,
   null, '2026-07-28T14:52:14.118Z'),
  ('simat-noir', 'simat-noir', 'سِمة نوار أبسولو', 'SIMAT Noir Absolu', 'SIMAT',
   'cat_signature', 'عود مدخن مع لمسة جلود فخمة وبخور هادي. عطر تقيل وثابت وله هيبة واضحة، ممتاز للسهرات والمناسبات الرسمية.', 'Smoky agarwood, noble leather, and clean frankincense. Dark, grounded, and long-lasting. Made for those who like bold, masculine evening fragrances.',
   'أخشاب وجلود مدخنة', 'Smoky Leather & Heavy Woods', 'bottle', 'noir',
   4100, null,
   100, 'men', 'parfum',
   array['فلفل أسود','لبان حوجري','قطران البتولا']::text[], array['أخشاب مدخنة','جلود ملكية','نجيل الهند']::text[], array['عود هندي معتق','عنبر رمادي','خشب الأرز']::text[],
   array['Black Pepper','Cold Frankincense','Birch Tar']::text[], array['Smoked Wood','Dark Leather','Vetiver']::text[], array['Indian Agarwood','Grey Amber','Cedar']::text[],
   14, 25, 0, 0,
   131, true, true,
   null, '2026-08-12T14:52:14.118Z'),
  ('simat-ivoire', 'simat-ivoire', 'سِمة إيفوار بريفيه', 'SIMAT Ivoire Privé', 'SIMAT',
   'cat_signature', 'مسك أبيض نظيف مع ياسمين مصري وصندل ناعم. ريحة نظافة وراحة، هادية ومريحة في الاستعمال اليومي والصبح ومناسبات الشغل.', 'Clean white musk, fresh Nile jasmine, and soft sandalwood. Light, crisp, and comfortable. An easy daily signature that stays close and never overwhelms.',
   'مسك أبيض وزهور نقية', 'Clean White Musk & Florals', 'bottle', 'linen',
   3200, null,
   100, 'women', 'edp',
   array['برغموت إيطالي','زهر البرتقال','فلفل وردي']::text[], array['ياسمين وادي النيل','خشب صندل ميسور','كشمير']::text[], array['مسك أبيض نظيف','فانيليا بوربون','أرز ناعم']::text[],
   array['Italian Bergamot','Orange Blossom','Pink Pepper']::text[], array['Nile Jasmine','Mysore Sandalwood','Cashmere']::text[], array['White Musk','Bourbon Vanilla','Soft Cedar']::text[],
   9, 50, 0, 0,
   188, true, true,
   null, '2026-08-27T14:52:14.118Z'),
  ('royal-velvet', 'royal-velvet', 'رويال فِلفت', 'Royal Velvet', 'SIMAT',
   'cat_signature', 'توت أسود غني مع عنبر دافي وخشب البلوط. توليفة مميزة تجمع بين حلاوة خفيفة وعمق دافي، تناسب الجنسين في السهرات.', 'Ripe dark berries, warm amber, and smoked oakwood. Smooth, slightly sweet, and very distinct. Great for both men and women on evenings out.',
   'عنبر وأخشاب وتوت غني', 'Ambery Fruity Wood', 'bottle', 'velvet',
   4850, null,
   100, 'unisex', 'parfum',
   array['توت بري داكن','برقوق','توابل دافئة']::text[], array['ورد دمشقي مخملي','خشب البلوط المدخن']::text[], array['عنبر ذهبي','أخشاب بلسمية','مسك ناعم']::text[],
   array['Dark Berries','Wild Plum','Warm Spices']::text[], array['Velvet Damascene Rose','Smoked Oakwood']::text[], array['Golden Amber','Balsamic Wood','Soft Musk']::text[],
   12, 20, 0, 0,
   97, true, true,
   null, '2026-09-11T14:52:14.118Z'),
  ('discovery-set', 'discovery-set', 'طقم عينات سِمة (5 × 2 مل)', 'SIMAT Discovery Set (5 × 2ml)', 'SIMAT',
   'cat_discovery', 'جرب 5 من أكتر عطورنا المحبوبة على جلدك في البيت. ومع العلبة كارت خصم بقيمة 650 ج.م تخصمه من تمن أي زجاجة 100 مل تطلبها بعدين.', 'Try five of our favorite perfumes at home on your own skin. Inside the box you will find a 650 EGP voucher you can deduct from any 100ml bottle later.',
   'طقم عينات', 'Discovery Coffret', 'set', 'noir',
   650, null,
   10, 'unisex', 'parfum',
   array['سِمة بوردو','نوار أبسولو','إيفوار بريفيه','رويال فِلفت','دهن عود']::text[], array[]::text[], array[]::text[],
   array['SIMAT Bordeaux','Noir Absolu','Ivoire Privé','Royal Velvet','Dehn Oud']::text[], array[]::text[], array[]::text[],
   8, 120, 0, 0,
   402, false, true,
   null, '2026-06-28T14:52:14.118Z')
on conflict (id) do update set
  slug = excluded.slug, name = excluded.name, name_en = excluded.name_en,
  brand = excluded.brand, category_id = excluded.category_id,
  description = excluded.description, description_en = excluded.description_en,
  family = excluded.family, family_en = excluded.family_en,
  kind = excluded.kind, label_style = excluded.label_style,
  top_notes_en = excluded.top_notes_en, heart_notes_en = excluded.heart_notes_en,
  base_notes_en = excluded.base_notes_en, price = excluded.price,
  old_price = excluded.old_price, size_ml = excluded.size_ml,
  gender = excluded.gender, concentration = excluded.concentration,
  top_notes = excluded.top_notes, heart_notes = excluded.heart_notes,
  base_notes = excluded.base_notes, longevity_hours = excluded.longevity_hours,
  is_featured = excluded.is_featured, is_active = excluded.is_active,
  image_url = excluded.image_url;

-- الكوبونات
insert into public.coupons
  (code, type, value, min_order, max_discount, expires_at,
   usage_limit, used_count, is_active) values
  ('SIMAT10', 'percent', 10, 0, null, '2027-09-26T14:52:14.118Z', 0, 0, true),
  ('ALEXANDRIA', 'percent', 10, 0, null, '2027-09-26T14:52:14.118Z', 0, 0, true),
  ('SIMAT15', 'percent', 15, 3000, null, '2027-09-26T14:52:14.118Z', 0, 0, true)
on conflict (code) do nothing;

-- إخفاء كتالوج العرض القديم (قبل تصميم الـ Prototype) لو كان متزرع.
-- المنتجات اللي الأدمن ضافها بنفسه مش بتتأثر.
update public.products set is_active = false where id in (
  'p_001','p_002','p_003','p_004','p_005','p_006','p_007','p_008','p_009','p_010',
  'p_011','p_012','p_013','p_014','p_015','p_016','p_017','p_018','p_019','p_020');
update public.categories set is_active = false where id in (
  'cat_oriental','cat_french','cat_oud','cat_niche','cat_body','cat_gift');
