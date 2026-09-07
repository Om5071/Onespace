import axiosClient from './axiosClient';

export const goalApi = {
  getGoals: (params) => axiosClient.get('/goals', { params }),
  getGoalById: (id) => axiosClient.get(`/goals/${id}`),
  createGoal: (data) => axiosClient.post('/goals', data),
  updateGoal: (id, data) => axiosClient.put(`/goals/${id}`, data),
  logProgress: (id, data) => axiosClient.post(`/goals/${id}/progress`, data),
  deleteGoal: (id) => axiosClient.delete(`/goals/${id}`)
};
