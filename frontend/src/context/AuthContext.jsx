import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('skillnest_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('skillnest_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('skillnest_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('skillnest_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.error('Session expired or invalid:', err.message);
          localStorage.removeItem('skillnest_token');
          localStorage.removeItem('skillnest_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('skillnest_token', newToken);
      localStorage.setItem('skillnest_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return res.data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authAPI.register(userData);
    if (res.data.success) {
      const { token: newToken, user: newUser } = res.data;
      localStorage.setItem('skillnest_token', newToken);
      localStorage.setItem('skillnest_user', JSON.stringify(newUser));
      setToken(newToken);
      setUser(newUser);
      return res.data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('skillnest_token');
    localStorage.removeItem('skillnest_user');
    setUser(null);
    setToken(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('skillnest_user', JSON.stringify(updatedUser));
  };

  const refreshUser = async () => {
    try {
      const res = await authAPI.getMe();
      if (res.data.success) {
        updateUser(res.data.user);
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
