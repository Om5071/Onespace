import axiosClient from './axiosClient';

export const notificationApi = {
  getNotifications: (params) => axiosClient.get('/notifications', { params }),
  markAsRead: (id) => axiosClient.patch(`/notifications/${id}/read`),
  markAsUnread: (id) => axiosClient.patch(`/notifications/${id}/unread`),
  markAllAsRead: () => axiosClient.patch('/notifications/read-all'),
  deleteNotification: (id) => axiosClient.delete(`/notifications/${id}`),

  // Web Push Subscriptions
  getVapidPublicKey: () => axiosClient.get('/notifications/vapid-public-key'),
  subscribePush: (subscription) => axiosClient.post('/notifications/subscribe', subscription),
  unsubscribePush: (endpoint) => axiosClient.post('/notifications/unsubscribe', { endpoint }),
  sendTestPush: () => axiosClient.post('/notifications/test-push')
};

export default notificationApi;
