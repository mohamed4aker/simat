import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../core/theme/app_colors.dart';
import '../../../core/utils/formatters.dart';
import '../../../core/widgets/common.dart';
import '../../../core/widgets/product_artwork.dart';
import '../../../core/widgets/product_card.dart';
import '../../../data/models/models.dart';
import '../../../providers/app_providers.dart';

/// صفحة المنتج — نفس ترتيب صفحة الموقع:
/// الاسم ← سطر التصنيف ← المواصفات السريعة ← الأحجام والسعر ←
/// الكمية + أضف للسلة + اشتري الآن ← التوصيل والأمان ← 4 أقسام.
class ProductScreen extends ConsumerStatefulWidget {
  final String productId;
  const ProductScreen({super.key, required this.productId});

  @override
  ConsumerState<ProductScreen> createState() => _ProductScreenState();
}

class _ProductScreenState extends ConsumerState<ProductScreen> {
  int _quantity = 1;
  int? _size;
  int _page = 0;

  void _add(Product product, {bool buyNow = false}) {
    final size = _size ?? product.defaultVariant.sizeMl;
    ref
        .read(cartControllerProvider.notifier)
        .add(product, quantity: _quantity, sizeMl: size);
    if (buyNow) {
      context.push('/checkout');
      return;
    }
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: const Text('تمت الإضافة للسلة'),
          action: SnackBarAction(
            label: 'السلة',
            textColor: AppColors.accentLight,
            onPressed: () => context.go('/cart'),
          ),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productByIdProvider(widget.productId));
    final user = ref.watch(authControllerProvider);

