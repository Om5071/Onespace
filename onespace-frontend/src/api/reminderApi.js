import axiosClient from './axiosClient';

export const reminderApi = {
  getReminders: (params) => axiosClient.get('/reminders', { params }),
  createReminder: (reminderData) => axiosClient.post('/reminders', reminderData),
  updateReminder: (id, reminderData) => axiosClient.put(`/reminders/${id}`, reminderData),
  completeReminder: (id) => axiosClient.patch(`/reminders/${id}/complete`),
  snoozeReminder: (id, minutes) => axiosClient.patch(`/reminders/${id}/snooze`, { minutes }),
  dismissReminder: (id) => axiosClient.patch(`/reminders/${id}/dismiss`),
  deleteReminder: (id) => axiosClient.delete(`/reminders/${id}`)
};
