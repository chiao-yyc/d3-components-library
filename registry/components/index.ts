// 基礎圖表
export * from './basic/area-chart'
export * from './basic/bar-chart'
export * from './basic/line-chart'
export * from './basic/pie-chart'
export * from './basic/heatmap'
export * from './basic/gauge-chart'
export * from './basic/funnel-chart'

// 統計圖表
export * from './statistical/scatter-plot'
export * from './statistical/box-plot'
export * from './statistical/violin-plot'
export * from './statistical/tree-map'

// 金融圖表
export * from './financial/candlestick-chart'

// 組合圖表
export * from './composite'

// 核心組件
export * from './core/base-chart'
export * from './core/color-scheme'
export * from './core/data-processor'
export * from './core/ohlc-processor'

// 基礎元件
export * from './primitives'

// UI 組件
export * from './ui/chart-tooltip'

// 數據映射
export * from './data-mapper'

// Resolve duplicate exports by explicitly re-exporting preferred versions
export * from './statistical/radar-chart'

// LegendConfig and ChartDimensions duplicates
export type { LegendConfig } from './basic/pie-chart'
export type { ChartDimensions } from './core/base-chart'

// DataMapping and FieldInfo duplicates
export type { DataMapping, FieldInfo } from './core/data-processor'

// 組件分類導出
export const CHART_CATEGORIES = {
  basic: {
    name: '基礎圖表',
    description: '常用的基本圖表類型',
    components: [
      'area-chart',
      'bar-chart', 
      'line-chart',
      'pie-chart',
      'heatmap',
      'gauge-chart',
      'funnel-chart'
    ]
  },
  statistical: {
    name: '統計圖表',
    description: '數據分析和統計可視化',
    components: [
      'scatter-plot',
      'box-plot',
      'violin-plot',
      'radar-chart',
      'tree-map'
    ]
  },
  financial: {
    name: '金融圖表',
    description: '金融市場數據可視化',
    components: [
      'candlestick-chart'
    ]
  },
  composite: {
    name: '組合圖表',
    description: '多種圖表類型的組合',
    components: [
      'combo-chart',
      'enhanced-combo-chart'
    ]
  }
} as const