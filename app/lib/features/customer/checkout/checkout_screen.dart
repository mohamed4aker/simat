import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/common.dart';
import '../../../data/models/models.dart';
import '../../../data/repositories/coupon_repository.dart';
import '../../../providers/app_providers.dart';
import '../profile/address_form.dart';

/// شاشة إتمام الطلب: العنوان، الدفع، الكوبون، والملخّص.
class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen> {
  Address? _selectedAddress;
  PaymentMethod _payment = PaymentMethod.cashOnDelivery;
  final _couponController = TextEditingController();
  final _notesController = TextEditingController();
  CouponResult? _couponResult;
  bool _placing = false;

  @override
  void initState() {
    super.initState();
    _selectedAddress = ref.read(authControllerProvider)?.defaultAddress;
  }

  @override
  void dispose() {
    _couponController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _applyCoupon(double subtotal) async {
    final result = await ref
        .read(couponRepositoryProvider)
        .apply(_couponController.text, subtotal);
    if (!mounted) return;
    setState(() => _couponResult = result);
  }

  Future<void> _placeOrder({
    required double subtotal,
    required double shipping,
    required double discount,
  }) async {
    final user = ref.read(authControllerProvider);
    final address = _selectedAddress;
    final items = ref.read(cartControllerProvider);

    if (user == null) {
      context.push('/login?redirect=/checkout');
      return;
    }
    if (address == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('اختار عنوان الشحن الأول')),
      );
      return;
    }
    if (items.isEmpty) return;

    setState(() => _placing = true);
    try {
      final order = await ref.read(orderRepositoryProvider).place(
            user: user,
            items: items,
            address: address,
            paymentMethod: _payment,
            shipping: shipping,
            discount: discount,
            couponCode: _couponResult?.coupon?.code,
            notes: _notesController.text.trim(),
          );

      await ref.read(catalogRepositoryProvider).applyStockChanges(items);
      final code = _couponResult?.coupon?.code;
      if (code != null) {
        await ref.read(couponRepositoryProvider).markUsed(code);
      }
      ref.read(cartControllerProvider.notifier).clear();
      bumpData(ref);

      if (!mounted) return;
      context.pushReplacement('/order-success/${order.id}');
    } finally {
      if (mounted) setState(() => _placing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authControllerProvider);
    final items = ref.watch(cartControllerProvider);
    final subtotal = ref.watch(cartSubtotalProvider);

    if (user == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('إتمام الطلب')),
        body: EmptyState(
          icon: Icons.lock_outline_rounded,
          title: 'محتاج تسجّل دخول',
          message: 'سجّل دخولك عشان تقدر تكمّل الطلب وتتابعه',
          actionLabel: 'تسجيل الدخول',
          onAction: () => context.push('/login?redirect=/checkout'),
        ),
      );
    }

    if (items.isEmpty) {
      return Scaffold(
        appBar: AppBar(title: const Text('إتمام الطلب')),
        body: EmptyState(
          icon: Icons.shopping_bag_outlined,
          title: 'العربة فاضية',
          actionLabel: 'تصفّح المتجر',
          onAction: () => context.go('/catalog'),
        ),
      );
    }

    final address = _selectedAddress ?? user.defaultAddress;
    final shipping = address == null
        ? 0.0
        : AppConstants.shippingFor(address.governorate, subtotal);
    final discount = _couponResult?.isValid ?? false
        ? _couponResult!.discount
        : 0.0;
    final total = subtotal + shipping - discount;

    return Scaffold(
      appBar: AppBar(title: const Text('إتمام الطلب')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        children: [
          _StepTitle(number: '١', title: 'عنوان الشحن'),
          const SizedBox(height: 10),
          if (user.addresses.isEmpty)
            AppCard(
              onTap: () async {
                final created = await showAddressForm(context, ref);
                if (created != null) {
                  setState(() => _selectedAddress = created);
                }
              },
              child: const Row(
                children: [
                  Icon(Icons.add_location_alt_outlined,
                      color: AppColors.primary),
                  SizedBox(width: 10),
                  Text(
                    'ضيف عنوان الشحن',
                    style: TextStyle(fontWeight: FontWeight.w700),
                  ),
                ],
              ),
            )
          else ...[
            for (final item in user.addresses)
              Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: _AddressTile(
                  address: item,
                  selected: (address?.id ?? '') == item.id,
                  onTap: () => setState(() => _selectedAddress = item),
                  onEdit: () async {
                    final updated =
                        await showAddressForm(context, ref, address: item);
                    if (updated != null) {
                      setState(() => _selectedAddress = updated);
                    }
                  },
                ),
              ),
            TextButton.icon(
              onPressed: () async {
                final created = await showAddressForm(context, ref);
                if (created != null) {
                  setState(() => _selectedAddress = created);
                }
              },
              icon: const Icon(Icons.add_rounded, size: 18),
              label: const Text('عنوان جديد'),
            ),
          ],
          const SizedBox(height: 18),
          _StepTitle(number: '٢', title: 'طريقة الدفع'),
          const SizedBox(height: 10),
          for (final method in PaymentMethod.values)
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: AppCard(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 12,
                ),
                onTap: () => setState(() => _payment = method),
                child: Row(
                  children: [
                    Icon(
                      _payment == method
                          ? Icons.radio_button_checked_rounded
                          : Icons.radio_button_off_rounded,
                      color: _payment == method
                          ? AppColors.primary
                          : AppColors.textMuted,
                      size: 20,
                    ),
                    const SizedBox(width: 10),
                    Icon(_paymentIcon(method),
                        size: 19, color: AppColors.accent),
                    const SizedBox(width: 8),
                    Text(
                      method.labelAr,
                      style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          const SizedBox(height: 18),
          _StepTitle(number: '٣', title: 'كوبون الخصم'),
          const SizedBox(height: 10),
          Row(
            children: [
              Expanded(
                child: TextField(
                  controller: _couponController,
                  textCapitalization: TextCapitalization.characters,
                  decoration: const InputDecoration(
                    hintText: 'اكتب كود الخصم',
                    prefixIcon: Icon(Icons.confirmation_number_outlined),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              SizedBox(
                height: 52,
                child: OutlinedButton(
                  onPressed: () => _applyCoupon(subtotal),
                  child: const Text('تطبيق'),
                ),
              ),
            ],
          ),
          if (_couponResult != null) ...[
            const SizedBox(height: 8),
            Text(
              _couponResult!.isValid
                  ? 'تم تطبيق الكوبون — وفّرت ${Fmt.price(_couponResult!.discount)}'
                  : _couponResult!.error ?? '',
              style: TextStyle(
                fontSize: 12.5,
                fontWeight: FontWeight.w600,
                color: _couponResult!.isValid
                    ? AppColors.success
                    : AppColors.danger,
              ),
            ),
          ],
          const SizedBox(height: 18),
          _StepTitle(number: '٤', title: 'ملاحظات للطلب'),
          const SizedBox(height: 10),
          TextField(
            controller: _notesController,
            maxLines: 3,
            decoration: const InputDecoration(
              hintText: 'أي تعليمات خاصة بالتوصيل أو التغليف...',
            ),
          ),
          const SizedBox(height: 22),
          AppCard(
            child: Column(
              children: [
                InfoRow(label: 'المجموع الفرعي', value: Fmt.price(subtotal)),
                InfoRow(
                  label: 'الشحن',
                  value: shipping == 0 ? 'مجاني' : Fmt.price(shipping),
                  valueColor: shipping == 0 ? AppColors.success : null,
                ),
                if (discount > 0)
                  InfoRow(
                    label: 'الخصم',
                    value: '- ${Fmt.price(discount)}',
                    valueColor: AppColors.success,
                  ),
                const Divider(height: 20),
                InfoRow(
                  label: 'الإجمالي',
                  value: Fmt.price(total),
                  bold: true,
                ),
              ],
            ),
          ),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppColors.surface,
          border: Border(top: BorderSide(color: AppColors.divider)),
        ),
        child: SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
            child: ElevatedButton(
              onPressed: _placing
                  ? null
                  : () => _placeOrder(
                        subtotal: subtotal,
                        shipping: shipping,
                        discount: discount,
                      ),
              child: _placing
                  ? const SizedBox(
                      width: 22,
                      height: 22,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.4,
                        color: Colors.white,
                      ),
                    )
                  : Text('تأكيد الطلب · ${Fmt.price(total)}'),
            ),
          ),
        ),
      ),
    );
  }

  IconData _paymentIcon(PaymentMethod method) => switch (method) {
        PaymentMethod.cashOnDelivery => Icons.payments_outlined,
        PaymentMethod.card => Icons.credit_card_rounded,
        PaymentMethod.wallet => Icons.account_balance_wallet_outlined,
        PaymentMethod.instapay => Icons.bolt_rounded,
      };
}

