import api from './axios'

export const companyUserApi = {
    getByCompany(companyId) {
        return api.get(`/api/company-user/get-by-warehouse/${companyId}`)
    },
    getInvitations() {
        return api.get('/api/company-user/get-invitations')
    },
    getAcceptedByUser() {
        return api.get('/api/company-user/get-accepted-by-user')
    },
    getByUserIdAndCompanyId(companyId) {
        return api.get('/api/company-user/get-by-user-id-and-company-id', {
            params: { companyId }
        })
    },
    save(data) {
        return api.post('/api/company-user/save', data)
    },
    accept(id) {
        return api.put(`/api/company-user/${id}/accept`)
    },
    reject(id) {
        return api.post(`/api/company-user/${id}/reject`)
    },
    delete(id) {
        return api.delete(`/api/company-user/${id}`)
    }
}
