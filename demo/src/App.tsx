import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import BarChartDemo from './pages/BarChartDemo'
import LineChartDemo from './pages/LineChartDemo'
import ScatterPlotDemo from './pages/ScatterPlotDemo'
import PieChartDemo from './pages/PieChartDemo'
import AreaChartDemo from './pages/AreaChartDemo'
import HeatmapDemo from './pages/HeatmapDemo'
import Gallery from './pages/Gallery'
import DataMapperDemo from './pages/DataMapperDemo'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/bar-chart" element={<BarChartDemo />} />
        <Route path="/line-chart" element={<LineChartDemo />} />
        <Route path="/scatter-plot" element={<ScatterPlotDemo />} />
        <Route path="/pie-chart" element={<PieChartDemo />} />
        <Route path="/area-chart" element={<AreaChartDemo />} />
        <Route path="/heatmap" element={<HeatmapDemo />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/data-mapper" element={<DataMapperDemo />} />
      </Routes>
    </Layout>
  )
}

export default App