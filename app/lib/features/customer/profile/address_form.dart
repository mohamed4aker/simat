import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/constants/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/utils/validators.dart';
import '../../../data/models/models.dart';
import '../../../providers/app_providers.dart';

/// يفتح نموذج إضافة/تعديل عنوان ويرجّع العنوان بعد الحفظ.
Future<Address?> showAddressForm(
  BuildContext context,
  WidgetRef ref, {
  Address? address,
}) {
  return showModalBottomSheet<Address>(
    context: context,
    isScrollControlled: true,
    builder: (_) => _AddressForm(address: address),
  );
}

class _AddressForm extends ConsumerStatefulWidget {
  final Address? address;
  const _AddressForm({this.address});

  @override
  ConsumerState<_AddressForm> createState() => _AddressFormState();
}

class _AddressFormState extends ConsumerState<_AddressForm> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _label;
  late final TextEditingController _fullName;
  late final TextEditingController _phone;
  late final TextEditingController _city;
  late final TextEditingController _street;
  late final TextEditingController _building;
  late final TextEditingController _notes;
  late String _governorate;
  late bool _isDefault;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    final address = widget.address;
    final user = ref.read(authControllerProvider);
    _label = TextEditingController(text: address?.label ?? 'المنزل');
    _fullName = TextEditingController(
      text: address?.fullName ?? user?.name ?? '',
    );
    _phone = TextEditingController(text: address?.phone ?? user?.phone ?? '');
    _city = TextEditingController(text: address?.city ?? '');
    _street = TextEditingController(text: address?.street ?? '');
    _building = TextEditingController(text: address?.building ?? '');
    _notes = TextEditingController(text: address?.notes ?? '');
    _governorate = address?.governorate ?? AppConstants.governorates.first;
    _isDefault = address?.isDefault ?? (user?.addresses.isEmpty ?? true);
  }

  @override
  void dispose() {
    _label.dispose();
    _fullName.dispose();
    _phone.dispose();
    _city.dispose();
    _street.dispose();
    _building.dispose();
    _notes.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);

    final controller = ref.read(authControllerProvider.notifier);
    final repository = ref.read(authRepositoryProvider);
    final address = Address(
      id: widget.address?.id ?? repository.newAddressId(),
      label: _label.text.trim(),
      fullName: _fullName.text.trim(),
      phone: _phone.text.trim(),
      governorate: _governorate,
      city: _city.text.trim(),
      street: _street.text.trim(),
      building: _building.text.trim(),
      notes: _notes.text.trim(),
      isDefault: _isDefault,
    );
    await controller.saveAddress(address);

    if (!mounted) return;
    Navigator.of(context).pop(address);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.85,
        maxChildSize: 0.95,
        builder: (context, scrollController) => Form(
          key: _formKey,
          child: Column(
            children: [
              const SizedBox(height: 10),
              Container(
                width: 42,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.divider,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 14, 20, 10),
                child: Row(
                  children: [
                    Text(
                      widget.address == null
                          ? 'عنوان جديد'
                          : 'تعديل العنوان',
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                  ],
                ),
              ),
              const Divider(),
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.fromLTRB(20, 14, 20, 20),
                  children: [
                    TextFormField(
                      controller: _label,
                      decoration: const InputDecoration(
                        labelText: 'اسم العنوان (المنزل / الشغل)',
                        prefixIcon: Icon(Icons.bookmark_outline_rounded),
                      ),
                      validator: (v) =>
                          Validators.required(v, field: 'اسم العنوان'),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _fullName,
                      decoration: const InputDecoration(
                        labelText: 'اسم المستلم',
                        prefixIcon: Icon(Icons.person_outline_rounded),
                      ),
                      validator: Validators.name,
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _phone,
                      keyboardType: TextInputType.phone,
                      textDirection: TextDirection.ltr,
                      decoration: const InputDecoration(
                        labelText: 'رقم الموبايل',
                        prefixIcon: Icon(Icons.phone_android_rounded),
                      ),
                      validator: Validators.phone,
                    ),
                    const SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      initialValue: _governorate,
                      isExpanded: true,
                      decoration: const InputDecoration(
                        labelText: 'المحافظة',
                        prefixIcon: Icon(Icons.map_outlined),
                      ),
                      items: [
                        for (final governorate in AppConstants.governorates)
                          DropdownMenuItem(
                            value: governorate,
                            child: Text(governorate),
                          ),
                      ],
                      onChanged: (value) => setState(
                        () => _governorate = value ?? _governorate,
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _city,
                      decoration: const InputDecoration(
                        labelText: 'المنطقة / المدينة',
                        prefixIcon: Icon(Icons.location_city_rounded),
                      ),
                      validator: (v) =>
                          Validators.required(v, field: 'المنطقة'),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _street,
                      decoration: const InputDecoration(
                        labelText: 'الشارع',
                        prefixIcon: Icon(Icons.signpost_outlined),
                      ),
                      validator: (v) =>
                          Validators.required(v, field: 'الشارع'),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _building,
                      decoration: const InputDecoration(
                        labelText: 'رقم العقار / الشقة',
                        prefixIcon: Icon(Icons.home_work_outlined),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _notes,
                      maxLines: 2,
                      decoration: const InputDecoration(
                        labelText: 'علامة مميزة (اختياري)',
                        hintText: 'جنب صيدلية... — الدور الثالث',
                      ),
                    ),
                    const SizedBox(height: 6),
                    SwitchListTile(
                      value: _isDefault,
                      onChanged: (v) => setState(() => _isDefault = v),
                      contentPadding: EdgeInsets.zero,
                      activeThumbColor: AppColors.primary,
                      title: const Text(
                        'خلّيه العنوان الأساسي',
                        style: TextStyle(fontSize: 14),
                      ),
                    ),
                  ],
                ),
              ),
              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 6, 20, 12),
                  child: ElevatedButton(
                    onPressed: _saving ? null : _submit,
                    child: Text(
                      widget.address == null
                          ? 'حفظ العنوان'
                          : 'حفظ التعديلات',
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
