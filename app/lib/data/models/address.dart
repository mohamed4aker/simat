/// عنوان الشحن.
class Address {
  final String id;
  final String label;
  final String fullName;
  final String phone;
  final String governorate;
  final String city;
  final String street;
  final String building;
  final String notes;
  final bool isDefault;

  const Address({
    required this.id,
    this.label = 'المنزل',
    required this.fullName,
    required this.phone,
    required this.governorate,
    required this.city,
    required this.street,
    this.building = '',
    this.notes = '',
    this.isDefault = false,
  });

  String get shortLine => '$governorate — $city';

  String get fullLine {
    final parts = [street, if (building.isNotEmpty) 'عقار $building', city, governorate];
    return parts.where((e) => e.trim().isNotEmpty).join('، ');
  }

  Address copyWith({
    String? label,
    String? fullName,
    String? phone,
    String? governorate,
    String? city,
    String? street,
    String? building,
    String? notes,
    bool? isDefault,
  }) =>
      Address(
        id: id,
        label: label ?? this.label,
        fullName: fullName ?? this.fullName,
        phone: phone ?? this.phone,
        governorate: governorate ?? this.governorate,
        city: city ?? this.city,
        street: street ?? this.street,
        building: building ?? this.building,
        notes: notes ?? this.notes,
        isDefault: isDefault ?? this.isDefault,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'label': label,
        'fullName': fullName,
        'phone': phone,
        'governorate': governorate,
        'city': city,
        'street': street,
        'building': building,
        'notes': notes,
        'isDefault': isDefault,
      };

  factory Address.fromJson(Map<String, dynamic> json) => Address(
        id: json['id'] as String,
        label: json['label'] as String? ?? 'المنزل',
        fullName: json['fullName'] as String? ?? '',
        phone: json['phone'] as String? ?? '',
        governorate: json['governorate'] as String? ?? '',
        city: json['city'] as String? ?? '',
        street: json['street'] as String? ?? '',
        building: json['building'] as String? ?? '',
        notes: json['notes'] as String? ?? '',
        isDefault: json['isDefault'] as bool? ?? false,
      );
}
