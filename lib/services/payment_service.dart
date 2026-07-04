import 'package:razorpay_flutter/razorpay_flutter.dart';

class PaymentService {
  Razorpay? _razorpay;
  void Function(Map<String, dynamic>)? onSuccess;
  void Function(String)? onError;

  void init() {
    _razorpay = Razorpay();
    _razorpay!.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handleSuccess);
    _razorpay!.on(Razorpay.EVENT_PAYMENT_ERROR, _handleError);
    _razorpay!.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  void dispose() {
    _razorpay?.clear();
    _razorpay = null;
  }

  Future<void> startPayment({
    required double amount,
    required String orderId,
    required String email,
    required String phone,
    required String name,
  }) async {
    final options = {
      'key': 'rzp_live_YOUR_KEY_HERE',
      'amount': (amount * 100).toInt(),
      'name': 'Zipra',
      'description': 'Order Payment',
      'order_id': orderId,
      'prefill': {
        'contact': phone,
        'email': email,
        'name': name,
      },
      'theme': {'color': '#FF6B35'},
      'method': {
        'netbanking': true,
        'card': true,
        'upi': true,
        'wallet': true,
      },
    };
    _razorpay?.open(options);
  }

  void _handleSuccess(PaymentSuccessResponse response) {
    onSuccess?.call({
      'payment_id': response.paymentId ?? '',
      'order_id': response.orderId ?? '',
      'signature': response.signature ?? '',
    });
  }

  void _handleError(PaymentFailureResponse response) {
    onError?.call(response.message ?? 'Payment failed');
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    onError?.call('External wallet: ${response.walletName}');
  }
}
