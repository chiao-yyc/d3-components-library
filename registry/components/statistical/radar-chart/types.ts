import { ReactNode } from 'react'

export interface RadarChartDataPoint {
  [key: string]: any
}

export interface ProcessedRadarDataPoint {
  label: string
  values: RadarValue[]
  color: string
  originalData: RadarChartDataPoint
  index: number
}

export interface RadarValue {
  axis: string
  value: number
  normalizedValue: number
  originalValue: number
}

export interface RadarAxis {
  name: string
  min: number
  max: number
  scale: d3.ScaleLinear<number, number>
  angle: number
  x: number
  y: number
}

export interface RadarSeries {
  label: string
  values: RadarValue[]
  color: string
  path: string
  points: Array<{ x: number; y: number; value: RadarValue }>
  area?: string
  index: number
}

export interface RadarChartProps {
  // 資料相關
  data: RadarChartDataPoint[]
  axes: string[] // 軸的名稱列表
  labelKey?: string
  labelAccessor?: (d: RadarChartDataPoint) => string
  valueAccessor?: (d: RadarChartDataPoint, axis: string) => number
  mapping?: {
    label: string | ((d: RadarChartDataPoint) => string)
    values: { [axis: string]: string | ((d: RadarChartDataPoint) => number) }
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
  radius?: number
  
  // 雷達圖樣式
  levels?: number // 同心圓層級數
  startAngle?: number // 起始角度（度）
  clockwise?: boolean // 順時針方向
  showGrid?: boolean
  showGridLabels?: boolean
  showAxes?: boolean
  showAxisLabels?: boolean
  showDots?: boolean
  showArea?: boolean
  
  // 數值範圍
  minValue?: number
  maxValue?: number
  autoScale?: boolean
  scaleType?: 'linear' | 'log'
  
  // 網格樣式
  gridLevels?: number
  gridStroke?: string
  gridStrokeWidth?: number
  gridOpacity?: number
  axisStroke?: string
  axisStrokeWidth?: number
  
  // 數據樣式
  colors?: string[]
  colorScheme?: 'custom' | 'blues' | 'greens' | 'oranges' | 'reds' | 'purples'
  strokeWidth?: number
  areaOpacity?: number
  dotRadius?: number
  dotStroke?: string
  dotStrokeWidth?: number
  
  // 標籤
  showLabels?: boolean
  showValues?: boolean
  axisLabelOffset?: number
  gridLabelOffset?: number
  valueFormat?: (value: number) => string
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
  tooltipFormat?: (data: RadarValue, series: ProcessedRadarDataPoint) => ReactNode
  onSeriesClick?: (data: ProcessedRadarDataPoint) => void
  onSeriesHover?: (data: ProcessedRadarDataPoint | null) => void
  onDotClick?: (value: RadarValue, series: ProcessedRadarDataPoint) => void
  onDotHover?: (value: RadarValue, series: ProcessedRadarDataPoint) => void
  
  // 圖例
  showLegend?: boolean
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  
  // 樣式
  className?: string
  style?: React.CSSProperties
  
  // HTML 屬性
  [key: string]: any
}

export interface RadarChartScales {
  radiusScale: d3.ScaleLinear<number, number>
  colorScale: d3.ScaleOrdinal<string, string> | d3.ScaleSequential<string>
}