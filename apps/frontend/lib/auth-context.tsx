"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from './api';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  successMessage: string;
  clearSuccessMessage: () => void;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');

  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';

  const clearSuccessMessage = () => setSuccessMessage('');

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await authApi.getProfile();
      setUser(response.user);
    } catch (error) {
      // Token is invalid or expired
      localStorage.removeItem('token');
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    setUser(response.user);
    if (response.message) {
      setSuccessMessage(response.message);
      setTimeout(() => setSuccessMessage(''), 5000); // Clear after 5 seconds
    }
  };

  const adminLogin = async (email: string, password: string) => {
    const response = await authApi.adminLogin(email, password);
    
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    setUser(response.user);
    if (response.message) {
      setSuccessMessage(response.message);
      setTimeout(() => setSuccessMessage(''), 5000); // Clear after 5 seconds
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await authApi.signup(name, email, password);
    
    if (response.token) {
      localStorage.setItem('token', response.token);
    }
    
    setUser(response.user);
    if (response.message) {
      setSuccessMessage(response.message);
      setTimeout(() => setSuccessMessage(''), 5000); // Clear after 5 seconds
    }
  };

  const logout = async () => {
    try {
      const response = await authApi.logout();
      if (response.message) {
        setSuccessMessage(response.message);
        setTimeout(() => setSuccessMessage(''), 3000); // Clear after 3 seconds
      }
    } finally {
      setUser(null);
      localStorage.removeItem('token');
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        successMessage,
        clearSuccessMessage,
        login,
        adminLogin,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 