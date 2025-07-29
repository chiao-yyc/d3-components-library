import { BaseChartProps } from '../../types'

export interface ProcessedDataPoint {
  x: number
  y: number
  size?: number
  color?: string
  originalData: any
}

export interface ScatterPlotProps extends BaseChartProps {
  // 點樣式
  radius?: number
  minRadius?: number
  maxRadius?: number
  
  // 大小映射
  sizeKey?: string
  sizeAccessor?: (d: any) => number
  sizeRange?: [number, number]
  
  // 顏色映射
  colorKey?: string
  colorAccessor?: (d: any) => string
  colorScale?: string[]
  
  // 趨勢線
  showTrendline?: boolean
  trendlineColor?: string
  trendlineWidth?: number
  
  // 分群顏色
  groupKey?: string
  
  // 點的樣式
  opacity?: number
  strokeWidth?: number
  strokeColor?: string
  
  // 工具提示
  showTooltip?: boolean
  tooltipFormat?: (d: ProcessedDataPoint) => string
  
  // 縮放和拖拽
  enableZoom?: boolean
  enableBrush?: boolean
}