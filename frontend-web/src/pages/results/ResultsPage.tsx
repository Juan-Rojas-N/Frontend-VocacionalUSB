import { useEffect, useMemo, useState } from 'react'
import { ResultCharts } from '../../components/charts/ResultCharts'
import { resultsService } from '../../services/resultsService'
import { useAuthStore } from '../../stores/authStore'
import type { VocationalResult } from '../../types'
import { formatDate, formatPercentage } from '../../utils/formatters'

export function ResultsPage() {
  const sessionUser = useAuthStore((state) => state.sessionUser)
  const [data, setData] = useState<VocationalResult | null>(null)
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    void resultsService.getMyResults().then((response) => {
      setData(response.data)
    })
  }, [])

  const topCareer = useMemo(() => {
    if (!data) {
      return null
    }

    return [...data.careers].sort((left, right) => right.affinity - left.affinity)[0] ?? null
  }, [data])

  async function handleDownload() {
    const response = await resultsService.downloadPdf()
    setStatusMessage(`Informe listo: ${response.data.fileName}`)
  }

  if (!data || !topCareer) {
    return <div className="loading-state">Cargando resultados...</div>
  }

  return (
    <div className="results-sheet-page">
      <section className="results-sheet">
        <header className="results-sheet__header">
          <h1>Resultados de tu Prueba Vocacional</h1>
        </header>

        <section className="results-sheet__hero">
          <div className="results-sheet__hero-icon" aria-hidden="true">
            <div className="results-sheet__hero-line results-sheet__hero-line--top" />
            <div className="results-sheet__hero-line results-sheet__hero-line--mid" />
            <div className="results-sheet__hero-line results-sheet__hero-line--low" />
            <div className="results-sheet__hero-head" />
          </div>
          <div className="results-sheet__hero-copy">
            <h2>Ingenierías y Tecnología</h2>
            <p>{data.qualitativeSummary}</p>
          </div>
          <div className="results-sheet__hero-user">
            <strong>{sessionUser?.fullName ?? 'Nombre Usuario'}</strong>
            <span>Tu perfil presenta mayor de acuerdo con:</span>
          </div>
        </section>

        <section className="results-sheet__charts">
          <ResultCharts affinityByArea={data.affinityByArea} radarProfile={data.radarProfile} />
        </section>

        <section className="results-sheet__programs">
          <h3>Programas Recomendados</h3>
          <div className="results-sheet__program-list">
            {data.careers.map((career, index) => (
              <article key={career.id} className="results-sheet__program-card">
                <div className="results-sheet__program-rank">{index + 1}</div>
                <div className="results-sheet__program-copy">
                  <strong>{career.name}</strong>
                  <span>{formatPercentage(career.affinity)} de compatibilidad</span>
                  <p>{career.summary}</p>
                </div>
                <div className="results-sheet__program-cta">
                  <div className="results-sheet__avatar" aria-hidden="true">
                    USB
                  </div>
                  <button type="button">Conocer más</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="results-sheet__summary">
          <h3>Resumen de tu perfil</h3>
          <p>
            Tus resultados indican una fuerte inclinación hacia el área de{' '}
            <span>{data.primaryArea}</span> con un <span>{topCareer.affinity}%</span> de afinidad.
            Esto sugiere que posees habilidades y preferencias alineadas con carreras en esta área.
          </p>
          <p className="results-sheet__meta">
            Informe generado el {formatDate(data.generatedAt)} con recomendaciones iniciales.
          </p>
          {statusMessage ? <p className="results-sheet__status">{statusMessage}</p> : null}
          <button
            type="button"
            className="results-sheet__download"
            onClick={handleDownload}
          >
            <span>Descargar PDF</span>
            <span aria-hidden="true">↓</span>
          </button>
        </section>
      </section>

      <button type="button" className="results-sheet__floating">
        <span className="results-sheet__avatar results-sheet__avatar--small" aria-hidden="true">
          USB
        </span>
        <span>Financiamiento</span>
      </button>
    </div>
  )
}
