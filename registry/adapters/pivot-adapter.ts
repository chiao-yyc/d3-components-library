import { BaseAdapter } from './base-adapter'
import { ChartDataPoint, ValidationResult, SuggestedMapping } from '../types'

/**
 * 樞紐表資料適配器
 * 處理寬表格轉長表格的轉換，支援多維資料透視
 */
export class PivotAdapter extends BaseAdapter<Record<string, any>> {
  
  transform(data: Record<string, any>[], config: PivotMappingConfig): ChartDataPoint[] {
    const result: ChartDataPoint[] = []
    
    // 如果需要樞紐轉換
    if (config.pivotConfig) {
      const pivotedData = this.performPivot(data, config.pivotConfig)
      data = pivotedData
    }
    
    // 標準轉換
    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      
      try {
        const x = this.resolveFieldPath(row, config.x)
        const y = this.resolveFieldPath(row, config.y)
        
        if (x == null || y == null) continue
        
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
          if (key !== 'x' && key !== 'y' && key !== 'pivotConfig') {
            const fieldPath = config[key as keyof PivotMappingConfig]
            if (typeof fieldPath === 'string' || typeof fieldPath === 'function') {
              const value = this.resolveFieldPath(row, fieldPath)
              if (value != null) {
                dataPoint[key] = this.cleanValue(value)
              }
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
    
    // 分析資料是否適合樞紐轉換
    const analysis = this.analyzePivotability(data)
    
    if (analysis.isWideFormat && analysis.confidence > 0.7) {
      warnings.push('偵測到寬表格格式，建議使用樞紐轉換以便更好地視覺化')
    }
    
    if (analysis.hasMultipleValueColumns && analysis.valueColumns.length > 10) {
      warnings.push(`發現 ${analysis.valueColumns.length} 個數值欄位，可能需要選擇特定欄位進行分析`)
    }
    
    if (analysis.duplicateKeyPairs > 0) {
      warnings.push(`發現 ${analysis.duplicateKeyPairs} 個重複的索引鍵組合，可能需要聚合處理`)
    }
    
    const confidence = errors.length === 0 ? 0.75 : Math.max(0.2, 1 - (errors.length / 6))
    return { isValid: errors.length === 0, errors, warnings, confidence }
  }
  
  suggest(data: Record<string, any>[]): SuggestedMapping[] {
    const baseSuggestions = super.suggest(data)
    const analysis = this.analyzePivotability(data)
    
    // 如果是寬表格，建議樞紐轉換後的映射
    if (analysis.isWideFormat && analysis.confidence > 0.7) {
      const pivotSuggestion: SuggestedMapping = {
        type: 'auto',
        mapping: {
          x: 'variable',
          y: 'value'
        },
        chartType: 'line',
        confidence: 0.9,
        reasoning: '偵測到寬表格格式，建議使用樞紐轉換將欄位轉換為行資料進行時間序列分析'
      }
      
      return [pivotSuggestion, ...baseSuggestions]
    }
    
    return baseSuggestions
  }
  
  /**
   * 執行樞紐轉換
   */
  private performPivot(data: Record<string, any>[], config: PivotConfig): Record<string, any>[] {
    switch (config.type) {
      case 'wide-to-long':
        return this.wideToLong(data, config)
      case 'long-to-wide':
        return this.longToWide(data, config)
      case 'group-by':
        return this.groupBy(data, config)
      default:
        return data
    }
  }
  
  /**
   * 寬表格轉長表格
   */
  private wideToLong(data: Record<string, any>[], config: PivotConfig): Record<string, any>[] {
    const result: Record<string, any>[] = []
    const valueColumns = config.valueColumns || this.identifyValueColumns(data)
    const idColumns = config.idColumns || this.identifyIdColumns(data, valueColumns)
    
    data.forEach((row, rowIndex) => {
      valueColumns.forEach(valueCol => {
        const newRow: Record<string, any> = {}
        
        // 複製識別欄位
        idColumns.forEach(idCol => {
          newRow[idCol] = row[idCol]
        })
        
        // 添加變數名稱和值
        newRow[config.variableName || 'variable'] = valueCol
        newRow[config.valueName || 'value'] = this.cleanNumber(row[valueCol])
        
        // 添加原始行索引
        newRow._originalIndex = rowIndex
        
        result.push(newRow)
      })
    })
    
    return result
  }
  
  /**
   * 長表格轉寬表格
   */
  private longToWide(data: Record<string, any>[], config: PivotConfig): Record<string, any>[] {
    const keyField = config.keyField!
    const valueField = config.valueField!
    const idColumns = config.idColumns || []
    
    // 按識別欄位分組
    const groups = new Map<string, Record<string, any>>()
    
    data.forEach(row => {
      const groupKey = idColumns.map(col => row[col]).join('|')
      
      if (!groups.has(groupKey)) {
        const newRow: Record<string, any> = {}
        idColumns.forEach(col => {
          newRow[col] = row[col]
        })
        groups.set(groupKey, newRow)
      }
      
      const group = groups.get(groupKey)!
      const key = row[keyField]
      const value = this.cleanNumber(row[valueField])
      
      group[key] = value
    })
    
    return Array.from(groups.values())
  }
  
  /**
   * 分組聚合
   */
  private groupBy(data: Record<string, any>[], config: PivotConfig): Record<string, any>[] {
    const result: Record<string, any>[] = []
    const groupByFields = config.groupByFields || []
    const aggregateFields = config.aggregateFields || []
    const aggregateFunction = config.aggregateFunction || 'sum'
    
    const groups = new Map<string, any[]>()
    
    // 分組
    data.forEach(row => {
      const groupKey = groupByFields.map(field => row[field]).join('|')
      
      if (!groups.has(groupKey)) {
        groups.set(groupKey, [])
      }
      groups.get(groupKey)!.push(row)
    })
    
    // 聚合
    groups.forEach((groupData, groupKey) => {
      const newRow: Record<string, any> = {}
      
      // 設定分組欄位
      groupByFields.forEach((field, index) => {
        newRow[field] = groupKey.split('|')[index]
      })
      
      // 計算聚合值
      aggregateFields.forEach(field => {
        const values = groupData.map(row => this.cleanNumber(row[field])).filter(v => !isNaN(v))
        
        if (values.length === 0) {
          newRow[field] = 0
          return
        }
        
        switch (aggregateFunction) {
          case 'sum':
            newRow[field] = values.reduce((a, b) => a + b, 0)
            break
          case 'avg':
            newRow[field] = values.reduce((a, b) => a + b, 0) / values.length
            break
          case 'max':
            newRow[field] = Math.max(...values)
            break
          case 'min':
            newRow[field] = Math.min(...values)
            break
          case 'count':
            newRow[field] = values.length
            break
          default:
            newRow[field] = values[0]
        }
      })
      
      result.push(newRow)
    })
    
    return result
  }
  
  /**
   * 分析資料是否適合樞紐轉換
   */
  private analyzePivotability(data: Record<string, any>[]): PivotAnalysis {
    if (data.length === 0) {
      return {
        isWideFormat: false,
        confidence: 0,
        valueColumns: [],
        identifierColumns: [],
        hasMultipleValueColumns: false,
        duplicateKeyPairs: 0
      }
    }
    
    const firstRow = data[0]
    const fields = Object.keys(firstRow)
    
    // 識別數值欄位和非數值欄位
    const valueColumns = this.identifyValueColumns(data)
    const identifierColumns = this.identifyIdColumns(data, valueColumns)
    
    // 判斷是否為寬格式
    const isWideFormat = valueColumns.length > 3 && identifierColumns.length > 0
    
    // 計算信心度
    let confidence = 0
    if (valueColumns.length > fields.length * 0.5) confidence += 0.4
    if (identifierColumns.length > 0) confidence += 0.3
    if (this.hasConsistentColumnPattern(valueColumns)) confidence += 0.3
    
    // 檢查重複鍵值對
    const duplicateKeyPairs = this.countDuplicateKeyPairs(data, identifierColumns)
    
    return {
      isWideFormat,
      confidence,
      valueColumns,
      identifierColumns,
      hasMultipleValueColumns: valueColumns.length > 1,
      duplicateKeyPairs
    }
  }
  
  /**
   * 識別數值欄位
   */
  private identifyValueColumns(data: Record<string, any>[]): string[] {
    if (data.length === 0) return []
    
    const firstRow = data[0]
    const valueColumns: string[] = []
    
    Object.keys(firstRow).forEach(field => {
      const values = data.slice(0, 20).map(row => row[field]).filter(v => v != null)
      
      if (values.length === 0) return
      
      const numericValues = values.filter(v => typeof v === 'number' || !isNaN(Number(v)))
      const numericRate = numericValues.length / values.length
      
      if (numericRate > 0.7) {
        valueColumns.push(field)
      }
    })
    
    return valueColumns
  }
  
  /**
   * 識別識別欄位
   */
  private identifyIdColumns(data: Record<string, any>[], valueColumns: string[]): string[] {
    if (data.length === 0) return []
    
    const firstRow = data[0]
    const allColumns = Object.keys(firstRow)
    
    return allColumns.filter(field => !valueColumns.includes(field))
  }
  
  /**
   * 檢查欄位是否有一致的命名模式
   */
  private hasConsistentColumnPattern(columns: string[]): boolean {
    if (columns.length < 3) return false
    
    // 檢查是否有共同前綴或後綴
    const hasCommonPrefix = this.hasCommonPattern(columns, 'prefix')
    const hasCommonSuffix = this.hasCommonPattern(columns, 'suffix')
    
    // 檢查是否是日期或數字序列
    const isDateSequence = this.isDateSequence(columns)
    const isNumberSequence = this.isNumberSequence(columns)
    
    return hasCommonPrefix || hasCommonSuffix || isDateSequence || isNumberSequence
  }
  
  /**
   * 檢查共同模式
   */
  private hasCommonPattern(columns: string[], type: 'prefix' | 'suffix'): boolean {
    if (columns.length < 2) return false
    
    const patterns = new Map<string, number>()
    
    columns.forEach(col => {
      const parts = col.split(/[_\s-]/)
      const pattern = type === 'prefix' ? parts[0] : parts[parts.length - 1]
      
      patterns.set(pattern, (patterns.get(pattern) || 0) + 1)
    })
    
    const maxCount = Math.max(...patterns.values())
    return maxCount >= columns.length * 0.7
  }
  
  /**
   * 檢查是否是日期序列
   */
  private isDateSequence(columns: string[]): boolean {
    const datePatterns = [
      /\d{4}-\d{2}/,     // 2023-01
      /\d{4}_\d{2}/,     // 2023_01
      /\d{2}\/\d{4}/,    // 01/2023
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i,
      /(Q1|Q2|Q3|Q4)/i
    ]
    
    const dateColumns = columns.filter(col => 
      datePatterns.some(pattern => pattern.test(col))
    )
    
    return dateColumns.length >= columns.length * 0.7
  }
  
  /**
   * 檢查是否是數字序列
   */
  private isNumberSequence(columns: string[]): boolean {
    const numberColumns = columns.filter(col => /\d+/.test(col))
    return numberColumns.length >= columns.length * 0.7
  }
  
  /**
   * 計算重複鍵值對
   */
  private countDuplicateKeyPairs(data: Record<string, any>[], keyFields: string[]): number {
    if (keyFields.length === 0) return 0
    
    const keyGroups = new Map<string, number>()
    
    data.forEach(row => {
      const key = keyFields.map(field => row[field]).join('|')
      keyGroups.set(key, (keyGroups.get(key) || 0) + 1)
    })
    
    let duplicates = 0
    keyGroups.forEach(count => {
      if (count > 1) duplicates += count - 1
    })
    
    return duplicates
  }
  
  
  /**
   * 建議樞紐轉換配置
   */
  suggestPivotConfig(data: Record<string, any>[]): PivotConfig | null {
    const analysis = this.analyzePivotability(data)
    
    if (!analysis.isWideFormat || analysis.confidence < 0.7) {
      return null
    }
    
    return {
      type: 'wide-to-long',
      valueColumns: analysis.valueColumns,
      idColumns: analysis.identifierColumns,
      variableName: 'variable',
      valueName: 'value'
    }
  }
}

// 相關型別定義
interface PivotConfig {
  type: 'wide-to-long' | 'long-to-wide' | 'group-by'
  valueColumns?: string[]
  idColumns?: string[]
  variableName?: string
  valueName?: string
  keyField?: string
  valueField?: string
  groupByFields?: string[]
  aggregateFields?: string[]
  aggregateFunction?: 'sum' | 'avg' | 'max' | 'min' | 'count'
}

interface PivotAnalysis {
  isWideFormat: boolean
  confidence: number
  valueColumns: string[]
  identifierColumns: string[]
  hasMultipleValueColumns: boolean
  duplicateKeyPairs: number
}

interface PivotMappingConfig {
  x: string | ((d: unknown) => unknown)
  y: string | ((d: unknown) => unknown)
  color?: string | ((d: unknown) => unknown)
  size?: string | ((d: unknown) => unknown)
  pivotConfig?: PivotConfig
  [key: string]: string | ((d: unknown) => unknown) | PivotConfig | undefined
}

export type { PivotConfig, PivotAnalysis }