class _StepTitle extends StatelessWidget {
  final String number;
  final String title;

  const _StepTitle({required this.number, required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 26,
          height: 26,
          alignment: Alignment.center,
          decoration: const BoxDecoration(
            color: AppColors.primary,
            shape: BoxShape.circle,
          ),
          child: Text(
            number,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
        const SizedBox(width: 9),
        Text(title, style: Theme.of(context).textTheme.titleMedium),
      ],
    );
  }
}

class _AddressTile extends StatelessWidget {
  final Address address;
  final bool selected;
  final VoidCallback onTap;
  final VoidCallback onEdit;

  const _AddressTile({
    required this.address,
    required this.selected,
    required this.onTap,
    required this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: onTap,
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            selected
                ? Icons.radio_button_checked_rounded
                : Icons.radio_button_off_rounded,
            color: selected ? AppColors.primary : AppColors.textMuted,
            size: 20,
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(
                      address.label,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                      ),
                    ),
                    if (address.isDefault) ...[
                      const SizedBox(width: 6),
                      const AppBadge(
                        label: 'أساسي',
                        color: AppColors.accent,
                        fontSize: 10,
                      ),
                    ],
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '${address.fullName} · ${address.phone}',
                  style: const TextStyle(
                    fontSize: 12.5,
                    color: AppColors.textSecondary,
                  ),
                ),
                Text(
                  address.fullLine,
                  style: const TextStyle(
                    fontSize: 12.5,
                    color: AppColors.textMuted,
                    height: 1.6,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: onEdit,
            icon: const Icon(Icons.edit_outlined, size: 18),
            color: AppColors.textSecondary,
          ),
        ],
      ),
    );
  }
}
