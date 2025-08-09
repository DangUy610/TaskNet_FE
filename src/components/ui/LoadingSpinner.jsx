// src/components/ui/LoadingSpinner.jsx
import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ fullScreen = false }) => {
  const style = fullScreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        zIndex: 9999,
      }
    : {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
      };

  return (
    <div style={style}>
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default LoadingSpinner;