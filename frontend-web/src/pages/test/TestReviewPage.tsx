import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const [errorMessage, setErrorMessage] = useState('')
  const isFinishingRef = useRef(false)

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

  async function handleSubmit() {
    if (!attemptId) {
      navigate(APP_ROUTES.testIntro)
      return
    }

    if (unanswered.length > 0) {
      setErrorMessage('Completa todas las preguntas antes de finalizar la prueba.')
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
      navigate(APP_ROUTES.results, { replace: true })
      window.setTimeout(() => clear(), 0)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible enviar la prueba.')
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
              <span className="sesion-prueba__badge">Revision final</span>
              <span className="sesion-prueba__badge sesion-prueba__badge--suave">
                {audienceLabel ?? 'Usuario interno'}
              </span>
            </div>
            <div className="sesion-prueba__badges">
              <span className="sesion-prueba__badge">{versionLabel ?? 'Version v1.1'}</span>
              <span className="sesion-prueba__badge">{attemptLabel ?? 'Intento #00011'}</span>
            </div>
          </div>

          <div className="progreso-prueba__resumen">
            <div className="progreso-prueba__bloque">
              <strong>Respuestas registradas</strong>
              <p>{answeredCount} de {questions.length}</p>
            </div>
            <div className="progreso-prueba__bloque progreso-prueba__bloque--alineado">
              <strong>Estado</strong>
              <p>{unanswered.length === 0 ? 'Todo listo para enviar' : `Faltan ${unanswered.length} preguntas`}</p>
            </div>
          </div>

          <div className="progreso-prueba">
            <div className="progreso-prueba__avance" style={{ width: `${completion}%` }} />
          </div>

          <section className="pregunta-prueba revision-prueba">
            <div className="pregunta-prueba__encabezado">
              <span>Verificacion de respuestas | {completion}%</span>
            </div>
            <div className="pregunta-prueba__divisor" />
            <h1>Confirma tus respuestas antes de enviar</h1>

            <div className="revision-prueba__contenido">
              <div className="revision-prueba__lista" tabIndex={0} aria-label="Listado de respuestas">
                {questions.map((question, index) => {
                  const answerLabel = getAnswerLabel(question.id)

                  return (
                    <article
                      key={question.id}
                      className={[
                        'revision-prueba__item',
                        answerLabel ? 'revision-prueba__item--respondida' : 'revision-prueba__item--pendiente',
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
                <strong>Confirmacion de envio</strong>
                <p>
                  Revisa el listado. Si alguna pregunta esta pendiente, vuelve a editarla antes de
                  finalizar la prueba.
                </p>
                {errorMessage ? <p className="form-field__error">{errorMessage}</p> : null}
                <div className="navegacion-preguntas__acciones revision-prueba__botones">
                  <button
                    type="button"
                    className="navegacion-preguntas__boton navegacion-preguntas__boton--primario"
                    onClick={() => void handleSubmit()}
                    disabled={isSubmitting || unanswered.length > 0}
                  >
                    {isSubmitting
                      ? 'Enviando...'
                      : unanswered.length > 0
                        ? 'Completa pendientes'
                        : 'Finalizar prueba'}
                  </button>
                  <button
                    type="button"
                    className="navegacion-preguntas__boton navegacion-preguntas__boton--secundario"
                    onClick={() => navigate(APP_ROUTES.testSession)}
                  >
                    Volver
                  </button>
                </div>
              </aside>
            </div>
          </section>
        </section>
      </div>
    </>
  )
}
