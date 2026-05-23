import api from './axios'

export const companyApi = {
    getByOwner() {
        return api.get('/api/company/get-by-owner')
    },
    getById(id) {
        return api.get(`/api/company/get-by-id/${id}`)
    },
    create(data) {
        return api.post('/api/company/save', data)
    },
    update(id, data) {
        return api.put(`/api/company/update/${id}`, data)
    },
    delete(id) {
        return api.delete(`/api/company/delete/${id}`)
    }
}
