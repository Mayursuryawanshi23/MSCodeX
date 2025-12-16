import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const isAuthenticated = () => {
  // production should validate token expiry; here we check a flag + token presence
  const token = localStorage.getItem('token');
  const flag = localStorage.getItem('isLoggedIn');
  return !!token && flag === 'true';
}

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  if (isAuthenticated()) return children;
  // preserve where user wanted to go
  return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
}

export default ProtectedRoute
