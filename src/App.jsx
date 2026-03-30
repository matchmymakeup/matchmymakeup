import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import MatchResults from './pages/MatchResults'
import ColorScanner from './pages/ColorScanner'
import Terms from './Terms'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ColorScanner" element={<ColorScanner />} />
        <Route path="/MatchResults" element={<MatchResults />} />
        <Route path="/Terms" element={<Terms />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
