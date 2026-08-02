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
    setStatusMessage(`Descarga simulada del informe: ${response.data.fileName}`)
  }

  if (!data || !topCareer) {
    return <div className="loading-state">Cargando resultados...</div>
  }

  return (
    <div className="resultado-vocacional">
      <section className="resultado-vocacional__panel">
        <header className="resultado-vocacional__encabezado">
          <h1>Resultados de tu prueba vocacional</h1>
        </header>

        <section className="perfil-vocacional">
          <div className="perfil-vocacional__icono" aria-hidden="true">
            <div className="perfil-vocacional__linea perfil-vocacional__linea--superior" />
            <div className="perfil-vocacional__linea perfil-vocacional__linea--media" />
            <div className="perfil-vocacional__linea perfil-vocacional__linea--inferior" />
            <div className="perfil-vocacional__figura" />
          </div>
          <div className="perfil-vocacional__contenido">
            <h2>IngenierÃ­as y TecnologÃ­a</h2>
            <p>{data.qualitativeSummary}</p>
          </div>
          <div className="perfil-vocacional__usuario">
            <strong>{sessionUser?.fullName ?? 'Nombre Usuario'}</strong>
            <span>Tu perfil presenta mayor afinidad con:</span>
          </div>
        </section>

        <section className="grafico-afinidad">
          <ResultCharts affinityByArea={data.affinityByArea} radarProfile={data.radarProfile} />
        </section>

        <section className="carreras-recomendadas">
          <h3>Carreras recomendadas</h3>
          <div className="carreras-recomendadas__lista">
            {data.careers.map((career, index) => (
              <article key={career.id} className="carreras-recomendadas__tarjeta">
                <div className="carreras-recomendadas__ranking">{index + 1}</div>
                <div className="carreras-recomendadas__contenido">
                  <strong>{career.name}</strong>
                  <span>{formatPercentage(career.affinity)} de compatibilidad</span>
                  <p>{career.summary}</p>
                </div>
                <div className="carreras-recomendadas__acciones">
                  <div className="resultado-vocacional__avatar" aria-hidden="true">
                    USB
                  </div>
                  <button type="button">Conocer mÃ¡s</button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="resumen-resultado">
          <h3>Resumen de tu perfil</h3>
          <p>
            Tus resultados indican una fuerte inclinaciÃ³n hacia el Ã¡rea de{' '}
            <span>{data.primaryArea}</span> con un <span>{topCareer.affinity}%</span> de afinidad.
            Esto sugiere que posees habilidades y preferencias alineadas con carreras en esta Ã¡rea.
          </p>
          <p className="resumen-resultado__meta">
            Informe generado el {formatDate(data.generatedAt)} con recomendaciones iniciales.
          </p>
          {statusMessage ? <p className="resumen-resultado__estado">{statusMessage}</p> : null}
          <button
            type="button"
            className="acciones-resultado__descarga"
            onClick={handleDownload}
          >
            <span>Descargar PDF</span>
            <span aria-hidden="true">â†“</span>
          </button>
        </section>
      </section>

      <button type="button" className="acciones-resultado__flotante">
        <span className="resultado-vocacional__avatar resultado-vocacional__avatar--compacto" aria-hidden="true">
          USB
        </span>
        <span>Financiamiento</span>
      </button>
    </div>
  )
}
