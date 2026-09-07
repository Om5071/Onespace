import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach bearer token
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('onespace_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle token refresh on 401
axiosClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('onespace_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { token: refreshToken });
          if (res.data?.success) {
            const { accessToken, refreshToken: newRefreshToken } = res.data.data;
            localStorage.setItem('onespace_access_token', accessToken);
            localStorage.setItem('onespace_refresh_token', newRefreshToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return axiosClient(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('onespace_access_token');
          localStorage.removeItem('onespace_refresh_token');
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosClient;
