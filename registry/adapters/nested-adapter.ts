import { BaseAdapter } from './base-adapter'
import { ChartDataPoint, DataMapping, ValidationResult, SuggestedMapping, FieldSuggestion, DataType } from '../types'

// 定義常數避免 magic numbers
const MIN_NESTED_DEPTH = 5
const HIGH_CONFIDENCE = 0.8

/**
 * 巢狀物件資料適配器
 * 處理複雜的巢狀物件結構，支援深層路徑訪問
 */
export class NestedAdapter extends BaseAdapter<Record<string, unknown>> {
  
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
        
        // 添加其他映射欄位（支援巢狀路徑）
        Object.keys(config).forEach(key => {
          if (key !== 'x' && key !== 'y') {
            const value = this.resolveFieldPath(row, config[key])
            if (value != null) {
              dataPoint[key] = this.cleanValue(value)
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
  
  validate(data: Record<string, unknown>[]): ValidationResult {
    const baseValidation = super.validate(data)
    if (!baseValidation.isValid) return baseValidation
    
    const errors = [...baseValidation.errors]
    const warnings = [...baseValidation.warnings]
    
    if (data.length === 0) {
      return { isValid: true, errors, warnings, confidence: 1.0 }
    }
    
    // 分析巢狀結構的複雜度
    const complexity = this.analyzeNestingComplexity(data)
    
    if (complexity.maxDepth > 5) {
      warnings.push(`資料巢狀深度過深 (${complexity.maxDepth} 層)，可能影響效能`)
    }
    
    if (complexity.inconsistentStructures > data.length * 0.3) {
      warnings.push('資料結構不一致的比例較高，可能影響資料映射的準確性')
    }
    
    // 檢查巢狀欄位的可訪問性
    const flattenedFields = this.getAllNestedFields(data[0])
    flattenedFields.forEach(fieldPath => {
      const accessibleCount = data.slice(0, 20).filter(row => {
        try {
          return this.resolveFieldPath(row, fieldPath) != null
        } catch {
          return false
        }
      }).length
      
      const accessibilityRate = accessibleCount / Math.min(data.length, 20)
      if (accessibilityRate < 0.5) {
        warnings.push(`巢狀欄位 "${fieldPath}" 在多數資料中不可訪問`)
      }
    })
    
    const confidence = errors.length === 0 ? HIGH_CONFIDENCE : Math.max(0.2, 1 - (errors.length / MIN_NESTED_DEPTH))
    return { isValid: errors.length === 0, errors, warnings, confidence }
  }
  
  suggest(data: Record<string, unknown>[]): SuggestedMapping[] {
    const baseSuggestions = super.suggest(data)
    
    if (data.length === 0) return baseSuggestions
    
    // 尋找最佳的 x 和 y 欄位
    const fieldSuggestions = this.getFieldSuggestions(data)
    
    if (fieldSuggestions.length < 2) {
      return baseSuggestions
    }
    
    // 找出最適合做 x 和 y 軸的欄位
    const xField = fieldSuggestions.find(f => f.suggested === 'x') || fieldSuggestions[0]
    const yField = fieldSuggestions.find(f => f.suggested === 'y') || fieldSuggestions[1]
    
    const suggestion: SuggestedMapping = {
      type: 'auto',
      mapping: {
        x: xField.field,
        y: yField.field
      },
      chartType: xField.type === 'date' ? 'line' : 'bar',
      confidence: Math.min(xField.confidence, yField.confidence),
      reasoning: `巢狀資料結構分析建議使用 ${xField.field} 做為 X 軸，${yField.field} 做為 Y 軸`
    }
    
    return [suggestion, ...baseSuggestions]
  }
  
  /**
   * 獲取欄位建議
   */
  private getFieldSuggestions(data: Record<string, any>[]): FieldSuggestion[] {
    const suggestions: FieldSuggestion[] = []
    const flattenedFields = this.getAllNestedFields(data[0])
    
    flattenedFields.forEach(fieldPath => {
      const values = data.slice(0, 20)
        .map(row => {
          try {
            return this.resolveFieldPath(row, fieldPath)
          } catch {
            return null
          }
        })
        .filter(v => v != null)
      
      if (values.length === 0) return
      
      const type = this.detectNestedFieldType(values)
      const confidence = this.calculateFieldConfidence(fieldPath, values, data.length)
      
      // 根據欄位路徑和內容建議用途
      let suggested: 'x' | 'y' | 'color' | 'size' = 'x'
      
      const pathLower = fieldPath.toLowerCase()
      
      if (type === 'number') {
        if (pathLower.includes('value') || pathLower.includes('amount') || pathLower.includes('count')) {
          suggested = 'y'
        } else if (pathLower.includes('size') || pathLower.includes('radius')) {
          suggested = 'size'
        }
      } else if (type === 'date') {
        suggested = 'x'
      } else if (type === 'string') {
        if (pathLower.includes('category') || pathLower.includes('type') || pathLower.includes('color')) {
          suggested = 'color'
        }
      }
      
      suggestions.push({
        field: fieldPath,
        type: type as DataType,
        confidence,
        suggested
      })
    })
    
    return suggestions.sort((a, b) => b.confidence - a.confidence)
  }
  
  /**
   * 獲取所有巢狀欄位路徑
   */
  private getAllNestedFields(obj: any, prefix = '', maxDepth = 5): string[] {
    if (maxDepth <= 0 || obj == null || typeof obj !== 'object') {
      return []
    }
    
    const fields: string[] = []
    
    Object.keys(obj).forEach(key => {
      const currentPath = prefix ? `${prefix}.${key}` : key
      const value = obj[key]
      
      // 添加當前欄位
      fields.push(currentPath)
      
      // 如果值是物件且不是陣列，遞迴處理
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        fields.push(...this.getAllNestedFields(value, currentPath, maxDepth - 1))
      }
      
      // 如果值是陣列，檢查第一個元素
      if (Array.isArray(value) && value.length > 0) {
        const firstItem = value[0]
        if (firstItem && typeof firstItem === 'object') {
          Object.keys(firstItem).forEach(subKey => {
            fields.push(`${currentPath}[0].${subKey}`)
          })
        }
      }
    })
    
    return [...new Set(fields)] // 去重
  }
  
  /**
   * 分析巢狀結構的複雜度
   */
  private analyzeNestingComplexity(data: Record<string, any>[]): {
    maxDepth: number
    avgDepth: number
    inconsistentStructures: number
  } {
    const depths: number[] = []
    const structures: string[] = []
    
    data.slice(0, 10).forEach(row => {
      const depth = this.getObjectDepth(row)
      depths.push(depth)
      
      const structure = this.getObjectStructureSignature(row)
      structures.push(structure)
    })
    
    const maxDepth = Math.max(...depths)
    const avgDepth = depths.reduce((a, b) => a + b, 0) / depths.length
    
    // 計算結構不一致的數量
    const uniqueStructures = new Set(structures)
    const inconsistentStructures = uniqueStructures.size - 1 // 除了第一個，其他不同的都算不一致
    
    return { maxDepth, avgDepth, inconsistentStructures }
  }
  
  /**
   * 計算物件深度
   */
  private getObjectDepth(obj: any): number {
    if (obj == null || typeof obj !== 'object') return 0
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return 1
      return 1 + Math.max(...obj.map(item => this.getObjectDepth(item)))
    }
    
    const depths = Object.values(obj).map(value => this.getObjectDepth(value))
    return depths.length === 0 ? 1 : 1 + Math.max(...depths)
  }
  
  /**
   * 獲取物件結構簽名（用於比較結構相似性）
   */
  private getObjectStructureSignature(obj: any, depth = 0): string {
    if (depth > 3 || obj == null || typeof obj !== 'object') {
      return typeof obj
    }
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return 'array:empty'
      return `array:${this.getObjectStructureSignature(obj[0], depth + 1)}`
    }
    
    const keys = Object.keys(obj).sort()
    const signature = keys.map(key => {
      const value = obj[key]
      return `${key}:${this.getObjectStructureSignature(value, depth + 1)}`
    }).join(',')
    
    return `{${signature}}`
  }
  
  /**
   * 偵測巢狀欄位的型別
   */
  private detectNestedFieldType(values: any[]): 'number' | 'string' | 'date' | 'boolean' {
    if (values.length === 0) return 'string'
    
    // 數值檢測
    const numericValues = values.filter(v => typeof v === 'number' || !isNaN(Number(v)))
    if (numericValues.length / values.length > 0.8) return 'number'
    
    // 日期檢測
    const dateValues = values.filter(v => {
      if (v instanceof Date) return true
      if (typeof v === 'string' && !isNaN(Date.parse(v))) return true
      return false
    })
    if (dateValues.length / values.length > 0.8) return 'date'
    
    // 布林檢測
    const booleanValues = values.filter(v => typeof v === 'boolean')
    if (booleanValues.length / values.length > 0.8) return 'boolean'
    
    return 'string'
  }
  
  /**
   * 計算欄位的信心度
   */
  private calculateFieldConfidence(fieldPath: string, values: any[], totalLength: number): number {
    let confidence = 0.5
    
    // 基於可訪問性的信心度
    const accessibilityRate = values.length / totalLength
    confidence += accessibilityRate * 0.3
    
    // 基於欄位名稱的信心度
    const pathLower = fieldPath.toLowerCase()
    if (pathLower.includes('id') || pathLower.includes('key')) {
      confidence += 0.1
    }
    if (pathLower.includes('value') || pathLower.includes('amount')) {
      confidence += 0.2
    }
    if (pathLower.includes('name') || pathLower.includes('title')) {
      confidence += 0.1
    }
    
    // 基於巢狀深度的信心度調整
    const depth = fieldPath.split('.').length
    if (depth === 1) {
      confidence += 0.1 // 頂層欄位更可靠
    } else if (depth > 3) {
      confidence -= 0.1 // 深層欄位可靠性較低
    }
    
    return Math.min(0.95, Math.max(0.1, confidence))
  }
  
  
  /**
   * 扁平化巢狀物件（輔助函數）
   */
  static flatten(obj: any, prefix = ''): Record<string, any> {
    const flattened: Record<string, any> = {}
    
    Object.keys(obj).forEach(key => {
      const newKey = prefix ? `${prefix}.${key}` : key
      const value = obj[key]
      
      if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
        Object.assign(flattened, NestedAdapter.flatten(value, newKey))
      } else {
        flattened[newKey] = value
      }
    })
    
    return flattened
  }
  
  /**
   * 建議最佳的扁平化策略
   */
  suggestFlatteningStrategy(data: Record<string, any>[]): {
    strategy: 'none' | 'partial' | 'full'
    reason: string
    suggestedFields: string[]
  } {
    if (data.length === 0) {
      return { strategy: 'none', reason: '無資料', suggestedFields: [] }
    }
    
    const complexity = this.analyzeNestingComplexity(data)
    
    if (complexity.maxDepth <= 2) {
      return { 
        strategy: 'none', 
        reason: '巢狀結構簡單，無需扁平化',
        suggestedFields: []
      }
    }
    
    if (complexity.maxDepth > 4 || complexity.inconsistentStructures > data.length * 0.5) {
      const allFields = this.getAllNestedFields(data[0])
      const simpleFields = allFields.filter(field => field.split('.').length <= 3)
      
      return {
        strategy: 'partial',
        reason: '結構複雜，建議部分扁平化',
        suggestedFields: simpleFields
      }
    }
    
    const allFields = this.getAllNestedFields(data[0])
    return {
      strategy: 'full',
      reason: '中等複雜度，建議完全扁平化',
      suggestedFields: allFields
    }
  }
}