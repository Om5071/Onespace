import axiosClient from './axiosClient';

export const documentApi = {
  getDocuments: (params) => axiosClient.get('/documents', { params }),
  uploadDocument: (formData) =>
    axiosClient.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  downloadUrl: (id) => {
    const token = localStorage.getItem('onespace_access_token');
    return `/api/documents/${id}/download${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },
  viewUrl: (id) => {
    const token = localStorage.getItem('onespace_access_token');
    return `/api/documents/${id}/view${token ? `?token=${encodeURIComponent(token)}` : ''}`;
  },
  updateMetadata: (id, data) => axiosClient.put(`/documents/${id}`, data),
  renameDocument: (id, originalName) => axiosClient.put(`/documents/${id}/rename`, { originalName }),
  deleteDocument: (id) => axiosClient.delete(`/documents/${id}`)
};
