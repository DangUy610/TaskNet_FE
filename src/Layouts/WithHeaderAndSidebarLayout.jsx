import React from 'react';
import Header from '../components/Header';
import SiderBar from '../components/SiderBar';
import { Row, Col } from 'react-bootstrap';

export default function WithHeaderAndSidebarLayout({ children }) {
  return (
    <>
      <Header />
      <div style={{ width:'100%', maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        <Row className="g-0" style={{ height: 'calc(100vh - var(--header-height))' }}>
          <SiderBar />
          <Col xs={9} className="bg-light p-4 overflow-auto">
            {children}
          </Col>
        </Row>
      </div>
    </>
  );
}
