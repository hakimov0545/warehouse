import api from './axios'

export const productVariantUnitApi = {
    getById(id) {
        return api.get(`/api/product-variant-unit/get-by-id/${id}`)
    },
    getByProductVariant(productVariantId) {
        return api.get(`/api/product-variant-unit/get-by-product-variant-id/${productVariantId}`)
    },
    create(data) {
        return api.post('/api/product-variant-unit', data)
    },
    update(id, data) {
        return api.put(`/api/product-variant-unit/${id}`, data)
    },
    delete(id) {
        return api.delete(`/api/product-variant-unit/${id}`)
    }
}
