import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MatchResults from './pages/MatchResults'
import ColorScanner from './pages/ColorScanner'

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ColorScanner" element={<ColorScanner />} />
        <Route path="/MatchResults" element={<MatchResults />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  )
}

export default App
