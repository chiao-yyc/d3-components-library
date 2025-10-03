import { BaseAdapter } from './base-adapter'
import { ChartDataPoint, DataMapping, ValidationResult, SuggestedMapping } from '../types'

/**
 * 時間序列資料適配器
 * 專門處理時間相關的資料，支援多種日期格式和時間軸優化
 */
export class TimeSeriesAdapter extends BaseAdapter<Record<string, any>> {
  
  private timeFormats = [
    // ISO 格式
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/,
    /^\d{4}-\d{2}-\d{2}/,
    // 美式格式
    /^\d{1,2}\/\d{1,2}\/\d{4}/,
    /^\d{1,2}-\d{1,2}-\d{4}/,
    // 歐式格式
    /^\d{1,2}\.\d{1,2}\.\d{4}/,
    // 中文格式
    /^\d{4}年\d{1,2}月\d{1,2}日/,
    // Unix timestamp
    /^\d{10}$/,
    /^\d{13}$/
  ]
  
  transform(data: Record<string, any>[], config: DataMapping): ChartDataPoint[] {
    const result: ChartDataPoint[] = []
    
    // 排序資料以確保時間順序
    const sortedData = this.sortByTimeField(data, config.x)
    
    for (let i = 0; i < sortedData.length; i++) {
      const row = sortedData[i]
      
      try {
        const xValue = this.resolveFieldPath(row, config.x)
        const yValue = this.resolveFieldPath(row, config.y)
        
        if (xValue == null || yValue == null) continue
        
        // 轉換時間值
        const timeValue = this.parseTimeValue(xValue)
        if (!timeValue) continue
        
        // 轉換數值
        const numericValue = this.cleanNumber(yValue)
        if (isNaN(numericValue)) continue
        
        const dataPoint: ChartDataPoint = {
          x: timeValue,
          y: numericValue,
          originalData: row,
          index: i
        }
        
        // 添加其他映射欄位
        Object.keys(config).forEach(key => {
          if (key !== 'x' && key !== 'y') {
            const value = this.resolveFieldPath(row, config[key])
            if (value != null) {
              dataPoint[key] = this.cleanTimeValue(value)
            }
          }
        })
        
        result.push(dataPoint)
      } catch {
        // 靜默忽略個別行的錯誤，繼續處理其他行
      }
    }
    
    return result
  }
  
