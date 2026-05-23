import api from './axios'

export const adminApi = {
    getDashboardStatistics() {
        return api.get('/api/admin/dashboard/statistics')
    }
}
