import { formatDuration } from '../../utils/formatters'

interface TestSidebarProps {
  total: number
  currentIndex: number
  answeredCount: number
  remainingSeconds: number
  onJump: (index: number) => void
  answeredMap: Record<string, number>
  questionIds: string[]
}

export function TestSidebar({
  total,
  currentIndex,
  answeredCount,
  remainingSeconds,
  onJump,
  answeredMap,
  questionIds,
}: TestSidebarProps) {
  const completion = total === 0 ? 0 : Math.round((answeredCount / total) * 100)

  return (
    <aside className="test-sidebar">
      <div className="timer-badge">
        <span>Tiempo restante</span>
        <strong>{formatDuration(remainingSeconds)}</strong>
      </div>
      <div className="progress-panel">
        <div className="progress-panel__labels">
          <span>Progreso</span>
          <strong>{completion}%</strong>
        </div>
        <div className="progress-track" aria-hidden="true">
          <div className="progress-track__fill" style={{ width: `${completion}%` }} />
        </div>
        <small>{answeredCount} de {total} preguntas respondidas</small>
      </div>
      <div className="question-jump-grid">
        {questionIds.map((questionId, index) => {
          const classes = ['question-jump']
          if (currentIndex === index) {
            classes.push('question-jump--active')
          }
          if (answeredMap[questionId]) {
            classes.push('question-jump--done')
          }

          return (
            <button
              key={questionId}
              type="button"
              className={classes.join(' ')}
              onClick={() => onJump(index)}
            >
              {index + 1}
            </button>
          )
        })}
      </div>
    </aside>
  )
}
