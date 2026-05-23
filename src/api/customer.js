import api from './axios'

export const customerApi = {
  getAll() { return api.get('/api/customers') },
  getById(id) { return api.get(`/api/customers/${id}`) },
  getByCompany(companyId) { return api.get(`/api/customers/company/${companyId}`) },
  create(data) { return api.post('/api/customers', data) },
  update(id, data) { return api.put(`/api/customers/${id}`, data) },
  delete(id) { return api.delete(`/api/customers/${id}`) }
}
