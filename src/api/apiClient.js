// src/api/apiClient.js
import axios from 'axios';

const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Biến để theo dõi quá trình làm mới token
let isRefreshing = false;
// Mảng để lưu trữ các request đang chờ được thực hiện lại
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add token to requests
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle refresh token on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config;

    // Chỉ xử lý lỗi 401 và khi có refresh token
    if (err.response?.status === 401 && localStorage.getItem('refresh_token')) {
      if (isRefreshing) {
        // Nếu đang có một request refresh khác chạy, hãy "xếp hàng" request này
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
        .then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return api(originalRequest);
        })
        .catch(err => {
          return Promise.reject(err);
        });
      }
      
      // Đánh dấu là đang bắt đầu quá trình refresh
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken = res.data.access;
        
        // Lưu token mới
        localStorage.setItem('token', newAccessToken);
        
        // Cập nhật header cho các request mặc định sau này
        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        
        // Cập nhật header cho request gốc bị lỗi
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        // Thực hiện lại tất cả các request đang chờ trong hàng đợi
        processQueue(null, newAccessToken);

        // Thực hiện lại request gốc
        return api(originalRequest);
        
      } catch (refreshErr) {
        // Nếu refresh thất bại, logout người dùng
        processQueue(refreshErr, null);
        
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        
        // Gửi sự kiện để AuthContext có thể bắt và cập nhật UI
        window.dispatchEvent(new CustomEvent('unauthorized'));
        
        return Promise.reject(refreshErr);

      } finally {
        // Hoàn tất quá trình refresh
        isRefreshing = false;
      }
    }

    return Promise.reject(err);
  }
);

export default api;
