export interface OHLCData {
  /** 時間戳或日期 */
  date: Date | string | number
  /** 開盤價 */
  open: number
  /** 最高價 */
  high: number
  /** 最低價 */
  low: number
  /** 收盤價 */
  close: number
  /** 成交量（可選） */
  volume?: number
  /** 原始資料 */
  originalData?: any
}

export interface ProcessedOHLCData extends OHLCData {
  /** 標準化後的日期 */
  date: Date
  /** 漲跌方向 */
  direction: 'up' | 'down' | 'doji'
  /** 漲跌幅 */
  change: number
  /** 漲跌幅百分比 */
  changePercent: number
  /** 實體高度（收盤價 - 開盤價） */
  bodyHeight: number
  /** 上影線長度（最高價 - max(開盤價, 收盤價)） */
  upperShadow: number
  /** 下影線長度（min(開盤價, 收盤價) - 最低價） */
  lowerShadow: number
  /** 是否為十字星（實體很小） */
  isDoji: boolean
  /** 資料索引 */
  index: number
}

export interface OHLCMapping {
  /** 日期欄位映射 */
  date: string | ((d: any) => Date | string | number)
  /** 開盤價欄位映射 */
  open: string | ((d: any) => number)
  /** 最高價欄位映射 */
  high: string | ((d: any) => number)
  /** 最低價欄位映射 */
  low: string | ((d: any) => number)
  /** 收盤價欄位映射 */
  close: string | ((d: any) => number)
  /** 成交量欄位映射（可選） */
  volume?: string | ((d: any) => number)
}

export interface OHLCProcessorConfig {
  /** 欄位映射配置 */
  mapping?: OHLCMapping
  /** 自動偵測欄位 */
  autoDetect?: boolean
  /** 移除無效資料 */
  removeInvalid?: boolean
  /** 十字星判定閾值（實體高度相對於價格範圍的比例） */
  dojiThreshold?: number
  /** 日期解析格式 */
  dateFormat?: string
  /** 是否排序資料（按日期） */
  sortByDate?: boolean
  /** 排序方向 */
  sortOrder?: 'asc' | 'desc'
}

export interface OHLCProcessorResult {
  /** 處理後的資料 */
  data: ProcessedOHLCData[]
  /** 統計資訊 */
  statistics: {
    count: number
    dateRange: {
      start: Date
      end: Date
    }
    priceRange: {
      min: number
      max: number
    }
    totalVolume?: number
    averageVolume?: number
  }
  /** 錯誤訊息 */
  errors: string[]
  /** 警告訊息 */
  warnings: string[]
  /** 實際使用的映射 */
  resolvedMapping: OHLCMapping
}

export interface UseOHLCProcessorOptions extends OHLCProcessorConfig {
  /** 外部資料 */
  data: any[]
}