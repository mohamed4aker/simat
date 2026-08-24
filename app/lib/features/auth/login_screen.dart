import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../core/theme/app_colors.dart';
import '../../core/utils/validators.dart';
import '../../core/widgets/simat_logo.dart';
import '../../core/widgets/simat_pattern.dart';
import '../../data/repositories/auth_repository.dart';
import '../../providers/app_providers.dart';

/// تسجيل الدخول برقم الموبايل.
class LoginScreen extends ConsumerStatefulWidget {
  final String? redirect;
  const LoginScreen({super.key, this.redirect});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phone = TextEditingController();
  final _password = TextEditingController();
  bool _obscure = true;
  bool _loading = false;
  String? _error;

  @override
  void dispose() {
    _phone.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref.read(authControllerProvider.notifier).login(
            phone: _phone.text.trim(),
            password: _password.text,
          );
      if (!mounted) return;
      final user = ref.read(authControllerProvider);
      if (user != null && user.isAdmin) {
        context.go('/admin');
      } else {
        // لو كان جاي من مسار إداري وهو مش أدمن، نرجّعه للمتجر.
        final target = widget.redirect;
        final isAdminTarget = target?.startsWith('/admin') ?? false;
        context.go(isAdminTarget ? '/home' : (target ?? '/home'));
      }
    } on AuthException catch (e) {
      setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _fill(String phone, String password) {
    _phone.text = phone;
    _password.text = password;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SimatPattern(
        opacity: 0.07,
        spacing: 74,
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 420),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const SimatLogo(markSize: 82, latinSize: 24),
                      const SizedBox(height: 28),
                      Text(
                        'أهلاً بيك تاني',
                        textAlign: TextAlign.center,
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'سجّل دخولك عشان تكمّل طلبك وتتابع شحناتك',
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 13,
                          color: AppColors.textSecondary,
                        ),
                      ),
                      const SizedBox(height: 26),
                      TextFormField(
                        controller: _phone,
                        keyboardType: TextInputType.phone,
                        textDirection: TextDirection.ltr,
                        decoration: const InputDecoration(
                          labelText: 'رقم الموبايل',
                          hintText: '01012345678',
                          prefixIcon: Icon(Icons.phone_android_rounded),
                        ),
                        validator: (v) => Validators.required(
                          v,
                          field: 'رقم الموبايل',
                        ),
                      ),
                      const SizedBox(height: 14),
                      TextFormField(
                        controller: _password,
                        obscureText: _obscure,
                        decoration: InputDecoration(
                          labelText: 'كلمة السر',
                          prefixIcon: const Icon(Icons.lock_outline_rounded),
                          suffixIcon: IconButton(
                            onPressed: () =>
                                setState(() => _obscure = !_obscure),
                            icon: Icon(
                              _obscure
                                  ? Icons.visibility_outlined
                                  : Icons.visibility_off_outlined,
                            ),
                          ),
                        ),
                        validator: Validators.password,
                        onFieldSubmitted: (_) => _submit(),
                      ),
                      if (_error != null) ...[
                        const SizedBox(height: 14),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.danger.withValues(alpha: 0.08),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: AppColors.danger.withValues(alpha: 0.3),
                            ),
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.error_outline_rounded,
                                color: AppColors.danger,
                                size: 18,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _error!,
                                  style: const TextStyle(
                                    color: AppColors.danger,
                                    fontSize: 13,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                      const SizedBox(height: 22),
                      ElevatedButton(
                        onPressed: _loading ? null : _submit,
                        child: _loading
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.4,
                                  color: Colors.white,
                                ),
                              )
                            : const Text('تسجيل الدخول'),
                      ),
                      const SizedBox(height: 12),
                      OutlinedButton(
                        onPressed: () => context.push('/register'),
                        child: const Text('إنشاء حساب جديد'),
                      ),
                      const SizedBox(height: 10),
                      TextButton(
                        onPressed: () => context.go('/home'),
                        child: const Text('تصفّح المتجر من غير تسجيل'),
                      ),
                      const SizedBox(height: 18),
                      _DemoAccounts(onPick: _fill),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// حسابات جاهزة للتجربة — تُحذف عند الربط بالباك إند الحقيقي.
class _DemoAccounts extends StatelessWidget {
  final void Function(String phone, String password) onPick;

  const _DemoAccounts({required this.onPick});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.secondary.withValues(alpha: 0.45),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.divider),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.science_outlined,
                  size: 16, color: AppColors.accent),
              const SizedBox(width: 6),
              Text(
                'حسابات للتجربة',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.textPrimary,
                    ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          _row(context, 'أدمن', '01000000000', 'admin123',
              () => onPick('01000000000', 'admin123')),
          _row(context, 'عميل', '01011112222', '123456',
              () => onPick('01011112222', '123456')),
        ],
      ),
    );
  }

  Widget _row(
    BuildContext context,
    String label,
    String phone,
    String password,
    VoidCallback onTap,
  ) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 5),
        child: Row(
          children: [
            SizedBox(
              width: 44,
              child: Text(
                label,
                style: const TextStyle(
                  fontSize: 12.5,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primary,
                ),
              ),
            ),
            Text(
              '$phone  ·  $password',
              textDirection: TextDirection.ltr,
              style: const TextStyle(
                fontSize: 12.5,
                color: AppColors.textSecondary,
              ),
            ),
            const Spacer(),
            const Icon(Icons.touch_app_outlined,
                size: 15, color: AppColors.textMuted),
          ],
        ),
      ),
    );
  }
}
