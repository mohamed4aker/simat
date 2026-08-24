import 'package:intl/intl.dart';

import '../constants/app_constants.dart';

/// دوال تنسيق موحّدة (أسعار، تواريخ، أرقام).
class Fmt {
  Fmt._();

  static final NumberFormat _money = NumberFormat('#,##0.##', 'en');
  static final NumberFormat _int = NumberFormat('#,##0', 'en');
  static final DateFormat _date = DateFormat('d MMMM yyyy', 'ar');
  static final DateFormat _dateShort = DateFormat('d/M/yyyy', 'en');
  static final DateFormat _dateTime = DateFormat('d/M/yyyy — h:mm a', 'en');

  /// «١٬٢٥٠ ج.م»
  static String price(num value) =>
      '${_money.format(value)} ${AppConstants.currency}';

  static String priceCompact(num value) => _money.format(value);

  static String number(num value) => _int.format(value);

  /// اختصار الأرقام الكبيرة في لوحة التقارير: 12.4K
  static String compact(num value) {
    if (value >= 1000000) {
      return '${(value / 1000000).toStringAsFixed(1)}M';
    }
    if (value >= 1000) {
      return '${(value / 1000).toStringAsFixed(1)}K';
    }
    return _int.format(value);
  }

  static String date(DateTime value) => _date.format(value);
  static String dateShort(DateTime value) => _dateShort.format(value);
  static String dateTime(DateTime value) => _dateTime.format(value);

  /// «منذ ٣ أيام»
  static String relative(DateTime value) {
    final diff = DateTime.now().difference(value);
    if (diff.inMinutes < 1) return 'الآن';
    if (diff.inMinutes < 60) return 'منذ ${diff.inMinutes} دقيقة';
    if (diff.inHours < 24) return 'منذ ${diff.inHours} ساعة';
    if (diff.inDays < 7) return 'منذ ${diff.inDays} يوم';
    if (diff.inDays < 30) return 'منذ ${(diff.inDays / 7).floor()} أسبوع';
    if (diff.inDays < 365) return 'منذ ${(diff.inDays / 30).floor()} شهر';
    return 'منذ ${(diff.inDays / 365).floor()} سنة';
  }

  static String percent(num value) => '${value.toStringAsFixed(1)}%';
}
