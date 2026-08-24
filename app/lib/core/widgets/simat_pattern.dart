import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

/// خلفية النمط (Pattern — النمط) من دليل الهوية:
/// قطرات صغيرة متكررة بلون نحاسي خفيف.
class SimatPattern extends StatelessWidget {
  final Widget? child;
  final Color color;
  final double opacity;
  final double spacing;

  const SimatPattern({
    super.key,
    this.child,
    this.color = AppColors.accent,
    this.opacity = 0.14,
    this.spacing = 56,
  });

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _PatternPainter(
        color: color.withValues(alpha: opacity),
        spacing: spacing,
      ),
      child: child,
    );
  }
}

class _PatternPainter extends CustomPainter {
  final Color color;
  final double spacing;

  _PatternPainter({required this.color, required this.spacing});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round
      ..strokeWidth = 1.4;

    final dropHeight = spacing * 0.42;
    final dropWidth = dropHeight * 0.6;

    var row = 0;
    for (double y = -dropHeight; y < size.height + spacing; y += spacing) {
      final offsetX = row.isEven ? 0.0 : spacing / 2;
      for (double x = -spacing; x < size.width + spacing; x += spacing) {
        _drawDrop(canvas, paint, Offset(x + offsetX, y), dropWidth, dropHeight);
      }
      row++;
    }
  }

  void _drawDrop(
    Canvas canvas,
    Paint paint,
    Offset at,
    double w,
    double h,
  ) {
    final path = Path()
      ..moveTo(at.dx, at.dy)
      ..cubicTo(at.dx, at.dy + h * 0.34, at.dx - w / 2, at.dy + h * 0.46,
          at.dx - w / 2, at.dy + h * 0.68)
      ..cubicTo(at.dx - w / 2, at.dy + h * 0.9, at.dx - w * 0.2, at.dy + h,
          at.dx, at.dy + h)
      ..cubicTo(at.dx + w * 0.2, at.dy + h, at.dx + w / 2, at.dy + h * 0.9,
          at.dx + w / 2, at.dy + h * 0.68)
      ..cubicTo(at.dx + w / 2, at.dy + h * 0.46, at.dx, at.dy + h * 0.34,
          at.dx, at.dy);
    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(_PatternPainter old) =>
      old.color != color || old.spacing != spacing;
}
