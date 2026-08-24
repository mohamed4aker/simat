import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:simat/core/theme/app_colors.dart';
import 'package:simat/core/widgets/simat_logo.dart';

void main() {
  testWidgets('شعار سِمة بيتعرض بالاسم العربي واللاتيني', (tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Directionality(
          textDirection: TextDirection.rtl,
          child: Scaffold(body: Center(child: SimatLogo())),
        ),
      ),
    );

    expect(find.text('SIMAT'), findsOneWidget);
    expect(find.text('سِمة'), findsOneWidget);
    expect(AppColors.primary, const Color(0xFF6B1F2A));
  });
}
