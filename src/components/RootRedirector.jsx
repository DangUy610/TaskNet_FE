import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts';
import LoadingSpinner from './ui/LoadingSpinner';

const RootRedirector = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Nếu đã xác thực xong và có user, chuyển đến trang chính
  if (user) {
    return <Navigate to="/boards" replace />;
  }

  // Nếu không có user, chuyển đến trang đăng nhập
  return <Navigate to="/login" replace />;
};

export default RootRedirector;