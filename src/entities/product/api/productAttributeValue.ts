import api from '@shared/api/base'

export const productAttributeValueApi = {
    getById(id) {
        return api.get(`/api/product-variant-attribute-value/get-by-id/${id}`)
    },
    getByProductVariant(productVariantId) {
        return api.get(`/api/product-variant-attribute-value/get-by-product-variant-id/${productVariantId}`)
    },
    create(data) {
        return api.post('/api/product-variant-attribute-value', data)
    },
    update(id, data) {
        return api.put(`/api/product-variant-attribute-value/${id}`, data)
    },
    delete(id) {
        return api.delete(`/api/product-variant-attribute-value/${id}`)
    }
}
