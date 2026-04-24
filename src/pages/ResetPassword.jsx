import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUser, sanitizeError } from '../lib/auth'
import AuthCard from '../components/AuthCard'

const labelStyle = { display: 'block', fontSize: 12, color: '#888', marginBottom: 4, fontWeight: 600 }
const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #555', background: '#3C3C3E', color: '#F5F0E8', fontSize: 14, marginBottom: 12, boxSizing: 'border-box', minHeight: 44 }
const buttonStyle = { width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: '#C9A96E', color: '#1C1C1E', fontSize: 15, fontWeight: 700, cursor: 'pointer', minHeight: 44, marginTop: 8 }
const buttonDisabledStyle = { ...buttonStyle, background: '#6B5835', cursor: 'not-allowed' }
const errorStyle = { background: '#3C1F1F', color: '#F5D8D8', padding: '10px 12px', borderRadius: 10, fontSize: 13, marginTop: 12 }
const linkStyle = { color: '#C9A96E', textDecoration: 'none', fontWeight: 600 }

export default function ResetPassword() {
  const { session, loading: sessionLoading } = useUser()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sent, setSent] = useState(false)

  // return null during loading is load-bearing — prevents form flash before auth hydrates
  if (sessionLoading) return null
  if (session) return <Navigate to="/Home" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error: sbError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/AuthCallback?type=recovery`,
    })
    setLoading(false)
    if (sbError) {
      setError(sanitizeError(sbError))
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        footer={<Link to="/LogIn" style={linkStyle}>Back to log in</Link>}
      >
        <div style={{ color: '#F5F0E8', fontSize: 14, lineHeight: 1.6, textAlign: 'center' }}>
          We sent a password reset link to <strong>{email}</strong>. Click it to set a new password.
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Reset password"
      footer={<Link to="/LogIn" style={linkStyle}>Back to log in</Link>}
    >
      <form onSubmit={handleSubmit}>
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
        <button type="submit" disabled={loading} style={loading ? buttonDisabledStyle : buttonStyle}>
          {loading ? 'Sending…' : 'Send reset link'}
        </button>
        {error && <div style={errorStyle}>{error}</div>}
      </form>
    </AuthCard>
  )
}
