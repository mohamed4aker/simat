import 'dart:convert';

import 'package:shared_preferences/shared_preferences.dart';

import '../models/models.dart';
import 'seed_data.dart';

/// طبقة التخزين المحلي.
///
/// دي النسخة «المحلية» من قاعدة البيانات: كل حاجة متخزّنة على الجهاز
/// بصيغة JSON. لما نربط بالباك إند (Supabase / Firebase / API خاص)
/// بنستبدل الـ Repositories بس، والواجهات كلها تفضل زي ما هي.
class LocalStore {
  LocalStore._(this._prefs);

  final SharedPreferences _prefs;

  static LocalStore? _instance;
  static LocalStore get instance {
    final value = _instance;
    if (value == null) {
      throw StateError('LocalStore.init() لازم تتنادى قبل الاستخدام');
    }
    return value;
  }

  static const String _kSeedVersion = 'simat.seed.version';
  static const int seedVersion = 2;

  static const String kProducts = 'simat.products';
  static const String kCategories = 'simat.categories';
  static const String kUsers = 'simat.users';
  static const String kOrders = 'simat.orders';
  static const String kReviews = 'simat.reviews';
  static const String kCoupons = 'simat.coupons';
  static const String kCart = 'simat.cart';
  static const String kSession = 'simat.session';
  static const String kOnboarded = 'simat.onboarded';

  static Future<LocalStore> init() async {
    final prefs = await SharedPreferences.getInstance();
    final store = LocalStore._(prefs);
    _instance = store;
    await store._seedIfNeeded();
    return store;
  }

  Future<void> _seedIfNeeded() async {
    final current = _prefs.getInt(_kSeedVersion) ?? 0;
    if (current >= seedVersion) return;

    await writeList(kCategories, SeedData.categories().map((e) => e.toJson()));
    await writeList(kProducts, SeedData.products().map((e) => e.toJson()));
    await writeList(kUsers, SeedData.users().map((e) => e.toJson()));
    await writeList(kOrders, SeedData.orders().map((e) => e.toJson()));
    await writeList(kReviews, SeedData.reviews().map((e) => e.toJson()));
    await writeList(kCoupons, SeedData.coupons().map((e) => e.toJson()));
    await _prefs.setInt(_kSeedVersion, seedVersion);
  }

  /// يمسح كل البيانات ويرجّع البيانات التجريبية من الأول.
  Future<void> resetToSeed() async {
    await _prefs.remove(kCart);
    await _prefs.remove(kSession);
    await _prefs.setInt(_kSeedVersion, 0);
    await _seedIfNeeded();
  }

  // ───────────────── قراءة/كتابة عامة ─────────────────

  List<Map<String, dynamic>> readList(String key) {
    final raw = _prefs.getString(key);
    if (raw == null || raw.isEmpty) return [];
    final decoded = jsonDecode(raw);
    if (decoded is! List) return [];
    return decoded.cast<Map<String, dynamic>>();
  }

  Future<void> writeList(
    String key,
    Iterable<Map<String, dynamic>> value,
  ) async {
    await _prefs.setString(key, jsonEncode(value.toList()));
  }

  Map<String, dynamic>? readMap(String key) {
    final raw = _prefs.getString(key);
    if (raw == null || raw.isEmpty) return null;
    final decoded = jsonDecode(raw);
    return decoded is Map<String, dynamic> ? decoded : null;
  }

  Future<void> writeMap(String key, Map<String, dynamic> value) =>
      _prefs.setString(key, jsonEncode(value));

  Future<void> remove(String key) => _prefs.remove(key);

  String? readString(String key) => _prefs.getString(key);
  Future<void> writeString(String key, String value) =>
      _prefs.setString(key, value);

  bool readBool(String key, {bool fallback = false}) =>
      _prefs.getBool(key) ?? fallback;
  Future<void> writeBool(String key, bool value) =>
      _prefs.setBool(key, value);

  // ───────────────── مساعدات مكتوبة بأنواع ─────────────────

  List<Product> products() =>
      readList(kProducts).map(Product.fromJson).toList();
  Future<void> saveProducts(List<Product> value) =>
      writeList(kProducts, value.map((e) => e.toJson()));

  List<Category> categories() =>
      readList(kCategories).map(Category.fromJson).toList();
  Future<void> saveCategories(List<Category> value) =>
      writeList(kCategories, value.map((e) => e.toJson()));

  List<AppUser> users() => readList(kUsers).map(AppUser.fromJson).toList();
  Future<void> saveUsers(List<AppUser> value) =>
      writeList(kUsers, value.map((e) => e.toJson()));

  List<Order> orders() => readList(kOrders).map(Order.fromJson).toList();
  Future<void> saveOrders(List<Order> value) =>
      writeList(kOrders, value.map((e) => e.toJson()));

  List<Review> reviews() => readList(kReviews).map(Review.fromJson).toList();
  Future<void> saveReviews(List<Review> value) =>
      writeList(kReviews, value.map((e) => e.toJson()));

  List<Coupon> coupons() => readList(kCoupons).map(Coupon.fromJson).toList();
  Future<void> saveCoupons(List<Coupon> value) =>
      writeList(kCoupons, value.map((e) => e.toJson()));

  List<CartItem> cart() => readList(kCart).map(CartItem.fromJson).toList();
  Future<void> saveCart(List<CartItem> value) =>
      writeList(kCart, value.map((e) => e.toJson()));
}
