// 重構後的組合圖表組件 (推薦使用)
export { EnhancedComboChartV2 } from './enhanced-combo-chart-v2'
export type { EnhancedComboChartV2Props } from './enhanced-combo-chart-v2'

// 模組化組件 - 可單獨使用
export { ChartSeriesProcessor } from './chart-series-processor'
export type { ComboChartSeries, EnhancedComboData, DomainResult } from './chart-series-processor'

export { ChartScaleFactory } from './chart-scale-factory'

export { ChartAxisRenderer } from './chart-axis-renderer'
export type { AxisConfig, ChartAxisRendererProps } from './chart-axis-renderer'

export { ChartSeriesRenderer } from './chart-series-renderer'
export type { ChartSeriesRendererProps } from './chart-series-renderer'

// 向後兼容：保留舊版本的組合圖表
export { ComboChart } from './combo-chart'
export { EnhancedComboChart } from './enhanced-combo-chart'
export type { 
  ComboChartData, 
  ComboChartProps,
  EnhancedComboChartProps
} from './types'