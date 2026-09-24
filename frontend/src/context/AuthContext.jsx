import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('km_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      authApi.getMe()
        .then((res) => {
          if (res.data.success) {
            setUser(res.data.data);
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.data.success) {
      const data = res.data.data;
      localStorage.setItem('km_token', data.token);
      setToken(data.token);
      setUser(data);
      return data;
    }
    throw new Error(res.data.message || 'Login failed');
  };

  const register = async (formData) => {
    const res = await authApi.register(formData);
    if (res.data.success) {
      const data = res.data.data;
      localStorage.setItem('km_token', data.token);
      setToken(data.token);
      setUser(data);
      return data;
    }
    throw new Error(res.data.message || 'Registration failed');
  };

  const googleLogin = async (googleData) => {
    const res = await authApi.googleAuth(googleData);
    if (res.data.success) {
      const data = res.data.data;
      localStorage.setItem('km_token', data.token);
      setToken(data.token);
      setUser(data);
      return data;
    }
    throw new Error(res.data.message || 'Google Auth failed');
  };

  const logout = () => {
    localStorage.removeItem('km_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await authApi.getMe();
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isAdmin = user?.roles?.some(r => r === 'ROLE_ADMIN' || r?.name === 'ROLE_ADMIN');

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      isAdmin,
      login,
      register,
      googleLogin,
      logout,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
