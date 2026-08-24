import 'address.dart';
import 'cart_item.dart';
import 'enums.dart';

/// سجل تغيّر حالة الطلب (Timeline).
class OrderEvent {
  final OrderStatus status;
  final DateTime at;
  final String note;

  const OrderEvent({required this.status, required this.at, this.note = ''});

  Map<String, dynamic> toJson() => {
        'status': status.name,
        'at': at.toIso8601String(),
        'note': note,
      };

  factory OrderEvent.fromJson(Map<String, dynamic> json) => OrderEvent(
        status: OrderStatus.fromName(json['status'] as String),
        at: DateTime.parse(json['at'] as String),
        note: json['note'] as String? ?? '',
      );
}

/// الطلب.
class Order {
  final String id;
  final String orderNumber;
  final String userId;
  final String customerName;
  final String customerPhone;
  final List<CartItem> items;
  final Address address;
  final PaymentMethod paymentMethod;
  final OrderStatus status;
  final double subtotal;
  final double shipping;
  final double discount;
  final String? couponCode;
  final String notes;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<OrderEvent> timeline;

  const Order({
    required this.id,
    required this.orderNumber,
    required this.userId,
    required this.customerName,
    required this.customerPhone,
    required this.items,
    required this.address,
    required this.paymentMethod,
    this.status = OrderStatus.pending,
    required this.subtotal,
    required this.shipping,
    this.discount = 0,
    this.couponCode,
    this.notes = '',
    required this.createdAt,
    required this.updatedAt,
    this.timeline = const [],
  });

  double get total => subtotal + shipping - discount;

  int get itemsCount => items.fold(0, (sum, e) => sum + e.quantity);

  Order copyWith({
    OrderStatus? status,
    DateTime? updatedAt,
    List<OrderEvent>? timeline,
    String? notes,
  }) =>
      Order(
        id: id,
        orderNumber: orderNumber,
        userId: userId,
        customerName: customerName,
        customerPhone: customerPhone,
        items: items,
        address: address,
        paymentMethod: paymentMethod,
        status: status ?? this.status,
        subtotal: subtotal,
        shipping: shipping,
        discount: discount,
        couponCode: couponCode,
        notes: notes ?? this.notes,
        createdAt: createdAt,
        updatedAt: updatedAt ?? DateTime.now(),
        timeline: timeline ?? this.timeline,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'orderNumber': orderNumber,
        'userId': userId,
        'customerName': customerName,
        'customerPhone': customerPhone,
        'items': items.map((e) => e.toJson()).toList(),
        'address': address.toJson(),
        'paymentMethod': paymentMethod.name,
        'status': status.name,
        'subtotal': subtotal,
        'shipping': shipping,
        'discount': discount,
        'couponCode': couponCode,
        'notes': notes,
        'createdAt': createdAt.toIso8601String(),
        'updatedAt': updatedAt.toIso8601String(),
        'timeline': timeline.map((e) => e.toJson()).toList(),
      };

  factory Order.fromJson(Map<String, dynamic> json) => Order(
        id: json['id'] as String,
        orderNumber: json['orderNumber'] as String,
        userId: json['userId'] as String? ?? '',
        customerName: json['customerName'] as String? ?? '',
        customerPhone: json['customerPhone'] as String? ?? '',
        items: (json['items'] as List)
            .map((e) => CartItem.fromJson(e as Map<String, dynamic>))
            .toList(),
        address: Address.fromJson(json['address'] as Map<String, dynamic>),
        paymentMethod:
            PaymentMethod.fromName(json['paymentMethod'] as String? ?? ''),
        status: OrderStatus.fromName(json['status'] as String? ?? 'pending'),
        subtotal: (json['subtotal'] as num).toDouble(),
        shipping: (json['shipping'] as num?)?.toDouble() ?? 0,
        discount: (json['discount'] as num?)?.toDouble() ?? 0,
        couponCode: json['couponCode'] as String?,
        notes: json['notes'] as String? ?? '',
        createdAt: DateTime.parse(json['createdAt'] as String),
        updatedAt: DateTime.parse(json['updatedAt'] as String),
        timeline: (json['timeline'] as List?)
                ?.map((e) => OrderEvent.fromJson(e as Map<String, dynamic>))
                .toList() ??
            const [],
      );
}
