import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../data/models/models.dart';
import '../../../data/repositories/catalog_repository.dart';
import '../../../providers/app_providers.dart';

/// يفتح لوحة الفلاتر السفلية.
Future<void> showFilterSheet(BuildContext context, WidgetRef ref) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (_) => const _FilterSheet(),
  );
}

class _FilterSheet extends ConsumerStatefulWidget {
  const _FilterSheet();

  @override
  ConsumerState<_FilterSheet> createState() => _FilterSheetState();
}

class _FilterSheetState extends ConsumerState<_FilterSheet> {
  late ProductFilter _draft = ref.read(productFilterProvider);
  RangeValues _priceRange = const RangeValues(0, 5000);

  @override
  void initState() {
    super.initState();
    _priceRange = RangeValues(
      _draft.minPrice ?? 0,
      _draft.maxPrice ?? 5000,
    );
  }

  void _apply() {
    final hasPriceFilter = _priceRange.start > 0 || _priceRange.end < 5000;
    ref.read(productFilterProvider.notifier).state = _draft.copyWith(
      minPrice: hasPriceFilter ? _priceRange.start : null,
      maxPrice: hasPriceFilter ? _priceRange.end : null,
      clearPrice: !hasPriceFilter,
    );
    Navigator.of(context).pop();
  }

  void _reset() {
    setState(() {
      _draft = ProductFilter(query: _draft.query, sort: _draft.sort);
      _priceRange = const RangeValues(0, 5000);
    });
  }

  @override
  Widget build(BuildContext context) {
    final categories = ref.watch(categoriesProvider).valueOrNull ?? const [];

    return DraggableScrollableSheet(
      expand: false,
      initialChildSize: 0.78,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      builder: (context, scrollController) => Column(
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
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 6),
            child: Row(
              children: [
                Text('تصفية النتائج',
                    style: Theme.of(context).textTheme.titleLarge),
                const Spacer(),
                TextButton(
                  onPressed: _reset,
                  child: const Text('إعادة تعيين'),
                ),
              ],
            ),
          ),
          const Divider(),
          Expanded(
            child: ListView(
              controller: scrollController,
              padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
              children: [
                _label('التصنيف'),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _choice(
                      'الكل',
                      _draft.categoryId == null,
                      () => setState(
                        () => _draft = _draft.copyWith(clearCategory: true),
                      ),
                    ),
                    for (final category in categories)
                      _choice(
                        category.name,
                        _draft.categoryId == category.id,
                        () => setState(
                          () => _draft =
                              _draft.copyWith(categoryId: category.id),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 20),
                _label('الفئة'),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _choice(
                      'الكل',
                      _draft.gender == null,
                      () => setState(
                        () => _draft = _draft.copyWith(clearGender: true),
                      ),
                    ),
                    for (final gender in Gender.values)
                      _choice(
                        gender.labelAr,
                        _draft.gender == gender,
                        () => setState(
                          () => _draft = _draft.copyWith(gender: gender),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 20),
                _label('التركيز'),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _choice(
                      'الكل',
                      _draft.concentration == null,
                      () => setState(
                        () =>
                            _draft = _draft.copyWith(clearConcentration: true),
                      ),
                    ),
                    for (final concentration in Concentration.values)
                      _choice(
                        concentration.shortAr,
                        _draft.concentration == concentration,
                        () => setState(
                          () => _draft = _draft.copyWith(
                            concentration: concentration,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 20),
                _label('السعر'),
                RangeSlider(
                  values: _priceRange,
                  min: 0,
                  max: 5000,
                  divisions: 50,
                  activeColor: AppColors.primary,
                  inactiveColor: AppColors.secondary,
                  labels: RangeLabels(
                    Fmt.priceCompact(_priceRange.start),
                    Fmt.priceCompact(_priceRange.end),
                  ),
                  onChanged: (value) => setState(() => _priceRange = value),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(Fmt.price(_priceRange.start),
                        style: const TextStyle(fontSize: 12.5)),
                    Text(
                      _priceRange.end >= 5000
                          ? 'أكتر من ${Fmt.price(5000)}'
                          : Fmt.price(_priceRange.end),
                      style: const TextStyle(fontSize: 12.5),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                SwitchListTile(
                  value: _draft.onlyInStock,
                  onChanged: (v) =>
                      setState(() => _draft = _draft.copyWith(onlyInStock: v)),
                  contentPadding: EdgeInsets.zero,
                  title: const Text('المتوفر بس',
                      style: TextStyle(fontSize: 14)),
                  activeThumbColor: AppColors.primary,
                ),
                SwitchListTile(
                  value: _draft.onlyOffers,
                  onChanged: (v) =>
                      setState(() => _draft = _draft.copyWith(onlyOffers: v)),
                  contentPadding: EdgeInsets.zero,
                  title: const Text('العروض بس',
                      style: TextStyle(fontSize: 14)),
                  activeThumbColor: AppColors.primary,
                ),
              ],
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
              child: ElevatedButton(
                onPressed: _apply,
                child: const Text('عرض النتائج'),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _label(String text) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Text(
          text,
          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 14.5),
        ),
      );

  Widget _choice(String label, bool selected, VoidCallback onTap) {
    return ChoiceChip(
      label: Text(label),
      selected: selected,
      onSelected: (_) => onTap(),
      showCheckmark: false,
      labelStyle: TextStyle(
        fontFamily: 'Cairo',
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: selected ? Colors.white : AppColors.textPrimary,
      ),
    );
  }
}
