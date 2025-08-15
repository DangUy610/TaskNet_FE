
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { login as authLogin, logout as authLogout, register as authRegister } from '../api/authApi';
import api from '../api/apiClient'; 

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Gắn token vào header nếu có sẵn trong localStorage (khi refresh trang)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserDetails(); // cố fetch user nếu đã có token
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserDetails = useCallback(async () => {
    try {
      const res = await api.get('/auth/me/');
      const data = res.data;

      // Nếu backend trả avatar ở chỗ khác, chỉnh tại đây:
      // const avatar = data.avatar ?? data.profile?.avatar_url ?? null;

      setUser({
        id: data.id,
        email: data.email,
        username: data.username,
        avatar: data.avatar ?? null,
        role: data.role || 'user',
      });
    } catch (err) {
      console.error('Failed to fetch user:', err);
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);
 




  // ---- LOGIN (email/password) ----
  const login = useCallback(
    async (email, password) => {
      const res = await authLogin(email, password);
      const { token: access, refresh } = res.data;

      localStorage.setItem('token', access);
      localStorage.setItem('refresh_token', refresh);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      await fetchUserDetails();
      return res;
    },
    [fetchUserDetails]
  );

  const loginWithGoogle = useCallback(async (googleToken) => {
    // Gọi API google-login của backend
    const res = await api.post('/auth/google-login/', { token: googleToken });
    const { token: access, refresh, user: userData } = res.data;

    // Lưu token và cập nhật state
    localStorage.setItem('token', access);
    localStorage.setItem('refresh_token', refresh);
    api.defaults.headers.common['Authorization'] = `Bearer ${access}`;
    
    // Cập nhật user state trực tiếp từ response để UI nhanh hơn
    setUser({
        id: userData.id,
        email: userData.email,
        username: userData.username,
        avatar: userData.avatar,
        role: userData.role,
    });
    
    return res;
  }, []);

  // -------------------SIGN UP----------------//
  const signup = useCallback(
    async (email, password) => {
      const res = await authRegister(email, password);
      const { token: access, refresh } = res.data;

      localStorage.setItem('token', access);
      localStorage.setItem('refresh_token', refresh);
      api.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      await fetchUserDetails();
      return res;
    },
    [fetchUserDetails]
  );

  // -------------------LOG OUT----------------//
  const logout = useCallback(() => {
    return authLogout()
      .then(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');

        delete api.defaults.headers.common['Authorization'];

        setUser(null);
      })
      .catch(error => {
        console.error('Logout error:', error);
        // Vẫn dọn dẹp localStorage dù có lỗi
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      });
  }, []);

  return (
    <AuthContext.Provider value={{
      user, loading, login, logout, signup,
      loginWithGoogle // 👈 Thêm hàm vào provider
    }}>
      {children}
    </AuthContext.Provider>
  );
}