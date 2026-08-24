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

  factory CartItem.fromProduct(Product product, {int quantity = 1}) => CartItem(
        productId: product.id,
        name: product.name,
        brand: product.brand,
        unitPrice: product.price,
        sizeMl: product.sizeMl,
        quantity: quantity,
        imagePath: product.imagePath,
      );

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
