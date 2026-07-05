import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../services/auth_service.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _authService = AuthService();
  bool _loading = false;
  bool _isRegister = false;
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _loginEmail() async {
    setState(() => _loading = true);
    final success = await _authService.loginWithEmail(
      _emailController.text,
      _passwordController.text,
    );
    setState(() => _loading = false);
    if (success && mounted) {
      Navigator.pushReplacement(context, MaterialPageRoute(
        builder: (_) => const HomeScreen(),
      ));
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid credentials')),
      );
    }
  }

  Future<void> _register() async {
    setState(() => _loading = true);
    final success = await _authService.register(
      _nameController.text,
      _emailController.text,
      _passwordController.text,
    );

    setState(() => _loading = false);
    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Registered! Please login')),
      );
      setState(() => _isRegister = false);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Registration failed')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 60),
              Icon(Icons.store, size: 80, color: AppTheme.primaryOrange),
              const SizedBox(height: 16),
              const Text('Zipra', style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text('Sign in with your email', style: TextStyle(fontSize: 16, color: AppTheme.grey)),
              const SizedBox(height: 48),
              if (_isRegister)
                TextField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: 'Full Name'),
                ),
              if (_isRegister) const SizedBox(height: 12),
              TextField(
                controller: _emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: const InputDecoration(labelText: 'Email'),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _passwordController,
                obscureText: true,
                decoration: const InputDecoration(labelText: 'Password'),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _loading ? null : (_isRegister ? _register : _loginEmail),
                  child: _loading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : Text(_isRegister ? 'Create Account' : 'Sign In', style: const TextStyle(fontSize: 16)),
                ),
              ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => setState(() => _isRegister = !_isRegister),
                child: Text(_isRegister ? 'Already have an account? Sign In' : "Don't have an account? Create one"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
