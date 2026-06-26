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
      <div className="session-mockup-page">
        <section className="session-mockup-shell">
          <div className="session-mockup-topline">
            <div className="session-mockup-pills">
              <span className="session-mockup-pill">Tamizaje vocacional</span>
              <span className="session-mockup-pill session-mockup-pill--soft">
                {audienceLabel ?? 'Usuario interno'}
              </span>
            </div>
            <div className="session-mockup-pills">
              <span className="session-mockup-pill">{versionLabel ?? 'Versión v1.1'}</span>
              <span className="session-mockup-pill">{attemptLabel ?? 'Intento #00011'}</span>
            </div>
          </div>

          <div className="session-mockup-status">
            <div className="session-mockup-status__block">
              <strong>Tiempo transcurrido</strong>
              <p>{formatClock(elapsedSeconds)}</p>
            </div>
            <div className="session-mockup-status__block session-mockup-status__block--right">
              <strong>Continuidad</strong>
              <p>Si sales, deberás iniciar nuevamente</p>
            </div>
          </div>

          <div className="session-mockup-progress">
            <div className="session-mockup-progress__fill" style={{ width: `${progress}%` }} />
          </div>

          <section className="session-mockup-question">
            <div className="session-mockup-question__header">
              <span>
                Pregunta {currentIndex + 1} de {questions.length} | {progress}%
              </span>
            </div>
            <div className="session-mockup-question__divider" />
            <h1>{currentQuestion.prompt}</h1>

            <div className="session-mockup-options">
              {currentQuestion.options.map((option) => {
                const isSelected = answers[currentQuestion.id] === option.value

                return (
                  <button
                    key={option.value}
                    type="button"
                    className={`session-mockup-option${isSelected ? ' session-mockup-option--selected' : ''}`}
                    onClick={() => answerQuestion(currentQuestion.id, option.value)}
                  >
                    <span
                      className={`session-mockup-option__box${isSelected ? ' session-mockup-option__box--selected' : ''}`}
                    />
                    <span className="session-mockup-option__label">{option.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="session-mockup-actions">
              <button
                type="button"
                className="session-mockup-button session-mockup-button--secondary"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0}
              >
                Anterior
              </button>
              <button
                type="button"
                className="session-mockup-button session-mockup-button--primary"
                onClick={handleAdvance}
              >
                {currentIndex === questions.length - 1 ? 'Finalizar' : 'Siguiente'}
              </button>
            </div>
          </section>

          <div className="session-mockup-pagination">
            {questions.map((question, index) => (
              <button
                key={question.id}
                type="button"
                className={[
                  'session-mockup-pagination__item',
                  index === currentIndex ? 'session-mockup-pagination__item--active' : '',
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
              className="session-mockup-pagination__item"
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
          Lee con atención cada pregunta y responde con sinceridad. No hay respuestas correctas o
          incorrectas: el objetivo es identificar tus afinidades de manera clara.
        </p>
        <button
          type="button"
          className="mockup-primary-button mockup-primary-button--small"
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
        title="Tus resultados están listos"
        theme="dark"
      >
        <p>
          Al continuar verás un resumen vocacional con áreas destacadas, programas sugeridos y una
          descarga mock del informe institucional.
        </p>
        {errorMessage ? <p className="form-field__error">{errorMessage}</p> : null}
        <button
          type="button"
          className="mockup-dark-button"
          onClick={() => void handleFinish()}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Preparando resultados...' : 'Ver resultados'}
        </button>
      </InstitutionalModal>
    </>
  )
}
