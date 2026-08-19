import type { TestQuestion } from '../../types'

interface QuestionCardProps {
  question: TestQuestion
  value?: number
  onChange: (value: number) => void
}

export function QuestionCard({
  question,
  value,
  onChange,
}: QuestionCardProps) {
  return (
    <article className="question-card">
      <div className="question-card__meta">
        <span>{question.dimension}</span>
        <span>{question.area}</span>
      </div>
      <h2>{question.prompt}</h2>
      <div className="answer-list">
        {question.options.map((option) => (
          <label key={option.value} className="answer-option">
            <input
              type="radio"
              name={question.id}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <div>
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </div>
          </label>
        ))}
      </div>
    </article>
  )
}
