import api from '@shared/api/base'

export const batchApi = {
  getById(id) { return api.get(`/api/batches/${id}`) },
  create(data) { return api.post('/api/batches', data) },
  addStock(batchId, warehouseId, quantity) {
    return api.post(`/api/batches/${batchId}/warehouse/${warehouseId}/add`, null, {
      params: { quantity }
    })
  },
  getWarehouseInventory(warehouseId) {
    return api.get(`/api/batches/warehouse/${warehouseId}/inventory`)
  },
  getByProductVariant(productVariantId) {
    return api.get(`/api/batches/product-variant/${productVariantId}`)
  },
  getExpiring(days = 30) {
    return api.get('/api/batches/expiring', { params: { days } })
  },
  getExpired() { return api.get('/api/batches/expired') }
}
