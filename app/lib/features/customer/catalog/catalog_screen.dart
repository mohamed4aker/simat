import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/common.dart';
import '../../../core/widgets/product_card.dart';
import '../../../data/models/models.dart';
import '../../../data/repositories/catalog_repository.dart';
import '../../../providers/app_providers.dart';
import 'filter_sheet.dart';

/// شاشة المتجر: تصفية، ترتيب، وعرض شبكي للمنتجات.
class CatalogScreen extends ConsumerWidget {
  const CatalogScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filter = ref.watch(productFilterProvider);
    final products = ref.watch(filteredProductsProvider);
    final categories = ref.watch(categoriesProvider);
    final user = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('المتجر'),
        actions: [
          IconButton(
            tooltip: 'بحث',
            onPressed: () => context.push('/search'),
            icon: const Icon(Icons.search_rounded),
          ),
        ],
      ),
      body: Column(
        children: [
          _CategoryChips(categories: categories),
          _FilterBar(filter: filter),
          Expanded(
            child: products.when(
              loading: () => const SimatLoader(),
              error: (e, _) => EmptyState(
                icon: Icons.error_outline_rounded,
                title: 'حصل خطأ',
                message: '$e',
              ),
              data: (list) {
                if (list.isEmpty) {
                  return EmptyState(
                    icon: Icons.search_off_rounded,
                    title: 'مفيش منتجات مطابقة',
                    message: 'جرّب تغيّر الفلاتر أو تبحث بكلمة تانية',
                    actionLabel: 'مسح الفلاتر',
                    onAction: () => ref
                        .read(productFilterProvider.notifier)
                        .state = const ProductFilter(),
                  );
                }
                return GridView.builder(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                  gridDelegate:
                      const SliverGridDelegateWithMaxCrossAxisExtent(
                    maxCrossAxisExtent: 210,
                    mainAxisExtent: 300,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                  ),
                  itemCount: list.length,
                  itemBuilder: (context, index) {
                    final product = list[index];
                    return ProductCard(
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
                        ref.read(cartControllerProvider.notifier).add(product);
                        ScaffoldMessenger.of(context)
                          ..hideCurrentSnackBar()
                          ..showSnackBar(
                            SnackBar(
                              content:
                                  Text('تمت إضافة ${product.name} للعربة'),
                              duration: const Duration(seconds: 2),
                            ),
                          );
                      },
                    );
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoryChips extends ConsumerWidget {
  final AsyncValue<List<Category>> categories;

  const _CategoryChips({required this.categories});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filter = ref.watch(productFilterProvider);
    return categories.maybeWhen(
      orElse: () => const SizedBox(height: 8),
      data: (list) => SizedBox(
        height: 46,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.symmetric(horizontal: 16),
          itemCount: list.length + 1,
          separatorBuilder: (_, _) => const SizedBox(width: 8),
          itemBuilder: (context, index) {
            if (index == 0) {
              return _chip(
                context,
                ref,
                label: 'الكل',
                selected: filter.categoryId == null,
                onTap: () => ref.read(productFilterProvider.notifier).state =
                    filter.copyWith(clearCategory: true),
              );
            }
            final category = list[index - 1];
            return _chip(
              context,
              ref,
              label: category.name,
              selected: filter.categoryId == category.id,
              onTap: () => ref.read(productFilterProvider.notifier).state =
                  filter.copyWith(categoryId: category.id),
            );
          },
        ),
      ),
    );
  }

  Widget _chip(
    BuildContext context,
    WidgetRef ref, {
    required String label,
    required bool selected,
    required VoidCallback onTap,
  }) {
    return Center(
      child: ChoiceChip(
        label: Text(label),
        selected: selected,
        onSelected: (_) => onTap(),
        labelStyle: TextStyle(
          fontFamily: 'Cairo',
          fontSize: 13,
          fontWeight: FontWeight.w600,
          color: selected ? Colors.white : AppColors.textPrimary,
        ),
        showCheckmark: false,
      ),
    );
  }
}

class _FilterBar extends ConsumerWidget {
  final ProductFilter filter;

  const _FilterBar({required this.filter});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(filteredProductsProvider).valueOrNull?.length ?? 0;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
      child: Row(
        children: [
          Text(
            '$count منتج',
            style: const TextStyle(
              fontSize: 12.5,
              color: AppColors.textSecondary,
            ),
          ),
          const Spacer(),
          TextButton.icon(
            onPressed: () => _showSortSheet(context, ref),
            icon: const Icon(Icons.swap_vert_rounded, size: 18),
            label: Text(filter.sort.labelAr,
                style: const TextStyle(fontSize: 13)),
          ),
          const SizedBox(width: 4),
          Badge(
            isLabelVisible: filter.activeCount > 0,
            label: Text('${filter.activeCount}'),
            backgroundColor: AppColors.accent,
            child: OutlinedButton.icon(
              onPressed: () => showFilterSheet(context, ref),
              icon: const Icon(Icons.tune_rounded, size: 18),
              label: const Text('فلتر', style: TextStyle(fontSize: 13)),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(0, 38),
                padding: const EdgeInsets.symmetric(horizontal: 14),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showSortSheet(BuildContext context, WidgetRef ref) {
    showModalBottomSheet<void>(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 12),
            Text('ترتيب حسب',
                style: Theme.of(context).textTheme.titleMedium),
            const SizedBox(height: 8),
            for (final sort in ProductSort.values)
              ListTile(
                title: Text(sort.labelAr),
                trailing: filter.sort == sort
                    ? const Icon(Icons.check_circle_rounded,
                        color: AppColors.primary)
                    : const Icon(Icons.circle_outlined,
                        color: AppColors.textMuted),
                onTap: () {
                  ref.read(productFilterProvider.notifier).state =
                      filter.copyWith(sort: sort);
                  Navigator.of(context).pop();
                },
              ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}
