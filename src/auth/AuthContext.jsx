import React, { createContext, useContext, useState } from 'react';
import { isSupportedRole } from './roles';

/**
 * CareWeave — Authentication Context
 *
 * Manages in-memory authentication and session state.
 * Real credentials, session persistence, and patient-level authorization
 * are strictly handled by the backend.
 *
 * NOTE: Sensitive healthcare data, passwords, and tokens must NEVER be stored
 * in localStorage or sessionStorage.
 */

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initial state is strictly unauthenticated (in-memory only)
  const [user, setUser] = useState(null);

  // Represents whether an active session is currently being resolved.
  // Since backend authentication is not yet connected, no session restoration is simulated.
  // =========================================================================
  // BACKEND INTEGRATION POINT (P2):
  // When backend session verification is connected (e.g. GET /api/auth/me),
  // initialize isLoading to true and resolve the active session here.
  // =========================================================================
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = Boolean(user);

  /**
   * Integration placeholder for user authentication.
   *
   * =========================================================================
   * BACKEND INTEGRATION POINT (P2):
   * Replace this placeholder with a call to the backend authentication service:
   * 1. Send credentials securely to backend (e.g. POST /api/auth/login).
   * 2. Backend validates credentials and returns authenticated user identity.
   * 3. Set verified user in memory.
   * =========================================================================
   */
  const login = async (userData) => {
    if (!userData) {
      throw new Error(
        'Backend authentication is not connected yet. Real credentials must be verified by the backend.'
      );
    }

    // Role validation: ensure role is recognized before accepting user
    if (!userData.role || !isSupportedRole(userData.role)) {
      throw new Error(
        `Authentication rejected: Role '${userData?.role}' is not recognized or supported.`
      );
    }

    // Store authenticated user in memory only
    setUser(userData);
    return userData;
  };

  /**
   * Clears the in-memory user session.
   *
   * =========================================================================
   * BACKEND INTEGRATION POINT (P2):
   * When connected to backend auth, notify the server to invalidate the session
   * or revoke tokens (e.g. POST /api/auth/logout).
   * =========================================================================
   */
  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook to access authentication context.
 * Throws a clear error if invoked outside of AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
