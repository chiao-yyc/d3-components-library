import { ReactNode } from 'react'

export interface TooltipPosition {
  x: number
  y: number
}

export interface TooltipData {
  data: any
  index?: number
  series?: string
  color?: string
  [key: string]: any
}

export interface TooltipContent {
  title?: string
  items: Array<{
    label: string
    value: any
    color?: string
    format?: (value: any) => string
  }>
  footer?: string
}

export type TooltipFormatter = (data: TooltipData) => TooltipContent | ReactNode

export interface ChartTooltipProps {
  // 顯示狀態
  visible: boolean
  
  // 位置
  position: TooltipPosition
  
  // 內容
  content?: TooltipContent | ReactNode
  data?: TooltipData
  formatter?: TooltipFormatter
  
  // 樣式配置
  className?: string
  style?: React.CSSProperties
  
  // 主題
  theme?: 'light' | 'dark' | 'auto'
  
  // 位置調整
  offset?: { x: number; y: number }
  placement?: 'auto' | 'top' | 'bottom' | 'left' | 'right'
  
  // 容器配置
  container?: HTMLElement | null
  boundary?: HTMLElement | null
  
  // 動畫
  animate?: boolean
  animationDuration?: number
  
  // 互動
  interactive?: boolean
  hideDelay?: number
  showDelay?: number
  
  // 箭頭
  showArrow?: boolean
  arrowSize?: number
  
  // 其他
  maxWidth?: number
  multiline?: boolean
  html?: boolean
}

export interface TooltipHook {
  tooltip: {
    visible: boolean
    position: TooltipPosition
    data: TooltipData | null
  }
  showTooltip: (position: TooltipPosition, data: TooltipData) => void
  hideTooltip: () => void
  updateTooltip: (position: TooltipPosition, data?: TooltipData) => void
}

export interface TooltipManager {
  show: (position: TooltipPosition, data: TooltipData) => void
  hide: () => void
  update: (position: TooltipPosition, data?: TooltipData) => void
  isVisible: () => boolean
  getPosition: () => TooltipPosition | null
  getData: () => TooltipData | null
}