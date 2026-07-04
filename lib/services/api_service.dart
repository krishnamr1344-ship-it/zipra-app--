import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/api_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._();
  factory ApiService() => _instance;
  ApiService._();

  String? _token;

  void setToken(String token) => _token = token;
  void clearToken() => _token = null;

  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        if (_token != null) 'Authorization': 'Bearer $_token',
      };

  Future<Map<String, dynamic>> get(String path) async {
    final response = await http
        .get(Uri.parse('${ApiConfig.baseUrl}$path'), headers: _headers)
        .timeout(ApiConfig.timeout);
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body) async {
    final response = await http
        .post(Uri.parse('${ApiConfig.baseUrl}$path'), headers: _headers, body: jsonEncode(body))
        .timeout(ApiConfig.timeout);
    return _handleResponse(response);
  }

  Future<Map<String, dynamic>> patch(String path, Map<String, dynamic> body) async {
    final response = await http
        .patch(Uri.parse('${ApiConfig.baseUrl}$path'), headers: _headers, body: jsonEncode(body))
        .timeout(ApiConfig.timeout);
    return _handleResponse(response);
  }

  Map<String, dynamic> _handleResponse(http.Response response) {
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return data;
    }
    throw ApiException(data['detail']?.toString() ?? 'Something went wrong');
  }
}

class ApiException implements Exception {
  final String message;
  ApiException(this.message);
  @override
  String toString() => message;
}
