/**
 * Dedicated authentication service for Project 2.0.
 * Isolates API calls, token persistence, and session management.
 * Can easily be migrated to HttpOnly cookies in future phases.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const TOKEN_STORAGE_KEY = 'careweave_p2_auth_token';
const USER_STORAGE_KEY = 'careweave_p2_auth_user';

export const authService = {
  /**
   * Log in user with email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<{token: string, user: object}>}
   */
  async login(email, password) {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
    } catch (networkError) {
      throw new Error('Unable to connect to the authentication server. Please check your network.');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage = data?.error || 'Authentication failed. Please check your credentials.';
      throw new Error(errorMessage);
    }

    if (data.token) {
      this.setSession(data.token, data.user);
    }

    return data;
  },

  /**
   * Store token and safe user details in browser storage
   */
  setSession(token, user) {
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      }
    } catch (e) {
      console.warn('Storage write failed:', e);
    }
  },

  /**
   * Clear session tokens and credentials
   */
  clearSession() {
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch (e) {
      console.warn('Storage clear failed:', e);
    }
  },

  /**
   * Retrieve active authentication token
   * @returns {string|null}
   */
  getToken() {
    try {
      return localStorage.getItem(TOKEN_STORAGE_KEY);
    } catch (e) {
      return null;
    }
  },

  /**
   * Retrieve stored user metadata
   * @returns {object|null}
   */
  getUser() {
    try {
      const userStr = localStorage.getItem(USER_STORAGE_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  /**
   * Check if user is currently marked as authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return Boolean(this.getToken());
  },

  /**
   * Verify token validity against the backend
   * @returns {Promise<object|null>} verified user or null if invalid/expired
   */
  async verifySession() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.clearSession();
        return null;
      }

      const data = await response.json();
      return data.user || null;
    } catch (err) {
      // If server is unreachable during check, keep existing session optimistically if token exists
      return this.getUser();
    }
  },

  /**
   * Log out user
   */
  logout() {
    this.clearSession();
  },
};

export default authService;
