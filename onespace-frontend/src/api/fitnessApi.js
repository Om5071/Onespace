import axiosClient from './axiosClient';

export const fitnessApi = {
  getRecords: (params) => axiosClient.get('/fitness', { params }),
  createRecord: (data) => axiosClient.post('/fitness', data),
  updateRecord: (id, data) => axiosClient.put(`/fitness/${id}`, data),
  deleteRecord: (id) => axiosClient.delete(`/fitness/${id}`),
  getWeightHistory: () => axiosClient.get('/fitness/weight-history'),

  // Helper wrappers
  getTodayRecord: async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await axiosClient.get('/fitness', { params: { range: 'daily' } });
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        const item = res.data[0];
        return {
          success: true,
          data: {
            ...item,
            weightKg: item.bodyWeightKg || item.bodyWeight,
            waterIntakeMl: 2500
          }
        };
      }
      return { success: true, data: { steps: 0, waterIntakeMl: 2500, caloriesBurned: 0, weightKg: null, workouts: [] } };
    } catch {
      return { success: true, data: { steps: 0, waterIntakeMl: 2500, caloriesBurned: 0, weightKg: null, workouts: [] } };
    }
  },

  getFitnessHistory: async (days = 14) => {
    try {
      const res = await axiosClient.get('/fitness', { params: { limit: days } });
      return res;
    } catch (err) {
      return { success: false, data: [] };
    }
  },

  getFitnessStats: async () => {
    try {
      const res = await axiosClient.get('/fitness');
      return res;
    } catch {
      return { success: true, data: {} };
    }
  },

  createOrUpdateFitnessRecord: (data) => {
    return axiosClient.post('/fitness', {
      date: data.date,
      steps: data.steps,
      caloriesBurned: data.caloriesBurned,
      bodyWeightKg: data.weightKg,
      durationMinutes: data.durationMinutes || 30
    });
  },

  addWorkout: (data) => {
    return axiosClient.post('/fitness', {
      workoutType: data.type || 'Strength',
      durationMinutes: data.durationMinutes,
      caloriesBurned: data.caloriesBurned,
      notes: data.notes,
      type: 'workout'
    });
  }
};
