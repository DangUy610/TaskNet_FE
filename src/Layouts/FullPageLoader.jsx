// src/components/FullPageLoader.jsx
import React from 'react';
import { Spinner } from 'react-bootstrap';

export default function FullPageLoader() {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Spinner animation="border" variant="primary" />
    </div>
  );
}
