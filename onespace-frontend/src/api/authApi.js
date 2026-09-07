import axiosClient from './axiosClient';

export const authApi = {
  login: (credentials) => axiosClient.post('/auth/login', credentials),
  register: (userData) => axiosClient.post('/auth/register', userData),
  getMe: () => axiosClient.get('/auth/me'),
  updateProfile: (profileData) => axiosClient.put('/auth/profile', profileData)
};
