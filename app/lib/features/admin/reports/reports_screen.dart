import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/common.dart';
import '../../../data/repositories/reports_repository.dart';
import '../../../providers/app_providers.dart';
import '../widgets/admin_widgets.dart';

/// تقارير تفصيلية للمتجر مع إمكانية تصدير CSV.
class AdminReportsScreen extends ConsumerWidget {
  const AdminReportsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final report = ref.watch(dashboardReportProvider);
    final range = ref.watch(reportRangeProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('التقارير'),
        actions: [
          IconButton(
            tooltip: 'تصدير CSV',
            onPressed: () => _export(context, ref, range),
            icon: const Icon(Icons.download_outlined),
          ),
        ],
      ),
      body: report.when(
        loading: () => const SimatLoader(),
        error: (e, _) => EmptyState(
          icon: Icons.error_outline_rounded,
          title: 'حصل خطأ',
          message: '$e',
        ),
        data: (data) => ListView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
          children: [
            SizedBox(
              height: 38,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: ReportRange.values.length,
                separatorBuilder: (_, _) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final value = ReportRange.values[index];
                  return ChoiceChip(
                    label: Text(value.labelAr),
                    selected: value == range,
                    showCheckmark: false,
                    onSelected: (_) => ref
                        .read(reportRangeProvider.notifier)
                        .state = value,
                    labelStyle: TextStyle(
                      fontFamily: 'Cairo',
                      fontSize: 12.5,
                      fontWeight: FontWeight.w600,
                      color: value == range
                          ? Colors.white
                          : AppColors.textPrimary,
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 16),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 10,
              crossAxisSpacing: 10,
              childAspectRatio: 1.36,
              children: [
                KpiCard(
                  label: 'إيراد الفترة',
                  value: Fmt.price(data.revenue),
                  icon: Icons.trending_up_rounded,
                  growth: data.revenueGrowth,
                ),
                KpiCard(
                  label: 'إيراد كلّي',
                  value: Fmt.price(data.lifetimeRevenue),
                  icon: Icons.account_balance_wallet_outlined,
                  color: AppColors.accent,
                ),
                KpiCard(
                  label: 'عملاء جدد',
                  value: Fmt.number(data.newCustomers),
                  icon: Icons.person_add_alt_outlined,
                  color: AppColors.info,
                  hint: 'إجمالي العملاء ${data.totalCustomers}',
                ),
                KpiCard(
                  label: 'طلبات مفتوحة',
                  value: Fmt.number(data.pendingCount),
                  icon: Icons.pending_actions_outlined,
                  color: AppColors.warning,
                  hint: 'محتاجة متابعة',
                ),
              ],
            ),
            const SizedBox(height: 14),
            ChartCard(
              title: 'المبيعات حسب التصنيف',
              subtitle: range.labelAr,
              height: 210,
              child: _CategoryChart(data: data),
            ),
            const SizedBox(height: 14),
            ChartCard(
              title: 'الإيراد حسب طريقة الدفع',
              height: 170,
              child: _PaymentChart(data: data),
            ),
            const SizedBox(height: 14),
            _TopProductsTable(data: data),
            const SizedBox(height: 14),
            _TopCustomers(data: data),
          ],
        ),
      ),
    );
  }

  Future<void> _export(
    BuildContext context,
    WidgetRef ref,
    ReportRange range,
  ) async {
    final csv =
        await ref.read(reportsRepositoryProvider).exportOrdersCsv(range);
    await Clipboard.setData(ClipboardData(text: csv));
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('تم نسخ تقرير الطلبات (CSV) — الصقه في أي شيت'),
      ),
    );
  }
}

class _CategoryChart extends StatelessWidget {
  final DashboardReport data;
  const _CategoryChart({required this.data});

