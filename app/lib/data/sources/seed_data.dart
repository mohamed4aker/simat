import 'dart:math';

import '../models/models.dart';

/// البيانات الابتدائية للمتجر: تصنيفات، منتجات، مستخدمين، كوبونات،
/// وطلبات تاريخية عشان لوحة التقارير تبقى شغّالة من أول تشغيل.
class SeedData {
  SeedData._();

  static final DateTime _now = DateTime.now();

  static DateTime _daysAgo(int days) => _now.subtract(Duration(days: days));

  // ───────────────────────── التصنيفات ─────────────────────────

  static List<Category> categories() => const [
        Category(
          id: 'cat_oriental',
          name: 'عطور شرقية',
          nameEn: 'Oriental',
          description: 'دفء العنبر والعود والبخور',
          iconKey: 'flame',
          sortOrder: 1,
        ),
        Category(
          id: 'cat_french',
          name: 'عطور فرنسية',
          nameEn: 'French',
          description: 'أناقة زهرية وفواكه منعشة',
          iconKey: 'flower',
          sortOrder: 2,
        ),
        Category(
          id: 'cat_oud',
          name: 'عود ودهن',
          nameEn: 'Oud',
          description: 'دهن العود الخالص والمعتّق',
          iconKey: 'wood',
          sortOrder: 3,
        ),
        Category(
          id: 'cat_niche',
          name: 'نيتش فاخر',
          nameEn: 'Niche',
          description: 'توقيعات نادرة محدودة الإنتاج',
          iconKey: 'diamond',
          sortOrder: 4,
        ),
        Category(
          id: 'cat_body',
          name: 'بادي ميست وزيوت',
          nameEn: 'Body & Oils',
          description: 'عناية معطّرة خفيفة لليوم',
          iconKey: 'drop',
          sortOrder: 5,
        ),
        Category(
          id: 'cat_gift',
          name: 'أطقم وهدايا',
          nameEn: 'Gift Sets',
          description: 'علب مجهّزة للإهداء',
          iconKey: 'gift',
          sortOrder: 6,
        ),
      ];

  // ───────────────────────── المنتجات ─────────────────────────

