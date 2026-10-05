import 'product.dart';

/// عنصر داخل عربة التسوق.
class CartItem {
  final String productId;
  final String name;
  final String brand;
  final double unitPrice;
  final int sizeMl;
  final int quantity;
  final String? imagePath;

  const CartItem({
    required this.productId,
    required this.name,
    required this.brand,
    required this.unitPrice,
    required this.sizeMl,
    required this.quantity,
    this.imagePath,
  });

  factory CartItem.fromProduct(
    Product product, {
    int quantity = 1,
    int? sizeMl,
  }) {
    final size = sizeMl ?? product.defaultVariant.sizeMl;
    return CartItem(
      productId: product.id,
      name: product.displayName,
      brand: product.brand,
      unitPrice: product.priceFor(size),
      sizeMl: size,
      quantity: quantity,
      imagePath: product.imagePath,
    );
  }

  /// كل سطر في العربة = منتج + حجم.
  String get key => '$productId:$sizeMl';

  double get total => unitPrice * quantity;

  CartItem copyWith({int? quantity, double? unitPrice}) => CartItem(
        productId: productId,
        name: name,
        brand: brand,
        unitPrice: unitPrice ?? this.unitPrice,
        sizeMl: sizeMl,
        quantity: quantity ?? this.quantity,
        imagePath: imagePath,
      );

  Map<String, dynamic> toJson() => {
        'productId': productId,
        'name': name,
        'brand': brand,
        'unitPrice': unitPrice,
        'sizeMl': sizeMl,
        'quantity': quantity,
        'imagePath': imagePath,
      };

  factory CartItem.fromJson(Map<String, dynamic> json) => CartItem(
        productId: json['productId'] as String,
        name: json['name'] as String? ?? '',
        brand: json['brand'] as String? ?? '',
        unitPrice: (json['unitPrice'] as num).toDouble(),
        sizeMl: json['sizeMl'] as int? ?? 50,
        quantity: json['quantity'] as int? ?? 1,
        imagePath: json['imagePath'] as String?,
      );
}
