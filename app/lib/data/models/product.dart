import 'enums.dart';

/// حجم من أحجام الزجاجة وسعره (40 / 60 / 100 مل).
class Variant {
  final int sizeMl;
  final double price;

  const Variant({required this.sizeMl, required this.price});

  Map<String, dynamic> toJson() => {'sizeMl': sizeMl, 'price': price};

  factory Variant.fromJson(Map<String, dynamic> json) => Variant(
        sizeMl: (json['sizeMl'] ?? json['size_ml'] as num).toInt(),
        price: (json['price'] as num).toDouble(),
      );
}

/// الحجم اللي بيكون مختار أول ما صفحة المنتج تفتح.
const int kDefaultSizeMl = 60;

/// نموذج المنتج (العطر) — نفس شكل منتجات الموقع (GET /api/products).
class Product {
  final String id;
  final String slug;
  final String name;
  final String nameEn;
  final String brand;
  final String categoryId;
  final String description;
  final String descriptionEn;

  /// زجاجة ولا طقم عينات.
  final String kind;

  /// «Inspired by Black Opium»
  final String secondaryLine;
  final String tagline;
  final String shortDescription;

  /// العائلة العطرية «Amber Vanilla»
  final String familyEn;

  /// «Seductive, Energetic, Bold»
  final String scentCharacter;
  final List<String> accords;

  /// شخصية وسلوك العطر (Wear Profile)
  final String wearProfile;

  /// أوقات ومناسبات الاستخدام (Best for)
  final String occasion;

  /// عطور تتركب معاه (Layer It With)
  final List<String> related;

  /// الأحجام وأسعارها. فاضية = حجم واحد بسعر [price].
  final List<Variant> variants;

  /// السعر الحالي بالجنيه المصري (سعر الحجم الافتراضي).
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

  /// صورة الزجاجة وسط المكونات الطبيعية.
  final String? hoverImagePath;

  const Product({
    required this.id,
    String? slug,
    required this.name,
    required this.nameEn,
    required this.brand,
    required this.categoryId,
    required this.description,
    this.descriptionEn = '',
    this.kind = 'bottle',
    this.secondaryLine = '',
    this.tagline = '',
    this.shortDescription = '',
    this.familyEn = '',
    this.scentCharacter = '',
    this.accords = const [],
    this.wearProfile = '',
    this.occasion = '',
    this.related = const [],
    this.variants = const [],
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
    this.hoverImagePath,
  }) : slug = slug ?? id;

  bool get inStock => stock > 0;
  bool get isLowStock => stock > 0 && stock <= 5;
  bool get hasDiscount => oldPrice != null && oldPrice! > price;
  bool get isSet => kind == 'set';

  int get discountPercent =>
      hasDiscount ? (((oldPrice! - price) / oldPrice!) * 100).round() : 0;

  List<String> get allNotes => [...topNotes, ...heartNotes, ...baseNotes];

  /// الأحجام المتاحة مترتبة من الصغير للكبير.
  List<Variant> get sizes {
    if (variants.isEmpty) return [Variant(sizeMl: sizeMl, price: price)];
    return [...variants]..sort((a, b) => a.sizeMl.compareTo(b.sizeMl));
  }

  /// 60 مل لو موجود، وإلا أول حجم.
  Variant get defaultVariant => sizes.firstWhere(
        (v) => v.sizeMl == kDefaultSizeMl,
        orElse: () => sizes.first,
      );

  double priceFor(int size) => sizes
      .firstWhere((v) => v.sizeMl == size, orElse: () => defaultVariant)
      .price;

  /// «NOCTURNE» — الاسم من غير كلمة SIMAT.
  String get shortName {
    final base = nameEn.isNotEmpty ? nameEn : name;
    return base.replaceFirst(RegExp(r'^SIMAT\s+', caseSensitive: false), '');
  }

  /// «NOCTURNE — Eau de Parfum»
  String get displayName =>
      isSet ? name : '$shortName — ${concentration.labelEn}';

  /// «حريمي · مستوحى من Black Opium»
  String get subLine {
    if (isSet) return secondaryLine;
    final match =
        RegExp(r'^Inspired by\s+(.+)$', caseSensitive: false).firstMatch(secondaryLine);
    final inspiration =
        match != null ? 'مستوحى من ${match.group(1)}' : secondaryLine;
    return [gender.labelAr, inspiration].where((e) => e.isNotEmpty).join(' · ');
  }