  static List<Product> products() => [
        Product(
          id: 'p_001',
          name: 'سِمة الليل',
          nameEn: 'Simat Nuit',
          brand: 'SIMAT',
          categoryId: 'cat_oriental',
          description:
              'توقيع شرقي دافئ يفتح بالزعفران والهيل ثم يستقر على العنبر '
              'وخشب الصندل. مثالي لسهرات الشتاء والمناسبات المسائية.',
          price: 1450,
          oldPrice: 1750,
          sizeMl: 100,
          gender: Gender.unisex,
          concentration: Concentration.edp,
          topNotes: ['زعفران', 'هيل', 'برغموت'],
          heartNotes: ['ورد طائفي', 'ياسمين'],
          baseNotes: ['عنبر', 'صندل', 'مسك أبيض'],
          longevityHours: 12,
          stock: 34,
          rating: 4.8,
          ratingCount: 126,
          soldCount: 310,
          isFeatured: true,
          createdAt: _daysAgo(180),
        ),
        Product(
          id: 'p_002',
          name: 'عود ملكي',
          nameEn: 'Royal Oud',
          brand: 'SIMAT',
          categoryId: 'cat_oud',
          description:
              'دهن عود كمبودي معتّق بنسبة عالية، رائحة كثيفة تدوم على '
              'الملابس أياماً. يُستخدم بكميات قليلة جداً.',
          price: 3200,
          sizeMl: 12,
          gender: Gender.men,
          concentration: Concentration.oil,
          topNotes: ['عود كمبودي'],
          heartNotes: ['ورد بلغاري'],
          baseNotes: ['مسك', 'عنبر أسود'],
          longevityHours: 24,
          stock: 8,
          rating: 4.9,
          ratingCount: 64,
          soldCount: 96,
          isFeatured: true,
          createdAt: _daysAgo(160),
        ),
        Product(
          id: 'p_003',
          name: 'ياسمين القاهرة',
          nameEn: 'Cairo Jasmine',
          brand: 'SIMAT',
          categoryId: 'cat_french',
          description:
              'ياسمين مصري طبيعي بلمسة فانيليا ناعمة. عطر نهاري أنثوي '
              'خفيف ومناسب للعمل والخروجات الصباحية.',
          price: 890,
          sizeMl: 75,
          gender: Gender.women,
          concentration: Concentration.edp,
          topNotes: ['ليمون', 'كمثرى'],
          heartNotes: ['ياسمين', 'زهر البرتقال'],
          baseNotes: ['فانيليا', 'مسك'],
          longevityHours: 8,
          stock: 52,
          rating: 4.6,
          ratingCount: 203,
          soldCount: 480,
          isFeatured: true,
          createdAt: _daysAgo(150),
        ),
        Product(
          id: 'p_004',
          name: 'أمبر نوار',
          nameEn: 'Ambre Noir',
          brand: 'SIMAT',
          categoryId: 'cat_niche',
          description:
              'عنبر أسود مدخّن مع جلد ولبان. توقيع نيتش جريء لمن يبحث '
              'عن حضور مختلف تماماً.',
          price: 2450,
          oldPrice: 2800,
          sizeMl: 50,
          gender: Gender.unisex,
          concentration: Concentration.parfum,
          topNotes: ['لبان', 'فلفل أسود'],
          heartNotes: ['جلد', 'ورد'],
          baseNotes: ['عنبر أسود', 'باتشولي', 'فيتيفر'],
          longevityHours: 16,
          stock: 15,
          rating: 4.7,
          ratingCount: 48,
          soldCount: 87,
          isFeatured: true,
          createdAt: _daysAgo(120),
        ),
        Product(
          id: 'p_005',
          name: 'مسك الطهارة',
          nameEn: 'White Musk',
          brand: 'SIMAT',
          categoryId: 'cat_body',
          description:
              'مسك أبيض نقي بزيت خفيف، رائحة نظيفة وهادئة تناسب الاستخدام '
              'اليومي وتحت الملابس.',
          price: 320,
          sizeMl: 30,
          gender: Gender.women,
          concentration: Concentration.oil,
          topNotes: ['مسك أبيض'],
          heartNotes: ['زهر القطن'],
          baseNotes: ['خشب الأرز'],
          longevityHours: 6,
          stock: 120,
          rating: 4.5,
          ratingCount: 310,
          soldCount: 920,
          createdAt: _daysAgo(140),
        ),
        Product(
          id: 'p_006',
          name: 'صحراء',
          nameEn: 'Sahara',
          brand: 'SIMAT',
          categoryId: 'cat_oriental',
          description:
              'رمال دافئة وبخور خفيف مع توابل جافة. عطر رجالي يعطي إحساس '
              'الغروب في الصحراء.',
          price: 1180,
          sizeMl: 100,
          gender: Gender.men,
          concentration: Concentration.edp,
          topNotes: ['قرفة', 'جوزة الطيب'],
          heartNotes: ['بخور', 'مرمية'],
          baseNotes: ['خشب الأرز', 'عنبر'],
          longevityHours: 10,
          stock: 41,
          rating: 4.4,
          ratingCount: 88,
          soldCount: 205,
          createdAt: _daysAgo(110),
        ),
        Product(
          id: 'p_007',
          name: 'روز دو ماي',
          nameEn: 'Rose de Mai',
          brand: 'SIMAT',
          categoryId: 'cat_french',
          description:
              'ورد مايو الفرنسي في أنقى صوره، مع ليتشي وفاوانيا. عطر '
              'رومانسي راقٍ.',
          price: 1650,
          sizeMl: 90,
          gender: Gender.women,
          concentration: Concentration.edp,
          topNotes: ['ليتشي', 'برغموت'],
          heartNotes: ['ورد مايو', 'فاوانيا'],
          baseNotes: ['مسك', 'باتشولي ناعم'],
          longevityHours: 9,
          stock: 27,
          rating: 4.8,
          ratingCount: 141,
          soldCount: 262,
          isFeatured: true,
          createdAt: _daysAgo(100),
        ),
        Product(
          id: 'p_008',
          name: 'عود أزرق',
          nameEn: 'Blue Oud',
          brand: 'SIMAT',
          categoryId: 'cat_oud',
          description:
              'عود ممزوج بنوتات بحرية منعشة — تركيبة عصرية تكسر ثقل العود '
              'التقليدي وتناسب النهار.',
          price: 1950,
          sizeMl: 100,
          gender: Gender.men,
          concentration: Concentration.edp,
          topNotes: ['نوتات بحرية', 'جريب فروت'],
          heartNotes: ['عود', 'لافندر'],
          baseNotes: ['عنبر', 'مسك'],
          longevityHours: 11,
          stock: 22,
          rating: 4.6,
          ratingCount: 73,
          soldCount: 149,
          createdAt: _daysAgo(90),
        ),
        Product(
          id: 'p_009',
          name: 'فانيليا مدغشقر',
          nameEn: 'Madagascar Vanilla',
          brand: 'SIMAT',
          categoryId: 'cat_body',
          description:
              'بادي ميست فانيليا كريمية مع كراميل خفيف، إحساس دافئ ومريح '
              'طول اليوم.',
          price: 260,
          oldPrice: 340,
          sizeMl: 250,
          gender: Gender.women,
          concentration: Concentration.mist,
          topNotes: ['كراميل'],
          heartNotes: ['فانيليا بوربون'],
          baseNotes: ['مسك ناعم'],
          longevityHours: 4,
          stock: 200,
          rating: 4.3,
          ratingCount: 420,
          soldCount: 1180,
          createdAt: _daysAgo(85),
        ),
        Product(
          id: 'p_010',
          name: 'أثر',
          nameEn: 'Athar',
          brand: 'SIMAT',
          categoryId: 'cat_niche',
          description:
              'إصدار محدود من 500 زجاجة فقط. تركيبة معقّدة من اللبان '
              'العُماني والإيريس والجلد الناعم.',
          price: 4100,
          sizeMl: 50,
          gender: Gender.unisex,
          concentration: Concentration.parfum,
          topNotes: ['لبان عُماني', 'إلمي'],
          heartNotes: ['إيريس', 'ورد تركي'],
          baseNotes: ['جلد', 'عود', 'مسك حيواني'],
          longevityHours: 20,
          stock: 5,
          rating: 5.0,
          ratingCount: 19,
          soldCount: 31,
          isFeatured: true,
          createdAt: _daysAgo(60),
        ),
        Product(
          id: 'p_011',
          name: 'طقم الأصالة',
          nameEn: 'Heritage Set',
          brand: 'SIMAT',
          categoryId: 'cat_gift',
          description:
              'علبة هدايا فاخرة تضم ٣ عطور بحجم ٣٠ مل: سِمة الليل، صحراء، '
              'وياسمين القاهرة — مع بطاقة إهداء.',
          price: 2100,
          oldPrice: 2600,
          sizeMl: 90,
          gender: Gender.unisex,
          concentration: Concentration.edp,
          topNotes: ['تشكيلة'],
          heartNotes: ['تشكيلة'],
          baseNotes: ['تشكيلة'],
          longevityHours: 10,
          stock: 18,
          rating: 4.9,
          ratingCount: 57,
          soldCount: 118,
          isFeatured: true,
          createdAt: _daysAgo(55),
        ),
        Product(
          id: 'p_012',
          name: 'بخور الحرم',
          nameEn: 'Haram Incense',
          brand: 'SIMAT',
          categoryId: 'cat_oriental',
          description:
              'مزيج بخور تقليدي بالعود والصندل والمستكة، رائحة روحانية '
              'هادئة للبيت والمجالس.',
          price: 540,
          sizeMl: 40,
          gender: Gender.unisex,
          concentration: Concentration.oil,
          topNotes: ['مستكة'],
          heartNotes: ['بخور', 'صندل'],
          baseNotes: ['عود'],
          longevityHours: 14,
          stock: 64,
          rating: 4.7,
          ratingCount: 165,
          soldCount: 390,
          createdAt: _daysAgo(50),
        ),
        Product(
          id: 'p_013',
          name: 'سيتروس فريش',
          nameEn: 'Citrus Fresh',
          brand: 'SIMAT',
          categoryId: 'cat_french',
          description:
              'انتعاش حمضي فوري: ليمون صقلي، نعناع، وخشب أبيض. الأفضل '
              'لصيف مصر الحار.',
          price: 720,
          sizeMl: 100,
          gender: Gender.men,
          concentration: Concentration.edt,
          topNotes: ['ليمون صقلي', 'نعناع'],
          heartNotes: ['زنجبيل', 'لافندر'],
          baseNotes: ['خشب أبيض', 'مسك'],
          longevityHours: 6,
          stock: 76,
          rating: 4.2,
          ratingCount: 232,
          soldCount: 510,
          createdAt: _daysAgo(45),
        ),
        Product(
          id: 'p_014',
          name: 'دهن ورد طائفي',
          nameEn: 'Taifi Rose Oil',
          brand: 'SIMAT',
          categoryId: 'cat_oud',
          description:
              'دهن ورد طائفي مقطّر بالطريقة التقليدية. قطرة واحدة تكفي '
              'وتدوم لساعات طويلة.',
          price: 2750,
          sizeMl: 6,
          gender: Gender.women,
          concentration: Concentration.oil,
          topNotes: ['ورد طائفي'],
          heartNotes: ['ورد طائفي'],
          baseNotes: ['مسك'],
          longevityHours: 18,
          stock: 11,
          rating: 4.9,
          ratingCount: 41,
          soldCount: 68,
          createdAt: _daysAgo(40),
        ),
        Product(
          id: 'p_015',
          name: 'كوكو نويل',
          nameEn: 'Coco Noel',
          brand: 'SIMAT',
          categoryId: 'cat_body',
          description:
              'زيت جوز الهند المعطّر بالفانيليا والتونكا — يرطّب البشرة '
              'ويترك أثراً حلواً.',
          price: 295,
          sizeMl: 100,
          gender: Gender.women,
          concentration: Concentration.oil,
          topNotes: ['جوز الهند'],
          heartNotes: ['تونكا'],
          baseNotes: ['فانيليا'],
          longevityHours: 5,
          stock: 145,
          rating: 4.4,
          ratingCount: 288,
          soldCount: 760,
          createdAt: _daysAgo(35),
        ),
        Product(
          id: 'p_016',
          name: 'إمبريال',
          nameEn: 'Imperial',
          brand: 'SIMAT',
          categoryId: 'cat_niche',
          description:
              'توقيع رجالي فخم بالتبغ والعسل والويسكي. عطر مناسبات مسائية '
              'بحضور طاغٍ.',
          price: 2980,
          sizeMl: 75,
          gender: Gender.men,
          concentration: Concentration.parfum,
          topNotes: ['برغموت', 'قرفة'],
          heartNotes: ['تبغ', 'عسل'],
          baseNotes: ['فانيليا', 'خشب مدخّن'],
          longevityHours: 15,
          stock: 13,
          rating: 4.8,
          ratingCount: 52,
          soldCount: 94,
          createdAt: _daysAgo(30),
        ),
        Product(
          id: 'p_017',
          name: 'طقم العروس',
          nameEn: 'Bridal Set',
          brand: 'SIMAT',
          categoryId: 'cat_gift',
          description:
              'علبة أنيقة تضم عطر روز دو ماي ١٠٠ مل + بادي ميست + دهن ورد '
              'صغير، مغلّفة بالساتان.',
          price: 2650,
          sizeMl: 100,
          gender: Gender.women,
          concentration: Concentration.edp,
          topNotes: ['ورد'],
          heartNotes: ['ياسمين'],
          baseNotes: ['مسك'],
          longevityHours: 10,
          stock: 9,
          rating: 4.9,
          ratingCount: 34,
          soldCount: 61,
          createdAt: _daysAgo(25),
        ),
        Product(
          id: 'p_018',
          name: 'نسيم البحر',
          nameEn: 'Sea Breeze',
          brand: 'SIMAT',
          categoryId: 'cat_french',
          description:
              'نوتات مائية وملح البحر مع خشب طافٍ — عطر صيفي خفيف للجنسين.',
          price: 680,
          sizeMl: 100,
          gender: Gender.unisex,
          concentration: Concentration.edt,
          topNotes: ['ملح البحر', 'برغموت'],
          heartNotes: ['نوتات مائية', 'ميرمية'],
          baseNotes: ['خشب طافٍ', 'مسك'],
          longevityHours: 6,
          stock: 88,
          rating: 4.1,
          ratingCount: 176,
          soldCount: 402,
          createdAt: _daysAgo(20),
        ),
        Product(
          id: 'p_019',
          name: 'زعفران رويال',
          nameEn: 'Saffron Royal',
          brand: 'SIMAT',
          categoryId: 'cat_oriental',
          description:
              'زعفران إيراني فاخر مع جلد وعنبر. تركيبة غنية جداً تحتاج '
              'بختين بس.',
          price: 1890,
          sizeMl: 75,
          gender: Gender.unisex,
          concentration: Concentration.edp,
          topNotes: ['زعفران', 'جوزة الطيب'],
          heartNotes: ['جلد', 'ورد'],
          baseNotes: ['عنبر', 'عود'],
          longevityHours: 13,
          stock: 0,
          rating: 4.7,
          ratingCount: 97,
          soldCount: 188,
          createdAt: _daysAgo(15),
        ),
        Product(
          id: 'p_020',
          name: 'سِمة إيديشن ٢٠٢٦',
          nameEn: 'Simat Edition 2026',
          brand: 'SIMAT',
          categoryId: 'cat_niche',
          description:
              'الإصدار السنوي الجديد: إيريس ودود وفلفل وردي في زجاجة '
              'مرقّمة يدوياً.',
          price: 3450,
          sizeMl: 100,
          gender: Gender.unisex,
          concentration: Concentration.parfum,
          topNotes: ['فلفل وردي', 'برغموت'],
          heartNotes: ['إيريس', 'ورد'],
          baseNotes: ['دود', 'مسك', 'صندل'],
          longevityHours: 14,
          stock: 24,
          rating: 4.9,
          ratingCount: 12,
          soldCount: 23,
          isFeatured: true,
          createdAt: _daysAgo(6),
        ),
      ];

