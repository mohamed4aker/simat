import 'package:uuid/uuid.dart';

import '../models/models.dart';
import '../sources/local_store.dart';

/// خطأ مصادقة برسالة عربية جاهزة للعرض.
class AuthException implements Exception {
  final String message;
  const AuthException(this.message);
  @override
  String toString() => message;
}

/// إدارة الحسابات والجلسة.
///
/// في النسخة المحلية كلمة السر متخزّنة على الجهاز للتجربة فقط.
/// عند الربط بالباك إند: التسجيل والدخول بيتم على الخادم و التطبيق
/// بيحتفظ بالتوكن بس.
class AuthRepository {
  AuthRepository(this._store);

  final LocalStore _store;
  static const _uuid = Uuid();

  AppUser? currentUser() {
    final session = _store.readMap(LocalStore.kSession);
    final userId = session?['userId'] as String?;
    if (userId == null) return null;
    return _findById(userId);
  }

  AppUser? _findById(String id) {
    for (final user in _store.users()) {
      if (user.id == id) return user;
    }
    return null;
  }

  Future<AppUser> login({
    required String phone,
    required String password,
  }) async {
    final users = _store.users();
    final normalized = phone.trim();
    AppUser? match;
    for (final user in users) {
      if (user.phone == normalized || user.email == normalized) {
        match = user;
        break;
      }
    }
    if (match == null) {
      throw const AuthException('مفيش حساب مسجّل بالبيانات دي');
    }
    if (match.password != password) {
      throw const AuthException('كلمة السر غير صحيحة');
    }
    if (match.isBlocked) {
      throw const AuthException('الحساب موقوف، تواصل مع خدمة العملاء');
    }
    await _store.writeMap(LocalStore.kSession, {'userId': match.id});
    return match;
  }

  Future<AppUser> register({
    required String name,
    required String phone,
    required String password,
    String email = '',
  }) async {
    final users = _store.users();
    final normalized = phone.trim();
    final exists = users.any((u) => u.phone == normalized);
    if (exists) {
      throw const AuthException('الرقم ده مسجّل قبل كده، سجّل دخول');
    }
    final user = AppUser(
      id: 'u_${_uuid.v4().substring(0, 8)}',
      name: name.trim(),
      phone: normalized,
      email: email.trim(),
      password: password,
      createdAt: DateTime.now(),
    );
    users.add(user);
    await _store.saveUsers(users);
    await _store.writeMap(LocalStore.kSession, {'userId': user.id});
    return user;
  }

  Future<void> logout() => _store.remove(LocalStore.kSession);

  Future<AppUser> updateUser(AppUser user) async {
    final users = _store.users();
    final index = users.indexWhere((u) => u.id == user.id);
    if (index == -1) {
      throw const AuthException('الحساب مش موجود');
    }
    users[index] = user;
    await _store.saveUsers(users);
    return user;
  }

  Future<AppUser> changePassword({
    required AppUser user,
    required String oldPassword,
    required String newPassword,
  }) async {
    if (user.password != oldPassword) {
      throw const AuthException('كلمة السر الحالية غير صحيحة');
    }
    return updateUser(user.copyWith(password: newPassword));
  }

  // ───────────── العناوين ─────────────

  Future<AppUser> saveAddress(AppUser user, Address address) async {
    final addresses = [...user.addresses];
    final index = addresses.indexWhere((a) => a.id == address.id);
    if (index == -1) {
      addresses.add(address);
    } else {
      addresses[index] = address;
    }
    final normalized = address.isDefault
        ? addresses
            .map((a) => a.copyWith(isDefault: a.id == address.id))
            .toList()
        : addresses;
    return updateUser(user.copyWith(addresses: normalized));
  }

  Future<AppUser> deleteAddress(AppUser user, String addressId) async {
    final addresses =
        user.addresses.where((a) => a.id != addressId).toList();
    return updateUser(user.copyWith(addresses: addresses));
  }

  String newAddressId() => 'a_${_uuid.v4().substring(0, 8)}';

  // ───────────── المفضلة ─────────────

  Future<AppUser> toggleFavorite(AppUser user, String productId) async {
    final favorites = [...user.favorites];
    if (favorites.contains(productId)) {
      favorites.remove(productId);
    } else {
      favorites.add(productId);
    }
    return updateUser(user.copyWith(favorites: favorites));
  }

  // ───────────── إدارة العملاء (أدمن) ─────────────

  Future<List<AppUser>> allUsers() async {
    final list = _store.users()
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return list;
  }

  Future<void> setBlocked(String userId, bool isBlocked) async {
    final users = _store.users();
    final index = users.indexWhere((u) => u.id == userId);
    if (index == -1) return;
    users[index] = users[index].copyWith(isBlocked: isBlocked);
    await _store.saveUsers(users);
  }
}