  @override
  Widget build(BuildContext context) {
    final entries = data.revenueByCategory.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    if (entries.isEmpty) {
      return const Center(
        child: Text(
          'مفيش بيانات كفاية',
          style: TextStyle(fontSize: 13, color: AppColors.textMuted),
        ),
      );
    }
    final maxY = entries.first.value;

    return BarChart(
      BarChartData(
        maxY: maxY * 1.2,
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: maxY / 3,
          getDrawingHorizontalLine: (_) =>
              const FlLine(color: AppColors.divider, strokeWidth: 1),
        ),
        borderData: FlBorderData(show: false),
        barTouchData: BarTouchData(
          touchTooltipData: BarTouchTooltipData(
            getTooltipColor: (_) => AppColors.dark,
            getTooltipItem: (group, _, rod, _) => BarTooltipItem(
              '${entries[group.x].key}\n${Fmt.price(rod.toY)}',
              const TextStyle(
                color: Colors.white,
                fontSize: 11.5,
                fontFamily: 'Cairo',
              ),
            ),
          ),
        ),
        titlesData: FlTitlesData(
          topTitles:
              const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          rightTitles:
              const AxisTitles(sideTitles: SideTitles(showTitles: false)),
          leftTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              reservedSize: 44,
              interval: maxY / 3,
              getTitlesWidget: (value, _) => Text(
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
              reservedSize: 42,
              getTitlesWidget: (value, _) {
                final index = value.toInt();
                if (index < 0 || index >= entries.length) {
                  return const SizedBox.shrink();
                }
                return Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: SizedBox(
                    width: 58,
                    child: Text(
                      entries[index].key,
                      textAlign: TextAlign.center,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(
                        fontSize: 9.5,
                        height: 1.3,
                        color: AppColors.textMuted,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),
        ),
        barGroups: [
          for (var i = 0; i < entries.length; i++)
            BarChartGroupData(
              x: i,
              barRods: [
                BarChartRodData(
                  toY: entries[i].value,
                  width: 20,
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(6),
                  ),
                  gradient: AppColors.primaryGradient,
                ),
              ],
            ),
        ],
      ),
    );
  }
}

class _PaymentChart extends StatelessWidget {
  final DashboardReport data;
  const _PaymentChart({required this.data});

  @override
  Widget build(BuildContext context) {
    final entries = data.revenueByPayment.entries.toList()
      ..sort((a, b) => b.value.compareTo(a.value));
    if (entries.isEmpty) {
      return const Center(
        child: Text(
          'مفيش بيانات كفاية',
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
              centerSpaceRadius: 32,
              sections: [
                for (var i = 0; i < entries.length; i++)
                  PieChartSectionData(
                    value: entries[i].value,
                    color: chartPalette[i % chartPalette.length],
                    radius: 36,
                    showTitle: false,
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
                for (var i = 0; i < entries.length; i++)
                  LegendDot(
                    color: chartPalette[i % chartPalette.length],
                    label: entries[i].key.labelAr,
                    value: entries[i].value,
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _TopProductsTable extends StatelessWidget {
  final DashboardReport data;
  const _TopProductsTable({required this.data});

  @override
  Widget build(BuildContext context) {
    if (data.topProducts.isEmpty) return const SizedBox.shrink();
    final max = data.topProducts.first.revenue;
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(
            title: 'أفضل ١٠ منتجات',
            icon: Icons.emoji_events_outlined,
          ),
          const SizedBox(height: 6),
          for (var i = 0; i < data.topProducts.length; i++)
            RankedRow(
              rank: i + 1,
              title: data.topProducts[i].name,
              subtitle: '${data.topProducts[i].quantity} قطعة مباعة',
              value: data.topProducts[i].revenue,
              maxValue: max,
              valueLabel: Fmt.price(data.topProducts[i].revenue),
            ),
        ],
      ),
    );
  }
}

class _TopCustomers extends StatelessWidget {
  final DashboardReport data;
  const _TopCustomers({required this.data});

  @override
  Widget build(BuildContext context) {
    if (data.topCustomers.isEmpty) return const SizedBox.shrink();
    final max = data.topCustomers.first.spent;
    return AppCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(
            title: 'أفضل العملاء',
            icon: Icons.workspace_premium_outlined,
          ),
          const SizedBox(height: 6),
          for (var i = 0; i < data.topCustomers.length; i++)
            RankedRow(
              rank: i + 1,
              title: data.topCustomers[i].name,
              subtitle:
                  '${data.topCustomers[i].orders} طلب · '
                  '${data.topCustomers[i].phone}',
              value: data.topCustomers[i].spent,
              maxValue: max,
              valueLabel: Fmt.price(data.topCustomers[i].spent),
              color: AppColors.accent,
            ),
        ],
      ),
    );
  }
}