  // ───────────────────────── المستخدمون ─────────────────────────

  static List<AppUser> users() => [
        AppUser(
          id: 'u_admin',
          name: 'مسؤول سِمة',
          phone: '01000000000',
          email: 'admin@simat.store',
          password: 'admin123',
          role: UserRole.admin,
          createdAt: _daysAgo(200),
        ),
        demoCustomer(),
        ..._demoCustomers(),
      ];

  /// حساب العميل التجريبي (اللي بيتعرض في شاشة الدخول).
  static AppUser demoCustomer() => AppUser(
        id: 'u_demo',
        name: 'أحمد محمود',
        phone: '01011112222',
        email: 'ahmed@example.com',
        password: '123456',
        createdAt: _daysAgo(120),
        addresses: const [
          Address(
            id: 'a_demo_1',
            label: 'المنزل',
            fullName: 'أحمد محمود',
            phone: '01011112222',
            governorate: 'القاهرة',
            city: 'مدينة نصر',
            street: 'شارع عباس العقاد',
            building: '24',
            isDefault: true,
          ),
        ],
      );

  static const List<String> _customerNames = [
    'منى سعيد',
    'كريم عبد الله',
    'سارة الشناوي',
    'يوسف حسن',
    'نورهان فتحي',
    'محمد الشريف',
    'دينا مصطفى',
    'عمرو خالد',
    'ليلى إبراهيم',
    'طارق سليم',
    'هبة زكي',
    'أدهم رأفت',
  ];

