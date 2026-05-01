import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUser } from '../lib/auth'

// Library / Log in / Log out remain hardcoded English — pre-existing tech
// debt to be retrofitted in Phase 4+ alongside the broader Header / Profile
// / Library / Home i18n sweep. Only the new v2.1 vocabulary string ("My
// DNA") is translated here per Path A.
const LABELS = {
  library: 'Library',
  logIn: 'Log in',
  logOut: 'Log out',
}

// AI-generated; native QA pass scheduled for Phase 4+ pre-launch on
// US/IN/BR/CN/ID/NG per the i18n strategy memory.
// FLAGS: 'ar' uses DNA-loanword form 'DNA الخاص بي' (consistent with
// brand vocabulary across locales, avoids the clinical scientific
// register of 'حمضي النووي'); native QA pass should verify register
// matches beauty-app tone. 'af' uses English-borrowed "DNA";
// technical Afrikaans uses "DNS" — verify on QA pass which reads
// more natural for the beauty-app context. 'ng' Pidgin literal
// 'My DNA' is correct but underwhelming — Phase 4+ refinement
// candidate (e.g. "My DNA self").
const T_MYDNA = {
  en:      'My DNA',
  'en-za': 'My DNA',
  es:      'Mi ADN',
  pt:      'Meu DNA',
  fr:      'Mon ADN',
  zh:      '我的DNA',
  ar:      'DNA الخاص بي',
  hi:      'मेरा डीएनए',
  bn:      'আমার ডিএনএ',
  id:      'DNA Saya',
  sw:      'DNA Yangu',
  tl:      'DNA Ko',
  af:      'My DNA',
  zu:      'I-DNA Yami',
  ng:      'My DNA',
}

function resolveLang() {
  try {
    return sessionStorage.getItem('mmm_language') || sessionStorage.getItem('mmm_lang') || 'en';
  } catch {
    return 'en';
  }
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
        <Link to="/MyDNA" style={navLinkStyle('/MyDNA')} aria-current={location.pathname === '/MyDNA' ? 'page' : undefined}>{T_MYDNA[resolveLang()] || T_MYDNA.en}</Link>
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
