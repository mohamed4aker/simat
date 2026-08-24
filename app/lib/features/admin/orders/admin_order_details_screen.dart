import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/common.dart';
import '../../../core/widgets/order_status_chip.dart';
import '../../../core/widgets/product_artwork.dart';
import '../../../data/models/models.dart';
import '../../../providers/app_providers.dart';

/// تفاصيل الطلب من جهة الأدمن مع تغيير الحالة.
class AdminOrderDetailsScreen extends ConsumerWidget {
  final String orderId;
  const AdminOrderDetailsScreen({super.key, required this.orderId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final order = ref.watch(orderByIdProvider(orderId));

    return Scaffold(
      appBar: AppBar(title: const Text('تفاصيل الطلب')),
      body: order.when(
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
          return ListView(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
            children: [
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          value.orderNumber,
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 16,
                          ),
                        ),
                        const Spacer(),
                        OrderStatusChip(status: value.status, fontSize: 12.5),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      Fmt.dateTime(value.createdAt),
                      style: const TextStyle(
                        fontSize: 12.5,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              Text('تغيير الحالة',
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 10),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  for (final status in OrderStatus.values)
                    ActionChip(
                      avatar: Icon(
                        OrderStatusStyle.icon(status),
                        size: 15,
                        color: OrderStatusStyle.color(status),
                      ),
                      label: Text(status.labelAr),
                      backgroundColor: value.status == status
                          ? OrderStatusStyle.color(status)
                              .withValues(alpha: 0.15)
                          : AppColors.surface,
                      labelStyle: const TextStyle(
                        fontFamily: 'Cairo',
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                      ),
                      onPressed: value.status == status
                          ? null
                          : () => _updateStatus(context, ref, value, status),
                    ),
                ],
              ),
              const SizedBox(height: 18),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('بيانات العميل',
                        style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 10),
                    InfoRow(label: 'الاسم', value: value.customerName),
                    InfoRow(label: 'الموبايل', value: value.customerPhone),
                    InfoRow(
                      label: 'المحافظة',
                      value: value.address.governorate,
                    ),
                    const SizedBox(height: 6),
                    Text(
                      value.address.fullLine,
                      style: const TextStyle(
                        fontSize: 12.5,
                        height: 1.7,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    if (value.address.notes.isNotEmpty)
                      Text(
                        'علامة مميزة: ${value.address.notes}',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppColors.textMuted,
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              Text('المنتجات',
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 10),
              for (final item in value.items)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: AppCard(
                    padding: const EdgeInsets.all(10),
                    child: Row(
                      children: [
                        ProductArtwork(
                          seed: item.productId,
                          imagePath: item.imagePath,
                          width: 56,
                          height: 56,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                item.name,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13.5,
                                ),
                              ),
                              Text(
                                '${item.sizeMl} مل × ${item.quantity} · '
                                '${Fmt.price(item.unitPrice)}',
                                style: const TextStyle(
                                  fontSize: 11.5,
                                  color: AppColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ),
                        Text(
                          Fmt.price(item.total),
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 13.5,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              const SizedBox(height: 8),
              AppCard(
                child: Column(
                  children: [
                    InfoRow(
                      label: 'المجموع الفرعي',
                      value: Fmt.price(value.subtotal),
                    ),
                    InfoRow(
                      label: 'الشحن',
                      value: value.shipping == 0
                          ? 'مجاني'
                          : Fmt.price(value.shipping),
                    ),
                    if (value.discount > 0)
                      InfoRow(
                        label: 'الخصم',
                        value: '- ${Fmt.price(value.discount)}',
                        valueColor: AppColors.success,
                      ),
                    InfoRow(
                      label: 'طريقة الدفع',
                      value: value.paymentMethod.labelAr,
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
              if (value.notes.isNotEmpty) ...[
                const SizedBox(height: 14),
                AppCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('ملاحظات العميل',
                          style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 6),
                      Text(
                        value.notes,
                        style: const TextStyle(fontSize: 13, height: 1.7),
                      ),
                    ],
                  ),
                ),
              ],
              const SizedBox(height: 14),
              AppCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('سجل الحالات',
                        style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 10),
                    for (final event in value.timeline.reversed)
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 5),
                        child: Row(
                          children: [
                            Icon(
                              OrderStatusStyle.icon(event.status),
                              size: 16,
                              color: OrderStatusStyle.color(event.status),
                            ),
                            const SizedBox(width: 8),
                            Text(
                              event.status.labelAr,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                            const Spacer(),
                            Text(
                              Fmt.dateTime(event.at),
                              style: const TextStyle(
                                fontSize: 11.5,
                                color: AppColors.textMuted,
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Future<void> _updateStatus(
    BuildContext context,
    WidgetRef ref,
    Order order,
    OrderStatus status,
  ) async {
    await ref.read(orderRepositoryProvider).updateStatus(
          order.id,
          status,
          note: 'تحديث من لوحة التحكم',
        );
    bumpData(ref);
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text('تم تحديث الحالة إلى «${status.labelAr}»')),
    );
  }
}
