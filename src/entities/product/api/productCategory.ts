import api from '@shared/api/base'

export const productCategoryApi = {
    getAll() {
        return api.get('/api/product-category')
    },
    getRoot() {
        return api.get('/api/product-category/root')
    },
    getChildren(parentId) {
        return api.get(`/api/product-category/parent/${parentId}`)
    },
    getById(id, lang) {
        return api.get(`/api/product-category/${id}`, { params: { lang } })
    },
    getPage(params = {}) {
        return api.get('/api/product-category/page', { params })
    },
    create(data) {
        return api.post('/api/product-category', data)
    },
    update(id, data) {
        return api.put(`/api/product-category/${id}`, data)
    },
    delete(id) {
        return api.delete(`/api/product-category/${id}`)
    }
}
