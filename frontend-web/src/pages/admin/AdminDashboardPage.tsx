import { useEffect, useMemo, useState } from 'react'
import { mockResult } from '../../mocks/data'
import { adminService } from '../../services/adminService'
import { getUsers } from '../../services/authStorage'
import { useAuthStore } from '../../stores/authStore'
import type { AdminDashboard, AdminResultRecord, RegisteredUserRecord } from '../../types'

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
  const [users, setUsers] = useState<RegisteredUserRecord[]>(() => getUsers())

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
    setExportStatus('Cambio de rol simulado correctamente. Listo para conectar con persistencia backend.')
  }

  if (!dashboard) {
    return <div className="loading-state">Cargando panel administrativo...</div>
  }

  return (
    <div className="panel-administracion">
      <section className="panel-administracion__contenedor">
        <aside className="navegacion-administracion">
          <div className="navegacion-administracion__perfil">
            <div className="navegacion-administracion__avatar">
              {sessionUser?.firstName?.slice(0, 1) ?? 'C'}
            </div>
            <div>
              <span>Bienvenido</span>
              <strong>{sessionUser?.fullName ?? 'Coordinación USB'}</strong>
            </div>
          </div>

          <nav className="navegacion-administracion__menu">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`navegacion-administracion__item${activeView === item.id ? ' navegacion-administracion__item--activo' : ''}`}
                onClick={() => setActiveView(item.id)}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="panel-administracion__contenido">
          <div className="panel-administracion__scroll">
            {activeView === 'overview' ? (
              <>
                <header className="resumen-administracion__encabezado">
                  <div>
                    <span className="panel-administracion__eyebrow">Administración</span>
                    <h1>Panel de seguimiento USB Vocacional</h1>
                    <p>Vista de resumen de usuarios, resultados y distribución por región.</p>
                  </div>
                  <div className="resumen-administracion__acciones">
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

                <section className="estadistica-administracion">
                  {dashboard.metrics.map((metric) => (
                    <article key={metric.id} className="estadistica-administracion__tarjeta">
                      <span>{metric.label}</span>
                      <strong>{metric.value}</strong>
                      <p>{metric.hint || 'Indicador institucional disponible para integrar con el backend.'}</p>
                    </article>
                  ))}
                </section>

                <section className="resumen-administracion__paneles">
                  <article className="resumen-administracion__panel resumen-administracion__panel--donut">
                    <h3>Distribución de usuarios</h3>
                    <div className="estadistica-administracion__donut">
                      <div className="estadistica-administracion__donut-centro">
                        <strong>{dashboard.affinityDistribution[0]?.value ?? 0}%</strong>
                        <span>Internos</span>
                      </div>
                    </div>
                    <div className="estadistica-administracion__donut-meta">
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

                  <article className="resumen-administracion__panel">
                    <h3>Distribución geográfica</h3>
                    <div className="estadistica-administracion__geografia">
                      {dashboard.geographicDistribution.map((item) => (
                        <div key={item.region} className="estadistica-administracion__geografia-fila">
                          <span>{item.region}</span>
                          <div className="estadistica-administracion__geografia-barra">
                            <div
                              className="estadistica-administracion__geografia-relleno"
                              style={{ width: `${Math.min(100, (item.users / 387) * 100)}%` }}
                            />
                          </div>
                          <strong>{item.users}</strong>
                        </div>
                      ))}
                    </div>
                  </article>
                </section>

                <section className="resultados-administracion">
                  <div className="resultados-administracion__encabezado">
                    <h3>Resultados recientes</h3>
                    {exportStatus ? <p>{exportStatus}</p> : <p>Últimos usuarios con prueba finalizada.</p>}
                  </div>
                  <div className="resultados-administracion__tabla">
                    <div className="resultados-administracion__cabecera">
                      <span>Estudiante</span>
                      <span>Ciudad</span>
                      <span>Área principal</span>
                      <span>Programa sugerido</span>
                      <span>Afinidad</span>
                    </div>
                    {rows.map((row) => (
                      <div key={row.id} className="resultados-administracion__fila">
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
              <section className="seccion-administracion">
                <div className="seccion-administracion__encabezado">
                  <div>
                    <span className="panel-administracion__eyebrow">Usuarios</span>
                    <h2>Gestión de usuarios</h2>
                    <p>Vista frontend lista para conectar cambios de rol con el backend.</p>
                  </div>
                </div>

                <div className="usuarios-administracion">
                  {users.map((user) => (
                    <article key={user.id} className="usuarios-administracion__tarjeta">
                      <div className="usuarios-administracion__principal">
                        <strong>{user.fullName}</strong>
                        <span>{user.email}</span>
                        <p>
                          Documento: {user.document} | Ciudad: {user.municipalityName}
                        </p>
                        <p>Usuario: {user.username ?? 'Sin username legacy'}</p>
                      </div>
                      <div className="usuarios-administracion__controles">
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
                        <span className={`usuarios-administracion__rol usuarios-administracion__rol--${user.role}`}>
                          {user.role === 'admin' ? 'Administrador' : 'Estudiante'}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}

            {activeView === 'results' ? (
              <section className="seccion-administracion">
                <div className="seccion-administracion__encabezado">
                  <div>
                    <span className="panel-administracion__eyebrow">Resultados</span>
                    <h2>Resultados por individuo</h2>
                    <p>Vista lista para recibir el detalle consolidado desde el backend.</p>
                  </div>
                </div>

                <div className="resultados-administracion__lista">
                  {resultCards.map((card) => (
                    <article key={card.id} className="resultados-administracion__tarjeta">
                      <div className="resultados-administracion__resumen">
                        <div>
                          <strong>{card.userName}</strong>
                          <span>{card.city}</span>
                        </div>
                        <div className="resultados-administracion__area">{card.primaryArea}</div>
                      </div>
                      <div className="resultados-administracion__programas">
                        {card.programs.slice(0, 3).map((program, index) => (
                          <div key={program.id} className="resultados-administracion__programa">
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
              <section className="seccion-administracion">
                <div className="seccion-administracion__encabezado">
                  <div>
                    <span className="panel-administracion__eyebrow">Reportes</span>
                    <h2>Generación de reportes</h2>
                    <p>Flujo disponible para filtrar y generar exportaciones desde el backend.</p>
                  </div>
                </div>

                <div className="reportes-administracion">
                  <article className="reportes-administracion__tarjeta">
                    <strong>Reporte por usuario</strong>
                    <p>Consulta historial y resumen individual de resultados.</p>
                    <input type="text" placeholder="Nombre o correo del usuario" />
                    <button type="button" onClick={() => void handleExport('pdf')}>Generar PDF</button>
                  </article>

                  <article className="reportes-administracion__tarjeta">
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

                  <article className="reportes-administracion__tarjeta">
                    <strong>Reporte por departamento</strong>
                    <p>Agrupa resultados y usuarios según la procedencia registrada.</p>
                    <input type="text" placeholder="Departamento" />
                    <button type="button" onClick={() => void handleExport('excel')}>Exportar Excel</button>
                  </article>

                  <article className="reportes-administracion__tarjeta">
                    <strong>Reporte por periodo</strong>
                    <p>Selecciona una ventana de tiempo para generar cortes administrativos.</p>
                    <div className="reportes-administracion__fechas">
                      <input type="date" />
                      <input type="date" />
                    </div>
                    <button type="button" onClick={() => void handleExport('pdf')}>Generar reporte</button>
                  </article>
                </div>

                {exportStatus ? <div className="reportes-administracion__estado">{exportStatus}</div> : null}
              </section>
            ) : null}

            {activeView === 'settings' ? (
              <section className="seccion-administracion">
                <div className="seccion-administracion__encabezado">
                  <div>
                    <span className="panel-administracion__eyebrow">Configuración</span>
                    <h2>Configuración general</h2>
                    <p>Espacio reservado para parámetros institucionales y reglas futuras.</p>
                  </div>
                </div>

                <div className="configuracion-administracion">
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
