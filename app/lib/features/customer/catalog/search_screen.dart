import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/widgets/common.dart';
import '../../../core/widgets/product_card.dart';
import '../../../data/repositories/catalog_repository.dart';
import '../../../providers/app_providers.dart';

/// شاشة البحث مع اقتراحات جاهزة ونتائج فورية.
class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final _controller = TextEditingController();
  String _query = '';

  static const List<String> _suggestions = [
    'عود',
    'ورد',
    'مسك',
    'زعفران',
    'فانيليا',
    'عنبر',
    'ياسمين',
    'بادي ميست',
    'هدايا',
  ];

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _search(String value) {
    setState(() => _query = value);
  }

  @override
  Widget build(BuildContext context) {
    final results = ref.watch(
      _searchResultsProvider(_query),
    );
    final user = ref.watch(authControllerProvider);

    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: Padding(
          padding: const EdgeInsets.only(left: 12),
          child: AppSearchField(
            controller: _controller,
            autofocus: true,
            onChanged: _search,
            onClear: _controller.text.isEmpty
                ? null
                : () {
                    _controller.clear();
                    _search('');
                  },
          ),
        ),
      ),
      body: _query.trim().isEmpty
          ? _Suggestions(
              suggestions: _suggestions,
              onPick: (value) {
                _controller.text = value;
                _search(value);
              },
            )
          : results.when(
              loading: () => const SimatLoader(),
              error: (e, _) => EmptyState(
                icon: Icons.error_outline_rounded,
                title: 'حصل خطأ',
                message: '$e',
              ),
              data: (list) {
                if (list.isEmpty) {
                  return const EmptyState(
                    icon: Icons.search_off_rounded,
                    title: 'مفيش نتائج',
                    message: 'جرّب كلمة تانية زي «عود» أو «ورد»',
                  );
                }
                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
                  itemCount: list.length,
                  separatorBuilder: (_, _) => const SizedBox(height: 10),
                  itemBuilder: (context, index) {
                    final product = list[index];
                    return ProductRow(
                      product: product,
                      onTap: () => context.push('/product/${product.id}'),
                      trailing: IconButton(
                        onPressed: user == null
                            ? null
                            : () => ref
                                .read(authControllerProvider.notifier)
                                .toggleFavorite(product.id),
                        icon: Icon(
                          (user?.favorites.contains(product.id) ?? false)
                              ? Icons.favorite_rounded
                              : Icons.favorite_border_rounded,
                          color: AppColors.primary,
                          size: 20,
                        ),
                      ),
                    );
                  },
                );
              },
            ),
    );
  }
}

/// نتائج البحث لنص معيّن.
final _searchResultsProvider =
    FutureProvider.family((ref, String query) async {
  ref.watch(dataRevisionProvider);
  if (query.trim().isEmpty) return const [];
  return ref
      .watch(catalogRepositoryProvider)
      .search(ProductFilter(query: query));
});

class _Suggestions extends StatelessWidget {
  final List<String> suggestions;
  final ValueChanged<String> onPick;

  const _Suggestions({required this.suggestions, required this.onPick});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('ابحث بالنوتة العطرية',
            style: Theme.of(context).textTheme.titleMedium),
        const SizedBox(height: 14),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            for (final suggestion in suggestions)
              ActionChip(
                label: Text(suggestion),
                onPressed: () => onPick(suggestion),
                labelStyle: const TextStyle(
                  fontFamily: 'Cairo',
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
          ],
        ),
        const SizedBox(height: 30),
        const Center(
          child: Icon(
            Icons.travel_explore_rounded,
            size: 64,
            color: AppColors.secondary,
          ),
        ),
        const SizedBox(height: 12),
        const Center(
          child: Text(
            'اكتب اسم العطر، الماركة، أو حتى النوتة اللي بتحبها',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
        ),
      ],
    );
  }
}
