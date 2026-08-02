import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InstitutionalModal } from '../../components/common/InstitutionalModal'
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
    clear,
  } = useTestSessionStore()

  const [introOpen, setIntroOpen] = useState(true)
  const [resultsOpen, setResultsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const currentQuestion = questions[currentIndex]
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

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  if (!currentQuestion) {
    return null
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
      setResultsOpen(true)
      return
    }

    setCurrentIndex(currentIndex + 1)
  }

  return (
    <>
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
              <span className="sesion-prueba__badge">{versionLabel ?? 'VersiÃ³n v1.1'}</span>
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
              <p>Si sales, deberÃ¡s iniciar nuevamente</p>
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

          <div className="navegacion-preguntas">
            {questions.map((question, index) => (
              <button
                key={question.id}
                type="button"
                className={[
                  'navegacion-preguntas__item',
                  index === currentIndex ? 'navegacion-preguntas__item--activo' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => setCurrentIndex(index)}
              >
                {index + 1}
              </button>
            ))}
            <button
              type="button"
              className="navegacion-preguntas__item"
              onClick={() => setResultsOpen(true)}
            >
              X
            </button>
          </div>
        </section>
      </div>

      <InstitutionalModal
        open={introOpen}
        onClose={() => setIntroOpen(false)}
        title="Antes de iniciar la prueba"
      >
        <p>
          Lee con atenciÃ³n cada pregunta y responde con sinceridad. No hay respuestas correctas o
          incorrectas: el objetivo es identificar tus afinidades de manera clara.
        </p>
        <button
          type="button"
          className="boton-principal boton-principal--pequeno"
          onClick={() => setIntroOpen(false)}
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
        title="Tus resultados estÃ¡n listos"
        theme="dark"
      >
        <p>
          Al continuar verÃ¡s un resumen vocacional con Ã¡reas destacadas, carreras recomendadas y una
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
