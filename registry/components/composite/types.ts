import type { BarShapeData, LineShapeData } from '../primitives'

// 原始 ComboChart 類型
export interface ComboChartData {
  bars: BarShapeData[]
  lines: LineShapeData[]
}

export interface ComboChartProps {
  data: ComboChartData
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  
  barColor?: string
  lineColor?: string
  
  xKey?: string
  barYKey?: string
  lineYKey?: string
  
  showDualAxis?: boolean
  barAxisLabel?: string
  lineAxisLabel?: string
  xAxisLabel?: string
  
  animate?: boolean
  className?: string
}

// 增強版 ComboChart 類型
export interface EnhancedComboData {
  [key: string]: any
}

export interface ComboChartSeries {
  type: 'bar' | 'line' | 'area'
  dataKey: string
  name: string
  yAxis: 'left' | 'right'
  color?: string
  // Bar 專用配置
  barWidth?: number
  barOpacity?: number
  // Line 專用配置
  strokeWidth?: number
  showPoints?: boolean
  pointRadius?: number
  curve?: 'linear' | 'monotone' | 'cardinal' | 'basis' | 'step'
  // Area 專用配置
  areaOpacity?: number
  baseline?: number
  gradient?: {
    id: string
    stops: { offset: string; color: string; opacity?: number }[]
  }
}

export interface EnhancedComboChartProps {
  data: EnhancedComboData[]
  series: ComboChartSeries[]
  
  // 維度和邊距
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  
  // 數據映射
  xKey: string
  
  // 軸線配置
  leftAxis?: {
    label?: string
    domain?: [number, number]
    tickCount?: number
    tickFormat?: (value: any) => string
    gridlines?: boolean
  }
  rightAxis?: {
    label?: string
    domain?: [number, number]
    tickCount?: number
    tickFormat?: (value: any) => string
    gridlines?: boolean
  }
  xAxis?: {
    label?: string
    tickFormat?: (value: any) => string
    gridlines?: boolean
  }
  
  // 視覺配置
  colors?: string[]
  animate?: boolean
  animationDuration?: number
  
  // 交互配置
  interactive?: boolean
  onSeriesClick?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void
  onSeriesHover?: (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => void
  
  className?: string
}