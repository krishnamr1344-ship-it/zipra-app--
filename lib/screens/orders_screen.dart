import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../services/api_service.dart';
import '../models/order.dart';
import 'order_detail_screen.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  final _api = ApiService();
  List<Order> _orders = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  Future<void> _loadOrders() async {
    setState(() => _loading = true);
    try {
      final res = await _api.get('/orders/my');
      final list = res['orders'] as List<dynamic>? ?? [];
      setState(() {
        _orders = list.map((e) => Order.fromJson(e as Map<String, dynamic>)).toList();
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  IconData _statusIcon(String status) {
    switch (status) {
      case 'placed': return Icons.receipt_long;
      case 'accepted': return Icons.check_circle;
      case 'preparing': return Icons.restaurant;
      case 'out_for_delivery': return Icons.delivery_dining;
      case 'delivered': return Icons.verified;
      case 'cancelled': return Icons.cancel;
      default: return Icons.receipt_long;
    }
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'delivered': return Colors.green;
      case 'cancelled': return Colors.red;
      case 'out_for_delivery': return AppTheme.primaryOrange;
      default: return AppTheme.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('My Orders')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _orders.isEmpty
              ? const Center(child: Text('No orders yet', style: TextStyle(fontSize: 16, color: AppTheme.grey)))
              : RefreshIndicator(
                  onRefresh: _loadOrders,
                  child: ListView.builder(
                    padding: const EdgeInsets.only(top: 8),
                    itemCount: _orders.length,
                    itemBuilder: (context, index) {
                      final order = _orders[index];
                      return Card(
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(12),
                          leading: CircleAvatar(
                            backgroundColor: _statusColor(order.status).withValues(alpha: 0.1),
                            child: Icon(_statusIcon(order.status), color: _statusColor(order.status)),
                          ),
                          title: Text('Order #${order.id.substring(0, 8)}', style: const TextStyle(fontWeight: FontWeight.w600)),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 4),
                              Text(order.statusLabel, style: TextStyle(color: _statusColor(order.status), fontWeight: FontWeight.w500)),
                              const SizedBox(height: 2),
                              Text('₹${order.totalAmount.toStringAsFixed(0)} • ${order.items.length} items', style: const TextStyle(color: AppTheme.grey, fontSize: 13)),
                            ],
                          ),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () => Navigator.push(context, MaterialPageRoute(
                            builder: (_) => OrderDetailScreen(order: order),
                          )).then((_) => _loadOrders()),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
