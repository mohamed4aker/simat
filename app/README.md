# SIMAT App — تطبيق سِمة

<div dir="rtl">

تطبيق Flutter واحد بيطلع **أندرويد + iOS** (وكمان ويب للوحة التحكم).
الشرح الكامل للمشروع في [`../README.md`](../README.md).

## أوامر سريعة

```bash
flutter pub get                 # تحميل المكتبات
flutter run                     # تشغيل على جهاز/محاكي
flutter analyze                 # فحص الكود
flutter test                    # الاختبارات

flutter build apk --release     # APK للتجربة والتوزيع المباشر
flutter build appbundle         # للنشر على Google Play
flutter build ipa --release     # آيفون (محتاج macOS + Xcode)
```

> بناء نسخة الأندرويد محتاج **Android SDK** مثبّت على جهازك، ونسخة
> الآيفون محتاجة **macOS + Xcode**. الكود نفسه جاهز للاتنين.

## أدوات التطوير

```bash
# صور لكل الشاشات في build/screens/ من غير محاكي
flutter test tool/screenshot_test.dart

# إعادة توليد أيقونة التطبيق وشعار شاشة البداية من رمز سِمة
flutter test tool/generate_brand_assets_test.dart
dart run flutter_launcher_icons
dart run flutter_native_splash:create
```

## حسابات التجربة

| الدور | الموبايل | كلمة السر |
|---|---|---|
| أدمن | `01000000000` | `admin123` |
| عميل | `01011112222` | `123456` |

</div>
