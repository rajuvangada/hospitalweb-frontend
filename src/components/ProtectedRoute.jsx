import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthAppContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  // Temporary testing mode: Allow direct access to dashboards without redirecting to /login
  return children;
};

export default ProtectedRoute;
