import api from './client';

export const departmentsApi = {
  list: () => api.get('/departments'),
  get: (id: string) => api.get(`/departments/${id}`),
  create: (data: { name: string; description?: string; headId?: string }) => api.post('/departments', data),
  update: (id: string, data: { name?: string; description?: string; headId?: string }) => api.patch(`/departments/${id}`, data),
  delete: (id: string) => api.delete(`/departments/${id}`),
};
