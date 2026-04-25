import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUser, sanitizeError } from '../lib/auth'
import AuthCard from '../components/AuthCard'

const labelStyle = { display: 'block', fontSize: 12, color: '#888', marginBottom: 4, fontWeight: 600 }
const inputStyle = { width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid #555', background: '#3C3C3E', color: '#F5F0E8', fontSize: 14, marginBottom: 12, boxSizing: 'border-box', minHeight: 44 }
const buttonStyle = { width: '100%', padding: '14px', borderRadius: 14, border: 'none', background: '#C9A96E', color: '#1C1C1E', fontSize: 15, fontWeight: 700, cursor: 'pointer', minHeight: 44, marginTop: 8 }
const buttonDisabledStyle = { ...buttonStyle, background: '#6B5835', cursor: 'not-allowed' }
const errorStyle = { background: '#3C1F1F', color: '#F5D8D8', padding: '10px 12px', borderRadius: 10, fontSize: 13, marginTop: 12 }

export default function ResetPasswordConfirm() {
  const { session, loading: sessionLoading } = useUser()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // return null during loading is load-bearing — prevents form flash before auth hydrates
  if (sessionLoading) return null
  // No session here means user hit the URL directly without going through the recovery email flow.
  if (!session) return <Navigate to="/ResetPassword" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    setError(null)
    const { error: sbError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (sbError) {
      setError(sanitizeError(sbError))
      return
    }
    navigate('/Home', { replace: true })
  }

  return (
    <AuthCard title="Set a new password">
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>New password (min 8 characters)</label>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          style={inputStyle}
        />
        <label style={labelStyle}>Confirm new password</label>
        <input
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          style={inputStyle}
        />
        <button type="submit" disabled={loading} style={loading ? buttonDisabledStyle : buttonStyle}>
          {loading ? 'Updating…' : 'Update password'}
        </button>
        {error && <div style={errorStyle}>{error}</div>}
      </form>
    </AuthCard>
  )
}
