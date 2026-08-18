import { useEffect, useId, useRef, type PropsWithChildren } from 'react'

interface InstitutionalModalProps {
  open: boolean
  title?: string
  theme?: 'orange' | 'dark'
  onClose?: () => void
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function InstitutionalModal({
  open,
  title,
  theme = 'orange',
  onClose,
  children,
}: PropsWithChildren<InstitutionalModalProps>) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)
  const titleId = useId()

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  useEffect(() => {
    if (!open) {
      return
    }

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const dialog = dialogRef.current
    const focusableElements = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
    ;(focusableElements?.[0] ?? dialog)?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && onCloseRef.current) {
        event.preventDefault()
        onCloseRef.current()
        return
      }

      if (event.key !== 'Tab' || !dialog) {
        return
      }

      const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (focusable.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [open])

  if (!open) {
    return null
  }

  return (
    <div
      className="institutional-modal__backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.()
        }
      }}
    >
      <div
        ref={dialogRef}
        className="institutional-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : 'Aviso'}
        tabIndex={-1}
      >
        <div className={`institutional-modal__header institutional-modal__header--${theme}`}>
          <div className="institutional-modal__icon" aria-hidden="true">
            !
          </div>
          {onClose ? (
            <button
              type="button"
              className="institutional-modal__close"
              onClick={onClose}
              aria-label="Cerrar aviso"
            >
              ×
            </button>
          ) : null}
        </div>
        <div className="institutional-modal__body">
          {title ? <h3 id={titleId}>{title}</h3> : null}
          {children}
        </div>
      </div>
    </div>
  )
}
