import api from '@shared/api/base'

export const purchaseOrderApi = {
  getByCompany(companyId, params = {}) {
    return api.get(`/api/purchase-orders/company/${companyId}`, { params })
  },
  getByWarehouse(warehouseId) {
    return api.get(`/api/purchase-orders/warehouse/${warehouseId}`)
  },
  getById(id) { return api.get(`/api/purchase-orders/${id}`) },
  create(data) { return api.post('/api/purchase-orders', data) },
  submit(id) { return api.post(`/api/purchase-orders/${id}/submit`) },
  approve(id) { return api.post(`/api/purchase-orders/${id}/approve`) },
  receive(id, data) { return api.post(`/api/purchase-orders/${id}/receive`, data) },
  cancel(id) { return api.post(`/api/purchase-orders/${id}/cancel`) }
}
