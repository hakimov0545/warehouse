import api from './axios'

export const warehouseTransferApi = {
  getByCompany(companyId, params = {}) {
    return api.get(`/api/transfers/company/${companyId}`, { params })
  },
  getById(id) { return api.get(`/api/transfers/${id}`) },
  create(data) { return api.post('/api/transfers', data) },
  dispatch(id) { return api.post(`/api/transfers/${id}/dispatch`) },
  receive(id, data) { return api.post(`/api/transfers/${id}/receive`, data) },
  cancel(id) { return api.post(`/api/transfers/${id}/cancel`) }
}
