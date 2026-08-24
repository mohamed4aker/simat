import 'package:uuid/uuid.dart';

import '../models/models.dart';
import '../sources/local_store.dart';

/// إنشاء الطلبات ومتابعتها.
class OrderRepository {
  OrderRepository(this._store);

  final LocalStore _store;
  static const _uuid = Uuid();

  Future<List<Order>> allOrders() async {
    final list = _store.orders()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return list;
  }

  Future<List<Order>> ordersFor(String userId) async {
    final list = _store.orders()
        .where((o) => o.userId == userId)
        .toList()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return list;
  }

  Future<Order?> orderById(String id) async {
    for (final order in _store.orders()) {
      if (order.id == id) return order;
    }
    return null;
  }

  Future<Order> place({
    required AppUser user,
    required List<CartItem> items,
    required Address address,
    required PaymentMethod paymentMethod,
    required double shipping,
    double discount = 0,
    String? couponCode,
    String notes = '',
  }) async {
    final now = DateTime.now();
    final subtotal = items.fold<double>(0, (sum, e) => sum + e.total);
    final orders = _store.orders();

    final sequence = orders.length + 1001;
    final order = Order(
      id: 'o_${_uuid.v4().substring(0, 8)}',
      orderNumber:
          'SM-${now.year}${now.month.toString().padLeft(2, '0')}-$sequence',
      userId: user.id,
      customerName: address.fullName.isEmpty ? user.name : address.fullName,
      customerPhone: address.phone.isEmpty ? user.phone : address.phone,
      items: items,
      address: address,
      paymentMethod: paymentMethod,
      status: OrderStatus.pending,
      subtotal: subtotal,
      shipping: shipping,
      discount: discount,
      couponCode: couponCode,
      notes: notes,
      createdAt: now,
      updatedAt: now,
      timeline: [
        OrderEvent(
          status: OrderStatus.pending,
          at: now,
          note: 'تم استلام الطلب',
        ),
      ],
    );

    orders.insert(0, order);
    await _store.saveOrders(orders);
    return order;
  }

  Future<Order> updateStatus(
    String orderId,
    OrderStatus status, {
    String note = '',
  }) async {
    final orders = _store.orders();
    final index = orders.indexWhere((o) => o.id == orderId);
    if (index == -1) {
      throw StateError('الطلب مش موجود');
    }
    final now = DateTime.now();
    final updated = orders[index].copyWith(
      status: status,
      updatedAt: now,
      timeline: [
        ...orders[index].timeline,
        OrderEvent(status: status, at: now, note: note),
      ],
    );
    orders[index] = updated;
    await _store.saveOrders(orders);
    return updated;
  }

  Future<Order> cancel(String orderId, {String reason = ''}) =>
      updateStatus(orderId, OrderStatus.cancelled, note: reason);
}
