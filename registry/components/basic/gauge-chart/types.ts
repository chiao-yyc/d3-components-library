import { ReactNode } from 'react'
import { BaseChartProps } from '../../core/base-chart/types'

export interface GaugeChartDataPoint {
  [key: string]: any
}

export interface ProcessedGaugeDataPoint {
  value: number
  label?: string
  originalData: GaugeChartDataPoint
}

export interface GaugeZone {
  min: number
  max: number
  color: string
  label?: string
}

export interface GaugeChartProps extends Omit<BaseChartProps, 'data'> {
  // 資料相關
  data?: GaugeChartDataPoint[]
  value?: number
  min?: number
  max?: number
  valueKey?: string
  labelKey?: string
  valueAccessor?: (d: GaugeChartDataPoint) => number
  labelAccessor?: (d: GaugeChartDataPoint) => string
  mapping?: {
    value: string | ((d: GaugeChartDataPoint) => number)
    label?: string | ((d: GaugeChartDataPoint) => string)
  }

  // 響應式屬性繼承自 BaseChartProps：
  // responsive?: boolean
  // aspect?: number  
  // minWidth?: number
  // maxWidth?: number
  // minHeight?: number
  // maxHeight?: number
  
  // 儀表盤外觀
  innerRadius?: number
  outerRadius?: number
  startAngle?: number // 起始角度 (度)
  endAngle?: number   // 結束角度 (度)
  cornerRadius?: number
  
  // 顏色和樣式
  backgroundColor?: string
  foregroundColor?: string
  colors?: string[]
  zones?: GaugeZone[]
  needleColor?: string
  needleWidth?: number
  centerCircleRadius?: number
  centerCircleColor?: string
  
  // 標籤和文字
  showValue?: boolean
  showLabel?: boolean
  showTicks?: boolean
  showMinMax?: boolean
  tickCount?: number
  valueFormat?: (value: number) => string
  labelFormat?: (label: string) => string
  tickFormat?: (value: number) => string
  fontSize?: number
  fontFamily?: string
  
  // 動畫
  animate?: boolean
  animationDuration?: number
  animationEasing?: string
  
  // 互動 - 標準事件命名
  interactive?: boolean
  showTooltip?: boolean
  tooltipFormat?: (value: number, label?: string) => ReactNode
  onDataClick?: (value: number, label?: string) => void
  onDataHover?: (value: number | null, label?: string) => void
  
  // 向下兼容的廢棄事件
  /** @deprecated 請使用 onDataClick 替代 */
  onValueChange?: (value: number) => void
  
  // 樣式
  className?: string
  style?: React.CSSProperties
  
  // HTML 屬性
  [key: string]: any
}

export interface GaugeScales {
  angleScale: d3.ScaleLinear<number, number>
  colorScale?: d3.ScaleLinear<number, string> | d3.ScaleOrdinal<string, string>
}

export interface TickData {
  value: number
  angle: number
  label: string
}