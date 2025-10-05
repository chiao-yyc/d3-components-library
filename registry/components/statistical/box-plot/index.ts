import './box-plot.css'

// 主要組件 (新架構 - 推薦使用)
export { BoxPlot, BoxPlotLegacy, defaultBoxPlotProps } from './box-plot'
export type { BoxPlotProps } from './box-plot'

// 核心系統導出
export { BoxPlotCore } from './core/box-plot-core'
export type {
  BoxPlotCoreConfig,
  BoxPlotData,
  ProcessedBoxPlotDataPoint
} from './core/box-plot-core'

// Additional types from legacy system
export type {
  BoxPlotStatistics,
  BoxPlotBox
} from './types'

// 向下兼容：舊版核心（已棄用）
export { D3BoxPlot } from './core/box-plot'
export type { 
  BoxPlotProps as LegacyBoxPlotProps, 
  BoxPlotDataPoint, 
  ProcessedBoxPlotDataPoint as LegacyProcessedBoxPlotDataPoint,
  BoxPlotStatistics as LegacyBoxPlotStatistics,
  BoxPlotBox as LegacyBoxPlotBox,
  BoxPlotScales
} from './types'