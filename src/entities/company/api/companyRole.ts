import api from '@shared/api/base'

export const companyRoleApi = {
    create(data) {
        return api.post('/api/company-role', data)
    },
    getById(id) {
        return api.get(`/api/company-role/get-by-id/${id}`)
    },
    getByCompanyId(companyId) {
        return api.get(`/api/company-role/get-by-company-id/${companyId}`)
    },
    update(id, data) {
        return api.put(`/api/company-role/update/${id}`, data)
    },
    delete(id) {
        return api.delete(`/api/company-role/${id}`)
    }
}
