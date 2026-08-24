import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/common.dart';
import '../../../core/widgets/product_card.dart';
import '../../../providers/app_providers.dart';

/// قائمة المفضلة.
class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider);
    final favorites = ref.watch(favoriteProductsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('المفضلة')),
      body: user == null
          ? EmptyState(
              icon: Icons.favorite_border_rounded,
              title: 'محتاج تسجّل دخول',
              message: 'سجّل دخولك عشان تحفظ عطورك المفضلة',
              actionLabel: 'تسجيل الدخول',
              onAction: () => context.push('/login?redirect=/favorites'),
            )
          : favorites.when(
              loading: () => const SimatLoader(),
              error: (e, _) => EmptyState(
                icon: Icons.error_outline_rounded,
                title: 'حصل خطأ',
                message: '$e',
              ),
              data: (list) {
                if (list.isEmpty) {
                  return EmptyState(
                    icon: Icons.favorite_border_rounded,
                    title: 'المفضلة فاضية',
                    message: 'اضغط على القلب في أي منتج عشان تحفظه هنا',
                    actionLabel: 'تصفّح المتجر',
                    onAction: () => context.go('/catalog'),
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
                  itemCount: list.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final product = list[index];
                    return ProductRow(
                      product: product,
                      onTap: () => context.push('/product/${product.id}'),
                      trailing: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          IconButton(
                            onPressed: () => ref
                                .read(authControllerProvider.notifier)
                                .toggleFavorite(product.id),
                            icon: const Icon(
                              Icons.favorite_rounded,
                              color: AppColors.primary,
                              size: 20,
                            ),
                          ),
                          IconButton(
                            onPressed: product.inStock
                                ? () {
                                    ref
                                        .read(cartControllerProvider.notifier)
                                        .add(product);
                                    ScaffoldMessenger.of(context)
                                      ..hideCurrentSnackBar()
                                      ..showSnackBar(
                                        const SnackBar(
                                          content: Text('تمت الإضافة للعربة'),
                                        ),
                                      );
                                  }
                                : null,
                            icon: const Icon(
                              Icons.add_shopping_cart_rounded,
                              size: 20,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                );
              },
            ),
    );
  }
}
