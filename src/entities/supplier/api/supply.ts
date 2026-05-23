import api from '@shared/api/base'

export const supplyApi = {
    getAll() {
        return api.get('/api/supply/get-all')
    },
    getById(id) {
        return api.get(`/api/supply/${id}`)
    },
    getByProduct(productId) {
        return api.get(`/api/supply/get-by-product/${productId}`)
    },
    getByWarehouse(warehouseId) {
        return api.get(`/api/supply/get-by-warehouse/${warehouseId}`)
    },
    create(data) {
        return api.post('/api/supply', data)
    },
    delete(id) {
        return api.delete(`/api/supply/${id}`)
    }
}
