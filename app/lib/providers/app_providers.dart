import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../data/models/models.dart';
import '../data/repositories/auth_repository.dart';
import '../data/repositories/catalog_repository.dart';
import '../data/repositories/coupon_repository.dart';
import '../data/repositories/order_repository.dart';
import '../data/repositories/reports_repository.dart';
import '../data/sources/local_store.dart';

/// يتحقن من `main()` بعد تهيئة التخزين.
final localStoreProvider = Provider<LocalStore>(
  (ref) => throw UnimplementedError('localStoreProvider لازم يتعمله override'),
);

/// عدّاد يتزوّد بعد أي تعديل على البيانات، فيعيد بناء كل القوائم.
final dataRevisionProvider = StateProvider<int>((ref) => 0);

/// تُستدعى من الواجهات بعد أي تعديل (إضافة منتج، تغيير حالة طلب...).
void bumpData(WidgetRef ref) =>
    ref.read(dataRevisionProvider.notifier).state++;

// ───────────────────────── المستودعات ─────────────────────────

final catalogRepositoryProvider = Provider<CatalogRepository>(
  (ref) => CatalogRepository(ref.watch(localStoreProvider)),
);

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepository(ref.watch(localStoreProvider)),
);

final orderRepositoryProvider = Provider<OrderRepository>(
  (ref) => OrderRepository(ref.watch(localStoreProvider)),
);

final couponRepositoryProvider = Provider<CouponRepository>(
  (ref) => CouponRepository(ref.watch(localStoreProvider)),
);

final reportsRepositoryProvider = Provider<ReportsRepository>(
  (ref) => ReportsRepository(ref.watch(localStoreProvider)),
);

// ───────────────────────── المصادقة ─────────────────────────

class AuthController extends StateNotifier<AppUser?> {
  AuthController(this._repository, this._ref) : super(_repository.currentUser());

  final AuthRepository _repository;
  final Ref _ref;

  void _bump() => _ref.read(dataRevisionProvider.notifier).state++;

  Future<void> login({required String phone, required String password}) async {
    state = await _repository.login(phone: phone, password: password);
    _bump();
  }

  Future<void> register({
    required String name,
    required String phone,
    required String password,
    String email = '',
  }) async {
    state = await _repository.register(
      name: name,
      phone: phone,
      password: password,
      email: email,
    );
    _bump();
  }

  Future<void> logout() async {
    await _repository.logout();
    state = null;
    _bump();
  }

  Future<void> updateProfile({
    String? name,
    String? phone,
    String? email,
  }) async {
    final user = state;
    if (user == null) return;
    state = await _repository.updateUser(
      user.copyWith(name: name, phone: phone, email: email),
    );
    _bump();
  }

  Future<void> changePassword(String oldPassword, String newPassword) async {
    final user = state;
    if (user == null) return;
    state = await _repository.changePassword(
      user: user,
      oldPassword: oldPassword,
      newPassword: newPassword,
    );
  }

  Future<void> saveAddress(Address address) async {
    final user = state;
    if (user == null) return;
    state = await _repository.saveAddress(user, address);
    _bump();
  }

  Future<void> deleteAddress(String addressId) async {
    final user = state;
    if (user == null) return;
    state = await _repository.deleteAddress(user, addressId);
    _bump();
  }

  Future<void> toggleFavorite(String productId) async {
    final user = state;
    if (user == null) return;
    state = await _repository.toggleFavorite(user, productId);
    _bump();
  }

  /// يعيد تحميل بيانات المستخدم من التخزين.
  void refresh() => state = _repository.currentUser();
}

final authControllerProvider =
    StateNotifierProvider<AuthController, AppUser?>(
  (ref) => AuthController(ref.watch(authRepositoryProvider), ref),
);

final isLoggedInProvider =
    Provider<bool>((ref) => ref.watch(authControllerProvider) != null);

final isAdminProvider = Provider<bool>(
  (ref) => ref.watch(authControllerProvider)?.isAdmin ?? false,
);

// ───────────────────────── عربة التسوق ─────────────────────────

class CartController extends StateNotifier<List<CartItem>> {
  CartController(this._store) : super(_store.cart());

  final LocalStore _store;

  Future<void> _persist() => _store.saveCart(state);

  void add(Product product, {int quantity = 1}) {
    final index = state.indexWhere((e) => e.productId == product.id);
    if (index == -1) {
      state = [...state, CartItem.fromProduct(product, quantity: quantity)];
    } else {
      final next = [...state];
      final item = next[index];
      final total = (item.quantity + quantity).clamp(1, product.stock == 0 ? 99 : product.stock);
      next[index] = item.copyWith(quantity: total);
      state = next;
    }
    _persist();
  }

  void setQuantity(String productId, int quantity) {
    if (quantity <= 0) return remove(productId);
    state = [
      for (final item in state)
        if (item.productId == productId)
          item.copyWith(quantity: quantity)
        else
          item,
    ];
    _persist();
  }

  void remove(String productId) {
    state = state.where((e) => e.productId != productId).toList();
    _persist();
  }

  void clear() {
    state = [];
    _persist();
  }

  bool contains(String productId) =>
      state.any((e) => e.productId == productId);

