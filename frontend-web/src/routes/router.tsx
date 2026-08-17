/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense, type ReactNode } from 'react'
import { Navigate, createBrowserRouter } from 'react-router-dom'
import { PublicLayout } from '../layouts/PublicLayout'
import { APP_ROUTES } from '../constants'
import { RouteGuard } from './RouteGuard'

const LandingPage = lazy(async () => ({
  default: (await import('../pages/landing/LandingPage')).LandingPage,
}))
const LoginPage = lazy(async () => ({
  default: (await import('../pages/auth/LoginPage')).LoginPage,
}))
const RegisterPage = lazy(async () => ({
  default: (await import('../pages/auth/RegisterPage')).RegisterPage,
}))
const ForgotPasswordPage = lazy(async () => ({
  default: (await import('../pages/auth/ForgotPasswordPage')).ForgotPasswordPage,
}))
const ResetPasswordPage = lazy(async () => ({
  default: (await import('../pages/auth/ResetPasswordPage')).ResetPasswordPage,
}))
const TestIntroPage = lazy(async () => ({
  default: (await import('../pages/test/TestIntroPage')).TestIntroPage,
}))
const TestQuestionPage = lazy(async () => ({
  default: (await import('../pages/test/TestQuestionPage')).TestQuestionPage,
}))
const TestReviewPage = lazy(async () => ({
  default: (await import('../pages/test/TestReviewPage')).TestReviewPage,
}))
const ResultsPage = lazy(async () => ({
  default: (await import('../pages/results/ResultsPage')).ResultsPage,
}))
const AdminDashboardPage = lazy(async () => ({
  default: (await import('../pages/admin/AdminDashboardPage')).AdminDashboardPage,
}))
const ProfilePage = lazy(async () => ({
  default: (await import('../pages/profile/ProfilePage')).ProfilePage,
}))
const TestHistoryView = lazy(async () => ({
  default: (await import('../pages/profile/TestHistoryView')).TestHistoryView,
}))
const AdminLogsView = lazy(async () => ({
  default: (await import('../pages/admin/components/AdminLogsView')).AdminLogsView,
}))
const NotFoundPage = lazy(async () => ({
  default: (await import('../pages/NotFoundPage')).NotFoundPage,
}))

function withSuspense(component: ReactNode) {
  return (
    <Suspense fallback={<div className="loading-state">Cargando módulo...</div>}>
      {component}
    </Suspense>
  )
}

export const router = createBrowserRouter(
  [
    {
      path: APP_ROUTES.home,
      element: <PublicLayout />,
      children: [
        { index: true, element: withSuspense(<LandingPage />) },
        { path: APP_ROUTES.login, element: withSuspense(<LoginPage />) },
        { path: APP_ROUTES.register, element: withSuspense(<RegisterPage />) },
        { path: APP_ROUTES.recoverPassword, element: withSuspense(<ForgotPasswordPage />) },
        { path: APP_ROUTES.resetPassword, element: withSuspense(<ResetPasswordPage />) },
        { path: '/auth/login', element: <Navigate to={APP_ROUTES.login} replace /> },
        { path: '/auth/register', element: <Navigate to={APP_ROUTES.register} replace /> },
        {
          path: '/auth/recover-password',
          element: <Navigate to={APP_ROUTES.recoverPassword} replace />,
        },
        {
          path: '/auth/reset-password',
          element: <Navigate to={APP_ROUTES.resetPassword} replace />,
        },
        { path: '/prueba', element: <Navigate to={APP_ROUTES.testIntro} replace /> },
        {
          path: '/prueba/sesion',
          element: <Navigate to={APP_ROUTES.testSession} replace />,
        },
        {
          path: '/prueba/revision',
          element: <Navigate to={APP_ROUTES.testReview} replace />,
        },
        { path: '/results', element: <Navigate to={APP_ROUTES.results} replace /> },
        { path: '/admin', element: <Navigate to={APP_ROUTES.admin} replace /> },
        { path: '/test', element: <Navigate to={APP_ROUTES.testIntro} replace /> },
        { path: '/test/session', element: <Navigate to={APP_ROUTES.testSession} replace /> },
        {
          element: <RouteGuard allowedRoles={['student', 'administrator', 'root']} />,
          children: [
            { path: APP_ROUTES.profile, element: withSuspense(<ProfilePage />) },
            { path: APP_ROUTES.testHistory, element: withSuspense(<TestHistoryView />) },
            { path: APP_ROUTES.testIntro, element: withSuspense(<TestIntroPage />) },
            { path: APP_ROUTES.testSession, element: withSuspense(<TestQuestionPage />) },
            { path: APP_ROUTES.testReview, element: withSuspense(<TestReviewPage />) },
            { path: APP_ROUTES.results, element: withSuspense(<ResultsPage />) },
            {
              path: `${APP_ROUTES.results}/:testId`,
              element: withSuspense(<ResultsPage />),
            },
          ],
        },
        {
          element: <RouteGuard allowedRoles={['administrator', 'root']} />,
          children: [
            { path: APP_ROUTES.admin, element: withSuspense(<AdminDashboardPage />) },
            { path: APP_ROUTES.adminLogs, element: withSuspense(<AdminLogsView />) },
          ],
        },
        { path: '*', element: withSuspense(<NotFoundPage />) },
      ],
    },
  ],
  { basename: '/vocacional' },
)
