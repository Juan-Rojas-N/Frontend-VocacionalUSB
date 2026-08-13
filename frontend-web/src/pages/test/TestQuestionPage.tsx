import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InstitutionalModal } from '../../components/common/InstitutionalModal'
import { TestExitGuard } from '../../components/test/TestExitGuard'
import { APP_ROUTES } from '../../constants'
import { useCountdown } from '../../hooks/useCountdown'
import { testService } from '../../services/testService'
import { useTestSessionStore } from '../../stores/testSessionStore'

function formatClock(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const QUESTIONS_PAGE_SIZE = 12

export function TestQuestionPage() {
  const navigate = useNavigate()
  const {
    attemptId,
    startedAt,
    questions,
    answers,
    currentIndex,
    expiresAt,
    versionLabel,
    attemptLabel,
    audienceLabel,
    setCurrentIndex,
    answerQuestion,
    introAcknowledged,
    acknowledgeIntro,
    clear,
  } = useTestSessionStore()

  const [introOpen, setIntroOpen] = useState(!introAcknowledged)
  const [resultsOpen, setResultsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const currentQuestion = questions[currentIndex]

  const questionsPage = Math.floor(currentIndex / QUESTIONS_PAGE_SIZE)

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(questions.length / QUESTIONS_PAGE_SIZE)),
    [questions.length],
  )

  const visibleQuestions = useMemo(
    () => questions.slice(questionsPage * QUESTIONS_PAGE_SIZE, (questionsPage + 1) * QUESTIONS_PAGE_SIZE),
    [questions, questionsPage],
  )
  const remainingSeconds = useCountdown(expiresAt, () => {
    setIntroOpen(false)
    setResultsOpen(true)
  })

  const progress = useMemo(() => {
    if (questions.length === 0) {
      return 0
    }

    return Math.round(((currentIndex + 1) / questions.length) * 100)
  }, [currentIndex, questions.length])

  const answeredCount = useMemo(
    () => questions.filter((question) => answers[question.id]).length,
    [answers, questions],
  )

  const elapsedSeconds = useMemo(() => {
    if (!startedAt || !expiresAt) {
      return 0
    }

    const total = Math.max(0, Math.round((expiresAt - new Date(startedAt).getTime()) / 1000))
    return Math.max(0, total - remainingSeconds)
  }, [expiresAt, remainingSeconds, startedAt])

  useEffect(() => {
    if (!questions.length && !isSubmitting) {
      navigate(APP_ROUTES.testIntro, { replace: true })
    }
  }, [isSubmitting, navigate, questions.length])

  if (!currentQuestion) {
    return null
  }

  function closeIntro() {
    acknowledgeIntro()
    setIntroOpen(false)
  }

  async function handleFinish() {
    if (!attemptId) {
      navigate(APP_ROUTES.testIntro, { replace: true })
      return
    }

    try {
      setIsSubmitting(true)
      setErrorMessage('')
      await testService.submitAttempt({
        attemptId,
        submittedAt: new Date().toISOString(),
        answers,
        questions,
      })
      navigate(APP_ROUTES.results, { replace: true })
      window.setTimeout(() => clear(), 0)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No fue posible finalizar la prueba.')
      setIsSubmitting(false)
    }
  }

  function handleAdvance() {
    if (currentIndex === questions.length - 1) {
      navigate(APP_ROUTES.testReview)
      return
    }

    setCurrentIndex(currentIndex + 1)
  }

  return (
    <>
      <TestExitGuard />
      <div className="sesion-prueba">
        <section className="sesion-prueba__panel">
          <div className="sesion-prueba__encabezado">
            <div className="sesion-prueba__badges">
              <span className="sesion-prueba__badge">Prueba vocacional</span>
              <span className="sesion-prueba__badge sesion-prueba__badge--suave">
                {audienceLabel ?? 'Usuario interno'}
              </span>
            </div>
            <div className="sesion-prueba__badges">
              <span className="sesion-prueba__badge">{versionLabel ?? 'Versión v1.1'}</span>
              <span className="sesion-prueba__badge">{attemptLabel ?? 'Intento #00011'}</span>
            </div>
          </div>

          <div className="progreso-prueba__resumen">
            <div className="progreso-prueba__bloque">
              <strong>Tiempo transcurrido</strong>
              <p>{formatClock(elapsedSeconds)}</p>
            </div>
            <div className="progreso-prueba__bloque progreso-prueba__bloque--alineado">
              <strong>Continuidad</strong>
              <p>Si sales, deberás iniciar nuevamente</p>
            </div>
          </div>

          <div className="progreso-prueba">
            <div className="progreso-prueba__avance" style={{ width: `${progress}%` }} />
          </div>

          <section className="pregunta-prueba">
            <div className="pregunta-prueba__encabezado">
              <span>
                Pregunta {currentIndex + 1} de {questions.length} | {progress}%
              </span>
            </div>
            <div className="pregunta-prueba__divisor" />
            <h1>{currentQuestion.prompt}</h1>

            <div className="respuesta-prueba__opciones">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`respuesta-prueba__opcion${isSelected ? ' respuesta-prueba__opcion--seleccionada' : ''}`}
                    onClick={() => answerQuestion(currentQuestion.id, option.value)}
                  >
                    <span
                      className={`respuesta-prueba__indicador${isSelected ? ' respuesta-prueba__indicador--seleccionado' : ''}`}
                    />
                    <span className="respuesta-prueba__etiqueta">{option.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="navegacion-preguntas__acciones">
              <button
                type="button"
                className="navegacion-preguntas__boton navegacion-preguntas__boton--secundario"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
              >
                Anterior
              </button>
              <button
                type="button"
                className="navegacion-preguntas__boton navegacion-preguntas__boton--primario"
                onClick={handleAdvance}
              >
                {currentIndex === questions.length - 1 ? 'Finalizar' : 'Siguiente'}
              </button>
            </div>
          </section>

          <div className="navegacion-preguntas" aria-label="Navegacion de preguntas">
            <div className="navegacion-preguntas__estado">
              <strong>{answeredCount}</strong>
              <span>de {questions.length} respondidas</span>
            </div>
            <div className="navegacion-preguntas__paginacion">
              <button
                type="button"
                className="navegacion-preguntas__flecha"
                onClick={() =>
                  setCurrentIndex(Math.max(0, questionsPage * QUESTIONS_PAGE_SIZE - 1))
                }
                disabled={questionsPage === 0}
                aria-label="Ver preguntas anteriores"
                title="Ver preguntas anteriores"
              >
                ‹
              </button>
              <div className="navegacion-preguntas__lista">
                {visibleQuestions.map((question, index) => {
                  const globalIndex = questionsPage * QUESTIONS_PAGE_SIZE + index
                  const isAnswered = Boolean(answers[question.id])

                  return (
                    <button
                      key={question.id}
                      type="button"
                      className={[
                        'navegacion-preguntas__item',
                        globalIndex === currentIndex ? 'navegacion-preguntas__item--activo' : '',
                        isAnswered ? 'navegacion-preguntas__item--respondida' : '',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      onClick={() => setCurrentIndex(globalIndex)}
                      aria-label={`Pregunta ${globalIndex + 1}: ${isAnswered ? 'respondida' : 'pendiente'}`}
                      title={isAnswered ? 'Respondida' : 'Pendiente'}
                    >
                      <span>{globalIndex + 1}</span>
                    </button>
                  )
                })}
              </div>
              <button
                type="button"
                className="navegacion-preguntas__flecha"
                onClick={() =>
                  setCurrentIndex(
                    Math.min(questions.length - 1, (questionsPage + 1) * QUESTIONS_PAGE_SIZE),
                  )
                }
                disabled={questionsPage >= totalPages - 1}
                aria-label="Ver siguientes preguntas"
                title="Ver siguientes preguntas"
              >
                ›
              </button>
            </div>
            <button
              type="button"
              className="navegacion-preguntas__item navegacion-preguntas__item--revision"
              onClick={() => navigate(APP_ROUTES.testReview)}
              aria-label="Revisar respuestas"
              title="Revisar respuestas"
            >
              <span>R</span>
            </button>
          </div>
        </section>
      </div>

      <InstitutionalModal
        open={introOpen}
        onClose={closeIntro}
        title="Antes de iniciar la prueba"
      >
        <p>
          Lee con atención cada pregunta y responde con sinceridad. No hay respuestas correctas o
          incorrectas: el objetivo es identificar tus afinidades de manera clara.
        </p>
        <button
          type="button"
          className="boton-principal boton-principal--pequeno"
          onClick={closeIntro}
        >
          Comenzar
        </button>
      </InstitutionalModal>

      <InstitutionalModal
        open={resultsOpen}
        onClose={() => {
          if (!isSubmitting) {
            setResultsOpen(false)
          }
        }}
        title="Tus resultados están listos"
        theme="dark"
      >
        <p>
          Al continuar verás un resumen vocacional con áreas destacadas, carreras recomendadas y una
          descarga simulada del informe institucional.
        </p>
        {errorMessage ? <p className="form-field__error">{errorMessage}</p> : null}
        <button
          type="button"
          className="sesion-prueba__accion-final"
          onClick={() => void handleFinish()}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Preparando resultados...' : 'Ver resultados'}
        </button>
      </InstitutionalModal>
    </>
  )
}
