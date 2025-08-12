import * as d3 from 'd3'

// 統一的數據接口
export interface EnhancedComboData {
  [key: string]: any
}

// 系列配置接口
export interface ComboChartSeries {
  type: 'bar' | 'line' | 'area' | 'stackedArea' | 'scatter' | 'waterfall'
  dataKey: string
  name: string
  yAxis: 'left' | 'right'
  color?: string
  
  // Bar 專用配置
  barWidth?: number
  barOpacity?: number
  barGroupKey?: string
  
  // Line 專用配置
  strokeWidth?: number
  showPoints?: boolean
  pointRadius?: number
  curve?: 'linear' | 'monotone' | 'cardinal' | 'basis' | 'step'
  
  // Area 專用配置
  areaOpacity?: number
  baseline?: number
  gradient?: { id: string; stops: { offset: string; color: string; opacity?: number }[] }
  
  // StackedArea 專用配置
  stackGroupKey?: string
  stackOrder?: 'ascending' | 'descending' | 'insideOut' | 'none' | 'reverse'
  stackOffset?: 'none' | 'expand' | 'diverging' | 'silhouette' | 'wiggle'
  
  // Scatter 專用配置
  scatterRadius?: number
  scatterOpacity?: number
  sizeKey?: string
  sizeRange?: [number, number]
  groupKey?: string
  strokeColor?: string
  scatterStrokeWidth?: number
  
  // Regression Line 專用配置
  showRegression?: boolean
  regressionType?: 'linear' | 'polynomial' | 'exponential'
  regressionColor?: string
  regressionWidth?: number
  regressionDasharray?: string
  showEquation?: boolean
  showRSquared?: boolean
  
  // Waterfall 專用配置
  typeKey?: string
  waterfallOpacity?: number
  positiveColor?: string
  negativeColor?: string
  totalColor?: string
  subtotalColor?: string
  showConnectors?: boolean
  connectorColor?: string
  connectorWidth?: number
  connectorDasharray?: string
}

// 域值計算結果
export interface DomainResult {
  xDomain: any[]
  leftYDomain: [number, number]
  rightYDomain: [number, number]
  processedSeries: (ComboChartSeries & { color: string })[]
}

// 系列數據處理器
export class ChartSeriesProcessor {
  
  /**
   * 處理數據和計算域值
   */
  static processSeries(
    data: EnhancedComboData[],
    series: ComboChartSeries[],
    xKey: string,
    colors: string[]
  ): DomainResult {
    // X 軸域值 - 支援時間、類別和數值
    const xValues = data.map(d => d[xKey])
    let xDomain: any[]
    
    // 智能檢測 X 軸類型
    const firstValue = xValues[0]
    if (firstValue instanceof Date || (typeof firstValue === 'string' && !isNaN(Date.parse(firstValue)))) {
      xDomain = d3.extent(xValues.map(v => v instanceof Date ? v : new Date(v))) as [Date, Date]
    } else if (typeof firstValue === 'number') {
      xDomain = d3.extent(xValues) as [number, number]
    } else {
      xDomain = Array.from(new Set(xValues))
    }

    // 分析每個系列的數據範圍
    const leftSeries = series.filter(s => s.yAxis === 'left')
    const rightSeries = series.filter(s => s.yAxis === 'right')

    // 計算左軸域值
    const leftYDomain = this.calculateYDomain(data, leftSeries)
    
    // 計算右軸域值
    const rightYDomain = this.calculateYDomain(data, rightSeries)

    // 處理系列配置，添加顏色
    const processedSeries = series.map((s, index) => ({
      ...s,
      color: s.color || colors[index % colors.length]
    }))

    return { xDomain, leftYDomain, rightYDomain, processedSeries }
  }

  /**
   * 計算 Y 軸域值
   */
  private static calculateYDomain(
    data: EnhancedComboData[], 
    series: ComboChartSeries[]
  ): [number, number] {
    if (series.length === 0) return [0, 1]

    // 檢查是否有堆疊區域系列和瀑布圖系列
    const stackedAreaSeries = series.filter(s => s.type === 'stackedArea')
    const waterfallSeries = series.filter(s => s.type === 'waterfall')
    const nonStackedSeries = series.filter(s => s.type !== 'stackedArea' && s.type !== 'waterfall')

    let values: number[] = []

    // 處理非堆疊系列
    if (nonStackedSeries.length > 0) {
      values = values.concat(
        nonStackedSeries.flatMap(s => 
          data.map(d => Number(d[s.dataKey]) || 0).filter(v => !isNaN(v))
        )
      )
    }

    // 處理瀑布圖系列 - 需要計算累積值範圍
    if (waterfallSeries.length > 0) {
      waterfallSeries.forEach(s => {
        const waterfallValues = this.calculateWaterfallValues(data, s)
        values = values.concat(waterfallValues)
      })
    }

    // 處理堆疊系列 - 需要計算堆疊總和
    if (stackedAreaSeries.length > 0) {
      const stackedValues = this.calculateStackedValues(data, stackedAreaSeries)
      values = values.concat(stackedValues)
    }

    if (values.length === 0) return [0, 1]

    const extent = d3.extent(values) as [number, number]
    const hasStackedArea = stackedAreaSeries.length > 0
    
    return [
      hasStackedArea ? 0 : Math.min(0, extent[0]), 
      extent[1] * 1.1 // 頂部留 10% 空間
    ]
  }

  /**
   * 計算瀑布圖累積值
   */
  private static calculateWaterfallValues(data: EnhancedComboData[], series: ComboChartSeries): number[] {
    let cumulativeValue = 0
    const waterfallValues: number[] = [0] // 包含起始的 0
    
    data.forEach(d => {
      const value = Number(d[series.dataKey]) || 0
      const type = series.typeKey ? d[series.typeKey] : (value >= 0 ? 'positive' : 'negative')
      
      switch (type) {
        case 'total':
        case 'subtotal':
          cumulativeValue += value
          waterfallValues.push(0, cumulativeValue) // 添加起點和終點
          break
        case 'positive':
        case 'negative':
        default:
          waterfallValues.push(cumulativeValue) // 添加當前累積值
          cumulativeValue += value
          waterfallValues.push(cumulativeValue) // 添加新的累積值
          break
      }
    })
    
    return waterfallValues
  }

  /**
   * 計算堆疊區域值
   */
  private static calculateStackedValues(data: EnhancedComboData[], stackedAreaSeries: ComboChartSeries[]): number[] {
    // 按堆疊組分組
    const stackGroups = new Map<string, typeof stackedAreaSeries>()
    stackedAreaSeries.forEach(s => {
      const groupKey = s.stackGroupKey || 'default'
      if (!stackGroups.has(groupKey)) {
        stackGroups.set(groupKey, [])
      }
      stackGroups.get(groupKey)!.push(s)
    })

    let values: number[] = []

    // 計算每個堆疊組的總和
    stackGroups.forEach(groupSeries => {
      const stackedTotals = data.map(d => 
        groupSeries.reduce((sum, s) => sum + (Number(d[s.dataKey]) || 0), 0)
      )
      values = values.concat(stackedTotals)
    })

    return values
  }
}