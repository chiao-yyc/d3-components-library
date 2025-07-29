import { ReactNode } from 'react'

export interface FunnelChartDataPoint {
  [key: string]: any
}

export interface ProcessedFunnelDataPoint {
  label: string
  value: number
  percentage: number
  conversionRate?: number
  color?: string
  originalData: FunnelChartDataPoint
  index: number
}

export interface FunnelSegment {
  label: string
  value: number
  percentage: number
  conversionRate: number
  color: string
  x: number
  y: number
  width: number
  height: number
  path: string
  index: number
}

export interface FunnelChartProps {
  // 資料相關
  data: FunnelChartDataPoint[]
  labelKey?: string
  valueKey?: string
  labelAccessor?: (d: FunnelChartDataPoint) => string
  valueAccessor?: (d: FunnelChartDataPoint) => number
  mapping?: {
    label: string | ((d: FunnelChartDataPoint) => string)
    value: string | ((d: FunnelChartDataPoint) => number)
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
  
  // 漏斗樣式
  direction?: 'top' | 'bottom' | 'left' | 'right'
  shape?: 'trapezoid' | 'rectangle' | 'curved'
  gap?: number
  cornerRadius?: number
  proportionalMode?: 'traditional' | 'height' | 'area' | 'consistent'
  
  // 一致收縮模式相關配置
  shrinkageType?: 'fixed' | 'percentage' | 'data-driven'
  shrinkageAmount?: number
  minWidth?: number
  
  // 顏色
  colors?: string[]
  colorScheme?: 'custom' | 'blues' | 'greens' | 'oranges' | 'reds' | 'purples'
  
  // 標籤和文字
  showLabels?: boolean
  showValues?: boolean
  showPercentages?: boolean
  showConversionRates?: boolean
  labelPosition?: 'inside' | 'outside' | 'side'
  valueFormat?: (value: number) => string
  percentageFormat?: (percentage: number) => string
  conversionRateFormat?: (rate: number) => string
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
  tooltipFormat?: (data: ProcessedFunnelDataPoint) => ReactNode
  onSegmentClick?: (data: ProcessedFunnelDataPoint) => void
  onSegmentHover?: (data: ProcessedFunnelDataPoint | null) => void
  
  // 樣式
  className?: string
  style?: React.CSSProperties
  
  // HTML 屬性
  [key: string]: any
}

export interface FunnelScales {
  xScale: d3.ScaleLinear<number, number>
  yScale: d3.ScaleLinear<number, number>
  colorScale: d3.ScaleOrdinal<string, string> | d3.ScaleSequential<string>
}