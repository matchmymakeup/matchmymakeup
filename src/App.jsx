import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home';
import MatchResults from './pages/MatchResults';
import ColorScanner from './pages/ColorScanner';
import Library from './pages/Library';
import Terms from './pages/Terms';
import Profile from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/ColorScanner" element={<ColorScanner />} />
        <Route path="/MatchResults" element={<MatchResults />} />
        <Route path="/Library" element={<Library />} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="/Profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/Home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
