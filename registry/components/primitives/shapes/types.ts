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
  
  // 標準事件命名
  onDataClick?: (d: BarShapeData, i: number, event: React.MouseEvent) => void
  onDataHover?: (d: BarShapeData | null, i: number, event: React.MouseEvent) => void
  
  // 向下兼容的廢棄事件
  /** @deprecated 請使用 onDataClick 替代 */
  onBarClick?: (d: BarShapeData, i: number, event: React.MouseEvent) => void
  /** @deprecated 請使用 onDataHover 替代 */
  onBarMouseEnter?: (d: BarShapeData, i: number, event: React.MouseEvent) => void
  /** @deprecated 請使用 onDataHover 替代 */
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
  
  // 標準事件命名
  onDataClick?: (event: React.MouseEvent) => void
  onDataHover?: (event: React.MouseEvent | null) => void
  
  // 向下兼容的廢棄事件
  /** @deprecated 請使用 onDataClick 替代 */
  onAreaClick?: (event: React.MouseEvent) => void
}

export interface StackedAreaData {
  x: any
  [key: string]: any
}

export interface StackedAreaSeries {
  key: string
  color: string
  name?: string
  opacity?: number
  gradient?: {
    id: string
    stops: { offset: string; color: string; opacity?: number }[]
  }
}

export interface StackedAreaProps {
  data: StackedAreaData[]
  series: StackedAreaSeries[]
  xScale: any
  yScale: any
  curve?: d3.CurveFactory
  className?: string
  animate?: boolean
  animationDuration?: number
  stackOrder?: 'ascending' | 'descending' | 'insideOut' | 'none' | 'reverse'
  stackOffset?: 'none' | 'expand' | 'diverging' | 'silhouette' | 'wiggle'
  
  // 標準事件命名
  onDataClick?: (series: StackedAreaSeries, event: React.MouseEvent) => void
  onDataHover?: (series: StackedAreaSeries | null, event: React.MouseEvent) => void
  
  // 向下兼容的廢棄事件
  /** @deprecated 請使用 onDataClick 替代 */
  onAreaClick?: (series: StackedAreaSeries, event: React.MouseEvent) => void
  /** @deprecated 請使用 onDataHover 替代 */
  onAreaMouseEnter?: (series: StackedAreaSeries, event: React.MouseEvent) => void
  /** @deprecated 請使用 onDataHover 替代 */
  onAreaMouseLeave?: (series: StackedAreaSeries, event: React.MouseEvent) => void
}

export interface ScatterShapeData {
  x: any
  y: any
  size?: number
  color?: string
  group?: string
  [key: string]: any
}

export interface ScatterProps {
  data: ScatterShapeData[]
  xScale: any
  yScale: any
  radius?: number
  sizeScale?: any
  colorScale?: any
  className?: string
  animate?: boolean
  animationDuration?: number
  opacity?: number
  strokeWidth?: number
  strokeColor?: string
  onPointClick?: (dataPoint: ScatterShapeData, event: React.MouseEvent) => void
  onPointMouseEnter?: (dataPoint: ScatterShapeData, event: React.MouseEvent) => void
  onPointMouseLeave?: (dataPoint: ScatterShapeData, event: React.MouseEvent) => void
}

export interface RegressionData {
  x: number
  y: number
}

export interface RegressionLineProps {
  data: RegressionData[]
  xScale: any
  yScale: any
  className?: string
  animate?: boolean
  animationDuration?: number
  strokeColor?: string
  strokeWidth?: number
  strokeDasharray?: string
  opacity?: number
  regressionType?: 'linear' | 'polynomial' | 'exponential'
  polynomialDegree?: number
  showEquation?: boolean
  showRSquared?: boolean
  onLineClick?: (regressionData: { slope: number; intercept: number; rSquared: number }, event: React.MouseEvent) => void
}

export interface WaterfallShapeData {
  x: any
  value: number
  type?: 'positive' | 'negative' | 'total' | 'subtotal'
  label?: string
  category?: string
  [key: string]: any
}

export interface WaterfallProps {
  data: WaterfallShapeData[]
  xScale: any
  yScale: any
  className?: string
  animate?: boolean
  animationDuration?: number
  positiveColor?: string
  negativeColor?: string
  totalColor?: string
  subtotalColor?: string
  opacity?: number
  strokeWidth?: number
  strokeColor?: string
  showConnectors?: boolean
  connectorColor?: string
  connectorWidth?: number
  connectorDasharray?: string
  
  // 標準事件命名
  onDataClick?: (dataPoint: WaterfallShapeData, cumulativeValue: number, event: React.MouseEvent) => void
  onDataHover?: (dataPoint: WaterfallShapeData | null, cumulativeValue: number, event: React.MouseEvent) => void
  
  // 向下兼容的廢棄事件
  /** @deprecated 請使用 onDataClick 替代 */
  onBarClick?: (dataPoint: WaterfallShapeData, cumulativeValue: number, event: React.MouseEvent) => void
  /** @deprecated 請使用 onDataHover 替代 */
  onBarMouseEnter?: (dataPoint: WaterfallShapeData, cumulativeValue: number, event: React.MouseEvent) => void
  /** @deprecated 請使用 onDataHover 替代 */
  onBarMouseLeave?: (dataPoint: WaterfallShapeData, cumulativeValue: number, event: React.MouseEvent) => void
}