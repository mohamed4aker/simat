import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/common.dart';
import '../../../providers/app_providers.dart';
import 'address_form.dart';

/// إدارة عناوين الشحن.
class AddressesScreen extends ConsumerWidget {
  const AddressesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('عناويني')),
      floatingActionButton: user == null
          ? null
          : FloatingActionButton.extended(
              onPressed: () => showAddressForm(context, ref),
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
              icon: const Icon(Icons.add_rounded),
              label: const Text('عنوان جديد'),
            ),
      body: user == null
          ? const EmptyState(
              icon: Icons.lock_outline_rounded,
              title: 'محتاج تسجّل دخول',
            )
          : user.addresses.isEmpty
              ? EmptyState(
                  icon: Icons.location_off_outlined,
                  title: 'مفيش عناوين محفوظة',
                  message: 'ضيف عنوان عشان الطلب يوصلك بسرعة',
                  actionLabel: 'ضيف عنوان',
                  onAction: () => showAddressForm(context, ref),
                )
              : ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 14, 16, 90),
                  itemCount: user.addresses.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final address = user.addresses[index];
                    return AppCard(
                      onTap: () =>
                          showAddressForm(context, ref, address: address),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              const Icon(
                                Icons.location_on_outlined,
                                size: 18,
                                color: AppColors.primary,
                              ),
                              const SizedBox(width: 6),
                              Text(
                                address.label,
                                style: const TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 14.5,
                                ),
                              ),
                              if (address.isDefault) ...[
                                const SizedBox(width: 8),
                                const AppBadge(
                                  label: 'أساسي',
                                  color: AppColors.accent,
                                  fontSize: 10,
                                ),
                              ],
                              const Spacer(),
                              IconButton(
                                onPressed: () => _delete(
                                  context,
                                  ref,
                                  address.id,
                                ),
                                icon: const Icon(
                                  Icons.delete_outline_rounded,
                                  size: 19,
                                  color: AppColors.danger,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${address.fullName} · ${address.phone}',
                            style: const TextStyle(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            address.fullLine,
                            style: const TextStyle(
                              fontSize: 12.5,
                              color: AppColors.textMuted,
                              height: 1.7,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
    );
  }

  Future<void> _delete(
    BuildContext context,
    WidgetRef ref,
    String addressId,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حذف العنوان'),
        content: const Text('متأكد إنك عايز تحذف العنوان ده؟'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('رجوع'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: AppColors.danger),
            child: const Text('حذف'),
          ),
        ],
      ),
    );
    if (confirmed ?? false) {
      await ref.read(authControllerProvider.notifier).deleteAddress(addressId);
    }
  }
}
