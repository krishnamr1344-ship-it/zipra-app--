import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/order.dart';

class OrderDetailScreen extends StatelessWidget {
  final Order order;
  const OrderDetailScreen({super.key, required this.order});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Order #${order.id.substring(0, 8)}')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Order Status', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            _buildStatusTracker(),
            const SizedBox(height: 24),
            const Text('Items', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ...order.items.map((item) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(child: Text('${item.productName} x${item.quantity}')),
                  Text('₹${(item.price * item.quantity).toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w600)),
                ],
              ),
            )),
            const Divider(thickness: 1),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Total', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                Text('₹${order.totalAmount.toStringAsFixed(0)}', style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.primaryOrange)),
              ],
            ),
            if (order.deliveryAddress.isNotEmpty) ...[
              const SizedBox(height: 24),
              const Text('Delivery Address', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text(order.deliveryAddress, style: const TextStyle(color: AppTheme.grey)),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildStatusTracker() {
    const statuses = [
      {'label': 'Placed', 'icon': Icons.receipt_long},
      {'label': 'Accepted', 'icon': Icons.check_circle},
      {'label': 'Preparing', 'icon': Icons.restaurant},
      {'label': 'Out for\nDelivery', 'icon': Icons.delivery_dining},
      {'label': 'Delivered', 'icon': Icons.verified},
    ];

    final currentIndex = order.statusIndex;

    return Row(
      children: List.generate(statuses.length * 2 - 1, (index) {
        if (index.isOdd) {
          return Expanded(
            child: Container(
              height: 3,
              color: index ~/ 2 < currentIndex ? AppTheme.primaryOrange : AppTheme.lightGrey,
            ),
          );
        }
        final i = index ~/ 2;
        final complete = i <= currentIndex;
        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 36, height: 36,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: complete ? AppTheme.primaryOrange : AppTheme.lightGrey,
              ),
              child: Icon(
                statuses[i]['icon'] as IconData,
                size: 18,
                color: complete ? Colors.white : AppTheme.grey,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              statuses[i]['label'] as String,
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 10,
                color: complete ? AppTheme.primaryOrange : AppTheme.grey,
                fontWeight: complete ? FontWeight.w600 : FontWeight.normal,
              ),
            ),
          ],
        );
      }),
    );
  }
}
