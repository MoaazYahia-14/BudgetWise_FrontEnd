/* ملف الحماية — يمنع الوصول للصفحات بدون تسجيل دخول */
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* التحقق من وجود token قبل عرض الصفحة */
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const { user } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If user role is pending and they are trying to access a protected page
  // other than role-selection, redirect them to role-selection.
  if (user && user.role === 'pending' && location.pathname !== '/role-selection') {
    return <Navigate to="/role-selection" replace />;
  }

  // Prevent users from accessing founder routes
  if (user && user.role === 'user' && location.pathname.startsWith('/founder')) {
    return <Navigate to="/user/home" replace />;
  }

  // Prevent founders from accessing user routes
  if (user && user.role === 'founder' && location.pathname.startsWith('/user')) {
    return <Navigate to="/founder/home" replace />;
  }

  return children;
};

export default ProtectedRoute;
