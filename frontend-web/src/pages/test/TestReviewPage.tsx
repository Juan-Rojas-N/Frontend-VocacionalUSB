import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InstitutionalModal } from '../../components/common/InstitutionalModal'
import { TestExitGuard } from '../../components/test/TestExitGuard'
import { APP_ROUTES } from '../../constants'
import { testService } from '../../services/testService'
import { useTestSessionStore } from '../../stores/testSessionStore'

export function TestReviewPage() {
  const navigate = useNavigate()
  const {
    attemptId,
    questions,
    answers,
    versionLabel,
    attemptLabel,
    audienceLabel,
    setCurrentIndex,
    clear,
  } = useTestSessionStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [confirmationOpen, setConfirmationOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const isFinishingRef = useRef(false)
  const errorRef = useRef<HTMLParagraphElement>(null)

  const unanswered = useMemo(
    () => questions.filter((question) => !answers[question.id]),
    [answers, questions],
  )
  const answeredCount = questions.length - unanswered.length
  const completion = questions.length === 0 ? 0 : Math.round((answeredCount / questions.length) * 100)

  useEffect(() => {
    if (!questions.length && !isFinishingRef.current) {
      navigate(APP_ROUTES.testIntro, { replace: true })
    }
  }, [navigate, questions.length])

  function getAnswerLabel(questionId: string) {
    const question = questions.find((item) => item.id === questionId)
    const answerValue = answers[questionId]
    return question?.options.find((option) => option.value === answerValue)?.label
  }

  function editQuestion(index: number) {
    setCurrentIndex(index)
    navigate(APP_ROUTES.testSession)
  }

  function goToFirstPending() {
    const firstPendingIndex = questions.findIndex((question) => !answers[question.id])
    if (firstPendingIndex >= 0) {
      editQuestion(firstPendingIndex)
    }
  }

  function requestSubmission() {
    if (unanswered.length > 0) {
      setErrorMessage(
        `Aún faltan ${unanswered.length} ${unanswered.length === 1 ? 'respuesta' : 'respuestas'}. Complétalas antes de enviar.`,
      )
      window.requestAnimationFrame(() => errorRef.current?.focus())
      return
    }

    setErrorMessage('')
    setConfirmationOpen(true)
  }

  async function handleSubmit() {
    if (!attemptId) {
      navigate(APP_ROUTES.testIntro)
      return
    }

    if (unanswered.length > 0) {
      setConfirmationOpen(false)
      requestSubmission()
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
      isFinishingRef.current = true
      setConfirmationOpen(false)
      navigate(APP_ROUTES.results, { replace: true })
      window.setTimeout(() => clear(), 0)
    } catch (error) {
      setConfirmationOpen(false)
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible enviar la prueba.')
      window.requestAnimationFrame(() => errorRef.current?.focus())
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!questions.length) {
    return null
  }

  return (
    <>
      <TestExitGuard />
      <div className="sesion-prueba">
        <section className="sesion-prueba__panel sesion-prueba__panel--revision">
          <div className="sesion-prueba__encabezado">
            <div className="sesion-prueba__badges">
              <span className="sesion-prueba__badge">Revisión final</span>
              <span className="sesion-prueba__badge sesion-prueba__badge--suave">
                {audienceLabel ?? 'Usuario interno'}
              </span>
            </div>
            <div className="sesion-prueba__badges">
              <span className="sesion-prueba__badge">{versionLabel ?? 'Versión v1.1'}</span>
              <span className="sesion-prueba__badge">{attemptLabel ?? 'Intento #00011'}</span>
            </div>
          </div>

          <section className="revision-resumen" aria-labelledby="revision-summary-title">
            <div className="revision-resumen__heading">
              <div>
                <span>Estado de tus respuestas</span>
                <h1 id="revision-summary-title">Revisa antes de enviar</h1>
              </div>
              <strong>{completion}% completado</strong>
            </div>

            <div className="revision-resumen__cards">
              <article className="revision-resumen__card revision-resumen__card--answered">
                <span>Respondidas</span>
                <strong>{answeredCount}</strong>
                <small>Respuestas registradas</small>
              </article>
              <article className="revision-resumen__card revision-resumen__card--pending">
                <span>Pendientes</span>
                <strong>{unanswered.length}</strong>
                <small>Preguntas por completar</small>
              </article>
              <article className="revision-resumen__card revision-resumen__card--total">
                <span>Total</span>
                <strong>{questions.length}</strong>
                <small>Preguntas de la prueba</small>
              </article>
            </div>

            <div
              className={`revision-resumen__status${unanswered.length === 0 ? ' revision-resumen__status--complete' : ''}`}
              role="status"
            >
              <span aria-hidden="true">{unanswered.length === 0 ? '✓' : '!'}</span>
              <div>
                <strong>
                  {unanswered.length === 0
                    ? 'Tu prueba está completa'
                    : 'Aún tienes respuestas pendientes'}
                </strong>
                <p>
                  {unanswered.length === 0
                    ? 'Puedes finalizar cuando hayas comprobado tus respuestas.'
                    : 'Ve a la primera pendiente o abre una pregunta específica desde el listado.'}
                </p>
              </div>
              {unanswered.length > 0 ? (
                <button type="button" onClick={goToFirstPending}>
                  Ir a la primera pendiente
                </button>
              ) : null}
            </div>

            <div
              className="progreso-prueba"
              role="progressbar"
              aria-label="Progreso de respuestas"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={completion}
            >
              <div className="progreso-prueba__avance" style={{ width: `${completion}%` }} />
            </div>
          </section>

          <section className="pregunta-prueba revision-prueba">
            <div className="pregunta-prueba__encabezado">
              <span>Verificación de respuestas</span>
            </div>
            <div className="pregunta-prueba__divisor" />

            <div className="revision-prueba__contenido">
              <div
                className="revision-prueba__lista"
                tabIndex={0}
                aria-label="Listado de respuestas"
              >
                {questions.map((question, index) => {
                  const answerLabel = getAnswerLabel(question.id)

                  return (
                    <article
                      key={question.id}
                      className={[
                        'revision-prueba__item',
                        answerLabel
                          ? 'revision-prueba__item--respondida'
                          : 'revision-prueba__item--pendiente',
                      ].join(' ')}
                    >
                      <div>
                        <strong>Pregunta {index + 1}</strong>
                        <p>{question.prompt}</p>
                        <span>
                          {answerLabel ? `Respuesta: ${answerLabel}` : 'Sin respuesta seleccionada'}
                        </span>
                      </div>
                      <div className="revision-prueba__acciones">
                        <small>{answerLabel ? 'Respondida' : 'Pendiente'}</small>
                        <button type="button" onClick={() => editQuestion(index)}>
                          Editar
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>

              <aside className="revision-prueba__confirmacion">
                <strong>Confirmación de envío</strong>
                <p>
                  Una vez enviada, la prueba se cerrará y verás el resumen de afinidades y programas.
                </p>
                {errorMessage ? (
                  <p ref={errorRef} className="form-field__error" role="alert" tabIndex={-1}>
                    {errorMessage}
                  </p>
                ) : null}
                <div className="navegacion-preguntas__acciones revision-prueba__botones">
                  <button
                    type="button"
                    className="navegacion-preguntas__boton navegacion-preguntas__boton--primario"
                    onClick={requestSubmission}
                    disabled={isSubmitting}
                  >
                    Finalizar prueba
                  </button>
                  {unanswered.length > 0 ? (
                    <button
                      type="button"
                      className="navegacion-preguntas__boton navegacion-preguntas__boton--secundario"
                      onClick={goToFirstPending}
                    >
                      Ir a la primera pendiente
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="navegacion-preguntas__boton navegacion-preguntas__boton--secundario"
                    onClick={() => navigate(APP_ROUTES.testSession)}
                  >
                    Volver a preguntas
                  </button>
                </div>
              </aside>
            </div>
          </section>
        </section>
      </div>

      <InstitutionalModal
        open={confirmationOpen}
        title="¿Enviar tu prueba vocacional?"
        theme="dark"
        onClose={() => {
          if (!isSubmitting) {
            setConfirmationOpen(false)
          }
        }}
      >
        <p>
          Has respondido las {questions.length} preguntas. Al confirmar, el intento se enviará y ya
          no podrás modificar estas respuestas.
        </p>
        <div className="institutional-modal__actions institutional-modal__actions--row">
          <button
            type="button"
            className="sesion-prueba__accion-final"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Enviando...' : 'Sí, enviar prueba'}
          </button>
          <button
            type="button"
            className="sesion-prueba__accion-final sesion-prueba__accion-final--secundario"
            onClick={() => setConfirmationOpen(false)}
            disabled={isSubmitting}
          >
            Seguir revisando
          </button>
        </div>
      </InstitutionalModal>
    </>
  )
}
