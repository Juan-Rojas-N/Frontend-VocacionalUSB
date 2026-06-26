import { Link, NavLink, Outlet } from 'react-router-dom'
import { AppLogo } from '../components/common/AppLogo'
import { APP_ROUTES } from '../constants'
import { useAuthStore } from '../stores/authStore'

export function DashboardLayout() {
  const sessionUser = useAuthStore((state) => state.sessionUser)
  const signOut = useAuthStore((state) => state.signOut)

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <AppLogo />
        <div className="dashboard-sidebar__user">
          <strong>{sessionUser?.fullName}</strong>
          <span>{sessionUser?.email}</span>
        </div>
        <nav className="dashboard-sidebar__nav">
          <NavLink to={APP_ROUTES.admin}>Dashboard</NavLink>
          <Link to={APP_ROUTES.results}>Vista de resultados</Link>
          <Link to={APP_ROUTES.home}>Landing</Link>
        </nav>
        <button type="button" className="button button--ghost" onClick={signOut}>
          Cerrar sesión
        </button>
      </aside>
      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  )
}
