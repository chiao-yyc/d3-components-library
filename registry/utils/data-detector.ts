import { DataType, SuggestedMapping, ChartSuggestion } from '../types'

export interface DataTypeInfo {
  type: 'number' | 'string' | 'date' | 'boolean'
  confidence: number
  samples: any[]
  nullCount: number
  subType?: string // 例如: 'integer', 'decimal', 'currency', 'percentage', 'iso-date', 'timestamp'
  format?: string  // 例如: 'YYYY-MM-DD', '$#,##0.00', '#.##%'
}

export interface EnhancedDataTypeInfo extends DataTypeInfo {
  patterns: string[]
  uniqueCount: number
  valueDistribution: Record<string, number>
}

// 日期格式模式
const DATE_PATTERNS = [
  // ISO 格式
  { pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, format: 'ISO DateTime', subType: 'iso-datetime' },
  { pattern: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/, format: 'YYYY-MM-DD HH:mm:ss', subType: 'datetime' },
  { pattern: /^\d{4}-\d{2}-\d{2}/, format: 'YYYY-MM-DD', subType: 'iso-date' },
  
  // 美式格式
  { pattern: /^\d{1,2}\/\d{1,2}\/\d{4}/, format: 'MM/DD/YYYY', subType: 'us-date' },
  { pattern: /^\d{1,2}-\d{1,2}-\d{4}/, format: 'MM-DD-YYYY', subType: 'us-date-dash' },
  
  // 歐式格式  
  { pattern: /^\d{1,2}\.\d{1,2}\.\d{4}/, format: 'DD.MM.YYYY', subType: 'eu-date' },
  { pattern: /^\d{1,2}\/\d{1,2}\/\d{4}/, format: 'DD/MM/YYYY', subType: 'eu-date-slash' },
  
  // 中文格式
  { pattern: /^\d{4}年\d{1,2}月\d{1,2}日/, format: 'YYYY年MM月DD日', subType: 'cn-date' },
  { pattern: /^\d{4}年\d{1,2}月/, format: 'YYYY年MM月', subType: 'cn-month' },
  
  // Unix timestamp
  { pattern: /^\d{10}$/, format: 'Unix Timestamp (seconds)', subType: 'unix-seconds' },
  { pattern: /^\d{13}$/, format: 'Unix Timestamp (milliseconds)', subType: 'unix-milliseconds' },
  
  // 相對日期
  { pattern: /^\d{4}-Q[1-4]$/, format: 'YYYY-Q#', subType: 'quarter' },
  { pattern: /^\d{4}-W\d{2}$/, format: 'YYYY-W##', subType: 'week' },
  
  // 月份名稱
  { pattern: /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/i, format: 'MMM YYYY', subType: 'month-name' },
  { pattern: /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i, format: 'MMMM DD, YYYY', subType: 'full-month-name' }
]

// 數值格式模式
const NUMBER_PATTERNS = [
  { pattern: /^\$[\d,]+\.?\d*$/, format: 'Currency ($)', subType: 'currency-usd' },
  { pattern: /^[\d,]+\.?\d*%$/, format: 'Percentage (%)', subType: 'percentage' },
  { pattern: /^[\d,]+\.\d{2}$/, format: 'Decimal (2 places)', subType: 'decimal-2' },
  { pattern: /^[\d,]+$/, format: 'Integer with commas', subType: 'integer-comma' },
  { pattern: /^\d+$/, format: 'Integer', subType: 'integer' },
  { pattern: /^\d*\.\d+$/, format: 'Decimal', subType: 'decimal' },
  { pattern: /^-?\d+\.?\d*[eE][+-]?\d+$/, format: 'Scientific notation', subType: 'scientific' }
]

export function detectColumnType(values: any[]): DataTypeInfo {
  const nonNullValues = values.filter(v => v != null)
  const nullCount = values.length - nonNullValues.length
  
  if (nonNullValues.length === 0) {
    return {
      type: 'string',
      confidence: 0.5,
      samples: [],
      nullCount
    }
  }
  
  // 取樣本資料
  const samples = nonNullValues.slice(0, Math.min(5, nonNullValues.length))
  
  // 增強的型別檢測
  const dateInfo = detectDateType(nonNullValues)
  const numberInfo = detectNumberType(nonNullValues)
  const booleanInfo = detectBooleanType(nonNullValues)
  
  // 比較各類型的信心度，選擇最高的
  const typeOptions = [dateInfo, numberInfo, booleanInfo].filter(info => info.confidence > 0)
  
  if (typeOptions.length === 0) {
    return {
      type: 'string',
      confidence: 0.9,
      samples,
      nullCount,
      subType: 'text'
    }
  }
  
  // 選擇信心度最高的類型
  const bestType = typeOptions.reduce((best, current) => 
    current.confidence > best.confidence ? current : best
  )
  
  return {
    ...bestType,
    samples,
    nullCount
  }
}

