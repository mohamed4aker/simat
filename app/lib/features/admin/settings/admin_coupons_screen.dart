import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/common.dart';
import '../../../data/models/models.dart';
import '../../../providers/app_providers.dart';

/// إدارة كوبونات الخصم.
class AdminCouponsScreen extends ConsumerWidget {
  const AdminCouponsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final coupons = ref.watch(couponsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('كوبونات الخصم')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showForm(context, ref),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('كوبون جديد'),
      ),
      body: coupons.when(
        loading: () => const SimatLoader(),
        error: (e, _) => EmptyState(
          icon: Icons.error_outline_rounded,
          title: 'حصل خطأ',
          message: '$e',
        ),
        data: (list) {
          if (list.isEmpty) {
            return EmptyState(
              icon: Icons.confirmation_number_outlined,
              title: 'مفيش كوبونات',
              message: 'اعمل كوبون خصم وشجّع العملاء يطلبوا',
              actionLabel: 'كوبون جديد',
              onAction: () => _showForm(context, ref),
            );
          }
          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 90),
            itemCount: list.length,
            separatorBuilder: (_, _) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final coupon = list[index];
              return AppCard(
                onTap: () => _showForm(context, ref, coupon: coupon),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 5,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.secondary,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: AppColors.divider),
                          ),
                          child: Text(
                            coupon.code,
                            textDirection: TextDirection.ltr,
                            style: const TextStyle(
                              fontWeight: FontWeight.w800,
                              fontSize: 14,
                              letterSpacing: 1,
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          coupon.labelAr,
                          style: const TextStyle(
                            fontSize: 13.5,
                            fontWeight: FontWeight.w700,
                            color: AppColors.primary,
                          ),
                        ),
                        const Spacer(),
                        AppBadge(
                          label: coupon.isUsable ? 'فعّال' : 'متوقّف',
                          color: coupon.isUsable
                              ? AppColors.success
                              : AppColors.textMuted,
                          fontSize: 10,
                        ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            'أقل طلب ${Fmt.price(coupon.minOrder)}',
                            style: const TextStyle(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                        Text(
                          'ينتهي ${Fmt.dateShort(coupon.expiresAt)}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      coupon.usageLimit == 0
                          ? 'اتستخدم ${coupon.usedCount} مرة (بدون حد)'
                          : 'اتستخدم ${coupon.usedCount} من '
                              '${coupon.usageLimit}',
                      style: const TextStyle(
                        fontSize: 12,
                        color: AppColors.textMuted,
                      ),
                    ),
                    const Divider(height: 18),
                    Row(
                      children: [
                        TextButton.icon(
                          onPressed: () async {
                            await ref.read(couponRepositoryProvider).save(
                                  coupon.copyWith(isActive: !coupon.isActive),
                                );
                            bumpData(ref);
                          },
                          icon: Icon(
                            coupon.isActive
                                ? Icons.pause_circle_outline_rounded
                                : Icons.play_circle_outline_rounded,
                            size: 18,
                          ),
                          label: Text(coupon.isActive ? 'إيقاف' : 'تفعيل'),
                        ),
                        const Spacer(),
                        TextButton.icon(
                          onPressed: () => _delete(context, ref, coupon),
                          icon: const Icon(Icons.delete_outline_rounded,
                              size: 18),
                          label: const Text('حذف'),
                          style: TextButton.styleFrom(
                            foregroundColor: AppColors.danger,
                          ),
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
    );
  }

  Future<void> _delete(
    BuildContext context,
    WidgetRef ref,
    Coupon coupon,
  ) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حذف الكوبون'),
        content: Text('هتحذف كود «${coupon.code}». متأكد؟'),
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
      await ref.read(couponRepositoryProvider).delete(coupon.code);
      bumpData(ref);
    }
  }

  Future<void> _showForm(
    BuildContext context,
    WidgetRef ref, {
    Coupon? coupon,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _CouponForm(coupon: coupon),
    );
  }
}

class _CouponForm extends ConsumerStatefulWidget {
  final Coupon? coupon;
  const _CouponForm({this.coupon});

  @override
  ConsumerState<_CouponForm> createState() => _CouponFormState();
}

class _CouponFormState extends ConsumerState<_CouponForm> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _code =
      TextEditingController(text: widget.coupon?.code ?? '');
  late final TextEditingController _value = TextEditingController(
    text: widget.coupon?.value.toStringAsFixed(0) ?? '',
  );
  late final TextEditingController _minOrder = TextEditingController(
    text: widget.coupon?.minOrder.toStringAsFixed(0) ?? '0',
  );
  late final TextEditingController _maxDiscount = TextEditingController(
    text: widget.coupon?.maxDiscount?.toStringAsFixed(0) ?? '',
  );
  late final TextEditingController _limit = TextEditingController(
    text: '${widget.coupon?.usageLimit ?? 0}',
  );
  late DiscountType _type = widget.coupon?.type ?? DiscountType.percent;
  late DateTime _expiresAt =
      widget.coupon?.expiresAt ?? DateTime.now().add(const Duration(days: 30));

  @override
  void dispose() {
    _code.dispose();
    _value.dispose();
    _minOrder.dispose();
    _maxDiscount.dispose();
    _limit.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    final coupon = Coupon(
      code: _code.text.trim().toUpperCase(),
      type: _type,
      value: double.parse(_value.text.trim()),
      minOrder: double.tryParse(_minOrder.text.trim()) ?? 0,
      maxDiscount: double.tryParse(_maxDiscount.text.trim()),
      expiresAt: _expiresAt,
      usageLimit: int.tryParse(_limit.text.trim()) ?? 0,
      usedCount: widget.coupon?.usedCount ?? 0,
      isActive: widget.coupon?.isActive ?? true,
    );
    await ref.read(couponRepositoryProvider).save(coupon);
    bumpData(ref);
    if (!mounted) return;
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SafeArea(
        child: Form(
          key: _formKey,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  widget.coupon == null ? 'كوبون جديد' : 'تعديل الكوبون',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _code,
                  enabled: widget.coupon == null,
                  textCapitalization: TextCapitalization.characters,
                  textDirection: TextDirection.ltr,
                  decoration: const InputDecoration(
                    labelText: 'كود الخصم',
                    hintText: 'SIMAT10',
                  ),
                  validator: (v) => Validators.required(v, field: 'الكود'),
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: DropdownButtonFormField<DiscountType>(
                        initialValue: _type,
                        decoration:
                            const InputDecoration(labelText: 'نوع الخصم'),
                        items: const [
                          DropdownMenuItem(
                            value: DiscountType.percent,
                            child: Text('نسبة %'),
                          ),
                          DropdownMenuItem(
                            value: DiscountType.fixed,
                            child: Text('مبلغ ثابت'),
                          ),
                        ],
                        onChanged: (value) =>
                            setState(() => _type = value ?? _type),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: _value,
                        keyboardType: TextInputType.number,
                        decoration: InputDecoration(
                          labelText: _type == DiscountType.percent
                              ? 'النسبة %'
                              : 'القيمة (ج.م)',
                        ),
                        validator: Validators.price,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Row(
                  children: [
                    Expanded(
                      child: TextFormField(
                        controller: _minOrder,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'أقل قيمة طلب',
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: TextFormField(
                        controller: _maxDiscount,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'أقصى خصم (اختياري)',
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _limit,
                  keyboardType: TextInputType.number,
                  decoration: const InputDecoration(
                    labelText: 'حد الاستخدام (٠ = بدون حد)',
                  ),
                ),
                const SizedBox(height: 14),
                InkWell(
                  onTap: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _expiresAt,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(
                        const Duration(days: 365 * 3),
                      ),
                    );
                    if (picked != null) {
                      setState(() => _expiresAt = picked);
                    }
                  },
                  child: InputDecorator(
                    decoration: const InputDecoration(
                      labelText: 'تاريخ الانتهاء',
                      prefixIcon: Icon(Icons.event_outlined),
                    ),
                    child: Text(Fmt.date(_expiresAt)),
                  ),
                ),
                const SizedBox(height: 22),
                ElevatedButton(
                  onPressed: _save,
                  child: const Text('حفظ الكوبون'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
