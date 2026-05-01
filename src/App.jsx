import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { AuthProvider } from './lib/auth'
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import MatchResults from './pages/MatchResults';
import ColorScanner from './pages/ColorScanner';
import Library from './pages/Library';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';
import MyDNA from './pages/MyDNA';
import SignUp from './pages/SignUp';
import LogIn from './pages/LogIn';
import AuthCallback from './pages/AuthCallback';
import ResetPassword from './pages/ResetPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />

          {/* No shared Header — funnel surfaces + auth flow */}
          {/* /Home is sunset in v2.1 — redirected to / (Landing) for the
              4 internal references (safeRedirect.js, ResetPasswordConfirm,
              SignUp, AuthCallback) without touching those callers. */}
          <Route path="/Home" element={<Navigate to="/" replace />} />
          <Route path="/ColorScanner" element={<ColorScanner />} />
          <Route path="/SignUp" element={<SignUp />} />
          <Route path="/LogIn" element={<LogIn />} />
          <Route path="/AuthCallback" element={<AuthCallback />} />
          <Route path="/ResetPassword" element={<ResetPassword />} />
          <Route path="/ResetPassword/Confirm" element={<ResetPasswordConfirm />} />

          {/* Shared Header — children of AppLayout */}
          <Route element={<AppLayout />}>
            <Route path="/MatchResults" element={<MatchResults />} />
            <Route path="/Library" element={<Library />} />
            <Route path="/MyDNA" element={<MyDNA />} />
            <Route path="/Profile" element={<Profile />} />
            <Route path="/Terms" element={<Terms />} />
            <Route path="/Privacy" element={<Privacy />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Analytics />
        <SpeedInsights />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
