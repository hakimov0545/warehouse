import api from './axios'

export const salesOrderApi = {
  getByCompany(companyId, params = {}) {
    return api.get(`/api/sales-orders/company/${companyId}`, { params })
  },
  getByWarehouse(warehouseId) {
    return api.get(`/api/sales-orders/warehouse/${warehouseId}`)
  },
  getById(id) { return api.get(`/api/sales-orders/${id}`) },
  create(data) { return api.post('/api/sales-orders', data) },
  confirm(id) { return api.post(`/api/sales-orders/${id}/confirm`) },
  cancel(id) { return api.post(`/api/sales-orders/${id}/cancel`) },
  updateStatus(id, status) { return api.post(`/api/sales-orders/${id}/status`, null, { params: { status } }) }
}
