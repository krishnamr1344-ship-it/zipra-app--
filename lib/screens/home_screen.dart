import 'package:flutter/material.dart';
import '../config/theme.dart';
import '../services/api_service.dart';
import '../models/product.dart';
import '../widgets/product_card.dart';
import 'cart_screen.dart';
import 'orders_screen.dart';
import 'login_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _api = ApiService();
  List<Product> _products = [];
  bool _loading = true;
  String _selectedCategory = 'All';

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    try {
      final res = await _api.get('/products');
      final list = res['products'] as List<dynamic>? ?? [];
      setState(() {
        _products = list.map((e) => Product.fromJson(e as Map<String, dynamic>)).toList();
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  List<String> get _categories {
    final cats = _products.map((p) => p.category).toSet().toList();
    return ['All', ...cats];
  }

  List<Product> get _filteredProducts {
    if (_selectedCategory == 'All') return _products;
    return _products.where((p) => p.category == _selectedCategory).toList();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Zipra')),
      drawer: Drawer(
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            const DrawerHeader(
              decoration: BoxDecoration(color: AppTheme.primaryOrange),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Icon(Icons.store, size: 48, color: Colors.white),
                  SizedBox(height: 8),
                  Text('Zipra', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white)),
                  Text('Your Delivery Partner', style: TextStyle(color: Colors.white70)),
                ],
              ),
            ),
            ListTile(
              leading: const Icon(Icons.home),
              title: const Text('Home'),
              onTap: () => Navigator.pop(context),
            ),
            ListTile(
              leading: const Icon(Icons.shopping_cart),
              title: const Text('Cart'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const CartScreen()));
              },
            ),
            ListTile(
              leading: const Icon(Icons.receipt_long),
              title: const Text('My Orders'),
              onTap: () {
                Navigator.pop(context);
                Navigator.push(context, MaterialPageRoute(builder: (_) => const OrdersScreen()));
              },
            ),
            const Divider(),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.red),
              title: const Text('Logout', style: TextStyle(color: Colors.red)),
              onTap: () {
                _api.clearToken();
                Navigator.pushAndRemoveUntil(context, MaterialPageRoute(
                  builder: (_) => const LoginScreen(),
                ), (route) => false);
              },
            ),
          ],
        ),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _products.isEmpty
              ? const Center(child: Text('No products available', style: TextStyle(color: AppTheme.grey, fontSize: 16)))
              : Column(
                  children: [
                    Container(
                      height: 50,
                      padding: const EdgeInsets.symmetric(vertical: 8),
                      child: ListView(
                        scrollDirection: Axis.horizontal,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        children: _categories.map((cat) {
                          final selected = cat == _selectedCategory;
                          return Padding(
                            padding: const EdgeInsets.only(right: 8),
                            child: ChoiceChip(
                              label: Text(cat),
                              selected: selected,
                              selectedColor: AppTheme.primaryOrange,
                              labelStyle: TextStyle(color: selected ? Colors.white : AppTheme.black),
                              onSelected: (_) => setState(() => _selectedCategory = cat),
                            ),
                          );
                        }).toList(),
                      ),
                    ),
                    Expanded(
                      child: RefreshIndicator(
                        onRefresh: _loadProducts,
                        child: GridView.builder(
                          padding: const EdgeInsets.all(16),
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            childAspectRatio: 0.7,
                            crossAxisSpacing: 12,
                            mainAxisSpacing: 12,
                          ),
                          itemCount: _filteredProducts.length,
                          itemBuilder: (context, index) => ProductCard(product: _filteredProducts[index]),
                        ),
                      ),
                    ),
                  ],
                ),
    );
  }
}
