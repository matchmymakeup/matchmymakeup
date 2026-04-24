import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

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
      (_event, newSession) => {
        if (!active) return
        setSession(newSession)
        setLoading(false)
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
