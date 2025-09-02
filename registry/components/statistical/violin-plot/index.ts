import './violin-plot.css'

// 主要組件 (新架構 - 推薦使用)
export { ViolinPlot, ViolinPlotLegacy, defaultViolinPlotProps } from './violin-plot'
export type { ViolinPlotProps } from './violin-plot'

// 核心系統導出
export { ViolinPlotCore } from './core/violin-plot-core'
export type {
  ViolinPlotCoreConfig,
  ViolinPlotData,
  ProcessedViolinDataPoint,
  DensityPoint
} from './core/violin-plot-core'

// 向下兼容：舊版類型（已棄用）
export type { 
  ViolinPlotProps as LegacyViolinPlotProps, 
  ViolinPlotDataPoint, 
  ProcessedViolinDataPoint as LegacyProcessedViolinDataPoint,
  ViolinStatistics as LegacyViolinStatistics,
  ViolinShape,
  DensityPoint as LegacyDensityPoint,
  ViolinPlotScales
} from './types'