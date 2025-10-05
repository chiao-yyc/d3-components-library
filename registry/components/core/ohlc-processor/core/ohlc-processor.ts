import {
  OHLCData,
  ProcessedOHLCData,
  OHLCMapping,
  OHLCProcessorConfig,
  OHLCProcessorResult
} from './types'

export class OHLCProcessor {
  private config: Required<OHLCProcessorConfig>

  constructor(config: OHLCProcessorConfig = {}) {
    this.config = {
      mapping: config.mapping || {} as OHLCMapping,
      autoDetect: config.autoDetect ?? true,
      removeInvalid: config.removeInvalid ?? true,
      dojiThreshold: config.dojiThreshold ?? 0.01, // 1%
      dateFormat: config.dateFormat ?? 'auto',
      sortByDate: config.sortByDate ?? true,
      sortOrder: config.sortOrder ?? 'asc'
    }
  }

  process(data: any[]): OHLCProcessorResult {
    const errors: string[] = []
    const warnings: string[] = []

    if (!Array.isArray(data)) {
      errors.push('數據必須是陣列格式')
      return this.createEmptyResult(errors, warnings)
    }

    if (data.length === 0) {
      warnings.push('數據陣列為空')
      return this.createEmptyResult(errors, warnings)
    }

    // 自動偵測欄位映射
    const resolvedMapping = this.resolveMapping(data[0])
    
    // 驗證映射
    const mappingErrors = this.validateMapping(resolvedMapping)
    if (mappingErrors.length > 0) {
      errors.push(...mappingErrors)
      return this.createEmptyResult(errors, warnings)
    }

    // 處理每筆資料
    const processedData: ProcessedOHLCData[] = []
    
    data.forEach((item, index) => {
      try {
        const ohlcData = this.extractOHLCData(item, resolvedMapping, index)
        
        if (ohlcData) {
          const processedItem = this.processOHLCItem(ohlcData, index)
          processedData.push(processedItem)
        } else if (!this.config.removeInvalid) {
          warnings.push(`第 ${index + 1} 筆資料無效，已跳過`)
        }
      } catch (error) {
        const message = `第 ${index + 1} 筆資料處理失敗: ${error instanceof Error ? error.message : String(error)}`
        if (this.config.removeInvalid) {
          warnings.push(message)
        } else {
          errors.push(message)
        }
      }
    })

    if (processedData.length === 0) {
      errors.push('沒有有效的 OHLC 資料')
      return this.createEmptyResult(errors, warnings)
    }

    // 排序資料
    if (this.config.sortByDate) {
      processedData.sort((a, b) => {
        const comparison = a.date.getTime() - b.date.getTime()
        return this.config.sortOrder === 'desc' ? -comparison : comparison
      })
      
      // 重新設定索引
      processedData.forEach((item, index) => {
        item.index = index
      })
    }

    // 計算統計資訊
    const statistics = this.calculateStatistics(processedData)

    return {
      data: processedData,
      statistics,
      errors,
      warnings,
      resolvedMapping
    }
  }

  private resolveMapping(sample: any): OHLCMapping {
    const mapping = { ...this.config.mapping }

    if (this.config.autoDetect) {
      const keys = Object.keys(sample)
      
      // 自動偵測常見的 OHLC 欄位名稱
      if (!mapping.date) {
        const dateField = keys.find(key => 
          /^(date|time|timestamp|datetime|日期|時間)$/i.test(key) ||
          (sample[key] && (sample[key] instanceof Date || this.isDateString(sample[key])))
        )
        if (dateField) {
          mapping.date = dateField
        }
      }

      if (!mapping.open) {
        const openField = keys.find(key => 
          /^(open|opening|開盤|開盤價)$/i.test(key)
        )
        if (openField) mapping.open = openField
      }

      if (!mapping.high) {
        const highField = keys.find(key => 
          /^(high|highest|最高|最高價)$/i.test(key)
        )
        if (highField) mapping.high = highField
      }

      if (!mapping.low) {
        const lowField = keys.find(key => 
          /^(low|lowest|最低|最低價)$/i.test(key)
        )
        if (lowField) mapping.low = lowField
      }

      if (!mapping.close) {
        const closeField = keys.find(key => 
          /^(close|closing|收盤|收盤價)$/i.test(key)
        )
        if (closeField) mapping.close = closeField
      }

      if (!mapping.volume) {
        const volumeField = keys.find(key => 
          /^(volume|vol|成交量|交易量)$/i.test(key)
        )
        if (volumeField) mapping.volume = volumeField
      }

      // 如果還沒找到，嘗試按位置推測
      if (!mapping.date && keys.length > 0) {
        mapping.date = keys[0] // 通常第一個欄位是日期
      }
      
      const numericKeys = keys.filter(key => typeof sample[key] === 'number')
      if (numericKeys.length >= 4) {
        if (!mapping.open) mapping.open = numericKeys[0]
        if (!mapping.high) mapping.high = numericKeys[1]
        if (!mapping.low) mapping.low = numericKeys[2]
        if (!mapping.close) mapping.close = numericKeys[3]
        if (!mapping.volume && numericKeys.length > 4) mapping.volume = numericKeys[4]
      }
    }

    return mapping as OHLCMapping
  }

