/**
 * Firebase Authentication Module
 * 
 * Usage:
 * import { useAuth } from '@/lib/firebase';
 * 
 * Or import specific functions:
 * import { signInWithGoogle, login, logout } from '@/lib/firebase';
 */

// Main exports
export {
  FirebaseAuthProvider,
  useAuth,
  useUser,
  useIsAuthenticated,
  useIsAdmin,
} from "./context";

// Auth functions
export {
  signInWithEmail,
  registerWithEmail,
  signInWithGoogle,
  signOut,
  resetPassword,
  getFirebaseToken,
  getTokenWithExpiration,
  onAuthChange,
  getCurrentUser,
  isAuthenticated,
  auth,
} from "./auth";

// Config
export { firebaseConfig, GOOGLE_WEB_CLIENT_ID, AUTH_ERRORS, AUTH_SUCCESS } from "./config";

// App
export { default as firebaseApp } from "./app";