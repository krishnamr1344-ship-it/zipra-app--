import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../models/product.dart';
import '../screens/cart_screen.dart';
import '../models/cart_item.dart';

class ProductCard extends StatelessWidget {
  final Product product;
  const ProductCard({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: EdgeInsets.zero,
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => _showDetail(context),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: AppTheme.lightGrey,
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                ),
                child: product.imageUrl.isNotEmpty
                    ? ClipRRect(
                        borderRadius: const BorderRadius.vertical(top: Radius.circular(12)),
                        child: Image.network(product.imageUrl, fit: BoxFit.cover, errorBuilder: (_, __, ___) => const Icon(Icons.image, size: 48, color: AppTheme.grey)),
                      )
                    : const Icon(Icons.image, size: 48, color: AppTheme.grey),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14), maxLines: 1, overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 2),
                  Text(product.category, style: const TextStyle(color: AppTheme.grey, fontSize: 11)),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('₹${product.price.toStringAsFixed(0)}', style: const TextStyle(color: AppTheme.primaryOrange, fontWeight: FontWeight.bold, fontSize: 16)),
                      InkWell(
                        onTap: () {
                          CartScreen.addItem(CartItem(product: product));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Added to cart'), duration: Duration(seconds: 1)),
                          );
                        },
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: const BoxDecoration(
                            color: AppTheme.primaryOrange,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(Icons.add, color: Colors.white, size: 16),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showDetail(BuildContext context) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: AppTheme.grey, borderRadius: BorderRadius.circular(2)))),
            const SizedBox(height: 16),
            Text(product.name, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            Text('₹${product.price.toStringAsFixed(0)}', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.primaryOrange)),
            const SizedBox(height: 12),
            Text(product.description, style: const TextStyle(color: AppTheme.grey, fontSize: 15)),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  CartScreen.addItem(CartItem(product: product));
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Added to cart'), duration: Duration(seconds: 1)),
                  );
                },
                child: const Text('Add to Cart'),
              ),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}
