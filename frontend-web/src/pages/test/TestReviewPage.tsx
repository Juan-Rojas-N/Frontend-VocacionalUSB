import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/common/Button'
import { SectionCard } from '../../components/common/SectionCard'
import { APP_ROUTES } from '../../constants'
import { testService } from '../../services/testService'
import { useTestSessionStore } from '../../stores/testSessionStore'

export function TestReviewPage() {
  const navigate = useNavigate()
  const { attemptId, questions, answers, setCurrentIndex, clear } = useTestSessionStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const unanswered = questions.filter((question) => !answers[question.id])

  async function handleSubmit() {
    if (!attemptId) {
      navigate(APP_ROUTES.testIntro)
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      await testService.submitAttempt({
        attemptId,
        submittedAt: new Date().toISOString(),
        answers,
      })
      clear()
      navigate(APP_ROUTES.results)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible enviar la prueba.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="test-shell">
      <div className="page-title">
        <p className="eyebrow">Revisión final</p>
        <h1>Verifica tus respuestas antes de enviar</h1>
      </div>

      <div className="summary-grid">
        <SectionCard title="Resumen de completitud" eyebrow="Checklist">
          <div className="notice-card">
            <strong>{Object.keys(answers).length} respuestas registradas</strong>
            <p>{unanswered.length === 0 ? 'Todo listo para finalizar.' : `Aún faltan ${unanswered.length} respuestas.`}</p>
          </div>
          <div className="review-card">
            {questions.map((question, index) => (
              <div key={question.id} className="review-item">
                <div>
                  <strong>Pregunta {index + 1}</strong>
                  <p className="muted">{question.prompt}</p>
                </div>
                <div className="inline-actions">
                  <span className={`status-pill${answers[question.id] ? '' : ' status-pill--danger'}`}>
                    {answers[question.id] ? 'Respondida' : 'Pendiente'}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setCurrentIndex(index)
                      navigate(APP_ROUTES.testSession)
                    }}
                  >
                    Editar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Confirmación de envío" eyebrow="Submit">
          <ul className="bullet-list">
            <li>El cálculo de resultados aún es simulado, pero el flujo final ya está conectado.</li>
            <li>La siguiente pantalla mostrará carreras recomendadas, gráficos y descarga simulada en PDF.</li>
            <li>Si cancelas ahora, puedes volver a la prueba y ajustar respuestas.</li>
          </ul>
          {errorMessage ? <div className="notice-card"><strong>Error</strong><p>{errorMessage}</p></div> : null}
          <div className="inline-actions">
            <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Finalizar prueba'}
            </Button>
            <Button type="button" variant="secondary" onClick={() => navigate(APP_ROUTES.testSession)}>
              Volver a preguntas
            </Button>
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
