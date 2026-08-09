import { useEffect, useMemo, useState } from 'react'
import { resultsService } from '../../services/resultsService'
import { useAuthStore } from '../../stores/authStore'
import type { VocationalResult } from '../../types'
import { formatDate, formatPercentage } from '../../utils/formatters'

type ResultsState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: VocationalResult }

export function ResultsPage() {
  const sessionUser = useAuthStore((state) => state.sessionUser)
  const [resultState, setResultState] = useState<ResultsState>({ status: 'loading' })
  const [selectedAreaId, setSelectedAreaId] = useState('')

  useEffect(() => {
    let active = true

    void resultsService
      .getMyResults()
      .then((response) => {
        if (!active) {
          return
        }

        if (response.data.areas.length === 0) {
          setResultState({
            status: 'error',
            message: 'El resultado no contiene afinidades por área para mostrar.',
          })
          return
        }

        setResultState({ status: 'ready', data: response.data })
        const primaryArea = response.data.areas.find(
          (area) => area.name === response.data.primaryArea,
        )
        setSelectedAreaId(primaryArea?.id ?? response.data.areas[0].id)
      })
      .catch((error: unknown) => {
        if (active) {
          setResultState({
            status: 'error',
            message:
              error instanceof Error ? error.message : 'No fue posible cargar tus resultados.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [])

  const selectedArea = useMemo(() => {
    if (resultState.status !== 'ready') {
      return null
    }

    return (
      resultState.data.areas.find((area) => area.id === selectedAreaId) ??
      resultState.data.areas[0] ??
      null
    )
  }, [resultState, selectedAreaId])

  const selectedCareers = useMemo(() => {
    if (resultState.status !== 'ready' || !selectedArea) {
      return []
    }

    return resultState.data.careers
      .filter((career) => career.area === selectedArea.name)
      .sort((left, right) => right.affinity - left.affinity)
  }, [resultState, selectedArea])

  if (resultState.status === 'loading') {
    return <div className="loading-state">Cargando resultados...</div>
  }

  if (resultState.status === 'error') {
    return (
      <div className="resultado-vocacional resultado-vocacional--state">
        <section className="resultado-vocacional__empty" role="alert">
          <h1>No pudimos mostrar tus resultados</h1>
          <p>{resultState.message}</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reintentar
          </button>
        </section>
      </div>
    )
  }

  if (!selectedArea) {
    return (
      <div className="resultado-vocacional resultado-vocacional--state">
        <section className="resultado-vocacional__empty">
          <h1>Resultado sin afinidades</h1>
          <p>Cuando exista información por área, podrás explorar el perfil correspondiente aquí.</p>
        </section>
      </div>
    )
  }

  const data = resultState.data

  return (
    <div className="resultado-vocacional">
      <section className="resultado-vocacional__panel">
        <header className="resultado-vocacional__encabezado resultado-vocacional__encabezado--actions">
          <div>
            <span className="resultado-vocacional__eyebrow">Informe personal</span>
            <h1>Resultados de tu prueba vocacional</h1>
            <p>{sessionUser?.fullName ?? 'Usuario USB'}, explora cada área para conocer su perfil.</p>
          </div>
          <button
            type="button"
            className="acciones-resultado__descarga"
            onClick={() => window.print()}
          >
            <span>Imprimir / guardar PDF</span>
            <span aria-hidden="true">↧</span>
          </button>
        </header>

        <section className="perfil-vocacional perfil-vocacional--selected">
          <div className="perfil-vocacional__icono" aria-hidden="true">
            <div className="perfil-vocacional__linea perfil-vocacional__linea--superior" />
            <div className="perfil-vocacional__linea perfil-vocacional__linea--media" />
            <div className="perfil-vocacional__linea perfil-vocacional__linea--inferior" />
            <div className="perfil-vocacional__figura" />
          </div>
          <div className="perfil-vocacional__contenido">
            <span>Área seleccionada · {formatPercentage(selectedArea.affinity)}</span>
            <h2>{selectedArea.name}</h2>
            <p>{selectedArea.description}</p>
          </div>
        </section>

        <section className="explorador-afinidades" aria-labelledby="affinity-explorer-title">
          <div className="explorador-afinidades__selector">
            <div className="explorador-afinidades__title">
              <span>Afinidad por área</span>
              <h3 id="affinity-explorer-title">Selecciona un área</h3>
            </div>
            <div className="explorador-afinidades__options" role="radiogroup">
              {data.areas
                .slice()
                .sort((left, right) => right.affinity - left.affinity)
                .map((area) => (
                  <label
                    key={area.id}
                    className={`explorador-afinidades__option${area.id === selectedArea.id ? ' explorador-afinidades__option--active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="selected-area"
                      value={area.id}
                      checked={area.id === selectedArea.id}
                      onChange={() => setSelectedAreaId(area.id)}
                    />
                    <span className="explorador-afinidades__option-copy">
                      <strong>{area.name}</strong>
                      <small>{formatPercentage(area.affinity)} de afinidad</small>
                    </span>
                    <span className="explorador-afinidades__meter" aria-hidden="true">
                      <span style={{ width: `${Math.min(100, Math.max(0, area.affinity))}%` }} />
                    </span>
                  </label>
                ))}
            </div>
          </div>

          <article className="explorador-afinidades__profile" aria-live="polite">
            <span>Perfil predominante</span>
            <h3>{selectedArea.name}</h3>
            <p>{selectedArea.profile}</p>
            <div className="explorador-afinidades__distinction">
              <strong>Perfil y descripción son datos distintos</strong>
              <p>
                El perfil resume rasgos e inclinaciones; la descripción explica el alcance del área.
              </p>
            </div>
          </article>
        </section>

        <section className="carreras-recomendadas">
          <div className="carreras-recomendadas__heading">
            <h3>Programas relacionados</h3>
            <p>Recomendaciones disponibles para {selectedArea.name}.</p>
          </div>
          {selectedCareers.length > 0 ? (
            <div className="carreras-recomendadas__lista">
              {selectedCareers.map((career, index) => (
                <article key={career.id} className="carreras-recomendadas__tarjeta">
                  <div className="carreras-recomendadas__ranking">{index + 1}</div>
                  <div className="carreras-recomendadas__contenido">
                    <strong>{career.name}</strong>
                    <span>{formatPercentage(career.affinity)} de compatibilidad</span>
                    <p>{career.summary}</p>
                    <details className="carreras-recomendadas__details">
                      <summary>¿Por qué se recomienda?</summary>
                      <ul>
                        {career.rationale.map((reason) => (
                          <li key={reason}>{reason}</li>
                        ))}
                      </ul>
                    </details>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="carreras-recomendadas__empty">
              Aún no hay programas recomendados para esta área en el resultado mock.
            </div>
          )}
        </section>

        <section className="resumen-resultado">
          <h3>Resumen de tu perfil</h3>
          <p>
            Tu mayor afinidad registrada es <span>{data.primaryArea}</span>. En esta vista seleccionaste{' '}
            <span>{selectedArea.name}</span>, con un{' '}
            <span>{formatPercentage(selectedArea.affinity)}</span> de afinidad.
          </p>
          <p>{data.qualitativeSummary}</p>
          <p className="resumen-resultado__meta">
            Informe generado el {formatDate(data.generatedAt)}. Es una guía inicial y no reemplaza
            orientación profesional.
          </p>
        </section>
      </section>
    </div>
  )
}
