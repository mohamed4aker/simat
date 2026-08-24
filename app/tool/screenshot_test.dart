import 'dart:typed_data';
import 'dart:ui' as ui;
// أداة تطوير: بتصوّر شاشات التطبيق كصور PNG من غير محاكي.
// التشغيل:  flutter test tool/screenshot_test.dart
// الصور بتتحفظ في build/screens/
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart' show FontLoader;
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:simat/core/theme/app_theme.dart';
import 'package:simat/data/sources/local_store.dart';
import 'package:simat/features/admin/dashboard/dashboard_screen.dart';
import 'package:simat/features/admin/orders/admin_orders_screen.dart';
import 'package:simat/features/admin/products/admin_products_screen.dart';
import 'package:simat/features/admin/reports/reports_screen.dart';
import 'package:simat/features/auth/login_screen.dart';
import 'package:simat/features/customer/cart/cart_screen.dart';
import 'package:simat/features/customer/catalog/catalog_screen.dart';
import 'package:simat/features/customer/home/home_screen.dart';
import 'package:simat/features/customer/orders/orders_screen.dart';
import 'package:simat/features/customer/product/product_screen.dart';
import 'package:simat/features/customer/profile/profile_screen.dart';
import 'package:simat/providers/app_providers.dart';

void main() {
  late LocalStore store;

  setUpAll(() async {
    TestWidgetsFlutterBinding.ensureInitialized();
    SharedPreferences.setMockInitialValues({});
    await initializeDateFormatting('ar');
    store = await LocalStore.init();
    Directory('build/screens').createSync(recursive: true);
  });

  Future<void> shoot(
    WidgetTester tester,
    String name,
    Widget screen, {
    bool asAdmin = false,
    bool withCart = false,
    Size size = const Size(420, 940),
  }) async {
    await tester.binding.setSurfaceSize(size);
    tester.view.physicalSize = size * 2;
    tester.view.devicePixelRatio = 2;

    final container = ProviderContainer(
      overrides: [localStoreProvider.overrideWithValue(store)],
    );
    addTearDown(container.dispose);

    if (asAdmin) {
      await container
          .read(authControllerProvider.notifier)
          .login(phone: '01000000000', password: 'admin123');
    } else {
      await container
          .read(authControllerProvider.notifier)
          .login(phone: '01011112222', password: '123456');
    }
    if (withCart) {
      final products = await container
          .read(catalogRepositoryProvider)
          .allProducts();
      final cart = container.read(cartControllerProvider.notifier);
      cart.clear();
      cart.add(products[0], quantity: 1);
      cart.add(products[2], quantity: 2);
    }

    await tester.pumpWidget(
      UncontrolledProviderScope(
        container: container,
        child: MaterialApp(
          theme: AppTheme.light,
          debugShowCheckedModeBanner: false,
          locale: const Locale('ar', 'EG'),
          supportedLocales: const [Locale('ar', 'EG'), Locale('en', 'US')],
          localizationsDelegates: const [
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          home: Directionality(
            textDirection: TextDirection.rtl,
            child: RepaintBoundary(key: const ValueKey('shot'), child: screen),
          ),
        ),
      ),
    );

    for (var i = 0; i < 8; i++) {
      await tester.pump(const Duration(milliseconds: 120));
    }

    final boundary = tester.renderObject<RenderRepaintBoundary>(
      find.byKey(const ValueKey('shot')),
    );
    final image = await boundary.toImage(pixelRatio: 2);
    final bytes = await image.toByteData(format: ui.ImageByteFormat.png);
    File('build/screens/$name.png').writeAsBytesSync(
      bytes!.buffer.asUint8List(),
    );
  }

  testWidgets('01 home', (t) => shoot(t, '01-home', const HomeScreen()));
  testWidgets('02 catalog', (t) => shoot(t, '02-catalog', const CatalogScreen()));
  testWidgets('03 product',
      (t) => shoot(t, '03-product', const ProductScreen(productId: 'p_001')));
  testWidgets('04 cart',
      (t) => shoot(t, '04-cart', const CartScreen(), withCart: true));
  testWidgets('05 orders', (t) => shoot(t, '05-orders', const OrdersScreen()));
  testWidgets('06 profile', (t) => shoot(t, '06-profile', const ProfileScreen()));
  testWidgets('07 login', (t) => shoot(t, '07-login', const LoginScreen()));
  testWidgets('10 admin dashboard',
      (t) => shoot(t, '10-admin-dashboard', const AdminDashboardScreen(),
          asAdmin: true));
  testWidgets('11 admin reports',
      (t) => shoot(t, '11-admin-reports', const AdminReportsScreen(),
          asAdmin: true));
  testWidgets('12 admin products',
      (t) => shoot(t, '12-admin-products', const AdminProductsScreen(),
          asAdmin: true));
  testWidgets('13 admin orders',
      (t) => shoot(t, '13-admin-orders', const AdminOrdersScreen(),
          asAdmin: true));
}


/// بيحمّل خطوط الهوية عشان الصور تطلع بالخط الحقيقي مش المربعات.
Future<void> _loadFonts() async {
  const families = {
    'Cairo': [
      'assets/fonts/Cairo-Regular.ttf',
      'assets/fonts/Cairo-SemiBold.ttf',
      'assets/fonts/Cairo-Bold.ttf',
      'assets/fonts/Cairo-ExtraBold.ttf',
    ],
    'PlayfairDisplay': [
      'assets/fonts/PlayfairDisplay-Medium.ttf',
      'assets/fonts/PlayfairDisplay-SemiBold.ttf',
      'assets/fonts/PlayfairDisplay-Bold.ttf',
    ],
  };
  for (final entry in families.entries) {
    final loader = FontLoader(entry.key);
    for (final path in entry.value) {
      final bytes = File(path).readAsBytesSync();
      loader.addFont(Future.value(ByteData.view(bytes.buffer)));
    }
    await loader.load();
  }
}
