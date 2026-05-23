import api from '@shared/api/base'

export const userApi = {
    getAll() {
        return api.get('/api/user')
    },
    getPage(params = {}) {
        return api.get('/api/user/page', { params })
    }
}
