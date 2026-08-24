import 'package:flutter/material.dart';

/// ألوان الهوية البصرية لـ SIMAT — سِمة
/// مأخوذة حرفياً من دليل الهوية (Brand Palette).
class AppColors {
  AppColors._();

  /// العنابي العميق — اللون الأساسي
  static const Color primary = Color(0xFF6B1F2A);
  static const Color primaryDark = Color(0xFF4E1620);
  static const Color primaryLight = Color(0xFF8E3542);

  /// العاجي الدافئ — لون الخلفيات
  static const Color background = Color(0xFFF2EBE1);
  static const Color surface = Color(0xFFFBF7F2);

  /// الفحمي — النصوص الداكنة
  static const Color dark = Color(0xFF1C1A17);

  /// النحاسي — لون التمييز (Accent)
  static const Color accent = Color(0xFFB87333);
  static const Color accentLight = Color(0xFFD79A5E);

  /// الرملي — اللون الثانوي
  static const Color secondary = Color(0xFFD9CFC3);

  // ألوان مساعدة مشتقة من الهوية
  static const Color textPrimary = dark;
  static const Color textSecondary = Color(0xFF6E665C);
  static const Color textMuted = Color(0xFF9A9188);
  static const Color divider = Color(0xFFE3D9CD);

  static const Color success = Color(0xFF2E7D5B);
  static const Color warning = Color(0xFFC98A16);
  static const Color danger = Color(0xFFB3261E);
  static const Color info = Color(0xFF35618E);

  /// تدرّج عنابي يُستخدم في الهيدر والبانرات
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topRight,
    end: Alignment.bottomLeft,
    colors: [Color(0xFF7D2532), Color(0xFF4E1620)],
  );

  /// تدرّج نحاسي للأزرار المميزة والشارات
  static const LinearGradient accentGradient = LinearGradient(
    begin: Alignment.topRight,
    end: Alignment.bottomLeft,
    colors: [Color(0xFFD79A5E), Color(0xFFB87333)],
  );
}