/**
 * 增強的日期類型檢測
 */
function detectDateType(values: any[]): Partial<DataTypeInfo> {
  if (values.length === 0) return { type: 'date', confidence: 0 }
  
  let matchCount = 0
  let detectedFormat = ''
  let detectedSubType = ''
  
  for (const value of values) {
    // 已經是 Date 物件
    if (value instanceof Date && !isNaN(value.getTime())) {
      matchCount++
      continue
    }
    
    // 字串格式檢測
    if (typeof value === 'string') {
      const trimmed = value.trim()
      
      // 檢查各種日期格式
      for (const { pattern, format, subType } of DATE_PATTERNS) {
        if (pattern.test(trimmed)) {
          const testDate = new Date(value)
          if (!isNaN(testDate.getTime())) {
            matchCount++
            if (!detectedFormat) {
              detectedFormat = format
              detectedSubType = subType
            }
            break
          }
        }
      }
    }
    
    // 數字類型的時間戳檢測
    if (typeof value === 'number') {
      // Unix timestamp 範圍檢查 (1970-2100)
      if ((value > 0 && value < 4102444800) || (value > 946684800000 && value < 4102444800000)) {
        const testDate = new Date(value > 4102444800 ? value : value * 1000)
        if (!isNaN(testDate.getTime())) {
          matchCount++
          if (!detectedFormat) {
            detectedFormat = value > 4102444800 ? 'Unix Timestamp (milliseconds)' : 'Unix Timestamp (seconds)'
            detectedSubType = value > 4102444800 ? 'unix-milliseconds' : 'unix-seconds'
          }
        }
      }
    }
  }
  
  const confidence = matchCount / values.length
  
  return {
    type: 'date',
    confidence,
    format: detectedFormat,
    subType: detectedSubType
  }
}

/**
 * 增強的數值類型檢測
 */
function detectNumberType(values: any[]): Partial<DataTypeInfo> {
  if (values.length === 0) return { type: 'number', confidence: 0 }
  
  let matchCount = 0
  let detectedFormat = ''
  let detectedSubType = ''
  
  for (const value of values) {
    // 已經是數字
    if (typeof value === 'number' && !isNaN(value)) {
      matchCount++
      if (!detectedSubType) {
        detectedSubType = Number.isInteger(value) ? 'integer' : 'decimal'
      }
      continue
    }
    
    // 字串格式檢測
    if (typeof value === 'string') {
      const trimmed = value.trim()
      
      // 檢查各種數值格式
      for (const { pattern, format, subType } of NUMBER_PATTERNS) {
        if (pattern.test(trimmed)) {
          // 嘗試解析為數字
          let cleanValue = trimmed.replace(/[,$%]/g, '')
          if (trimmed.startsWith('$')) cleanValue = cleanValue.substring(1)
          
          const numValue = parseFloat(cleanValue)
          if (!isNaN(numValue)) {
            matchCount++
            if (!detectedFormat) {
              detectedFormat = format
              detectedSubType = subType
            }
            break
          }
        }
      }
      
      // 基本數字檢測
      if (!detectedFormat && !isNaN(Number(trimmed))) {
        matchCount++
        if (!detectedSubType) {
          detectedSubType = trimmed.includes('.') ? 'decimal' : 'integer'
        }
      }
    }
  }
  
  const confidence = matchCount / values.length
  
  return {
    type: 'number',
    confidence,
    format: detectedFormat,
    subType: detectedSubType
  }
}

/**
 * 增強的布林類型檢測
 */
function detectBooleanType(values: any[]): Partial<DataTypeInfo> {
  if (values.length === 0) return { type: 'boolean', confidence: 0 }
  
  let matchCount = 0
  
  const booleanPatterns = [
    /^(true|false)$/i,
    /^(yes|no)$/i,
    /^(是|否)$/,
    /^(y|n)$/i,
    /^(1|0)$/,
    /^(on|off)$/i,
    /^(enabled|disabled)$/i
  ]
  
  for (const value of values) {
    // 已經是布林值
    if (typeof value === 'boolean') {
      matchCount++
      continue
    }
    
    // 數字 0/1
    if ((value === 0 || value === 1) && typeof value === 'number') {
      matchCount++
      continue
    }
    
    // 字串格式檢測
    if (typeof value === 'string') {
      const trimmed = value.trim()
      
      for (const pattern of booleanPatterns) {
        if (pattern.test(trimmed)) {
          matchCount++
          break
        }
      }
    }
  }
  
  const confidence = matchCount / values.length
  
  return {
    type: 'boolean',
    confidence,
    subType: 'boolean'
  }
}

export function detectDataType(values: any[]): DataType {
  return detectColumnType(values).type
}

