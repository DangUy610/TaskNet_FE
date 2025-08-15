// src/components/auth/OAuthButtonGroup.jsx
import React, { useContext } from 'react';
import { Button } from 'react-bootstrap';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { AuthContext } from '../../contexts/AuthContext';

import { FaGithub, FaFacebookF } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function OAuthButtonGroup() {
  const navigate = useNavigate();
  const { loginWithGoogle } = useContext(AuthContext);

  const saveToLocal = (email, name, avatar) => {
    const newAcc = { email, name, avatar };
    const oldAccs = JSON.parse(localStorage.getItem('savedAccounts')) || [];
    if (!oldAccs.find(a => a.email === email)) {
      localStorage.setItem('savedAccounts', JSON.stringify([newAcc, ...oldAccs]));
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const googleToken = credentialResponse.credential;
      await loginWithGoogle(googleToken); // ✅ Gọi đúng context
      navigate('/boards');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Google login failed. Please try again.';
      alert(errorMsg);
    }
  };

  const handleGitHubLogin = () => {
    alert('GitHub OAuth chưa tích hợp – bạn cần đăng ký app GitHub và thêm backend handler.');
  };

  const handleFacebookLogin = () => {
    alert('Facebook OAuth chưa tích hợp – bạn cần đăng ký app Facebook và thêm backend handler.');
  };

  return (
    <div className="d-grid gap-2 mb-3">
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => alert('Google Login Failed')}
        theme="outline"
        size="large"
        width="100%"  // Google sẽ tự đổi thành full container
        text="continue_with"
        shape="rect"
        logo_alignment="left"
      />
      <Button variant="outline-dark" onClick={handleGitHubLogin}>
        <FaGithub className="me-2" /> Continue with GitHub
      </Button>
      <Button variant="outline-primary" onClick={handleFacebookLogin}>
        <FaFacebookF className="me-2" /> Continue with Facebook
      </Button>
    </div>
  );
}
