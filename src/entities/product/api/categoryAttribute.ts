import api from '@shared/api/base'

export const categoryAttributeApi = {
    getById(id) {
        return api.get(`/api/category-attribute/get-by-id/${id}`)
    },
    getByCategory(categoryId) {
        return api.get(`/api/category-attribute/get-by-category/${categoryId}`)
    },
    create(data) {
        return api.post('/api/category-attribute', data)
    },
    update(id, data) {
        return api.put(`/api/category-attribute/${id}`, data)
    },
    delete(id) {
        return api.delete(`/api/category-attribute/${id}`)
    }
}
