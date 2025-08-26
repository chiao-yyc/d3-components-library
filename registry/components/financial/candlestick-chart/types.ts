import { BaseChartProps } from '../../core/base-chart/types'

// 暫時簡化 OHLC 數據類型定義
export interface ProcessedOHLCData {
  date: Date
  open: number
  high: number
  low: number
  close: number
  volume?: number
  change: number
  changePercent: number
  direction: 'up' | 'down' | 'doji'
  index: number
}

export interface OHLCMapping {
  date?: string | ((d: any) => any)
  open?: string | ((d: any) => any)
  high?: string | ((d: any) => any)
  low?: string | ((d: any) => any)
  close?: string | ((d: any) => any)
  volume?: string | ((d: any) => any)
}

export interface CandlestickChartProps extends BaseChartProps {
  /** 欄位映射配置 */
  mapping?: OHLCMapping
  
  /** 響應式支援 */
  responsive?: boolean

  /** 樣式配置 */
  /** 上漲蠟燭顏色 */
  upColor?: string
  /** 下跌蠟燭顏色 */
  downColor?: string
  /** 十字星顏色 */
  dojiColor?: string
  /** 蠟燭寬度比例 (0-1) */
  candleWidth?: number
  /** 影線寬度 */
  wickWidth?: number
  
  /** 股市顯示慣例 */
  /** 顏色模式：tw = 台股（紅漲綠跌），us = 美股（綠漲紅跌） */
  colorMode?: 'tw' | 'us' | 'custom'
  
  /** 功能開關 */
  /** 是否顯示成交量 */
  showVolume?: boolean
  /** 成交量圖表高度比例 */
  volumeHeightRatio?: number
  /** 是否顯示格線 */
  showGrid?: boolean
  /** 是否顯示十字線游標 */
  showCrosshair?: boolean
  /** 十字線配置 */
  crosshairConfig?: {
    color?: string
    opacity?: number
    strokeWidth?: number
    strokeDasharray?: string
  }
  /** 是否啟用縮放 */
  enableZoom?: boolean
  /** 是否啟用平移 */
  enablePan?: boolean
  /** 縮放配置 */
  zoomConfig?: {
    scaleExtent?: [number, number]
    constrainToData?: boolean
    resetOnDoubleClick?: boolean
    enableX?: boolean
    enableY?: boolean
  }
  /** 工具提示配置 */
  tooltipConfig?: {
    formatter?: {
      date?: (date: string | Date) => string
      price?: (price: number) => string
      volume?: (volume: number) => string
      percent?: (percent: number) => string
    }
    colorMode?: 'taiwan' | 'us'
    offset?: { x: number; y: number }
    boundary?: { padding: number }
  }
  
  /** 動畫效果 */
  animate?: boolean
  animationDuration?: number
  
  /** 事件處理 */
  onDataClick?: (data: ProcessedOHLCData) => void
  onDataHover?: (data: ProcessedOHLCData | null) => void
  onDateRangeChange?: (startDate: Date, endDate: Date) => void
  
  // 向下兼容的廢棄事件 (將在未來版本中移除)
  /** @deprecated 請使用 onDataClick 替代 */
  onCandleClick?: (data: ProcessedOHLCData) => void
  /** @deprecated 請使用 onDataHover 替代 */
  onCandleHover?: (data: ProcessedOHLCData | null) => void
}

export interface CandlestickItem {
  /** 原始數據 */
  data: ProcessedOHLCData
  /** 燭台幾何位置 */
  geometry: {
    x: number
    bodyTop: number
    bodyBottom: number
    bodyHeight: number
    wickTop: number
    wickBottom: number
    width: number
  }
  /** 顏色 */
  color: string
  /** 索引 */
  index: number
}

export interface VolumeItem {
  /** 原始數據 */
  data: ProcessedOHLCData
  /** 成交量柱狀圖幾何 */
  geometry: {
    x: number
    y: number
    width: number
    height: number
  }
  /** 顏色（通常跟隨對應的蠟燭顏色） */
  color: string
  /** 索引 */
  index: number
}

export interface CandlestickChartState {
  /** 可見日期範圍 */
  dateRange: {
    start: Date
    end: Date
  }
  /** 縮放層級 */
  zoomLevel: number
  /** 平移偏移 */
  panOffset: number
  /** 當前游標位置 */
  crosshair: {
    x: number
    y: number
    visible: boolean
  } | null
  /** 當前懸停的蠟燭 */
  hoveredCandle: ProcessedOHLCData | null
}

export interface CandlestickScales {
  /** X軸時間比例尺 */
  xScale: d3.ScaleTime<number, number>
  /** Y軸價格比例尺 */
  yScale: d3.ScaleLinear<number, number>
  /** 成交量比例尺 */
  volumeScale?: d3.ScaleLinear<number, number>
}

export interface CandlestickTooltipData {
  /** OHLC 數據 */
  data: ProcessedOHLCData
  /** 格式化後的顯示文字 */
  formatted: {
    date: string
    open: string
    high: string
    low: string
    close: string
    volume?: string
    change: string
    changePercent: string
  }
}