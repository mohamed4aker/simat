import 'enums.dart';

/// كوبون خصم يديره الأدمن.
class Coupon {
  final String code;
  final DiscountType type;
  final double value;
  final double minOrder;
  final double? maxDiscount;
  final DateTime expiresAt;
  final int usageLimit;
  final int usedCount;
  final bool isActive;

  const Coupon({
    required this.code,
    required this.type,
    required this.value,
    this.minOrder = 0,
    this.maxDiscount,
    required this.expiresAt,
    this.usageLimit = 0,
    this.usedCount = 0,
    this.isActive = true,
  });

  bool get isExpired => DateTime.now().isAfter(expiresAt);
  bool get isUsedUp => usageLimit > 0 && usedCount >= usageLimit;
  bool get isUsable => isActive && !isExpired && !isUsedUp;

  String get labelAr => type == DiscountType.percent
      ? 'خصم ${value.toStringAsFixed(0)}%'
      : 'خصم ${value.toStringAsFixed(0)} ج.م';

  /// يحسب قيمة الخصم على مجموع فرعي معيّن.
  double discountFor(double subtotal) {
    if (!isUsable || subtotal < minOrder) return 0;
    final raw =
        type == DiscountType.percent ? subtotal * (value / 100) : value;
    final capped = maxDiscount != null && raw > maxDiscount!
        ? maxDiscount!
        : raw;
    return capped > subtotal ? subtotal : capped;
  }

  Coupon copyWith({
    DiscountType? type,
    double? value,
    double? minOrder,
    double? maxDiscount,
    DateTime? expiresAt,
    int? usageLimit,
    int? usedCount,
    bool? isActive,
  }) =>
      Coupon(
        code: code,
        type: type ?? this.type,
        value: value ?? this.value,
        minOrder: minOrder ?? this.minOrder,
        maxDiscount: maxDiscount ?? this.maxDiscount,
        expiresAt: expiresAt ?? this.expiresAt,
        usageLimit: usageLimit ?? this.usageLimit,
        usedCount: usedCount ?? this.usedCount,
        isActive: isActive ?? this.isActive,
      );

  Map<String, dynamic> toJson() => {
        'code': code,
        'type': type.name,
        'value': value,
        'minOrder': minOrder,
        'maxDiscount': maxDiscount,
        'expiresAt': expiresAt.toIso8601String(),
        'usageLimit': usageLimit,
        'usedCount': usedCount,
        'isActive': isActive,
      };

  factory Coupon.fromJson(Map<String, dynamic> json) => Coupon(
        code: json['code'] as String,
        type: DiscountType.fromName(json['type'] as String? ?? 'percent'),
        value: (json['value'] as num).toDouble(),
        minOrder: (json['minOrder'] as num?)?.toDouble() ?? 0,
        maxDiscount: (json['maxDiscount'] as num?)?.toDouble(),
        expiresAt: DateTime.parse(json['expiresAt'] as String),
        usageLimit: json['usageLimit'] as int? ?? 0,
        usedCount: json['usedCount'] as int? ?? 0,
        isActive: json['isActive'] as bool? ?? true,
      );
}
