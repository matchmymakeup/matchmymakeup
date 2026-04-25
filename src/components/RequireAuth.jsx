// RequireAuth — gate that redirects unauthenticated users to /LogIn,
// preserving the originally-requested URL (path + query + hash) via
// ?redirect= so post-login can return them to where they tried to go.
//
// NEVER wrap auth-flow routes: /LogIn, /SignUp, /AuthCallback,
// /ResetPassword, /ResetPassword/Confirm. Wrapping any of those creates
// an infinite redirect loop since /LogIn is the redirect target.
//
// Pure render component — no useEffect, no side effects. Safe under
// React StrictMode dev double-invoke (no async work to race).

import { Navigate, useLocation } from 'react-router-dom'
import { useUser } from '../lib/auth'

export default function RequireAuth({ children }) {
  const { session, loading } = useUser()
  const location = useLocation()

  // return null during loading is load-bearing — prevents flashing
  // protected content to anonymous users during the ~10-50ms session-
  // restore window when useUser().loading is true.
  if (loading) return null

  if (!session) {
    const fullPath = location.pathname + location.search + location.hash
    return <Navigate to={`/LogIn?redirect=${encodeURIComponent(fullPath)}`} replace />
  }

  return children
}
