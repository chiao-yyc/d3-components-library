import './radar-chart.css'

// 主要組件 (新架構 - 推薦使用)
export { RadarChart, RadarChartLegacy, defaultRadarChartProps } from './radar-chart'
export type { RadarChartProps } from './radar-chart'

// 核心系統導出
export { RadarChartCore } from './core/radar-chart-core'
export type {
  RadarChartCoreConfig,
  RadarChartData,
  ProcessedRadarDataPoint,
  RadarValue,
  RadarAxis,
  RadarSeries,
  GridConfig,
  AxisConfig,
  DotConfig,
  AreaConfig
} from './core/radar-chart-core'

// 向下兼容：舊版核心（已棄用）
export { D3RadarChart } from './core/radar-chart'
export type { 
  RadarChartProps as LegacyRadarChartProps, 
  RadarChartDataPoint, 
  ProcessedRadarDataPoint as LegacyProcessedRadarDataPoint,
  RadarValue as LegacyRadarValue,
  RadarAxis as LegacyRadarAxis,
  RadarSeries as LegacySeries,
  RadarChartScales
} from './types'