import * as d3 from 'd3'

export interface BarShapeData {
  x: any
  y: any
  width?: number
  height?: number
  value?: number
  label?: string
  color?: string
  [key: string]: any
}

export interface BarProps {
  data: BarShapeData[]
  xScale: any
  yScale: any
  color?: string | ((d: BarShapeData, i: number) => string)
  opacity?: number
  orientation?: 'vertical' | 'horizontal'
  className?: string
  animate?: boolean
  animationDuration?: number
  onBarClick?: (d: BarShapeData, i: number, event: React.MouseEvent) => void
  onBarMouseEnter?: (d: BarShapeData, i: number, event: React.MouseEvent) => void
  onBarMouseLeave?: (d: BarShapeData, i: number, event: React.MouseEvent) => void
}

export interface LineShapeData {
  x: any
  y: any
  [key: string]: any
}

export interface LineProps {
  data: LineShapeData[]
  xScale: any
  yScale: any
  color?: string
  strokeWidth?: number
  opacity?: number
  curve?: d3.CurveFactory
  className?: string
  animate?: boolean
  animationDuration?: number
  showPoints?: boolean
  pointRadius?: number
  pointColor?: string
  onLineClick?: (event: React.MouseEvent) => void
  onPointClick?: (d: LineShapeData, i: number, event: React.MouseEvent) => void
  onPointMouseEnter?: (d: LineShapeData, i: number, event: React.MouseEvent) => void
  onPointMouseLeave?: (d: LineShapeData, i: number, event: React.MouseEvent) => void
}

export interface AreaShapeData {
  x: any
  y: any
  y0?: any
  [key: string]: any
}

export interface AreaProps {
  data: AreaShapeData[]
  xScale: any
  yScale: any
  color?: string
  opacity?: number
  curve?: d3.CurveFactory
  className?: string
  animate?: boolean
  animationDuration?: number
  baseline?: number | ((d: AreaShapeData) => number)
  gradient?: {
    id: string
    stops: { offset: string; color: string; opacity?: number }[]
  }
  onAreaClick?: (event: React.MouseEvent) => void
}