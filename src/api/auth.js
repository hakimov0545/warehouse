import api from './axios'

export const authApi = {
    login(credentials) {
        return api.post('/api/user/login', credentials)
    },
    register(data) {
        return api.post('/api/user/register-owner', data)
    },
    getProfile() {
        return api.get('/api/user/profile')
    }
}
