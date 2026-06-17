import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthAppContext';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) return JSON.parse(storedUser);
    
    // TEMPORARY TESTING MODE: Dynamically detect path and map role so dashboards don't crash
    const path = window.location.pathname;
    let role = 'patient';
    let name = 'Test Patient';
    if (path.startsWith('/admin')) {
      role = 'admin';
      name = 'Test Administrator';
    } else if (path.startsWith('/doctor')) {
      role = 'doctor';
      name = 'Dr. Sarah Jenkins';
    }
    
    return {
      id: "test-user-id",
      name,
      email: `${role}@test.com`,
      role
    };
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || 'test-session-token-12345';
  });
  
  // Theme Management (Light Theme only - keep simple theme variable)
  const [theme, setTheme] = useState('light');

  // Sync theme to light
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
  }, []);

  // Sync user state on path change for Testing Mode
  useEffect(() => {
    if (!localStorage.getItem('token')) {
      const path = window.location.pathname;
      let role = 'patient';
      let name = 'Test Patient';
      if (path.startsWith('/admin')) {
        role = 'admin';
        name = 'Test Administrator';
      } else if (path.startsWith('/doctor')) {
        role = 'doctor';
        name = 'Dr. Sarah Jenkins';
      }
      setUser({
        id: "test-user-id",
        name,
        email: `${role}@test.com`,
        role
      });
    }
  }, [window.location.pathname]);

  const toggleTheme = () => {
    // Disabled in testing mode (strict light theme)
  };

  useEffect(() => {
    if (token && token !== 'test-session-token-12345') {
      localStorage.setItem('token', token);
    }
  }, [token]);

  const login = async (email, password) => {
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
