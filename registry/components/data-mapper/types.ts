import { SuggestedMapping, ChartSuggestion } from '../../types'

export interface DataUploadProps {
  onDataLoad: (data: any[]) => void
  onError?: (error: string) => void
  acceptedFormats?: string[]
  maxFileSize?: number
  className?: string
}

export interface DataMapperProps {
  data: any[]
  chartType?: string
  onMappingChange: (mapping: DataMapping) => void
  autoSuggest?: boolean
  className?: string
}

export interface MappingPreviewProps {
  data: any[]
  mapping: DataMapping
  chartType?: string
  width?: number
  height?: number
  className?: string
}

export interface DataMapping {
  x: string
  y: string
  color?: string
  size?: string
  [key: string]: string | undefined
}

export interface DataAnalysis {
  suggestions: {
    mapping: SuggestedMapping[]
    charts: ChartSuggestion[]
  }
  statistics: {
    rowCount: number
    columnCount: number
    missingValues: number
    dataTypes: Record<string, {
      type: string
      confidence: number
      samples: any[]
    }>
  }
}

export interface FieldInfo {
  name: string
  type: 'number' | 'string' | 'date' | 'boolean'
  subType?: string
  format?: string
  confidence: number
  samples: any[]
  nullCount: number
  uniqueCount: number
  suggested: 'x' | 'y' | 'color' | 'size'
}