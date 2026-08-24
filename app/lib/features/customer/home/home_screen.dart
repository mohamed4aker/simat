import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/common.dart';
import '../../../core/widgets/product_card.dart';
import '../../../core/widgets/simat_logo.dart';
import '../../../core/widgets/simat_pattern.dart';
import '../../../data/models/models.dart';
import '../../../data/repositories/catalog_repository.dart';
import '../../../providers/app_providers.dart';

/// الصفحة الرئيسية لواجهة العميل.
class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categories = ref.watch(categoriesProvider);
    final featured = ref.watch(featuredProductsProvider);
    final offers = ref.watch(offersProvider);
    final bestSellers = ref.watch(bestSellersProvider);
    final newArrivals = ref.watch(newArrivalsProvider);
    final user = ref.watch(authControllerProvider);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: () async => bumpData(ref),
        child: CustomScrollView(
          slivers: [
            SliverAppBar(
              pinned: true,
              backgroundColor: AppColors.background,
              surfaceTintColor: Colors.transparent,
              titleSpacing: 16,
              title: const SimatLogoBar(height: 34),
              centerTitle: false,
              actions: [
                if (user?.isAdmin ?? false)
                  IconButton(
                    tooltip: 'لوحة التحكم',
                    onPressed: () => context.go('/admin'),
                    icon: const Icon(Icons.dashboard_customize_outlined),
                  ),
                IconButton(
                  tooltip: 'بحث',
                  onPressed: () => context.push('/search'),
                  icon: const Icon(Icons.search_rounded),
                ),
                const SizedBox(width: 6),
              ],
            ),
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 0),
                child: AppSearchField(
                  readOnly: true,
                  onTap: () => context.push('/search'),
                ),
              ),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 16)),
            const SliverToBoxAdapter(child: _HeroBanner()),
            const SliverToBoxAdapter(child: SizedBox(height: 20)),
            SliverToBoxAdapter(
              child: _CategoriesStrip(categories: categories),
            ),
            const SliverToBoxAdapter(child: SizedBox(height: 22)),
            SliverToBoxAdapter(
              child: _ProductSection(
                title: 'مختارات سِمة',
                icon: Icons.auto_awesome_rounded,
                products: featured,
                onSeeAll: () => _openCatalog(context, ref),
              ),
            ),
            SliverToBoxAdapter(
              child: _ProductSection(
                title: 'عروض وخصومات',
                icon: Icons.local_offer_outlined,
                products: offers,
                onSeeAll: () => _openCatalog(context, ref, onlyOffers: true),
              ),
            ),
            const SliverToBoxAdapter(child: _FreeShippingBanner()),
            SliverToBoxAdapter(
              child: _ProductSection(
                title: 'الأكثر مبيعاً',
                icon: Icons.trending_up_rounded,
                products: bestSellers,
                onSeeAll: () => _openCatalog(
                  context,
                  ref,
                  sort: ProductSort.bestSelling,
                ),
              ),
            ),
            SliverToBoxAdapter(
              child: _ProductSection(
                title: 'وصل حديثاً',
                icon: Icons.fiber_new_outlined,
                products: newArrivals,
                onSeeAll: () =>
                    _openCatalog(context, ref, sort: ProductSort.newest),
              ),
            ),
            const SliverToBoxAdapter(child: _BrandStory()),
            const SliverToBoxAdapter(child: SizedBox(height: 24)),
          ],
        ),
      ),
    );
  }

  void _openCatalog(
    BuildContext context,
    WidgetRef ref, {
    bool onlyOffers = false,
    ProductSort sort = ProductSort.newest,
  }) {
    ref.read(productFilterProvider.notifier).state = ProductFilter(
      onlyOffers: onlyOffers,
      sort: sort,
    );
    context.go('/catalog');
  }
}

