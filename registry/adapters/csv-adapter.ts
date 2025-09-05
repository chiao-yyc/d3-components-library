import { BaseAdapter } from './base-adapter'
import { ChartDataPoint, DataMapping, ValidationResult } from '../types'
import { detectColumnType } from '../utils/data-detector'

// 定義常數避免 magic numbers
const CONFIDENCE_THRESHOLD = 0.7
const MAX_SAMPLE_SIZE = 100
const MAX_DISPLAY_VALUES = 3
const HIGH_CONFIDENCE = 0.9
const LOW_CONFIDENCE = 0.1
const ERROR_DIVISOR = 10

/**
 * CSV 資料適配器
 * 處理 CSV 格式的資料，自動型別推斷和格式轉換
 */
export class CsvAdapter extends BaseAdapter<Record<string, unknown>> {
  
  transform(data: Record<string, unknown>[], config: DataMapping): ChartDataPoint[] {
    const result: ChartDataPoint[] = []
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      
      try {
        const x = this.resolveFieldPath(row, config.x)
        const y = this.resolveFieldPath(row, config.y)
        
        if (x == null || y == null) continue
        
        // 清理和轉換資料
        const cleanedX = this.cleanValue(x)
        const cleanedY = this.cleanNumber(y)
        
        if (isNaN(cleanedY)) continue
        
        const dataPoint: ChartDataPoint = {
          x: cleanedX,
          y: cleanedY,
          originalData: row,
          index: i
        }
        
        // 添加其他映射欄位
        Object.keys(config).forEach(key => {
          if (key !== 'x' && key !== 'y') {
            const value = this.resolveFieldPath(row, config[key])
            if (value != null) {
              dataPoint[key] = this.cleanValue(value)
            }
          }
        })
        
        result.push(dataPoint)
      } catch (error) {
        // 靜默忽略個別行的錯誤，繼續處理其他行
      }
    }
    
    return result
  }
  
  validate(data: Record<string, unknown>[]): ValidationResult {
    const baseValidation = super.validate(data)
    if (!baseValidation.isValid) return baseValidation
    
    const errors = [...baseValidation.errors]
    const warnings = [...baseValidation.warnings]
    
    if (data.length === 0) {
      return { isValid: true, errors, warnings, confidence: 1.0 }
    }
    
    // CSV 特定驗證
    const firstRow = data[0]
    const fields = Object.keys(firstRow)
    
    // 檢查是否有空的欄位名稱
    const emptyFields = fields.filter(field => !field || field.trim() === '')
    if (emptyFields.length > 0) {
      warnings.push('發現空的欄位名稱，可能影響資料映射')
    }
    
    // 檢查資料型別一致性
    fields.forEach(field => {
      const values = data.slice(0, MAX_SAMPLE_SIZE).map(row => row[field]).filter(v => v != null)
      if (values.length === 0) return
      
      const typeInfo = detectColumnType(values)
      
      // 如果信心度太低，發出警告
      if (typeInfo.confidence < CONFIDENCE_THRESHOLD) {
        warnings.push(`欄位 "${field}" 的資料型別不一致，可能需要手動清理`)
      }
      
      // 檢查數值欄位是否有非數值內容
      if (typeInfo.type === 'number') {
        const invalidValues = values.filter(v => {
          const cleaned = this.cleanNumber(v)
          return isNaN(cleaned) && v !== null && v !== ''
        })
        
        if (invalidValues.length > 0) {
          warnings.push(`數值欄位 "${field}" 包含無法解析的值: ${invalidValues.slice(0, MAX_DISPLAY_VALUES).join(', ')}${invalidValues.length > MAX_DISPLAY_VALUES ? '...' : ''}`)
        }
      }
    })
    
    const confidence = errors.length === 0 ? HIGH_CONFIDENCE : Math.max(LOW_CONFIDENCE, 1 - (errors.length / ERROR_DIVISOR))
    return { isValid: errors.length === 0, errors, warnings, confidence }
  }
  
  /**
   * 解析 CSV 字串為物件陣列
   */
  static parseCSV(csvText: string, options: {
    delimiter?: string
    hasHeader?: boolean
    skipEmptyLines?: boolean
  } = {}): Record<string, any>[] {
    const {
      delimiter = ',',
      hasHeader = true,
      skipEmptyLines = true
    } = options
    
    const lines = csvText.split('\n')
    if (lines.length === 0) return []
    
    // 移除空行
    const validLines = skipEmptyLines 
      ? lines.filter(line => line.trim() !== '')
      : lines
    
    if (validLines.length === 0) return []
    
    // 解析表頭
    const headers = hasHeader 
      ? CsvAdapter.parseCSVLine(validLines[0], delimiter)
      : validLines[0].split(delimiter).map((_, i) => `column_${i + 1}`)
    
    const startIndex = hasHeader ? 1 : 0
    const result: Record<string, any>[] = []
    
    for (let i = startIndex; i < validLines.length; i++) {
      const values = CsvAdapter.parseCSVLine(validLines[i], delimiter)
      
      if (values.length === 0) continue
      
      const row: Record<string, any> = {}
      headers.forEach((header, index) => {
        const value = values[index] || ''
        row[header] = CsvAdapter.inferValue(value.trim())
      })
      
      result.push(row)
    }
    
    return result
  }
  
  /**
   * 解析 CSV 行（處理引號內的逗號）
   */
  private static parseCSVLine(line: string, delimiter: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      
      if (char === '"' && !inQuotes) {
        inQuotes = true
      } else if (char === '"' && inQuotes) {
        if (line[i + 1] === '"') {
          // 處理雙引號轉義
          current += '"'
          i++ // 跳過下一個引號
        } else {
          inQuotes = false
        }
      } else if (char === delimiter && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    
    result.push(current)
    return result
  }
  
  /**
   * 推斷值的型別並轉換
   */
  private static inferValue(value: string): any {
    if (value === '') return null
    
    // 布林值
    if (value.toLowerCase() === 'true') return true
    if (value.toLowerCase() === 'false') return false
    
    // 數值
    const numValue = parseFloat(value.replace(/[,$%]/g, ''))
    if (!isNaN(numValue)) return numValue
    
    // 日期
    const dateValue = new Date(value)
    if (!isNaN(dateValue.getTime()) && value.match(/\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}/)) {
      return dateValue
    }
    
    // 字串
    return value
  }
  
}