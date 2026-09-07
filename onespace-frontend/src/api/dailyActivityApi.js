import axiosClient from './axiosClient';

export const dailyActivityApi = {
  getByDate: (date) => axiosClient.get(`/daily-activity/${date}`),
  upsertByDate: (date, data) => axiosClient.put(`/daily-activity/${date}`, data),
  getHeatmap: (year) => axiosClient.get('/daily-activity/heatmap', { params: { year } }),

  // Aliases for convenient page-level usage
  getDailyActivity: (date) => axiosClient.get(`/daily-activity/${date}`),
  createOrUpdateDailyActivity: (data) => axiosClient.put(`/daily-activity/${data.date || new Date().toISOString().split('T')[0]}`, data),
  getActivityHistory: (days = 14) => axiosClient.get('/daily-activity/history', { params: { days } })
};

export const dailyTrackerApi = dailyActivityApi;