export function suggestMapping(data: any[]): SuggestedMapping[] {
  if (!data.length) return []
  
  const suggestions: SuggestedMapping[] = []
  
  // 支援巢狀物件結構
  const allFields = getAllNestedFields(data[0])
  
  allFields.forEach(field => {
    const values = data.map(d => getNestedValue(d, field)).filter(v => v != null)
    
    if (values.length === 0) return
    
    const typeInfo = detectColumnType(values)
    const fieldAnalysis = analyzeFieldCharacteristics(field, values, typeInfo)
    
    let suggested: 'x' | 'y' | 'color' | 'size' = 'x'
    let confidence = 0.5
    
    // 基於型別和欄位特徵的建議
    if (typeInfo.type === 'number') {
      if (fieldAnalysis.isValueField) {
        suggested = 'y'
        confidence = 0.9
      } else if (fieldAnalysis.isSizeField) {
        suggested = 'size'
        confidence = 0.8
      } else if (fieldAnalysis.isIndexField) {
        suggested = 'x'
        confidence = 0.7
      } else {
        suggested = 'y'
        confidence = 0.6
      }
    } else if (typeInfo.type === 'date') {
      suggested = 'x'
      confidence = 0.95
    } else if (typeInfo.type === 'string') {
      if (fieldAnalysis.isCategoryField) {
        suggested = 'color'
        confidence = 0.8
      } else if (fieldAnalysis.isLabelField) {
        suggested = 'x'
        confidence = 0.7
      } else {
        suggested = 'x'
        confidence = 0.5
      }
    } else if (typeInfo.type === 'boolean') {
      suggested = 'color'
      confidence = 0.6
    }
    
    // 根據資料分佈調整信心度
    confidence *= fieldAnalysis.distributionScore
    
    // 根據欄位深度調整信心度（巢狀欄位可靠性較低）
    const depth = field.split('.').length
    if (depth > 1) {
      confidence *= 0.9 ** (depth - 1)
    }
    
    suggestions.push({
      field,
      type: typeInfo.type,
      confidence: Math.min(0.95, Math.max(0.1, confidence)),
      suggested
    })
  })
  
  return suggestions.sort((a, b) => b.confidence - a.confidence)
}

/**
 * 獲取所有巢狀欄位路徑
 */
function getAllNestedFields(obj: any, prefix = '', maxDepth = 4): string[] {
  if (maxDepth <= 0 || obj == null || typeof obj !== 'object') {
    return []
  }
  
  const fields: string[] = []
  
  if (Array.isArray(obj)) {
    // 處理陣列：只檢查第一個元素
    if (obj.length > 0 && typeof obj[0] === 'object') {
      return getAllNestedFields(obj[0], prefix, maxDepth)
    }
    return []
  }
  
  Object.keys(obj).forEach(key => {
    const currentPath = prefix ? `${prefix}.${key}` : key
    const value = obj[key]
    
    // 添加當前欄位
    fields.push(currentPath)
    
    // 如果值是物件且不是 Date，遞迴處理
    if (value && typeof value === 'object' && !(value instanceof Date) && !Array.isArray(value)) {
      fields.push(...getAllNestedFields(value, currentPath, maxDepth - 1))
    }
  })
  
  return fields
}

/**
 * 獲取巢狀值
 */
function getNestedValue(obj: any, path: string): any {
  const keys = path.split('.')
  let result = obj
  
  for (const key of keys) {
    if (result == null || typeof result !== 'object') return null
    result = result[key]
  }
  
  return result
}

/**
 * 分析欄位特徵
 */
function analyzeFieldCharacteristics(field: string, values: any[], typeInfo: DataTypeInfo): {
  isValueField: boolean
  isSizeField: boolean
  isIndexField: boolean
  isCategoryField: boolean
  isLabelField: boolean
  distributionScore: number
} {
  const fieldLower = field.toLowerCase()
  
  // 欄位名稱模式分析
  const valueKeywords = ['value', 'amount', 'price', 'cost', 'revenue', 'sales', 'count', 'total', 'sum', 'avg', 'mean']
  const sizeKeywords = ['size', 'radius', 'width', 'height', 'length', 'area', 'volume']
  const indexKeywords = ['index', 'id', 'key', 'position', 'rank', 'order']
  const categoryKeywords = ['category', 'type', 'class', 'group', 'status', 'state', 'color']
  const labelKeywords = ['name', 'title', 'label', 'description', 'text']
  
  const isValueField = valueKeywords.some(kw => fieldLower.includes(kw))
  const isSizeField = sizeKeywords.some(kw => fieldLower.includes(kw))
  const isIndexField = indexKeywords.some(kw => fieldLower.includes(kw))
  const isCategoryField = categoryKeywords.some(kw => fieldLower.includes(kw))
  const isLabelField = labelKeywords.some(kw => fieldLower.includes(kw))
  
  // 資料分佈分析
  const distributionScore = analyzeDataDistribution(values, typeInfo.type)
  
  return {
    isValueField,
    isSizeField,
    isIndexField,
    isCategoryField,
    isLabelField,
    distributionScore
  }
}

