import type { AdminDashboard, AdminResultRecord } from '../../../types'

interface AdminOverviewViewProps {
  dashboard: AdminDashboard
  rows: AdminResultRecord[]
  exportStatus: string
  onExport: (format: 'pdf' | 'csv' | 'excel') => void
}

export function AdminOverviewView({
  dashboard,
  rows,
  exportStatus,
  onExport,
}: AdminOverviewViewProps) {
  return (
    <>
      <header className="resumen-administracion__encabezado">
        <div>
          <span className="panel-administracion__eyebrow">Administración</span>
          <h1>Panel de seguimiento USB Vocacional</h1>
          <p>Vista de resumen de usuarios, resultados y distribución por región.</p>
        </div>
        <div className="resumen-administracion__acciones">
          <button type="button" onClick={() => onExport('pdf')}>
            Exportar PDF
          </button>
          <button type="button" onClick={() => onExport('csv')}>
            Exportar CSV
          </button>
          <button type="button" onClick={() => onExport('excel')}>
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
          {exportStatus ? <p role="status">{exportStatus}</p> : <p>Últimos usuarios con prueba finalizada.</p>}
        </div>
        <div className="resultados-administracion__tabla">
          <div className="resultados-administracion__cabecera" aria-hidden="true">
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
  )
}
