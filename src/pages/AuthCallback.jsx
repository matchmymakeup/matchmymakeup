import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const pageStyle = { minHeight: '100vh', background: '#1C1C1E', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "'Segoe UI', sans-serif" }
const cardStyle = { background: '#2C2C2E', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }
const titleStyle = { fontSize: 18, fontWeight: 700, color: '#C9A96E', textAlign: 'center', lineHeight: 1.5 }

export default function AuthCallback() {
  const navigate = useNavigate()
  const [message, setMessage] = useState('Signing you in…')
  // Ref guards against React StrictMode double-invoke firing the single-use
  // PKCE code twice in dev. Production builds don't double-invoke.
  const exchangeStarted = useRef(false)

  useEffect(() => {
    if (exchangeStarted.current) return
    exchangeStarted.current = true

    let active = true
    let timeoutId = null

    const code = new URL(window.location.href).searchParams.get('code')
    if (!code) {
      navigate('/LogIn', { replace: true })
    } else {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (!active) return
        if (error) {
          console.error('[auth] code exchange failed:', error)
          setMessage('Login link invalid or expired. Redirecting…')
          timeoutId = setTimeout(() => {
            if (!active) return
            navigate('/LogIn', { replace: true })
          }, 1500)
        } else {
          // type=recovery is our convention set by resetPasswordForEmail's
          // redirectTo — NOT a Supabase-defined param. We append it ourselves
          // to distinguish recovery exchanges from regular sign-in/magic-link.
          const type = new URLSearchParams(window.location.search).get('type')
          if (type === 'recovery') {
            navigate('/ResetPassword/Confirm', { replace: true })
          } else {
            navigate('/Home', { replace: true })
          }
        }
      })
    }

    return () => {
      active = false
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
