import api from '@shared/api/base'

export const permissionApi = {
    // Non-admin permissions, assignable to company roles.
    getAll() {
        return api.get('/api/permission/get-all')
    },
    getById(id) {
        return api.get(`/api/permission/get-by-id/${id}`)
    }
}
