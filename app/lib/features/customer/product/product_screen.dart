import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/common.dart';
import '../../../core/widgets/product_artwork.dart';
import '../../../core/widgets/product_card.dart';
import '../../../data/models/models.dart';
import '../../../providers/app_providers.dart';
import 'review_sheet.dart';

/// صفحة تفاصيل المنتج.
class ProductScreen extends ConsumerStatefulWidget {
  final String productId;
  const ProductScreen({super.key, required this.productId});

  @override
  ConsumerState<ProductScreen> createState() => _ProductScreenState();
}

class _ProductScreenState extends ConsumerState<ProductScreen> {
  int _quantity = 1;

  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productByIdProvider(widget.productId));
    final user = ref.watch(authControllerProvider);

    return productAsync.when(
      loading: () => const Scaffold(body: SimatLoader()),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: EmptyState(
          icon: Icons.error_outline_rounded,
          title: 'حصل خطأ',
          message: '$e',
        ),
      ),
      data: (product) {
        if (product == null) {
          return Scaffold(
            appBar: AppBar(),
            body: const EmptyState(
              icon: Icons.remove_shopping_cart_outlined,
              title: 'المنتج ده مش موجود',
            ),
          );
        }

        final isFavorite = user?.favorites.contains(product.id) ?? false;
        final maxQuantity = product.stock == 0 ? 1 : product.stock;

        return Scaffold(
          body: CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 320,
                pinned: true,
                backgroundColor: AppColors.background,
                surfaceTintColor: Colors.transparent,
                actions: [
                  IconButton(
                    onPressed: user == null
                        ? () => context.push('/login')
                        : () => ref
                            .read(authControllerProvider.notifier)
                            .toggleFavorite(product.id),
                    icon: Icon(
                      isFavorite
                          ? Icons.favorite_rounded
                          : Icons.favorite_border_rounded,
                      color: AppColors.primary,
                    ),
                  ),
                ],
                flexibleSpace: FlexibleSpaceBar(
                  background: ProductArtwork(
                    seed: product.id,
                    imagePath: product.imagePath,
                    borderRadius: BorderRadius.zero,
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 18, 16, 0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Expanded(
                            child: Text(
                              product.name,
                              style:
                                  Theme.of(context).textTheme.titleLarge,
                            ),
                          ),
                          if (product.hasDiscount)
                            AppBadge(
                              label: 'وفّر ${product.discountPercent}%',
                              color: AppColors.primary,
                              fontSize: 12,
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '${product.brand} · ${product.nameEn}',
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.textMuted,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          RatingStars(
                            rating: product.rating,
                            count: product.ratingCount,
                            size: 16,
                          ),
                          const SizedBox(width: 10),
                          Text(
                            'اتباع ${Fmt.number(product.soldCount)} مرة',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 14),
                      PriceText(
                        price: product.price,
                        oldPrice: product.oldPrice,
                        size: 24,
                      ),
                      const SizedBox(height: 14),
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: [
                          _Tag(
                            icon: Icons.science_outlined,
                            label: product.concentration.shortAr,
                          ),
                          _Tag(
                            icon: Icons.straighten_rounded,
                            label: '${product.sizeMl} مل',
                          ),
                          _Tag(
                            icon: Icons.wc_rounded,
                            label: product.gender.labelAr,
                          ),
                          _Tag(
                            icon: Icons.schedule_rounded,
                            label: 'ثبات ${product.longevityHours} ساعة',
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      _StockLine(product: product),
                      const SizedBox(height: 18),
                      Text('الوصف',
                          style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      Text(
                        product.description,
                        style: const TextStyle(
                          fontSize: 13.5,
                          height: 1.9,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 20),
                      _Pyramid(product: product),
                      const SizedBox(height: 22),
                      _ReviewsSection(productId: product.id),
                      const SizedBox(height: 22),
                      _RelatedSection(productId: product.id),
                      const SizedBox(height: 30),
                    ],
                  ),
                ),
              ),
            ],
          ),
          bottomNavigationBar: _BuyBar(
            product: product,
            quantity: _quantity,
            maxQuantity: maxQuantity,
            onQuantityChanged: (value) => setState(() => _quantity = value),
          ),
        );
      },
    );
  }
}

class _Tag extends StatelessWidget {
  final IconData icon;
  final String label;

  const _Tag({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.divider),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 15, color: AppColors.accent),
          const SizedBox(width: 5),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}

class _StockLine extends StatelessWidget {
  final Product product;
  const _StockLine({required this.product});

  @override
  Widget build(BuildContext context) {
    final (icon, color, label) = switch (product) {
      final p when !p.inStock => (
          Icons.remove_shopping_cart_outlined,
          AppColors.danger,
          'نفد المخزون — هيرجع قريب',
        ),
      final p when p.isLowStock => (
          Icons.warning_amber_rounded,
          AppColors.warning,
          'باقي ${p.stock} قطع بس — اطلب بسرعة',
        ),
      _ => (
          Icons.check_circle_outline_rounded,
          AppColors.success,
          'متوفر — شحن خلال ٢ إلى ٥ أيام',
        ),
    };

    return Row(
      children: [
        Icon(icon, size: 17, color: color),
        const SizedBox(width: 7),
        Expanded(
          child: Text(
            label,
            maxLines: 2,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: color,
            ),
          ),
        ),
      ],
    );
  }
}

