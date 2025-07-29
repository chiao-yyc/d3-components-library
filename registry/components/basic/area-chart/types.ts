export interface AreaDataPoint {
  x: Date | number | string
  y: number
  category?: string
  originalData?: any
}

export interface ProcessedAreaDataPoint extends AreaDataPoint {
  index: number
}

export interface AreaSeriesData {
  key: string
  values: ProcessedAreaDataPoint[]
  color?: string
}

export interface AreaChartProps {
  data: any[]
  
  // 變體控制
  variant?: 'default' | 'simple' | 'stacked' | 'percent'
  
  // 資料映射
  xKey?: string
  yKey?: string
  categoryKey?: string  // 用於多系列
  xAccessor?: (d: any) => Date | number | string
  yAccessor?: (d: any) => number
  categoryAccessor?: (d: any) => string
  mapping?: {
    x: string | ((d: any) => Date | number | string)
    y: string | ((d: any) => number)
    category?: string | ((d: any) => string)
  }
  
  // Simple 變體專用屬性
  series?: string  // 簡化版的系列欄位
  
  // 尺寸與佈局
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  
  // 區域圖特定設定
  curve?: 'linear' | 'monotone' | 'cardinal' | 'basis' | 'step'
  stackMode?: 'none' | 'stack' | 'percent'  // 堆疊模式
  fillOpacity?: number
  strokeWidth?: number
  
  // 樣式
  colors?: string[]
  colorScheme?: 'category10' | 'set3' | 'pastel' | 'dark' | 'custom'
  gradient?: boolean  // 漸變填充
  
  // 軸
  showXAxis?: boolean
  showYAxis?: boolean
  xAxisFormat?: (d: any) => string
  yAxisFormat?: (d: number) => string
  showGrid?: boolean
  
  // 標記點
  showDots?: boolean
  dotRadius?: number
  
  // 圖例
  showLegend?: boolean
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  
  // 互動
  interactive?: boolean
  animate?: boolean
  animationDuration?: number
  
  // 工具提示
  showTooltip?: boolean
  tooltipFormat?: (d: ProcessedAreaDataPoint, series?: string) => string
  
  // 事件處理
  onDataClick?: (d: ProcessedAreaDataPoint, series?: string) => void
  onDataHover?: (d: ProcessedAreaDataPoint | null, series?: string) => void
  
  // HTML 屬性
  className?: string
  style?: React.CSSProperties
}

// Simple 變體專用類型
export interface SimpleAreaChartData {
  x: string | number | Date
  y: number
  series?: string
}

export interface SimpleAreaChartProps {
  data: SimpleAreaChartData[]
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  colors?: string[]
  stackMode?: 'none' | 'stack' | 'percent'
  curve?: 'linear' | 'monotone' | 'step'
  showLine?: boolean
  lineWidth?: number
  areaOpacity?: number
  showGrid?: boolean
  className?: string
  onAreaClick?: (data: SimpleAreaChartData) => void
}