import { ReactNode } from 'react'

export interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface BaseChartDataPoint {
  [key: string]: any
}

export interface BaseChartMapping {
  x: string | ((d: any) => any)
  y: string | ((d: any) => any)
  category?: string | ((d: any) => any)
}

export interface BaseChartProps {
  data: BaseChartDataPoint[]
  width?: number
  height?: number
  margin?: Margin
  className?: string
  style?: React.CSSProperties
  animate?: boolean
  animationDuration?: number
  interactive?: boolean
  showTooltip?: boolean
  onError?: (error: Error) => void
}

export interface ChartDimensions {
  width: number
  height: number
  margin: Margin
  chartWidth: number
  chartHeight: number
}

export interface TooltipState {
  x: number
  y: number
  content: ReactNode
  visible: boolean
}

export interface ChartState {
  tooltip: TooltipState | null
  isLoading: boolean
  error: Error | null
}

export interface ChartVariant {
  name: string
  description: string
  defaultProps: Partial<BaseChartProps>
  complexity: 'basic' | 'intermediate' | 'advanced'
}

export interface ChartConfig {
  name: string
  description: string
  category: string
  variants: { [key: string]: ChartVariant }
  defaultProps: Partial<BaseChartProps>
  requiredProps: string[]
}

export type DataType = 'number' | 'string' | 'date' | 'boolean'

export interface DataTypeMap {
  [key: string]: DataType
}

export interface SuggestedMapping {
  xKey?: string
  yKey?: string
  categoryKey?: string
  confidence: number
}

export interface ChartScale {
  domain: [any, any]
  range: [number, number]
  type: 'linear' | 'ordinal' | 'time' | 'log'
}

export interface ChartScales {
  x: ChartScale
  y: ChartScale
  color?: ChartScale
}