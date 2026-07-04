import 'package:flutter/material.dart';

class AppTheme {
  static const Color primaryOrange = Color(0xFFFF6B35);
  static const Color darkOrange = Color(0xFFE65100);
  static const Color white = Colors.white;
  static const Color black = Colors.black;
  static const Color grey = Color(0xFF9E9E9E);
  static const Color lightGrey = Color(0xFFF5F5F5);

  static ThemeData get lightTheme {
    return ThemeData(
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryOrange,
        primary: primaryOrange,
        secondary: darkOrange,
        surface: white,
        onPrimary: white,
        onSecondary: white,
        onSurface: black,
      ),
      scaffoldBackgroundColor: white,
      appBarTheme: const AppBarTheme(
        backgroundColor: primaryOrange,
        foregroundColor: white,
        elevation: 0,
        centerTitle: true,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryOrange,
          foregroundColor: white,
          padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
        ),
      ),
      textButtonTheme: TextButtonThemeData(
        style: TextButton.styleFrom(foregroundColor: primaryOrange),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: lightGrey,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: primaryOrange, width: 2),
        ),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
      cardTheme: CardThemeData(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
      ),
    );
  }
}
