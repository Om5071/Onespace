import axiosClient from './axiosClient';

export const taskApi = {
  getTasks: (params) => axiosClient.get('/tasks', { params }),
  getTaskById: (id) => axiosClient.get(`/tasks/${id}`),
  createTask: (taskData) => axiosClient.post('/tasks', taskData),
  updateTask: (id, taskData) => axiosClient.put(`/tasks/${id}`, taskData),
  updateStatus: (id, status) => axiosClient.patch(`/tasks/${id}/status`, { status }),
  deleteTask: (id) => axiosClient.delete(`/tasks/${id}`)
};
