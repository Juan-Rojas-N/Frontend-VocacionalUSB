import { useEffect, useState } from 'react'
import { adminService } from '../../../services/adminService'

interface LogEntry {
  id: number
  idUsuarioAlterado: number
  nombreUsuario: string | null
  idActividad: number
  nombreActividad: string | null
  descripcion: string | null
  fecha: string
}

export function AdminLogsView() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true

    void adminService
      .getLogs()
      .then((response) => {
        if (active) {
          setLogs(response.data)
          setLoadState('ready')
        }
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : 'No fue posible cargar los logs.',
          )
          setLoadState('error')
        }
      })

    return () => {
      active = false
    }
  }, [])

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return iso
    }
  }

  if (loadState === 'loading') {
    return <div className="loading-state">Cargando logs...</div>
  }

  if (loadState === 'error') {
    return (
      <section className="seccion-administracion admin-error-state" role="alert">
        <h2>No fue posible cargar los logs</h2>
        <p>{errorMessage}</p>
      </section>
    )
  }

  return (
    <section className="seccion-administracion">
      <div className="seccion-administracion__encabezado">
        <div>
          <span className="panel-administracion__eyebrow">ROOT · Logs</span>
          <h2>Logs del sistema</h2>
          <p>Registro de actividades realizadas en el sistema.</p>
        </div>
      </div>

      {logs.length > 0 ? (
        <div className="usuarios-administracion">
          {logs.map((log) => (
            <article key={log.id} className="usuarios-administracion__tarjeta">
              <div className="usuarios-administracion__principal">
                <strong>{log.nombreActividad ?? `Actividad #${log.idActividad}`}</strong>
                <span>Usuario: {log.nombreUsuario ?? `ID ${log.idUsuarioAlterado}`}</span>
                {log.descripcion ? <p>{log.descripcion}</p> : null}
                <p>Fecha: {formatDate(log.fecha)}</p>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-empty-state">No hay logs registrados.</div>
      )}
    </section>
  )
}
