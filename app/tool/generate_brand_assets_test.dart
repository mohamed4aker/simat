// أداة تطوير: بتولّد أصول الهوية (أيقونة التطبيق وشاشة البداية) من
// الشعار المرسوم بالكود، فمفيش حاجة اسمها «مستني ملف من المصمّم».
//
// التشغيل:  flutter test tool/generate_brand_assets_test.dart
import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:simat/core/theme/app_colors.dart';
import 'package:simat/core/widgets/simat_logo.dart';

Future<void> _render(
  WidgetTester tester,
  String path,
  Widget child, {
  double side = 1024,
}) async {
  await tester.binding.setSurfaceSize(Size(side, side));
  tester.view.physicalSize = Size(side, side);
  tester.view.devicePixelRatio = 1;

  await tester.pumpWidget(
    Directionality(
      textDirection: TextDirection.rtl,
      child: RepaintBoundary(
        key: const ValueKey('icon'),
        child: SizedBox(width: side, height: side, child: child),
      ),
    ),
  );
  await tester.pump(const Duration(milliseconds: 60));

  final boundary = tester.renderObject<RenderRepaintBoundary>(
    find.byKey(const ValueKey('icon')),
  );
  final image = await boundary.toImage();
  final bytes = await image.toByteData(format: ui.ImageByteFormat.png);
  File(path)
    ..createSync(recursive: true)
    ..writeAsBytesSync(bytes!.buffer.asUint8List());
}

void main() {
  // ملحوظة: الأيقونة رمز القطرة لوحدها من غير كلمات — الخطوط المخصّصة
  // مش بتتحمّل في بيئة الاختبار، والرمز لوحده أوضح كأيقونة على أي حال.

  testWidgets('أيقونة التطبيق', (tester) async {
    await _render(
      tester,
      'assets/brand/app_icon.png',
      Container(
        color: AppColors.background,
        alignment: Alignment.center,
        child: const SimatMark(size: 660, strokeScale: 1.15),
      ),
    );
  });

  testWidgets('الطبقة الأمامية لأيقونة أندرويد التكيّفية', (tester) async {
    await _render(
      tester,
      'assets/brand/app_icon_foreground.png',
      const Center(child: SimatMark(size: 480, strokeScale: 1.15)),
    );
  });

  testWidgets('شعار شاشة البداية الأصلية', (tester) async {
    await _render(
      tester,
      'assets/brand/splash_logo.png',
      const Center(child: SimatMark(size: 620, strokeScale: 1.1)),
      side: 900,
    );
  });
}
