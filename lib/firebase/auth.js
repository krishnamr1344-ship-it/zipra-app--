/**
 * Firebase Authentication Service
 * Handles all authentication operations including:
 * - Email/Password auth
 * - Google Sign-In
 * - Phone OTP (future)
 * - Token management
 * - Session persistence
 */

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  getIdToken,
  getIdTokenResult,
  reauthenticateWithPopup,
} from "firebase/auth";
import firebaseApp from "./app";
import { AUTH_ERRORS } from "./config";

// Initialize Firebase Auth
const auth = getAuth(firebaseApp);

// Google Auth Provider with custom parameters
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("email");
googleProvider.addScope("profile");
googleProvider.setCustomParameters({
  prompt: "select_account",
  login_hint: "",
});

/**
 * Get Firebase ID token for current user
 * @returns {Promise<string|null>} Firebase ID token or null
 */
export async function getFirebaseToken() {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    return await getIdToken(user);
  } catch (error) {
    console.error("Error getting Firebase token:", error);
    return null;
  }
}

/**
 * Get token with refresh
 * @returns {Promise<{token: string, expirationTime: number}|null>}
 */
export async function getTokenWithExpiration() {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    
    const token = await getIdToken(user, true); // force refresh
    const decodedToken = await getIdTokenResult(user);
    
    return {
      token,
      expirationTime: decodedToken.expirationTime,
      issuedAtTime: decodedToken.issuedAtTime,
    };
  } catch (error) {
    console.error("Error getting token with expiration:", error);
    return null;
  }
}

/**
 * Sign in with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{user: object, credential: object}>}
 */
export async function signInWithEmail(email, password) {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    const credential = await getIdTokenResult(result.user);
    
    return {
      user: formatUser(result.user),
      credential: {
        token: credential.token,
        expirationTime: credential.expirationTime,
        claims: credential.claims,
      },
    };
  } catch (error) {
    throw mapAuthError(error);
  }
}

/**
 * Register with email and password
 * @param {string} email 
 * @param {string} password 
 * @param {string} displayName 
 * @returns {Promise<{user: object, credential: object}>}
 */
export async function registerWithEmail(email, password, displayName = "") {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
    
    // Update display name if provided
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    
    const credential = await getIdTokenResult(result.user);
    
    return {
      user: formatUser(result.user),
      credential: {
        token: credential.token,
        expirationTime: credential.expirationTime,
        claims: credential.claims,
      },
    };
  } catch (error) {
    throw mapAuthError(error);
  }
}

/**
 * Sign in with Google popup
 * @returns {Promise<{user: object, credential: object}>}
 */
export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = await GoogleAuthProvider.credentialFromResult(result);
    const firebaseToken = await getIdToken(result.user);
    const tokenResult = await getIdTokenResult(result.user);

    return {
      user: formatUser(result.user),
      credential: {
        token: firebaseToken,
        googleToken: credential.idToken,
        accessToken: credential.accessToken,
        expirationTime: tokenResult.expirationTime,
        claims: tokenResult.claims,
      },
      isNewUser: result._tokenResponse?.isNewUser || false,
    };
  } catch (error) {
    if (error.code === "auth/popup-closed-by-user") {
      throw new Error(AUTH_ERRORS.POPUP_CLOSED);
    }
    throw mapAuthError(error);
  }
}

/**
 * Sign out current user
 * @returns {Promise<void>}
 */
export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out:", error);
    throw error;
  }
}

/**
 * Send password reset email
 * @param {string} email 
 * @returns {Promise<void>}
 */
export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    throw mapAuthError(error);
  }
}

/**
 * Re-authenticate with Google popup (for sensitive operations)
 * @returns {Promise<boolean>}
 */
export async function reauthenticateWithGoogle() {
  try {
    const result = await reauthenticateWithPopup(auth, googleProvider);
    return !!result.user;
  } catch (error) {
    throw mapAuthError(error);
  }
}

/**
 * Subscribe to auth state changes
 * @param {function} callback - Called with user object or null
 * @returns {function} Unsubscribe function
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, (user) => {
    callback(user ? formatUser(user) : null);
  });
}

/**
 * Get current user synchronously (may be null)
 * @returns {object|null}
 */
export function getCurrentUser() {
  const user = auth.currentUser;
  return user ? formatUser(user) : null;
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!auth.currentUser;
}

/**
 * Format user object from Firebase user
 * @param {object} user - Firebase user object
 * @returns {object} Formatted user object
 */
function formatUser(user) {
  return {
    uid: user.uid,
    email: user.email,
    emailVerified: user.emailVerified,
    displayName: user.displayName || user.email?.split("@")[0] || "User",
    photoURL: user.photoURL,
    phoneNumber: user.phoneNumber,
    providerId: user.providerId,
    createdAt: user.metadata?.creationTime,
    lastLoginAt: user.metadata?.lastSignInTime,
    isAnonymous: user.isAnonymous,
    providerData: user.providerData?.map((p) => ({
      providerId: p.providerId,
      uid: p.uid,
      email: p.email,
      displayName: p.displayName,
      photoURL: p.photoURL,
    })) || [],
  };
}

/**
 * Map Firebase auth errors to user-friendly messages
 * @param {object} error - Firebase auth error
 * @returns {Error} Mapped error
 */
function mapAuthError(error) {
  const errorMessages = {
    "auth/email-already-in-use": AUTH_ERRORS.EMAIL_EXISTS,
    "auth/invalid-email": AUTH_ERRORS.INVALID_EMAIL,
    "auth/wrong-password": AUTH_ERRORS.WRONG_PASSWORD,
    "auth/user-not-found": AUTH_ERRORS.USER_NOT_FOUND,
    "auth/too-many-requests": AUTH_ERRORS.TOO_MANY_ATTEMPTS,
    "auth/network-request-failed": AUTH_ERRORS.NETWORK_ERROR,
    "auth/popup-closed-by-user": AUTH_ERRORS.POPUP_CLOSED,
    "auth/cancelled-popup-request": AUTH_ERRORS.POPUP_CLOSED,
    "auth/unsupported-first-party-entity": AUTH_ERRORS.UNSUPPORTED_BROWSER,
    "auth/invalid-credential": AUTH_ERRORS.INVALID_EMAIL,
    "auth/invalid-verification-code": "Invalid verification code.",
    "auth/invalid-verification-id": "Invalid verification ID.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/operation-not-allowed": "This sign-in method is not enabled.",
    "auth/requires-recent-login": "Please sign in again to continue.",
  };

  const message = errorMessages[error.code] || error.message || "Authentication failed";
  const mappedError = new Error(message);
  mappedError.code = error.code;
  mappedError.originalError = error;
  
  return mappedError;
}

// Export auth instance for direct access if needed
export { auth };