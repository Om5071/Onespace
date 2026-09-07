import axiosClient from './axiosClient';

export const searchApi = {
  search: (q, type) => axiosClient.get('/search', { params: { q, type } })
};
