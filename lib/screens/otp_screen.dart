import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../services/auth_service.dart';
import 'home_screen.dart';

class OtpScreen extends StatefulWidget {
  final String phone;
  const OtpScreen({super.key, required this.phone});

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen> {
  final _otpController = TextEditingController();
  final _authService = AuthService();
  bool _loading = false;

  Future<void> _verify() async {
    if (_otpController.text.length < 4) return;
    setState(() => _loading = true);
    try {
      await _authService.verifyOtp(widget.phone, _otpController.text);
      if (mounted) {
        Navigator.pushAndRemoveUntil(context, MaterialPageRoute(
          builder: (_) => const HomeScreen(),
        ), (route) => false);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString())),
        );
      }
    }
    if (mounted) setState(() => _loading = false);
  }

  @override
  void dispose() {
    _otpController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const SizedBox(height: 60),
              const Text('Verify OTP', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text('OTP sent to ${widget.phone}', style: const TextStyle(fontSize: 16, color: AppTheme.grey)),
              const SizedBox(height: 48),
              TextField(
                controller: _otpController,
                keyboardType: TextInputType.number,
                textAlign: TextAlign.center,
                maxLength: 6,
                style: const TextStyle(fontSize: 28, letterSpacing: 8),
                decoration: const InputDecoration(
                  labelText: 'Enter OTP',
                  counterText: '',
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _loading ? null : _verify,
                  child: _loading ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Verify & Login'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
