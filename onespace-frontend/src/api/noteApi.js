import axiosClient from './axiosClient';

export const noteApi = {
  getNotes: (params) => axiosClient.get('/notes', { params }),
  getNoteById: (id) => axiosClient.get(`/notes/${id}`),
  createNote: (noteData) => axiosClient.post('/notes', noteData),
  updateNote: (id, noteData) => axiosClient.put(`/notes/${id}`, noteData),
  togglePin: (id) => axiosClient.patch(`/notes/${id}/pin`),
  deleteNote: (id) => axiosClient.delete(`/notes/${id}`),
  getCategories: async () => {
    try {
      const res = await axiosClient.get('/notes');
      if (res.success && Array.isArray(res.data)) {
        const unique = [...new Set(res.data.map((n) => n.category).filter(Boolean))];
        const defaults = ['Work', 'Personal', 'Finance', 'Ideas', 'Learning', 'Health'];
        const allCats = [...new Set([...defaults, ...unique])];
        return { success: true, data: allCats };
      }
      return { success: true, data: ['Work', 'Personal', 'Finance', 'Ideas', 'Learning', 'Health'] };
    } catch {
      return { success: true, data: ['Work', 'Personal', 'Finance', 'Ideas', 'Learning', 'Health'] };
    }
  }
};
