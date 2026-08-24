# بنية المشروع — SIMAT App

<div dir="rtl">

## نظرة عامة

```
app/lib/
├── main.dart              نقطة البداية (تهيئة التخزين + اللغة)
├── app.dart               MaterialApp + RTL + الثيم
├── core/
│   ├── theme/             الألوان والثيم
│   ├── router/            كل مسارات التطبيق (go_router)
│   ├── constants/         بيانات المتجر، المحافظات، أسعار الشحن
│   ├── utils/             تنسيق الأسعار والتواريخ + التحقق من المدخلات
│   └── widgets/           الشعار، النمط، كارت المنتج، الودجتس المشتركة
├── data/
│   ├── models/            Product, Order, AppUser, Category, Coupon...
│   ├── sources/           LocalStore (التخزين) + SeedData (بيانات البداية)
│   └── repositories/      Catalog, Auth, Order, Coupon, Reports
├── providers/             Riverpod: الحالة وربط الواجهات بالبيانات
└── features/
    ├── splash/  auth/
    ├── customer/          home, catalog, product, cart, checkout,
    │                      orders, favorites, profile
    └── admin/             dashboard, products, orders, customers,
                           reports, settings
```

## المكتبات

| المكتبة | ليه |
|---|---|
| `flutter_riverpod` | إدارة الحالة — واضحة وقابلة للاختبار وبتدعم الـ async |
| `go_router` | تنقّل معرّف بالمسارات + حماية لوحة الأدمن |
| `shared_preferences` | التخزين المحلي في النسخة الحالية |
| `fl_chart` | الرسوم البيانية في التقارير |
| `intl` | تنسيق الأرقام والتواريخ بالعربية |
| `uuid` | توليد المعرّفات |

## الطبقات

```
الواجهة (features)
      ↓  بتقرأ وبتكتب من خلال
Providers (Riverpod)
      ↓  بتنادي
Repositories  ← نقطة التبديل للباك إند
      ↓  حالياً بتكلّم
LocalStore (JSON في shared_preferences)
```

**القاعدة المهمة:** الواجهات ما بتعرفش حاجة عن مكان تخزين البيانات. لما
نربط بسيرفر حقيقي، بنغيّر جوّه الـ Repositories بس.

## الحالة (State)

| الـ Provider | بيمسك إيه |
|---|---|
| `authControllerProvider` | المستخدم الحالي + العناوين + المفضلة |
| `cartControllerProvider` | العربة (محفوظة على الجهاز) |
| `productFilterProvider` | فلاتر المتجر الحالية |
| `dataRevisionProvider` | عدّاد بيتزوّد بعد أي تعديل فيعيد بناء القوائم |
| `dashboardReportProvider` | تقارير الأدمن حسب الفترة المختارة |

بعد أي تعديل على البيانات بننادي `bumpData(ref)` فكل القوائم المرتبطة
بتتحدّث لوحدها.

## المسارات

| المسار | الشاشة |
|---|---|
| `/` | شاشة البداية |
| `/login` · `/register` | الدخول والتسجيل |
| `/home` `/catalog` `/cart` `/favorites` `/profile` | تبويبات العميل |
| `/product/:id` · `/search` | المنتج والبحث |
| `/checkout` · `/order-success/:id` | إتمام الطلب |
| `/orders` · `/orders/:id` | الطلبات والتتبّع |
| `/addresses` · `/profile/edit` | الحساب |
| `/admin` `/admin/orders` `/admin/products` `/admin/reports` `/admin/more` | تبويبات الأدمن |
| `/admin/products/new` · `/admin/products/:id` | إضافة/تعديل منتج |
| `/admin/orders/:id` · `/admin/categories` · `/admin/coupons` · `/admin/customers` | باقي شاشات الإدارة |

مسارات `/admin` محميّة: أي حد مش أدمن بيتحوّل على `/login`.

## حساب التقارير

`ReportsRepository` بيحسب من الطلبات المخزّنة:

- إيراد الفترة + مقارنة بالفترة اللي قبلها (نسبة النمو).
- منحنى المبيعات (يومي للفترات القصيرة، شهري للسنة).
- توزيع حالات الطلبات وطرق الدفع والتصنيفات.
- أفضل المنتجات وأفضل العملاء.
- المخزون المنخفض.
- تصدير CSV لكل طلبات الفترة.

الطلبات الملغيّة والمرتجعة **مش** بتتحسب في الإيراد
(`OrderStatus.countsAsRevenue`).

## أداة تصوير الشاشات

```bash
flutter test tool/screenshot_test.dart
```

بتطلع صور PNG لكل الشاشات في `build/screens/` من غير محاكي — مفيدة لمراجعة
التصميم بسرعة.

</div>
