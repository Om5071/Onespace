import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('onespace_access_token');
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.success) {
            setUser(res.data.user);
            setSettings(res.data.settings);
          }
        } catch (error) {
          console.error('Session initialization failed:', error);
          localStorage.removeItem('onespace_access_token');
          localStorage.removeItem('onespace_refresh_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    if (res.success) {
      const { user, accessToken, refreshToken } = res.data;
      localStorage.setItem('onespace_access_token', accessToken);
      localStorage.setItem('onespace_refresh_token', refreshToken);
      setUser(user);
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (name, email, password) => {
    const res = await authApi.register({ name, email, password });
    if (res.success) {
      const { user, accessToken, refreshToken } = res.data;
      localStorage.setItem('onespace_access_token', accessToken);
      localStorage.setItem('onespace_refresh_token', refreshToken);
      setUser(user);
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('onespace_access_token');
    localStorage.removeItem('onespace_refresh_token');
    setUser(null);
    setSettings(null);
    window.location.href = '/login';
  };

  const updateUserData = (updatedUser) => {
    setUser((prev) => ({ ...prev, ...updatedUser }));
  };

  const updateSettingsData = (updatedSettings) => {
    setSettings((prev) => ({ ...prev, ...updatedSettings }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        settings,
        setSettings,
        loading,
        login,
        register,
        logout,
        updateUserData,
        updateSettingsData,
        isAuthenticated: !!user
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
