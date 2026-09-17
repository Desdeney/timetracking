import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      if (username) {
        setUser({ username });
      }
    } catch (error) {
      console.error('Error checking auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      await authService.login(username, password);
      await AsyncStorage.setItem('username', username);
      setUser({ username });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Login fehlgeschlagen' };
    }
  };

  const register = async (username, password) => {
    try {
      await authService.register(username, password);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Registrierung fehlgeschlagen' };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      await AsyncStorage.removeItem('username');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
