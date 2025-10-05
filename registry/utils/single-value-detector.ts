/**
 * 單一值類型檢測器 - 用於測試和演示
 * 基於 DataProcessor 的邏輯，但針對單一值進行分析
 */

export interface SingleValueAnalysis {
  value: unknown
  detectedType: 'number' | 'string' | 'date' | 'boolean'
  confidence: number
  format?: string
  subType?: string
  suggestions: string[]
  reasoning: string
}

// 重用 data-detector 中的模式
const DATE_PATTERNS = [
  { pattern: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, format: 'ISO DateTime', subType: 'iso-datetime' },
  { pattern: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/, format: 'YYYY-MM-DD HH:mm:ss', subType: 'datetime' },
  { pattern: /^\d{4}-\d{2}-\d{2}/, format: 'YYYY-MM-DD', subType: 'iso-date' },
  { pattern: /^\d{1,2}\/\d{1,2}\/\d{4}/, format: 'MM/DD/YYYY', subType: 'us-date' },
  { pattern: /^\d{1,2}-\d{1,2}-\d{4}/, format: 'MM-DD-YYYY', subType: 'us-date-dash' },
  { pattern: /^\d{1,2}\.\d{1,2}\.\d{4}/, format: 'DD.MM.YYYY', subType: 'eu-date' },
  { pattern: /^\d{4}年\d{1,2}月\d{1,2}日/, format: 'YYYY年MM月DD日', subType: 'cn-date' },
  { pattern: /^\d{10}$/, format: 'Unix Timestamp (seconds)', subType: 'unix-seconds' },
  { pattern: /^\d{13}$/, format: 'Unix Timestamp (milliseconds)', subType: 'unix-milliseconds' }
]

const NUMBER_PATTERNS = [
  { pattern: /^\$[\d,]+\.?\d*$/, format: 'Currency ($)', subType: 'currency-usd' },
  { pattern: /^[\d,]+\.?\d*%$/, format: 'Percentage (%)', subType: 'percentage' },
  { pattern: /^[\d,]+\.\d{2}$/, format: 'Decimal (2 places)', subType: 'decimal-2' },
  { pattern: /^[\d,]+$/, format: 'Integer with commas', subType: 'integer-comma' },
  { pattern: /^\d+$/, format: 'Integer', subType: 'integer' },
  { pattern: /^\d*\.\d+$/, format: 'Decimal', subType: 'decimal' },
  { pattern: /^-?\d+\.?\d*[eE][+-]?\d+$/, format: 'Scientific notation', subType: 'scientific' }
]

const BOOLEAN_PATTERNS = [
  /^(true|false)$/i,
  /^(yes|no)$/i,
  /^(是|否)$/,
  /^(y|n)$/i,
  /^(1|0)$/,
  /^(on|off)$/i,
  /^(enabled|disabled)$/i
]

/**
 * 分析單一值的可能類型
 */
export function analyzeSingleValue(value: unknown): SingleValueAnalysis {
  const originalValue = value
  // const ___reasoning = ''

  // 如果是 null 或 undefined
  if (value == null) {
    return {
      value: originalValue,
      detectedType: 'string',
      confidence: 0.1,
      suggestions: ['這是空值，無法確定類型'],
      reasoning: '輸入值為空，預設為字符串類型'
    }
  }

  // 如果已經是特定類型
  if (typeof value === 'number') {
    return analyzeNumberValue(originalValue, value)
  }

  if (typeof value === 'boolean') {
    return {
      value: originalValue,
      detectedType: 'boolean',
      confidence: 1.0,
      subType: 'boolean',
      suggestions: ['可用於分類、篩選條件'],
      reasoning: '這是一個標準的布林值'
    }
  }

  if (value instanceof Date) {
    return {
      value: originalValue,
      detectedType: 'date',
      confidence: 1.0,
      subType: 'date-object',
      suggestions: ['適合作為時間軸、日期篩選'],
      reasoning: '這是一個 Date 物件'
    }
  }

  // 字符串分析
  if (typeof value === 'string') {
    return analyzeStringValue(originalValue, value.trim())
  }

  // 其他類型
  return {
    value: originalValue,
    detectedType: 'string',
    confidence: 0.5,
    suggestions: ['轉換為字符串處理'],
    reasoning: `未知類型 (${typeof value})，建議轉為字符串`
  }
}

function analyzeNumberValue(originalValue: any, value: number): SingleValueAnalysis {
  const suggestions: string[] = []
  let reasoning = ''
  const subType = Number.isInteger(value) ? 'integer' : 'decimal'

  if (isNaN(value)) {
    return {
      value: originalValue,
      detectedType: 'string',
      confidence: 0.1,
      suggestions: ['不是有效的數字，考慮作為字符串'],
      reasoning: 'NaN 值，無法作為數字使用'
    }
  }

  // 檢查是否可能是時間戳
  if (Number.isInteger(value)) {
    if (value >= 946684800 && value <= 4102444800) {
      suggestions.push('可能是 Unix 時間戳（秒）')
      reasoning += '數值範圍符合 Unix 時間戳（秒級）；'
    }
    if (value >= 946684800000 && value <= 4102444800000) {
      suggestions.push('可能是 Unix 時間戳（毫秒）')
      reasoning += '數值範圍符合 Unix 時間戳（毫秒級）；'
    }
  }

  // 數值特徵分析
  if (value === 0 || value === 1) {
    suggestions.push('可能是布林值的數值表示')
  }
  
  if (value > 0 && value < 1) {
    suggestions.push('可能是百分比（小數形式）')
  }

  if (Math.abs(value) > 1000000) {
    suggestions.push('大數值，考慮使用科學記號顯示')
  }

  suggestions.push('適合作為數值軸、大小編碼')

  return {
    value: originalValue,
    detectedType: 'number',
    confidence: 1.0,
    subType,
    suggestions,
    reasoning: reasoning || '這是一個數值'
  }
}

