import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/cart_item.dart';
import 'checkout_screen.dart';

class CartScreen extends StatelessWidget {
  const CartScreen({super.key});

  static List<CartItem> items = [];

  static void addItem(CartItem item) {
    final idx = items.indexWhere((e) => e.product.id == item.product.id);
    if (idx >= 0) {
      items[idx].quantity += item.quantity;
    } else {
      items.add(item);
    }
  }

  static void removeItem(String productId) {
    items.removeWhere((e) => e.product.id == productId);
  }

  static void clearCart() => items.clear();

  static double get total => items.fold(0, (sum, item) => sum + item.totalPrice);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Cart')),
      body: items.isEmpty
          ? const Center(child: Text('Cart is empty', style: TextStyle(fontSize: 16, color: AppTheme.grey)))
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.only(top: 8),
                    itemCount: items.length,
                    itemBuilder: (context, index) {
                      final item = items[index];
                      return Card(
                        child: Padding(
                          padding: const EdgeInsets.all(12),
                          child: Row(
                            children: [
                              Container(
                                width: 60, height: 60,
                                decoration: BoxDecoration(
                                  color: AppTheme.lightGrey,
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: item.product.imageUrl.isNotEmpty
                                    ? ClipRRect(
                                        borderRadius: BorderRadius.circular(8),
                                        child: Image.network(item.product.imageUrl, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.image, color: AppTheme.grey)),
                                      )
                                    : const Icon(Icons.image, color: AppTheme.grey),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item.product.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                                    const SizedBox(height: 4),
                                    Text('₹${item.product.price.toStringAsFixed(0)}', style: const TextStyle(color: AppTheme.primaryOrange, fontWeight: FontWeight.bold, fontSize: 16)),
                                  ],
                                ),
                              ),
                              Row(
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.remove_circle_outline, color: AppTheme.grey),
                                    onPressed: () {
                                      if (item.quantity > 1) {
                                        item.quantity--;
                                        (context as Element).markNeedsBuild();
                                      }
                                    },
                                  ),
                                  Text('${item.quantity}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                                  IconButton(
                                    icon: const Icon(Icons.add_circle_outline, color: AppTheme.primaryOrange),
                                    onPressed: () {
                                      item.quantity++;
                                      (context as Element).markNeedsBuild();
                                    },
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 8, offset: Offset(0, -2))],
                  ),
                  child: SafeArea(
                    child: Row(
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text('Total', style: TextStyle(color: AppTheme.grey, fontSize: 13)),
                              Text('₹${total.toStringAsFixed(0)}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                        ElevatedButton(
                          onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const CheckoutScreen())),
                          child: const Text('Proceed to Checkout'),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
    );
  }
}
