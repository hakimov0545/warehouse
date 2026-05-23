import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@entities/auth/model/auth'
import { ROUTE_PERMISSIONS } from '@shared/utils/permissions'

// Guards a route based on meta-style flags translated from the old vue-router config.
// requiresAuth          — token must exist, otherwise → /login
// requiresCompany       — companyId must exist, otherwise → /add-company
// allowWithoutCompany   — authenticated routes that should still render even without a companyId
// guest                 — only unauthenticated visitors; logged-in (with company) users → /dashboard
// routeName             — looked up against ROUTE_PERMISSIONS to gate by permission
export default function ProtectedRoute({
  children,
  requiresAuth = false,
  requiresCompany = false,
  allowWithoutCompany = false,
  guest = false,
  routeName
}) {
  const token = useAuthStore((s) => s.token)
  const companyId = useAuthStore((s) => s.companyId)
  const can = useAuthStore((s) => s.can)
  const location = useLocation()

  const isAuthenticated = !!token
  const hasCompany = !!companyId

  if (guest) {
    if (isAuthenticated && hasCompany) {
      return <Navigate to="/dashboard" replace />
    }
    return children
  }

  if (requiresAuth && !isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (isAuthenticated && !hasCompany && !allowWithoutCompany) {
    return <Navigate to="/add-company" replace />
  }

  if (requiresCompany && !hasCompany) {
    return <Navigate to="/add-company" replace />
  }

  if (routeName === 'AddCompany' && hasCompany) {
    return <Navigate to="/dashboard" replace />
  }

  const required = routeName ? ROUTE_PERMISSIONS[routeName] : null
  if (required && isAuthenticated && hasCompany && !can(required)) {
    return <Navigate to="/access-denied" replace />
  }

  return children
}
