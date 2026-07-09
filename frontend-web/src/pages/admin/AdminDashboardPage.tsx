import { useEffect, useMemo, useState } from 'react'
import { mockResult, storageKeys, defaultMockUsers } from '../../mocks/data'
import { adminService } from '../../services/adminService'
import { useAuthStore } from '../../stores/authStore'
import type { AdminDashboard, AdminResultRecord, RegisteredUserRecord } from '../../types'
import { readStorage } from '../../utils/storage'

type AdminView = 'overview' | 'users' | 'results' | 'reports' | 'settings'

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

const navItems: Array<{ id: AdminView; label: string }> = [
  { id: 'overview', label: 'Resumen general' },
  { id: 'users', label: 'Usuarios' },
  { id: 'results', label: 'Resultados' },
  { id: 'reports', label: 'Reportes' },
  { id: 'settings', label: 'Configuración' },
]

export function AdminDashboardPage() {
  const sessionUser = useAuthStore((state) => state.sessionUser)
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)
  const [rows, setRows] = useState<AdminResultRecord[]>([])
  const [activeView, setActiveView] = useState<AdminView>('overview')
  const [exportStatus, setExportStatus] = useState('')
  const [users, setUsers] = useState<RegisteredUserRecord[]>(() =>
    readStorage<RegisteredUserRecord[]>(storageKeys.users, defaultMockUsers),
  )

  useEffect(() => {
    void Promise.all([adminService.getDashboard(), adminService.getResults()]).then(
      ([dashboardResponse, rowsResponse]) => {
        setDashboard(dashboardResponse.data)
        setRows(rowsResponse.data)
      },
    )
  }, [])

  const resultCards = useMemo<ResultCard[]>(() => {
    return rows.map((row) => ({
      id: row.id,
      userName: row.studentName,
      city: row.city,
      primaryArea: row.primaryArea,
      programs: mockResult.careers.map((career) => ({
        id: `${row.id}-${career.id}`,
        name: career.name,
        affinity: career.affinity,
      })),
    }))
  }, [rows])

  async function handleExport(format: 'pdf' | 'csv' | 'excel') {
    const response = await adminService.exportReport(format)
    setExportStatus(response.data.status)
  }

  function updateRole(userId: string, role: 'student' | 'admin') {
    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? {
              ...user,
              role,
            }
          : user,
      ),
    )
    setExportStatus('Cambio de rol mock aplicado. Listo para conectar con persistencia backend.')
  }

  if (!dashboard) {
    return <div className="loading-state">Cargando panel administrativo...</div>
  }

  return (
    <div className="admin-console-page">
      <section className="admin-console-shell">
        <aside className="admin-console-sidebar">
          <div className="admin-console-profile">
            <div className="admin-console-profile__avatar">
              {sessionUser?.firstName?.slice(0, 1) ?? 'C'}
            </div>
            <div>
              <span>Bienvenido</span>
              <strong>{sessionUser?.fullName ?? 'Coordinación USB'}</strong>
            </div>
          </div>

          <nav className="admin-console-nav">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`admin-console-nav__item${activeView === item.id ? ' admin-console-nav__item--active' : ''}`}
                onClick={() => setActiveView(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="admin-console-content">
          <div className="admin-console-scroll">
            {activeView === 'overview' ? (
              <>
                <header className="admin-console-header">
                  <div>
                    <span className="admin-console-header__eyebrow">Administración</span>
                    <h1>Panel de seguimiento USB Vocacional</h1>
                    <p>Vista resumen de usuarios, resultados y distribución por región.</p>
                  </div>
                  <div className="admin-console-actions">
                    <button type="button" onClick={() => void handleExport('pdf')}>
                      Exportar PDF
                    </button>
                    <button type="button" onClick={() => void handleExport('csv')}>
                      Exportar CSV
                    </button>
                    <button type="button" onClick={() => void handleExport('excel')}>
                      Exportar Excel
                    </button>
                  </div>
                </header>

                <section className="admin-console-metrics">
                  {dashboard.metrics.map((metric) => (
                    <article key={metric.id} className="admin-console-metric">
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                      <p>{metric.hint || 'Indicador institucional disponible para el backend real.'}</p>
                    </article>
                  ))}
                </section>

                <section className="admin-console-panels">
                  <article className="admin-console-panel admin-console-panel--donut">
                    <h3>Distribución de usuarios</h3>
                    <div className="admin-console-donut">
                      <div className="admin-console-donut__center">
                        <strong>{dashboard.affinityDistribution[0]?.value ?? 0}%</strong>
                        <span>Internos</span>
                      </div>
                    </div>
                    <div className="admin-console-donut__meta">
                      <div>
                        <span>Internos</span>
                        <strong>685</strong>
                        <small>Estudiantes activos</small>
                      </div>
                      <div>
                        <span>Externos</span>
                        <strong>420</strong>
                        <small>Aspirantes</small>
                      </div>
                    </div>
                  </article>

                  <article className="admin-console-panel">
                    <h3>Distribución geográfica</h3>
                    <div className="admin-console-geo">
                      {dashboard.geographicDistribution.map((item) => (
                        <div key={item.region} className="admin-console-geo__row">
                          <span>{item.region}</span>
                          <div className="admin-console-geo__track">
                            <div
                              className="admin-console-geo__fill"
                              style={{ width: `${Math.min(100, (item.users / 387) * 100)}%` }}
                            />
                          </div>
                          <strong>{item.users}</strong>
                        </div>
                      ))}
                    </div>
                  </article>
                </section>

                <section className="admin-console-tablecard">
                  <div className="admin-console-tablecard__head">
                    <h3>Resultados recientes</h3>
                    {exportStatus ? <p>{exportStatus}</p> : <p>Últimos usuarios con prueba finalizada.</p>}
                  </div>
                  <div className="admin-console-table">
                    <div className="admin-console-table__header">
                      <span>Estudiante</span>
                      <span>Ciudad</span>
                      <span>Área principal</span>
                      <span>Programa sugerido</span>
                      <span>Afinidad</span>
                    </div>
                    {rows.map((row) => (
                      <div key={row.id} className="admin-console-table__row">
                        <span>{row.studentName}</span>
                        <span>{row.city}</span>
                        <span>{row.primaryArea}</span>
                        <span>{row.topCareer}</span>
                        <strong>{row.affinity}%</strong>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            ) : null}

            {activeView === 'users' ? (
              <section className="admin-console-section">
                <div className="admin-console-section__head">
                  <div>
                    <span className="admin-console-header__eyebrow">Usuarios</span>
                    <h2>Gestión de usuarios</h2>
                    <p>Vista frontend lista para conectar cambios de rol con el backend.</p>
                  </div>
                </div>

                <div className="admin-console-userlist">
                  {users.map((user) => (
                    <article key={user.id} className="admin-console-usercard">
                      <div className="admin-console-usercard__main">
                        <strong>{user.fullName}</strong>
                        <span>{user.email}</span>
                        <p>
                          Documento: {user.document} | Ciudad: {user.city}
                        </p>
                      </div>
                      <div className="admin-console-usercard__controls">
                        <label>
                          Rol
                          <select
                            value={user.role}
                            onChange={(event) => updateRole(user.id, event.target.value as 'student' | 'admin')}
                          >
                            <option value="student">Estudiante</option>
                            <option value="admin">Administrador</option>
                          </select>
                        </label>
                        <span className={`admin-console-role admin-console-role--${user.role}`}>
                          {user.role === 'admin' ? 'Administrador' : 'Estudiante'}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {activeView === 'results' ? (
              <section className="admin-console-section">
                <div className="admin-console-section__head">
                  <div>
                    <span className="admin-console-header__eyebrow">Resultados</span>
                    <h2>Resultados por individuo</h2>
                    <p>Tarjetas preparadas para recibir el detalle consolidado desde backend.</p>
                  </div>
                </div>

                <div className="admin-console-resultlist">
                  {resultCards.map((card) => (
                    <article key={card.id} className="admin-console-resultcard">
                      <div className="admin-console-resultcard__top">
                        <div>
                          <strong>{card.userName}</strong>
                          <span>{card.city}</span>
                        </div>
                        <div className="admin-console-resultcard__area">{card.primaryArea}</div>
                      </div>
                      <div className="admin-console-resultcard__programs">
                        {card.programs.slice(0, 3).map((program, index) => (
                          <div key={program.id} className="admin-console-resultcard__program">
                            <span>{index + 1}</span>
                            <div>
                              <strong>{program.name}</strong>
                              <small>{program.affinity}% de afinidad</small>
                            </div>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {activeView === 'reports' ? (
              <section className="admin-console-section">
                <div className="admin-console-section__head">
                  <div>
                    <span className="admin-console-header__eyebrow">Reportes</span>
                    <h2>Generación de reportes</h2>
                    <p>Flujo frontend preparado para filtrar y disparar exportaciones del backend.</p>
                  </div>
                </div>

                <div className="admin-console-reportgrid">
                  <article className="admin-console-reportcard">
                    <strong>Reporte por usuario</strong>
                    <p>Consulta historial y resumen individual de resultados.</p>
                    <input type="text" placeholder="Nombre o correo del usuario" />
                    <button type="button" onClick={() => void handleExport('pdf')}>Generar PDF</button>
                  </article>

                  <article className="admin-console-reportcard">
                    <strong>Reporte por programa sugerido</strong>
                    <p>Identifica usuarios asociados a una recomendación específica.</p>
                    <select defaultValue="">
                      <option value="" disabled>Selecciona programa</option>
                      {mockResult.careers.map((career) => (
                        <option key={career.id} value={career.name}>{career.name}</option>
                      ))}
                    </select>
                    <button type="button" onClick={() => void handleExport('csv')}>Exportar CSV</button>
                  </article>

                  <article className="admin-console-reportcard">
                    <strong>Reporte por departamento</strong>
                    <p>Agrupa resultados y usuarios según la procedencia registrada.</p>
                    <input type="text" placeholder="Departamento" />
                    <button type="button" onClick={() => void handleExport('excel')}>Exportar Excel</button>
                  </article>

                  <article className="admin-console-reportcard">
                    <strong>Reporte por periodo</strong>
                    <p>Selecciona una ventana de tiempo para generar cortes administrativos.</p>
                    <div className="admin-console-reportcard__dates">
                      <input type="date" />
                      <input type="date" />
                    </div>
                    <button type="button" onClick={() => void handleExport('pdf')}>Generar reporte</button>
                  </article>
                </div>

                {exportStatus ? <div className="admin-console-banner">{exportStatus}</div> : null}
              </section>
            ) : null}

            {activeView === 'settings' ? (
              <section className="admin-console-section">
                <div className="admin-console-section__head">
                  <div>
                    <span className="admin-console-header__eyebrow">Configuración</span>
                    <h2>Configuración general</h2>
                    <p>Espacio reservado para parámetros institucionales y reglas futuras.</p>
                  </div>
                </div>

                <div className="admin-console-settings">
                  <article>
                    <strong>Estado del módulo</strong>
                    <p>Frontend listo para integración con permisos, catálogos y parámetros del backend.</p>
                  </article>
                  <article>
                    <strong>Próximos acoplamientos</strong>
                    <p>Roles, filtros, exportaciones, periodos y detalle de resultados por usuario.</p>
                  </article>
                </div>
              </section>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}
