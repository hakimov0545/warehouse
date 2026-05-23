import api from '@shared/api/base'

export const reportingApi = {
  getAdminDashboard() {
    return api.get('/api/admin/dashboard/statistics')
  },
  getWarehouseKpi(warehouseId, from, to) {
    return api.get(`/api/reports/warehouse/${warehouseId}/kpi`, { params: { from, to } })
  }
}
