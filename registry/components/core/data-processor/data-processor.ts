import { 
  DataMapping, 
  DataAccessors, 
  DataKeys, 
  ProcessedDataPoint, 
  DataProcessorConfig, 
  DataProcessorResult,
  FieldInfo 
} from './types'
import { detectColumnType } from '../../../utils/data-detector'

export class DataProcessor {
  private config: Required<DataProcessorConfig>
  
  constructor(config: DataProcessorConfig = {}) {
    this.config = {
      mapping: {},
      accessors: {},
      keys: {},
      autoDetect: true,
      autoDetectThreshold: 0.7,
      removeNulls: true,
      removeInvalid: true,
      validateTypes: true,
      parseNumbers: true,
      parseDates: true,
      trimStrings: true,
      filter: () => true,
      sort: undefined,
      limit: undefined,
      offset: 0,
      ...config
    }
  }
  
  /**
   * 處理資料的主要方法
   */
  process(rawData: any[]): DataProcessorResult {
    const errors: string[] = []
    const warnings: string[] = []
    
    if (!Array.isArray(rawData)) {
      errors.push('Input data must be an array')
      return this.createErrorResult(errors)
    }
    
    if (rawData.length === 0) {
      warnings.push('Input data is empty')
      return this.createEmptyResult(warnings)
    }
    
    try {
      // 1. 分析資料結構
      const fieldInfo = this.analyzeFields(rawData)
      
      // 2. 確定最終映射策略
      const resolvedMapping = this.resolveMapping(rawData, fieldInfo)
      
      // 3. 處理和轉換資料
      let processedData = this.transformData(rawData, resolvedMapping, errors, warnings)
      
      // 4. 應用過濾條件
      if (this.config.filter) {
        processedData = processedData.filter((d, i) => {
          try {
            return this.config.filter!(d, i)
          } catch (e) {
            warnings.push(`Filter function error at index ${i}: ${e}`)
            return true
          }
        })
      }
      
      // 5. 排序
      if (this.config.sort) {
        processedData = this.sortData(processedData, this.config.sort)
      }
      
      // 6. 分頁
      if (this.config.offset || this.config.limit) {
        const start = this.config.offset || 0
        const end = this.config.limit ? start + this.config.limit : undefined
        processedData = processedData.slice(start, end)
      }
      
      // 7. 生成統計資訊
      const statistics = this.generateStatistics(rawData, processedData, fieldInfo)
      
      return {
        data: processedData,
        mapping: resolvedMapping,
        errors,
        warnings,
        statistics
      }
      
    } catch (error) {
      errors.push(`Data processing failed: ${error}`)
      return this.createErrorResult(errors)
    }
  }
  
  /**
   * 分析欄位資訊
   */
  private analyzeFields(data: any[]): Record<string, FieldInfo> {
    const fieldInfo: Record<string, FieldInfo> = {}
    
    if (data.length === 0) return fieldInfo
    
    // 獲取所有可能的欄位
    const allFields = new Set<string>()
    data.slice(0, 10).forEach(row => {
      if (row && typeof row === 'object') {
        Object.keys(row).forEach(key => allFields.add(key))
      }
    })
    
    // 分析每個欄位
    allFields.forEach(field => {
      const values = data.map(d => d?.[field]).filter(v => v != null)
      
      if (values.length === 0) {
        fieldInfo[field] = {
          name: field,
          type: 'string',
          confidence: 0,
          samples: [],
          uniqueCount: 0,
          nullCount: data.length
        }
        return
      }
      
      const typeInfo = detectColumnType(values)
      const uniqueValues = new Set(values)
      
      fieldInfo[field] = {
        name: field,
        type: typeInfo.type,
        confidence: typeInfo.confidence,
        samples: typeInfo.samples,
        uniqueCount: uniqueValues.size,
        nullCount: data.length - values.length
      }
    })
    
    return fieldInfo
  }
  
