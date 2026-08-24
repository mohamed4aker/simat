import '../models/models.dart';
import '../sources/local_store.dart';

/// فترات جاهزة للتقارير.
enum ReportRange {
  today,
  week,
  month,
  quarter,
  year,
  all;

  String get labelAr => switch (this) {
        ReportRange.today => 'اليوم',
        ReportRange.week => 'آخر ٧ أيام',
        ReportRange.month => 'آخر ٣٠ يوم',
        ReportRange.quarter => 'آخر ٣ شهور',
        ReportRange.year => 'آخر سنة',
        ReportRange.all => 'كل الفترات',
      };

  int get days => switch (this) {
        ReportRange.today => 1,
        ReportRange.week => 7,
        ReportRange.month => 30,
        ReportRange.quarter => 90,
        ReportRange.year => 365,
        ReportRange.all => 100000,
      };
}

/// نقطة على منحنى المبيعات.
class SalesPoint {
  final DateTime date;
  final double revenue;
  final int orders;

  const SalesPoint({
    required this.date,
    required this.revenue,
    required this.orders,
  });
}

/// صف في تقرير «الأكثر مبيعاً».
class ProductSales {
  final String productId;
  final String name;
  final int quantity;
  final double revenue;
  final int stock;

  const ProductSales({
    required this.productId,
    required this.name,
    required this.quantity,
    required this.revenue,
    this.stock = 0,
  });
}

/// صف في تقرير أفضل العملاء.
class CustomerSales {
  final String userId;
  final String name;
  final String phone;
  final int orders;
  final double spent;

  const CustomerSales({
    required this.userId,
    required this.name,
    required this.phone,
    required this.orders,
    required this.spent,
  });
}

/// حصيلة التقارير اللي بتتعرض في لوحة الأدمن.
class DashboardReport {
  final ReportRange range;

  final double revenue;
  final double previousRevenue;
  final int ordersCount;
  final int previousOrdersCount;
  final int itemsSold;
  final int newCustomers;
  final double averageOrderValue;

  final Map<OrderStatus, int> ordersByStatus;
  final Map<PaymentMethod, double> revenueByPayment;
  final Map<String, double> revenueByCategory;

  final List<SalesPoint> series;
  final List<ProductSales> topProducts;
  final List<CustomerSales> topCustomers;
  final List<Product> lowStock;

  final int totalProducts;
  final int totalCustomers;
  final double lifetimeRevenue;
  final int pendingCount;

  const DashboardReport({
    required this.range,
    required this.revenue,
    required this.previousRevenue,
    required this.ordersCount,
    required this.previousOrdersCount,
    required this.itemsSold,
    required this.newCustomers,
    required this.averageOrderValue,
    required this.ordersByStatus,
    required this.revenueByPayment,
    required this.revenueByCategory,
    required this.series,
    required this.topProducts,
    required this.topCustomers,
    required this.lowStock,
    required this.totalProducts,
    required this.totalCustomers,
    required this.lifetimeRevenue,
    required this.pendingCount,
  });

  /// نسبة نمو الإيراد مقارنة بالفترة السابقة.
  double get revenueGrowth {
    if (previousRevenue == 0) return revenue > 0 ? 100 : 0;
    return ((revenue - previousRevenue) / previousRevenue) * 100;
  }

  double get ordersGrowth {
    if (previousOrdersCount == 0) return ordersCount > 0 ? 100 : 0;
    return ((ordersCount - previousOrdersCount) / previousOrdersCount) * 100;
  }
}

/// يحسب كل أرقام لوحة التحكم من الطلبات المخزّنة.
class ReportsRepository {
  ReportsRepository(this._store);

  final LocalStore _store;

