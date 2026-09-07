import axiosClient from './axiosClient';

export const calendarApi = {
  getEvents: (params) => axiosClient.get('/calendar', { params }),
  createEvent: (eventData) => axiosClient.post('/calendar', eventData),
  updateEvent: (id, eventData) => axiosClient.put(`/calendar/${id}`, eventData),
  deleteEvent: (id) => axiosClient.delete(`/calendar/${id}`)
};
