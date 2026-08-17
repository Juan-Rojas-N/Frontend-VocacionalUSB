import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { resultsService } from '../../services/resultsService'
import type { BackendPrueba } from '../../types'
import { APP_ROUTES } from '../../constants'

export function TestHistoryView() {
  const [tests, setTests] = useState<BackendPrueba[]>([])
  const [statusMessage, setStatusMessage] = useState('')
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

    return () => {
      active = false
    }
  }, [])

  function formatDuration(seconds: number | null): string {
    if (seconds == null) return 'Sin registrar'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  function formatDate(iso: string | null): string {
    if (!iso) return 'Sin fecha'
    try {
      return new Date(iso).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return iso
    }
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
          <p>Todas las pruebas que has realizado aparecen aquí.</p>
        </header>

        {tests.length === 0 ? (
          <div className="introduccion-prueba__alerta">
            <strong>No tienes pruebas registradas.</strong>
            <p>
              <Link to={APP_ROUTES.testIntro}>Realiza tu primera prueba</Link> para ver tus
              resultados aquí.
            </p>
          </div>
        ) : (
          <div className="carreras-recomendadas__lista">
            {tests.map((test) => (
              <article
                key={test.id}
                className={`carreras-recomendadas__tarjeta ${!test.activo ? 'admin-catalog-list__inactive' : ''}`}
              >
                <div className="carreras-recomendadas__contenido">
                  <strong>Prueba #{test.id}</strong>
                  <span>
                    {formatDate(test.fecha)} · {formatDuration(test.tiempoInvertido)} ·{' '}
                    {test.activo ? 'Completada' : 'Inactiva'}
                  </span>
                  {test.versionPrueba ? (
                    <p>Versión: {test.versionPrueba}</p>
                  ) : null}
                  {test.satisfaccion != null ? (
                    <p>Satisfacción: {test.satisfaccion}/5</p>
                  ) : null}
                </div>
                <div className="carreras-recomendadas__acciones">
                  <Link
                    to={`${APP_ROUTES.results}/${test.id}`}
                    className="carreras-recomendadas__enlace"
                  >
                    Ver resultado
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {statusMessage ? (
          <p className="resumen-resultado__estado">{statusMessage}</p>
        ) : null}
      </section>
    </div>
  )
}
