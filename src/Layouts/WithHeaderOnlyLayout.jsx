// src/layouts/WithHeaderOnlyLayout.jsx
import React from 'react';
import Header from '../components/Header';

export default function WithHeaderOnlyLayout({ children }) {
  return (
    <>
      <Header />
      <div className="pt-3">{children}</div>
    </>
  );
}
