import 'dart:io';
import 'dart:math' as math;

import 'package:flutter/material.dart';

import '../theme/app_colors.dart';
import 'simat_pattern.dart';

/// صورة المنتج.
/// لو المنتج له صورة (أصل داخل التطبيق أو ملف من المعرض أو رابط) تُعرض،
/// وإلا يُرسم شكل زجاجة عطر بألوان الهوية — عشان الكتالوج يفضل مكتمل
/// من غير ما نستنى صور فوتوغرافية.
class ProductArtwork extends StatelessWidget {
  final String? imagePath;
  final String seed;
  final double? width;
  final double? height;
  final BorderRadius? borderRadius;
  final bool showPattern;

  const ProductArtwork({
    super.key,
    required this.seed,
    this.imagePath,
    this.width,
    this.height,
    this.borderRadius,
    this.showPattern = true,
  });

  @override
  Widget build(BuildContext context) {
    final radius = borderRadius ?? BorderRadius.circular(16);
    final path = imagePath;

    Widget content;
    if (path != null && path.trim().isNotEmpty) {
      content = _buildImage(path);
    } else {
      content = _BottleArt(seed: seed, showPattern: showPattern);
    }

    return ClipRRect(
      borderRadius: radius,
      child: SizedBox(width: width, height: height, child: content),
    );
  }

  Widget _buildImage(String path) {
    final fallback = _BottleArt(seed: seed, showPattern: showPattern);
    if (path.startsWith('http')) {
      return Image.network(
        path,
        fit: BoxFit.cover,
        errorBuilder: (_, _, _) => fallback,
      );
    }
    if (path.startsWith('assets/')) {
      return Image.asset(
        path,
        fit: BoxFit.cover,
        errorBuilder: (_, _, _) => fallback,
      );
    }
    return Image.file(
      File(path),
      fit: BoxFit.cover,
      errorBuilder: (_, _, _) => fallback,
    );
  }
}

class _BottleArt extends StatelessWidget {
  final String seed;
  final bool showPattern;

  const _BottleArt({required this.seed, required this.showPattern});

  @override
  Widget build(BuildContext context) {
    final variant = seed.codeUnits.fold<int>(0, (a, b) => a + b) % 4;
    final palettes = <List<Color>>[
      [const Color(0xFFF7F1E8), const Color(0xFFE6D9C7)],
      [const Color(0xFFF3E7E4), const Color(0xFFDFC7C4)],
      [const Color(0xFFF1EDE4), const Color(0xFFD9CFC3)],
      [const Color(0xFFF6EDE2), const Color(0xFFE8D3B8)],
    ];
    final liquids = <Color>[
      AppColors.accent,
      AppColors.primary,
      const Color(0xFF8A6A3B),
      const Color(0xFF6E4C6E),
    ];

    return Stack(
      fit: StackFit.expand,
      children: [
        DecoratedBox(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topRight,
              end: Alignment.bottomLeft,
              colors: palettes[variant],
            ),
          ),
        ),
        if (showPattern)
          SimatPattern(
            color: AppColors.accent,
            opacity: 0.10,
            spacing: 46,
          ),
        Padding(
          padding: const EdgeInsets.all(14),
          child: CustomPaint(
            painter: _BottlePainter(
              liquid: liquids[variant],
              capColor: AppColors.dark.withValues(alpha: 0.75),
            ),
          ),
        ),
      ],
    );
  }
}

class _BottlePainter extends CustomPainter {
  final Color liquid;
  final Color capColor;

  _BottlePainter({required this.liquid, required this.capColor});

  @override
  void paint(Canvas canvas, Size size) {
    final side = math.min(size.width, size.height);
    final cx = size.width / 2;
    final bottleW = side * 0.46;
    final bottleH = side * 0.56;
    final top = size.height / 2 - bottleH * 0.28;

    final body = RRect.fromRectAndRadius(
      Rect.fromCenter(
        center: Offset(cx, top + bottleH / 2),
        width: bottleW,
        height: bottleH,
      ),
      Radius.circular(bottleW * 0.18),
    );

    // زجاج الزجاجة
    canvas.drawRRect(
      body,
      Paint()..color = Colors.white.withValues(alpha: 0.62),
    );

    // السائل العطري في القاع
    canvas.save();
    canvas.clipRRect(body);
    final liquidRect = Rect.fromLTWH(
      body.left,
      body.top + bottleH * 0.34,
      bottleW,
      bottleH * 0.66,
    );
    canvas.drawRect(
      liquidRect,
      Paint()
        ..shader = LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            liquid.withValues(alpha: 0.55),
            liquid.withValues(alpha: 0.92),
          ],
        ).createShader(liquidRect),
    );
    canvas.restore();

    // حد الزجاجة
    canvas.drawRRect(
      body,
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1.6
        ..color = AppColors.dark.withValues(alpha: 0.25),
    );

    // لمعة جانبية
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromLTWH(
          body.left + bottleW * 0.12,
          body.top + bottleH * 0.1,
          bottleW * 0.12,
          bottleH * 0.55,
        ),
        Radius.circular(bottleW * 0.06),
      ),
      Paint()..color = Colors.white.withValues(alpha: 0.5),
    );

    // العنق
    final neckW = bottleW * 0.3;
    final neckH = bottleH * 0.16;
    canvas.drawRect(
      Rect.fromCenter(
        center: Offset(cx, top - neckH / 2),
        width: neckW,
        height: neckH,
      ),
      Paint()..color = Colors.white.withValues(alpha: 0.7),
    );

    // الغطاء
    canvas.drawRRect(
      RRect.fromRectAndRadius(
        Rect.fromCenter(
          center: Offset(cx, top - neckH - bottleH * 0.09),
          width: bottleW * 0.46,
          height: bottleH * 0.19,
        ),
        Radius.circular(bottleW * 0.06),
      ),
      Paint()..color = capColor,
    );
  }

  @override
  bool shouldRepaint(_BottlePainter old) =>
      old.liquid != liquid || old.capColor != capColor;
}