/**
 * 分析資料分佈特徵
 */
function analyzeDataDistribution(values: any[], type: DataType): number {
  if (values.length === 0) return 0.5
  
  const uniqueValues = new Set(values)
  const uniqueRatio = uniqueValues.size / values.length
  
  let score = 0.5
  
  if (type === 'number') {
    // 數值資料：變異性高的更適合作為主要資料
    const numbers = values.map(v => Number(v)).filter(n => !isNaN(n))
    if (numbers.length > 0) {
      const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length
      const variance = numbers.reduce((sum, n) => sum + Math.pow(n - mean, 2), 0) / numbers.length
      const cv = Math.sqrt(variance) / mean // 變異係數
      
      // 變異係數在 0.1-2 之間比較理想
      if (cv > 0.05 && cv < 3) {
        score += 0.3
      }
      
      // 數值範圍合理性
      const range = Math.max(...numbers) - Math.min(...numbers)
      if (range > 0) {
        score += 0.2
      }
    }
  } else if (type === 'string') {
    // 字串資料：適度的類別數量
    if (uniqueRatio > 0.1 && uniqueRatio < 0.8) {
      score += 0.3
    }
    
    // 類別數量合理性（2-20個類別比較適合視覺化）
    if (uniqueValues.size >= 2 && uniqueValues.size <= 20) {
      score += 0.2
    }
  } else if (type === 'date') {
    // 日期資料：時間跨度和密度
    const dates = values.map(v => new Date(v)).filter(d => !isNaN(d.getTime()))
    if (dates.length > 1) {
      const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime())
      const timeSpan = sortedDates[sortedDates.length - 1].getTime() - sortedDates[0].getTime()
      
      // 有合理的時間跨度
      if (timeSpan > 24 * 60 * 60 * 1000) { // 超過1天
        score += 0.4
      }
    }
  }
  
  return Math.min(1, Math.max(0.1, score))
}

export function suggestChartType(data: any[]): ChartSuggestion[] {
  if (!data.length) return []
  
  const suggestions: ChartSuggestion[] = []
  const firstRow = data[0]
  const fields = Object.keys(firstRow)
  
  // 分析資料結構
  const numericFields = fields.filter(field => {
    const values = data.map(d => d[field])
    const typeInfo = detectColumnType(values)
    return typeInfo.type === 'number'
  })
  
  const categoricalFields = fields.filter(field => {
    const values = data.map(d => d[field])
    const typeInfo = detectColumnType(values)
    return typeInfo.type === 'string'
  })
  
  const dateFields = fields.filter(field => {
    const values = data.map(d => d[field])
    const typeInfo = detectColumnType(values)
    return typeInfo.type === 'date'
  })
  
  // 長條圖建議
  if (categoricalFields.length >= 1 && numericFields.length >= 1) {
    suggestions.push({
      type: 'bar-chart',
      confidence: 0.9,
      reason: '適合顯示類別資料的數值比較',
      suggestedProps: {
        xKey: categoricalFields[0],
        yKey: numericFields[0]
      }
    })
  }
  
  // 折線圖建議
  if (dateFields.length >= 1 && numericFields.length >= 1) {
    suggestions.push({
      type: 'line-chart',
      confidence: 0.9,
      reason: '適合顯示時間序列資料的變化趨勢',
      suggestedProps: {
        xKey: dateFields[0],
        yKey: numericFields[0]
      }
    })
  }
  
  // 散佈圖建議
  if (numericFields.length >= 2) {
    suggestions.push({
      type: 'scatter-plot',
      confidence: 0.8,
      reason: '適合顯示兩個數值變數的關係',
      suggestedProps: {
        xKey: numericFields[0],
        yKey: numericFields[1],
        colorKey: categoricalFields[0]
      }
    })
  }
  
  // 圓餅圖建議
  if (categoricalFields.length >= 1 && numericFields.length >= 1) {
    const categoryValues = data.map(d => d[categoricalFields[0]])
    const uniqueCategories = [...new Set(categoryValues)]
    
    if (uniqueCategories.length <= 8) {
      suggestions.push({
        type: 'pie-chart',
        confidence: 0.7,
        reason: '適合顯示類別資料的比例分佈',
        suggestedProps: {
          categoryKey: categoricalFields[0],
          valueKey: numericFields[0]
        }
      })
    }
  }
  
  return suggestions.sort((a, b) => b.confidence - a.confidence)
}