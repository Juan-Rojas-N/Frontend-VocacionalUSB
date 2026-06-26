import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { UserDropdown } from '../components/common/UserDropdown'
import { APP_ROUTES } from '../constants'
import { useAuthStore } from '../stores/authStore'

export function PublicLayout() {
  const sessionUser = useAuthStore((state) => state.sessionUser)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="app-shell">
      <header className="public-topbar">
        <div className="public-topbar__inner">
          <Link to={APP_ROUTES.home} className="public-brand" aria-label="Ir al inicio de USB Vocacional">
            <img
              src="/brand/usb-header-logo.png"
              alt="Universidad de San Buenaventura"
              className="public-brand__image"
            />
          </Link>
          <div className="public-topbar__actions">
            <Link to={APP_ROUTES.testIntro} className="help-pill">
              <img src="/brand/question-icon.svg" alt="" aria-hidden="true" />
              <span>¿Cómo responder?</span>
            </Link>
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
            src="/brand/usb-footer-brand.png"
            alt="Universidad de San Buenaventura Bogotá"
            className="public-footer__brand"
          />
          <div className="public-footer__text">
            <p>
              Somos una institución educativa de la Comunidad Franciscana Provincia de la Santa Fe
              de educación superior
            </p>
            <p>
              “con personería jurídica reconocida por el Ministerio de Educación en Resolución 1326
              del 25 de marzo de 1975”
            </p>
            <p>
              Copyright © 2026 Universidad de San Buenaventura, Sede Bogotá | Políticas de uso y
              privacidad | Términos y Condiciones
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
