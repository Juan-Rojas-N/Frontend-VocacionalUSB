import { useEffect, useState } from 'react'
import { adminService } from '../../services/adminService'
import { useAuthStore } from '../../stores/authStore'
import type { AdminDashboard, AdminResultRecord } from '../../types'

export function AdminDashboardPage() {
  const sessionUser = useAuthStore((state) => state.sessionUser)
  const [dashboard, setDashboard] = useState<AdminDashboard | null>(null)
  const [rows, setRows] = useState<AdminResultRecord[]>([])
  const [exportStatus, setExportStatus] = useState('')

  useEffect(() => {
    void Promise.all([adminService.getDashboard(), adminService.getResults()]).then(
      ([dashboardResponse, rowsResponse]) => {
        setDashboard(dashboardResponse.data)
        setRows(rowsResponse.data)
      },
    )
  }, [])

  async function handleExport(format: 'pdf' | 'csv' | 'excel') {
    const response = await adminService.exportReport(format)
    setExportStatus(response.data.status)
  }

  if (!dashboard) {
    return <div className="loading-state">Cargando panel administrativo...</div>
  }

  return (
    <div className="admin-mockup-page">
      <section className="admin-mockup-shell">
        <aside className="admin-mockup-sidebar">
          <div className="admin-mockup-profile">
            <div className="admin-mockup-profile__avatar">
              {sessionUser?.firstName?.slice(0, 1) ?? 'A'}
            </div>
            <div>
              <span>Bienvenido</span>
              <strong>{sessionUser?.fullName ?? 'Administrador USB'}</strong>
            </div>
          </div>

          <nav className="admin-mockup-nav">
            <button type="button" className="admin-mockup-nav__item admin-mockup-nav__item--active">
              Panel principal
            </button>
            <button type="button" className="admin-mockup-nav__item">Usuarios</button>
            <button type="button" className="admin-mockup-nav__item">Pruebas</button>
            <button type="button" className="admin-mockup-nav__item">Reportes</button>
            <button type="button" className="admin-mockup-nav__item">Configuración</button>
          </nav>
        </aside>

        <div className="admin-mockup-main">
          <header className="admin-mockup-header">
            <div>
              <span className="admin-mockup-header__eyebrow">Administración</span>
              <h1>Panel de seguimiento USB Vocacional</h1>
              <p>Vista resumen de usuarios, resultados y distribución por región.</p>
            </div>
            <div className="admin-mockup-header__actions">
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

          <section className="admin-mockup-metrics">
            {dashboard.metrics.map((metric) => (
              <article key={metric.id} className="admin-mockup-metric">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.hint || 'Indicador institucional disponible para el backend real.'}</p>
              </article>
            ))}
          </section>

          <section className="admin-mockup-panels">
            <article className="admin-mockup-panel">
              <h3>Distribución por tipo de usuario</h3>
              <div className="admin-mockup-donut">
                <div className="admin-mockup-donut__center">
                  <strong>{dashboard.affinityDistribution[0]?.value ?? 0}%</strong>
                  <span>Internos</span>
                </div>
              </div>
              <div className="admin-mockup-legend">
                {dashboard.affinityDistribution.map((item) => (
                  <div key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}%</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="admin-mockup-panel">
              <h3>Distribución geográfica</h3>
              <div className="admin-mockup-geography">
                {dashboard.geographicDistribution.map((item) => (
                  <div key={item.region} className="admin-mockup-geography__row">
                    <div className="admin-mockup-geography__label">
                      <span>{item.region}</span>
                      <strong>{item.users}</strong>
                    </div>
                    <div className="admin-mockup-geography__track">
                      <div
                        className="admin-mockup-geography__fill"
                        style={{ width: `${Math.min(100, (item.users / 387) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="admin-mockup-tablecard">
            <div className="admin-mockup-tablecard__head">
              <h3>Resultados recientes</h3>
              {exportStatus ? <p>{exportStatus}</p> : <p>Últimos usuarios con prueba finalizada.</p>}
            </div>
            <div className="admin-mockup-table">
              <div className="admin-mockup-table__header">
                <span>Estudiante</span>
                <span>Ciudad</span>
                <span>Área principal</span>
                <span>Programa sugerido</span>
                <span>Afinidad</span>
              </div>
              {rows.map((row) => (
                <div key={row.id} className="admin-mockup-table__row">
                  <span>{row.studentName}</span>
                  <span>{row.city}</span>
                  <span>{row.primaryArea}</span>
                  <span>{row.topCareer}</span>
                  <strong>{row.affinity}%</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}
