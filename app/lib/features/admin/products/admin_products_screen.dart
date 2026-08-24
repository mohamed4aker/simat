import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/common.dart';
import '../../../core/widgets/product_artwork.dart';
import '../../../data/models/models.dart';
import '../../../providers/app_providers.dart';

/// إدارة المنتجات: بحث، تفعيل/إيقاف، تعديل، حذف.
class AdminProductsScreen extends ConsumerStatefulWidget {
  const AdminProductsScreen({super.key});

  @override
  ConsumerState<AdminProductsScreen> createState() =>
      _AdminProductsScreenState();
}

class _AdminProductsScreenState extends ConsumerState<AdminProductsScreen> {
  final _search = TextEditingController();
  String _query = '';
  String _tab = 'all';

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  List<Product> _filter(List<Product> all) {
    var list = all;
    final query = _query.trim();
    if (query.isNotEmpty) {
      list = list
          .where((p) =>
              p.name.contains(query) ||
              p.nameEn.toLowerCase().contains(query.toLowerCase()) ||
              p.brand.contains(query))
          .toList();
    }
    switch (_tab) {
      case 'active':
        list = list.where((p) => p.isActive).toList();
      case 'inactive':
        list = list.where((p) => !p.isActive).toList();
      case 'low':
        list = list.where((p) => p.stock <= 5).toList();
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final products = ref.watch(adminProductsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('المنتجات')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push('/admin/products/new'),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('منتج جديد'),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: AppSearchField(
              controller: _search,
              hint: 'ابحث باسم المنتج أو الماركة',
              onChanged: (value) => setState(() => _query = value),
              onClear: _query.isEmpty
                  ? null
                  : () {
                      _search.clear();
                      setState(() => _query = '');
                    },
            ),
          ),
          SizedBox(
            height: 40,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: [
                _tabChip('all', 'الكل'),
                const SizedBox(width: 8),
                _tabChip('active', 'مفعّل'),
                const SizedBox(width: 8),
                _tabChip('inactive', 'موقوف'),
                const SizedBox(width: 8),
                _tabChip('low', 'مخزون منخفض'),
              ],
            ),
          ),
          Expanded(
            child: products.when(
              loading: () => const SimatLoader(),
              error: (e, _) => EmptyState(
                icon: Icons.error_outline_rounded,
                title: 'حصل خطأ',
                message: '$e',
              ),
              data: (all) {
                final list = _filter(all);
                if (list.isEmpty) {
                  return const EmptyState(
                    icon: Icons.inventory_2_outlined,
                    title: 'مفيش منتجات هنا',
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 90),
                  itemCount: list.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (context, index) =>
                      _ProductTile(product: list[index]),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _tabChip(String value, String label) {
    final selected = _tab == value;
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      showCheckmark: false,
      onSelected: (_) => setState(() => _tab = value),
      labelStyle: TextStyle(
        fontFamily: 'Cairo',
        fontSize: 12.5,
        fontWeight: FontWeight.w600,
        color: selected ? Colors.white : AppColors.textPrimary,
      ),
    );
  }
}

class _ProductTile extends ConsumerWidget {
  final Product product;
  const _ProductTile({required this.product});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return AppCard(
      padding: const EdgeInsets.all(10),
      onTap: () => context.push('/admin/products/${product.id}'),
      child: Row(
        children: [
          ProductArtwork(
            seed: product.id,
            imagePath: product.imagePath,
            width: 66,
            height: 66,
            borderRadius: BorderRadius.circular(12),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        product.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    if (!product.isActive)
                      const AppBadge(
                        label: 'موقوف',
                        color: AppColors.textMuted,
                        fontSize: 10,
                      ),
                  ],
                ),
                const SizedBox(height: 3),
                Text(
                  '${product.sizeMl} مل · ${product.concentration.shortAr} · '
                  'بيع ${product.soldCount}',
                  style: const TextStyle(
                    fontSize: 11.5,
                    color: AppColors.textMuted,
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Text(
                      Fmt.price(product.price),
                      style: const TextStyle(
                        fontWeight: FontWeight.w800,
                        fontSize: 13.5,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(width: 10),
                    AppBadge(
                      label: 'مخزون ${product.stock}',
                      color: product.stock == 0
                          ? AppColors.danger
                          : product.isLowStock
                              ? AppColors.warning
                              : AppColors.success,
                      fontSize: 10,
                    ),
                  ],
                ),
              ],
            ),
          ),
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert_rounded, size: 20),
            onSelected: (value) => _onAction(context, ref, value),
            itemBuilder: (context) => [
              const PopupMenuItem(value: 'edit', child: Text('تعديل')),
              PopupMenuItem(
                value: 'toggle',
                child: Text(product.isActive ? 'إيقاف' : 'تفعيل'),
              ),
              const PopupMenuItem(value: 'delete', child: Text('حذف')),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _onAction(
    BuildContext context,
    WidgetRef ref,
    String action,
  ) async {
    final repository = ref.read(catalogRepositoryProvider);
    switch (action) {
      case 'edit':
        context.push('/admin/products/${product.id}');
      case 'toggle':
        await repository.setProductActive(product.id, !product.isActive);
        bumpData(ref);
      case 'delete':
        final confirmed = await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            title: const Text('حذف المنتج'),
            content: Text('هتحذف «${product.name}» نهائياً. متأكد؟'),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: const Text('رجوع'),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(true),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.danger,
                ),
                child: const Text('حذف'),
              ),
            ],
          ),
        );
        if (confirmed ?? false) {
          await repository.deleteProduct(product.id);
          bumpData(ref);
        }
    }
  }
}
