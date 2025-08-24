import { ReactNode } from 'react'
import { BaseChartProps } from '../../core/base-chart/types'

export interface BoxPlotDataPoint {
  [key: string]: any
}

export interface ProcessedBoxPlotDataPoint {
  label: string
  values: number[]
  statistics: BoxPlotStatistics
  originalData: BoxPlotDataPoint | BoxPlotDataPoint[]
  index: number
}

export interface BoxPlotStatistics {
  min: number
  q1: number
  median: number
  q3: number
  max: number
  outliers: number[]
  mean?: number
  iqr: number
  lowerFence: number
  upperFence: number
}

export interface BoxPlotBox {
  label: string
  statistics: BoxPlotStatistics
  x: number
  y: number
  width: number
  height: number
  color: string
  index: number
}

export interface BoxPlotProps extends BaseChartProps {
  // 資料相關
  data: BoxPlotDataPoint[]
  
  // 數據映射配置 (推薦)
  mapping?: {
    label: string | ((d: BoxPlotDataPoint) => string)
    values: string | ((d: BoxPlotDataPoint) => number[])
  }
  
  // 向下兼容的廢棄屬性 - Key-based 模式
  /** @deprecated 請使用 mapping.label 替代。將在 v1.0.0 版本中移除。 */
  labelKey?: string
  /** @deprecated 請使用 mapping.values 替代。將在 v1.0.0 版本中移除。 */
  valueKey?: string
  /** @deprecated 請使用 mapping.values 替代。將在 v1.0.0 版本中移除。 */
  valuesKey?: string // 用於已聚合的資料
  /** @deprecated 請使用 mapping.label 替代。將在 v1.0.0 版本中移除。 */
  categoryKey?: string // 替代 labelKey 的新字段，與其他組件保持一致
  
  // 向下兼容的廢棄屬性 - Accessor-based 模式
  /** @deprecated 請使用 mapping.label 替代。將在 v1.0.0 版本中移除。 */
  labelAccessor?: (d: BoxPlotDataPoint) => string
  /** @deprecated 請使用 mapping.values 替代。將在 v1.0.0 版本中移除。 */
  valueAccessor?: (d: BoxPlotDataPoint) => number[]
  
  // 箱形圖樣式
  orientation?: 'vertical' | 'horizontal'
  boxWidth?: number
  whiskerWidth?: number
  showOutliers?: boolean
  showMean?: boolean
  showMedian?: boolean
  outlierRadius?: number
  meanStyle?: 'circle' | 'diamond' | 'square'
  
  // 顏色
  colors?: string[]
  colorScheme?: 'custom' | 'blues' | 'greens' | 'oranges' | 'reds' | 'purples'
  boxFillOpacity?: number
  boxStroke?: string
  boxStrokeWidth?: number
  
  // 統計選項
  statisticsMethod?: 'standard' | 'tukey' | 'percentile'
  outlierThreshold?: number
  showWhiskers?: boolean
  
  // 標籤和文字
  showLabels?: boolean
  showValues?: boolean
  showStatistics?: boolean
  labelPosition?: 'inside' | 'outside'
  valueFormat?: (value: number) => string
  statisticsFormat?: (stats: BoxPlotStatistics) => string
  fontSize?: number
  fontFamily?: string
  
  // 動畫延遲
  animationDelay?: number
  animationEasing?: string
  
  // 互動 - 標準事件命名
  tooltipFormat?: (data: ProcessedBoxPlotDataPoint) => ReactNode
  onDataClick?: (data: ProcessedBoxPlotDataPoint) => void
  onDataHover?: (data: ProcessedBoxPlotDataPoint | null) => void
  
  // 向下兼容的廢棄事件 (將在未來版本中移除)
  /** @deprecated 請使用 onDataClick 替代 */
  onBoxClick?: (data: ProcessedBoxPlotDataPoint) => void
  /** @deprecated 請使用 onDataHover 替代 */
  onBoxHover?: (data: ProcessedBoxPlotDataPoint | null) => void
  
  // 新增功能 - 顯示所有數值散點
  showAllPoints?: boolean
  pointColorMode?: 'uniform' | 'by-value' | 'by-category'
  jitterWidth?: number
  pointRadius?: number
  pointOpacity?: number
  
  // HTML 屬性
  [key: string]: any
}

export interface BoxPlotScales {
  xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>
  yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>
  colorScale: d3.ScaleOrdinal<string, string> | d3.ScaleSequential<string>
}