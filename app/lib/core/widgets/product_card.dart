import 'package:flutter/material.dart';

import '../../data/models/models.dart';
import '../theme/app_colors.dart';
import 'common.dart';
import 'product_artwork.dart';

/// كارت المنتج المستخدم في الشبكة والقوائم الأفقية.
class ProductCard extends StatelessWidget {
  final Product product;
  final VoidCallback onTap;
  final VoidCallback? onAddToCart;
  final VoidCallback? onToggleFavorite;
  final bool isFavorite;
  final bool compact;

  const ProductCard({
    super.key,
    required this.product,
    required this.onTap,
    this.onAddToCart,
    this.onToggleFavorite,
    this.isFavorite = false,
    this.compact = false,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.surface,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: AppColors.divider),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // الصورة بتاخد المساحة المتبقية — الكارت بيتأقلم مع أي ارتفاع.
              Expanded(child: _artwork()),
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 9, 12, 11),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      product.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      '${product.concentration.shortAr} · ${product.sizeMl} مل',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 11.5,
                        color: AppColors.textMuted,
                      ),
                    ),
                    if (!compact) ...[
                      const SizedBox(height: 5),
                      RatingStars(
                        rating: product.rating,
                        count: product.ratingCount,
                        size: 13,
                      ),
                    ],
                    const SizedBox(height: 7),
                    Row(
                      children: [
                        Expanded(
                          child: PriceText(
                            price: product.price,
                            oldPrice: product.oldPrice,
                            size: 15,
                          ),
                        ),
                        if (onAddToCart != null)
                          _AddButton(
                            enabled: product.inStock,
                            onTap: onAddToCart!,
                          ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _artwork() {
    return Stack(
      fit: StackFit.expand,
      children: [
        ProductArtwork(
          seed: product.id,
          imagePath: product.imagePath,
          borderRadius: const BorderRadius.vertical(
            top: Radius.circular(17),
          ),
        ),
        Positioned(
          top: 8,
          right: 8,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (product.hasDiscount)
                AppBadge(
                  label: 'خصم ${product.discountPercent}%',
                  color: AppColors.primary,
                ),
              if (!product.inStock) ...[
                const SizedBox(height: 4),
                const AppBadge(
                  label: 'نفد المخزون',
                  color: AppColors.dark,
                ),
              ] else if (product.isLowStock) ...[
                const SizedBox(height: 4),
                AppBadge(
                  label: 'باقي ${product.stock}',
                  color: AppColors.warning,
                ),
              ],
            ],
          ),
        ),
        if (onToggleFavorite != null)
          Positioned(
            top: 4,
            left: 4,
            child: IconButton(
              onPressed: onToggleFavorite,
              style: IconButton.styleFrom(
                backgroundColor: AppColors.surface.withValues(alpha: 0.85),
                minimumSize: const Size(34, 34),
                padding: EdgeInsets.zero,
              ),
              icon: Icon(
                isFavorite
                    ? Icons.favorite_rounded
                    : Icons.favorite_border_rounded,
                size: 18,
                color: isFavorite
                    ? AppColors.primary
                    : AppColors.textSecondary,
              ),
            ),
          ),
      ],
    );
  }
}

class _AddButton extends StatelessWidget {
  final bool enabled;
  final VoidCallback onTap;

  const _AddButton({required this.enabled, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: enabled ? AppColors.primary : AppColors.secondary,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        onTap: enabled ? onTap : null,
        borderRadius: BorderRadius.circular(10),
        child: SizedBox(
          width: 34,
          height: 34,
          child: Icon(
            Icons.add_shopping_cart_rounded,
            size: 17,
            color: enabled ? Colors.white : AppColors.textMuted,
          ),
        ),
      ),
    );
  }
}

/// صف أفقي للمنتج (يُستخدم في المفضلة ونتائج البحث المضغوطة).
class ProductRow extends StatelessWidget {
  final Product product;
  final VoidCallback onTap;
  final Widget? trailing;

  const ProductRow({
    super.key,
    required this.product,
    required this.onTap,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      padding: const EdgeInsets.all(10),
      child: Row(
        children: [
          ProductArtwork(
            seed: product.id,
            imagePath: product.imagePath,
            width: 76,
            height: 76,
            borderRadius: BorderRadius.circular(14),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  product.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 14.5,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '${product.gender.labelAr} · ${product.sizeMl} مل',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppColors.textMuted,
                  ),
                ),
                const SizedBox(height: 6),
                PriceText(
                  price: product.price,
                  oldPrice: product.oldPrice,
                  size: 14.5,
                ),
              ],
            ),
          ),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}
