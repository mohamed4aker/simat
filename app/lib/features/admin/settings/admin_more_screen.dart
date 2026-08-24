import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/common.dart';
import '../../../providers/app_providers.dart';

/// قائمة «المزيد» في لوحة التحكم.
class AdminMoreScreen extends ConsumerWidget {
  const AdminMoreScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider);
    final report = ref.watch(dashboardReportProvider).valueOrNull;

    return Scaffold(
      appBar: AppBar(title: const Text('المزيد')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 14, 16, 28),
        children: [
          AppCard(
            child: Row(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: AppColors.primary,
                  child: Text(
                    user?.initials ?? 'أ',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700,
                      fontSize: 17,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        user?.name ?? 'مسؤول',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const Text(
                        'مسؤول المتجر',
                        style: TextStyle(
                          fontSize: 12.5,
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          if (report != null) ...[
            const SizedBox(height: 12),
            AppCard(
              child: Column(
                children: [
                  InfoRow(
                    label: 'إجمالي الإيراد',
                    value: Fmt.price(report.lifetimeRevenue),
                    bold: true,
                  ),
                  InfoRow(
                    label: 'المنتجات المفعّلة',
                    value: '${report.totalProducts}',
                  ),
                  InfoRow(
                    label: 'العملاء',
                    value: '${report.totalCustomers}',
                  ),
                  InfoRow(
                    label: 'طلبات محتاجة متابعة',
                    value: '${report.pendingCount}',
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 18),
          _tile(
            context,
            icon: Icons.category_outlined,
            title: 'التصنيفات',
            subtitle: 'إضافة وتعديل تصنيفات المنتجات',
            onTap: () => context.push('/admin/categories'),
          ),
          _tile(
            context,
            icon: Icons.confirmation_number_outlined,
            title: 'كوبونات الخصم',
            subtitle: 'إنشاء أكواد خصم ومتابعة استخدامها',
            onTap: () => context.push('/admin/coupons'),
          ),
          _tile(
            context,
            icon: Icons.people_outline_rounded,
            title: 'العملاء',
            subtitle: 'قائمة العملاء وإحصائياتهم',
            onTap: () => context.push('/admin/customers'),
          ),
          _tile(
            context,
            icon: Icons.storefront_outlined,
            title: 'واجهة المتجر',
            subtitle: 'شوف التطبيق بعين العميل',
            onTap: () => context.go('/home'),
          ),
          const SizedBox(height: 18),
          _tile(
            context,
            icon: Icons.restart_alt_rounded,
            title: 'إعادة ضبط البيانات التجريبية',
            subtitle: 'يرجّع الكتالوج والطلبات لحالتها الأصلية',
            color: AppColors.warning,
            onTap: () => _reset(context, ref),
          ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () async {
              await ref.read(authControllerProvider.notifier).logout();
              if (context.mounted) context.go('/home');
            },
            icon: const Icon(Icons.logout_rounded, size: 18),
            label: const Text('تسجيل الخروج'),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.danger,
              side: const BorderSide(color: AppColors.danger),
            ),
          ),
        ],
      ),
    );
  }

  Widget _tile(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
    Color color = AppColors.primary,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: AppCard(
        onTap: onTap,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
        child: Row(
          children: [
            Icon(icon, size: 21, color: color),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  Text(
                    subtitle,
                    style: const TextStyle(
                      fontSize: 11.5,
                      color: AppColors.textMuted,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(
              Icons.chevron_left_rounded,
              color: AppColors.textMuted,
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _reset(BuildContext context, WidgetRef ref) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('إعادة الضبط'),
        content: const Text(
          'هيتم مسح كل التعديلات والطلبات الجديدة والرجوع للبيانات '
          'التجريبية الأصلية. متأكد؟',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('رجوع'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: AppColors.danger),
            child: const Text('إعادة الضبط'),
          ),
        ],
      ),
    );
    if (!(confirmed ?? false)) return;

    await ref.read(localStoreProvider).resetToSeed();
    ref.read(cartControllerProvider.notifier).clear();
    ref.read(authControllerProvider.notifier).refresh();
    bumpData(ref);
    if (!context.mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('تم إرجاع البيانات التجريبية')),
    );
  }
}
