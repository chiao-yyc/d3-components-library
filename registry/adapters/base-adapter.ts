import { DataAdapter, ValidationResult, SuggestedMapping, ChartDataPoint, MappingConfig } from '../types'
import { detectColumnType, suggestMapping } from '../utils/data-detector'

/**
 * 基礎資料適配器抽象類別
 * 提供通用的資料處理功能
 */
export abstract class BaseAdapter<T = any> implements DataAdapter<T> {
  abstract transform(data: T[], config: MappingConfig): ChartDataPoint[]
  
  validate(data: T[]): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    if (!Array.isArray(data)) {
      errors.push('資料必須是陣列格式')
      return { isValid: false, errors, warnings }
    }
    
    if (data.length === 0) {
      warnings.push('資料陣列為空')
      return { isValid: true, errors, warnings }
    }
    
    // 檢查資料一致性
    const firstRowKeys = Object.keys(data[0] || {})
    if (firstRowKeys.length === 0) {
      errors.push('資料物件不能為空')
      return { isValid: false, errors, warnings }
    }
    
    // 檢查所有行是否有相同的欄位結構
    for (let i = 1; i < Math.min(data.length, 10); i++) {
      const currentKeys = Object.keys(data[i] || {})
      const missingKeys = firstRowKeys.filter(key => !currentKeys.includes(key))
      const extraKeys = currentKeys.filter(key => !firstRowKeys.includes(key))
      
      if (missingKeys.length > 0) {
        warnings.push(`第 ${i + 1} 行缺少欄位: ${missingKeys.join(', ')}`)
      }
      if (extraKeys.length > 0) {
        warnings.push(`第 ${i + 1} 行多餘欄位: ${extraKeys.join(', ')}`)
      }
    }
    
    return { isValid: errors.length === 0, errors, warnings }
  }
  
  suggest(data: T[]): SuggestedMapping[] {
    return suggestMapping(data)
  }
  
  /**
   * 解析欄位路徑（支援巢狀物件）
   */
  protected resolveFieldPath(obj: any, path: string | ((d: any) => any)): any {
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
  protected cleanNumber(value: any): number {
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
  protected cleanDate(value: any): Date | null {
    if (value instanceof Date) return value
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value)
      return isNaN(date.getTime()) ? null : date
    }
    return null
  }
  
  /**
   * 偵測並建議最佳的 X/Y 軸映射
   */
  protected suggestBestMapping(data: T[]): { x: string, y: string } | null {
    if (!data.length) return null
    
    const suggestions = this.suggest(data)
    const xCandidate = suggestions.find(s => s.suggested === 'x')
    const yCandidate = suggestions.find(s => s.suggested === 'y')
    
    if (xCandidate && yCandidate) {
      return { x: xCandidate.field, y: yCandidate.field }
    }
    
    // 回退到第一個字串欄位作為 X，第一個數字欄位作為 Y
    const firstRow = data[0]
    const fields = Object.keys(firstRow)
    
    let xField = fields[0]
    let yField = fields[1]
    
    for (const field of fields) {
      const values = data.slice(0, 10).map(d => (d as any)[field])
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