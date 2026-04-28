import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import { migrateAnonymousData } from './storage'

const AuthContext = createContext({ user: null, session: null, loading: true })

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    supabase.auth.getSession()
      .then(({ data }) => {
        if (!active) return
        setSession(data.session)
        setLoading(false)
      })
      .catch(() => {
        // Network/transport failure — flip loading so UI doesn't hang
        // indefinitely. Session stays null; consumer treats as signed-out.
        if (!active) return
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!active) return
        setSession(newSession)
        setLoading(false)

        // Migrate anon localStorage data on sign-in (fire-and-forget)
        if (event === 'SIGNED_IN' && newSession) {
          migrateAnonymousData().catch(err => {
            console.warn('[auth] Migration failed:', err)
          })
        }
      }
    )

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const value = { user: session?.user ?? null, session, loading }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useUser() {
  return useContext(AuthContext)
}

// Messages match substrings of Supabase v2 English error responses.
// Non-English locales or future Supabase string changes require updating these.
export function sanitizeError(error) {
  const msg = error?.message || ''
  if (/User already registered/i.test(msg)) return 'This email is already registered. Try logging in instead.'
  if (/Invalid login credentials/i.test(msg)) return 'Invalid email or password.'
  if (/Email not confirmed/i.test(msg)) return 'Please check your email and confirm your account first.'
  if (/rate limit/i.test(msg)) return 'Too many attempts. Please wait a few minutes and try again.'
  console.error('[auth] unhandled supabase error:', error)
  return 'Something went wrong. Please try again.'
}
