import api from './axios'

export const sellingApi = {
    getAll() {
        return api.get('/api/selling/get-all')
    },
    getById(id) {
        return api.get(`/api/selling/${id}`)
    },
    getByProduct(productId) {
        return api.get(`/api/selling/get-by-product/${productId}`)
    },
    getByWarehouse(warehouseId) {
        return api.get(`/api/selling/get-by-warehouse/${warehouseId}`)
    },
    create(data) {
        return api.post('/api/selling', data)
    },
    delete(id) {
        return api.delete(`/api/selling/${id}`)
    }
}
