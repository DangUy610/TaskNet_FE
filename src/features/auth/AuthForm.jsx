// src/components/auth/AuthForm.jsx

import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  InputGroup,
  Spinner,
  Modal
} from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaGoogle, FaGithub, FaFacebookF } from 'react-icons/fa';
import { AuthContext } from '../../contexts/AuthContext';

import OAuthButtonGroup from './OAuthButtonGroup';

export default function AuthForm({ mode = 'login' }) {
  const navigate = useNavigate();
  const isLogin = mode === 'login';
  const { login, signup } = useContext(AuthContext);

  // form state
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [remember, setRemember]       = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);

  // validation state
  const [errors, setErrors]   = useState({ email: '', password: '', confirm: '' });
  const [touched, setTouched] = useState({ email: false, password: false, confirm: false });

  // error modal state
  const [errMsg, setErrMsg]       = useState('');
  const [showErrModal, setShowErrModal] = useState(false);

  // validation functions
  const validateField = (name, value) => {
    let error = '';
    if (name === 'email') {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!value) error = 'Email is required';
      else if (!re.test(value)) error = 'Invalid email format';
    }
    if (name === 'password') {
      if (!value) error = 'Password is required';
      else if (value.length < 8) error = 'Password must be at least 8 characters';
    }
    if (name === 'confirm' && !isLogin) {
      if (!value) error = 'Please confirm your password';
      else if (value !== password) error = "Passwords don't match";
    }
    setErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  };

  const handleBlur = e => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    validateField(name, value);
  };

  const handleChange = e => {
    const { name, value, checked } = e.target;
    if (name === 'email') setEmail(value);
    if (name === 'password') setPassword(value);
    if (name === 'confirm') setConfirm(value);
    if (name === 'remember') setRemember(checked);
    if (touched[name]) {
      validateField(name, name === 'remember' ? checked : value);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    // mark all touched to show validation
    setTouched({ email: true, password: true, confirm: true });
    const validEmail = validateField('email', email);
    const validPass  = validateField('password', password);
    const validConf  = isLogin ? true : validateField('confirm', confirm);
    if (!validEmail || !validPass || !validConf) return;

    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/boards'); // ✅ giữ nguyên

        const accounts = JSON.parse(localStorage.getItem('savedAccounts')) || [];
        const exists = accounts.find(acc => acc.email === email);
        if (!exists) {
          const newAcc = {
            email,
            name: email.split('@')[0],
            avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${email}`
          };
          localStorage.setItem('savedAccounts', JSON.stringify([newAcc, ...accounts]));
        }
      } else {
        await signup(email, password);
        navigate('/login'); // ✅ chỉ điều hướng sau đăng ký
      }
    } catch (err) {
      const msg = err.response?.data?.detail
        || err.response?.data?.message
        || err.response?.data?.error
        || 'Có lỗi rồi đại vương ơi. !!!';
      setErrMsg(msg);
      setShowErrModal(true);
      console.error("API Error Response:", err.response); // Giữ lại để debug nếu cần
      let errorMessage = "Có lỗi không xác định. Vui lòng thử lại.";
      if (err.response && err.response.data) {

        const errorData = err.response.data;
        // Ví dụ: { "password": ["Mật khẩu phải có ít nhất 8 ký tự."], "email": ["Email này đã tồn tại."] }

        // Chúng ta sẽ lấy tất cả các thông báo lỗi từ các trường và nối chúng lại
        const errorMessages = Object.keys(errorData)
          .map(fieldName => {
            // errorData[fieldName] là một mảng các chuỗi lỗi
            return errorData[fieldName].join(' '); 
          })
          .join(' \n'); // Nối các lỗi của các trường khác nhau bằng dấu xuống dòng

        if (errorMessages) {
          errorMessage = errorMessages;
        }
      } else if (err.request) {
        // Lỗi mạng, không kết nối được tới server
        errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền mạng.";
      }

      setErrMsg(errorMessage);
      setShowErrModal(true);
      // --- KẾT THÚC PHẦN XỬ LÝ LỖI ---
    }
    finally {
          setLoading(false);
        }
    };

  return (
    <>
      <Container fluid className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
        <Row className="w-100 justify-content-center">
          <Col xs={12} md={10} lg={8} xl={6}>
            <Card className="shadow-lg overflow-hidden">
              <Row className="g-0">
                {/* Illustration side */}
                <Col md={6} className="d-none d-md-flex flex-column justify-content-center align-items-center bg-white p-4">
                  <img
                    src="/login-illustration.png"
                    alt="Welcome Illustration"
                    className="img-fluid mb-3"
                    style={{ maxWidth: '80%' }}
                  />
                  <h2 className="mb-3">Welcome {isLogin ? 'Back!' : 'Aboard!'}</h2>
                  <p className="text-muted text-center">
                    {isLogin
                      ? 'Log in to continue to your account.'
                      : 'Create an account to get started.'}
                  </p>
                </Col>

                {/* Form side */}
                <Col xs={12} md={6} className="p-4">
                  <h3 className="mb-4 text-center">{isLogin ? 'Login' : 'Sign Up'}</h3>

                  <Form noValidate onSubmit={handleSubmit}>
                    <Form.Group className="mb-3" controlId="authEmail">
                      <Form.Label>Email address</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.email && !!errors.email}
                        autoComplete="username"
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.email}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="authPassword">
                      <Form.Label>Password</Form.Label>
                      <InputGroup>
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          placeholder="Password"
                          value={password}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          isInvalid={touched.password && !!errors.password}
                          autoComplete={isLogin ? 'current-password' : 'new-password'}
                          required
                        />
                        <Button
                          variant="outline-secondary"
                          onClick={() => setShowPassword(prev => !prev)}
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                        <Form.Control.Feedback type="invalid">
                          {errors.password}
                        </Form.Control.Feedback>
                      </InputGroup>
                    </Form.Group>

                    {!isLogin && (
                      <Form.Group className="mb-3" controlId="authConfirmPassword">
                        <Form.Label>Confirm Password</Form.Label>
                        <InputGroup>
                          <Form.Control
                            type={showPassword ? 'text' : 'password'}
                            name="confirm"
                            placeholder="Confirm password"
                            value={confirm}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.confirm && !!errors.confirm}
                            autoComplete="new-password"
                            required
                          />
                          <Button
                            variant="outline-secondary"
                            onClick={() => setShowPassword(prev => !prev)}
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                          >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                          </Button>
                          <Form.Control.Feedback type="invalid">
                            {errors.confirm}
                          </Form.Control.Feedback>
                        </InputGroup>
                      </Form.Group>
                    )}

                    {isLogin && (
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <Form.Check
                          type="checkbox"
                          label="Remember me"
                          name="remember"
                          checked={remember}
                          onChange={handleChange}
                        />
                        <Link to="/forgot-password">Forgot password?</Link>
                      </div>
                    )}

                    <div className="d-grid mb-3">
                      <Button variant="primary" type="submit" disabled={loading}>
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
                            Please wait...
                          </>
                        ) : (
                          isLogin ? 'Login' : 'Sign Up'
                        )}
                      </Button>
                    </div>

                    {isLogin && (
                      <>
                        <div className="d-flex align-items-center my-3">
                          <hr className="flex-grow-1" />
                          <span className="mx-2 text-muted">Or continue with:</span>
                          <hr className="flex-grow-1" />
                        </div>
                        <OAuthButtonGroup />
                      </>
                    )}

                    <p className="text-center mb-0">
                      {isLogin ? "Don't have an account? " : 'Already have an account? '}
                      <Link to={isLogin ? '/register' : '/login'} className="fw-bold">
                        {isLogin ? 'Create one' : 'Login'}
                      </Link>
                    </p>
                  </Form>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Error Modal */}
      <Modal show={showErrModal} onHide={() => setShowErrModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Error</Modal.Title>
        </Modal.Header>
        <Modal.Body>{errMsg}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowErrModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
