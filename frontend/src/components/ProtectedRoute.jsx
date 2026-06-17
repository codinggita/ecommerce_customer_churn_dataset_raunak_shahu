import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  
  let user = null;
  try {
    user = userString ? JSON.parse(userString) : null;
  } catch (error) {
    console.error("Failed to parse user from localStorage", error);
  }

  // Not authenticated: redirect to login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check roles authorization
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Authenticated and authorized: render children
  return children;
};

export default ProtectedRoute;
