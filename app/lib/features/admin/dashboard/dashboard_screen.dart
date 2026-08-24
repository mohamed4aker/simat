import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/common.dart';
import '../../../core/widgets/order_status_chip.dart';
import '../../../core/widgets/simat_logo.dart';
import '../../../data/repositories/reports_repository.dart';
import '../../../providers/app_providers.dart';
import '../widgets/admin_widgets.dart';

/// الشاشة الرئيسية للوحة التحكم — ملخّص كل المتجر.
class AdminDashboardScreen extends ConsumerWidget {
  const AdminDashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final report = ref.watch(dashboardReportProvider);
    final range = ref.watch(reportRangeProvider);
    final user = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 16,
        centerTitle: false,
        title: const SimatLogoBar(height: 32),
        actions: [
          IconButton(
            tooltip: 'واجهة المتجر',
            onPressed: () => context.go('/home'),
            icon: const Icon(Icons.storefront_outlined),
          ),
          const SizedBox(width: 6),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async => bumpData(ref),
        child: report.when(
          loading: () => const SimatLoader(),
          error: (e, _) => EmptyState(
            icon: Icons.error_outline_rounded,
            title: 'حصل خطأ في التقارير',
            message: '$e',
          ),
          data: (data) => ListView(
            padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
            children: [
              Text(
                'أهلاً ${user?.name ?? ''} 👋',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 4),
              const Text(
                'ده ملخّص أداء المتجر',
                style: TextStyle(
                  fontSize: 13,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 14),
              _RangePicker(
                selected: range,
                onChanged: (value) =>
                    ref.read(reportRangeProvider.notifier).state = value,
              ),
              const SizedBox(height: 14),
              GridView.count(
                crossAxisCount: 2,
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                mainAxisSpacing: 10,
                crossAxisSpacing: 10,
                childAspectRatio: 1.36,
                children: [
                  KpiCard(
                    label: 'إجمالي المبيعات',
                    value: Fmt.price(data.revenue),
                    icon: Icons.payments_outlined,
                    growth: data.revenueGrowth,
                  ),
                  KpiCard(
                    label: 'عدد الطلبات',
                    value: Fmt.number(data.ordersCount),
                    icon: Icons.receipt_long_outlined,
                    color: AppColors.accent,
                    growth: data.ordersGrowth,
                  ),
                  KpiCard(
                    label: 'متوسط قيمة الطلب',
                    value: Fmt.price(data.averageOrderValue),
                    icon: Icons.calculate_outlined,
                    color: AppColors.info,
                  ),
                  KpiCard(
                    label: 'قطع مباعة',
                    value: Fmt.number(data.itemsSold),
                    icon: Icons.inventory_2_outlined,
                    color: AppColors.success,
                  ),
                ],
              ),
              const SizedBox(height: 14),
              ChartCard(
                title: 'منحنى المبيعات',
                subtitle: range.labelAr,
                child: _RevenueChart(points: data.series),
              ),
              const SizedBox(height: 14),
              _QuickActions(),
              const SizedBox(height: 14),
              ChartCard(
                title: 'حالات الطلبات',
                subtitle: 'توزيع الطلبات في الفترة المختارة',
                height: 170,
                child: _StatusChart(data: data),
              ),
              const SizedBox(height: 14),
              _TopProducts(data: data),
              const SizedBox(height: 14),
              _LowStock(data: data),
              const SizedBox(height: 14),
              _RecentOrders(),
            ],
          ),
        ),
      ),
    );
  }
}

class _RangePicker extends StatelessWidget {
  final ReportRange selected;
  final ValueChanged<ReportRange> onChanged;

