import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/validators.dart';
import '../../../core/widgets/common.dart';
import '../../../data/models/models.dart';
import '../../../providers/app_providers.dart';

/// إدارة تصنيفات المنتجات.
class AdminCategoriesScreen extends ConsumerWidget {
  const AdminCategoriesScreen({super.key});

  static const Map<String, IconData> icons = {
    'flame': Icons.local_fire_department_outlined,
    'flower': Icons.local_florist_outlined,
    'wood': Icons.park_outlined,
    'diamond': Icons.diamond_outlined,
    'drop': Icons.water_drop_outlined,
    'gift': Icons.card_giftcard_rounded,
    'bottle': Icons.science_outlined,
  };

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final categories = ref.watch(adminCategoriesProvider);
    final products = ref.watch(adminProductsProvider).valueOrNull ?? const [];

    return Scaffold(
      appBar: AppBar(title: const Text('التصنيفات')),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showForm(context, ref),
        backgroundColor: AppColors.primary,
        foregroundColor: Colors.white,
        icon: const Icon(Icons.add_rounded),
        label: const Text('تصنيف جديد'),
      ),
      body: categories.when(
        loading: () => const SimatLoader(),
        error: (e, _) => EmptyState(
          icon: Icons.error_outline_rounded,
          title: 'حصل خطأ',
          message: '$e',
        ),
        data: (list) => ListView.separated(
          padding: const EdgeInsets.fromLTRB(16, 14, 16, 90),
          itemCount: list.length,
          separatorBuilder: (_, _) => const SizedBox(height: 10),
          itemBuilder: (context, index) {
            final category = list[index];
            final count =
                products.where((p) => p.categoryId == category.id).length;
            return AppCard(
              onTap: () => _showForm(context, ref, category: category),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: AppColors.secondary,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(
                      icons[category.iconKey] ?? Icons.science_outlined,
                      color: AppColors.primary,
                      size: 21,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          category.name,
                          style: const TextStyle(
                            fontWeight: FontWeight.w700,
                            fontSize: 14.5,
                          ),
                        ),
                        Text(
                          '$count منتج · ${category.description}',
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 11.5,
                            color: AppColors.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => _delete(context, ref, category, count),
                    icon: const Icon(
                      Icons.delete_outline_rounded,
                      size: 19,
                      color: AppColors.danger,
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Future<void> _delete(
    BuildContext context,
    WidgetRef ref,
    Category category,
    int productsCount,
  ) async {
    if (productsCount > 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'مينفعش تحذف تصنيف فيه $productsCount منتج — انقلهم الأول',
          ),
        ),
      );
      return;
    }
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('حذف التصنيف'),
        content: Text('هتحذف «${category.name}». متأكد؟'),
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
      await ref.read(catalogRepositoryProvider).deleteCategory(category.id);
      bumpData(ref);
    }
  }

  Future<void> _showForm(
    BuildContext context,
    WidgetRef ref, {
    Category? category,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (_) => _CategoryForm(category: category),
    );
  }
}

class _CategoryForm extends ConsumerStatefulWidget {
  final Category? category;
  const _CategoryForm({this.category});

  @override
  ConsumerState<_CategoryForm> createState() => _CategoryFormState();
}

class _CategoryFormState extends ConsumerState<_CategoryForm> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _name =
      TextEditingController(text: widget.category?.name ?? '');
  late final TextEditingController _nameEn =
      TextEditingController(text: widget.category?.nameEn ?? '');
  late final TextEditingController _description =
      TextEditingController(text: widget.category?.description ?? '');
  late String _iconKey = widget.category?.iconKey ?? 'bottle';

  @override
  void dispose() {
    _name.dispose();
    _nameEn.dispose();
    _description.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    final repository = ref.read(catalogRepositoryProvider);
    final existing = widget.category;
    final category = Category(
      id: existing?.id ?? repository.newCategoryId(),
      name: _name.text.trim(),
      nameEn: _nameEn.text.trim(),
      description: _description.text.trim(),
      iconKey: _iconKey,
      sortOrder: existing?.sortOrder ?? 99,
    );
    await repository.saveCategory(category);
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
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text(
                  widget.category == null ? 'تصنيف جديد' : 'تعديل التصنيف',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 16),
                TextFormField(
                  controller: _name,
                  decoration: const InputDecoration(labelText: 'اسم التصنيف'),
                  validator: (v) => Validators.required(v, field: 'الاسم'),
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
                  controller: _description,
                  decoration: const InputDecoration(labelText: 'وصف مختصر'),
                ),
                const SizedBox(height: 16),
                const Text(
                  'الأيقونة',
                  style: TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 10),
                Wrap(
                  spacing: 10,
                  runSpacing: 10,
                  children: [
                    for (final entry
                        in AdminCategoriesScreen.icons.entries)
                      InkWell(
                        onTap: () => setState(() => _iconKey = entry.key),
                        borderRadius: BorderRadius.circular(12),
                        child: Container(
                          width: 46,
                          height: 46,
                          decoration: BoxDecoration(
                            color: _iconKey == entry.key
                                ? AppColors.primary
                                : AppColors.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.divider),
                          ),
                          child: Icon(
                            entry.value,
                            color: _iconKey == entry.key
                                ? Colors.white
                                : AppColors.primary,
                            size: 20,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 22),
                ElevatedButton(
                  onPressed: _save,
                  child: const Text('حفظ'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
