import { mockAdminCatalogs, storageKeys } from '../mocks/data'
import type {
  AdminAreaCatalogItem,
  AdminCatalogs,
  AdminDashboard,
  AdminProgramCatalogItem,
  AdminReportFilters,
  AdminTestCatalogItem,
  ApiEnvelope,
  RegisteredUserRecord,
  RoleActivity,
  RoleActivityAssignment,
  UserRole,
} from '../types'
import { readStorage, writeStorage } from '../utils/storage'
import { api, simulateRequest } from './apiClient'
import { mapBackendUser, type BackendUsuarioResponse } from './userService'

interface BackendRolResponse {
  id: number | null
  nombreRol: string
}

interface BackendActividadResponse {
  id: number | null
  nombreActividad: string
  metodoHttp: string
  url: string | null
}

interface BackendAreaResponse {
  id: number | null
  nombreArea: string
  perfilPredonimante?: string | null
  descripcionArea?: string | null
  pathLogo?: string | null
}

interface BackendProgramaResponse {
  id: number | null
  nombrePrograma: string
  descripcionPrograma?: string | null
  urlPrograma?: string | null
  idArea: number
}

const ROLE_NAME_TO_ROLE: Record<string, UserRole> = {
  ROOT: 'root',
  ADMINISTRADOR: 'administrator',
  ESTUDIANTE: 'student',
}

