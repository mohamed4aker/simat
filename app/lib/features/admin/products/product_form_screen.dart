import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/common.dart';
import '../../../core/widgets/product_artwork.dart';
import '../../../data/models/models.dart';
import '../../../providers/app_providers.dart';

/// إضافة أو تعديل منتج.
class ProductFormScreen extends ConsumerStatefulWidget {
  /// null = منتج جديد.
  final String? productId;

  const ProductFormScreen({super.key, this.productId});

  @override
  ConsumerState<ProductFormScreen> createState() => _ProductFormScreenState();
}

class _ProductFormScreenState extends ConsumerState<ProductFormScreen> {
  final _formKey = GlobalKey<FormState>();

  final _name = TextEditingController();
  final _nameEn = TextEditingController();
  final _brand = TextEditingController(text: 'SIMAT');
  final _description = TextEditingController();
  final _price = TextEditingController();
  final _oldPrice = TextEditingController();
  final _size = TextEditingController(text: '100');
  final _stock = TextEditingController(text: '0');
  final _longevity = TextEditingController(text: '8');
  final _topNotes = TextEditingController();
  final _heartNotes = TextEditingController();
  final _baseNotes = TextEditingController();
  final _imagePath = TextEditingController();

  String? _categoryId;
  Gender _gender = Gender.unisex;
  Concentration _concentration = Concentration.edp;
  bool _isFeatured = false;
  bool _isActive = true;
  bool _loaded = false;
  bool _saving = false;
  Product? _original;

  bool get _isNew => widget.productId == null;

  @override
  void dispose() {
    for (final controller in [
      _name,
      _nameEn,
      _brand,
      _description,
      _price,
      _oldPrice,
      _size,
      _stock,
      _longevity,
      _topNotes,
      _heartNotes,
      _baseNotes,
      _imagePath,
    ]) {
      controller.dispose();
    }
    super.dispose();
  }

  void _hydrate(Product product) {
    _original = product;
    _name.text = product.name;
    _nameEn.text = product.nameEn;
    _brand.text = product.brand;
    _description.text = product.description;
    _price.text = product.price.toStringAsFixed(0);
    _oldPrice.text = product.oldPrice?.toStringAsFixed(0) ?? '';
    _size.text = '${product.sizeMl}';
    _stock.text = '${product.stock}';
    _longevity.text = '${product.longevityHours}';
    _topNotes.text = product.topNotes.join('، ');
    _heartNotes.text = product.heartNotes.join('، ');
    _baseNotes.text = product.baseNotes.join('، ');
    _imagePath.text = product.imagePath ?? '';
    _categoryId = product.categoryId;
    _gender = product.gender;
    _concentration = product.concentration;
    _isFeatured = product.isFeatured;
    _isActive = product.isActive;
    _loaded = true;
  }

