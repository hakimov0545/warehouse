import { useAuthStore } from '@entities/auth/model/auth'

// <Can permission="PRODUCT_CREATE">…</Can>
// <Can permissions={['PRODUCT_CREATE','PRODUCT_UPDATE']}>…</Can>  // any-of
// Renders children only when the active user has the permission.
export default function Can({ permission, permissions, children, fallback = null }) {
  const can = useAuthStore((s) => s.can)
  const canAny = useAuthStore((s) => s.canAny)

  let allowed = true
  if (permission) allowed = can(permission)
  else if (permissions && permissions.length) allowed = canAny(permissions)

  return allowed ? children : fallback
}

export function useCan() {
  const can = useAuthStore((s) => s.can)
  const canAny = useAuthStore((s) => s.canAny)
  return { can, canAny }
}
