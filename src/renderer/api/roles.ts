import api from './client';

export const rolesApi = {
  list: () => api.get('/tenants/roles'),
  get: (id: string) => api.get(`/tenants/roles/${id}`),
  create: (data: { name: string; level: number }) => api.post('/tenants/roles', data),
  update: (id: string, data: { name?: string; level?: number }) => api.patch(`/tenants/roles/${id}`, data),
  delete: (id: string) => api.delete(`/tenants/roles/${id}`),
  getModules: (id: string) => api.get(`/tenants/roles/${id}/modules`),
  setModules: (id: string, modules: string[]) => api.put(`/tenants/roles/${id}/modules`, { modules }),
};
