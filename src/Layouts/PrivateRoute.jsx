import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Spinner } from 'react-bootstrap';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  const token = localStorage.getItem('token');

  // Chờ loading hoàn tất nếu có token
  if (token && loading) {
    return <div className="text-center mt-5"><Spinner animation="border" /> Loading...</div>;
  }

  // Nếu không có token và không có user → về login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
