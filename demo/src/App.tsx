import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'

// 使用 lazy loading 優化性能
const Home = lazy(() => import('./pages/Home'))
const BarChartDemo = lazy(() => import('./pages/BarChartDemo'))
const BarChartDemoV2 = lazy(() => import('./pages/BarChartDemoV2'))
const LineChartDemo = lazy(() => import('./pages/LineChartDemo'))
const ScatterPlotDemo = lazy(() => import('./pages/ScatterPlotDemo'))
const PieChartDemo = lazy(() => import('./pages/PieChartDemo'))
const AreaChartDemo = lazy(() => import('./pages/AreaChartDemo'))
const HeatmapDemo = lazy(() => import('./pages/HeatmapDemo'))
const CorrelogramDemo = lazy(() => import('./pages/CorrelogramDemo'))
const GaugeChartDemo = lazy(() => import('./pages/GaugeChartDemo'))
const FunnelChartDemo = lazy(() => import('./pages/FunnelChartDemo'))
const BoxPlotDemo = lazy(() => import('./pages/BoxPlotDemo'))
const ViolinPlotDemo = lazy(() => import('./pages/ViolinPlotDemo'))
const RadarChartDemo = lazy(() => import('./pages/RadarChartDemo'))
const TreeMapDemo = lazy(() => import('./pages/TreeMapDemo'))
const CandlestickDemo = lazy(() => import('./pages/CandlestickDemo'))
const ModularTestDemo = lazy(() => import('./pages/ModularTestDemo'))
const Gallery = lazy(() => import('./pages/Gallery'))
const DataMapperDemo = lazy(() => import('./pages/DataMapperDemo'))
const SimpleComponentsDemo = lazy(() => import('./pages/SimpleComponentsDemo'))
const ComboChartDemo = lazy(() => import('./pages/ComboChartDemo'))
const EnhancedComboChartDemo = lazy(() => import('./pages/EnhancedComboChartDemo'))
const AreaLineComboDemo = lazy(() => import('./pages/AreaLineComboDemo'))
const MultiBarLineComboDemo = lazy(() => import('./pages/MultiBarLineComboDemo'))
const StackedAreaLineComboDemo = lazy(() => import('./pages/StackedAreaLineComboDemo'))
const ScatterRegressionComboDemo = lazy(() => import('./pages/ScatterRegressionComboDemo'))
const WaterfallLineComboDemo = lazy(() => import('./pages/WaterfallLineComboDemo'))
const AreaScatterComboDemo = lazy(() => import('./pages/AreaScatterComboDemo'))
const TripleComboDemo = lazy(() => import('./pages/TripleComboDemo'))
const DynamicComboDemo = lazy(() => import('./pages/DynamicComboDemo'))
const DataProcessorTestDemo = lazy(() => import('./pages/DataProcessorTestDemo'))

function App() {
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/bar-chart" element={<BarChartDemo />} />
          <Route path="/bar-chart-v2" element={<BarChartDemoV2 />} />
          <Route path="/line-chart" element={<LineChartDemo />} />
          <Route path="/scatter-plot" element={<ScatterPlotDemo />} />
          <Route path="/pie-chart" element={<PieChartDemo />} />
          <Route path="/area-chart" element={<AreaChartDemo />} />
          <Route path="/heatmap" element={<HeatmapDemo />} />
          <Route path="/correlogram" element={<CorrelogramDemo />} />
          <Route path="/gauge-chart" element={<GaugeChartDemo />} />
          <Route path="/funnel-chart" element={<FunnelChartDemo />} />
          <Route path="/box-plot" element={<BoxPlotDemo />} />
          <Route path="/violin-plot" element={<ViolinPlotDemo />} />
          <Route path="/radar-chart" element={<RadarChartDemo />} />
          <Route path="/tree-map" element={<TreeMapDemo />} />
          <Route path="/candlestick" element={<CandlestickDemo />} />
          <Route path="/modular-test" element={<ModularTestDemo />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/data-mapper" element={<DataMapperDemo />} />
          <Route path="/simple-components" element={<SimpleComponentsDemo />} />
          <Route path="/combo-chart" element={<ComboChartDemo />} />
          <Route path="/enhanced-combo-chart" element={<EnhancedComboChartDemo />} />
          <Route path="/area-line-combo" element={<AreaLineComboDemo />} />
          <Route path="/multi-bar-line-combo" element={<MultiBarLineComboDemo />} />
          <Route path="/stacked-area-line-combo" element={<StackedAreaLineComboDemo />} />
          <Route path="/scatter-regression-combo" element={<ScatterRegressionComboDemo />} />
          <Route path="/waterfall-line-combo" element={<WaterfallLineComboDemo />} />
          <Route path="/area-scatter-combo" element={<AreaScatterComboDemo />} />
          <Route path="/triple-combo" element={<TripleComboDemo />} />
          <Route path="/dynamic-combo" element={<DynamicComboDemo />} />
          <Route path="/data-processor-test" element={<DataProcessorTestDemo />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App