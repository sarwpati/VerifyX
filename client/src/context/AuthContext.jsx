import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('verifyx_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [organization, setOrganization] = useState(() => {
    const saved = localStorage.getItem('verifyx_org');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('verifyx_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('verifyx_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            setOrganization(res.data.organization);
            localStorage.setItem('verifyx_user', JSON.stringify(res.data.user));
            if (res.data.organization) {
              localStorage.setItem('verifyx_org', JSON.stringify(res.data.organization));
            }
          }
        } catch (err) {
          console.warn('[Auth] Token validation failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      const { token, user, organization } = res.data;
      setToken(token);
      setUser(user);
      setOrganization(organization);
      localStorage.setItem('verifyx_token', token);
      localStorage.setItem('verifyx_user', JSON.stringify(user));
      if (organization) {
        localStorage.setItem('verifyx_org', JSON.stringify(organization));
      }
      return { success: true, user, organization };
    }
    return { success: false, message: res.data.message };
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      const { token, user, organization } = res.data;
      setToken(token);
      setUser(user);
      setOrganization(organization);
      localStorage.setItem('verifyx_token', token);
      localStorage.setItem('verifyx_user', JSON.stringify(user));
      if (organization) {
        localStorage.setItem('verifyx_org', JSON.stringify(organization));
      }
      return { success: true, user, organization };
    }
    return { success: false, message: res.data.message };
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setOrganization(null);
    localStorage.removeItem('verifyx_token');
    localStorage.removeItem('verifyx_user');
    localStorage.removeItem('verifyx_org');
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
        setOrganization(res.data.organization);
        localStorage.setItem('verifyx_user', JSON.stringify(res.data.user));
        if (res.data.organization) {
          localStorage.setItem('verifyx_org', JSON.stringify(res.data.organization));
        }
      }
    } catch (err) {
      console.error('[Auth] Refresh user error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        organization,
        token,
        isAuthenticated: !!user,
        role: user ? user.role : null,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
