// src/api/apiClient.js
import axios from 'axios';

// Lấy URL từ env (Vercel) và fallback về Railway khi dev hoặc chưa set
const API_BASE = (process.env.REACT_APP_API_URL || 'https://tasknetbe-production.up.railway.app')
  .replace(/\/+$/, ''); // bỏ mọi dấu "/" ở cuối

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: false,
  headers: { 'Content-Type': 'application/json' },
});

// Theo dõi refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  failedQueue = [];
};

// Gắn access token vào mỗi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Xử lý refresh token khi 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Chỉ xử lý 401 có refresh token và chưa retry
    if (err.response?.status === 401 && !originalRequest?._retry && localStorage.getItem('refresh_token')) {
      originalRequest._retry = true;

      if (isRefreshing) {
        // Nếu đang refresh, xếp hàng đợi
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((queueErr) => Promise.reject(queueErr));
      }

      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const res = await axios.post(`${API_BASE}/api/token/refresh/`, { refresh: refreshToken });

        const newAccessToken = res.data.access;
        localStorage.setItem('token', newAccessToken);

        // Cập nhật mặc định và request gốc
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        window.dispatchEvent(new CustomEvent('unauthorized'));
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
