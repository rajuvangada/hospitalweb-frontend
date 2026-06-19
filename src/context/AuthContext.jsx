import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthAppContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });
  
  // Theme Management (Support Light Mode Only)
  const [theme] = useState('light');

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }, []);

  const toggleTheme = () => {
    // No-op
  };

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const login = async (email, password) => {
    // Frontend-only demo login fallback
    if (email === 'admin@hospital.com' && password === 'Admin@123') {
      const demoUser = {
        id: "demo-admin-id",
        name: "Demo Administrator",
        email: "admin@hospital.com",
        role: "admin"
      };
      const demoToken = "demo-session-token-admin";
      localStorage.setItem('token', demoToken);
      localStorage.setItem('user', JSON.stringify(demoUser));
      setToken(demoToken);
      setUser(demoUser);
      return demoUser;
    }

    const response = await api.post('/auth/login', { email, password });
    const data = response.data;
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setToken(data.token);
      setUser(data);
      return data;
    }
    throw new Error('Authentication failed');
  };

  const register = async (patientData) => {
    const response = await api.post('/auth/register', patientData);
    const data = response.data;
    if (data.token) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setToken(data.token);
      setUser(data);
      return data;
    }
    throw new Error('Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateProfileState = (updatedUser) => {
    const fullUser = { ...user, ...updatedUser };
    localStorage.setItem('user', JSON.stringify(fullUser));
    setUser(fullUser);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      theme, 
      toggleTheme, 
      login, 
      register, 
      logout,
      updateProfileState 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
