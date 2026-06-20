import api from './client';

export const staffApi = {
  list: () => api.get('/staff'),
  get: (id: string) => api.get(`/staff/${id}`),
  create: (data: { userId?: string; email?: string; fullName?: string; departmentId?: string; defaultLocationId?: string; jobTitle: string; employeeCode?: string }) => api.post('/staff', data),
  update: (id: string, data: any) => api.patch(`/staff/${id}`, data),
  delete: (id: string) => api.delete(`/staff/${id}`),
};
