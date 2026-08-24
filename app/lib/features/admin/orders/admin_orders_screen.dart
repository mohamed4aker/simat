import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/common.dart';
import '../../../core/widgets/order_status_chip.dart';
import '../../../data/models/models.dart';
import '../../../providers/app_providers.dart';

/// إدارة كل طلبات المتجر.
class AdminOrdersScreen extends ConsumerStatefulWidget {
  const AdminOrdersScreen({super.key});

  @override
  ConsumerState<AdminOrdersScreen> createState() => _AdminOrdersScreenState();
}

class _AdminOrdersScreenState extends ConsumerState<AdminOrdersScreen> {
  final _search = TextEditingController();
  String _query = '';
  OrderStatus? _status;

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  List<Order> _filter(List<Order> all) {
    var list = all;
    if (_status != null) {
      list = list.where((o) => o.status == _status).toList();
    }
    final query = _query.trim();
    if (query.isNotEmpty) {
      list = list
          .where((o) =>
              o.orderNumber.contains(query) ||
              o.customerName.contains(query) ||
              o.customerPhone.contains(query))
          .toList();
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    final orders = ref.watch(allOrdersProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('الطلبات')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: AppSearchField(
              controller: _search,
              hint: 'ابحث برقم الطلب أو اسم/موبايل العميل',
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
                _statusChip(null, 'الكل'),
                for (final status in OrderStatus.values) ...[
                  const SizedBox(width: 8),
                  _statusChip(status, status.labelAr),
                ],
              ],
            ),
          ),
          Expanded(
            child: orders.when(
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
                    icon: Icons.receipt_long_outlined,
                    title: 'مفيش طلبات مطابقة',
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                  itemCount: list.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final order = list[index];
                    return AppCard(
                      onTap: () => context.push('/admin/orders/${order.id}'),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                order.orderNumber,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 14,
                                ),
                              ),
                              const Spacer(),
                              OrderStatusChip(status: order.status),
                            ],
                          ),
                          const SizedBox(height: 7),
                          Row(
                            children: [
                              const Icon(Icons.person_outline_rounded,
                                  size: 15, color: AppColors.textMuted),
                              const SizedBox(width: 5),
                              Expanded(
                                child: Text(
                                  '${order.customerName} · '
                                  '${order.customerPhone}',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: const TextStyle(
                                    fontSize: 12.5,
                                    color: AppColors.textSecondary,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              const Icon(Icons.location_on_outlined,
                                  size: 15, color: AppColors.textMuted),
                              const SizedBox(width: 5),
                              Expanded(
                                child: Text(
                                  order.address.shortLine,
                                  style: const TextStyle(
                                    fontSize: 12.5,
                                    color: AppColors.textMuted,
                                  ),
                                ),
                              ),
                              Text(
                                Fmt.relative(order.createdAt),
                                style: const TextStyle(
                                  fontSize: 11.5,
                                  color: AppColors.textMuted,
                                ),
                              ),
                            ],
                          ),
                          const Divider(height: 18),
                          Row(
                            children: [
                              Text(
                                Fmt.price(order.total),
                                style: const TextStyle(
                                  fontWeight: FontWeight.w800,
                                  fontSize: 15,
                                  color: AppColors.primary,
                                ),
                              ),
                              const SizedBox(width: 10),
                              Text(
                                '${order.itemsCount} صنف · '
                                '${order.paymentMethod.labelAr}',
                                style: const TextStyle(
                                  fontSize: 11.5,
                                  color: AppColors.textMuted,
                                ),
                              ),
                              const Spacer(),
                              const Icon(
                                Icons.chevron_left_rounded,
                                color: AppColors.textMuted,
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
          ),
        ],
      ),
    );
  }

  Widget _statusChip(OrderStatus? status, String label) {
    final selected = _status == status;
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      showCheckmark: false,
      onSelected: (_) => setState(() => _status = status),
      labelStyle: TextStyle(
        fontFamily: 'Cairo',
        fontSize: 12.5,
        fontWeight: FontWeight.w600,
        color: selected ? Colors.white : AppColors.textPrimary,
      ),
    );
  }
}
