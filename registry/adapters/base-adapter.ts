import { DataAdapter, ValidationResult, SuggestedMapping, ChartDataPoint, DataMapping } from '../types'
import { detectColumnType, suggestMapping } from '../utils/data-detector'

// 定義常數避免 magic numbers
const DEFAULT_SAMPLE_SIZE = 10
const SMALL_NUMBER_THRESHOLD = 0.1

/**
 * 基礎資料適配器抽象類別
 * 提供通用的資料處理功能
 */
export abstract class BaseAdapter<T = unknown> implements DataAdapter<T> {
  abstract transform(data: T[], config: DataMapping): ChartDataPoint[]
  
  validate(data: T[]): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    let confidence = 1.0
    
    if (!Array.isArray(data)) {
      errors.push('資料必須是陣列格式')
      return { isValid: false, errors, warnings, confidence: 0 }
    }
    
    if (data.length === 0) {
      warnings.push('資料陣列為空')
      return { isValid: true, errors, warnings, confidence: 0.5 }
    }
    
    // 檢查資料一致性
    const firstRowKeys = Object.keys(data[0] || {})
    if (firstRowKeys.length === 0) {
      errors.push('資料物件不能為空')
      return { isValid: false, errors, warnings, confidence: 0 }
    }
    
    // 檢查所有行是否有相同的欄位結構
    let inconsistentRows = 0
    for (let i = 1; i < Math.min(data.length, DEFAULT_SAMPLE_SIZE); i++) {
      const currentKeys = Object.keys(data[i] || {})
      const missingKeys = firstRowKeys.filter(key => !currentKeys.includes(key))
      const extraKeys = currentKeys.filter(key => !firstRowKeys.includes(key))
      
      if (missingKeys.length > 0) {
        warnings.push(`第 ${i + 1} 行缺少欄位: ${missingKeys.join(', ')}`)
        inconsistentRows++
      }
      if (extraKeys.length > 0) {
        warnings.push(`第 ${i + 1} 行多餘欄位: ${extraKeys.join(', ')}`)
        inconsistentRows++
      }
    }
    
    // 根據不一致的行數調整信心度
    if (inconsistentRows > 0) {
      confidence = Math.max(SMALL_NUMBER_THRESHOLD, 1 - (inconsistentRows / Math.min(data.length, DEFAULT_SAMPLE_SIZE)))
    }
    
    return { isValid: errors.length === 0, errors, warnings, confidence }
  }
  
  suggest(data: T[]): SuggestedMapping[] {
    return suggestMapping(data)
  }
  
  /**
   * 解析欄位路徑（支援巢狀物件）
   */
  protected resolveFieldPath<T = unknown>(obj: Record<string, unknown>, path: string | ((d: Record<string, unknown>) => T) | undefined): T | null {
    if (path === undefined) return undefined
    
    if (typeof path === 'function') {
      return path(obj)
    }
    
    if (typeof path !== 'string') {
      return path
    }
    
    // 支援巢狀路徑如 'user.profile.name'
    const keys = path.split('.')
    let result = obj
    
    for (const key of keys) {
      if (result == null) return null
      result = result[key]
    }
    
    return result
  }
  
  /**
   * 清理和轉換數值
   */
  protected cleanNumber(value: unknown): number {
    if (typeof value === 'number') return value
    if (typeof value === 'string') {
      // 移除逗號、貨幣符號等
      const cleaned = value.replace(/[,$%]/g, '')
      const num = parseFloat(cleaned)
      return isNaN(num) ? 0 : num
    }
    return 0
  }
  
  /**
   * 清理和轉換日期
   */
  protected cleanDate(value: unknown): Date | null {
    if (value instanceof Date) return value
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value)
      return isNaN(date.getTime()) ? null : date
    }
    return null
  }
  
  /**
   * 通用的值清理方法
   */
  protected cleanValue(value: unknown): string | number | Date | null {
    if (value == null) return null
    
    if (typeof value === 'string') {
      const trimmed = value.trim()
      
      // 嘗試轉換為數值
      const numValue = this.cleanNumber(trimmed)
      if (!isNaN(numValue) && /^[0-9.,%-]+$/.test(trimmed)) {
        return numValue
      }
      
      // 嘗試轉換為日期
      const dateValue = this.cleanDate(trimmed)
      if (dateValue) return dateValue
      
      return trimmed
    }
    
    return value
  }
  
  /**
   * 偵測並建議最佳的 X/Y 軸映射
   */
  protected suggestBestMapping(data: T[]): { x: string, y: string } | null {
    if (!data.length) return null
    
    // 回退到簡單的欄位分析
    const firstRow = data[0]
    const fields = Object.keys(firstRow as Record<string, unknown>)
    
    let xField = fields[0]
    let yField = fields[1]
    
    for (const field of fields) {
      const values = data.slice(0, DEFAULT_SAMPLE_SIZE).map(d => (d as Record<string, unknown>)[field])
      const typeInfo = detectColumnType(values)
      
      if (typeInfo.type === 'string' && !xField) {
        xField = field
      }
      if (typeInfo.type === 'number' && !yField) {
        yField = field
      }
    }
    
    return xField && yField ? { x: xField, y: yField } : null
  }
}