  int quantityOf(String productId) {
    for (final item in state) {
      if (item.productId == productId) return item.quantity;
    }
    return 0;
  }
}

final cartControllerProvider =
    StateNotifierProvider<CartController, List<CartItem>>(
  (ref) => CartController(ref.watch(localStoreProvider)),
);

final cartSubtotalProvider = Provider<double>((ref) {
  final items = ref.watch(cartControllerProvider);
  return items.fold<double>(0, (sum, e) => sum + e.total);
});

final cartCountProvider = Provider<int>((ref) {
  final items = ref.watch(cartControllerProvider);
  return items.fold<int>(0, (sum, e) => sum + e.quantity);
});

// ───────────────────────── الكتالوج ─────────────────────────

final categoriesProvider = FutureProvider<List<Category>>((ref) {
  ref.watch(dataRevisionProvider);
  return ref.watch(catalogRepositoryProvider).categories();
});

final featuredProductsProvider = FutureProvider<List<Product>>((ref) {
  ref.watch(dataRevisionProvider);
  return ref.watch(catalogRepositoryProvider).featured();
});

final newArrivalsProvider = FutureProvider<List<Product>>((ref) {
  ref.watch(dataRevisionProvider);
  return ref.watch(catalogRepositoryProvider).newArrivals();
});

final bestSellersProvider = FutureProvider<List<Product>>((ref) {
  ref.watch(dataRevisionProvider);
  return ref.watch(catalogRepositoryProvider).bestSellers();
});

final offersProvider = FutureProvider<List<Product>>((ref) {
  ref.watch(dataRevisionProvider);
  return ref.watch(catalogRepositoryProvider).offers();
});

final productFilterProvider =
    StateProvider<ProductFilter>((ref) => const ProductFilter());

final filteredProductsProvider = FutureProvider<List<Product>>((ref) {
  ref.watch(dataRevisionProvider);
  final filter = ref.watch(productFilterProvider);
  return ref.watch(catalogRepositoryProvider).search(filter);
});

final productByIdProvider =
    FutureProvider.family<Product?, String>((ref, id) {
  ref.watch(dataRevisionProvider);
  return ref.watch(catalogRepositoryProvider).productById(id);
});

final productReviewsProvider =
    FutureProvider.family<List<Review>, String>((ref, productId) {
  ref.watch(dataRevisionProvider);
  return ref.watch(catalogRepositoryProvider).reviewsFor(productId);
});

final relatedProductsProvider =
    FutureProvider.family<List<Product>, String>((ref, productId) async {
  ref.watch(dataRevisionProvider);
  final repository = ref.watch(catalogRepositoryProvider);
  final product = await repository.productById(productId);
  if (product == null) return const [];
  return repository.related(product);
});

final favoriteProductsProvider = FutureProvider<List<Product>>((ref) async {
  ref.watch(dataRevisionProvider);
  final user = ref.watch(authControllerProvider);
  if (user == null || user.favorites.isEmpty) return const [];
  final all = await ref.watch(catalogRepositoryProvider).allProducts();
  return all.where((p) => user.favorites.contains(p.id)).toList();
});

/// كل المنتجات بما فيها الموقوفة — للوحة الأدمن.
final adminProductsProvider = FutureProvider<List<Product>>((ref) {
  ref.watch(dataRevisionProvider);
  return ref
      .watch(catalogRepositoryProvider)
      .allProducts(includeInactive: true);
});

final adminCategoriesProvider = FutureProvider<List<Category>>((ref) {
  ref.watch(dataRevisionProvider);
  return ref
      .watch(catalogRepositoryProvider)
      .categories(includeInactive: true);
});

// ───────────────────────── الطلبات ─────────────────────────

final myOrdersProvider = FutureProvider<List<Order>>((ref) {
  ref.watch(dataRevisionProvider);
  final user = ref.watch(authControllerProvider);
  if (user == null) return Future.value(const []);
  return ref.watch(orderRepositoryProvider).ordersFor(user.id);
});

final allOrdersProvider = FutureProvider<List<Order>>((ref) {
  ref.watch(dataRevisionProvider);
  return ref.watch(orderRepositoryProvider).allOrders();
});

final orderByIdProvider = FutureProvider.family<Order?, String>((ref, id) {
  ref.watch(dataRevisionProvider);
  return ref.watch(orderRepositoryProvider).orderById(id);
});

// ───────────────────────── العملاء والكوبونات ─────────────────────────

final customersProvider = FutureProvider<List<AppUser>>((ref) {
  ref.watch(dataRevisionProvider);
  return ref.watch(authRepositoryProvider).allUsers();
});

final couponsProvider = FutureProvider<List<Coupon>>((ref) {
  ref.watch(dataRevisionProvider);
  return ref.watch(couponRepositoryProvider).all();
});

// ───────────────────────── التقارير ─────────────────────────

final reportRangeProvider =
    StateProvider<ReportRange>((ref) => ReportRange.month);

final dashboardReportProvider = FutureProvider<DashboardReport>((ref) {
  ref.watch(dataRevisionProvider);
  final range = ref.watch(reportRangeProvider);
  return ref.watch(reportsRepositoryProvider).build(range);
});
