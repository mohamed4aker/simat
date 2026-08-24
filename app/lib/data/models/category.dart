/// تصنيف المنتجات (عطور شرقية، فرنسية، عود، ...).
class Category {
  final String id;
  final String name;
  final String nameEn;
  final String description;

  /// رمز أيقونة من مجموعة Material (يُحوَّل في واجهة العرض).
  final String iconKey;
  final int sortOrder;
  final bool isActive;

  const Category({
    required this.id,
    required this.name,
    this.nameEn = '',
    this.description = '',
    this.iconKey = 'bottle',
    this.sortOrder = 0,
    this.isActive = true,
  });

  Category copyWith({
    String? name,
    String? nameEn,
    String? description,
    String? iconKey,
    int? sortOrder,
    bool? isActive,
  }) =>
      Category(
        id: id,
        name: name ?? this.name,
        nameEn: nameEn ?? this.nameEn,
        description: description ?? this.description,
        iconKey: iconKey ?? this.iconKey,
        sortOrder: sortOrder ?? this.sortOrder,
        isActive: isActive ?? this.isActive,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'nameEn': nameEn,
        'description': description,
        'iconKey': iconKey,
        'sortOrder': sortOrder,
        'isActive': isActive,
      };

  factory Category.fromJson(Map<String, dynamic> json) => Category(
        id: json['id'] as String,
        name: json['name'] as String,
        nameEn: json['nameEn'] as String? ?? '',
        description: json['description'] as String? ?? '',
        iconKey: json['iconKey'] as String? ?? 'bottle',
        sortOrder: json['sortOrder'] as int? ?? 0,
        isActive: json['isActive'] as bool? ?? true,
      );
}
