"use client";

import * as React from "react";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  onAuthChange,
  getFirebaseToken,
  getTokenWithExpiration,
  signInWithEmail,
  registerWithEmail,
  signInWithGoogle,
  signOut as firebaseSignOut,
  resetPassword,
  getCurrentUser,
} from "./auth";
import { AUTH_SUCCESS } from "./config";

/**
 * Auth Context
 */
const AuthContext = createContext(null);

/**
 * Auth Provider Component
 * Wraps the app and provides authentication state
 */
export function FirebaseAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [tokenExpiration, setTokenExpiration] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      refreshToken();
    }
    setLoading(false);

    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await refreshToken();
      } else {
        setToken(null);
        setTokenExpiration(null);
      }
    });

    return () => unsubscribe();
  }, [refreshToken]);

  // Refresh Firebase token
  const refreshToken = useCallback(async () => {
    try {
      const tokenData = await getTokenWithExpiration();
      if (tokenData) {
        setToken(tokenData.token);
        setTokenExpiration(new Date(tokenData.expirationTime));
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  }, []);

  // Sign in with email/password
  const login = useCallback(async (email, password) => {
    const result = await signInWithEmail(email, password);
    await refreshToken();
    return result;
  }, [refreshToken]);

  // Register with email/password
  const register = useCallback(async (email, password, displayName) => {
    const result = await registerWithEmail(email, password, displayName);
    await refreshToken();
    return result;
  }, [refreshToken]);

  // Sign in with Google
  const loginWithGoogle = useCallback(async () => {
    const result = await signInWithGoogle();
    await refreshToken();
    return result;
  }, [refreshToken]);

  // Sign out
  const logout = useCallback(async () => {
    await firebaseSignOut();
    setUser(null);
    setToken(null);
    setTokenExpiration(null);
  }, []);

  // Reset password
  const sendPasswordReset = useCallback(async (email) => {
    await resetPassword(email);
  }, []);

  // Check if token is expired or about to expire
  const isTokenValid = useCallback(() => {
    if (!tokenExpiration) return false;
    // Consider token valid if it expires in more than 5 minutes
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;
    return tokenExpiration.getTime() > fiveMinutesFromNow;
  }, [tokenExpiration]);

  // Get auth header for API requests
  const getAuthHeader = useCallback(async () => {
    if (!user) return null;
    
    // Refresh token if needed
    if (!isTokenValid()) {
      await refreshToken();
    }
    
    return token ? { Authorization: `Bearer ${token}` } : null;
  }, [user, token, isTokenValid, refreshToken]);

  const value = {
    user,
    loading,
    token,
    isAuthenticated: !!user,
    isAdmin: user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    login,
    register,
    loginWithGoogle,
    logout,
    sendPasswordReset,
    refreshToken,
    getAuthHeader,
    isTokenValid,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to use auth context
 * @returns {object} Auth context value
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within a FirebaseAuthProvider");
  }
  return context;
}

/**
 * Hook to get current user
 * @returns {object|null} Current user or null
 */
export function useUser() {
  const { user, loading } = useAuth();
  return { user, loading };
}

/**
 * Hook to check if user is authenticated
 * @returns {boolean}
 */
export function useIsAuthenticated() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated;
}

/**
 * Hook to check if user is admin
 * @returns {boolean}
 */
export function useIsAdmin() {
  const { isAdmin, user } = useAuth();
  return isAdmin;
}