import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/constants/app_constants.dart';
import '../../core/theme/app_colors.dart';
import '../../core/widgets/simat_logo.dart';
import '../../core/widgets/simat_pattern.dart';
import '../../providers/app_providers.dart';

/// شاشة البداية — شعار سِمة مع ظهور تدريجي ثم التوجيه للمكان المناسب.
class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 1400),
  )..forward();

  @override
  void initState() {
    super.initState();
    _goNext();
  }

  Future<void> _goNext() async {
    await Future<void>.delayed(const Duration(milliseconds: 1900));
    if (!mounted) return;
    final user = ref.read(authControllerProvider);
    if (user != null && user.isAdmin) {
      context.go('/admin');
    } else {
      context.go('/home');
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final fade = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
    final rise = Tween<Offset>(
      begin: const Offset(0, 0.12),
      end: Offset.zero,
    ).animate(fade);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SimatPattern(
        opacity: 0.10,
        spacing: 68,
        child: Center(
          child: FadeTransition(
            opacity: fade,
            child: SlideTransition(
              position: rise,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SimatLogo(markSize: 110, latinSize: 30),
                  const SizedBox(height: 22),
                  Container(
                    width: 46,
                    height: 1,
                    color: AppColors.accent.withValues(alpha: 0.6),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    AppConstants.tagline,
                    style: const TextStyle(
                      fontSize: 13,
                      letterSpacing: 1,
                      color: AppColors.textSecondary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