    return productAsync.when(
      loading: () => const Scaffold(body: SimatLoader()),
      error: (e, _) => Scaffold(
        appBar: AppBar(),
        body: EmptyState(
          icon: Icons.error_outline_rounded,
          title: 'حصل خطأ',
          message: '$e',
        ),
      ),
      data: (product) {
        if (product == null) {
          return Scaffold(
            appBar: AppBar(),
            body: const EmptyState(
              icon: Icons.remove_shopping_cart_outlined,
              title: 'المنتج ده مش موجود',
            ),
          );
        }

        final isFavorite = user?.favorites.contains(product.id) ?? false;
        final maxQuantity = product.stock == 0 ? 1 : product.stock.clamp(1, 10);
        final size = _size ?? product.defaultVariant.sizeMl;
        final unitPrice = product.priceFor(size);
        final images = [
          product.imagePath,
          if (product.hoverImagePath != null) product.hoverImagePath,
        ];

        return Scaffold(
          body: CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 360,
                pinned: true,
                backgroundColor: AppColors.background,
                surfaceTintColor: Colors.transparent,
                actions: [
                  IconButton(
                    onPressed: user == null
                        ? () => context.push('/login')
                        : () => ref
                            .read(authControllerProvider.notifier)
                            .toggleFavorite(product.id),
                    icon: Icon(
                      isFavorite
                          ? Icons.favorite_rounded
                          : Icons.favorite_border_rounded,
                      color: AppColors.primary,
                    ),
                  ),
                ],
                // الصور: الزجاجة، وبالسحب صورة الزجاجة وسط المكونات.
                flexibleSpace: FlexibleSpaceBar(
                  background: Stack(
                    fit: StackFit.expand,
                    children: [
                      PageView(
                        onPageChanged: (i) => setState(() => _page = i),
                        children: [
                          for (final path in images)
                            ProductArtwork(seed: product.id, imagePath: path),
                        ],
                      ),
                      if (images.length > 1)
                        Positioned(
                          bottom: 14,
                          left: 0,
                          right: 0,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              for (var i = 0; i < images.length; i++)
                                AnimatedContainer(
                                  duration: const Duration(milliseconds: 250),
                                  margin: const EdgeInsets.symmetric(horizontal: 3),
                                  width: i == _page ? 18 : 6,
                                  height: 6,
                                  decoration: BoxDecoration(
                                    color: i == _page
                                        ? AppColors.primary
                                        : AppColors.divider,
                                    borderRadius: BorderRadius.circular(3),
                                  ),
                                ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(18, 18, 18, 8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // العنوان: «NOCTURNE — Eau de Parfum»
                      SizedBox(
                        width: double.infinity,
                        child: Text(
                          product.displayName,
                          textDirection: TextDirection.ltr,
                          textAlign: TextAlign.right,
                          style: const TextStyle(
                            fontFamily: 'PlayfairDisplay',
                            fontSize: 24,
                            fontWeight: FontWeight.w600,
                            height: 1.25,
                          ),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        product.subLine,
                        style: const TextStyle(
                          fontSize: 13,
                          color: AppColors.textMuted,
                        ),
                      ),
                      const SizedBox(height: 14),

                      // المواصفات السريعة
                      if (!product.isSet) ...[
                        _Spec(label: 'العائلة', value: product.familyEn),
                        _Spec(label: 'الطابع', value: product.scentCharacter),
                        _Spec(label: 'مناسب لـ', value: product.occasion),
                        const SizedBox(height: 14),
                      ],

                      // السعر
                      Text(
                        Fmt.price(unitPrice),
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.w800,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: 12),

                      // أزرار الأحجام (60 مل مختار افتراضياً)
                      if (product.sizes.length > 1) ...[
                        const Text(
                          'الحجم',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          children: [
                            for (final v in product.sizes)
                              ChoiceChip(
                                label: Text(
                                  '${v.sizeMl} ml',
                                  textDirection: TextDirection.ltr,
                                ),
                                selected: v.sizeMl == size,
                                onSelected: (_) => setState(() => _size = v.sizeMl),
                                selectedColor: AppColors.primary,
                                labelStyle: TextStyle(
                                  color: v.sizeMl == size
                                      ? Colors.white
                                      : AppColors.textPrimary,
                                  fontWeight: FontWeight.w700,
                                ),
                                showCheckmark: false,
                              ),
                          ],
                        ),
                        const SizedBox(height: 16),
                      ],

                      // الكمية + أضف للسلة
                      Row(
                        children: [
                          QuantityStepper(
                            value: _quantity,
                            max: maxQuantity,
                            onChanged: (v) => setState(() => _quantity = v),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: ElevatedButton(
                              onPressed: product.inStock ? () => _add(product) : null,
                              child: Text(product.inStock ? 'أضف للسلة' : 'نفد المخزون'),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      // اشتري الآن → صفحة الدفع على طول
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: product.inStock
                              ? () => _add(product, buyNow: true)
                              : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.dark,
                          ),
                          child: const Text('اشتري الآن'),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // التوصيل والأمان
                      Container(
                        padding: const EdgeInsets.all(14),
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: AppColors.divider),
                        ),
                        child: const Column(
                          children: [
                            _Trust(
                              icon: Icons.local_shipping_outlined,
                              text: 'شحن وتوصيل لكافة محافظات مصر.',
                            ),
                            _Trust(
                              icon: Icons.replay_rounded,
                              text: 'إمكانية استرجاع للمنتجات غير المفتوحة.',
                            ),
                            _Trust(
                              icon: Icons.lock_outline_rounded,
                              text: 'دفع آمن بالكامل عند الاستلام وبالبطاقات البنكية.',
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 8),

                      // الأقسام اللي بتتفتح (+)
                      if (product.isSet)
                        _Section(
                          title: 'جوة الطقم',
                          initiallyExpanded: true,
                          child: _NotesLine(product.topNotes.join(' · ')),
                        )
                      else
                        _Section(
                          title: 'Scent Notes · المكونات العطرية',
                          initiallyExpanded: true,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              _NoteRow('الافتتاحية', product.topNotes),
                              _NoteRow('قلب العطر', product.heartNotes),
                              _NoteRow('القاعدة', product.baseNotes),
                              if (product.accords.isNotEmpty) ...[
                                const SizedBox(height: 6),
                                Wrap(
                                  spacing: 6,
                                  runSpacing: 6,
                                  children: [
                                    for (final a in product.accords)
                                      Chip(
                                        label: Text(a),
                                        visualDensity: VisualDensity.compact,
                                      ),
                                  ],
                                ),
                              ],
                            ],
                          ),
                        ),
                      if (product.wearProfile.isNotEmpty)
                        _Section(
                          title: 'Wear Profile · شخصية العطر',
                          child: _NotesLine(product.wearProfile),
                        ),
                      if (product.related.isNotEmpty)
                        _Section(
                          title: 'Layer It With · ركّبه مع',
                          child: _LayerWith(product: product),
                        ),
                      _Section(
                        title: 'Description · الوصف',
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (product.tagline.isNotEmpty)
                              _NotesLine(product.tagline, bold: true),
                            _NotesLine(product.bestDescription),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              _RelatedSliver(productId: product.id),
              const SliverToBoxAdapter(child: SizedBox(height: 24)),
            ],
          ),

          // شريط الشراء الثابت تحت: الاسم، السعر، أضف للسلة
          bottomNavigationBar: _BuyBar(
            product: product,
            price: unitPrice,
            size: size,
            onAdd: product.inStock ? () => _add(product) : null,
          ),
        );
      },
    );
  }
}

class _Spec extends StatelessWidget {
  final String label;
  final String value;
  const _Spec({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    if (value.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Text.rich(
        TextSpan(
          children: [
            TextSpan(
              text: '$label: ',
              style: const TextStyle(
                color: AppColors.primary,
                fontWeight: FontWeight.w700,
              ),
            ),
            TextSpan(text: value),
          ],
        ),
        style: const TextStyle(fontSize: 13.5, color: AppColors.textSecondary),
      ),
    );
  }
}

class _Trust extends StatelessWidget {
  final IconData icon;
  final String text;
  const _Trust({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          Icon(icon, size: 18, color: AppColors.primary),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: const TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
            ),
          ),
        ],
      ),
    );
  }
}

/// قسم بيتفتح ويتقفل بعلامة +.
class _Section extends StatefulWidget {
  final String title;
  final Widget child;
  final bool initiallyExpanded;
  const _Section({
    required this.title,
    required this.child,
    this.initiallyExpanded = false,
  });

  @override
  State<_Section> createState() => _SectionState();
}

class _SectionState extends State<_Section> {
  late bool _open = widget.initiallyExpanded;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        border: Border(bottom: BorderSide(color: AppColors.divider)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          InkWell(
            onTap: () => setState(() => _open = !_open),
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 16),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      widget.title,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 14,
                      ),
                    ),
                  ),
                  AnimatedRotation(
                    turns: _open ? 0.125 : 0,
                    duration: const Duration(milliseconds: 250),
                    child: const Icon(Icons.add_rounded, size: 22),
                  ),
                ],
              ),
            ),
          ),
          AnimatedCrossFade(
            firstChild: const SizedBox(width: double.infinity),
            secondChild: Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: widget.child,
            ),
            crossFadeState:
                _open ? CrossFadeState.showSecond : CrossFadeState.showFirst,
            duration: const Duration(milliseconds: 220),
          ),
        ],
      ),
    );
  }
}

