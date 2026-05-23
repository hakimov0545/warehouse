import api from './axios'

export const stockMovementApi = {
  getByReference(referenceType, referenceId) {
    return api.get('/api/stock-movements/by-reference', { params: { referenceType, referenceId } })
  },
  getByInventory(productVariantWarehouseId, params = {}) {
    return api.get(`/api/stock-movements/by-inventory/${productVariantWarehouseId}`, { params })
  }
}
