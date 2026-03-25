import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import MatchResults from './pages/MatchResults'
import ColorScanner from './pages/ColorScanner'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/Home" replace />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/MatchResults" element={<MatchResults />} />
        <Route path="/ColorScanner" element={<ColorScanner />} />
        <Route path="*" element={<Navigate to="/Home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
