import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { resultsService } from '../../services/resultsService'
import type { BackendPrueba } from '../../types'
import { APP_ROUTES } from '../../constants'

export function TestHistoryView() {
  const [tests, setTests] = useState<BackendPrueba[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true

    void resultsService
      .getMyTestHistory()
      .then((response) => {
        if (active) {
          setTests(response.data)
          setErrorMessage('')
        }
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(
            error instanceof Error ? error.message : 'No fue posible cargar el historial.',
          )
        }
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(() => {
    const completed = tests.filter((t) => t.activo)
    const totalTime = tests.reduce((sum, t) => sum + (t.tiempoInvertido ?? 0), 0)
    const avgTime = completed.length > 0 ? Math.round(totalTime / completed.length) : 0
    return {
      total: tests.length,
      completed: completed.length,
      avgMinutes: Math.floor(avgTime / 60),
      avgSeconds: avgTime % 60,
    }
  }, [tests])

  function formatDuration(seconds: number | null): string {
    if (seconds == null) return '--'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins === 0) return `${secs}s`
    return `${mins}m ${secs}s`
  }

  function formatDate(iso: string | null): string {
    if (!iso) return 'Sin fecha'
    try {
      return new Date(iso).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return iso
    }
  }

  function formatTime(iso: string | null): string {
    if (!iso) return ''
    try {
      return new Date(iso).toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return ''
    }
  }

  if (isLoading) {
    return (
      <div className="resultado-vocacional">
        <section className="resultado-vocacional__panel">
          <div className="loading-state">Cargando historial de pruebas...</div>
        </section>
      </div>
    )
  }

  if (errorMessage && tests.length === 0) {
    return (
      <div className="resultado-vocacional">
        <section className="resultado-vocacional__panel">
          <header className="resultado-vocacional__encabezado">
            <h1>Historial de pruebas</h1>
          </header>
          <div className="introduccion-prueba__alerta">
            <strong>No fue posible cargar el historial.</strong>
            <p>{errorMessage}</p>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="resultado-vocacional">
      <section className="resultado-vocacional__panel">
        <header className="resultado-vocacional__encabezado">
          <h1>Historial de pruebas</h1>
          <p>Revisa todas las pruebas vocacionales que has realizado en el sistema.</p>
        </header>

        {tests.length === 0 ? (
          <div className="introduccion-prueba__alerta">
            <strong>Aún no tienes pruebas registradas.</strong>
            <p>
              <Link to={APP_ROUTES.testIntro}>Realiza tu primera prueba</Link> para ver tus
              resultados aquí.
            </p>
          </div>
        ) : (
          <>
            <div className="historial-stats">
              <div className="historial-stats__card">
                <span className="historial-stats__label">Pruebas realizadas</span>
                <strong className="historial-stats__value">{stats.total}</strong>
              </div>
              <div className="historial-stats__card">
                <span className="historial-stats__label">Completadas</span>
                <strong className="historial-stats__value">{stats.completed}</strong>
              </div>
              <div className="historial-stats__card">
                <span className="historial-stats__label">Tiempo promedio</span>
                <strong className="historial-stats__value">
                  {stats.completed > 0 ? `${stats.avgMinutes}m ${stats.avgSeconds}s` : '--'}
                </strong>
              </div>
            </div>

            <div className="historial-lista">
              {[...tests]
                .sort(
                  (a, b) =>
                    new Date(b.fecha ?? 0).getTime() - new Date(a.fecha ?? 0).getTime(),
                )
                .map((test, index) => (
                  <article
                    key={test.id}
                    className={`historial-card ${!test.activo ? 'historial-card--inactiva' : ''}`}
                  >
                    <div className="historial-card__numero">
                      {stats.total - index}
                    </div>
                    <div className="historial-card__contenido">
                      <div className="historial-card__fila">
                        <strong className="historial-card__fecha">
                          {formatDate(test.fecha)}
                        </strong>
                        <span className="historial-card__hora">{formatTime(test.fecha)}</span>
                      </div>
                      <div className="historial-card__detalles">
                        <span className="historial-card__badge">
                          {test.activo ? 'Completada' : 'Inactiva'}
                        </span>
                        {test.versionPrueba ? (
                          <span className="historial-card__meta">
                            Versión {test.versionPrueba}
                          </span>
                        ) : null}
                        <span className="historial-card__meta">
                          Duración: {formatDuration(test.tiempoInvertido)}
                        </span>
                        {test.satisfaccion != null ? (
                          <span className="historial-card__meta">
                            Satisfacción: {test.satisfaccion}/5
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <div className="historial-card__acciones">
                      <Link
                        to={`${APP_ROUTES.results}/${test.id}`}
                        className="historial-card__boton"
                      >
                        Ver resultado
                      </Link>
                    </div>
                  </article>
                ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
