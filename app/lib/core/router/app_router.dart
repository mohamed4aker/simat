import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/admin/admin_shell.dart';
import '../../features/admin/customers/admin_customers_screen.dart';
import '../../features/admin/dashboard/dashboard_screen.dart';
import '../../features/admin/orders/admin_order_details_screen.dart';
import '../../features/admin/orders/admin_orders_screen.dart';
import '../../features/admin/products/admin_products_screen.dart';
import '../../features/admin/products/product_form_screen.dart';
import '../../features/admin/reports/reports_screen.dart';
import '../../features/admin/settings/admin_categories_screen.dart';
import '../../features/admin/settings/admin_coupons_screen.dart';
import '../../features/admin/settings/admin_more_screen.dart';
import '../../features/auth/login_screen.dart';
import '../../features/auth/register_screen.dart';
import '../../features/customer/cart/cart_screen.dart';
import '../../features/customer/catalog/catalog_screen.dart';
import '../../features/customer/catalog/search_screen.dart';
import '../../features/customer/checkout/checkout_screen.dart';
import '../../features/customer/checkout/order_success_screen.dart';
import '../../features/customer/favorites/favorites_screen.dart';
import '../../features/customer/home/home_screen.dart';
import '../../features/customer/orders/order_details_screen.dart';
import '../../features/customer/orders/orders_screen.dart';
import '../../features/customer/product/product_screen.dart';
import '../../features/customer/profile/addresses_screen.dart';
import '../../features/customer/profile/edit_profile_screen.dart';
import '../../features/customer/profile/profile_screen.dart';
import '../../features/customer/shell/customer_shell.dart';
import '../../features/splash/splash_screen.dart';
import '../../providers/app_providers.dart';

final _rootKey = GlobalKey<NavigatorState>(debugLabel: 'root');
final _customerShellKey = GlobalKey<NavigatorState>(debugLabel: 'customer');
final _adminShellKey = GlobalKey<NavigatorState>(debugLabel: 'admin');

/// تعريف مسارات التطبيق.
final routerProvider = Provider<GoRouter>((ref) {
  // يخلّي الراوتر يعيد تقييم الحماية بعد تسجيل الدخول/الخروج.
  final refresh = ValueNotifier<int>(0);
  ref.listen(authControllerProvider, (_, _) => refresh.value++);
  ref.onDispose(refresh.dispose);

  return GoRouter(
    navigatorKey: _rootKey,
    initialLocation: '/',
    refreshListenable: refresh,
    redirect: (context, state) {
      final user = ref.read(authControllerProvider);
      final path = state.uri.path;

      // لوحة التحكم للأدمن بس.
      if (path.startsWith('/admin') && !(user?.isAdmin ?? false)) {
        return '/login?redirect=/admin';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => LoginScreen(
          redirect: state.uri.queryParameters['redirect'],
        ),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),

      // ───────────── واجهة العميل ─────────────
      StatefulShellRoute.indexedStack(
        parentNavigatorKey: _rootKey,
        builder: (context, state, navigationShell) =>
            CustomerShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            navigatorKey: _customerShellKey,
            routes: [
              GoRoute(
                path: '/home',
                builder: (context, state) => const HomeScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/catalog',
                builder: (context, state) => const CatalogScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/cart',
                builder: (context, state) => const CartScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/favorites',
                builder: (context, state) => const FavoritesScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/profile',
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),

      GoRoute(
        path: '/product/:id',
        parentNavigatorKey: _rootKey,
        builder: (context, state) =>
            ProductScreen(productId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/search',
        parentNavigatorKey: _rootKey,
        builder: (context, state) => const SearchScreen(),
      ),
      GoRoute(
        path: '/checkout',
        parentNavigatorKey: _rootKey,
        builder: (context, state) => const CheckoutScreen(),
      ),
      GoRoute(
        path: '/order-success/:id',
        parentNavigatorKey: _rootKey,
        builder: (context, state) =>
            OrderSuccessScreen(orderId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/orders',
        parentNavigatorKey: _rootKey,
        builder: (context, state) => const OrdersScreen(),
        routes: [
          GoRoute(
            path: ':id',
            parentNavigatorKey: _rootKey,
            builder: (context, state) =>
                OrderDetailsScreen(orderId: state.pathParameters['id']!),
          ),
        ],
      ),
      GoRoute(
        path: '/addresses',
        parentNavigatorKey: _rootKey,
        builder: (context, state) => const AddressesScreen(),
      ),
      GoRoute(
        path: '/profile/edit',
        parentNavigatorKey: _rootKey,
        builder: (context, state) => const EditProfileScreen(),
      ),

      // ───────────── لوحة التحكم ─────────────
      StatefulShellRoute.indexedStack(
        parentNavigatorKey: _rootKey,
        builder: (context, state, navigationShell) =>
            AdminShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(
            navigatorKey: _adminShellKey,
            routes: [
              GoRoute(
                path: '/admin',
                builder: (context, state) => const AdminDashboardScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/admin/orders',
                builder: (context, state) => const AdminOrdersScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/admin/products',
                builder: (context, state) => const AdminProductsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/admin/reports',
                builder: (context, state) => const AdminReportsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: '/admin/more',
                builder: (context, state) => const AdminMoreScreen(),
              ),
            ],
          ),
        ],
      ),

      GoRoute(
        path: '/admin/products/new',
        parentNavigatorKey: _rootKey,
        builder: (context, state) => const ProductFormScreen(),
      ),
      GoRoute(
        path: '/admin/products/:id',
        parentNavigatorKey: _rootKey,
        builder: (context, state) =>
            ProductFormScreen(productId: state.pathParameters['id']),
      ),
      GoRoute(
        path: '/admin/orders/:id',
        parentNavigatorKey: _rootKey,
        builder: (context, state) =>
            AdminOrderDetailsScreen(orderId: state.pathParameters['id']!),
      ),
      GoRoute(
        path: '/admin/categories',
        parentNavigatorKey: _rootKey,
        builder: (context, state) => const AdminCategoriesScreen(),
      ),
      GoRoute(
        path: '/admin/coupons',
        parentNavigatorKey: _rootKey,
        builder: (context, state) => const AdminCouponsScreen(),
      ),
      GoRoute(
        path: '/admin/customers',
        parentNavigatorKey: _rootKey,
        builder: (context, state) => const AdminCustomersScreen(),
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      appBar: AppBar(),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.explore_off_outlined, size: 56),
            const SizedBox(height: 12),
            Text('الصفحة مش موجودة: ${state.uri}'),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => context.go('/home'),
              child: const Text('الرجوع للرئيسية'),
            ),
          ],
        ),
      ),
    ),
  );
});
