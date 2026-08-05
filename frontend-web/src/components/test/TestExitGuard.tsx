import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { InstitutionalModal } from '../common/InstitutionalModal'
import { APP_ROUTES } from '../../constants'
import { useTestSessionStore } from '../../stores/testSessionStore'

const INTERNAL_TEST_PATHS = new Set<string>([APP_ROUTES.testSession, APP_ROUTES.testReview])

export function TestExitGuard() {
  const navigate = useNavigate()
  const attemptId = useTestSessionStore((state) => state.attemptId)
  const questionsLength = useTestSessionStore((state) => state.questions.length)
  const clear = useTestSessionStore((state) => state.clear)
  const [exitModalOpen, setExitModalOpen] = useState(false)
  const [pendingPath, setPendingPath] = useState<string | null>(null)
  const isActive = Boolean(attemptId && questionsLength > 0)

  useEffect(() => {
    if (!isActive) {
      return undefined
    }

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      const link = target?.closest<HTMLAnchorElement>('a[href]')

      if (!link || link.target === '_blank' || link.hasAttribute('download')) {
        return
      }

      const url = new URL(link.href, window.location.href)
      if (url.origin !== window.location.origin || INTERNAL_TEST_PATHS.has(url.pathname)) {
        return
      }

      event.preventDefault()
      event.stopPropagation()
      setPendingPath(`${url.pathname}${url.search}${url.hash}`)
      setExitModalOpen(true)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('click', handleDocumentClick, true)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('click', handleDocumentClick, true)
    }
  }, [isActive])

  function confirmExit() {
    const nextPath = pendingPath ?? APP_ROUTES.testIntro
    clear()
    setExitModalOpen(false)
    navigate(nextPath, { replace: true })
  }

  return (
    <InstitutionalModal
      open={exitModalOpen}
      onClose={() => setExitModalOpen(false)}
      title="Salir de la prueba"
      theme="dark"
    >
      <p>
        Si sales ahora, deberas iniciar nuevamente la prueba. Las respuestas de este intento no se
        conservaran.
      </p>
      <div className="institutional-modal__actions">
        <button type="button" className="sesion-prueba__accion-final" onClick={confirmExit}>
          Salir de la prueba
        </button>
        <button
          type="button"
          className="sesion-prueba__accion-final sesion-prueba__accion-final--secundario"
          onClick={() => setExitModalOpen(false)}
        >
          Continuar prueba
        </button>
      </div>
    </InstitutionalModal>
  )
}
