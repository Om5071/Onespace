import axiosClient from './axiosClient';

export const analyticsApi = {
  getAnalytics: (days = 30) => axiosClient.get('/analytics', { params: { days } })
};
