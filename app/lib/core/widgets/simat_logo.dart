import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// رمز الهوية: قطرة العطر مع خصلة البخور المتصاعدة.
/// مرسوم بالـ Vector عشان يفضل حاد على أي مقاس.
class SimatMark extends StatelessWidget {
  final double size;
  final Color color;
  final double strokeScale;

  const SimatMark({
    super.key,
    this.size = 48,
    this.color = AppColors.primary,
    this.strokeScale = 1,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size * 0.62,
      height: size,
      child: CustomPaint(
        painter: _MarkPainter(color: color, strokeScale: strokeScale),
      ),
    );
  }
}

class _MarkPainter extends CustomPainter {
  final Color color;
  final double strokeScale;

  _MarkPainter({required this.color, required this.strokeScale});

  @override
  void paint(Canvas canvas, Size size) {
    // مساحة التصميم الأصلية 100×160 ثم نُقيّسها لحجم الودجت.
    final sx = size.width / 100;
    final sy = size.height / 160;
    canvas.save();
    canvas.scale(sx, sy);

    final stroke = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round
      ..strokeWidth = 6 * strokeScale;

    // القطرة
    final drop = Path()
      ..moveTo(50, 52)
      ..cubicTo(50, 82, 13, 94, 13, 120)
      ..cubicTo(13, 142, 30, 157, 50, 157)
      ..cubicTo(70, 157, 87, 142, 87, 120)
      ..cubicTo(87, 94, 50, 82, 50, 52);
    canvas.drawPath(drop, stroke);

    // خصلة البخور
    final wisp = Path()
      ..moveTo(50, 52)
      ..cubicTo(58, 36, 40, 30, 45, 15)
      ..cubicTo(48, 5, 62, 3, 65, 12);
    canvas.drawPath(wisp, stroke..strokeWidth = 5 * strokeScale);

    canvas.restore();
  }

  @override
  bool shouldRepaint(_MarkPainter old) =>
      old.color != color || old.strokeScale != strokeScale;
}

/// شعار SIMAT الكامل: الرمز + الاسم اللاتيني + الاسم العربي.
class SimatLogo extends StatelessWidget {
  final double markSize;
  final Color color;
  final bool showArabic;
  final bool showLatin;
  final double latinSize;

  const SimatLogo({
    super.key,
    this.markSize = 56,
    this.color = AppColors.primary,
    this.showArabic = true,
    this.showLatin = true,
    this.latinSize = 22,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SimatMark(size: markSize, color: color),
        if (showLatin) ...[
          SizedBox(height: markSize * 0.16),
          Text(
            'SIMAT',
            style: TextStyle(
              fontFamily: 'PlayfairDisplay',
              fontSize: latinSize,
              fontWeight: FontWeight.w600,
              letterSpacing: latinSize * 0.34,
              color: color,
              height: 1,
            ),
          ),
        ],
        if (showArabic) ...[
          SizedBox(height: markSize * 0.08),
          Text(
            'سِمة',
            style: TextStyle(
              fontFamily: 'Cairo',
              fontSize: latinSize * 0.8,
              fontWeight: FontWeight.w600,
              letterSpacing: latinSize * 0.12,
              color: color.withValues(alpha: 0.85),
              height: 1.4,
            ),
          ),
        ],
      ],
    );
  }
}

/// شعار أفقي مناسب لشريط التطبيق.
class SimatLogoBar extends StatelessWidget {
  final Color color;
  final double height;

  const SimatLogoBar({
    super.key,
    this.color = AppColors.primary,
    this.height = 32,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        SimatMark(size: height, color: color, strokeScale: 1.2),
        SizedBox(width: height * 0.28),
        Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'SIMAT',
              style: TextStyle(
                fontFamily: 'PlayfairDisplay',
                fontSize: height * 0.52,
                fontWeight: FontWeight.w600,
                letterSpacing: height * 0.16,
                color: color,
                height: 1.1,
              ),
            ),
            Text(
              'سِمة',
              style: TextStyle(
                fontFamily: 'Cairo',
                fontSize: height * 0.34,
                fontWeight: FontWeight.w600,
                color: color.withValues(alpha: 0.7),
                height: 1.2,
              ),
            ),
          ],
        ),
      ],
    );
  }
}
