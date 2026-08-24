import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/common.dart';
import '../../../core/widgets/simat_logo.dart';
import '../../../providers/app_providers.dart';

/// صفحة الحساب.
class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider);
    final orders = ref.watch(myOrdersProvider).valueOrNull ?? const [];

    return Scaffold(
      appBar: AppBar(title: const Text('حسابي')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 28),
        children: [
          if (user == null)
            AppCard(
              child: Column(
                children: [
                  const SimatMark(size: 54),
                  const SizedBox(height: 14),
                  Text(
                    'سجّل دخولك',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'عشان تحفظ عناوينك، تتابع طلباتك، وتجمّع مفضّلتك',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 13,
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => context.push('/login'),
                    child: const Text('تسجيل الدخول'),
                  ),
                  const SizedBox(height: 8),
                  OutlinedButton(
                    onPressed: () => context.push('/register'),
                    child: const Text('إنشاء حساب'),
                  ),
                ],
              ),
            )
          else ...[
            AppCard(
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 30,
                    backgroundColor: AppColors.primary,
                    child: Text(
                      user.initials,
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                user.name,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(
                                  fontSize: 16.5,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                            if (user.isAdmin) ...[
                              const SizedBox(width: 8),
                              const AppBadge(
                                label: 'أدمن',
                                color: AppColors.accent,
                                fontSize: 10,
                              ),
                            ],
                          ],
                        ),
                        const SizedBox(height: 3),
                        Text(
                          user.phone,
                          textDirection: TextDirection.ltr,
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => context.push('/profile/edit'),
                    icon: const Icon(Icons.edit_outlined),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: _StatTile(
                    icon: Icons.receipt_long_outlined,
                    value: '${orders.length}',
                    label: 'طلب',
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _StatTile(
                    icon: Icons.favorite_border_rounded,
                    value: '${user.favorites.length}',
                    label: 'مفضلة',
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _StatTile(
                    icon: Icons.location_on_outlined,
                    value: '${user.addresses.length}',
                    label: 'عنوان',
                  ),
                ),
              ],
            ),
          ],
          const SizedBox(height: 18),
          if (user?.isAdmin ?? false) ...[
            _MenuTile(
              icon: Icons.dashboard_customize_outlined,
              title: 'لوحة تحكم المتجر',
              subtitle: 'التقارير، المنتجات، والطلبات',
              highlighted: true,
              onTap: () => context.go('/admin'),
            ),
            const SizedBox(height: 12),
          ],
          _MenuTile(
            icon: Icons.receipt_long_outlined,
            title: 'طلباتي',
            onTap: () => context.push('/orders'),
          ),
          _MenuTile(
            icon: Icons.location_on_outlined,
            title: 'عناويني',
            onTap: () => context.push('/addresses'),
          ),
          _MenuTile(
            icon: Icons.favorite_border_rounded,
            title: 'المفضلة',
            onTap: () => context.go('/favorites'),
          ),
          if (user != null)
            _MenuTile(
              icon: Icons.lock_outline_rounded,
              title: 'تغيير كلمة السر',
              onTap: () => _changePassword(context, ref),
            ),
          const SizedBox(height: 18),
          _MenuTile(
            icon: Icons.support_agent_outlined,
            title: 'خدمة العملاء',
            subtitle: AppConstants.supportPhone,
            onTap: () {},
          ),
          _MenuTile(
            icon: Icons.info_outline_rounded,
            title: 'عن سِمة',
            onTap: () => _about(context),
          ),
          if (user != null) ...[
            const SizedBox(height: 18),
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
          const SizedBox(height: 22),
          const Center(
            child: Text(
              'SIMAT — الإصدار ١٫٠٫٠',
              style: TextStyle(fontSize: 11.5, color: AppColors.textMuted),
            ),
          ),
        ],
      ),
    );
  }

  void _about(BuildContext context) {
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SimatLogo(markSize: 70),
            const SizedBox(height: 16),
            const Text(
              'سِمة علامة عطور مصرية بتقدّم تركيبات فاخرة بخامات أصلية '
              'وأسعار عادلة. كل زجاجة بتتعبّى وتتراجع يدوياً قبل ما توصلك.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 13, height: 1.9),
            ),
            const SizedBox(height: 12),
            Text(
              '${AppConstants.supportEmail}\n${AppConstants.instagram}',
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 12.5,
                color: AppColors.textSecondary,
                height: 1.8,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('تمام'),
          ),
        ],
      ),
    );
  }

  Future<void> _changePassword(BuildContext context, WidgetRef ref) async {
    final oldPassword = TextEditingController();
    final newPassword = TextEditingController();
    final formKey = GlobalKey<FormState>();

    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('تغيير كلمة السر'),
        content: Form(
          key: formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextFormField(
                controller: oldPassword,
                obscureText: true,
                decoration:
                    const InputDecoration(labelText: 'كلمة السر الحالية'),
                validator: (v) =>
                    (v ?? '').isEmpty ? 'مطلوبة' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: newPassword,
                obscureText: true,
                decoration:
                    const InputDecoration(labelText: 'كلمة السر الجديدة'),
                validator: (v) =>
                    (v ?? '').length < 6 ? '٦ أحرف على الأقل' : null,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('إلغاء'),
          ),
          TextButton(
            onPressed: () async {
              if (!formKey.currentState!.validate()) return;
              final messenger = ScaffoldMessenger.of(context);
              final navigator = Navigator.of(context);
              try {
                await ref
                    .read(authControllerProvider.notifier)
                    .changePassword(oldPassword.text, newPassword.text);
                navigator.pop();
                messenger.showSnackBar(
                  const SnackBar(content: Text('تم تغيير كلمة السر')),
                );
              } catch (e) {
                messenger.showSnackBar(
                  SnackBar(content: Text('$e')),
                );
              }
            },
            child: const Text('حفظ'),
          ),
        ],
      ),
    );

    oldPassword.dispose();
    newPassword.dispose();
  }
}

class _StatTile extends StatelessWidget {
  final IconData icon;
  final String value;
  final String label;

  const _StatTile({
    required this.icon,
    required this.value,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.symmetric(vertical: 14),
      child: Column(
        children: [
          Icon(icon, color: AppColors.accent, size: 20),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.w800,
              color: AppColors.primary,
            ),
          ),
          Text(
            label,
            style: const TextStyle(
              fontSize: 11.5,
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
    );
  }
}

class _MenuTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback onTap;
  final bool highlighted;

  const _MenuTile({
    required this.icon,
    required this.title,
    required this.onTap,
    this.subtitle,
    this.highlighted = false,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: AppCard(
        onTap: onTap,
        color: highlighted ? AppColors.primary : null,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 13),
        child: Row(
          children: [
            Icon(
              icon,
              size: 21,
              color: highlighted ? Colors.white : AppColors.primary,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.w700,
                      color: highlighted ? Colors.white : null,
                    ),
                  ),
                  if (subtitle != null)
                    Text(
                      subtitle!,
                      style: TextStyle(
                        fontSize: 12,
                        color: highlighted
                            ? Colors.white.withValues(alpha: 0.8)
                            : AppColors.textMuted,
                      ),
                    ),
                ],
              ),
            ),
            Icon(
              Icons.chevron_left_rounded,
              color: highlighted ? Colors.white : AppColors.textMuted,
            ),
          ],
        ),
      ),
    );
  }
}
