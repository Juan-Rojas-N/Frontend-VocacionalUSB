import type { PropsWithChildren } from 'react'

interface InstitutionalModalProps {
  open: boolean
  title?: string
  theme?: 'orange' | 'dark'
  onClose?: () => void
}

export function InstitutionalModal({
  open,
  title,
  theme = 'orange',
  onClose,
  children,
}: PropsWithChildren<InstitutionalModalProps>) {
  if (!open) {
    return null
  }

  return (
    <div className="institutional-modal__backdrop" role="presentation" onClick={onClose}>
      <div
        className="institutional-modal"
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Aviso'}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={`institutional-modal__header institutional-modal__header--${theme}`}>
          <div className="institutional-modal__icon">!</div>
        </div>
        <div className="institutional-modal__body">
          {title ? <h3>{title}</h3> : null}
          {children}
        </div>
      </div>
    </div>
  )
}
