/// ثوابت عامة للتطبيق ومعلومات المتجر.
class AppConstants {
  AppConstants._();

  static const String appName = 'SIMAT';
  static const String appNameAr = 'سِمة';
  static const String tagline = 'عطور تُخلّد الأثر';
  static const String currency = 'ج.م';

  /// حد الشحن المجاني.
  static const double freeShippingThreshold = 1500;

  /// رقم خدمة العملاء / واتساب.
  static const String supportPhone = '01000000000';
  static const String supportEmail = 'care@simat.store';
  static const String instagram = '@simat.perfumes';

  /// المحافظات المصرية وتكلفة الشحن لكل منها بالجنيه.
  static const Map<String, double> shippingRates = {
    'القاهرة': 50,
    'الجيزة': 50,
    'القليوبية': 55,
    'الإسكندرية': 65,
    'الدقهلية': 70,
    'الشرقية': 70,
    'الغربية': 70,
    'المنوفية': 70,
    'البحيرة': 75,
    'كفر الشيخ': 75,
    'دمياط': 75,
    'بورسعيد': 75,
    'الإسماعيلية': 75,
    'السويس': 75,
    'الفيوم': 80,
    'بني سويف': 80,
    'المنيا': 85,
    'أسيوط': 90,
    'سوهاج': 95,
    'قنا': 100,
    'الأقصر': 105,
    'أسوان': 110,
    'البحر الأحمر': 120,
    'مطروح': 120,
    'شمال سيناء': 130,
    'جنوب سيناء': 130,
    'الوادي الجديد': 130,
  };

  static List<String> get governorates => shippingRates.keys.toList();

  static double shippingFor(String governorate, double subtotal) {
    if (subtotal >= freeShippingThreshold) return 0;
    return shippingRates[governorate] ?? 80;
  }

  /// مدة التوصيل المتوقعة بالأيام.
  static const int deliveryDaysMin = 2;
  static const int deliveryDaysMax = 5;
}
