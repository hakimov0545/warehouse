import api from './axios'

export const supplierApi = {
  getAll() { return api.get('/api/suppliers') },
  getById(id) { return api.get(`/api/suppliers/${id}`) },
  getByCompany(companyId) { return api.get(`/api/suppliers/company/${companyId}`) },
  create(data) { return api.post('/api/suppliers', data) },
  update(id, data) { return api.put(`/api/suppliers/${id}`, data) },
  delete(id) { return api.delete(`/api/suppliers/${id}`) }
}
