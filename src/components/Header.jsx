import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUser } from '../lib/auth'

const LABELS = {
  library: 'Library',
  profile: 'Profile',
  logIn: 'Log in',
  logOut: 'Log out',
}

function HeaderLogo({ hovered }) {
  return (
    <svg width="32" height="28" viewBox="0 0 64 56" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: hovered ? 0.85 : 1, transition: 'opacity 120ms ease' }}>
      <polyline points="4,52 18,12 32,36 46,12 60,52" stroke="#C9A96E" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="32" cy="8" r="5" fill="#B76E79" />
    </svg>
  )
}

export default function Header() {
  const { session, loading } = useUser()
  const location = useLocation()
  const [logoHovered, setLogoHovered] = useState(false)

  // No redirect on logout — Library/Profile aren't route-gated yet; signed-out
  // users render fine via storage.js localStorage fallback. Matches Home.jsx.
  async function handleLogout() {
    await supabase.auth.signOut()
  }

  function navLinkStyle(path) {
    const active = location.pathname === path
    return {
      color: active ? '#C9A96E' : 'rgba(245,240,232,0.6)',
      fontSize: 13,
      fontWeight: 600,
      textDecoration: 'none',
      padding: '8px 10px',
      fontFamily: "'Segoe UI', Helvetica, sans-serif",
      letterSpacing: 0.3,
    }
  }

  return (
    <header style={{
      background: '#1C1C1E',
      borderBottom: '1px solid #2C2C2E',
      padding: '10px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    }}>
      <Link
        to="/Home"
        onMouseEnter={() => setLogoHovered(true)}
        onMouseLeave={() => setLogoHovered(false)}
        style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', textDecoration: 'none', padding: 4 }}
        aria-label="Home"
      >
        <HeaderLogo hovered={logoHovered} />
      </Link>

      <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Link to="/Library" style={navLinkStyle('/Library')} aria-current={location.pathname === '/Library' ? 'page' : undefined}>{LABELS.library}</Link>
        <Link to="/Profile" style={navLinkStyle('/Profile')} aria-current={location.pathname === '/Profile' ? 'page' : undefined}>{LABELS.profile}</Link>
      </nav>

      <div style={{ minWidth: 60, display: 'flex', justifyContent: 'flex-end' }}>
        {loading ? null : session ? (
          <button
            onClick={handleLogout}
            style={{ background: 'none', border: 'none', color: '#C9A96E', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 8, fontFamily: "'Segoe UI', Helvetica, sans-serif" }}
          >
            {LABELS.logOut}
          </button>
        ) : (
          <Link
            to="/LogIn"
            style={{ color: '#C9A96E', fontSize: 13, fontWeight: 600, textDecoration: 'none', padding: 8, fontFamily: "'Segoe UI', Helvetica, sans-serif" }}
          >
            {LABELS.logIn}
          </Link>
        )}
      </div>
    </header>
  )
}