  validate(data: Record<string, any>[]): ValidationResult {
    const baseValidation = super.validate(data)
    if (!baseValidation.isValid) return baseValidation
    
    const errors = [...baseValidation.errors]
    const warnings = [...baseValidation.warnings]
    
    if (data.length === 0) {
      return { isValid: true, errors, warnings, confidence: 1.0 }
    }
    
    // 尋找時間欄位
    const timeFields = this.findTimeFields(data)
    
    if (timeFields.length === 0) {
      errors.push('未找到有效的時間欄位，時間序列適配器需要至少一個時間欄位')
      return { isValid: false, errors, warnings, confidence: 0.0 }
    }
    
    // 檢查時間資料的完整性
    timeFields.forEach(field => {
      const timeValues = data.map(row => row[field]).filter(v => v != null)
      
      if (timeValues.length === 0) {
        warnings.push(`時間欄位 "${field}" 沒有有效值`)
        return
      }
      
      const parsedTimes = timeValues.map(v => this.parseTimeValue(v)).filter(Boolean)
      const parseRate = parsedTimes.length / timeValues.length
      
      if (parseRate < 0.8) {
        warnings.push(`時間欄位 "${field}" 有 ${Math.round((1 - parseRate) * 100)}% 的值無法解析為有效時間`)
      }
      
      // 檢查時間順序
      if (parsedTimes.length > 1) {
        const sorted = [...parsedTimes].sort((a, b) => a!.getTime() - b!.getTime())
        const isOrdered = parsedTimes.every((time, i) => time!.getTime() === sorted[i]!.getTime())
        
        if (!isOrdered) {
          warnings.push(`時間欄位 "${field}" 的資料順序不正確，建議按時間順序排列`)
        }
      }
      
      // 檢查時間間隔
      if (parsedTimes.length > 2) {
        const intervals = []
        for (let i = 1; i < parsedTimes.length; i++) {
          intervals.push(parsedTimes[i]!.getTime() - parsedTimes[i-1]!.getTime())
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
        const irregularIntervals = intervals.filter(interval => 
          Math.abs(interval - avgInterval) > avgInterval * 0.5
        )
        
        if (irregularIntervals.length > intervals.length * 0.3) {
          warnings.push(`時間欄位 "${field}" 的時間間隔不規則，可能影響圖表顯示`)
        }
      }
    })
    
    const confidence = errors.length === 0 ? 0.85 : Math.max(0.1, 1 - (errors.length / 8))
    return { isValid: errors.length === 0, errors, warnings, confidence }
  }
  
  suggest(data: Record<string, any>[]): SuggestedMapping[] {
    const baseSuggestions = super.suggest(data)
    
    // 提高時間欄位的建議權重
    return baseSuggestions.map(suggestion => {
      if (suggestion.chartType === 'line' && suggestion.reasoning.includes('時間')) {
        return {
          ...suggestion,
          confidence: Math.min(0.95, suggestion.confidence + 0.2)
        }
      }
      return suggestion
    })
  }
  
  /**
   * 尋找可能的時間欄位
   */
  private findTimeFields(data: Record<string, any>[]): string[] {
    if (data.length === 0) return []
    
    const firstRow = data[0]
    const timeFields: string[] = []
    
    Object.keys(firstRow).forEach(field => {
      const values = data.slice(0, 20).map(row => row[field]).filter(v => v != null)
      
      if (values.length === 0) return
      
      // 檢查欄位名稱
      const fieldLower = field.toLowerCase()
      const isTimeFieldName = /time|date|timestamp|created|updated|year|month|day/.test(fieldLower)
      
      // 檢查值的格式
      const timeValueCount = values.filter(v => this.isTimeValue(v)).length
      const timeValueRate = timeValueCount / values.length
      
      if (isTimeFieldName || timeValueRate > 0.7) {
        timeFields.push(field)
      }
    })
    
    return timeFields
  }
  
  /**
   * 檢查值是否為時間格式
   */
  private isTimeValue(value: any): boolean {
    if (value instanceof Date) return true
    
    if (typeof value === 'number') {
      // Unix timestamp 檢查
      return (value > 946684800 && value < 4102444800) || // 2000-2100 (秒)
             (value > 946684800000 && value < 4102444800000) // 2000-2100 (毫秒)
    }
    
    if (typeof value === 'string') {
      return this.timeFormats.some(format => format.test(value))
    }
    
    return false
  }
  
  /**
   * 解析時間值
   */
  private parseTimeValue(value: any): Date | null {
    if (value instanceof Date) return value
    
    if (typeof value === 'number') {
      // Unix timestamp
      if (value > 946684800 && value < 4102444800) {
        return new Date(value * 1000) // 秒轉毫秒
      }
      if (value > 946684800000 && value < 4102444800000) {
        return new Date(value) // 毫秒
      }
    }
    
    if (typeof value === 'string') {
      // 中文日期格式特殊處理
      if (/\d{4}年\d{1,2}月\d{1,2}日/.test(value)) {
        const match = value.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/)
        if (match) {
          return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]))
        }
      }
      
      const date = new Date(value)
      return isNaN(date.getTime()) ? null : date
    }
    
    return null
  }
  
  /**
   * 按時間欄位排序資料
   */
  private sortByTimeField(data: Record<string, any>[], timeField: string | ((d: any) => any)): Record<string, any>[] {
    return [...data].sort((a, b) => {
      const timeA = this.parseTimeValue(this.resolveFieldPath(a, timeField))
      const timeB = this.parseTimeValue(this.resolveFieldPath(b, timeField))
      
      if (!timeA || !timeB) return 0
      return timeA.getTime() - timeB.getTime()
    })
  }
  
  /**
   * 時間序列特定的值清理方法
   */
  private cleanTimeValue(value: any): any {
    if (value == null) return null
    
    // 優先嘗試解析為時間
    const timeValue = this.parseTimeValue(value)
    if (timeValue) return timeValue
    
    // 回退到基本清理
    return this.cleanValue(value)
  }
  
  /**
   * 取得建議的時間間隔類型
   */
  getTimeInterval(data: Record<string, any>[], timeField: string | ((d: any) => any)): string {
    const times = data
      .map(row => this.parseTimeValue(this.resolveFieldPath(row, timeField)))
      .filter(Boolean)
      .sort((a, b) => a!.getTime() - b!.getTime())
    
    if (times.length < 2) return 'unknown'
    
    const intervals = []
    for (let i = 1; i < Math.min(times.length, 10); i++) {
      intervals.push(times[i]!.getTime() - times[i-1]!.getTime())
    }
    
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length
    
    // 判斷間隔類型
    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour
    const week = 7 * day
    const month = 30 * day
    const year = 365 * day
    
    if (avgInterval < hour) return 'minute'
    if (avgInterval < day) return 'hour'
    if (avgInterval < week) return 'day'
    if (avgInterval < month) return 'week'
    if (avgInterval < year) return 'month'
    return 'year'
  }
}