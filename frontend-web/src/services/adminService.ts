import { mockAdminDashboard } from '../mocks/data'
import type { AdminDashboard, AdminResultRecord } from '../types'
import { simulateRequest } from './apiClient'

export const adminService = {
  async getDashboard() {
    return simulateRequest<AdminDashboard>(
      '/api/admin/dashboard',
      () => mockAdminDashboard,
      'Dashboard mock consultado.',
    )
  },

  async getResults() {
    return simulateRequest<AdminResultRecord[]>(
      '/api/admin/results',
      () => mockAdminDashboard.recentResults,
      'Listado mock de resultados consultado.',
    )
  },

  async exportReport(format: 'pdf' | 'csv' | 'excel') {
    return simulateRequest<{ format: string; status: string }>(
      '/api/admin/reports/export',
      () => ({
        format,
        status: `Exportación mock ${format.toUpperCase()} lista para conectar al backend.`,
      }),
      'Exportación mock preparada.',
    )
  },
}
