import 'enums.dart';

/// نموذج المنتج (العطر).
class Product {
  final String id;
  final String name;
  final String nameEn;
  final String brand;
  final String categoryId;
  final String description;

  /// السعر الحالي بالجنيه المصري.
  final double price;

  /// السعر قبل الخصم (اختياري) — لعرض شارة التخفيض.
  final double? oldPrice;

  final int sizeMl;
  final Gender gender;
  final Concentration concentration;

  /// الهرم العطري.
  final List<String> topNotes;
  final List<String> heartNotes;
  final List<String> baseNotes;

  /// ثبات العطر بالساعات (تقريبي).
  final int longevityHours;

  final int stock;
  final double rating;
  final int ratingCount;
  final int soldCount;

  final bool isFeatured;
  final bool isActive;
  final DateTime createdAt;

  /// مسار صورة (أصل محلي أو رابط). لو فاضي يُرسم شكل زجاجة بألوان الهوية.
  final String? imagePath;

  const Product({
    required this.id,
    required this.name,
    required this.nameEn,
    required this.brand,
    required this.categoryId,
    required this.description,
    required this.price,
    this.oldPrice,
    required this.sizeMl,
    required this.gender,
    required this.concentration,
    this.topNotes = const [],
    this.heartNotes = const [],
    this.baseNotes = const [],
    this.longevityHours = 8,
    required this.stock,
    this.rating = 0,
    this.ratingCount = 0,
    this.soldCount = 0,
    this.isFeatured = false,
    this.isActive = true,
    required this.createdAt,
    this.imagePath,
  });

  bool get inStock => stock > 0;
  bool get isLowStock => stock > 0 && stock <= 5;
  bool get hasDiscount => oldPrice != null && oldPrice! > price;

  int get discountPercent =>
      hasDiscount ? (((oldPrice! - price) / oldPrice!) * 100).round() : 0;

  List<String> get allNotes => [...topNotes, ...heartNotes, ...baseNotes];

  Product copyWith({
    String? name,
    String? nameEn,
    String? brand,
    String? categoryId,
    String? description,
    double? price,
    double? oldPrice,
    bool clearOldPrice = false,
    int? sizeMl,
    Gender? gender,
    Concentration? concentration,
    List<String>? topNotes,
    List<String>? heartNotes,
    List<String>? baseNotes,
    int? longevityHours,
    int? stock,
    double? rating,
    int? ratingCount,
    int? soldCount,
    bool? isFeatured,
    bool? isActive,
    String? imagePath,
  }) {
    return Product(
      id: id,
      name: name ?? this.name,
      nameEn: nameEn ?? this.nameEn,
      brand: brand ?? this.brand,
      categoryId: categoryId ?? this.categoryId,
      description: description ?? this.description,
      price: price ?? this.price,
      oldPrice: clearOldPrice ? null : (oldPrice ?? this.oldPrice),
      sizeMl: sizeMl ?? this.sizeMl,
      gender: gender ?? this.gender,
      concentration: concentration ?? this.concentration,
      topNotes: topNotes ?? this.topNotes,
      heartNotes: heartNotes ?? this.heartNotes,
      baseNotes: baseNotes ?? this.baseNotes,
      longevityHours: longevityHours ?? this.longevityHours,
      stock: stock ?? this.stock,
      rating: rating ?? this.rating,
      ratingCount: ratingCount ?? this.ratingCount,
      soldCount: soldCount ?? this.soldCount,
      isFeatured: isFeatured ?? this.isFeatured,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt,
      imagePath: imagePath ?? this.imagePath,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'nameEn': nameEn,
        'brand': brand,
        'categoryId': categoryId,
        'description': description,
        'price': price,
        'oldPrice': oldPrice,
        'sizeMl': sizeMl,
        'gender': gender.name,
        'concentration': concentration.name,
        'topNotes': topNotes,
        'heartNotes': heartNotes,
        'baseNotes': baseNotes,
        'longevityHours': longevityHours,
        'stock': stock,
        'rating': rating,
        'ratingCount': ratingCount,
        'soldCount': soldCount,
        'isFeatured': isFeatured,
        'isActive': isActive,
        'createdAt': createdAt.toIso8601String(),
        'imagePath': imagePath,
      };

  factory Product.fromJson(Map<String, dynamic> json) => Product(
        id: json['id'] as String,
        name: json['name'] as String,
        nameEn: json['nameEn'] as String? ?? '',
        brand: json['brand'] as String? ?? 'SIMAT',
        categoryId: json['categoryId'] as String,
        description: json['description'] as String? ?? '',
        price: (json['price'] as num).toDouble(),
        oldPrice: (json['oldPrice'] as num?)?.toDouble(),
        sizeMl: json['sizeMl'] as int? ?? 50,
        gender: Gender.fromName(json['gender'] as String? ?? 'unisex'),
        concentration:
            Concentration.fromName(json['concentration'] as String? ?? 'edp'),
        topNotes: (json['topNotes'] as List?)?.cast<String>() ?? const [],
        heartNotes: (json['heartNotes'] as List?)?.cast<String>() ?? const [],
        baseNotes: (json['baseNotes'] as List?)?.cast<String>() ?? const [],
        longevityHours: json['longevityHours'] as int? ?? 8,
        stock: json['stock'] as int? ?? 0,
        rating: (json['rating'] as num?)?.toDouble() ?? 0,
        ratingCount: json['ratingCount'] as int? ?? 0,
        soldCount: json['soldCount'] as int? ?? 0,
        isFeatured: json['isFeatured'] as bool? ?? false,
        isActive: json['isActive'] as bool? ?? true,
        createdAt: DateTime.parse(json['createdAt'] as String),
        imagePath: json['imagePath'] as String?,
      );
}
