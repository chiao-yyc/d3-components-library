export interface HeatmapDataPoint {
  x: string | number
  y: string | number
  value: number
  originalData?: any
}

export interface ProcessedHeatmapDataPoint extends HeatmapDataPoint {
  xIndex: number
  yIndex: number
  normalizedValue: number
}

export interface HeatmapProps {
  data: any[]
  
  // 資料映射
  xKey?: string
  yKey?: string
  valueKey?: string
  xAccessor?: (d: any) => string | number
  yAccessor?: (d: any) => string | number
  valueAccessor?: (d: any) => number
  mapping?: {
    x: string | ((d: any) => string | number)
    y: string | ((d: any) => string | number)
    value: string | ((d: any) => number)
  }
  
  // 尺寸與佈局
  width?: number
  height?: number
  margin?: { top: number; right: number; bottom: number; left: number }
  
  // 熱力圖特定設定
  cellPadding?: number
  cellRadius?: number
  
  // 顏色映射
  colorScheme?: 'blues' | 'greens' | 'reds' | 'oranges' | 'purples' | 'greys' | 'custom'
  colors?: string[]
  domain?: [number, number]  // 值域範圍
  
  // 軸
  showXAxis?: boolean
  showYAxis?: boolean
  xAxisFormat?: (d: any) => string
  yAxisFormat?: (d: any) => string
  xAxisRotation?: number
  yAxisRotation?: number
  
  // 圖例
  showLegend?: boolean
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  legendTitle?: string
  legendFormat?: (d: number) => string
  
  // 標籤
  showValues?: boolean
  valueFormat?: (d: number) => string
  textColor?: string | ((value: number, normalizedValue: number) => string)
  
  // 互動
  interactive?: boolean
  animate?: boolean
  animationDuration?: number
  
  // 工具提示
  showTooltip?: boolean
  tooltipFormat?: (d: ProcessedHeatmapDataPoint) => string
  
  // 事件處理
  onCellClick?: (d: ProcessedHeatmapDataPoint) => void
  onCellHover?: (d: ProcessedHeatmapDataPoint | null) => void
  
  // HTML 屬性
  className?: string
  style?: React.CSSProperties
}

export interface LegendTick {
  value: number
  position: number
  label: string
}