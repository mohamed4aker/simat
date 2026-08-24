/// حالات الطلب — تُستخدم في تطبيق العميل ولوحة الأدمن.
enum OrderStatus {
  pending,
  confirmed,
  preparing,
  shipped,
  delivered,
  cancelled,
  returned;

  static OrderStatus fromName(String value) => OrderStatus.values.firstWhere(
        (e) => e.name == value,
        orElse: () => OrderStatus.pending,
      );

  String get labelAr => switch (this) {
        OrderStatus.pending => 'قيد المراجعة',
        OrderStatus.confirmed => 'تم التأكيد',
        OrderStatus.preparing => 'جاري التجهيز',
        OrderStatus.shipped => 'في الشحن',
        OrderStatus.delivered => 'تم التسليم',
        OrderStatus.cancelled => 'ملغي',
        OrderStatus.returned => 'مرتجع',
      };

  /// هل الطلب ما زال نشِطاً (لم يُغلق بعد)؟
  bool get isOpen => this != OrderStatus.delivered &&
      this != OrderStatus.cancelled &&
      this != OrderStatus.returned;

  /// هل يُحتسب ضمن الإيرادات؟
  bool get countsAsRevenue =>
      this != OrderStatus.cancelled && this != OrderStatus.returned;
}

/// طرق الدفع المتاحة.
enum PaymentMethod {
  cashOnDelivery,
  card,
  wallet,
  instapay;

  static PaymentMethod fromName(String value) =>
      PaymentMethod.values.firstWhere(
        (e) => e.name == value,
        orElse: () => PaymentMethod.cashOnDelivery,
      );

  String get labelAr => switch (this) {
        PaymentMethod.cashOnDelivery => 'الدفع عند الاستلام',
        PaymentMethod.card => 'بطاقة ائتمانية',
        PaymentMethod.wallet => 'محفظة إلكترونية',
        PaymentMethod.instapay => 'إنستا باي',
      };
}

/// الفئة المستهدفة للعطر.
enum Gender {
  men,
  women,
  unisex;

  static Gender fromName(String value) => Gender.values.firstWhere(
        (e) => e.name == value,
        orElse: () => Gender.unisex,
      );

  String get labelAr => switch (this) {
        Gender.men => 'رجالي',
        Gender.women => 'حريمي',
        Gender.unisex => 'للجنسين',
      };
}

/// تركيز العطر.
enum Concentration {
  parfum,
  edp,
  edt,
  oil,
  mist;

  static Concentration fromName(String value) =>
      Concentration.values.firstWhere(
        (e) => e.name == value,
        orElse: () => Concentration.edp,
      );

  String get labelAr => switch (this) {
        Concentration.parfum => 'Parfum — عطر مركّز',
        Concentration.edp => 'EDP — أو دو بارفان',
        Concentration.edt => 'EDT — أو دو تواليت',
        Concentration.oil => 'زيت عطري',
        Concentration.mist => 'بادي ميست',
      };

  String get shortAr => switch (this) {
        Concentration.parfum => 'Parfum',
        Concentration.edp => 'EDP',
        Concentration.edt => 'EDT',
        Concentration.oil => 'زيت',
        Concentration.mist => 'ميست',
      };
}

/// دور المستخدم داخل النظام.
enum UserRole {
  customer,
  admin;

  static UserRole fromName(String value) => UserRole.values.firstWhere(
        (e) => e.name == value,
        orElse: () => UserRole.customer,
      );

  String get labelAr => this == UserRole.admin ? 'مسؤول' : 'عميل';
}

/// نوع الخصم في الكوبون.
enum DiscountType {
  percent,
  fixed;

  static DiscountType fromName(String value) =>
      DiscountType.values.firstWhere(
        (e) => e.name == value,
        orElse: () => DiscountType.percent,
      );
}
