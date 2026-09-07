import axiosClient from './axiosClient';

export const dashboardApi = {
  getSummary: () => axiosClient.get('/dashboard/summary'),
  getDashboardSummary: () => axiosClient.get('/dashboard/summary')
};
