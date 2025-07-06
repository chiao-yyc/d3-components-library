export interface DataMapping {
  x?: string | ((d: any) => any)
  y?: string | ((d: any) => any)
  color?: string | ((d: any) => any)
  size?: string | ((d: any) => any)
  category?: string | ((d: any) => any)
  value?: string | ((d: any) => any)
  [key: string]: string | ((d: any) => any) | undefined
}

export interface DataAccessors {
  xAccessor?: (d: any) => any
  yAccessor?: (d: any) => any
  colorAccessor?: (d: any) => any
  sizeAccessor?: (d: any) => any
  categoryAccessor?: (d: any) => any
  valueAccessor?: (d: any) => any
  [key: string]: ((d: any) => any) | undefined
}

export interface DataKeys {
  xKey?: string
  yKey?: string
  colorKey?: string
  sizeKey?: string
  categoryKey?: string
  valueKey?: string
  [key: string]: string | undefined
}

export interface ProcessedDataPoint {
  x: any
  y: any
  color?: any
  size?: any
  category?: any
  value?: any
  originalData: any
  index: number
  [key: string]: any
}

export interface DataProcessorConfig {
  // 資料映射策略 (優先級: mapping > accessors > keys > auto)
  mapping?: DataMapping
  accessors?: DataAccessors
  keys?: DataKeys
  
  // 自動偵測設定
  autoDetect?: boolean
  autoDetectThreshold?: number
  
  // 資料清理設定
  removeNulls?: boolean
  removeInvalid?: boolean
  validateTypes?: boolean
  
  // 轉換設定
  parseNumbers?: boolean
  parseDates?: boolean
  trimStrings?: boolean
  
  // 過濾設定
  filter?: (d: any, index: number) => boolean
  
  // 排序設定
  sort?: {
    field: string
    direction: 'asc' | 'desc'
  }
  
  // 限制設定
  limit?: number
  offset?: number
}

export interface DataProcessorResult {
  data: ProcessedDataPoint[]
  mapping: Required<DataMapping>
  errors: string[]
  warnings: string[]
  statistics: {
    total: number
    valid: number
    invalid: number
    nulls: number
    fields: Record<string, {
      type: 'number' | 'string' | 'date' | 'boolean'
      uniqueCount: number
      nullCount: number
      samples: any[]
    }>
  }
}

export interface FieldInfo {
  name: string
  type: 'number' | 'string' | 'date' | 'boolean'
  confidence: number
  samples: any[]
  uniqueCount: number
  nullCount: number
}