/// بانر ترويجي بهوية العلامة.
class _HeroBanner extends StatelessWidget {
  const _HeroBanner();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: Container(
          constraints: const BoxConstraints(minHeight: 186),
          decoration: const BoxDecoration(
            gradient: AppColors.primaryGradient,
          ),
          child: Stack(
            children: [
              Positioned.fill(
                child: SimatPattern(
                  color: AppColors.background,
                  opacity: 0.12,
                  spacing: 52,
                ),
              ),
              Positioned(
                left: -18,
                bottom: -26,
                child: Opacity(
                  opacity: 0.18,
                  child: SimatMark(
                    size: 190,
                    color: AppColors.background,
                    strokeScale: 1.4,
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(22),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 5,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.accent,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Text(
                        'مجموعة ٢٠٢٦',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'عطور تُخلّد الأثر',
                      style: TextStyle(
                        fontFamily: 'Cairo',
                        fontSize: 24,
                        fontWeight: FontWeight.w800,
                        color: Colors.white,
                        height: 1.3,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'تشكيلة مختارة بعناية من العود والورد والعنبر',
                      style: TextStyle(
                        fontSize: 13,
                        color: Colors.white.withValues(alpha: 0.86),
                      ),
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
}

class _FreeShippingBanner extends StatelessWidget {
  const _FreeShippingBanner();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: AppColors.secondary.withValues(alpha: 0.6),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.divider),
        ),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: const BoxDecoration(
                gradient: AppColors.accentGradient,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.local_shipping_outlined,
                color: Colors.white,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'شحن مجاني',
                    style: TextStyle(
                      fontWeight: FontWeight.w800,
                      fontSize: 14,
                    ),
                  ),
                  Text(
                    'للطلبات فوق ${Fmt.price(AppConstants.freeShippingThreshold)}'
                    ' — لكل محافظات مصر',
                    style: const TextStyle(
                      fontSize: 12,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CategoriesStrip extends ConsumerWidget {
  final AsyncValue<List<Category>> categories;

  const _CategoriesStrip({required this.categories});

  static const Map<String, IconData> _icons = {
    'flame': Icons.local_fire_department_outlined,
    'flower': Icons.local_florist_outlined,
    'wood': Icons.park_outlined,
    'diamond': Icons.diamond_outlined,
    'drop': Icons.water_drop_outlined,
    'gift': Icons.card_giftcard_rounded,
    'bottle': Icons.science_outlined,
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return categories.when(
      loading: () => const SizedBox(height: 104),
      error: (e, _) => const SizedBox.shrink(),
      data: (list) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: SectionHeader(
              title: 'تسوّق حسب التصنيف',
              icon: Icons.category_outlined,
              actionLabel: 'كل المنتجات',
              onAction: () {
                ref.read(productFilterProvider.notifier).state =
                    const ProductFilter();
                context.go('/catalog');
              },
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 104,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: list.length,
              separatorBuilder: (_, _) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final category = list[index];
                return InkWell(
                  onTap: () {
                    ref.read(productFilterProvider.notifier).state =
                        ProductFilter(categoryId: category.id);
                    context.go('/catalog');
                  },
                  borderRadius: BorderRadius.circular(16),
                  child: SizedBox(
                    width: 84,
                    child: Column(
                      children: [
                        Container(
                          width: 62,
                          height: 62,
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.divider),
                          ),
                          child: Icon(
                            _icons[category.iconKey] ?? Icons.science_outlined,
                            color: AppColors.primary,
                            size: 26,
                          ),
                        ),
                        const SizedBox(height: 7),
                        Text(
                          category.name,
                          textAlign: TextAlign.center,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w600,
                            height: 1.3,
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

/// قسم أفقي من المنتجات.
class _ProductSection extends ConsumerWidget {
  final String title;
  final IconData icon;
  final AsyncValue<List<Product>> products;
  final VoidCallback onSeeAll;

  const _ProductSection({
    required this.title,
    required this.icon,
    required this.products,
    required this.onSeeAll,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return products.when(
      loading: () => const SizedBox(
        height: 200,
        child: Center(child: CircularProgressIndicator()),
      ),
      error: (e, _) => const SizedBox.shrink(),
      data: (list) {
        if (list.isEmpty) return const SizedBox.shrink();
        final user = ref.watch(authControllerProvider);
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 6, 16, 0),
              child: SectionHeader(
                title: title,
                icon: icon,
                actionLabel: 'عرض الكل',
                onAction: onSeeAll,
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 296,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: list.length,
                separatorBuilder: (_, _) => const SizedBox(width: 12),
                itemBuilder: (context, index) {
                  final product = list[index];
                  return SizedBox(
                    width: 168,
                    child: ProductCard(
                      product: product,
                      isFavorite:
                          user?.favorites.contains(product.id) ?? false,
                      onTap: () => context.push('/product/${product.id}'),
                      onToggleFavorite: user == null
                          ? null
                          : () => ref
                              .read(authControllerProvider.notifier)
                              .toggleFavorite(product.id),
                      onAddToCart: () {
                        ref
                            .read(cartControllerProvider.notifier)
                            .add(product);
                        ScaffoldMessenger.of(context)
                          ..hideCurrentSnackBar()
                          ..showSnackBar(
                            SnackBar(
                              content: Text('تمت إضافة ${product.name} للعربة'),
                              duration: const Duration(seconds: 2),
                            ),
                          );
                      },
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 20),
          ],
        );
      },
    );
  }
}

class _BrandStory extends StatelessWidget {
  const _BrandStory();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Container(
        padding: const EdgeInsets.all(22),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.divider),
        ),
        child: Column(
          children: [
            const SimatMark(size: 54),
            const SizedBox(height: 14),
            Text(
              'سِمة — الأثر اللي بيفضل',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            const Text(
              'بنختار كل زيت ونوتة بإيدينا، وبنعبّي كل زجاجة في مصر بمعايير '
              'عالمية. عطرك مش مجرد ريحة — ده أثرك اللي الناس تفتكره.',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 13,
                height: 1.8,
                color: AppColors.textSecondary,
              ),
            ),
            const SizedBox(height: 16),
            const Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _Feature(icon: Icons.verified_outlined, label: 'أصلي ١٠٠٪'),
                _Feature(icon: Icons.replay_outlined, label: 'استبدال ١٤ يوم'),
                _Feature(icon: Icons.lock_outline_rounded, label: 'دفع آمن'),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _Feature extends StatelessWidget {
  final IconData icon;
  final String label;

  const _Feature({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: AppColors.accent, size: 22),
        const SizedBox(height: 6),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11.5,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
          ),
        ),
      ],
    );
  }
}
