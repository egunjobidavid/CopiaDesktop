import api from './client';

export const locationsApi = {
  list: (type?: string) => api.get(`/locations${type ? `?type=${type}` : ''}`),
  get: (id: string) => api.get(`/locations/${id}`),
  create: (data: any) => api.post('/locations', data),
  update: (id: string, data: any) => api.patch(`/locations/${id}`, data),
  delete: (id: string) => api.delete(`/locations/${id}`),
};
