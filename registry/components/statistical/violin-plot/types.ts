import { ReactNode } from 'react'

export interface ViolinPlotDataPoint {
  [key: string]: any
}

export interface ProcessedViolinDataPoint {
  label: string
  values: number[]
  statistics: ViolinStatistics
  densityData: DensityPoint[]
  originalData: ViolinPlotDataPoint
  index: number
}

export interface ViolinStatistics {
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
  std?: number
  count: number
}

export interface DensityPoint {
  value: number
  density: number
}

export interface ViolinShape {
  label: string
  statistics: ViolinStatistics
  densityData: DensityPoint[]
  x: number
  y: number
  width: number
  height: number
  color: string
  violinPath: string
  index: number
}

export interface ViolinPlotProps {
  // 資料相關
  data: ViolinPlotDataPoint[]
  labelKey?: string
  valueKey?: string
  valuesKey?: string // 用於已聚合的資料
  labelAccessor?: (d: ViolinPlotDataPoint) => string
  valueAccessor?: (d: ViolinPlotDataPoint) => number[]
  mapping?: {
    label: string | ((d: ViolinPlotDataPoint) => string)
    values: string | ((d: ViolinPlotDataPoint) => number[])
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
  
  // 小提琴圖樣式
  orientation?: 'vertical' | 'horizontal'
  violinWidth?: number
  bandwidth?: number // KDE 帶寬
  resolution?: number // 密度計算解析度
  showBoxPlot?: boolean
  boxPlotWidth?: number
  showMedian?: boolean
  showMean?: boolean
  showQuartiles?: boolean
  showOutliers?: boolean
  
  // KDE 設定
  kdeMethod?: 'gaussian' | 'epanechnikov' | 'triangular'
  smoothing?: number
  clipMin?: number
  clipMax?: number
  
  // 顏色和樣式
  colors?: string[]
  colorScheme?: 'custom' | 'blues' | 'greens' | 'oranges' | 'reds' | 'purples'
  violinFillOpacity?: number
  violinStroke?: string
  violinStrokeWidth?: number
  boxPlotStroke?: string
  boxPlotStrokeWidth?: number
  medianStroke?: string
  medianStrokeWidth?: number
  
  // 標籤和文字
  showLabels?: boolean
  showValues?: boolean
  showStatistics?: boolean
  labelPosition?: 'inside' | 'outside'
  valueFormat?: (value: number) => string
  statisticsFormat?: (stats: ViolinStatistics) => string
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
  tooltipFormat?: (data: ProcessedViolinDataPoint) => ReactNode
  onViolinClick?: (data: ProcessedViolinDataPoint) => void
  onViolinHover?: (data: ProcessedViolinDataPoint | null) => void
  
  // 樣式
  className?: string
  style?: React.CSSProperties
  
  // HTML 屬性
  [key: string]: any
}

export interface ViolinPlotScales {
  xScale: d3.ScaleBand<string> | d3.ScaleLinear<number, number>
  yScale: d3.ScaleLinear<number, number> | d3.ScaleBand<string>
  colorScale: d3.ScaleOrdinal<string, string> | d3.ScaleSequential<string>
  densityScale: d3.ScaleLinear<number, number>
}