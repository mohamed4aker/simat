import 'address.dart';
import 'enums.dart';

/// مستخدم النظام — عميل أو مسؤول.
class AppUser {
  final String id;
  final String name;
  final String phone;
  final String email;

  /// كلمة السر — في النسخة التجريبية تُخزَّن محلياً.
  /// عند الربط بالباك إند تُدار من الخادم ولا تصل للتطبيق إطلاقاً.
  final String password;

  final UserRole role;
  final List<Address> addresses;
  final List<String> favorites;
  final DateTime createdAt;
  final bool isBlocked;

  const AppUser({
    required this.id,
    required this.name,
    required this.phone,
    this.email = '',
    required this.password,
    this.role = UserRole.customer,
    this.addresses = const [],
    this.favorites = const [],
    required this.createdAt,
    this.isBlocked = false,
  });

  bool get isAdmin => role == UserRole.admin;

  Address? get defaultAddress {
    if (addresses.isEmpty) return null;
    return addresses.firstWhere(
      (a) => a.isDefault,
      orElse: () => addresses.first,
    );
  }

  String get initials {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.isEmpty || parts.first.isEmpty) return '؟';
    if (parts.length == 1) return parts.first.substring(0, 1);
    return '${parts[0].substring(0, 1)}${parts[1].substring(0, 1)}';
  }

  AppUser copyWith({
    String? name,
    String? phone,
    String? email,
    String? password,
    UserRole? role,
    List<Address>? addresses,
    List<String>? favorites,
    bool? isBlocked,
  }) =>
      AppUser(
        id: id,
        name: name ?? this.name,
        phone: phone ?? this.phone,
        email: email ?? this.email,
        password: password ?? this.password,
        role: role ?? this.role,
        addresses: addresses ?? this.addresses,
        favorites: favorites ?? this.favorites,
        createdAt: createdAt,
        isBlocked: isBlocked ?? this.isBlocked,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'phone': phone,
        'email': email,
        'password': password,
        'role': role.name,
        'addresses': addresses.map((e) => e.toJson()).toList(),
        'favorites': favorites,
        'createdAt': createdAt.toIso8601String(),
        'isBlocked': isBlocked,
      };

  factory AppUser.fromJson(Map<String, dynamic> json) => AppUser(
        id: json['id'] as String,
        name: json['name'] as String? ?? '',
        phone: json['phone'] as String? ?? '',
        email: json['email'] as String? ?? '',
        password: json['password'] as String? ?? '',
        role: UserRole.fromName(json['role'] as String? ?? 'customer'),
        addresses: (json['addresses'] as List?)
                ?.map((e) => Address.fromJson(e as Map<String, dynamic>))
                .toList() ??
            const [],
        favorites: (json['favorites'] as List?)?.cast<String>() ?? const [],
        createdAt: DateTime.parse(json['createdAt'] as String),
        isBlocked: json['isBlocked'] as bool? ?? false,
      );
}