function analyzeStringValue(originalValue: any, value: string): SingleValueAnalysis {
  const suggestions: string[] = []
  let reasoning = ''
  let detectedType: 'number' | 'string' | 'date' | 'boolean' = 'string'
  let confidence = 0.5
  let format = ''
  let subType = ''

  if (value === '') {
    return {
      value: originalValue,
      detectedType: 'string',
      confidence: 0.1,
      suggestions: ['空字符串，無法確定類型'],
      reasoning: '空字符串'
    }
  }

  // 1. 日期格式檢測
  for (const { pattern, format: fmt, subType: sub } of DATE_PATTERNS) {
    if (pattern.test(value)) {
      const testDate = new Date(value)
      if (!isNaN(testDate.getTime())) {
        detectedType = 'date'
        confidence = 0.9
        format = fmt
        subType = sub
        suggestions.push('適合作為時間軸')
        suggestions.push(`格式：${fmt}`)
        reasoning = `符合日期格式 ${fmt}`
        
        return {
          value: originalValue,
          detectedType,
          confidence,
          format,
          subType,
          suggestions,
          reasoning
        }
      }
    }
  }

  // 2. 數字格式檢測
  for (const { pattern, format: fmt, subType: sub } of NUMBER_PATTERNS) {
    if (pattern.test(value)) {
      let cleanValue = value.replace(/[,$%]/g, '')
      if (value.startsWith('$')) cleanValue = cleanValue.substring(1)
      
      const numValue = parseFloat(cleanValue)
      if (!isNaN(numValue)) {
        detectedType = 'number'
        confidence = 0.9
        format = fmt
        subType = sub
        suggestions.push('可轉換為數字使用')
        suggestions.push(`格式：${fmt}`)
        suggestions.push(`數值：${numValue}`)
        reasoning = `符合數字格式 ${fmt}`
        
        return {
          value: originalValue,
          detectedType,
          confidence,
          format,
          subType,
          suggestions,
          reasoning
        }
      }
    }
  }

  // 3. 布林格式檢測
  for (const pattern of BOOLEAN_PATTERNS) {
    if (pattern.test(value)) {
      detectedType = 'boolean'
      confidence = 0.8
      subType = 'boolean-string'
      suggestions.push('可轉換為布林值')
      suggestions.push('適合用於分類、篩選')
      reasoning = '符合布林值的字符串表示'
      
      return {
        value: originalValue,
        detectedType,
        confidence,
        subType,
        suggestions,
        reasoning
      }
    }
  }

  // 4. 基本數字檢測
  const numValue = Number(value)
  if (!isNaN(numValue)) {
    detectedType = 'number'
    confidence = 0.7
    subType = value.includes('.') ? 'decimal' : 'integer'
    suggestions.push('可轉換為數字')
    suggestions.push(`數值：${numValue}`)
    reasoning = '可以成功轉換為數字'
    
    return {
      value: originalValue,
      detectedType,
      confidence,
      subType,
      suggestions,
      reasoning
    }
  }

  // 5. 純文字分析
  confidence = 0.6
  subType = 'text'
  
  // 分析文字特徵
  if (value.length <= 20 && /^[a-zA-Z\u4e00-\u9fa5]+$/.test(value)) {
    suggestions.push('適合作為分類標籤')
    reasoning = '短文字，適合分類'
  } else if (value.length > 50) {
    suggestions.push('長文字，適合作為描述或標籤')
    reasoning = '長文字內容'
  } else {
    suggestions.push('適合作為標籤或分類')
    reasoning = '一般文字內容'
  }

  return {
    value: originalValue,
    detectedType,
    confidence,
    subType,
    suggestions,
    reasoning
  }
}

/**
 * 批次分析多個值（模擬 DataProcessor 的行為）
 */
export function analyzeBatchValues(values: any[]): {
  overallType: 'number' | 'string' | 'date' | 'boolean'
  confidence: number
  analyses: SingleValueAnalysis[]
  summary: string
} {
  if (values.length === 0) {
    return {
      overallType: 'string',
      confidence: 0,
      analyses: [],
      summary: '沒有提供資料'
    }
  }

  const analyses = values.map(analyzeSingleValue)
  
  // 統計各類型出現次數
  const typeCounts = {
    number: 0,
    string: 0,
    date: 0,
    boolean: 0
  }

  analyses.forEach(analysis => {
    typeCounts[analysis.detectedType]++
  })

  // 找出主要類型
  const totalValues = analyses.length
  let overallType: 'number' | 'string' | 'date' | 'boolean' = 'string'
  let maxCount = 0

  Object.entries(typeCounts).forEach(([type, count]) => {
    if (count > maxCount) {
      maxCount = count
      overallType = type as any
    }
  })

  const confidence = maxCount / totalValues
  
  let summary = `分析了 ${totalValues} 個值：`
  Object.entries(typeCounts).forEach(([type, count]) => {
    if (count > 0) {
      summary += ` ${type}(${count})，`
    }
  })
  summary = summary.slice(0, -1) // 移除最後的逗號
  summary += `。主要類型：${overallType}（信心度：${(confidence * 100).toFixed(1)}%）`

  return {
    overallType,
    confidence,
    analyses,
    summary
  }
}