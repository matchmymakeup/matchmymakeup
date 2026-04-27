import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { migrateAnonymousData } from '../lib/storage'
import { safeRedirect } from '../lib/safeRedirect'

const pageStyle = { minHeight: '100vh', background: '#1C1C1E', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "'Segoe UI', sans-serif" }
const cardStyle = { background: '#2C2C2E', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }
const titleStyle = { fontSize: 18, fontWeight: 700, color: '#C9A96E', textAlign: 'center', lineHeight: 1.5 }

export default function AuthCallback() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('Signing you in…')
  // Ref guards against React StrictMode double-invoke firing the single-use
  // OTP token twice in dev. Production builds don't double-invoke.
  // The ref alone is sufficient — an `active` flag pattern was tried and
  // removed: StrictMode's between-mount cleanup set active=false before
  // the verifyOtp Promise resolved, causing the .then() to silently bail.
  // Session state propagates via onAuthStateChange in AuthProvider regardless
  // of which mount is active, so navigate() works even after StrictMode's
  // first cleanup.
  const exchangeStarted = useRef(false)

  useEffect(() => {
    if (exchangeStarted.current) return
    exchangeStarted.current = true

    let timeoutId = null

    const params = new URLSearchParams(window.location.search)
    const tokenHash = params.get('token_hash')
    const type = params.get('type')

    if (!tokenHash || !type) {
      navigate('/LogIn', { replace: true })
    } else {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type }).then(async ({ error }) => {
        if (error) {
          console.error('[auth] verifyOtp failed:', error)
          setMessage('Login link invalid or expired. Redirecting…')
          timeoutId = setTimeout(() => {
            navigate('/LogIn', { replace: true })
          }, 1500)
        } else if (type === 'recovery') {
          // Password reset flow — skip migration, go straight to reset form.
          navigate('/ResetPassword/Confirm', { replace: true })
        } else {
          // Signin / magiclink / signup: await migration before navigating so
          // the destination (Library by default) mounts with merged data, not
          // mid-flight. migrateAnonymousData is idempotent — duplicate fire
          // from auth.jsx's SIGNED_IN hook is a no-op once localStorage is
          // cleared. Failure stashes to sessionStorage for Library to render.
          try {
            await migrateAnonymousData()
          } catch (err) {
            console.warn('[auth] Migration during callback failed:', err)
            sessionStorage.setItem('mmm_migration_error', err?.message || 'Unknown error')
          }
          const target = safeRedirect(params.get('redirect'), '/Library')
          navigate(target, { replace: true })
        }
      })
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
    }
  }, [navigate])

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={titleStyle}>{message}</div>
      </div>
    </div>
  )
}
