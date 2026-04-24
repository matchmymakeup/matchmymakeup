import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUser } from '../lib/auth'

// Messages match substrings of Supabase v2 English error responses.
// Non-English locales or future Supabase string changes require updating these.
function sanitizeError(error) {
  const msg = error?.message || ''
  if (/User already registered/i.test(msg)) return 'This email is already registered. Try logging in instead.'
  if (/Invalid login credentials/i.test(msg)) return 'Invalid email or password.'
  if (/Email not confirmed/i.test(msg)) return 'Please check your email and confirm your account first.'
  if (/rate limit/i.test(msg)) return 'Too many attempts. Please wait a few minutes and try again.'
  console.error('[auth] unhandled supabase error:', error)
  return 'Something went wrong. Please try again.'
}

// Styles duplicated from SignUp — Step 5 will extract to a shared <AuthCard>.
const pageStyle = { minHeight: '100vh', background: '#1C1C1E', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: "'Segoe UI', sans-serif" }
const cardStyle = { background: '#2C2C2E', borderRadius: 20, padding: 24, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.4)' }
const titleStyle = { fontSize: 22, fontWeight: 800, color: '#C9A96E', marginBottom: 20, textAlign: 'center' }
const labelStyle = { display: 'block', fontSize: 12, color: '#888', marginBottom: 4, fontWeight: 600 }
const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #555', background: '#3C3C3E', color: '#F5F0E8', fontSize: 14, marginBottom: 12, boxSizing: 'border-box', minHeight: 44 }
const buttonStyle = { width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: '#C9A96E', color: '#1C1C1E', fontSize: 15, fontWeight: 700, cursor: 'pointer', minHeight: 44, marginTop: 8 }
const buttonDisabledStyle = { ...buttonStyle, background: '#6B5835', cursor: 'not-allowed' }
const errorStyle = { background: '#3C1F1F', color: '#F5D8D8', padding: '10px 12px', borderRadius: 10, fontSize: 13, marginTop: 12 }
const footerStyle = { marginTop: 18, textAlign: 'center', fontSize: 13, color: '#888' }
const linkStyle = { color: '#C9A96E', textDecoration: 'none', fontWeight: 600 }
const toggleButtonStyle = { background: 'none', border: 'none', color: '#C9A96E', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: "'Segoe UI', sans-serif" }

export default function LogIn() {
  const { session, loading: sessionLoading } = useUser()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('password')
  const [pendingMagicLink, setPendingMagicLink] = useState(false)

  // return null during loading is load-bearing — prevents form flash before auth hydrates
  if (sessionLoading) return null
  if (session) return <Navigate to="/Home" replace />

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: sbError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (sbError) {
      setError(sanitizeError(sbError))
      return
    }
    navigate('/Home')
  }

  async function handleMagicSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: sbError } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/AuthCallback` },
    })
    setLoading(false)
    if (sbError) {
      setError(sanitizeError(sbError))
      return
    }
    setPendingMagicLink(true)
  }

  function switchMode(next) {
    setMode(next)
    setError(null)
    setPassword('')
    setPendingMagicLink(false)
  }

  if (pendingMagicLink) {
    return (
      <div style={pageStyle}>
        <div style={cardStyle}>
          <div style={titleStyle}>Check your email</div>
          <div style={{ color: '#F5F0E8', fontSize: 14, lineHeight: 1.6, textAlign: 'center' }}>
            We sent a login link to <strong>{email}</strong>. Click it to sign in.
          </div>
          <div style={footerStyle}>
            <button
              onClick={() => { setPendingMagicLink(false); setMode('password'); setEmail('') }}
              style={toggleButtonStyle}
            >
              Back to log in
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        <div style={titleStyle}>Log in</div>
        <form onSubmit={mode === 'password' ? handlePasswordSubmit : handleMagicSubmit}>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={inputStyle}
            placeholder="you@example.com"
          />
          {mode === 'password' && (
            <>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={inputStyle}
              />
            </>
          )}
          <button type="submit" disabled={loading} style={loading ? buttonDisabledStyle : buttonStyle}>
            {loading
              ? (mode === 'password' ? 'Signing in…' : 'Sending link…')
              : (mode === 'password' ? 'Log in' : 'Send login link')}
          </button>
          {error && <div style={errorStyle}>{error}</div>}
        </form>
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <button
            onClick={() => switchMode(mode === 'password' ? 'magic' : 'password')}
            style={toggleButtonStyle}
          >
            {mode === 'password' ? 'Email me a login link instead' : 'Back to password log in'}
          </button>
        </div>
        <div style={footerStyle}>
          No account yet?{' '}
          <Link to="/SignUp" style={linkStyle}>Create one</Link>
        </div>
      </div>
    </div>
  )
}
