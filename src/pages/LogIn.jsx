import { useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUser, sanitizeError } from '../lib/auth'
import AuthCard from '../components/AuthCard'

// Open-redirect guard for the ?redirect= param. Only allow same-origin
// in-app paths; reject null/undefined/external URLs and protocol-relative
// (//evil.com) attempts.
function safeRedirect(target) {
  if (!target || !target.startsWith('/') || target.startsWith('//')) return '/Home'
  return target
}

const labelStyle = { display: 'block', fontSize: 12, color: '#888', marginBottom: 4, fontWeight: 600 }
const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #555', background: '#3C3C3E', color: '#F5F0E8', fontSize: 14, marginBottom: 12, boxSizing: 'border-box', minHeight: 44 }
const buttonStyle = { width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: '#C9A96E', color: '#1C1C1E', fontSize: 15, fontWeight: 700, cursor: 'pointer', minHeight: 44, marginTop: 8 }
const buttonDisabledStyle = { ...buttonStyle, background: '#6B5835', cursor: 'not-allowed' }
const errorStyle = { background: '#3C1F1F', color: '#F5D8D8', padding: '10px 12px', borderRadius: 10, fontSize: 13, marginTop: 12 }
const linkStyle = { color: '#C9A96E', textDecoration: 'none', fontWeight: 600 }
const toggleButtonStyle = { background: 'none', border: 'none', color: '#C9A96E', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, fontFamily: "'Segoe UI', sans-serif" }
const forgotLinkStyle = { color: '#C9A96E', fontSize: 12, textDecoration: 'none', fontWeight: 600 }

export default function LogIn() {
  const { session, loading: sessionLoading } = useUser()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTarget = safeRedirect(searchParams.get('redirect'))
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
    navigate(redirectTarget)
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
      <AuthCard
        title="Check your email"
        footer={
          <button
            onClick={() => { setPendingMagicLink(false); setMode('password'); setEmail('') }}
            style={toggleButtonStyle}
          >
            Back to log in
          </button>
        }
      >
        <div style={{ color: '#F5F0E8', fontSize: 14, lineHeight: 1.6, textAlign: 'center' }}>
          We sent a login link to <strong>{email}</strong>. Click it to sign in.
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Log in"
      footer={<>No account yet? <Link to="/SignUp" style={linkStyle}>Create one</Link></>}
    >
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
            <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 12 }}>
              <Link to="/ResetPassword" style={forgotLinkStyle}>
                Forgot password?
              </Link>
            </div>
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
    </AuthCard>
  )
}