  Future<DashboardReport> build(ReportRange range) async {
    final orders = _store.orders();
    final products = _store.products();
    final users = _store.users().where((u) => !u.isAdmin).toList();
    final categories = {for (final c in _store.categories()) c.id: c.name};
    final productCategory = {for (final p in products) p.id: p.categoryId};

    final now = DateTime.now();
    final start = range == ReportRange.all
        ? DateTime(2000)
        : DateTime(now.year, now.month, now.day)
            .subtract(Duration(days: range.days - 1));
    final previousStart = start.subtract(Duration(days: range.days));

    bool inCurrent(Order o) => !o.createdAt.isBefore(start);
    bool inPrevious(Order o) =>
        !o.createdAt.isBefore(previousStart) && o.createdAt.isBefore(start);

    final current = orders.where(inCurrent).toList();
    final previous = orders.where(inPrevious).toList();

    final currentPaid =
        current.where((o) => o.status.countsAsRevenue).toList();
    final previousPaid =
        previous.where((o) => o.status.countsAsRevenue).toList();

    final revenue = currentPaid.fold<double>(0, (sum, o) => sum + o.total);
    final previousRevenue =
        previousPaid.fold<double>(0, (sum, o) => sum + o.total);
    final itemsSold =
        currentPaid.fold<int>(0, (sum, o) => sum + o.itemsCount);

    // توزيع الحالات
    final ordersByStatus = <OrderStatus, int>{
      for (final status in OrderStatus.values) status: 0,
    };
    for (final order in current) {
      ordersByStatus[order.status] = (ordersByStatus[order.status] ?? 0) + 1;
    }

    // توزيع طرق الدفع
    final revenueByPayment = <PaymentMethod, double>{};
    for (final order in currentPaid) {
      revenueByPayment[order.paymentMethod] =
          (revenueByPayment[order.paymentMethod] ?? 0) + order.total;
    }

    // إيراد كل تصنيف
    final revenueByCategory = <String, double>{};
    for (final order in currentPaid) {
      for (final item in order.items) {
        final categoryId = productCategory[item.productId];
        final name = categories[categoryId] ?? 'غير مصنّف';
        revenueByCategory[name] = (revenueByCategory[name] ?? 0) + item.total;
      }
    }

    // منحنى المبيعات
    final series = _buildSeries(currentPaid, range, start, now);

    // الأكثر مبيعاً
    final quantities = <String, int>{};
    final revenues = <String, double>{};
    final names = <String, String>{};
    for (final order in currentPaid) {
      for (final item in order.items) {
        quantities[item.productId] =
            (quantities[item.productId] ?? 0) + item.quantity;
        revenues[item.productId] =
            (revenues[item.productId] ?? 0) + item.total;
        names[item.productId] = item.name;
      }
    }
    final stocks = {for (final p in products) p.id: p.stock};
    final topProducts = quantities.keys
        .map((id) => ProductSales(
              productId: id,
              name: names[id] ?? '—',
              quantity: quantities[id] ?? 0,
              revenue: revenues[id] ?? 0,
              stock: stocks[id] ?? 0,
            ))
        .toList()
      ..sort((a, b) => b.revenue.compareTo(a.revenue));

    // أفضل العملاء
    final customerOrders = <String, int>{};
    final customerSpent = <String, double>{};
    for (final order in currentPaid) {
      customerOrders[order.userId] = (customerOrders[order.userId] ?? 0) + 1;
      customerSpent[order.userId] =
          (customerSpent[order.userId] ?? 0) + order.total;
    }
    final userIndex = {for (final u in users) u.id: u};
    final topCustomers = customerSpent.keys
        .map((id) => CustomerSales(
              userId: id,
              name: userIndex[id]?.name ?? 'عميل',
              phone: userIndex[id]?.phone ?? '',
              orders: customerOrders[id] ?? 0,
              spent: customerSpent[id] ?? 0,
            ))
        .toList()
      ..sort((a, b) => b.spent.compareTo(a.spent));

    final lowStock = products
        .where((p) => p.isActive && p.stock <= 5)
        .toList()
      ..sort((a, b) => a.stock.compareTo(b.stock));

    return DashboardReport(
      range: range,
      revenue: revenue,
      previousRevenue: previousRevenue,
      ordersCount: current.length,
      previousOrdersCount: previous.length,
      itemsSold: itemsSold,
      newCustomers:
          users.where((u) => !u.createdAt.isBefore(start)).length,
      averageOrderValue:
          currentPaid.isEmpty ? 0 : revenue / currentPaid.length,
      ordersByStatus: ordersByStatus,
      revenueByPayment: revenueByPayment,
      revenueByCategory: revenueByCategory,
      series: series,
      topProducts: topProducts.take(10).toList(),
      topCustomers: topCustomers.take(10).toList(),
      lowStock: lowStock.take(10).toList(),
      totalProducts: products.where((p) => p.isActive).length,
      totalCustomers: users.length,
      lifetimeRevenue: orders
          .where((o) => o.status.countsAsRevenue)
          .fold<double>(0, (sum, o) => sum + o.total),
      pendingCount: orders.where((o) => o.status.isOpen).length,
    );
  }

