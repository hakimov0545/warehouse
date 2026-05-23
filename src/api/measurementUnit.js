import api from './axios'

export const measurementUnitApi = {
    getAll() {
        return api.get('/api/measurement-unit')
    },
    getById(id) {
        return api.get(`/api/measurement-unit/${id}`)
    },
    create(data) {
        return api.post('/api/measurement-unit', data)
    },
    update(id, data) {
        return api.put(`/api/measurement-unit/${id}`, data)
    },
    delete(id) {
        return api.delete(`/api/measurement-unit/${id}`)
    }
}
