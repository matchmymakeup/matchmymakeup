import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/auth'
import Home from './pages/Home';
import MatchResults from './pages/MatchResults';
import ColorScanner from './pages/ColorScanner';
import Library from './pages/Library';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Profile from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/Home" replace />} />
          <Route path="/Home" element={<Home />} />
          <Route path="/ColorScanner" element={<ColorScanner />} />
          <Route path="/MatchResults" element={<MatchResults />} />
          <Route path="/Library" element={<Library />} />
          <Route path="/Terms" element={<Terms />} />
          <Route path="/Privacy" element={<Privacy />} />
          <Route path="/Profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/Home" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