  static const List<List<String>> _customerPlaces = [
    ['القاهرة', 'المعادي', 'شارع ٩'],
    ['الجيزة', 'الدقي', 'شارع التحرير'],
    ['الإسكندرية', 'سموحة', 'شارع فوزي معاذ'],
    ['القليوبية', 'بنها', 'شارع فريد ندا'],
    ['الدقهلية', 'المنصورة', 'شارع الجمهورية'],
    ['الشرقية', 'الزقازيق', 'شارع القومية'],
  ];

  static List<AppUser> _demoCustomers() {
    return List.generate(_customerNames.length, (i) {
      final place = _customerPlaces[i % _customerPlaces.length];
      final phone = '0101${(2000000 + i * 13457).toString().padLeft(7, '0')}';
      return AppUser(
        id: 'u_c${i + 1}',
        name: _customerNames[i],
        phone: phone,
        email: 'customer${i + 1}@example.com',
        password: '123456',
        createdAt: _daysAgo(190 - i * 8),
        addresses: [
          Address(
            id: 'a_c${i + 1}',
            fullName: _customerNames[i],
            phone: phone,
            governorate: place[0],
            city: place[1],
            street: place[2],
            building: '${5 + i}',
            isDefault: true,
          ),
        ],
      );
    });
  }

  // ───────────────────────── الكوبونات ─────────────────────────

