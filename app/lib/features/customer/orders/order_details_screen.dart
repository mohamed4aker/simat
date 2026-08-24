import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/common.dart';
import '../../../core/widgets/order_status_chip.dart';
import '../../../core/widgets/product_artwork.dart';
import '../../../data/models/models.dart';
import '../../../providers/app_providers.dart';

/// تفاصيل الطلب ومتابعة حالته.
class OrderDetailsScreen extends ConsumerWidget {
  final String orderId;
  const OrderDetailsScreen({super.key, required this.orderId});

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
                      'اتعمل ${Fmt.dateTime(value.createdAt)}',
                      style: const TextStyle(
                        fontSize: 12.5,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 14),
              _Timeline(order: value),
              const SizedBox(height: 14),
              Text('المنتجات',
                  style: Theme.of(context).textTheme.titleMedium),
              const SizedBox(height: 10),
              for (final item in value.items)
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: AppCard(
                    padding: const EdgeInsets.all(10),
                    onTap: () => context.push('/product/${item.productId}'),
                    child: Row(
                      children: [
                        ProductArtwork(
                          seed: item.productId,
                          imagePath: item.imagePath,
                          width: 60,
                          height: 60,
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
                                '${item.sizeMl} مل × ${item.quantity}',
                                style: const TextStyle(
                                  fontSize: 12,
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
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('عنوان الشحن',
                        style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 8),
                    Text(
                      '${value.address.fullName} · ${value.address.phone}',
                      style: const TextStyle(fontSize: 13),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      value.address.fullLine,
                      style: const TextStyle(
                        fontSize: 13,
                        height: 1.7,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    if (value.notes.isNotEmpty) ...[
                      const Divider(height: 20),
                      Text(
                        'ملاحظات: ${value.notes}',
                        style: const TextStyle(
                          fontSize: 12.5,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 14),
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
                        label: 'الخصم${value.couponCode != null ? ' (${value.couponCode})' : ''}',
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
              if (value.status == OrderStatus.pending ||
                  value.status == OrderStatus.confirmed) ...[
                const SizedBox(height: 18),
                OutlinedButton.icon(
                  onPressed: () => _cancel(context, ref, value.id),
                  icon: const Icon(Icons.cancel_outlined, size: 18),
                  label: const Text('إلغاء الطلب'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.danger,
                    side: const BorderSide(color: AppColors.danger),
                  ),
                ),
              ],
            ],
          );
        },
      ),
    );
  }

  Future<void> _cancel(
    BuildContext context,
    WidgetRef ref,
    String id,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إلغاء الطلب'),
        content: const Text('متأكد إنك عايز تلغي الطلب ده؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('رجوع'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: AppColors.danger),
            child: const Text('إلغاء الطلب'),
          ),
        ],
      ),
    );
    if (!(confirmed ?? false)) return;
    await ref
        .read(orderRepositoryProvider)
        .cancel(id, reason: 'إلغاء من العميل');
    bumpData(ref);
  }
}

/// خط زمني لحالات الطلب.
class _Timeline extends StatelessWidget {
  final Order order;
  const _Timeline({required this.order});

  static const List<OrderStatus> _flow = [
    OrderStatus.pending,
    OrderStatus.confirmed,
    OrderStatus.preparing,
    OrderStatus.shipped,
    OrderStatus.delivered,
  ];

  @override
  Widget build(BuildContext context) {
    final isClosed = order.status == OrderStatus.cancelled ||
        order.status == OrderStatus.returned;

    if (isClosed) {
      return AppCard(
        child: Row(
          children: [
            Icon(
              OrderStatusStyle.icon(order.status),
              color: OrderStatusStyle.color(order.status),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                'الطلب ${order.status.labelAr}',
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  fontSize: 14,
                ),
              ),
            ),
            Text(
              Fmt.dateShort(order.updatedAt),
              style: const TextStyle(
                fontSize: 12,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
      );
    }

    final currentIndex = _flow.indexOf(order.status);
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('حالة الطلب',
              style: Theme.of(context).textTheme.titleMedium),
          const SizedBox(height: 14),
          for (var i = 0; i < _flow.length; i++)
            _step(
              status: _flow[i],
              done: i <= currentIndex,
              isLast: i == _flow.length - 1,
              at: _timeFor(_flow[i]),
            ),
        ],
      ),
    );
  }

  DateTime? _timeFor(OrderStatus status) {
    for (final event in order.timeline) {
      if (event.status == status) return event.at;
    }
    return null;
  }

  Widget _step({
    required OrderStatus status,
    required bool done,
    required bool isLast,
    DateTime? at,
  }) {
    final color = done ? OrderStatusStyle.color(status) : AppColors.divider;
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Column(
            children: [
              Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  color: done ? color : AppColors.surface,
                  shape: BoxShape.circle,
                  border: Border.all(color: color, width: 1.6),
                ),
                child: done
                    ? const Icon(Icons.check_rounded,
                        size: 13, color: Colors.white)
                    : null,
              ),
              if (!isLast)
                Expanded(
                  child: Container(width: 2, color: color),
                ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : 18),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    status.labelAr,
                    style: TextStyle(
                      fontSize: 13.5,
                      fontWeight: done ? FontWeight.w700 : FontWeight.w400,
                      color: done
                          ? AppColors.textPrimary
                          : AppColors.textMuted,
                    ),
                  ),
                  if (at != null)
                    Text(
                      Fmt.dateTime(at),
                      style: const TextStyle(
                        fontSize: 11.5,
                        color: AppColors.textMuted,
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
