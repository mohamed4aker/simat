import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/common.dart';
import '../../../core/widgets/product_artwork.dart';
import '../../../providers/app_providers.dart';

/// عربة التسوق.
class CartScreen extends ConsumerWidget {
  const CartScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final items = ref.watch(cartControllerProvider);
    final subtotal = ref.watch(cartSubtotalProvider);
    final remaining = AppConstants.freeShippingThreshold - subtotal;

    return Scaffold(
      appBar: AppBar(
        title: const Text('عربة التسوق'),
        actions: [
          if (items.isNotEmpty)
            IconButton(
              tooltip: 'إفراغ العربة',
              onPressed: () => _confirmClear(context, ref),
              icon: const Icon(Icons.delete_sweep_outlined),
            ),
        ],
      ),
      body: items.isEmpty
          ? EmptyState(
              icon: Icons.shopping_bag_outlined,
              title: 'العربة فاضية',
              message: 'ابدأ تتصفّح المتجر وضيف العطور اللي عجبتك',
              actionLabel: 'تصفّح المتجر',
              onAction: () => context.go('/catalog'),
            )
          : Column(
              children: [
                if (remaining > 0)
                  Container(
                    width: double.infinity,
                    color: AppColors.secondary.withValues(alpha: 0.5),
                    padding: const EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 10,
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons.local_shipping_outlined,
                          size: 18,
                          color: AppColors.accent,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            'ضيف ${Fmt.price(remaining)} كمان وتحصل على شحن مجاني',
                            style: const TextStyle(fontSize: 12.5),
                          ),
                        ),
                      ],
                    ),
                  ),
                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 14, 16, 20),
                    itemCount: items.length,
                    separatorBuilder: (_, _) => const SizedBox(height: 10),
                    itemBuilder: (context, index) {
                      final item = items[index];
                      return Dismissible(
                        key: ValueKey(item.productId),
                        direction: DismissDirection.endToStart,
                        background: Container(
                          alignment: Alignment.centerLeft,
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          decoration: BoxDecoration(
                            color: AppColors.danger.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(18),
                          ),
                          child: const Icon(
                            Icons.delete_outline_rounded,
                            color: AppColors.danger,
                          ),
                        ),
                        onDismissed: (_) => ref
                            .read(cartControllerProvider.notifier)
                            .remove(item.productId),
                        child: AppCard(
                          padding: const EdgeInsets.all(10),
                          onTap: () =>
                              context.push('/product/${item.productId}'),
                          child: Row(
                            children: [
                              ProductArtwork(
                                seed: item.productId,
                                imagePath: item.imagePath,
                                width: 74,
                                height: 74,
                                borderRadius: BorderRadius.circular(14),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      item.name,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w700,
                                        fontSize: 14,
                                      ),
                                    ),
                                    Text(
                                      '${item.sizeMl} مل',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: AppColors.textMuted,
                                      ),
                                    ),
                                    const SizedBox(height: 8),
                                    Row(
                                      children: [
                                        QuantityStepper(
                                          value: item.quantity,
                                          size: 30,
                                          onChanged: (value) => ref
                                              .read(cartControllerProvider
                                                  .notifier)
                                              .setQuantity(
                                                  item.productId, value),
                                        ),
                                        const Spacer(),
                                        Text(
                                          Fmt.price(item.total),
                                          style: const TextStyle(
                                            fontWeight: FontWeight.w800,
                                            color: AppColors.primary,
                                            fontSize: 14.5,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
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
      bottomNavigationBar: items.isEmpty
          ? null
          : Container(
              decoration: const BoxDecoration(
                color: AppColors.surface,
                border: Border(top: BorderSide(color: AppColors.divider)),
              ),
              child: SafeArea(
                top: false,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 12),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      InfoRow(
                        label: 'الإجمالي المبدئي',
                        value: Fmt.price(subtotal),
                        bold: true,
                      ),
                      const SizedBox(height: 4),
                      const Text(
                        'الشحن بيتحسب في الخطوة الجاية حسب المحافظة',
                        style: TextStyle(
                          fontSize: 11.5,
                          color: AppColors.textMuted,
                        ),
                      ),
                      const SizedBox(height: 12),
                      ElevatedButton.icon(
                        onPressed: () => context.push('/checkout'),
                        icon: const Icon(Icons.arrow_back_rounded, size: 19),
                        label: const Text('إتمام الطلب'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
    );
  }

  Future<void> _confirmClear(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('تفضية العربة'),
        content: const Text('متأكد إنك عايز تمسح كل المنتجات من العربة؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('رجوع'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: AppColors.danger),
            child: const Text('امسح'),
          ),
        ],
      ),
    );
    if (confirmed ?? false) {
      ref.read(cartControllerProvider.notifier).clear();
    }
  }
}
