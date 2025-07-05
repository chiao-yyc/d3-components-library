import { ReactNode } from 'react'

export interface BoxPlotDataPoint {
  [key: string]: any
}

export interface ProcessedBoxPlotDataPoint {
  label: string
  values: number[]
  statistics: BoxPlotStatistics
  originalData: BoxPlotDataPoint
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

export interface BoxPlotProps {
  // 資料相關
  data: BoxPlotDataPoint[]
  labelKey?: string
  valueKey?: string
  valuesKey?: string // 用於已聚合的資料
  labelAccessor?: (d: BoxPlotDataPoint) => string
  valueAccessor?: (d: BoxPlotDataPoint) => number[]
  mapping?: {
    label: string | ((d: BoxPlotDataPoint) => string)
    values: string | ((d: BoxPlotDataPoint) => number[])
  }

  // 尺寸和佈局
  width?: number
  height?: number
  margin?: {
    top: number
    right: number
    bottom: number
    left: number
  }
  
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
  showQuartiles?: boolean
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
  
  // 動畫
  animate?: boolean
  animationDuration?: number
  animationDelay?: number
  animationEasing?: string
  
  // 互動
  interactive?: boolean
  showTooltip?: boolean
  tooltipFormat?: (data: ProcessedBoxPlotDataPoint) => ReactNode
  onBoxClick?: (data: ProcessedBoxPlotDataPoint) => void
  onBoxHover?: (data: ProcessedBoxPlotDataPoint | null) => void
  
  // 樣式
  className?: string
  style?: React.CSSProperties
  
  // HTML 屬性
  [key: string]: any
}

export interface BoxPlotScales {
  xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>
  yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>
  colorScale: d3.ScaleOrdinal<string, string> | d3.ScaleSequential<string>
}