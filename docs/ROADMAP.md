# الخطوات الجاية — الباك إند والموقع

<div dir="rtl">

التطبيق دلوقتي شغّال كامل ببيانات محليّة على الجهاز. عشان يبقى متجر حقيقي
شغّال مع عملاء فعليين، محتاجين **باك إند** (سيرفر + قاعدة بيانات) يشاركه
التطبيق والموقع.

---

## ١. اختيار الباك إند

| الخيار | مميزات | عيوب |
|---|---|---|
| **Supabase** (مرشّح) | Postgres حقيقي، Auth جاهز، تخزين صور، Realtime، لوحة إدارة، مجاني للبداية | محتاج تفهم صلاحيات RLS |
| Firebase | أسهل بداية، إشعارات ممتازة | NoSQL بيصعّب التقارير والحسابات |
| API خاص (Laravel / NestJS) | تحكّم كامل | وقت تطوير وتكلفة استضافة أكبر |

**الترشيح:** Supabase — لأن التقارير محتاجة استعلامات SQL، وده بالظبط
اللي Postgres بيعمله كويس.

---

## ٢. جداول قاعدة البيانات

الجداول دي مطابقة للنماذج الموجودة في `app/lib/data/models/`:

```
users        (id, name, phone, email, role, is_blocked, created_at)
addresses    (id, user_id, label, full_name, phone, governorate, city,
              street, building, notes, is_default)
categories   (id, name, name_en, description, icon_key, sort_order, is_active)
products     (id, name, name_en, brand, category_id, description, price,
              old_price, size_ml, gender, concentration, top_notes[],
              heart_notes[], base_notes[], longevity_hours, stock, rating,
              rating_count, sold_count, is_featured, is_active, image_url,
              created_at)
orders       (id, order_number, user_id, customer_name, customer_phone,
              address jsonb, payment_method, status, subtotal, shipping,
              discount, coupon_code, notes, created_at, updated_at)
order_items  (id, order_id, product_id, name, unit_price, size_ml, quantity)
order_events (id, order_id, status, note, created_at)
reviews      (id, product_id, user_id, rating, comment, created_at)
coupons      (code, type, value, min_order, max_discount, expires_at,
              usage_limit, used_count, is_active)
```

### صلاحيات مهمة (RLS)
- العميل يقرأ **منتجاته وطلباته هو بس**.
- الأدمن (`role = 'admin'`) يقرأ ويكتب كل حاجة.
- المنتجات والتصنيفات: قراءة للجميع، كتابة للأدمن.
- **خصم المخزون وحساب الإجمالي لازم يتم على السيرفر** (Database Function)
  مش في التطبيق — عشان محدش يتلاعب بالأسعار.

---

## ٣. خطوات الربط في التطبيق

الشغل كله في مجلد `app/lib/data/repositories/` — الواجهات مش هتتلمس.

1. `flutter pub add supabase_flutter`
2. تهيئة الاتصال في `main.dart`.
3. لكل مستودع، نعمل نسخة جديدة بنفس الواجهة:
   - `CatalogRepository` → `SupabaseCatalogRepository`
   - `AuthRepository` → `SupabaseAuthRepository`
   - `OrderRepository` → `SupabaseOrderRepository`
   - `CouponRepository` → `SupabaseCouponRepository`
   - `ReportsRepository` → استعلامات SQL / Views
4. نغيّر الـ Providers في `app/lib/providers/app_providers.dart` تشاور
   على النسخ الجديدة. **وخلاص.**

> الدوال كلها `Future` من الأساس، فمفيش أي تغيير في الواجهات لما تبقى
> بتنادي شبكة بدل التخزين المحلي.

---

## ٤. الدفع الإلكتروني

- **الدفع عند الاستلام** شغّال دلوقتي زي ما هو.
- للبطاقات والمحافظ في مصر: **Paymob** أو **Fawry** أو **Kashier**.
- الطريقة الصح: التطبيق يطلب من السيرفر «نيّة دفع» (Payment Intent)،
  والسيرفر يستقبل تأكيد الدفع من البوابة (Webhook) ويحدّث حالة الطلب.
  **مفاتيح البوابة ما تدخلش التطبيق نهائياً.**

---

## ٥. الإشعارات

`firebase_messaging` لإشعارات:
- تأكيد الطلب وتغيّر حالته.
- رجوع منتج للمخزون.
- العروض والكوبونات الجديدة.

---

## ٦. الموقع (Storefront)

الموقع هيتعمل في مكان تاني، وبيتكلم مع **نفس الباك إند**:

- **Next.js + Tailwind** — الأفضل لتحسين محركات البحث (SEO) والسرعة.
- نفس الهوية بالظبط: نفس الألوان في `docs/BRAND.md`، نفس الخطين
  Cairo و Playfair Display، ونفس الشعار.
- الصفحات: الرئيسية · المتجر · صفحة المنتج · العربة · إتمام الطلب ·
  حسابي وطلباتي · صفحات ثابتة (سياسة الاستبدال، سياسة الخصوصية، من نحن).
- **مهم لجوجل:** بيانات منظّمة `Product` + `Offer` (Schema.org) لكل منتج.

> ملحوظة: مشروع Flutter ده بيقدر يتبني ويب برضه (`flutter build web`) —
> بس ده مناسب كـ**لوحة تحكم على المتصفح** للأدمن، مش كمتجر للعملاء،
> لأن الـ SEO في Flutter Web ضعيف.

---

## ٧. قبل النشر على المتاجر

- [ ] أيقونة التطبيق ولوجو البداية (`flutter_launcher_icons` + `flutter_native_splash`).
- [ ] اسم التطبيق ومعرّفه (`com.simat.app`) وشاشات المتجر.
- [ ] سياسة الخصوصية (إجبارية لـ Google Play و App Store).
- [ ] توقيع نسخة الأندرويد (Keystore) وحساب مطوّر Apple.
- [ ] حذف الحسابات التجريبية وبيانات البداية من `SeedData`.
- [ ] تفعيل تتبّع الأعطال (Crashlytics / Sentry).

</div>
