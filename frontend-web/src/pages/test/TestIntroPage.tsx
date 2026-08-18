import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GuideCardCarousel } from '../../components/common/GuideCardCarousel'
import { APP_ROUTES } from '../../constants'
import { testService } from '../../services/testService'
import { useTestSessionStore } from '../../stores/testSessionStore'

export function TestIntroPage() {
  const navigate = useNavigate()
  const initialize = useTestSessionStore((state) => state.initialize)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function handleStart() {
    try {
      setIsLoading(true)
      setErrorMessage('')
      const response = await testService.startAttempt()
      initialize({
        attemptId: response.data.id,
        startedAt: response.data.startedAt,
        expiresAt: response.data.expiresAt,
        versionLabel: response.data.versionLabel,
        attemptLabel: response.data.attemptLabel,
        audienceLabel: response.data.audienceLabel,
        questions: response.data.questions,
      })
      navigate(APP_ROUTES.testSession)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible iniciar la prueba.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="introduccion-prueba">
      <section className="introduccion-prueba__panel">
        <div className="introduccion-prueba__contenido">
          <span className="introduccion-prueba__eyebrow">Orientación vocacional digital</span>
          <h1>Prepárate antes de comenzar la prueba</h1>
          <p>
            Esta vista reúne el contexto previo, la forma de responder y los pasos que verás antes,
            durante y después del test vocacional.
          </p>
          <ul className="introduccion-prueba__lista">
            <li>Busca un espacio tranquilo y responde pensando en tus gustos reales.</li>
            <li>Las tarjetas se recorren dentro de esta misma página, como en la guía.</li>
            <li>El tiempo estimado es de 35 minutos y podrás revisar el progreso en sesión.</li>
          </ul>
          {errorMessage ? (
            <div className="introduccion-prueba__alerta">
              <strong>No fue posible iniciar la prueba.</strong>
              <p>{errorMessage}</p>
            </div>
          ) : null}
          <button
            type="button"
            className="introduccion-prueba__accion"
            onClick={handleStart}
            disabled={isLoading}
          >
            {isLoading ? 'Preparando prueba...' : 'Iniciar prueba'}
          </button>
        </div>

        <div className="introduccion-prueba__guia">
          <GuideCardCarousel />
        </div>
      </section>
    </div>
  )
}
