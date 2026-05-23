import api from '@shared/api/base'

export const attributeApi = {
    getAll() {
        return api.get('/api/attribute')
    },
    getById(id) {
        return api.get(`/api/attribute/${id}`)
    },
    create(data) {
        return api.post('/api/attribute', data)
    },
    update(id, data) {
        return api.put(`/api/attribute/${id}`, data)
    },
    delete(id) {
        return api.delete(`/api/attribute/${id}`)
    }
}
