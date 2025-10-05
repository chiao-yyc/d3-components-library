// ==========================================
// 🚀 最新推薦：Primitives 架構組件
// ==========================================
export {
  MultiSeriesComboChartV2,
  MultiSeriesComboChart,
  BarLineComboChart,
  AreaLineComboChart,
  BarLineComboChart as BarLineComboChartV2,
  AreaLineComboChart as AreaLineComboChartV2,
  defaultMultiSeriesComboChartV2Props
} from './multi-series-combo-chart-v2'
export type {
  MultiSeriesComboChartV2Props,
  ComboSeries
  // AxisConfig is exported from chart-axis-renderer to avoid duplication
} from './multi-series-combo-chart-v2'

// ==========================================
// ✅ 已完成：V3 架構組件和核心實現完全移除
// ==========================================
// ComboChartV3, EnhancedComboChartV3, ComboChartCore, EnhancedComboCore 已完全清理
// 
// 統一使用 MultiSeriesComboChartV2 (Primitives 架構)

// 重構後的組合圖表組件 (V2 版本)
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

// ==========================================
// 🗑️  向下兼容：舊版組件
// ==========================================
// @deprecated 請使用 MultiSeriesComboChartV2 替代
export { EnhancedComboChart } from './enhanced-combo-chart'
export type { EnhancedComboChartProps } from './enhanced-combo-chart'
export type {
  ComboChartData,
  ComboChartProps
  // ComboChartSeries and EnhancedComboData are already exported from chart-series-processor
} from './types'

// ==========================================
// 🔧 遷移指南
// ==========================================
// 舊版本 → 新版本遷移：
// 
// ComboChart/EnhancedComboChart → MultiSeriesComboChartV2
// ComboChartCore → 使用 MultiSeriesComboChartV2 的內建邏輯
// BarLineComboChart/AreaLineComboChart → 同名 V2 版本
//
// 優勢：
// ✅ 統一的 primitives 架構
// ✅ 更好的軸線對齊
// ✅ 更簡潔的代碼結構
// ✅ 完整的 TypeScript 支持
// ✅ 向下兼容的 API
// ==========================================