  /// الوصف — بالعربي لو موجود، وإلا الإنجليزي.
  String get bestDescription =>
      description.isNotEmpty ? description : descriptionEn;

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
    List<Variant>? variants,
  }) {
    return Product(
      id: id,
      slug: slug,
      name: name ?? this.name,
      nameEn: nameEn ?? this.nameEn,
      brand: brand ?? this.brand,
      categoryId: categoryId ?? this.categoryId,
      description: description ?? this.description,
      descriptionEn: descriptionEn,
      kind: kind,
      secondaryLine: secondaryLine,
      tagline: tagline,
      shortDescription: shortDescription,
      familyEn: familyEn,
      scentCharacter: scentCharacter,
      accords: accords,
      wearProfile: wearProfile,
      occasion: occasion,
      related: related,
      variants: variants ?? this.variants,
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
      hoverImagePath: hoverImagePath,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'slug': slug,
        'name': name,
        'nameEn': nameEn,
        'brand': brand,
        'categoryId': categoryId,
        'description': description,
        'descriptionEn': descriptionEn,
        'kind': kind,
        'secondaryLine': secondaryLine,
        'tagline': tagline,
        'shortDescription': shortDescription,
        'familyEn': familyEn,
        'scentCharacter': scentCharacter,
        'accords': accords,
        'wearProfile': wearProfile,
        'occasion': occasion,
        'related': related,
        'variants': variants.map((v) => v.toJson()).toList(),
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
        'hoverImagePath': hoverImagePath,
      };

  /// بيقبل شكل التخزين المحلي وشكل الموقع (GET /api/products) الاتنين.
  factory Product.fromJson(Map<String, dynamic> json) {
    List<String> strings(String key) =>
        (json[key] as List?)?.map((e) => e.toString()).toList() ?? const [];
    List<String> notes(String ar, String en) {
      final local = strings(ar);
      return local.isNotEmpty ? local : strings(en);
    }

    return Product(
      id: json['id'] as String,
      slug: json['slug'] as String?,
      name: json['name'] as String? ?? '',
      nameEn: json['nameEn'] as String? ?? '',
      brand: json['brand'] as String? ?? 'SIMAT',
      categoryId: json['categoryId'] as String? ?? '',
      description: json['description'] as String? ?? '',
      descriptionEn: json['descriptionEn'] as String? ?? '',
      kind: json['kind'] as String? ?? 'bottle',
      secondaryLine: json['secondaryLine'] as String? ?? '',
      tagline: json['tagline'] as String? ?? '',
      shortDescription: json['shortDescription'] as String? ?? '',
      familyEn: json['familyEn'] as String? ?? '',
      scentCharacter: json['scentCharacter'] as String? ?? '',
      accords: strings('accords'),
      wearProfile: json['wearProfile'] as String? ?? '',
      occasion: json['occasion'] as String? ?? '',
      related: strings('related'),
      variants: (json['variants'] as List?)
              ?.map((e) => Variant.fromJson(e as Map<String, dynamic>))
              .toList() ??
          const [],
      price: (json['price'] as num).toDouble(),
      oldPrice: (json['oldPrice'] as num?)?.toDouble(),
      sizeMl: (json['sizeMl'] as num?)?.toInt() ?? kDefaultSizeMl,
      gender: Gender.fromName(json['gender'] as String? ?? 'unisex'),
      concentration:
          Concentration.fromName(json['concentration'] as String? ?? 'edp'),
      topNotes: notes('topNotes', 'topNotesEn'),
      heartNotes: notes('heartNotes', 'heartNotesEn'),
      baseNotes: notes('baseNotes', 'baseNotesEn'),
      longevityHours: (json['longevityHours'] as num?)?.toInt() ?? 8,
      stock: (json['stock'] as num?)?.toInt() ?? 0,
      rating: (json['rating'] as num?)?.toDouble() ?? 0,
      ratingCount: (json['ratingCount'] as num?)?.toInt() ?? 0,
      soldCount: (json['soldCount'] as num?)?.toInt() ?? 0,
      isFeatured: json['isFeatured'] as bool? ?? false,
      isActive: json['isActive'] as bool? ?? true,
      createdAt: DateTime.tryParse(json['createdAt'] as String? ?? '') ??
          DateTime.now(),
      imagePath: (json['imagePath'] ?? json['imageUrl']) as String?,
      hoverImagePath: (json['hoverImagePath'] ?? json['hoverImageUrl']) as String?,
    );
  }
}