  static List<Coupon> coupons() => [
        Coupon(
          code: 'SIMAT10',
          type: DiscountType.percent,
          value: 10,
          minOrder: 800,
          maxDiscount: 400,
          expiresAt: _now.add(const Duration(days: 90)),
          usageLimit: 500,
          usedCount: 128,
        ),
        Coupon(
          code: 'WELCOME50',
          type: DiscountType.fixed,
          value: 50,
          minOrder: 300,
          expiresAt: _now.add(const Duration(days: 180)),
          usageLimit: 0,
          usedCount: 340,
        ),
        Coupon(
          code: 'OUD15',
          type: DiscountType.percent,
          value: 15,
          minOrder: 2000,
          maxDiscount: 700,
          expiresAt: _now.add(const Duration(days: 30)),
          usageLimit: 100,
          usedCount: 22,
        ),
      ];

  // ───────────────────────── التقييمات ─────────────────────────

  static const List<String> _comments = [
    'ثبات ممتاز والرائحة فخمة جداً، هطلب تاني أكيد.',
    'الرائحة حلوة بس الثبات أقل من المتوقع شوية.',
    'التغليف راقي والتوصيل كان سريع. تسلم إيديكم.',
    'أفضل عطر جربته من فترة طويلة، بجد يستاهل.',
    'كويس للسعر ده، بس مش هيناسب الصيف.',
    'اشتريته هدية والشخص انبسط جداً بيه.',
  ];

