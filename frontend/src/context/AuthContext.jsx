import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => authService.getToken());
  const [user, setUser] = useState(() => authService.getUser());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      if (authService.getToken()) {
        const verifiedUser = await authService.verifySession();
        if (isMounted) {
          if (verifiedUser) {
            setUser(verifiedUser);
            setToken(authService.getToken());
          } else {
            setUser(null);
            setToken(null);
          }
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    }

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    setToken(result.token);
    setUser(result.user);
    return result;
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token),
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
