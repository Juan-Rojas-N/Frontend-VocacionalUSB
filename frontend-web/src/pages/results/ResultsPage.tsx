import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ResultCharts } from '../../components/charts/ResultCharts'
import { generateResultPdf } from '../../services/pdfService'
import { resultsService } from '../../services/resultsService'
import { useAuthStore } from '../../stores/authStore'
import type { VocationalResult } from '../../types'
import { formatDate, formatPercentage } from '../../utils/formatters'

export function ResultsPage() {
  const sessionUser = useAuthStore((state) => state.sessionUser)
  const { testId } = useParams<{ testId: string }>()
  const [searchParams] = useSearchParams()
  const studentName = searchParams.get('student')
  const [data, setData] = useState<VocationalResult | null>(null)
  const [selectedArea, setSelectedArea] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadResult = testId
      ? resultsService.getResultByTest(testId)
      : resultsService.getMyResults()

    void loadResult
      .then((response) => {
        setData(response.data)
        setSelectedArea(response.data.primaryArea)
        setErrorMessage('')
      })
      .catch((error) => {
        setErrorMessage(
          error instanceof Error ? error.message : 'No fue posible consultar tus resultados.',
        )
      })
  }, [testId])

  const topCareer = useMemo(() => {
    if (!data) {
      return null
    }

    return [...data.careers].sort((left, right) => right.affinity - left.affinity)[0] ?? null
  }, [data])

  const selectedProfile = useMemo(() => {
    if (!data || !selectedArea) {
      return null
    }

    return (data.areaProfiles ?? []).find((profile) => profile.nombreArea === selectedArea) ?? null
  }, [data, selectedArea])

  const primaryProfile = useMemo(() => {
    if (!data) {
      return null
    }

    return (data.areaProfiles ?? []).find((profile) => profile.nombreArea === data.primaryArea) ?? null
  }, [data])

  async function handleDownload() {
    if (!data) {
      return
    }

    try {
      const fileName = generateResultPdf(
        data,
        studentName ?? sessionUser?.fullName ?? 'Estudiante USB',
      )
      setStatusMessage(`Informe generado: ${fileName}`)
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : 'No fue posible generar el PDF.',
      )
    }
  }

  if (errorMessage && !data) {
    return (
      <div className="resultado-vocacional">
        <section className="resultado-vocacional__panel">
          <header className="resultado-vocacional__encabezado">
            <h1>
              {testId ? 'Resultado de la prueba del estudiante' : 'Resultados de tu prueba vocacional'}
            </h1>
          </header>
          <div className="introduccion-prueba__alerta">
            <strong>No fue posible consultar los resultados.</strong>
            <p>{errorMessage}</p>
          </div>
        </section>
      </div>
    )
  }

  if (!data || !topCareer) {
    return <div className="loading-state">Cargando resultados...</div>
  }

  return (
    <div className="resultado-vocacional">
      <section className="resultado-vocacional__panel">
        <header className="resultado-vocacional__encabezado">
          <h1>
            {testId ? 'Resultado de la prueba del estudiante' : 'Resultados de tu prueba vocacional'}
          </h1>
        </header>

        <section className="perfil-vocacional">
          {primaryProfile?.imagenUrl ? (
            <img
              className="perfil-vocacional__imagen"
              src={primaryProfile.imagenUrl}
              alt={data.primaryArea}
            />
          ) : (
            <div className="perfil-vocacional__icono" aria-hidden="true">
              <div className="perfil-vocacional__linea perfil-vocacional__linea--superior" />
              <div className="perfil-vocacional__linea perfil-vocacional__linea--media" />
              <div className="perfil-vocacional__linea perfil-vocacional__linea--inferior" />
              <div className="perfil-vocacional__figura" />
            </div>
          )}
          <div className="perfil-vocacional__contenido">
            <h2>{data.primaryArea}</h2>
            <p>{data.qualitativeSummary}</p>
          </div>
          <div className="perfil-vocacional__usuario">
            <strong>{studentName ?? sessionUser?.fullName ?? 'Nombre Usuario'}</strong>
            <span>Tu perfil presenta mayor afinidad con:</span>
          </div>
        </section>

        <section className="grafico-afinidad">
          <ResultCharts
            affinityByArea={data.affinityByArea}
            selectedArea={selectedArea ?? data.primaryArea}
            selectedProfile={selectedProfile}
            onAreaSelect={setSelectedArea}
          />
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
                  {career.url ? (
                    <a
                      href={career.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="carreras-recomendadas__enlace"
                    >
                      Conocer más
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="resumen-resultado">
          <h3>Resumen de tu perfil</h3>
          <p>
            Según tus respuestas, tu mayor afinidad es con el área de{' '}
            <span>{data.primaryArea}</span>, con un resultado de{' '}
            <span>{formatPercentage(topCareer.affinity)}</span>. Esto indica que podrías sentirte
            cómodo/a explorando carreras relacionadas, ya que se alinean con tus intereses,
            habilidades y preferencias.
          </p>
          <p>
            Recuerda que este resultado es una orientación inicial: úsalo como punto de partida para
            conocer programas, investigar sus campos de acción y descubrir cuáles se ajustan mejor a
            tu proyecto de vida.
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
            <span aria-hidden="true">↓</span>
          </button>
        </section>
      </section>

      <a
        href="https://www.usbbog.edu.co/admisiones/financiacion-y-pagos/"
        target="_blank"
        rel="noopener noreferrer"
        className="acciones-resultado__flotante"
      >
        <span
          className="resultado-vocacional__avatar resultado-vocacional__avatar--compacto"
          aria-hidden="true"
        >
          USB
        </span>
        <span>Financiamiento</span>
      </a>
    </div>
  )
}
