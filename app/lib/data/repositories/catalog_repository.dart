import 'package:uuid/uuid.dart';

import '../models/models.dart';
import '../sources/local_store.dart';

/// فلتر البحث في الكتالوج.
class ProductFilter {
  final String query;
  final String? categoryId;
  final Gender? gender;
  final Concentration? concentration;
  final double? minPrice;
  final double? maxPrice;
  final bool onlyInStock;
  final bool onlyOffers;
  final ProductSort sort;

  const ProductFilter({
    this.query = '',
    this.categoryId,
    this.gender,
    this.concentration,
    this.minPrice,
    this.maxPrice,
    this.onlyInStock = false,
    this.onlyOffers = false,
    this.sort = ProductSort.newest,
  });

  ProductFilter copyWith({
    String? query,
    String? categoryId,
    bool clearCategory = false,
    Gender? gender,
    bool clearGender = false,
    Concentration? concentration,
    bool clearConcentration = false,
    double? minPrice,
    double? maxPrice,
    bool clearPrice = false,
    bool? onlyInStock,
    bool? onlyOffers,
    ProductSort? sort,
  }) =>
      ProductFilter(
        query: query ?? this.query,
        categoryId: clearCategory ? null : (categoryId ?? this.categoryId),
        gender: clearGender ? null : (gender ?? this.gender),
        concentration: clearConcentration
            ? null
            : (concentration ?? this.concentration),
        minPrice: clearPrice ? null : (minPrice ?? this.minPrice),
        maxPrice: clearPrice ? null : (maxPrice ?? this.maxPrice),
        onlyInStock: onlyInStock ?? this.onlyInStock,
        onlyOffers: onlyOffers ?? this.onlyOffers,
        sort: sort ?? this.sort,
      );

  int get activeCount {
    var count = 0;
    if (categoryId != null) count++;
    if (gender != null) count++;
    if (concentration != null) count++;
    if (minPrice != null || maxPrice != null) count++;
    if (onlyInStock) count++;
    if (onlyOffers) count++;
    return count;
  }
}

enum ProductSort {
  newest,
  priceLow,
  priceHigh,
  topRated,
  bestSelling;

  String get labelAr => switch (this) {
        ProductSort.newest => 'الأحدث',
        ProductSort.priceLow => 'الأقل سعراً',
        ProductSort.priceHigh => 'الأعلى سعراً',
        ProductSort.topRated => 'الأعلى تقييماً',
        ProductSort.bestSelling => 'الأكثر مبيعاً',
      };
}

/// مصدر بيانات المنتجات والتصنيفات والتقييمات.
class CatalogRepository {
  CatalogRepository(this._store);

  final LocalStore _store;
  static const _uuid = Uuid();

  // ───────────── التصنيفات ─────────────

  Future<List<Category>> categories({bool includeInactive = false}) async {
    final list = _store.categories()
      ..sort((a, b) => a.sortOrder.compareTo(b.sortOrder));
    return includeInactive ? list : list.where((c) => c.isActive).toList();
  }

  Future<Category> saveCategory(Category category) async {
    final list = _store.categories();
    final index = list.indexWhere((c) => c.id == category.id);
    if (index == -1) {
      list.add(category);
    } else {
      list[index] = category;
    }
    await _store.saveCategories(list);
    return category;
  }

  Future<void> deleteCategory(String id) async {
    final list = _store.categories()..removeWhere((c) => c.id == id);
    await _store.saveCategories(list);
  }

  String newCategoryId() => 'cat_${_uuid.v4().substring(0, 8)}';

  // ───────────── المنتجات ─────────────

  Future<List<Product>> allProducts({bool includeInactive = false}) async {
    final list = _store.products();
    return includeInactive ? list : list.where((p) => p.isActive).toList();
  }

  Future<Product?> productById(String id) async {
    final list = _store.products();
    for (final product in list) {
      if (product.id == id) return product;
    }
    return null;
  }

  Future<List<Product>> search(ProductFilter filter) async {
    var list = _store.products().where((p) => p.isActive).toList();

    final query = filter.query.trim();
    if (query.isNotEmpty) {
      final needle = _normalize(query);
      list = list.where((p) {
        final haystack = _normalize([
          p.name,
          p.nameEn,
          p.brand,
          p.description,
          ...p.allNotes,
        ].join(' '));
        return haystack.contains(needle);
      }).toList();
    }

    if (filter.categoryId != null) {
      list = list.where((p) => p.categoryId == filter.categoryId).toList();
    }
    if (filter.gender != null) {
      list = list.where((p) => p.gender == filter.gender).toList();
    }
    if (filter.concentration != null) {
      list = list
          .where((p) => p.concentration == filter.concentration)
          .toList();
    }
    if (filter.minPrice != null) {
      list = list.where((p) => p.price >= filter.minPrice!).toList();
    }
    if (filter.maxPrice != null) {
      list = list.where((p) => p.price <= filter.maxPrice!).toList();
    }
    if (filter.onlyInStock) {
      list = list.where((p) => p.inStock).toList();
    }
    if (filter.onlyOffers) {
      list = list.where((p) => p.hasDiscount).toList();
    }

    switch (filter.sort) {
      case ProductSort.newest:
        list.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      case ProductSort.priceLow:
        list.sort((a, b) => a.price.compareTo(b.price));
      case ProductSort.priceHigh:
        list.sort((a, b) => b.price.compareTo(a.price));
      case ProductSort.topRated:
        list.sort((a, b) => b.rating.compareTo(a.rating));
      case ProductSort.bestSelling:
        list.sort((a, b) => b.soldCount.compareTo(a.soldCount));
    }
    return list;
  }

