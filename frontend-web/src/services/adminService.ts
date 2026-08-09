import {
  mockAdminCatalogs,
  mockAdminDashboard,
  mockRoleActivityAssignments,
  storageKeys,
} from '../mocks/data'
import type {
  AdminCatalogs,
  AdminDashboard,
  AdminReportFilters,
  AdminResultRecord,
  RoleActivity,
  RoleActivityAssignment,
  UserRole,
} from '../types'
import { readStorage, writeStorage } from '../utils/storage'
import { simulateRequest } from './apiClient'
import { getUsers, saveUsers, toUserProfile } from './authStorage'

function cloneRoleAssignments(assignments: RoleActivityAssignment[]) {
  return assignments.map((assignment) => ({
    ...assignment,
    activities: assignment.activities.map((activity) => ({ ...activity })),
  }))
}

function cloneCatalogs(catalogs: AdminCatalogs): AdminCatalogs {
  return {
    areas: catalogs.areas.map((area) => ({ ...area })),
    programs: catalogs.programs.map((program) => ({ ...program })),
    tests: catalogs.tests.map((test) => ({ ...test })),
  }
}

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

  async exportReport(
    format: 'pdf' | 'csv' | 'excel',
    filters: AdminReportFilters = {},
  ) {
    return simulateRequest<{ format: string; status: string; filters: AdminReportFilters }>(
      'mock://admin/reports/export',
      () => ({
        format,
        filters,
        status: `Exportación mock ${format.toUpperCase()} preparada. No se descargó un archivo real.`,
      }),
      'Exportación mock preparada.',
    )
  },

  async getRoleActivityAssignments() {
    return simulateRequest<RoleActivityAssignment[]>(
      '/api/v1/roles/{id}/actividades',
      () => {
        const stored = readStorage<RoleActivityAssignment[]>(storageKeys.roleActivities, [])
        if (stored.length > 0) {
          return cloneRoleAssignments(stored)
        }

        const seeded = cloneRoleAssignments(mockRoleActivityAssignments)
        writeStorage(storageKeys.roleActivities, seeded)
        return seeded
      },
      'Roles y actividades consultados desde el mock local.',
    )
  },

  async saveRoleActivities(role: UserRole, activities: RoleActivity[]) {
    return simulateRequest<RoleActivityAssignment>(
      `/api/v1/roles/${role}/actividades`,
      () => {
        const current = readStorage<RoleActivityAssignment[]>(
          storageKeys.roleActivities,
          cloneRoleAssignments(mockRoleActivityAssignments),
        )
        const assignmentIndex = current.findIndex((assignment) => assignment.role === role)
        if (assignmentIndex < 0) {
          throw new Error('El rol seleccionado ya no está disponible.')
        }

        const updatedAssignment = {
          ...current[assignmentIndex],
          activities: activities.map((activity) => ({ ...activity })),
        }
        const next = cloneRoleAssignments(current)
        next[assignmentIndex] = updatedAssignment
        writeStorage(storageKeys.roleActivities, next)
        return updatedAssignment
      },
      'Cambios guardados únicamente en el mock local.',
    )
  },

  async updateUserRole(userId: string, role: UserRole) {
    return simulateRequest(
      `/api/v1/usuarios/${userId}/rol`,
      () => {
        const users = getUsers()
        const userIndex = users.findIndex((user) => user.id === userId)
        if (userIndex < 0) {
          throw new Error('El usuario seleccionado ya no está disponible.')
        }

        const nextUsers = [...users]
        nextUsers[userIndex] = { ...nextUsers[userIndex], role }
        saveUsers(nextUsers)
        return toUserProfile(nextUsers[userIndex])
      },
      'Rol guardado únicamente en el mock local.',
    )
  },

  async getCatalogs() {
    return simulateRequest<AdminCatalogs>(
      'mock://admin/catalogs',
      () => {
        const stored = readStorage<AdminCatalogs | null>(storageKeys.adminCatalogs, null)
        if (stored) {
          return cloneCatalogs(stored)
        }

        const seeded = cloneCatalogs(mockAdminCatalogs)
        writeStorage(storageKeys.adminCatalogs, seeded)
        return seeded
      },
      'Catálogos consultados desde el mock local.',
    )
  },

  async saveCatalogs(catalogs: AdminCatalogs) {
    return simulateRequest<AdminCatalogs>(
      'mock://admin/catalogs',
      () => {
        const next = cloneCatalogs(catalogs)
        writeStorage(storageKeys.adminCatalogs, next)
        return next
      },
      'Catálogos guardados únicamente en el mock local.',
    )
  },
}