const HTTP_METHODS: readonly string[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

function mapRoleName(nombreRol?: string | null): UserRole {
  return ROLE_NAME_TO_ROLE[(nombreRol ?? '').trim().toUpperCase()] ?? 'student'
}

function normalizeMethod(method: string): RoleActivity['method'] {
  const upper = method.trim().toUpperCase()
  return HTTP_METHODS.includes(upper) ? (upper as RoleActivity['method']) : 'GET'
}

function cloneCatalogs(catalogs: AdminCatalogs): AdminCatalogs {
  return {
    areas: catalogs.areas.map((area) => ({ ...area })),
    programs: catalogs.programs.map((program) => ({ ...program })),
    tests: catalogs.tests.map((test) => ({ ...test })),
  }
}

function cloneTests(tests: AdminTestCatalogItem[]): AdminTestCatalogItem[] {
  return tests.map((test) => ({ ...test }))
}

function readStoredTests(): AdminTestCatalogItem[] {
  const stored = readStorage<{ tests?: AdminTestCatalogItem[] } | null>(storageKeys.adminCatalogs, null)
  return stored?.tests?.length ? cloneTests(stored.tests) : cloneTests(mockAdminCatalogs.tests)
}

function toRegisteredRecord(raw: BackendUsuarioResponse): RegisteredUserRecord {
  const profile = mapBackendUser(raw)
  return {
    ...profile,
    normalizedEmail: raw.correo.toLowerCase(),
    normalizedUsername: raw.nombreUsuario?.toLowerCase() ?? undefined,
    passwordMock: '',
  }
}

async function fetchRoleAssignments(): Promise<RoleActivityAssignment[]> {
  const [rolesResponse, allActivitiesResponse] = await Promise.all([
    api.get<BackendRolResponse[]>('/roles'),
    api.get<BackendActividadResponse[]>('/actividades').catch(() => null),
  ])

  const allActivities = allActivitiesResponse?.data ?? []

  return Promise.all(
    rolesResponse.data.map(async (rol) => {
      const roleId = rol.id as number
      let enabledIds = new Set<string>()

      try {
        const activitiesResponse = await api.get<BackendActividadResponse[]>(
          `/roles/${roleId}/actividades`,
        )
        enabledIds = new Set(activitiesResponse.data.map((item) => String(item.id)))
      } catch {
        // El rol no tiene actividades asignadas todavía; se muestran todas inactivas.
      }

      return {
        roleId,
        role: mapRoleName(rol.nombreRol),
        roleLabel: rol.nombreRol,
        activities: allActivities.map((activity) => ({
          id: String(activity.id),
          name: activity.nombreActividad,
          method: normalizeMethod(activity.metodoHttp),
          path: activity.url ?? '',
          enabled: enabledIds.has(String(activity.id)),
        })),
      }
    }),
  )
}

function toAreaRequest(area: AdminAreaCatalogItem) {
  return {
    nombreArea: area.name,
    perfilPredonimante: area.profile,
    descripcionArea: area.description,
    pathLogo: null,
  }
}

function toProgramRequest(program: AdminProgramCatalogItem) {
  const areaId = Number(program.areaId)
  if (!Number.isFinite(areaId)) {
    throw new Error(`El programa "${program.name}" requiere un área válida.`)
  }

  return {
    nombrePrograma: program.name,
    descripcionPrograma: program.description,
    urlPrograma: program.url ?? null,
    pathLogo: null,
    idArea: areaId,
  }
}

async function persistAreaChanges(
  saved: AdminAreaCatalogItem[],
  next: AdminAreaCatalogItem[],
): Promise<Map<string, string>> {
  const idMap = new Map<string, string>()

  for (const item of next) {
    const previous = saved.find((area) => area.id === item.id)

    if (!previous) {
      const created = await api.post<BackendAreaResponse>('/areas', toAreaRequest(item))
      idMap.set(item.id, String(created.data.id))
      item.id = String(created.data.id)
      continue
    }

    if (previous.active && !item.active) {
      await api.delete(`/areas/${item.id}`)
      continue
    }

    if (!previous.active && item.active) {
      await api.patch(`/areas/${item.id}/reactivar`, {})
      continue
    }

    const dataChanged =
      previous.name !== item.name ||
      previous.description !== item.description ||
      previous.profile !== item.profile
    if (dataChanged) {
      await api.put(`/areas/${item.id}`, toAreaRequest(item))
    }
  }

  return idMap
}

async function persistProgramChanges(
  saved: AdminProgramCatalogItem[],
  next: AdminProgramCatalogItem[],
) {
  for (const item of next) {
    const previous = saved.find((program) => program.id === item.id)

    if (!previous) {
      const created = await api.post<BackendProgramaResponse>('/programas', toProgramRequest(item))
      item.id = String(created.data.id)
      continue
    }

    if (previous.active && !item.active) {
      await api.delete(`/programas/${item.id}`)
      continue
    }

    if (!previous.active && item.active) {
      await api.patch(`/programas/${item.id}/reactivar`, {})
      continue
    }

    const dataChanged =
      previous.name !== item.name ||
      previous.description !== item.description ||
      previous.url !== item.url ||
      previous.areaId !== item.areaId
    if (dataChanged) {
      await api.put(`/programas/${item.id}`, toProgramRequest(item))
    }
  }
}

async function fetchDashboard(): Promise<ApiEnvelope<AdminDashboard>> {
  return api.get<AdminDashboard>('/dashboard')
}

export const adminService = {
  async getDashboard() {
    return fetchDashboard()
  },

  async getResults() {
    const response = await fetchDashboard()
    return {
      ...response,
      data: response.data.recentResults,
      endpoint: '/api/v1/dashboard',
    }
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

  async getRoleActivityAssignments(): Promise<{
    data: RoleActivityAssignment[]
    endpoint: string
    mocked: boolean
    requestedAt: string
  }> {
    const data = await fetchRoleAssignments()
    return {
      data,
      endpoint: '/api/v1/roles',
      mocked: false,
      requestedAt: new Date().toISOString(),
    }
  },

  async saveRoleActivities(
    roleId: number,
    activities: RoleActivity[],
  ): Promise<{
    data: RoleActivityAssignment
    endpoint: string
    mocked: boolean
    requestedAt: string
  }> {
    const activityIds = activities
      .filter((activity) => activity.enabled)
      .map((activity) => Number(activity.id))
      .filter((id) => Number.isFinite(id))

    await api.put(`/roles/${roleId}/actividades`, { actividades: activityIds })

    const assignments = await fetchRoleAssignments()
    const assignment = assignments.find((item) => item.roleId === roleId)
    if (!assignment) {
      throw new Error('El rol seleccionado ya no está disponible.')
    }

    return {
      data: assignment,
      endpoint: `/api/v1/roles/${roleId}/actividades`,
      mocked: false,
      requestedAt: new Date().toISOString(),
    }
  },

  async getAdminUsers(): Promise<{
    data: RegisteredUserRecord[]
    endpoint: string
    mocked: boolean
    requestedAt: string
  }> {
    const response = await api.get<BackendUsuarioResponse[]>('/usuarios')
    return {
      data: response.data.map((raw) => toRegisteredRecord(raw)),
      endpoint: '/api/v1/usuarios',
      mocked: false,
      requestedAt: new Date().toISOString(),
    }
  },

  async updateUserRole(
    userId: string,
    role: UserRole,
  ): Promise<{
    data: { role: UserRole }
    endpoint: string
    mocked: boolean
    requestedAt: string
  }> {
    const [usersResponse, rolesResponse] = await Promise.all([
      api.get<BackendUsuarioResponse[]>('/usuarios'),
      api.get<BackendRolResponse[]>('/roles'),
    ])

    const user = usersResponse.data.find((item) => String(item.id) === userId)
    if (!user) {
      throw new Error('El usuario seleccionado ya no está disponible.')
    }

    const targetRole = rolesResponse.data.find((item) => mapRoleName(item.nombreRol) === role)
    if (!targetRole || targetRole.id == null) {
      throw new Error(`El rol "${role}" no está configurado en el servidor.`)
    }

    await api.patch(`/usuarios/${user.id}/rol`, { idRol: targetRole.id })

    return {
      data: { role },
      endpoint: `/api/v1/usuarios/${user.id}/rol`,
      mocked: false,
      requestedAt: new Date().toISOString(),
    }
  },

  async getCatalogs(): Promise<{
    data: AdminCatalogs
    endpoint: string
    mocked: boolean
    requestedAt: string
  }> {
    const [areasResponse, programsResponse] = await Promise.all([
      api.get<BackendAreaResponse[]>('/areas').catch(() => null),
      api.get<BackendProgramaResponse[]>('/programas').catch(() => null),
    ])

    const catalogs: AdminCatalogs = {
      areas: (areasResponse?.data ?? []).map((area) => ({
        id: String(area.id),
        name: area.nombreArea,
        description: area.descripcionArea ?? '',
        profile: area.perfilPredonimante ?? '',
        active: true,
      })),
      programs: (programsResponse?.data ?? []).map((program) => ({
        id: String(program.id),
        name: program.nombrePrograma,
        description: program.descripcionPrograma ?? '',
        areaId: String(program.idArea),
        url: program.urlPrograma ?? undefined,
        active: true,
      })),
      tests: readStoredTests(),
    }

    return {
      data: catalogs,
      endpoint: '/api/v1/areas',
      mocked: false,
      requestedAt: new Date().toISOString(),
    }
  },

  async saveCatalogs(
    catalogs: AdminCatalogs,
    savedCatalogs: AdminCatalogs,
  ): Promise<{
    data: AdminCatalogs
    endpoint: string
    mocked: boolean
    requestedAt: string
  }> {
    const areaIdMap = await persistAreaChanges(savedCatalogs.areas, catalogs.areas)

    for (const program of catalogs.programs) {
      const mappedId = areaIdMap.get(program.areaId)
      if (mappedId) {
        program.areaId = mappedId
      }
    }

    await persistProgramChanges(savedCatalogs.programs, catalogs.programs)
    writeStorage(storageKeys.adminCatalogs, { tests: catalogs.tests })

    return {
      data: cloneCatalogs(catalogs),
      endpoint: '/api/v1/areas',
      mocked: false,
      requestedAt: new Date().toISOString(),
    }
  },
}
