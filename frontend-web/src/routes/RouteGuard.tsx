import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { APP_ROUTES } from '../constants'
import { useAuthStore } from '../stores/authStore'
import type { UserRole } from '../types'

interface RouteGuardProps {
  allowedRoles?: UserRole[]
}

export function RouteGuard({ allowedRoles }: RouteGuardProps) {
  const location = useLocation()
  const sessionUser = useAuthStore((state) => state.sessionUser)

  if (!sessionUser) {
    return <Navigate to={APP_ROUTES.login} replace state={{ from: location.pathname }} />
  }

  if (allowedRoles && !allowedRoles.includes(sessionUser.role)) {
    return <Navigate to={APP_ROUTES.home} replace />
  }

  return <Outlet />
}
