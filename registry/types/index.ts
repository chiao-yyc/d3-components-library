export interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface BaseChartProps {
  data: any[]
  width?: number
  height?: number
  margin?: Margin
  className?: string
  
  // 資料映射 (多種方式)
  xKey?: string
  yKey?: string
  xAccessor?: (d: any) => any
  yAccessor?: (d: any) => any
  mapping?: DataMapping
  dataAdapter?: DataAdapter
  
  // 樣式和行為
  colors?: string[]
  animate?: boolean
  interactive?: boolean
  
  // 事件處理
  onDataClick?: (data: any) => void
  onHover?: (data: any) => void
}

export interface DataMapping {
  x: string | ((d: any) => any)
  y: string | ((d: any) => any)
  color?: string | ((d: any) => any)
  size?: string | ((d: any) => any)
}

export interface DataAdapter<T = any> {
  transform(data: T[], config: MappingConfig): ChartDataPoint[]
  validate(data: T[]): ValidationResult
  suggest(data: T[]): SuggestedMapping[]
}

export interface MappingConfig {
  x: string | ((d: any) => any)
  y: string | ((d: any) => any)
  [key: string]: any
}

export interface ChartDataPoint {
  x: any
  y: any
  [key: string]: any
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface SuggestedMapping {
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