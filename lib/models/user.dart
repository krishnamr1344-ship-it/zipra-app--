class User {
  final String id;
  final String name;
  final String email;
  final String phone;
  final String role;
  final String token;

  User({
    required this.id,
    required this.name,
    required this.email,
    required this.phone,
    required this.role,
    required this.token,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'].toString(),
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] ?? 'customer',
      token: json['token'] ?? '',
    );
  }
}