  List<String> _splitNotes(String value) => value
      .split(RegExp('[،,]'))
      .map((e) => e.trim())
      .where((e) => e.isNotEmpty)
      .toList();

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (_categoryId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('اختار تصنيف المنتج')),
      );
      return;
    }
    setState(() => _saving = true);

    final repository = ref.read(catalogRepositoryProvider);
    final oldPriceValue = double.tryParse(_oldPrice.text.trim());

    final product = Product(
      id: _original?.id ?? repository.newProductId(),
      name: _name.text.trim(),
      nameEn: _nameEn.text.trim(),
      brand: _brand.text.trim(),
      categoryId: _categoryId!,
      description: _description.text.trim(),
      price: double.parse(_price.text.trim()),
      oldPrice: oldPriceValue != null && oldPriceValue > 0
          ? oldPriceValue
          : null,
      sizeMl: int.tryParse(_size.text.trim()) ?? 100,
      gender: _gender,
      concentration: _concentration,
      topNotes: _splitNotes(_topNotes.text),
      heartNotes: _splitNotes(_heartNotes.text),
      baseNotes: _splitNotes(_baseNotes.text),
      longevityHours: int.tryParse(_longevity.text.trim()) ?? 8,
      stock: int.tryParse(_stock.text.trim()) ?? 0,
      rating: _original?.rating ?? 0,
      ratingCount: _original?.ratingCount ?? 0,
      soldCount: _original?.soldCount ?? 0,
      isFeatured: _isFeatured,
      isActive: _isActive,
      createdAt: _original?.createdAt ?? DateTime.now(),
      imagePath:
          _imagePath.text.trim().isEmpty ? null : _imagePath.text.trim(),
    );

    await repository.saveProduct(product);
    bumpData(ref);

    if (!mounted) return;
    setState(() => _saving = false);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(_isNew ? 'تم إضافة المنتج' : 'تم حفظ التعديلات'),
      ),
    );
    Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final categories = ref.watch(adminCategoriesProvider).valueOrNull ?? [];

    if (!_isNew && !_loaded) {
      final product = ref.watch(productByIdProvider(widget.productId!));
      return product.when(
        loading: () => const Scaffold(body: SimatLoader()),
        error: (e, _) => Scaffold(
          appBar: AppBar(),
          body: EmptyState(
            icon: Icons.error_outline_rounded,
            title: 'حصل خطأ',
            message: '$e',
          ),
        ),
        data: (value) {
          if (value == null) {
            return Scaffold(
              appBar: AppBar(),
              body: const EmptyState(
                icon: Icons.inventory_2_outlined,
                title: 'المنتج مش موجود',
              ),
            );
          }
          WidgetsBinding.instance.addPostFrameCallback((_) {
            if (mounted) setState(() => _hydrate(value));
          });
          return const Scaffold(body: SimatLoader());
        },
      );
    }

    if (_isNew && _categoryId == null && categories.isNotEmpty) {
      _categoryId = categories.first.id;
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_isNew ? 'منتج جديد' : 'تعديل المنتج'),
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
          children: [
            Center(
              child: ProductArtwork(
                seed: _original?.id ?? 'preview',
                imagePath: _imagePath.text.trim().isEmpty
                    ? null
                    : _imagePath.text.trim(),
                width: 140,
                height: 140,
                borderRadius: BorderRadius.circular(20),
              ),
            ),
            const SizedBox(height: 8),
            const Center(
              child: Text(
                'من غير صورة، بيتعرض شكل زجاجة بألوان الهوية',
                style: TextStyle(fontSize: 11.5, color: AppColors.textMuted),
              ),
            ),
            const SizedBox(height: 18),
            _section('البيانات الأساسية'),
            TextFormField(
              controller: _name,
              decoration: const InputDecoration(labelText: 'اسم المنتج'),
              validator: (v) => Validators.required(v, field: 'اسم المنتج'),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _nameEn,
              textDirection: TextDirection.ltr,
              decoration:
                  const InputDecoration(labelText: 'الاسم بالإنجليزية'),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _brand,
              decoration: const InputDecoration(labelText: 'الماركة'),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<String>(
              initialValue: _categoryId,
              isExpanded: true,
              decoration: const InputDecoration(labelText: 'التصنيف'),
              items: [
                for (final category in categories)
                  DropdownMenuItem(
                    value: category.id,
                    child: Text(category.name),
                  ),
              ],
              onChanged: (value) => setState(() => _categoryId = value),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _description,
              maxLines: 4,
              decoration: const InputDecoration(labelText: 'الوصف'),
            ),
            const SizedBox(height: 20),
            _section('السعر والمخزون'),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _price,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'السعر (ج.م)',
                    ),
                    validator: Validators.price,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextFormField(
                    controller: _oldPrice,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(
                      labelText: 'قبل الخصم (اختياري)',
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextFormField(
                    controller: _stock,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'المخزون'),
                    validator: (v) =>
                        Validators.integer(v, field: 'كمية المخزون'),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: TextFormField(
                    controller: _size,
                    keyboardType: TextInputType.number,
                    decoration: const InputDecoration(labelText: 'الحجم (مل)'),
                    validator: (v) => Validators.integer(v, field: 'الحجم'),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 20),
            _section('خصائص العطر'),
            DropdownButtonFormField<Gender>(
              initialValue: _gender,
              decoration: const InputDecoration(labelText: 'الفئة'),
              items: [
                for (final gender in Gender.values)
                  DropdownMenuItem(
                    value: gender,
                    child: Text(gender.labelAr),
                  ),
              ],
              onChanged: (value) =>
                  setState(() => _gender = value ?? _gender),
            ),
            const SizedBox(height: 12),
            DropdownButtonFormField<Concentration>(
              initialValue: _concentration,
              isExpanded: true,
              decoration: const InputDecoration(labelText: 'التركيز'),
              items: [
                for (final concentration in Concentration.values)
                  DropdownMenuItem(
                    value: concentration,
                    child: Text(concentration.labelAr),
                  ),
              ],
              onChanged: (value) =>
                  setState(() => _concentration = value ?? _concentration),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _longevity,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'الثبات (ساعات)',
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _topNotes,
              decoration: const InputDecoration(
                labelText: 'النوتات العليا',
                hintText: 'برغموت، ليمون، هيل',
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _heartNotes,
              decoration: const InputDecoration(
                labelText: 'نوتات القلب',
                hintText: 'ورد، ياسمين',
              ),
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: _baseNotes,
              decoration: const InputDecoration(
                labelText: 'نوتات القاعدة',
                hintText: 'عنبر، مسك، صندل',
              ),
            ),
            const SizedBox(height: 20),
            _section('إعدادات العرض'),
            TextFormField(
              controller: _imagePath,
              textDirection: TextDirection.ltr,
              onChanged: (_) => setState(() {}),
              decoration: const InputDecoration(
                labelText: 'رابط الصورة (اختياري)',
                hintText: 'https://...',
              ),
            ),
            SwitchListTile(
              value: _isFeatured,
              onChanged: (v) => setState(() => _isFeatured = v),
              contentPadding: EdgeInsets.zero,
              activeThumbColor: AppColors.primary,
              title: const Text('اعرضه في «مختارات سِمة»',
                  style: TextStyle(fontSize: 14)),
            ),
            SwitchListTile(
              value: _isActive,
              onChanged: (v) => setState(() => _isActive = v),
              contentPadding: EdgeInsets.zero,
              activeThumbColor: AppColors.primary,
              title: const Text('المنتج مفعّل في المتجر',
                  style: TextStyle(fontSize: 14)),
            ),
          ],
        ),
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
              onPressed: _saving ? null : _save,
              child: Text(_isNew ? 'إضافة المنتج' : 'حفظ التعديلات'),
            ),
          ),
        ),
      ),
    );
  }

  Widget _section(String title) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Row(
          children: [
            Container(
              width: 3,
              height: 16,
              decoration: BoxDecoration(
                color: AppColors.accent,
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              title,
              style: const TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      );
}
