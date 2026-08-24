import 'package:flutter/material.dart';

import '../../data/models/models.dart';
import '../theme/app_colors.dart';

/// ألوان وأيقونات حالات الطلب.
class OrderStatusStyle {
  OrderStatusStyle._();

  static Color color(OrderStatus status) => switch (status) {
        OrderStatus.pending => AppColors.warning,
        OrderStatus.confirmed => AppColors.info,
        OrderStatus.preparing => AppColors.accent,
        OrderStatus.shipped => AppColors.primaryLight,
        OrderStatus.delivered => AppColors.success,
        OrderStatus.cancelled => AppColors.danger,
        OrderStatus.returned => AppColors.textMuted,
      };

  static IconData icon(OrderStatus status) => switch (status) {
        OrderStatus.pending => Icons.hourglass_empty_rounded,
        OrderStatus.confirmed => Icons.verified_outlined,
        OrderStatus.preparing => Icons.inventory_2_outlined,
        OrderStatus.shipped => Icons.local_shipping_outlined,
        OrderStatus.delivered => Icons.check_circle_outline_rounded,
        OrderStatus.cancelled => Icons.cancel_outlined,
        OrderStatus.returned => Icons.assignment_return_outlined,
      };
}

/// شارة حالة الطلب.
class OrderStatusChip extends StatelessWidget {
  final OrderStatus status;
  final double fontSize;

  const OrderStatusChip({
    super.key,
    required this.status,
    this.fontSize = 11.5,
  });

  @override
  Widget build(BuildContext context) {
    final color = OrderStatusStyle.color(status);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.12),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.35)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(OrderStatusStyle.icon(status), size: fontSize + 3, color: color),
          const SizedBox(width: 5),
          Text(
            status.labelAr,
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.w700,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}
