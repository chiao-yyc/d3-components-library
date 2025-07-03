import { HTMLAttributes } from 'react'

export interface Margin {
  top: number
  right: number
  bottom: number
  left: number
}

export interface DataMapping {
  x: string | ((d: any) => any)
  y: string | ((d: any) => any)
  color?: string | ((d: any) => any)
}

export interface ProcessedDataPoint {
  x: any
  y: number
  originalData: any
  index: number
}

export interface BarChartProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onError'> {
  // 資料相關
  data: any[]
  
  // 資料映射 (多種方式)
  xKey?: string
  yKey?: string
  xAccessor?: (d: any) => any
  yAccessor?: (d: any) => any
  mapping?: DataMapping
  
  // 圖表尺寸
  width?: number
  height?: number
  margin?: Margin
  
  // 外觀配置
  orientation?: 'vertical' | 'horizontal'
  colors?: string[]
  className?: string
  
  // 行為配置
  animate?: boolean
  interactive?: boolean
  
  // 事件處理
  onDataClick?: (data: any) => void
  onHover?: (data: any) => void
}

export interface BarChartConfig {
  // 預設配置
  defaultWidth: number
  defaultHeight: number
  defaultMargin: Margin
  defaultColors: string[]
  
  // 動畫配置
  animationDuration: number
  animationEasing: string
  
  // 樣式配置
  barPadding: number
  hoverOpacity: number
}

// 資料驗證相關
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface SuggestedMapping {
  field: string
  type: 'string' | 'number' | 'date' | 'boolean'
  confidence: number
  suggested: 'x' | 'y' | 'color'
}