class _NoteRow extends StatelessWidget {
  final String label;
  final List<String> notes;
  const _NoteRow(this.label, this.notes);

  @override
  Widget build(BuildContext context) {
    if (notes.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 11.5,
              color: AppColors.primary,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(height: 2),
          Text(notes.join('، '), style: const TextStyle(fontSize: 14)),
        ],
      ),
    );
  }
}

class _NotesLine extends StatelessWidget {
  final String text;
  final bool bold;
  const _NotesLine(this.text, {this.bold = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Text(
        text,
        style: TextStyle(
          fontSize: bold ? 16 : 13.5,
          height: 1.6,
          fontWeight: bold ? FontWeight.w700 : FontWeight.w400,
          color: bold ? AppColors.textPrimary : AppColors.textSecondary,
        ),
      ),
    );
  }
}

/// «ركّبه مع» — كل عطر مقترح وزرار «أضف الاتنين للسلة».
class _LayerWith extends ConsumerWidget {
  final Product product;
  const _LayerWith({required this.product});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final list = ref.watch(layerWithProvider(product.id)).value ?? const [];
    return Column(
      children: [
        for (final p in list)
          Container(
            margin: const EdgeInsets.only(bottom: 8),
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.divider),
            ),
            child: Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => context.push('/product/${p.id}'),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          p.displayName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          textDirection: TextDirection.ltr,
                          style: const TextStyle(fontWeight: FontWeight.w700),
                        ),
                        Text(
                          p.subLine,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            fontSize: 11.5,
                            color: AppColors.textMuted,
                          ),
                        ),
                        Text(
                          '${Fmt.price(p.defaultVariant.price)} · ${p.defaultVariant.sizeMl} مل',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppColors.primary,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                OutlinedButton(
                  style: OutlinedButton.styleFrom(
                    minimumSize: const Size(96, 40),
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                  ),
                  onPressed: () {
                    final cart = ref.read(cartControllerProvider.notifier);
                    cart.add(product);
                    cart.add(p);
                    ScaffoldMessenger.of(context)
                      ..hideCurrentSnackBar()
                      ..showSnackBar(
                        const SnackBar(content: Text('اتضاف العطرين للسلة')),
                      );
                  },
                  child: const Text('أضف الاتنين', style: TextStyle(fontSize: 12)),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

class _RelatedSliver extends ConsumerWidget {
  final String productId;
  const _RelatedSliver({required this.productId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final related = ref.watch(relatedProductsProvider(productId)).value ?? const [];
    if (related.isEmpty) return const SliverToBoxAdapter(child: SizedBox.shrink());
    return SliverToBoxAdapter(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Padding(
            padding: EdgeInsets.fromLTRB(18, 16, 18, 10),
            child: Text(
              'ممكن يعجبك كمان',
              style: TextStyle(fontWeight: FontWeight.w800, fontSize: 17),
            ),
          ),
          SizedBox(
            height: 290,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 18),
              scrollDirection: Axis.horizontal,
              itemCount: related.length,
              separatorBuilder: (_, _) => const SizedBox(width: 12),
              itemBuilder: (context, i) => SizedBox(
                width: 170,
                child: ProductCard(
                  product: related[i],
                  compact: true,
                  onTap: () => context.push('/product/${related[i].id}'),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

/// شريط الشراء الثابت تحت.
class _BuyBar extends StatelessWidget {
  final Product product;
  final double price;
  final int size;
  final VoidCallback? onAdd;

  const _BuyBar({
    required this.product,
    required this.price,
    required this.size,
    required this.onAdd,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.divider)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.displayName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      textDirection: TextDirection.ltr,
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 13,
                      ),
                    ),
                    Text(
                      product.isSet ? Fmt.price(price) : '${Fmt.price(price)} · $size مل',
                      style: const TextStyle(
                        color: AppColors.primary,
                        fontSize: 12.5,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              ElevatedButton.icon(
                onPressed: onAdd,
                // الثيم بيخلي الزرار بعرض الشاشة — هنا جنب الاسم والسعر.
                style: ElevatedButton.styleFrom(minimumSize: const Size(140, 48)),
                icon: const Icon(Icons.shopping_bag_outlined, size: 18),
                label: Text(onAdd == null ? 'نفد المخزون' : 'أضف للسلة'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
