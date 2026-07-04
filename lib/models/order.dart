class Order {
  final String id;
  final String status;
  final double totalAmount;
  final String deliveryAddress;
  final String paymentId;
  final DateTime createdAt;
  final List<OrderItem> items;

  Order({
    required this.id,
    required this.status,
    required this.totalAmount,
    required this.deliveryAddress,
    required this.paymentId,
    required this.createdAt,
    required this.items,
  });

  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'].toString(),
      status: json['status'] ?? 'placed',
      totalAmount: (json['total_amount'] as num).toDouble(),
      deliveryAddress: json['delivery_address'] ?? '',
      paymentId: json['payment_id'] ?? '',
      createdAt: DateTime.parse(json['created_at'] ?? DateTime.now().toIso8601String()),
      items: (json['items'] as List<dynamic>?)
              ?.map((e) => OrderItem.fromJson(e as Map<String, dynamic>))
              .toList() ??
          [],
    );
  }

  String get statusLabel {
    switch (status) {
      case 'placed': return 'Order Placed';
      case 'accepted': return 'Accepted';
      case 'preparing': return 'Preparing';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  }

  int get statusIndex {
    const statuses = ['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered'];
    return statuses.indexOf(status);
  }
}

class OrderItem {
  final String productName;
  final int quantity;
  final double price;

  OrderItem({
    required this.productName,
    required this.quantity,
    required this.price,
  });

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    return OrderItem(
      productName: json['product_name'] ?? '',
      quantity: json['quantity'] ?? 0,
      price: (json['price'] as num).toDouble(),
    );
  }
}