  static List<Review> reviews() {
    final rnd = Random(7);
    final all = products();
    final customers = _demoCustomers();
    final list = <Review>[];
    var counter = 0;
    for (final product in all) {
      final count = 2 + rnd.nextInt(3);
      for (var i = 0; i < count; i++) {
        final customer = customers[rnd.nextInt(customers.length)];
        counter++;
        list.add(
          Review(
            id: 'r_$counter',
            productId: product.id,
            userId: customer.id,
            userName: customer.name,
            rating: (3 + rnd.nextInt(3)).toDouble(),
            comment: _comments[rnd.nextInt(_comments.length)],
            createdAt: _daysAgo(rnd.nextInt(120) + 1),
          ),
        );
      }
    }
    return list;
  }

  // ───────────────────────── الطلبات التاريخية ─────────────────────────

  /// يولّد طلبات موزّعة على آخر ٦ شهور — أساس تقارير الأدمن.
  static List<Order> orders() {
    final rnd = Random(42);
    final catalog = products().where((p) => p.isActive).toList();
    // العميل التجريبي بيتحط مرتين عشان يبقى عنده تاريخ طلبات واضح.
    final customers = [
      demoCustomer(),
      demoCustomer(),
      ..._demoCustomers(),
    ];
    final orders = <Order>[];

    const totalOrders = 140;
    for (var i = 0; i < totalOrders; i++) {
      // كثافة أعلى للطلبات الحديثة (نمو تدريجي في المبيعات).
      final daysAgo = (pow(rnd.nextDouble(), 1.6) * 175).round();
      final createdAt = _daysAgo(daysAgo).add(
        Duration(hours: rnd.nextInt(12) + 9, minutes: rnd.nextInt(60)),
      );

      final customer = customers[rnd.nextInt(customers.length)];
      final address = customer.addresses.first;

      final itemsCount = 1 + rnd.nextInt(3);
      final items = <CartItem>[];
      final picked = <String>{};
      for (var j = 0; j < itemsCount; j++) {
        final product = catalog[rnd.nextInt(catalog.length)];
        if (!picked.add(product.id)) continue;
        items.add(
          CartItem.fromProduct(product, quantity: 1 + rnd.nextInt(2)),
        );
      }
      if (items.isEmpty) continue;

      final subtotal = items.fold<double>(0, (sum, e) => sum + e.total);
      final shipping = subtotal >= 1500 ? 0.0 : (50 + rnd.nextInt(6) * 10).toDouble();
      final useCoupon = rnd.nextInt(5) == 0;
      final discount = useCoupon ? (subtotal * 0.1).roundToDouble() : 0.0;

      final status = _statusForAge(daysAgo, rnd);
      final orderNumber =
          'SM-${createdAt.year}${createdAt.month.toString().padLeft(2, '0')}'
          '-${(1000 + i).toString()}';

      orders.add(
        Order(
          id: 'o_${i + 1}',
          orderNumber: orderNumber,
          userId: customer.id,
          customerName: customer.name,
          customerPhone: customer.phone,
          items: items,
          address: address,
          paymentMethod: PaymentMethod
              .values[rnd.nextInt(PaymentMethod.values.length)],
          status: status,
          subtotal: subtotal,
          shipping: shipping,
          discount: discount,
          couponCode: useCoupon ? 'SIMAT10' : null,
          createdAt: createdAt,
          updatedAt: createdAt.add(Duration(days: rnd.nextInt(3))),
          timeline: [
            OrderEvent(status: OrderStatus.pending, at: createdAt),
            if (status != OrderStatus.pending)
              OrderEvent(
                status: status,
                at: createdAt.add(Duration(days: 1 + rnd.nextInt(3))),
              ),
          ],
        ),
      );
    }

    orders.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return orders;
  }

  static OrderStatus _statusForAge(int daysAgo, Random rnd) {
    if (daysAgo > 10) {
      final roll = rnd.nextInt(100);
      if (roll < 86) return OrderStatus.delivered;
      if (roll < 95) return OrderStatus.cancelled;
      return OrderStatus.returned;
    }
    if (daysAgo > 5) {
      return rnd.nextInt(10) < 8 ? OrderStatus.delivered : OrderStatus.shipped;
    }
    if (daysAgo > 2) {
      return rnd.nextInt(2) == 0 ? OrderStatus.shipped : OrderStatus.preparing;
    }
    return rnd.nextInt(2) == 0 ? OrderStatus.pending : OrderStatus.confirmed;
  }
}
