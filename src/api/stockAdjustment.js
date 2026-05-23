import api from './axios'

export const stockAdjustmentApi = {
  getByCompany(companyId, params = {}) {
    return api.get(`/api/adjustments/company/${companyId}`, { params })
  },
  getById(id) { return api.get(`/api/adjustments/${id}`) },
  create(data) { return api.post('/api/adjustments', data) },
  approve(id) { return api.post(`/api/adjustments/${id}/approve`) },
  reject(id) { return api.post(`/api/adjustments/${id}/reject`) },
  apply(id) { return api.post(`/api/adjustments/${id}/apply`) }
}
