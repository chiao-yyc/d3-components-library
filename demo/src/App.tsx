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
const ComposablePrimitivesDemo = lazy(() => import('./pages/ComposablePrimitivesDemo'))
const AlignmentTestDemo = lazy(() => import('./pages/AlignmentTestDemo'))
const ComboChartDebugDemo = lazy(() => import('./pages/ComboChartDebugDemo'))
const LayerOrderDebugDemo = lazy(() => import('./pages/LayerOrderDebugDemo'))
const ResponsiveChartDemo = lazy(() => import('./pages/ResponsiveChartDemo'))
const ResponsiveTestDemo = lazy(() => import('./pages/ResponsiveTestDemo'))
const PerformanceTestDemo = lazy(() => import('./pages/PerformanceTestDemo'))
const VirtualScrollingDemo = lazy(() => import('./pages/VirtualScrollingDemo'))
const AdvancedComboDemo = lazy(() => import('./pages/AdvancedComboDemo'))
const SpecialAnalysisDemo = lazy(() => import('./pages/SpecialAnalysisDemo'))
const ComboDebugToolsDemo = lazy(() => import('./pages/ComboDebugToolsDemo'))
const FinancialComboDemo = lazy(() => import('./pages/FinancialComboDemo'))

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
          {/* 🎯 Phase 1: 核心組合圖表頁面 (主導航) */}
          <Route path="/combo-chart" element={<ComboChartDemo />} />
          <Route path="/enhanced-combo-chart" element={<EnhancedComboChartDemo />} />
          <Route path="/area-line-combo" element={<AreaLineComboDemo />} />
          <Route path="/scatter-regression-combo" element={<ScatterRegressionComboDemo />} />
          <Route path="/composable-primitives" element={<ComposablePrimitivesDemo />} />
          {/* 🎯 Phase 2: 專題組合頁面 (隱藏路由) */}
          <Route path="/advanced-combo" element={<AdvancedComboDemo />} />
          <Route path="/special-analysis" element={<SpecialAnalysisDemo />} />
          <Route path="/financial-combo" element={<FinancialComboDemo />} />
          <Route path="/dynamic-combo" element={<DynamicComboDemo />} />
          <Route path="/combo-debug-tools" element={<ComboDebugToolsDemo />} />
          
          {/* 兼容性路由：保留舊路徑以避免斷連 */}
          <Route path="/triple-combo" element={<AdvancedComboDemo />} />
          <Route path="/multi-bar-line-combo" element={<AdvancedComboDemo />} />
          <Route path="/stacked-area-line-combo" element={<AdvancedComboDemo />} />
          <Route path="/waterfall-line-combo" element={<SpecialAnalysisDemo />} />
          <Route path="/area-scatter-combo" element={<SpecialAnalysisDemo />} />
          <Route path="/combo-debug" element={<ComboDebugToolsDemo />} />
          <Route path="/layer-debug" element={<ComboDebugToolsDemo />} />
          <Route path="/data-processor-test" element={<DataProcessorTestDemo />} />
          <Route path="/alignment-test" element={<AlignmentTestDemo />} />
          <Route path="/responsive-chart" element={<ResponsiveChartDemo />} />
          <Route path="/responsive-test" element={<ResponsiveTestDemo />} />
          <Route path="/performance-test" element={<PerformanceTestDemo />} />
          <Route path="/virtual-scrolling" element={<VirtualScrollingDemo />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}

export default App