  const _RangePicker({required this.selected, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 38,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: ReportRange.values.length,
        separatorBuilder: (_, _) => const SizedBox(width: 8),
        itemBuilder: (context, index) {
          final range = ReportRange.values[index];
          final isSelected = range == selected;
          return ChoiceChip(
            label: Text(range.labelAr),
            selected: isSelected,
            showCheckmark: false,
            onSelected: (_) => onChanged(range),
            labelStyle: TextStyle(
              fontFamily: 'Cairo',
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
              color: isSelected ? Colors.white : AppColors.textPrimary,
            ),
          );
        },
      ),
    );
  }
}

class _RevenueChart extends StatelessWidget {
  final List<SalesPoint> points;
  const _RevenueChart({required this.points});

  @override
  Widget build(BuildContext context) {
    if (points.isEmpty) {
      return const Center(
        child: Text(
          'مفيش مبيعات في الفترة دي',
          style: TextStyle(fontSize: 13, color: AppColors.textMuted),
        ),
      );
    }

    final maxY = points
        .map((e) => e.revenue)
        .fold<double>(0, (a, b) => a > b ? a : b);
    final step = (points.length / 5).ceil().clamp(1, 100);

    return LineChart(
      LineChartData(
        minY: 0,
        maxY: maxY == 0 ? 100 : maxY * 1.2,
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: maxY == 0 ? 50 : maxY / 3,
          getDrawingHorizontalLine: (_) => const FlLine(
            color: AppColors.divider,
            strokeWidth: 1,
          ),
        ),
        borderData: FlBorderData(show: false),
        titlesData: FlTitlesData(
          topTitles:
              const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles:
              const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 44,
              interval: maxY == 0 ? 50 : maxY / 3,
              getTitlesWidget: (value, meta) => Text(
                Fmt.compact(value),
                style: const TextStyle(
                  fontSize: 10,
                  color: AppColors.textMuted,
                ),
              ),
            ),
          ),
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 26,
              interval: step.toDouble(),
              getTitlesWidget: (value, meta) {
                final index = value.toInt();
                if (index < 0 || index >= points.length) {
                  return const SizedBox.shrink();
                }
                final date = points[index].date;
                return Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(
                    '${date.day}/${date.month}',
                    style: const TextStyle(
                      fontSize: 9.5,
                      color: AppColors.textMuted,
                    ),
                  ),
                );
              },
            ),
          ),
        ),
        lineTouchData: LineTouchData(
          touchTooltipData: LineTouchTooltipData(
            getTooltipColor: (_) => AppColors.dark,
            getTooltipItems: (spots) => spots.map((spot) {
              final point = points[spot.x.toInt()];
              return LineTooltipItem(
                '${Fmt.price(point.revenue)}\n${point.orders} طلب',
                const TextStyle(
                  color: Colors.white,
                  fontSize: 11.5,
                  fontFamily: 'Cairo',
                ),
              );
            }).toList(),
          ),
        ),
        lineBarsData: [
          LineChartBarData(
            spots: [
              for (var i = 0; i < points.length; i++)
                FlSpot(i.toDouble(), points[i].revenue),
            ],
            isCurved: true,
            curveSmoothness: 0.28,
            barWidth: 2.6,
            color: AppColors.primary,
            dotData: FlDotData(show: points.length <= 14),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  AppColors.primary.withValues(alpha: 0.28),
                  AppColors.primary.withValues(alpha: 0.02),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatusChart extends StatelessWidget {
  final DashboardReport data;
  const _StatusChart({required this.data});

  @override
  Widget build(BuildContext context) {
    final entries =
        data.ordersByStatus.entries.where((e) => e.value > 0).toList();
    if (entries.isEmpty) {
      return const Center(
        child: Text(
          'مفيش طلبات في الفترة دي',
          style: TextStyle(fontSize: 13, color: AppColors.textMuted),
        ),
      );
    }

    return Row(
      children: [
        SizedBox(
          width: 150,
          child: PieChart(
            PieChartData(
              sectionsSpace: 2,
              centerSpaceRadius: 34,
              sections: [
                for (final entry in entries)
                  PieChartSectionData(
                    value: entry.value.toDouble(),
                    color: OrderStatusStyle.color(entry.key),
                    radius: 34,
                    title: '${entry.value}',
                    titleStyle: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      fontFamily: 'Cairo',
                    ),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              children: [
                for (final entry in entries)
                  LegendDot(
                    color: OrderStatusStyle.color(entry.key),
                    label: entry.key.labelAr,
                    value: entry.value.toDouble(),
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _QuickActions extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: _ActionTile(
            icon: Icons.add_box_outlined,
            label: 'منتج جديد',
            onTap: () => context.push('/admin/products/new'),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _ActionTile(
            icon: Icons.category_outlined,
            label: 'التصنيفات',
            onTap: () => context.push('/admin/categories'),
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: _ActionTile(
            icon: Icons.confirmation_number_outlined,
            label: 'الكوبونات',
            onTap: () => context.push('/admin/coupons'),
          ),
        ),
      ],
    );
  }
}

class _ActionTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ActionTile({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Column(
        children: [
          Icon(icon, color: AppColors.primary, size: 22),
          const SizedBox(height: 7),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _TopProducts extends StatelessWidget {
  final DashboardReport data;
  const _TopProducts({required this.data});

  @override
  Widget build(BuildContext context) {
    if (data.topProducts.isEmpty) return const SizedBox.shrink();
    final max = data.topProducts.first.revenue;
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(
            title: 'الأكثر مبيعاً',
            icon: Icons.local_fire_department_outlined,
            actionLabel: 'التقارير',
            onAction: () => context.go('/admin/reports'),
          ),
          const SizedBox(height: 6),
          for (var i = 0; i < data.topProducts.take(5).length; i++)
            RankedRow(
              rank: i + 1,
              title: data.topProducts[i].name,
              subtitle:
                  '${data.topProducts[i].quantity} قطعة · متبقّي '
                  '${data.topProducts[i].stock}',
              value: data.topProducts[i].revenue,
              maxValue: max,
              valueLabel: Fmt.price(data.topProducts[i].revenue),
            ),
        ],
      ),
    );
  }
}

class _LowStock extends StatelessWidget {
  final DashboardReport data;
  const _LowStock({required this.data});

  @override
  Widget build(BuildContext context) {
    if (data.lowStock.isEmpty) return const SizedBox.shrink();
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(
            title: 'مخزون على وشك النفاد',
            icon: Icons.warning_amber_rounded,
          ),
          const SizedBox(height: 8),
          for (final product in data.lowStock.take(5))
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 5),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      product.name,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontSize: 13.5),
                    ),
                  ),
                  AppBadge(
                    label: product.stock == 0
                        ? 'نفد'
                        : 'باقي ${product.stock}',
                    color: product.stock == 0
                        ? AppColors.danger
                        : AppColors.warning,
                  ),
                  IconButton(
                    onPressed: () =>
                        context.push('/admin/products/${product.id}'),
                    icon: const Icon(Icons.edit_outlined, size: 17),
                    color: AppColors.textSecondary,
                    visualDensity: VisualDensity.compact,
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }
}

class _RecentOrders extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final orders = ref.watch(allOrdersProvider).valueOrNull ?? const [];
    if (orders.isEmpty) return const SizedBox.shrink();
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SectionHeader(
            title: 'أحدث الطلبات',
            icon: Icons.history_rounded,
            actionLabel: 'الكل',
            onAction: () => context.go('/admin/orders'),
          ),
          const SizedBox(height: 6),
          for (final order in orders.take(5))
            InkWell(
              onTap: () => context.push('/admin/orders/${order.id}'),
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 8),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            order.orderNumber,
                            style: const TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          Text(
                            '${order.customerName} · '
                            '${Fmt.relative(order.createdAt)}',
                            style: const TextStyle(
                              fontSize: 11.5,
                              color: AppColors.textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                    Text(
                      Fmt.price(order.total),
                      style: const TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(width: 8),
                    OrderStatusChip(status: order.status, fontSize: 10.5),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}
