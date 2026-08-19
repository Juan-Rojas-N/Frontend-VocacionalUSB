import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { UserDropdown } from '../components/common/UserDropdown'
import { APP_ROUTES, LEGAL_LINKS } from '../constants'
import { useAuthStore } from '../stores/authStore'
import { useTestSessionStore } from '../stores/testSessionStore'

export function PublicLayout() {
  const publicBasePath = import.meta.env.BASE_URL
  const sessionUser = useAuthStore((state) => state.sessionUser)
  const activeAttemptId = useTestSessionStore((state) => state.attemptId)
  const testQuestionCount = useTestSessionStore((state) => state.questions.length)
  const [menuOpen, setMenuOpen] = useState(false)
  const isTestInProgress = Boolean(activeAttemptId && testQuestionCount > 0)

  return (
    <div className="app-shell">
      <header className="public-topbar">
        <div className="public-topbar__inner">
          <Link to={APP_ROUTES.home} className="public-brand" aria-label="Ir al inicio de USB Vocacional">
            <img
              src={`${publicBasePath}brand/usb-header-logo.png`}
              alt="Universidad de San Buenaventura"
              className="public-brand__image"
            />
          </Link>
          <div className="public-topbar__actions">
            {!isTestInProgress ? (
              <Link to={APP_ROUTES.testIntro} className="help-pill">
                <img src={`${publicBasePath}brand/question-icon.svg`} alt="" aria-hidden="true" />
                <span>Guía</span>
              </Link>
            ) : null}
            {sessionUser ? (
              <div className="user-menu-wrapper">
                <button
                  type="button"
                  className="user-pill user-pill--name"
                  onClick={() => setMenuOpen((value) => !value)}
                >
                  {sessionUser.firstName}
                </button>
                <UserDropdown open={menuOpen} onClose={() => setMenuOpen(false)} />
              </div>
            ) : (
              <Link to={APP_ROUTES.login} className="user-pill">
                Usuario
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="page-shell">
        <Outlet />
      </main>
      <footer className="public-footer">
        <div className="public-footer__inner">
          <img
            src={`${publicBasePath}brand/usb-footer-brand.png`}
            alt="Universidad de San Buenaventura Bogotá"
            className="public-footer__brand"
          />
          <div className="public-footer__text">
            <p>
              Somos una institución educativa de la Comunidad Franciscana Provincia de la Santa Fe
              de educación superior
            </p>
            <p>
              <a
                className="public-footer__link"
                href={LEGAL_LINKS.legalPersonhood}
                target="_blank"
                rel="noopener noreferrer"
              >
                con personería jurídica reconocida por el Ministerio de Educación en Resolución
                1326 del 25 de marzo de 1975
              </a>
            </p>
            <p>
              Copyright © 2026 Universidad de San Buenaventura, Sede Bogotá |{' '}
              <a
                className="public-footer__link"
                href={LEGAL_LINKS.privacyPolicy}
                target="_blank"
                rel="noopener noreferrer"
              >
                Políticas de uso y privacidad
              </a>{' '}
              |{' '}
              <a
                className="public-footer__link"
                href={LEGAL_LINKS.terms}
                target="_blank"
                rel="noopener noreferrer"
              >
                Términos y Condiciones
              </a>
            </p>
            <p>
              Institución de educación superior sujeta a la inspección y vigilancia del Ministerio
              de Educación Nacional
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
