import { Link } from 'react-router-dom'
import { APP_ROUTES } from '../constants'

export function NotFoundPage() {
  return (
    <div className="empty-state">
      <p className="eyebrow">404</p>
      <h1>Página no encontrada</h1>
      <p>La ruta solicitada no existe en este frontend.</p>
      <Link to={APP_ROUTES.home} className="button button--primary">
        Volver al inicio
      </Link>
    </div>
  )
}
