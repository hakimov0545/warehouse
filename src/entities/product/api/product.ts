import api from '@shared/api/base'

export const productApi = {
    getAll() {
        return api.get('/api/product')
    },
    getById(id) {
        return api.get(`/api/product/${id}`)
    },
    getByCategory(categoryId) {
        return api.get(`/api/product/category/${categoryId}`)
    },
    getPage(params = {}) {
        return api.get('/api/product/page', { params })
    },
    create(data) {
        return api.post('/api/product', data)
    },
    update(id, data) {
        return api.put(`/api/product/${id}`, data)
    },
    delete(id) {
        return api.delete(`/api/product/${id}`)
    }
}

