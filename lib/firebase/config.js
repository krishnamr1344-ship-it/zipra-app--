/**
 * Firebase Configuration for Zipra App
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://console.firebase.google.com/
 * 2. Create a new project or select existing
 * 3. Add a Web app in Project Settings
 * 4. Copy your config values below
 * 5. Enable Authentication > Sign-in methods:
 *    - Google
 *    - Email/Password
 *    - Phone (optional)
 * 6. For Google Sign-In:
 *    - Configure OAuth consent screen
 *    - Add your production domain to authorized domains
 *    - Download google-services.json for Android
 *    - Download GoogleService-Info.plist for iOS
 */

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_PROJECT.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_PROJECT.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "YOUR_MEASUREMENT_ID",
};

/**
 * Google Sign-In Web Client ID
 * Get this from:
 * Google Cloud Console > APIs & Services > Credentials > OAuth 2.0 Client IDs
 * - Web client (created automatically)
 * - Android OAuth client (for Android app)
 * - iOS OAuth client (for iOS app)
 */
export const GOOGLE_WEB_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID || "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com";
export const GOOGLE_ANDROID_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com";

/**
 * Firebase Auth Constants
 */
export const AUTH_ERRORS = {
  EMAIL_EXISTS: "This email is already registered. Try signing in instead.",
  INVALID_EMAIL: "Please enter a valid email address.",
  WRONG_PASSWORD: "Incorrect password. Please try again.",
  USER_NOT_FOUND: "No account found with this email.",
  TOO_MANY_ATTEMPTS: "Too many failed attempts. Please try again later.",
  NETWORK_ERROR: "Network error. Check your connection.",
  POPUP_CLOSED: "Sign-in popup was closed.",
  UNSUPPORTED_BROWSER: "Browser not supported for this sign-in method.",
};

export const AUTH_SUCCESS = {
  LOGIN: "Welcome back to Zipra!",
  REGISTER: "Account created successfully!",
  GOOGLE_SIGN_IN: "Signed in with Google!",
  LOGOUT: "Signed out successfully.",
  PASSWORD_RESET: "Password reset email sent!",
};