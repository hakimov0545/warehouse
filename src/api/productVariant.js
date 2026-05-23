import api from './axios'

export const productVariantApi = {
    getAll() {
        return api.get('/api/product-variant')
    },
    getById(id) {
        return api.get(`/api/product-variant/${id}`)
    },
    getByProduct(productId) {
        return api.get(`/api/product-variant/product/${productId}`)
    },
    getByBarcode(barcode) {
        return api.get(`/api/product-variant/barcode/${barcode}`)
    },
    create(data) {
        return api.post('/api/product-variant', data)
    },
    update(id, data) {
        return api.put(`/api/product-variant/${id}`, data)
    },
    delete(id) {
        return api.delete(`/api/product-variant/${id}`)
    }
}