  List<SalesPoint> _buildSeries(
    List<Order> orders,
    ReportRange range,
    DateTime start,
    DateTime now,
  ) {
    // للفترات الطويلة نجمّع بالشهر، وللقصيرة باليوم.
    final byMonth = range == ReportRange.year || range == ReportRange.all;
    final buckets = <DateTime, List<Order>>{};

    if (byMonth) {
      final months = range == ReportRange.all ? 12 : 12;
      for (var i = months - 1; i >= 0; i--) {
        final key = DateTime(now.year, now.month - i);
        buckets[key] = [];
      }
      for (final order in orders) {
        final key = DateTime(order.createdAt.year, order.createdAt.month);
        if (buckets.containsKey(key)) buckets[key]!.add(order);
      }
    } else {
      final days = range.days.clamp(1, 90);
      for (var i = days - 1; i >= 0; i--) {
        final day = DateTime(now.year, now.month, now.day)
            .subtract(Duration(days: i));
        buckets[day] = [];
      }
      for (final order in orders) {
        final key = DateTime(
          order.createdAt.year,
          order.createdAt.month,
          order.createdAt.day,
        );
        if (buckets.containsKey(key)) buckets[key]!.add(order);
      }
    }

    final points = buckets.entries
        .map(
          (entry) => SalesPoint(
            date: entry.key,
            revenue: entry.value.fold<double>(0, (sum, o) => sum + o.total),
            orders: entry.value.length,
          ),
        )
        .toList()
      ..sort((a, b) => a.date.compareTo(b.date));
    return points;
  }

  /// تصدير الطلبات كـ CSV (يتنسخ أو يتبعت للمحاسبة).
  Future<String> exportOrdersCsv(ReportRange range) async {
    final now = DateTime.now();
    final start = range == ReportRange.all
        ? DateTime(2000)
        : DateTime(now.year, now.month, now.day)
            .subtract(Duration(days: range.days - 1));

    final rows = <String>[
      'رقم الطلب,التاريخ,العميل,الموبايل,المحافظة,عدد الأصناف,'
          'المجموع,الشحن,الخصم,الإجمالي,طريقة الدفع,الحالة',
    ];
    for (final order in _store.orders()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt))) {
      if (order.createdAt.isBefore(start)) continue;
      rows.add([
        order.orderNumber,
        order.createdAt.toIso8601String().substring(0, 10),
        order.customerName.replaceAll(',', ' '),
        order.customerPhone,
        order.address.governorate,
        order.itemsCount,
        order.subtotal.toStringAsFixed(2),
        order.shipping.toStringAsFixed(2),
        order.discount.toStringAsFixed(2),
        order.total.toStringAsFixed(2),
        order.paymentMethod.labelAr,
        order.status.labelAr,
      ].join(','));
    }
    return rows.join('\n');
  }
}