  Future<List<Product>> featured() async {
    final list = _store.products()
        .where((p) => p.isActive && p.isFeatured)
        .toList()
      ..sort((a, b) => b.rating.compareTo(a.rating));
    return list;
  }

  Future<List<Product>> newArrivals({int limit = 8}) async {
    final list = _store.products().where((p) => p.isActive).toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return list.take(limit).toList();
  }

  Future<List<Product>> bestSellers({int limit = 8}) async {
    final list = _store.products().where((p) => p.isActive).toList()
      ..sort((a, b) => b.soldCount.compareTo(a.soldCount));
    return list.take(limit).toList();
  }

  Future<List<Product>> offers({int limit = 10}) async {
    final list = _store.products()
        .where((p) => p.isActive && p.hasDiscount)
        .toList()
      ..sort((a, b) => b.discountPercent.compareTo(a.discountPercent));
    return list.take(limit).toList();
  }

  Future<List<Product>> related(Product product, {int limit = 6}) async {
    final list = _store.products()
        .where((p) =>
            p.isActive &&
            p.id != product.id &&
            (p.categoryId == product.categoryId || p.gender == product.gender))
        .toList()
      ..sort((a, b) => b.rating.compareTo(a.rating));
    return list.take(limit).toList();
  }

  Future<List<Product>> lowStock({int threshold = 5}) async {
    return _store.products()
        .where((p) => p.isActive && p.stock <= threshold)
        .toList()
      ..sort((a, b) => a.stock.compareTo(b.stock));
  }

  Future<Product> saveProduct(Product product) async {
    final list = _store.products();
    final index = list.indexWhere((p) => p.id == product.id);
    if (index == -1) {
      list.insert(0, product);
    } else {
      list[index] = product;
    }
    await _store.saveProducts(list);
    return product;
  }

  Future<void> deleteProduct(String id) async {
    final list = _store.products()..removeWhere((p) => p.id == id);
    await _store.saveProducts(list);
  }

  Future<void> setProductActive(String id, bool isActive) async {
    final list = _store.products();
    final index = list.indexWhere((p) => p.id == id);
    if (index == -1) return;
    list[index] = list[index].copyWith(isActive: isActive);
    await _store.saveProducts(list);
  }

  /// يخصم المخزون ويزوّد عدّاد المبيعات بعد تأكيد الطلب.
  Future<void> applyStockChanges(List<CartItem> items) async {
    final list = _store.products();
    for (final item in items) {
      final index = list.indexWhere((p) => p.id == item.productId);
      if (index == -1) continue;
      final product = list[index];
      final nextStock = (product.stock - item.quantity).clamp(0, 1 << 30);
      list[index] = product.copyWith(
        stock: nextStock,
        soldCount: product.soldCount + item.quantity,
      );
    }
    await _store.saveProducts(list);
  }

  String newProductId() => 'p_${_uuid.v4().substring(0, 8)}';

  // ───────────── التقييمات ─────────────

  Future<List<Review>> reviewsFor(String productId) async {
    final list = _store.reviews()
        .where((r) => r.productId == productId)
        .toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return list;
  }

  Future<void> addReview({
    required String productId,
    required AppUser user,
    required double rating,
    required String comment,
  }) async {
    final reviews = _store.reviews();
    reviews.add(
      Review(
        id: 'r_${_uuid.v4().substring(0, 8)}',
        productId: productId,
        userId: user.id,
        userName: user.name,
        rating: rating,
        comment: comment,
        createdAt: DateTime.now(),
      ),
    );
    await _store.saveReviews(reviews);

    // إعادة حساب متوسط التقييم للمنتج.
    final forProduct =
        reviews.where((r) => r.productId == productId).toList();
    final average =
        forProduct.fold<double>(0, (sum, r) => sum + r.rating) /
            forProduct.length;

    final products = _store.products();
    final index = products.indexWhere((p) => p.id == productId);
    if (index != -1) {
      products[index] = products[index].copyWith(
        rating: double.parse(average.toStringAsFixed(1)),
        ratingCount: forProduct.length,
      );
      await _store.saveProducts(products);
    }
  }

  /// يوحّد الحروف العربية عشان البحث يشتغل مع الهمزات والتاء المربوطة.
  static String _normalize(String value) {
    return value
        .toLowerCase()
        .replaceAll(RegExp('[أإآ]'), 'ا')
        .replaceAll('ة', 'ه')
        .replaceAll('ى', 'ي')
        .replaceAll(RegExp('[ً-ْ]'), '')
        .trim();
  }
}
