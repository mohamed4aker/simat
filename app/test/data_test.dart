import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:simat/core/constants/app_constants.dart';
import 'package:simat/data/models/models.dart';
import 'package:simat/data/repositories/catalog_repository.dart';
import 'package:simat/data/repositories/coupon_repository.dart';
import 'package:simat/data/repositories/reports_repository.dart';
import 'package:simat/data/sources/local_store.dart';

void main() {
  late LocalStore store;

  setUp(() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    SharedPreferences.setMockInitialValues({});
    store = await LocalStore.init();
  });

  group('الكوبونات', () {
    test('خصم النسبة بيتقيّد بالحد الأقصى', () {
      final coupon = Coupon(
        code: 'X',
        type: DiscountType.percent,
        value: 20,
        maxDiscount: 100,
        expiresAt: DateTime.now().add(const Duration(days: 1)),
      );
      expect(coupon.discountFor(1000), 100);
      expect(coupon.discountFor(300), 60);
    });

    test('الكوبون المنتهي مبيخصمش', () {
      final coupon = Coupon(
        code: 'X',
        type: DiscountType.fixed,
        value: 50,
        expiresAt: DateTime.now().subtract(const Duration(days: 1)),
      );
      expect(coupon.isUsable, isFalse);
      expect(coupon.discountFor(1000), 0);
    });

    test('الكوبون بيترفض تحت الحد الأدنى للطلب', () async {
      final repository = CouponRepository(store);
      // SIMAT15 للطلبات من 3000 ج.م
      final result = await repository.apply('SIMAT15', 500);
      expect(result.isValid, isFalse);
      expect(result.error, isNotNull);
    });

    test('كود غير موجود بيرجّع رسالة خطأ', () async {
      final repository = CouponRepository(store);
      final result = await repository.apply('NOPE', 5000);
      expect(result.isValid, isFalse);
    });
  });

  group('العربة والطلب', () {
    test('إجمالي عنصر العربة = السعر × الكمية', () {
      const item = CartItem(
        productId: 'p',
        name: 'عطر',
        brand: 'SIMAT',
        unitPrice: 250,
        sizeMl: 50,
        quantity: 3,
      );
      expect(item.total, 750);
    });

    test('إجمالي الطلب = المجموع + الشحن - الخصم', () {
      final order = Order(
        id: 'o',
        orderNumber: 'SM-1',
        userId: 'u',
        customerName: 'عميل',
        customerPhone: '01000000000',
        items: const [
          CartItem(
            productId: 'p',
            name: 'عطر',
            brand: 'SIMAT',
            unitPrice: 500,
            sizeMl: 50,
            quantity: 2,
          ),
        ],
        address: const Address(
          id: 'a',
          fullName: 'عميل',
          phone: '01000000000',
          governorate: 'القاهرة',
          city: 'مدينة نصر',
          street: 'شارع',
        ),
        paymentMethod: PaymentMethod.cashOnDelivery,
        subtotal: 1000,
        shipping: 50,
        discount: 100,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      expect(order.total, 950);
      expect(order.itemsCount, 2);
    });
  });

  group('الشحن', () {
    test('مجاني فوق حد الشحن المجاني', () {
      expect(AppConstants.shippingFor('أسوان', 2000), 0);
    });

    test('بيختلف حسب المحافظة', () {
      expect(
        AppConstants.shippingFor('القاهرة', 500),
        lessThan(AppConstants.shippingFor('أسوان', 500)),
      );
    });
  });

  group('البحث في الكتالوج', () {
    test('الكتالوج فيه عطور الشيت بالأحجام', () async {
      final repository = CatalogRepository(store);
      final nocturne = await repository.productById('nocturne');
      expect(nocturne, isNotNull);
      expect(nocturne!.displayName, 'NOCTURNE — Eau de Parfum');
      expect(nocturne.subLine, 'حريمي · مستوحى من Black Opium');
      expect(nocturne.sizes.map((v) => v.sizeMl), [40, 60, 100]);
      expect(nocturne.defaultVariant.sizeMl, 60);
      expect(nocturne.related, isNotEmpty);
    });

    test('بيلاقي المنتج بالنوتة العطرية والعطر المستوحى منه', () async {
      final repository = CatalogRepository(store);
      final bySaffron = await repository.search(
        const ProductFilter(query: 'saffron'),
      );
      final byInspiration = await repository.search(
        const ProductFilter(query: 'Black Opium'),
      );
      expect(bySaffron, isNotEmpty);
      expect(byInspiration.first.id, 'nocturne');
    });

    test('العربة بتفصل نفس العطر بأحجام مختلفة', () async {
      final repository = CatalogRepository(store);
      final p = (await repository.productById('nocturne'))!;
      final small = CartItem.fromProduct(p, sizeMl: 40);
      final big = CartItem.fromProduct(p, sizeMl: 100);
      expect(small.key, isNot(big.key));
      expect(small.unitPrice, lessThan(big.unitPrice));
    });

    test('فلتر العروض بيرجّع المخفّض بس', () async {
      final repository = CatalogRepository(store);
      final results = await repository.search(
        const ProductFilter(onlyOffers: true),
      );
      expect(results.every((p) => p.hasDiscount), isTrue);
    });

    test('الترتيب بالسعر تصاعدياً شغّال', () async {
      final repository = CatalogRepository(store);
      final results = await repository.search(
        const ProductFilter(sort: ProductSort.priceLow),
      );
      for (var i = 1; i < results.length; i++) {
        expect(
          results[i].defaultVariant.price,
          greaterThanOrEqualTo(results[i - 1].defaultVariant.price),
        );
      }
    });
  });

  group('المخزون', () {
    test('الطلب بيخصم من المخزون ويزوّد المبيعات', () async {
      final repository = CatalogRepository(store);
      final before = await repository.productById('nocturne');
      await repository.applyStockChanges([
        CartItem.fromProduct(before!, quantity: 2),
      ]);
      final after = await repository.productById('nocturne');
      expect(after!.stock, before.stock - 2);
      expect(after.soldCount, before.soldCount + 2);
    });
  });

  group('التقارير', () {
    test('الملغي والمرتجع مش محسوبين في الإيراد', () {
      expect(OrderStatus.cancelled.countsAsRevenue, isFalse);
      expect(OrderStatus.returned.countsAsRevenue, isFalse);
      expect(OrderStatus.delivered.countsAsRevenue, isTrue);
    });

    test('لوحة التقارير بتتبني ببيانات فعلية', () async {
      final repository = ReportsRepository(store);
      final report = await repository.build(ReportRange.all);
      expect(report.lifetimeRevenue, greaterThan(0));
      expect(report.ordersCount, greaterThan(0));
      expect(report.topProducts, isNotEmpty);
      expect(report.totalCustomers, greaterThan(0));
    });

    test('تصدير CSV بيطلع صف عنوان وصفوف طلبات', () async {
      final repository = ReportsRepository(store);
      final csv = await repository.exportOrdersCsv(ReportRange.all);
      final lines = csv.split('\n');
      expect(lines.first, contains('رقم الطلب'));
      expect(lines.length, greaterThan(10));
    });
  });
}
