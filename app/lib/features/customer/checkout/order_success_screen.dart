import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/common.dart';
import '../../../core/widgets/simat_pattern.dart';
import '../../../providers/app_providers.dart';

/// شاشة تأكيد نجاح الطلب.
class OrderSuccessScreen extends ConsumerWidget {
  final String orderId;
  const OrderSuccessScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final order = ref.watch(orderByIdProvider(orderId));

    return Scaffold(
      body: SimatPattern(
        opacity: 0.08,
        spacing: 70,
        child: SafeArea(
          child: order.when(
            loading: () => const SimatLoader(),
            error: (e, _) => EmptyState(
              icon: Icons.error_outline_rounded,
              title: 'حصل خطأ',
              message: '$e',
            ),
            data: (value) {
              if (value == null) {
                return const EmptyState(
                  icon: Icons.receipt_long_outlined,
                  title: 'الطلب مش موجود',
                );
              }
              return Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 104,
                      height: 104,
                      decoration: BoxDecoration(
                        color: AppColors.success.withValues(alpha: 0.12),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.check_rounded,
                        size: 54,
                        color: AppColors.success,
                      ),
                    ),
                    const SizedBox(height: 22),
                    Text(
                      'تم استلام طلبك 🎉',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                    const SizedBox(height: 8),
                    const Text(
                      'هنتواصل معاك على الموبايل لتأكيد الطلب قبل الشحن',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 13.5,
                        height: 1.8,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 26),
                    AppCard(
                      child: Column(
                        children: [
                          InfoRow(
                            label: 'رقم الطلب',
                            value: value.orderNumber,
                            bold: true,
                          ),
                          InfoRow(
                            label: 'عدد الأصناف',
                            value: '${value.itemsCount}',
                          ),
                          InfoRow(
                            label: 'طريقة الدفع',
                            value: value.paymentMethod.labelAr,
                          ),
                          InfoRow(
                            label: 'التوصيل المتوقع',
                            value:
                                'خلال ${AppConstants.deliveryDaysMin}–'
                                '${AppConstants.deliveryDaysMax} أيام',
                          ),
                          const Divider(height: 20),
                          InfoRow(
                            label: 'الإجمالي',
                            value: Fmt.price(value.total),
                            bold: true,
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 26),
                    ElevatedButton(
                      onPressed: () => context.go('/orders/${value.id}'),
                      child: const Text('تتبّع الطلب'),
                    ),
                    const SizedBox(height: 10),
                    OutlinedButton(
                      onPressed: () => context.go('/home'),
                      child: const Text('أكمل التسوّق'),
                    ),
                  ],
                ),
              );
            },
          ),
        ),
      ),
    );
  }
}