/// الهرم العطري.
class _Pyramid extends StatelessWidget {
  final Product product;
  const _Pyramid({required this.product});

  @override
  Widget build(BuildContext context) {
    if (product.allNotes.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('الهرم العطري',
            style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 12),
        _layer('النوتات العليا', product.topNotes, 0.9),
        _layer('نوتات القلب', product.heartNotes, 0.65),
        _layer('نوتات القاعدة', product.baseNotes, 0.4),
      ],
    );
  }

  Widget _layer(String title, List<String> notes, double opacity) {
    if (notes.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 8,
            height: 8,
            margin: const EdgeInsets.only(top: 7),
            decoration: BoxDecoration(
              color: AppColors.accent.withValues(alpha: opacity),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 12.5,
                    fontWeight: FontWeight.w700,
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  notes.join(' · '),
                  style: const TextStyle(fontSize: 13.5, height: 1.6),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _ReviewsSection extends ConsumerWidget {
  final String productId;
  const _ReviewsSection({required this.productId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final reviews = ref.watch(productReviewsProvider(productId));
    final user = ref.watch(authControllerProvider);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SectionHeader(
          title: 'آراء العملاء',
          icon: Icons.reviews_outlined,
          actionLabel: user == null ? null : 'أضف تقييمك',
          onAction: user == null
              ? null
              : () => showReviewSheet(context, ref, productId),
        ),
        const SizedBox(height: 10),
        reviews.when(
          loading: () => const Padding(
            padding: EdgeInsets.symmetric(vertical: 20),
            child: Center(child: CircularProgressIndicator()),
          ),
          error: (e, _) => const SizedBox.shrink(),
          data: (list) {
            if (list.isEmpty) {
              return const Text(
                'لسه مفيش تقييمات — كن أول واحد يقيّم المنتج ده.',
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              );
            }
            final visible = list.take(4).toList();
            return Column(
              children: [
                for (final review in visible)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: AppCard(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              CircleAvatar(
                                radius: 15,
                                backgroundColor: AppColors.secondary,
                                child: Text(
                                  review.userName.substring(0, 1),
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primary,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 9),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      review.userName,
                                      style: const TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    Text(
                                      Fmt.relative(review.createdAt),
                                      style: const TextStyle(
                                        fontSize: 11,
                                        color: AppColors.textMuted,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              RatingStars(rating: review.rating, size: 13),
                            ],
                          ),
                          if (review.comment.isNotEmpty) ...[
                            const SizedBox(height: 8),
                            Text(
                              review.comment,
                              style: const TextStyle(
                                fontSize: 13,
                                height: 1.7,
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                if (list.length > visible.length)
                  Text(
                    'و ${list.length - visible.length} تقييم آخر',
                    style: const TextStyle(
                      fontSize: 12.5,
                      color: AppColors.textMuted,
                    ),
                  ),
              ],
            );
          },
        ),
      ],
    );
  }
}

class _RelatedSection extends ConsumerWidget {
  final String productId;
  const _RelatedSection({required this.productId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final related = ref.watch(relatedProductsProvider(productId));
    return related.maybeWhen(
      orElse: () => const SizedBox.shrink(),
      data: (list) {
        if (list.isEmpty) return const SizedBox.shrink();
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SectionHeader(
              title: 'ممكن يعجبك كمان',
              icon: Icons.auto_awesome_outlined,
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 296,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: list.length,
                separatorBuilder: (_, _) => const SizedBox(width: 12),
                itemBuilder: (context, index) => SizedBox(
                  width: 168,
                  child: ProductCard(
                    product: list[index],
                    onTap: () =>
                        context.replace('/product/${list[index].id}'),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    );
  }
}

/// شريط الشراء السفلي.
class _BuyBar extends ConsumerWidget {
  final Product product;
  final int quantity;
  final int maxQuantity;
  final ValueChanged<int> onQuantityChanged;

  const _BuyBar({
    required this.product,
    required this.quantity,
    required this.maxQuantity,
    required this.onQuantityChanged,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.divider)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          child: Row(
            children: [
              QuantityStepper(
                value: quantity,
                max: maxQuantity,
                onChanged: onQuantityChanged,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: product.inStock
                      ? () {
                          ref
                              .read(cartControllerProvider.notifier)
                              .add(product, quantity: quantity);
                          ScaffoldMessenger.of(context)
                            ..hideCurrentSnackBar()
                            ..showSnackBar(
                              SnackBar(
                                content: const Text('تمت الإضافة للعربة'),
                                action: SnackBarAction(
                                  label: 'العربة',
                                  textColor: AppColors.accentLight,
                                  onPressed: () => context.go('/cart'),
                                ),
                              ),
                            );
                        }
                      : null,
                  icon: const Icon(Icons.shopping_bag_outlined, size: 19),
                  label: Text(
                    product.inStock
                        ? 'أضف للعربة · ${Fmt.price(product.price * quantity)}'
                        : 'نفد المخزون',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(fontSize: 14.5),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