  /**
   * 解析最終映射策略
   */
  private resolveMapping(data: any[], fieldInfo: Record<string, FieldInfo>): Required<DataMapping> {
    const resolved: Required<DataMapping> = {
      x: '',
      y: '',
      color: '',
      size: '',
      category: '',
      value: ''
    }
    
    // 優先級 1: 明確的 mapping 配置
    if (this.config.mapping) {
      Object.entries(this.config.mapping).forEach(([key, value]) => {
        if (value !== undefined) {
          resolved[key as keyof DataMapping] = value as any
        }
      })
    }
    
    // 優先級 2: accessor 函數
    if (this.config.accessors) {
      Object.entries(this.config.accessors).forEach(([key, accessor]) => {
        if (accessor && (!resolved[key as keyof DataMapping] || resolved[key as keyof DataMapping] === '')) {
          resolved[key as keyof DataMapping] = accessor as any
        }
      })
    }
    
    // 優先級 3: 欄位鍵名
    if (this.config.keys) {
      Object.entries(this.config.keys).forEach(([key, fieldName]) => {
        if (fieldName && (!resolved[key as keyof DataMapping] || resolved[key as keyof DataMapping] === '')) {
          resolved[key as keyof DataMapping] = fieldName as any
        }
      })
    }
    
    // 優先級 4: 自動偵測
    if (this.config.autoDetect) {
      const autoMapping = this.autoDetectMapping(fieldInfo)
      Object.entries(autoMapping).forEach(([key, value]) => {
        if (value && (!resolved[key as keyof DataMapping] || resolved[key as keyof DataMapping] === '')) {
          resolved[key as keyof DataMapping] = value as any
        }
      })
    }
    
    return resolved
  }
  
  /**
   * 自動偵測映射
   */
  private autoDetectMapping(fieldInfo: Record<string, FieldInfo>): Partial<DataMapping> {
    const mapping: Partial<DataMapping> = {}
    const fields = Object.values(fieldInfo)
    
    // 尋找數字欄位作為 Y 軸
    const numericFields = fields
      .filter(f => f.type === 'number' && f.confidence >= this.config.autoDetectThreshold)
      .sort((a, b) => b.confidence - a.confidence)
    
    // 尋找日期欄位作為 X 軸
    const dateFields = fields
      .filter(f => f.type === 'date' && f.confidence >= this.config.autoDetectThreshold)
      .sort((a, b) => b.confidence - a.confidence)
    
    // 尋找分類欄位
    const categoryFields = fields
      .filter(f => f.type === 'string' && f.uniqueCount > 1 && f.uniqueCount <= 20)
      .sort((a, b) => a.uniqueCount - b.uniqueCount)
    
    // 設定 X 軸：優先日期，然後分類，最後數字
    if (dateFields.length > 0) {
      mapping.x = dateFields[0].name
    } else if (categoryFields.length > 0) {
      mapping.x = categoryFields[0].name
    } else if (numericFields.length > 1) {
      mapping.x = numericFields[1].name
    }
    
    // 設定 Y 軸：數字欄位
    if (numericFields.length > 0) {
      mapping.y = numericFields[0].name
    }
    
    // 設定顏色：分類欄位（如果有剩餘的且與 X 軸不同）
    if (categoryFields.length > 1 && categoryFields[1].name !== mapping.x) {
      mapping.color = categoryFields[1].name
    } else if (categoryFields.length > 0 && categoryFields[0].name !== mapping.x) {
      mapping.color = categoryFields[0].name
    }
    
    // 設定大小：第二個數字欄位
    if (numericFields.length > 1 && numericFields[1].name !== mapping.x) {
      mapping.size = numericFields[1].name
    }
    
    return mapping
  }
  
  /**
   * 轉換資料
   */
  private transformData(
    data: any[], 
    mapping: Required<DataMapping>, 
    errors: string[], 
    warnings: string[]
  ): ProcessedDataPoint[] {
    const transformed: ProcessedDataPoint[] = []
    
    data.forEach((row, index) => {
      if (!row || typeof row !== 'object') {
        if (this.config.removeInvalid) {
          warnings.push(`Skipped invalid row at index ${index}`)
          return
        }
      }
      
      const processedPoint: ProcessedDataPoint = {
        x: undefined,
        y: undefined,
        originalData: row,
        index
      }
      
      // 處理每個映射欄位
      Object.entries(mapping).forEach(([key, accessor]) => {
        if (!accessor) return
        
        try {
          let value: any
          
          if (typeof accessor === 'function') {
            value = accessor(row)
          } else if (typeof accessor === 'string') {
            value = row[accessor]
          }
          
          // 資料清理和轉換
          value = this.cleanValue(value, key, errors, warnings)
          
          processedPoint[key] = value
        } catch (error) {
          warnings.push(`Failed to process ${key} at index ${index}: ${error}`)
          processedPoint[key] = undefined
        }
      })
      
      // 檢查必要欄位
      const hasValidData = processedPoint.x !== undefined || processedPoint.y !== undefined
      
      if (!hasValidData && this.config.removeInvalid) {
        warnings.push(`Skipped row with no valid data at index ${index}`)
        return
      }
      
      transformed.push(processedPoint)
    })
    
    return transformed
  }
  
