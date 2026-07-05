import 'package:firebase_auth/firebase_auth.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'api_service.dart';

class AuthService {
  static const _tokenKey = 'auth_token';
  static const _userKey = 'user_data';

  final FirebaseAuth _firebaseAuth = FirebaseAuth.instance;
  final ApiService _api = ApiService();

  Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(_tokenKey);
    if (token != null) {
      _api.setToken(token);
      return true;
    }
    return false;
  }

  Future<bool> loginWithEmail(String email, String password) async {
    try {
      final userCredential = await _firebaseAuth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      final idToken = await userCredential.user!.getIdToken();
      final res = await _api.post('/auth/verify-firebase', {'id_token': idToken});
      final token = res['user']['token'] as String;
      _api.setToken(token);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_tokenKey, token);
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<bool> register(String name, String email, String password) async {
    try {
      final userCredential = await _firebaseAuth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );
      await userCredential.user!.updateDisplayName(name);
      final idToken = await userCredential.user!.getIdToken();
      final res = await _api.post('/auth/verify-firebase', {'id_token': idToken});
      final token = res['user']['token'] as String;
      _api.setToken(token);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_tokenKey, token);
      return true;
    } catch (e) {
      return false;
    }
  }

  Future<void> logout() async {
    await _firebaseAuth.signOut();
    _api.clearToken();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_tokenKey);
    await prefs.remove(_userKey);
  }
}
