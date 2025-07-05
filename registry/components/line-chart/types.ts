import { BaseChartProps } from '../../types'

export interface ProcessedDataPoint {
  x: any
  y: number
  originalData: any
}

export interface LineChartProps extends BaseChartProps {
  // 線條樣式
  strokeWidth?: number
  curve?: 'linear' | 'monotone' | 'cardinal' | 'basis' | 'step'
  
  // 點樣式
  showDots?: boolean
  dotRadius?: number
  
  // 區域填充
  showArea?: boolean
  areaOpacity?: number
  
  // 多條線 (多系列資料)
  seriesKey?: string
  
  // 圖例
  showLegend?: boolean
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  
  // 網格線
  showGrid?: boolean
  gridOpacity?: number
  
  // 工具提示
  showTooltip?: boolean
  tooltipFormat?: (d: ProcessedDataPoint) => string
}

export interface LineSeriesConfig {
  key: string
  name: string
  color: string
  strokeWidth?: number
  curve?: LineChartProps['curve']
}