  private validateMapping(mapping: OHLCMapping): string[] {
    const errors: string[] = []

    if (!mapping.date) errors.push('缺少日期欄位映射')
    if (!mapping.open) errors.push('缺少開盤價欄位映射')
    if (!mapping.high) errors.push('缺少最高價欄位映射')
    if (!mapping.low) errors.push('缺少最低價欄位映射')
    if (!mapping.close) errors.push('缺少收盤價欄位映射')

    return errors
  }

  private extractOHLCData(item: any, mapping: OHLCMapping, _index: number): OHLCData | null {
    try {
      const getValue = (field: string | ((d: any) => any)): any => {
        return typeof field === 'function' ? field(item) : item[field]
      }

      const dateValue = getValue(mapping.date)
      const openValue = getValue(mapping.open)
      const highValue = getValue(mapping.high)
      const lowValue = getValue(mapping.low)
      const closeValue = getValue(mapping.close)
      const volumeValue = mapping.volume ? getValue(mapping.volume) : undefined

      // 驗證必要欄位
      if (dateValue == null || openValue == null || highValue == null || 
          lowValue == null || closeValue == null) {
        return null
      }

      // 轉換數據類型
      const date = this.parseDate(dateValue)
      const open = Number(openValue)
      const high = Number(highValue)
      const low = Number(lowValue)
      const close = Number(closeValue)
      const volume = volumeValue != null ? Number(volumeValue) : undefined

      // 驗證數值
      if (!date || isNaN(open) || isNaN(high) || isNaN(low) || isNaN(close)) {
        return null
      }

      // 驗證 OHLC 邏輯
      if (high < Math.max(open, close) || low > Math.min(open, close)) {
        throw new Error('OHLC 數據邏輯錯誤：最高價必須 >= max(開盤價, 收盤價)，最低價必須 <= min(開盤價, 收盤價)')
      }

      return {
        date,
        open,
        high,
        low,
        close,
        volume,
        originalData: item
      }
    } catch (error) {
      throw error
    }
  }

  private processOHLCItem(ohlcData: OHLCData, index: number): ProcessedOHLCData {
    const { open, high, low, close } = ohlcData
    
    // 計算方向和變化
    const change = close - open
    const changePercent = open !== 0 ? (change / open) * 100 : 0
    
    let direction: 'up' | 'down' | 'doji' = 'doji'
    if (change > 0) direction = 'up'
    else if (change < 0) direction = 'down'
    
    // 計算燭台各部分
    const bodyHeight = Math.abs(change)
    const upperShadow = high - Math.max(open, close)
    const lowerShadow = Math.min(open, close) - low
    
    // 判斷是否為十字星
    const priceRange = high - low
    const isDoji = priceRange > 0 && (bodyHeight / priceRange) <= this.config.dojiThreshold
    
    if (isDoji) direction = 'doji'

    return {
      ...ohlcData,
      date: ohlcData.date as Date,
      direction,
      change,
      changePercent,
      bodyHeight,
      upperShadow,
      lowerShadow,
      isDoji,
      index
    }
  }

  private calculateStatistics(data: ProcessedOHLCData[]) {
    if (data.length === 0) {
      return {
        count: 0,
        dateRange: { start: new Date(), end: new Date() },
        priceRange: { min: 0, max: 0 },
        totalVolume: 0,
        averageVolume: 0
      }
    }

    const dates = data.map(d => d.date.getTime()).sort((a, b) => a - b)
    const prices = data.flatMap(d => [d.open, d.high, d.low, d.close])
    const volumes = data.map(d => d.volume).filter(v => v != null) as number[]

    return {
      count: data.length,
      dateRange: {
        start: new Date(dates[0]),
        end: new Date(dates[dates.length - 1])
      },
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      },
      totalVolume: volumes.length > 0 ? volumes.reduce((sum, v) => sum + v, 0) : undefined,
      averageVolume: volumes.length > 0 ? volumes.reduce((sum, v) => sum + v, 0) / volumes.length : undefined
    }
  }

  private parseDate(value: any): Date | null {
    if (value instanceof Date) {
      return value
    }

    if (typeof value === 'number') {
      // 假設是時間戳
      return new Date(value)
    }

    if (typeof value === 'string') {
      const date = new Date(value)
      return isNaN(date.getTime()) ? null : date
    }

    return null
  }

  private isDateString(value: any): boolean {
    if (typeof value !== 'string') return false
    const date = new Date(value)
    return !isNaN(date.getTime())
  }

  private createEmptyResult(errors: string[], warnings: string[]): OHLCProcessorResult {
    return {
      data: [],
      statistics: {
        count: 0,
        dateRange: { start: new Date(), end: new Date() },
        priceRange: { min: 0, max: 0 }
      },
      errors,
      warnings,
      resolvedMapping: {} as OHLCMapping
    }
  }
}

// 便利函數
export function processOHLCData(data: any[], config?: OHLCProcessorConfig): OHLCProcessorResult {
  const processor = new OHLCProcessor(config)
  return processor.process(data)
}