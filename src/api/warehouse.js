import api from './axios'

export const warehouseApi = {
    getByOwner() {
        return api.get('/api/warehouse/get-by-owner')
    },
    getPage(params = {}) {
        return api.get('/api/warehouse/page', { params })
    },
    getById(id) {
        return api.get(`/api/warehouse/get-by-id/${id}`)
    },
    getByCompany(companyId) {
        return api.get(`/api/warehouse/get-by-company/${companyId}`)
    },
    create(formData) {
        return api.post('/api/warehouse/save', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },
    update(id, formData) {
        return api.put(`/api/warehouse/update/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    },
    delete(id) {
        return api.delete(`/api/warehouse/delete/${id}`)
    }
}
