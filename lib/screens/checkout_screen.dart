import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../services/api_service.dart';
import '../services/payment_service.dart';
import 'cart_screen.dart';
import 'orders_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _addressController = TextEditingController();
  final _api = ApiService();
  final _paymentService = PaymentService();
  bool _loading = false;

  @override
  void initState() {
    super.initState();
    _paymentService.init();
    _paymentService.onSuccess = _onPaymentSuccess;
    _paymentService.onError = _onPaymentError;
  }

  @override
  void dispose() {
    _addressController.dispose();
    _paymentService.dispose();
    super.dispose();
  }

  void _onPaymentSuccess(Map<String, dynamic> data) async {
    try {
      await _api.patch('/orders/${data['order_id']}/verify', data);
      CartScreen.clearCart();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payment successful! Order placed.'), backgroundColor: Colors.green),
        );
        Navigator.pushAndRemoveUntil(context, MaterialPageRoute(
          builder: (_) => const OrdersScreen(),
        ), (route) => false);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Verification failed: $e')),
        );
      }
    }
  }

  void _onPaymentError(String error) {
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error), backgroundColor: Colors.red),
      );
    }
    setState(() => _loading = false);
  }

  Future<void> _placeOrder() async {
    if (_addressController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter delivery address')),
      );
      return;
    }
    if (CartScreen.items.isEmpty) return;

    setState(() => _loading = true);

    try {
      final res = await _api.post('/orders', {
        'items': CartScreen.items.map((e) => {
          'product_id': e.product.id,
          'quantity': e.quantity,
          'price': e.product.price,
        }).toList(),
        'total_amount': CartScreen.total,
        'delivery_address': _addressController.text,
        'payment_method': 'online',
      });

      final orderId = res['order_id'] as String;
      final razorpayOrderId = res['razorpay_order_id'] as String;

      _paymentService.startPayment(
        amount: CartScreen.total,
        orderId: razorpayOrderId,
        email: 'user@zipra.app',
        phone: '9999999999',
        name: 'Customer',
      );
    } catch (e) {
      setState(() => _loading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Order failed: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Delivery Address', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            TextField(
              controller: _addressController,
              maxLines: 3,
              decoration: const InputDecoration(
                hintText: 'Enter your full address',
              ),
            ),
            const SizedBox(height: 24),
            const Text('Order Summary', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ...CartScreen.items.map((item) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(child: Text('${item.product.name} x${item.quantity}')),
                  Text('₹${item.totalPrice.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w600)),
                ],
              ),
            )),
            const Divider(thickness: 1),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Total', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                Text('₹${CartScreen.total.toStringAsFixed(0)}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.primaryOrange)),
              ],
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.lightGrey,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Row(
                children: [
                  Icon(Icons.lock, color: AppTheme.grey, size: 16),
                  SizedBox(width: 8),
                  Expanded(child: Text('Online payment via Razorpay (UPI, Card, NetBanking)', style: TextStyle(fontSize: 13, color: AppTheme.grey))),
                ],
              ),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _loading ? null : _placeOrder,
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16)),
                child: _loading
                    ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : const Text('Pay & Place Order', style: TextStyle(fontSize: 18)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
