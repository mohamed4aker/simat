// تجربة سريعة لاتصال الأبلكيشن بالموقع:
//   dart run -DSIMAT_API=http://localhost:3000 tool/api_smoke.dart
import 'package:simat/data/models/models.dart';
import 'package:simat/data/sources/simat_api.dart';

Future<void> main() async {
  final api = SimatApi();
  final catalog = await api.fetchCatalog();
  final products = (catalog?['products'] as List? ?? [])
      .map((e) => Product.fromJson(e as Map<String, dynamic>))
      .toList();
  print('products: ${products.length}');
  final p = products.first;
  print('${p.displayName} | ${p.subLine} | ${p.sizes.map((v) => '${v.sizeMl}=${v.price}').join(', ')}');

  final result = await api.placeOrder(
    items: [CartItem.fromProduct(p, quantity: 2, sizeMl: 40)],
    address: const Address(
      id: 'a',
      fullName: 'Salim Hawary',
      phone: '01012345678',
      governorate: 'الإسكندرية',
      city: 'Miami',
      street: 'Al Ansar St',
    ),
    paymentMethod: PaymentMethod.cashOnDelivery,
  );
  print('order ok=${result.ok} number=${result.orderNumber} total=${result.total} error=${result.error}');
}
