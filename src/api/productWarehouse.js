import api from './axios'

export const productWarehouseApi = {
    getAll() {
        return api.get('/api/product-warehouse')
    },
    getById(id) {
        return api.get(`/api/product-warehouse/${id}`)
    },
    getByWarehouse(warehouseId) {
        return api.get(`/api/product-warehouse/warehouse/${warehouseId}`)
    },
    getByProduct(productId) {
        return api.get(`/api/product-warehouse/product/${productId}`)
    },
    getByProductAndWarehouse(productId, warehouseId) {
        return api.get(`/api/product-warehouse/product/${productId}/warehouse/${warehouseId}`)
    },
    getPage(params = {}) {
        return api.get('/api/product-warehouse/page', { params })
    },
    create(data) {
        return api.post('/api/product-warehouse', data)
    },
    update(id, data) {
        return api.put(`/api/product-warehouse/${id}`, data)
    },
    delete(id) {
        return api.delete(`/api/product-warehouse/${id}`)
    }
}
