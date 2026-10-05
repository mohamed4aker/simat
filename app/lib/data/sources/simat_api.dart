import 'dart:convert';

import 'package:http/http.dart' as http;

import '../../core/constants/app_constants.dart';
import '../models/models.dart';

/// نتيجة تسجيل الطلب على السيرفر.
class RemoteOrderResult {
  final bool ok;
  final String? orderNumber;
  final double subtotal;
  final double shipping;
  final double discount;
  final double total;
  final String? error;

  const RemoteOrderResult({
    required this.ok,
    this.orderNumber,
    this.subtotal = 0,
    this.shipping = 0,
    this.discount = 0,
    this.total = 0,
    this.error,
  });
}

/// الاتصال بالموقع: الأبلكيشن والموقع شايفين نفس المنتجات ونفس الطلبات.
class SimatApi {
  SimatApi({http.Client? client, String? baseUrl})
      : _client = client ?? http.Client(),
        _base = baseUrl ?? AppConstants.apiBaseUrl;

  final http.Client _client;
  final String _base;

  static const _timeout = Duration(seconds: 20);

  /// GET /api/products → {products, categories}
  Future<Map<String, dynamic>?> fetchCatalog() async {
    try {
      final res = await _client
          .get(Uri.parse('$_base/api/products'))
          .timeout(_timeout);
      if (res.statusCode != 200) return null;
      final data = jsonDecode(utf8.decode(res.bodyBytes));
      return data is Map<String, dynamic> ? data : null;
    } catch (_) {
      return null;
    }
  }

  /// POST /api/orders — الأسعار والشحن والخصم بتتحسب على السيرفر،
  /// وبعدها بتوصل للعميل رسالة واتساب بتفاصيل الطلب.
  Future<RemoteOrderResult> placeOrder({
    required List<CartItem> items,
    required Address address,
    required PaymentMethod paymentMethod,
    String? couponCode,
    String notes = '',
    String email = '',
  }) async {
    final body = {
      'lang': 'ar',
      'fullName': address.fullName,
      'phone': address.phone,
      'altPhone': '',
      'email': email,
      'governorate': address.governorate,
      'city': address.city,
      'street': address.street,
      'building': address.building,
      'addressNotes': address.notes,
      'notes': notes,
      'paymentMethod': paymentMethod == PaymentMethod.card ? 'card' : 'cod',
      'couponCode': couponCode ?? '',
      'isGift': false,
      'giftMessage': '',
      'items': [
        for (final i in items)
          {'productId': i.productId, 'quantity': i.quantity, 'sizeMl': i.sizeMl},
      ],
    };
    try {
      final res = await _client
          .post(
            Uri.parse('$_base/api/orders'),
            headers: {'Content-Type': 'application/json'},
            body: jsonEncode(body),
          )
          .timeout(_timeout);
      final data = jsonDecode(utf8.decode(res.bodyBytes)) as Map<String, dynamic>;
      if (data['ok'] != true) {
        return RemoteOrderResult(
          ok: false,
          error: data['error'] as String? ?? 'مش قادرين نكمّل الطلب',
        );
      }
      double n(String k) => (data[k] as num?)?.toDouble() ?? 0;
      return RemoteOrderResult(
        ok: true,
        orderNumber: data['orderNumber'] as String?,
        subtotal: n('subtotal'),
        shipping: n('shipping'),
        discount: n('discount'),
        total: n('total'),
      );
    } catch (_) {
      return const RemoteOrderResult(
        ok: false,
        error: 'مفيش اتصال بالنت — اتأكد من الإنترنت وجرّب تاني',
      );
    }
  }
}
