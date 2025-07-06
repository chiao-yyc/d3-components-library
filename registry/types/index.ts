export interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface BaseChartProps {
  data: unknown[]
  width?: number
  height?: number
  margin?: Margin
  className?: string
  
  // 資料映射方式 (支援兩種格式以保持向後相容性)
  mapping?: DataMapping
  dataAdapter?: DataAdapter
  
  // 向後相容的簡單映射方式
  xKey?: string
  yKey?: string
  colorKey?: string
  sizeKey?: string
  seriesKey?: string
  
  // 樣式和行為
  colors?: string[]
  animate?: boolean
  interactive?: boolean
  
  // 事件處理
  onDataClick?: (data: unknown) => void
  onHover?: (data: unknown) => void
}

export interface DataMapping {
  x: string | ((d: unknown) => unknown)
  y: string | ((d: unknown) => unknown)
  color?: string | ((d: unknown) => unknown)
  size?: string | ((d: unknown) => unknown)
  [key: string]: string | ((d: unknown) => unknown) | undefined
}

export interface DataAdapter<T = unknown> {
  transform(data: T[], config: DataMapping): ChartDataPoint[]
  validate(data: T[]): ValidationResult
  suggest(data: T[]): SuggestedMapping[]
}

export interface ChartDataPoint {
  x: unknown
  y: unknown
  originalData?: unknown
  index?: number
  [key: string]: unknown
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  confidence: number
}

export interface SuggestedMapping {
  type: 'auto' | 'manual'
  mapping: DataMapping
  chartType: string
  confidence: number
  reasoning: string
}

// 欄位建議型別 (用於內部資料偵測)
export interface FieldSuggestion {
  field: string
  type: DataType
  confidence: number
  suggested: 'x' | 'y' | 'color' | 'size'
}

export type DataType = 'number' | 'string' | 'date' | 'boolean'

export interface ChartSuggestion {
  type: string
  confidence: number
  reason: string
  suggestedProps: Record<string, any>
}

export interface ChartLayer {
  id: string
  type: 'bar' | 'line' | 'area' | 'scatter'
  data: any[]
  mapping: DataMapping
  yAxis?: 'left' | 'right'
  zIndex?: number
  opacity?: number
  color?: string
  visible?: boolean
}

export interface CompositeChartProps {
  layers: ChartLayer[]
  width?: number
  height?: number
  margin?: Margin
  sharedXAxis?: boolean
  dualYAxis?: boolean
  syncZoom?: boolean
  syncBrush?: boolean
}