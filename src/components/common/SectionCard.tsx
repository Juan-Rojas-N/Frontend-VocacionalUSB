import type { PropsWithChildren, ReactNode } from 'react'

interface SectionCardProps {
  title: string
  eyebrow?: string
  actions?: ReactNode
}

export function SectionCard({
  title,
  eyebrow,
  actions,
  children,
}: PropsWithChildren<SectionCardProps>) {
  return (
    <section className="section-card">
      <header className="section-card__header">
        <div>
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          <h2>{title}</h2>
        </div>
        {actions ? <div className="section-card__actions">{actions}</div> : null}
      </header>
      {children}
    </section>
  )
}
