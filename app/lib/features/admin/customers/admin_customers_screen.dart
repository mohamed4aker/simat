import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/common.dart';
import '../../../data/models/models.dart';
import '../../../providers/app_providers.dart';

/// قائمة العملاء مع إحصائيات كل عميل.
class AdminCustomersScreen extends ConsumerStatefulWidget {
  const AdminCustomersScreen({super.key});

  @override
  ConsumerState<AdminCustomersScreen> createState() =>
      _AdminCustomersScreenState();
}

class _AdminCustomersScreenState
    extends ConsumerState<AdminCustomersScreen> {
  final _search = TextEditingController();
  String _query = '';

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final customers = ref.watch(customersProvider);
    final orders = ref.watch(allOrdersProvider).valueOrNull ?? const [];

    return Scaffold(
      appBar: AppBar(title: const Text('العملاء')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
            child: AppSearchField(
              controller: _search,
              hint: 'ابحث بالاسم أو رقم الموبايل',
              onChanged: (value) => setState(() => _query = value),
              onClear: _query.isEmpty
                  ? null
                  : () {
                      _search.clear();
                      setState(() => _query = '');
                    },
            ),
          ),
          Expanded(
            child: customers.when(
              loading: () => const SimatLoader(),
              error: (e, _) => EmptyState(
                icon: Icons.error_outline_rounded,
                title: 'حصل خطأ',
                message: '$e',
              ),
              data: (all) {
                var list = all.where((u) => !u.isAdmin).toList();
                final query = _query.trim();
                if (query.isNotEmpty) {
                  list = list
                      .where((u) =>
                          u.name.contains(query) || u.phone.contains(query))
                      .toList();
                }
                if (list.isEmpty) {
                  return const EmptyState(
                    icon: Icons.people_outline_rounded,
                    title: 'مفيش عملاء مطابقين',
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                  itemCount: list.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final customer = list[index];
                    final customerOrders = orders
                        .where((o) => o.userId == customer.id)
                        .toList();
                    final spent = customerOrders
                        .where((o) => o.status.countsAsRevenue)
                        .fold<double>(0, (sum, o) => sum + o.total);
                    return _CustomerTile(
                      customer: customer,
                      ordersCount: customerOrders.length,
                      spent: spent,
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

class _CustomerTile extends ConsumerWidget {
  final AppUser customer;
  final int ordersCount;
  final double spent;

  const _CustomerTile({
    required this.customer,
    required this.ordersCount,
    required this.spent,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return AppCard(
      child: Column(
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 22,
                backgroundColor: customer.isBlocked
                    ? AppColors.textMuted
                    : AppColors.primary,
                child: Text(
                  customer.initials,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            customer.name,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 14.5,
                            ),
                          ),
                        ),
                        if (customer.isBlocked) ...[
                          const SizedBox(width: 6),
                          const AppBadge(
                            label: 'موقوف',
                            color: AppColors.danger,
                            fontSize: 10,
                          ),
                        ],
                      ],
                    ),
                    Text(
                      customer.phone,
                      textDirection: TextDirection.ltr,
                      style: const TextStyle(
                        fontSize: 12.5,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    Text(
                      'عميل من ${Fmt.date(customer.createdAt)}',
                      style: const TextStyle(
                        fontSize: 11,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert_rounded, size: 20),
                onSelected: (value) async {
                  if (value == 'block') {
                    await ref
                        .read(authRepositoryProvider)
                        .setBlocked(customer.id, !customer.isBlocked);
                    bumpData(ref);
                  }
                },
                itemBuilder: (context) => [
                  PopupMenuItem(
                    value: 'block',
                    child: Text(
                      customer.isBlocked ? 'إلغاء الإيقاف' : 'إيقاف الحساب',
                    ),
                  ),
                ],
              ),
            ],
          ),
          const Divider(height: 20),
          Row(
            children: [
              _stat('الطلبات', '$ordersCount'),
              _divider(),
              _stat('إجمالي الشراء', Fmt.price(spent)),
              _divider(),
              _stat('العناوين', '${customer.addresses.length}'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _stat(String label, String value) => Expanded(
        child: Column(
          children: [
            Text(
              value,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: const TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 13.5,
                color: AppColors.primary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              label,
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.textMuted,
              ),
            ),
          ],
        ),
      );

  Widget _divider() => Container(
        width: 1,
        height: 26,
        color: AppColors.divider,
      );
}
