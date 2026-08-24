import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/common.dart';
import '../../../core/widgets/order_status_chip.dart';
import '../../../providers/app_providers.dart';

/// قائمة طلبات العميل.
class OrdersScreen extends ConsumerWidget {
  const OrdersScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider);
    final orders = ref.watch(myOrdersProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('طلباتي')),
      body: user == null
          ? EmptyState(
              icon: Icons.lock_outline_rounded,
              title: 'محتاج تسجّل دخول',
              message: 'سجّل دخولك عشان تشوف طلباتك وتتابع الشحن',
              actionLabel: 'تسجيل الدخول',
              onAction: () => context.push('/login?redirect=/orders'),
            )
          : orders.when(
              loading: () => const SimatLoader(),
              error: (e, _) => EmptyState(
                icon: Icons.error_outline_rounded,
                title: 'حصل خطأ',
                message: '$e',
              ),
              data: (list) {
                if (list.isEmpty) {
                  return EmptyState(
                    icon: Icons.receipt_long_outlined,
                    title: 'لسه مفيش طلبات',
                    message: 'أول ما تطلب، هتلاقي كل طلباتك هنا',
                    actionLabel: 'تصفّح المتجر',
                    onAction: () => context.go('/catalog'),
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 24),
                  itemCount: list.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final order = list[index];
                    return AppCard(
                      onTap: () => context.push('/orders/${order.id}'),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                order.orderNumber,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 14.5,
                                ),
                              ),
                              const Spacer(),
                              OrderStatusChip(status: order.status),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            '${order.itemsCount} صنف · '
                            '${Fmt.dateShort(order.createdAt)}',
                            style: const TextStyle(
                              fontSize: 12.5,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Text(
                            order.items.map((e) => e.name).join('، '),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontSize: 12.5,
                              color: AppColors.textMuted,
                              height: 1.6,
                            ),
                          ),
                          const Divider(height: 20),
                          Row(
                            children: [
                              Text(
                                Fmt.price(order.total),
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                  color: AppColors.primary,
                                  fontSize: 15,
                                ),
                              ),
                              const Spacer(),
                              const Text(
                                'التفاصيل',
                                style: TextStyle(
                                  fontSize: 12.5,
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.accent,
                                ),
                              ),
                              const Icon(
                                Icons.chevron_left_rounded,
                                size: 18,
                                color: AppColors.accent,
                              ),
                            ],
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
