import axiosClient from './axiosClient';

export const searchApi = {
  search: (q, type) => axiosClient.get('/search', { params: { q, type } })
};

export const analyticsApi = {
  getAnalytics: (days) => axiosClient.get('/analytics', { params: { days } })
};

export const dashboardApi = {
  getSummary: () => axiosClient.get('/dashboard/summary')
};

export const settingsApi = {
  getSettings: () => axiosClient.get('/settings'),
  updateSettings: (data) => axiosClient.put('/settings', data),
  updateProfile: (profileData) => axiosClient.put('/settings/profile', profileData),
  updatePassword: (passwordData) => axiosClient.put('/settings/password', passwordData),
  updateNotifications: (notificationPrefs) => axiosClient.put('/settings/notifications', notificationPrefs),
  updateTheme: (theme) => axiosClient.put('/settings/theme', { theme }),
  exportDataUrl: () => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('onespace_access_token') : null;
    return `/api/settings/export${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },
  getExportUrl: () => {
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem('onespace_access_token') : null;
    return `/api/settings/export${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },
  deleteAccount: () => axiosClient.delete('/settings/account')
};
