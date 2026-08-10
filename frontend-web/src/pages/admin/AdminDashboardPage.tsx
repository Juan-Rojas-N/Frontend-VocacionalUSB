import { useEffect, useMemo, useState } from 'react'
import { adminService } from '../../services/adminService'
import { useAuthStore } from '../../stores/authStore'
import type { AdminDashboard, AdminResultRecord } from '../../types'
import { getUserRoleLabel } from '../../utils/roles'
import { AdminCatalogSettingsView } from './components/AdminCatalogSettingsView'
import { AdminOverviewView } from './components/AdminOverviewView'
import { AdminReportsView } from './components/AdminReportsView'
import { AdminResultsView } from './components/AdminResultsView'
import { RootRoleActivitiesView } from './components/RootRoleActivitiesView'
import { RootUserRolesView } from './components/RootUserRolesView'

type AdminView = 'overview' | 'results' | 'reports' | 'catalogs'
type RootView = 'overview' | 'role-activities' | 'user-roles' | 'catalogs'
type DashboardView = AdminView | RootView

interface ResultCard {
  id: string
  userName: string
  city: string
  primaryArea: string
  programs: Array<{
    id: string
    name: string
    affinity: number
  }>
}

const ADMIN_NAV_ITEMS: Array<{ id: AdminView; label: string }> = [
  { id: 'overview', label: 'Resumen general' },
  { id: 'results', label: 'Resultados' },
  { id: 'reports', label: 'Reportes' },
  { id: 'catalogs', label: 'Configuración' },
]

const ROOT_NAV_ITEMS: Array<{ id: RootView; label: string }> = [
  { id: 'overview', label: 'Resumen general' },
  { id: 'role-activities', label: 'Roles - Actividades' },
  { id: 'user-roles', label: 'Usuarios - Modificar rol' },
  { id: 'catalogs', label: 'Configuración' },
]

export function AdminDashboardPage() {
  const sessionUser = useAuthStore((state) => state.sessionUser)
  const isRoot = sessionUser?.role === 'root'
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)
  const [rows, setRows] = useState<AdminResultRecord[]>([])
  const [dashboardError, setDashboardError] = useState('')
  const [activeView, setActiveView] = useState<DashboardView>('overview')
  const [exportStatus, setExportStatus] = useState('')

  useEffect(() => {
    let active = true
    void Promise.all([adminService.getDashboard(), adminService.getResults()])
      .then(([dashboardResponse, rowsResponse]) => {
        if (active) {
          setDashboard(dashboardResponse.data)
          setRows(rowsResponse.data)
        }
      })
      .catch((error: unknown) => {
        if (active) {
          setDashboardError(
            error instanceof Error ? error.message : 'No fue posible cargar el panel administrativo.',
          )
        }
      })

    return () => {
      active = false
    }
  }, [isRoot])

  const resultCards = useMemo<ResultCard[]>(() => {
    return rows.map((row) => ({
      id: row.id,
      userName: row.studentName,
      city: row.city,
      primaryArea: row.primaryArea,
      programs: row.topCareer
        ? [
            {
              id: `${row.id}-career`,
              name: row.topCareer,
              affinity: row.affinity,
            },
          ]
        : [],
    }))
  }, [rows])

  async function handleOverviewExport(format: 'pdf' | 'csv' | 'excel') {
    try {
      setExportStatus('Preparando exportación mock...')
      const response = await adminService.exportReport(format)
      setExportStatus(response.data.status)
    } catch (error) {
      setExportStatus(
        error instanceof Error ? error.message : 'No fue posible preparar la exportación.',
      )
    }
  }

  if (!sessionUser) {
    return <div className="loading-state">Cargando sesión...</div>
  }

  if (dashboardError) {
    return (
      <div className="panel-administracion panel-administracion--state">
        <section className="admin-error-state" role="alert">
          <h1>No fue posible cargar el panel</h1>
          <p>{dashboardError}</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </section>
      </div>
    )
  }

  if (!dashboard) {
    return <div className="loading-state">Cargando panel administrativo...</div>
  }

  const navItems = isRoot ? ROOT_NAV_ITEMS : ADMIN_NAV_ITEMS

  return (
    <div className="panel-administracion">
      <section className="panel-administracion__contenedor">
        <aside className="navegacion-administracion">
          <div className="navegacion-administracion__perfil">
            <div className="navegacion-administracion__avatar" aria-hidden="true">
              {sessionUser.firstName.slice(0, 1)}
            </div>
            <div>
              <span>Bienvenido</span>
              <strong>{sessionUser.fullName}</strong>
              <small>{getUserRoleLabel(sessionUser.role)}</small>
            </div>
          </div>

          <nav className="navegacion-administracion__menu" aria-label="Módulo administrativo">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`navegacion-administracion__item${activeView === item.id ? ' navegacion-administracion__item--activo' : ''}`}
                aria-current={activeView === item.id ? 'page' : undefined}
                onClick={() => setActiveView(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>


        </aside>

        <div className="panel-administracion__contenido">
          <div className="panel-administracion__scroll">
            {activeView === 'overview' && dashboard ? (
              <AdminOverviewView
                dashboard={dashboard}
                rows={rows}
                exportStatus={exportStatus}
                onExport={(format) => void handleOverviewExport(format)}
              />
            ) : null}

            {!isRoot && activeView === 'results' ? (
              <AdminResultsView cards={resultCards} />
            ) : null}

            {!isRoot && activeView === 'reports' ? <AdminReportsView /> : null}

            {activeView === 'catalogs' ? <AdminCatalogSettingsView /> : null}

            {isRoot && activeView === 'role-activities' ? <RootRoleActivitiesView /> : null}

            {isRoot && activeView === 'user-roles' ? <RootUserRolesView /> : null}
          </div>
        </div>
      </section>
    </div>
  )
}
