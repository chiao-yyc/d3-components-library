import type { BarShapeData, LineShapeData } from '../primitives'

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