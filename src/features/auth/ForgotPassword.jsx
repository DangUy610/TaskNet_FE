// src/components/auth/ForgotPasswordPage.jsx

import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage({ baseUrl = '' }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'success' | 'error'
  const [loading, setLoading] = useState(false);

  // Simple email validation
  const validateEmail = (value) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('idle');

    // Client-side validation
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Invalid email format');
      return;
    }

    setLoading(true);
    try {
      // TODO: replace with real API call
      // await fetch(`${baseUrl}/auth/forgot-password`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });
      // simulate API delay
      await new Promise(res => setTimeout(res, 1000));
      setStatus('success');
      setEmail('');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
    setLoading(false);
  };

  return (
    <Container fluid className="min-vh-100 d-flex justify-content-center align-items-center bg-light px-3">
      <Row className="w-100 justify-content-center">
        <Col xs={12} sm={8} md={6} lg={4}>
          <Card className="p-4 shadow">
            <h4 className="text-center mb-3">Forgot Password</h4>

            {status === 'success' && (
              <Alert variant="success">
                If this email exists, we'll send you a reset link.
              </Alert>
            )}
            {status === 'error' && (
              <Alert variant="danger">
                Something went wrong. Please try again.
              </Alert>
            )}

            <Form noValidate onSubmit={handleSubmit}>
              <Form.Group controlId="forgotEmail" className="mb-3">
                <Form.Label>We'll send a recovery link to</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  isInvalid={!!error}
                  disabled={loading}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  {error}
                </Form.Control.Feedback>
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100 mb-3"
                disabled={loading}
                aria-label="Send password reset link"
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </Form>

            <div className="text-center">
              <Link to="/login" className="d-block">
                Return to Log In
              </Link>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