  /**
   * 清理和轉換值
   */
  private cleanValue(value: any, field: string, errors: string[], warnings: string[]): any {
    if (value == null) {
      return this.config.removeNulls ? undefined : null
    }
    
    // 字串清理
    if (typeof value === 'string' && this.config.trimStrings) {
      value = value.trim()
      if (value === '') {
        return this.config.removeNulls ? undefined : null
      }
    }
    
    // 數字解析
    if (this.config.parseNumbers) {
      if (typeof value === 'number' && !isNaN(value)) {
        return value
      }
      if (typeof value === 'string') {
        const numValue = this.parseNumber(value)
        if (numValue !== null) {
          return numValue
        }
      }
    }
    
    // 日期解析
    if (this.config.parseDates && (typeof value === 'string' || typeof value === 'number')) {
      const dateValue = this.parseDate(value)
      if (dateValue !== null) {
        return dateValue
      }
    }
    
    return value
  }
  
  /**
   * 解析數字
   */
  private parseNumber(value: string): number | null {
    if (typeof value !== 'string') return null
    
    // 移除常見的非數字字符
    let cleaned = value.replace(/[,$%]/g, '')
    
    // 處理貨幣符號
    if (cleaned.startsWith('$')) {
      cleaned = cleaned.substring(1)
    }
    
    const num = parseFloat(cleaned)
    return isNaN(num) ? null : num
  }
  
  /**
   * 解析日期
   */
  private parseDate(value: string | number): Date | null {
    try {
      const date = new Date(value)
      return isNaN(date.getTime()) ? null : date
    } catch {
      return null
    }
  }
  
  /**
   * 排序資料
   */
  private sortData(data: ProcessedDataPoint[], sort: { field: string; direction: 'asc' | 'desc' }): ProcessedDataPoint[] {
    return [...data].sort((a, b) => {
      const aVal = a[sort.field]
      const bVal = b[sort.field]
      
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return sort.direction === 'asc' ? 1 : -1
      if (bVal == null) return sort.direction === 'asc' ? -1 : 1
      
      let comparison = 0
      if (aVal < bVal) comparison = -1
      else if (aVal > bVal) comparison = 1
      
      return sort.direction === 'asc' ? comparison : -comparison
    })
  }
  
  /**
   * 生成統計資訊
   */
  private generateStatistics(
    rawData: any[], 
    processedData: ProcessedDataPoint[], 
    fieldInfo: Record<string, FieldInfo>
  ) {
    return {
      total: rawData.length,
      valid: processedData.length,
      invalid: rawData.length - processedData.length,
      nulls: rawData.filter(d => d == null).length,
      fields: fieldInfo
    }
  }
  
  /**
   * 創建錯誤結果
   */
  private createErrorResult(errors: string[]): DataProcessorResult {
    return {
      data: [],
      mapping: { x: '', y: '', color: '', size: '', category: '', value: '' },
      errors,
      warnings: [],
      statistics: {
        total: 0,
        valid: 0,
        invalid: 0,
        nulls: 0,
        fields: {}
      }
    }
  }
  
  /**
   * 創建空結果
   */
  private createEmptyResult(warnings: string[]): DataProcessorResult {
    return {
      data: [],
      mapping: { x: '', y: '', color: '', size: '', category: '', value: '' },
      errors: [],
      warnings,
      statistics: {
        total: 0,
        valid: 0,
        invalid: 0,
        nulls: 0,
        fields: {}
      }
    }
  }
}

/**
 * 便利函數：快速處理資料
 */
export function processData(
  data: any[], 
  config?: DataProcessorConfig
): DataProcessorResult {
  const processor = new DataProcessor(config)
  return processor.process(data)
}

/**
 * Hook：React 中使用資料處理器
 */
import { useMemo } from 'react'

export function useDataProcessor(
  data: any[],
  config: DataProcessorConfig = {}
): DataProcessorResult {
  return useMemo(() => {
    return processData(data, config)
  }, [data, config])
}