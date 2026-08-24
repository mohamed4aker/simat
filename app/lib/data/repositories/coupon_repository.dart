import '../models/models.dart';
import '../sources/local_store.dart';

/// نتيجة محاولة تطبيق كوبون.
class CouponResult {
  final Coupon? coupon;
  final double discount;
  final String? error;

  const CouponResult({this.coupon, this.discount = 0, this.error});

  bool get isValid => coupon != null && error == null;
}

/// إدارة كوبونات الخصم.
class CouponRepository {
  CouponRepository(this._store);

  final LocalStore _store;

  Future<List<Coupon>> all() async => _store.coupons();

  Future<CouponResult> apply(String code, double subtotal) async {
    final normalized = code.trim().toUpperCase();
    if (normalized.isEmpty) {
      return const CouponResult(error: 'اكتب كود الخصم');
    }
    Coupon? found;
    for (final coupon in _store.coupons()) {
      if (coupon.code.toUpperCase() == normalized) {
        found = coupon;
        break;
      }
    }
    if (found == null) {
      return const CouponResult(error: 'الكود ده مش موجود');
    }
    if (!found.isActive) {
      return const CouponResult(error: 'الكود ده متوقّف حالياً');
    }
    if (found.isExpired) {
      return const CouponResult(error: 'الكود ده انتهت صلاحيته');
    }
    if (found.isUsedUp) {
      return const CouponResult(error: 'الكود ده خلص عدد مرات استخدامه');
    }
    if (subtotal < found.minOrder) {
      return CouponResult(
        error: 'الكود ده للطلبات من ${found.minOrder.toStringAsFixed(0)} ج.م',
      );
    }
    return CouponResult(coupon: found, discount: found.discountFor(subtotal));
  }

  Future<void> markUsed(String code) async {
    final list = _store.coupons();
    final index =
        list.indexWhere((c) => c.code.toUpperCase() == code.toUpperCase());
    if (index == -1) return;
    list[index] = list[index].copyWith(usedCount: list[index].usedCount + 1);
    await _store.saveCoupons(list);
  }

  Future<void> save(Coupon coupon) async {
    final list = _store.coupons();
    final index = list.indexWhere(
      (c) => c.code.toUpperCase() == coupon.code.toUpperCase(),
    );
    if (index == -1) {
      list.add(coupon);
    } else {
      list[index] = coupon;
    }
    await _store.saveCoupons(list);
  }

  Future<void> delete(String code) async {
    final list = _store.coupons()
      ..removeWhere((c) => c.code.toUpperCase() == code.toUpperCase());
    await _store.saveCoupons(list);
  }
}
