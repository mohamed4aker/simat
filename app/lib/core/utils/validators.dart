/// تحقق من صحة مدخلات النماذج (بالعربية).
class Validators {
  Validators._();

  static String? required(String? value, {String field = 'هذا الحقل'}) {
    if (value == null || value.trim().isEmpty) return '$field مطلوب';
    return null;
  }

  static String? name(String? value) {
    if (value == null || value.trim().isEmpty) return 'الاسم مطلوب';
    if (value.trim().length < 3) return 'الاسم قصير جداً';
    return null;
  }

  /// أرقام الموبايل المصرية: 010 / 011 / 012 / 015 + 8 أرقام.
  static String? phone(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'رقم الموبايل مطلوب';
    if (!RegExp(r'^01[0125][0-9]{8}$').hasMatch(v)) {
      return 'رقم موبايل غير صحيح (مثال: 01012345678)';
    }
    return null;
  }

  static String? email(String? value, {bool optional = true}) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return optional ? null : 'البريد الإلكتروني مطلوب';
    if (!RegExp(r'^[\w.+-]+@[\w-]+\.[\w.-]+$').hasMatch(v)) {
      return 'بريد إلكتروني غير صحيح';
    }
    return null;
  }

  static String? password(String? value) {
    final v = value ?? '';
    if (v.isEmpty) return 'كلمة السر مطلوبة';
    if (v.length < 6) return 'كلمة السر 6 أحرف على الأقل';
    return null;
  }

  static String? confirmPassword(String? value, String original) {
    if (value != original) return 'كلمتا السر غير متطابقتين';
    return null;
  }

  static String? price(String? value) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return 'السعر مطلوب';
    final parsed = double.tryParse(v);
    if (parsed == null) return 'أدخل رقماً صحيحاً';
    if (parsed <= 0) return 'السعر لازم يكون أكبر من صفر';
    return null;
  }

  static String? integer(String? value, {String field = 'القيمة'}) {
    final v = value?.trim() ?? '';
    if (v.isEmpty) return '$field مطلوبة';
    final parsed = int.tryParse(v);
    if (parsed == null || parsed < 0) return 'أدخل رقماً صحيحاً';
    return null;
  }
}
