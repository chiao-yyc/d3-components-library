import { DataType, SuggestedMapping, ChartSuggestion } from '@registry/types'

export interface DataTypeInfo {
  type: 'number' | 'string' | 'date' | 'boolean'
  confidence: number
  samples: any[]
  nullCount: number
}

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
  
  // 檢查是否為數字
  const numericValues = nonNullValues.filter(v => typeof v === 'number' || !isNaN(Number(v)))
  const numericConfidence = numericValues.length / nonNullValues.length
  
  // 檢查是否為日期
  const dateValues = nonNullValues.filter(v => {
    const date = new Date(v)
    return !isNaN(date.getTime()) && typeof v !== 'number'
  })
  const dateConfidence = dateValues.length / nonNullValues.length
  
  // 檢查是否為布林
  const booleanValues = nonNullValues.filter(v => 
    typeof v === 'boolean' || v === 'true' || v === 'false' || v === 1 || v === 0
  )
  const booleanConfidence = booleanValues.length / nonNullValues.length
  
  // 取樣本資料
  const samples = nonNullValues.slice(0, Math.min(5, nonNullValues.length))
  
  // 決定最可能的型別
  if (numericConfidence > 0.8) {
    return {
      type: 'number',
      confidence: numericConfidence,
      samples,
      nullCount
    }
  }
  
  if (dateConfidence > 0.8) {
    return {
      type: 'date',
      confidence: dateConfidence,
      samples,
      nullCount
    }
  }
  
  if (booleanConfidence > 0.8) {
    return {
      type: 'boolean',
      confidence: booleanConfidence,
      samples,
      nullCount
    }
  }
  
  return {
    type: 'string',
    confidence: 1 - Math.max(numericConfidence, dateConfidence, booleanConfidence),
    samples,
    nullCount
  }
}

export function detectDataType(values: any[]): DataType {
  return detectColumnType(values).type
}

export function suggestMapping(data: any[]): SuggestedMapping[] {
  if (!data.length) return []
  
  const suggestions: SuggestedMapping[] = []
  const firstRow = data[0]
  
  Object.keys(firstRow).forEach(field => {
    const values = data.map(d => d[field])
    const type = detectDataType(values)
    
    let suggested: 'x' | 'y' | 'color' | 'size' = 'x'
    let confidence = 0.5
    
    // 根據欄位名稱和資料類型建議映射
    const fieldLower = field.toLowerCase()
    
    if (type === 'number') {
      if (fieldLower.includes('y') || fieldLower.includes('value') || fieldLower.includes('amount')) {
        suggested = 'y'
        confidence = 0.9
      } else if (fieldLower.includes('size') || fieldLower.includes('radius')) {
        suggested = 'size'
        confidence = 0.8
      } else {
        suggested = 'x'
        confidence = 0.7
      }
    } else if (type === 'date') {
      suggested = 'x'
      confidence = 0.9
    } else if (type === 'string') {
      if (fieldLower.includes('category') || fieldLower.includes('group') || fieldLower.includes('color')) {
        suggested = 'color'
        confidence = 0.8
      } else {
        suggested = 'x'
        confidence = 0.6
      }
    }
    
    // 創建基本映射配置
    const mapping: any = {}
    mapping[suggested] = field
    
    suggestions.push({
      type: 'auto',
      mapping,
      chartType: type === 'date' ? 'line' : type === 'number' ? 'bar' : 'pie',
      confidence,
      reasoning: `建議將 ${field} 欄位用作 ${suggested} 軸，基於其 ${type} 資料類型`
    })
  })
  
  return suggestions.sort((a, b) => b.confidence - a.confidence)
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