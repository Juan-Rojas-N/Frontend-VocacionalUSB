import { Link } from 'react-router-dom'
import { APP_ROUTES } from '../../constants'

export function AppLogo() {
  return (
    <Link to={APP_ROUTES.home} className="app-logo" aria-label="Ir al inicio de USB Vocacional">
      <span className="app-logo__mark">USB</span>
      <span>
        <strong>Vocacional</strong>
        <small>Universidad de San Buenaventura</small>
      </span>
    </Link>
  )
}
