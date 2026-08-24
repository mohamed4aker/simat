import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/theme/app_colors.dart';
import '../../../providers/app_providers.dart';

/// لوحة إضافة تقييم لمنتج.
Future<void> showReviewSheet(
  BuildContext context,
  WidgetRef ref,
  String productId,
) {
  return showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    builder: (_) => _ReviewSheet(productId: productId),
  );
}

class _ReviewSheet extends ConsumerStatefulWidget {
  final String productId;
  const _ReviewSheet({required this.productId});

  @override
  ConsumerState<_ReviewSheet> createState() => _ReviewSheetState();
}

class _ReviewSheetState extends ConsumerState<_ReviewSheet> {
  final _comment = TextEditingController();
  double _rating = 5;
  bool _saving = false;

  @override
  void dispose() {
    _comment.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final user = ref.read(authControllerProvider);
    if (user == null) return;
    setState(() => _saving = true);
    await ref.read(catalogRepositoryProvider).addReview(
          productId: widget.productId,
          user: user,
          rating: _rating,
          comment: _comment.text.trim(),
        );
    bumpData(ref);
    if (!mounted) return;
    Navigator.of(context).pop();
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('شكراً لتقييمك 🌿')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text('قيّم المنتج',
                  style: Theme.of(context).textTheme.titleLarge),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  for (var i = 1; i <= 5; i++)
                    IconButton(
                      onPressed: () =>
                          setState(() => _rating = i.toDouble()),
                      icon: Icon(
                        _rating >= i
                            ? Icons.star_rounded
                            : Icons.star_outline_rounded,
                        size: 34,
                        color: AppColors.accent,
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 8),
              TextField(
                controller: _comment,
                maxLines: 4,
                decoration: const InputDecoration(
                  hintText: 'اكتب رأيك في العطر — الثبات، الفوحان، التغليف...',
                ),
              ),
              const SizedBox(height: 18),
              ElevatedButton(
                onPressed: _saving ? null : _submit,
                child: _saving
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.4,
                          color: Colors.white,
                        ),
                      )
                    : const Text('إرسال التقييم'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
