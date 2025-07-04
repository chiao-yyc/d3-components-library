import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import BarChartDemo from './pages/BarChartDemo'
import Gallery from './pages/Gallery'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bar-chart" element={<BarChartDemo />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </Layout>
  )
}

export default App