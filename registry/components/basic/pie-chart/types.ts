export interface PieDataPoint {
  label: string
  value: number
  color?: string
  originalData?: any
}

export interface ProcessedPieDataPoint extends PieDataPoint {
  percentage: number
  startAngle: number
  endAngle: number
  index: number
}

export interface PieChartProps {
  data: any[]
  
  // 資料映射
  labelKey?: string
  valueKey?: string
  colorKey?: string
  labelAccessor?: (d: any) => string
  valueAccessor?: (d: any) => number
  colorAccessor?: (d: any) => string
  mapping?: {
    label: string | ((d: any) => string)
    value: string | ((d: any) => number)
    color?: string | ((d: any) => string)
  }
  
  // 尺寸與佈局
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  
  // 圓餅圖特定設定
  innerRadius?: number  // 0 = 圓餅圖, > 0 = 甜甜圈圖
  outerRadius?: number
  cornerRadius?: number
  padAngle?: number
  
  // 樣式
  colors?: string[]
  colorScheme?: 'category10' | 'set3' | 'pastel' | 'dark' | 'custom'
  
  // 標籤
  showLabels?: boolean
  showPercentages?: boolean
  labelThreshold?: number  // 最小顯示百分比
  labelFormat?: (d: ProcessedPieDataPoint) => string
  
  // 圖例
  showLegend?: boolean
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  legendFormat?: (d: ProcessedPieDataPoint) => string
  
  // 互動
  interactive?: boolean
  animate?: boolean
  animationDuration?: number
  
  // 甜甜圈特定選項
  showCenterText?: boolean
  centerTextFormat?: (total: number, data: ProcessedPieDataPoint[]) => { total: string; label: string }
  
  // 動畫選項
  animationType?: 'fade' | 'scale' | 'rotate' | 'sweep'
  hoverEffect?: 'lift' | 'scale' | 'glow' | 'none'
  
  // 工具提示
  showTooltip?: boolean
  tooltipFormat?: (d: ProcessedPieDataPoint) => string
  
  // 事件處理
  onSliceClick?: (d: ProcessedPieDataPoint) => void
  onSliceHover?: (d: ProcessedPieDataPoint | null) => void
  
  // HTML 屬性
  className?: string
  style?: React.CSSProperties
}

export interface LegendItem {
  label: string
  color: string
  value: number
  percentage: number
  index: number
}