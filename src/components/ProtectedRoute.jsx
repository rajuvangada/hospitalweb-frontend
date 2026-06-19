import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthAppContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { user, token } = useContext(AuthContext);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
    return <Navigate to="/patient/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
