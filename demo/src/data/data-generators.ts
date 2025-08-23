/**
 * 統一的測試資料生成器
 * 提供各種圖表類型的標準化測試資料
 */

import type { DatasetOption } from '../hooks/useChartDemo'

// === 通用資料類型定義 ===
export interface BasicDataPoint {
  category: string
  value: number
}

export interface TimeSeriesDataPoint {
  date: string | Date
  value: number
  label?: string
}

export interface ScatterDataPoint {
  x: number
  y: number
  size?: number
  category?: string
  label?: string
}

export interface HeatmapDataPoint {
  x: string
  y: string
  value: number
}

// === 長條圖資料生成器 ===
export class BarChartDataGenerator {
  static generateBasic(): DatasetOption<BasicDataPoint>[] {
    return [
      {
        label: '基本資料',
        value: 'basic',
        data: [
          { category: 'A', value: 30 },
          { category: 'B', value: 80 },
          { category: 'C', value: 45 },
          { category: 'D', value: 60 },
          { category: 'E', value: 20 },
          { category: 'F', value: 90 },
          { category: 'G', value: 55 }
        ],
        xKey: 'category',
        yKey: 'value',
        description: '簡單的類別與數值對應'
      },
      {
        label: '銷售資料',
        value: 'sales',
        data: [
          { category: '1月', value: 12000 },
          { category: '2月', value: 15000 },
          { category: '3月', value: 18000 },
          { category: '4月', value: 22000 },
          { category: '5月', value: 19000 },
          { category: '6月', value: 25000 },
          { category: '7月', value: 28000 },
          { category: '8月', value: 26000 },
          { category: '9月', value: 30000 },
          { category: '10月', value: 32000 },
          { category: '11月', value: 29000 },
          { category: '12月', value: 35000 }
        ],
        xKey: 'category',
        yKey: 'value',
        description: '月度銷售數據'
      },
      {
        label: '產品評分',
        value: 'rating',
        data: [
          { category: 'iPhone', value: 4.5 },
          { category: 'Samsung', value: 4.2 },
          { category: 'Google Pixel', value: 4.3 },
          { category: 'OnePlus', value: 4.0 },
          { category: 'Xiaomi', value: 3.8 },
          { category: 'Huawei', value: 3.9 }
        ],
        xKey: 'category',
        yKey: 'value',
        description: '各品牌產品平均評分'
      }
    ]
  }

  static generateRandomSeries(count: number = 10, minValue: number = 0, maxValue: number = 100): BasicDataPoint[] {
    return Array.from({ length: count }, (_, i) => ({
      category: `類別 ${String.fromCharCode(65 + i)}`,
      value: Math.floor(Math.random() * (maxValue - minValue)) + minValue
    }))
  }
}

// === 散佈圖資料生成器 ===
export class ScatterPlotDataGenerator {
  static generateCorrelation(points: number = 50, correlation: number = 0.7): DatasetOption<ScatterDataPoint>[] {
    const generateCorrelationData = (correlation: number, category?: string) => {
      return Array.from({ length: points }, (_, i) => {
        const x = Math.random() * 100
        const noise = (Math.random() - 0.5) * 30
        const y = x * correlation + noise + 20
        return {
          x: Math.round(x * 100) / 100,
          y: Math.round(y * 100) / 100,
          size: Math.random() * 20 + 5,
          category: category || ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
          label: `Point ${i + 1}`
        }
      })
    }

    return [
      {
        label: '正相關數據',
        value: 'positive-correlation',
        data: generateCorrelationData(0.7),
        xKey: 'x',
        yKey: 'y',
        description: '顯示正相關關係的數據集'
      },
      {
        label: '負相關數據',
        value: 'negative-correlation',
        data: generateCorrelationData(-0.6),
        xKey: 'x',
        yKey: 'y',
        description: '顯示負相關關係的數據集'
      },
      {
        label: '無相關數據',
        value: 'no-correlation',
        data: generateCorrelationData(0.1),
        xKey: 'x',
        yKey: 'y',
        description: '顯示無明顯相關性的數據集'
      }
    ]
  }

  static generateIris(): DatasetOption<any>[] {
    const species = ['setosa', 'versicolor', 'virginica']
    const data: any[] = []
    
    species.forEach((spec) => {
      for (let i = 0; i < 50; i++) {
        let sepalLength, petalLength
        
        if (spec === 'setosa') {
          sepalLength = 4.5 + Math.random() * 1.5
          petalLength = 1 + Math.random() * 1.5
        } else if (spec === 'versicolor') {
          sepalLength = 5.5 + Math.random() * 1.5
          petalLength = 3 + Math.random() * 2
        } else {
          sepalLength = 6 + Math.random() * 2
          petalLength = 4.5 + Math.random() * 2.5
        }
        
        data.push({
          x: Math.round(sepalLength * 100) / 100,
          y: Math.round(petalLength * 100) / 100,
          species: spec,
          category: spec,
          label: `${spec}-${i + 1}`
        })
      }
    })

    return [
      {
        label: '鳶尾花數據集',
        value: 'iris',
        data,
        xKey: 'x',
        yKey: 'y',
        description: '經典的鳶尾花數據集，包含三個品種'
      }
    ]
  }
}

// === 線圖資料生成器 ===
export class LineChartDataGenerator {
  static generateTimeSeries(): DatasetOption<TimeSeriesDataPoint>[] {
    const generateSineWave = (amplitude: number = 50, frequency: number = 1, points: number = 50) => {
      return Array.from({ length: points }, (_, i) => {
        const x = (i / points) * 4 * Math.PI
        const y = amplitude * Math.sin(frequency * x) + amplitude + Math.random() * 10
        return {
          date: `第 ${i + 1} 週`,
          value: Math.round(y * 100) / 100,
          label: `Week ${i + 1}`
        }
      })
    }

    return [
      {
        label: '週期性趨勢',
        value: 'periodic',
        data: generateSineWave(30, 1, 24),
        xKey: 'date',
        yKey: 'value',
        description: '顯示週期性變化的時間序列數據'
      },
      {
        label: '成長趨勢',
        value: 'growth',
        data: Array.from({ length: 12 }, (_, i) => ({
          date: `${i + 1}月`,
          value: Math.round((Math.pow(1.1, i) * 100 + Math.random() * 20) * 100) / 100,
          label: `Month ${i + 1}`
        })),
        xKey: 'date',
        yKey: 'value',
        description: '顯示指數成長的時間序列數據'
      },
      {
        label: '波動趨勢',
        value: 'volatile',
        data: Array.from({ length: 30 }, (_, i) => ({
          date: `Day ${i + 1}`,
          value: Math.round((50 + Math.sin(i * 0.5) * 20 + Math.random() * 30) * 100) / 100,
          label: `Day ${i + 1}`
        })),
        xKey: 'date',
        yKey: 'value',
        description: '顯示高波動性的時間序列數據'
      }
    ]
  }
}

// === 圓餅圖資料生成器 ===
export class PieChartDataGenerator {
  static generateBasic(): DatasetOption<BasicDataPoint>[] {
    return [
      {
        label: '市場佔有率',
        value: 'market-share',
        data: [
          { category: 'iOS', value: 45 },
          { category: 'Android', value: 52 },
          { category: 'Others', value: 3 }
        ],
        xKey: 'category',
        yKey: 'value',
        description: '行動作業系統市場佔有率'
      },
      {
        label: '預算分配',
        value: 'budget',
        data: [
          { category: '行銷', value: 35 },
          { category: '研發', value: 25 },
          { category: '營運', value: 20 },
          { category: '人事', value: 15 },
          { category: '其他', value: 5 }
        ],
        xKey: 'category',
        yKey: 'value',
        description: '公司年度預算分配比例'
      },
      {
        label: '銷售通路',
        value: 'channels',
        data: [
          { category: '線上商店', value: 40 },
          { category: '實體門市', value: 35 },
          { category: '經銷商', value: 15 },
          { category: '直銷', value: 10 }
        ],
        xKey: 'category',
        yKey: 'value',
        description: '各銷售通路營收比例'
      }
    ]
  }
}

// === 熱力圖資料生成器 ===
export class HeatmapDataGenerator {
  static generateCorrelationMatrix(): DatasetOption<HeatmapDataPoint>[] {
    const variables = ['Sales', 'Marketing', 'Price', 'Quality', 'Service']
    const correlationData: HeatmapDataPoint[] = []
    
    variables.forEach(var1 => {
      variables.forEach(var2 => {
        let correlation: number
        if (var1 === var2) {
          correlation = 1.0
        } else {
          // 生成合理的相關性數據
          const pairs: Record<string, number> = {
            'Sales-Marketing': 0.85,
            'Sales-Price': -0.62,
            'Sales-Quality': 0.73,
            'Sales-Service': 0.91,
            'Marketing-Price': -0.45,
            'Marketing-Quality': 0.56,
            'Marketing-Service': 0.68,
            'Price-Quality': -0.23,
            'Price-Service': -0.34,
            'Quality-Service': 0.79
          }
          
          const key1 = `${var1}-${var2}`
          const key2 = `${var2}-${var1}`
          correlation = pairs[key1] || pairs[key2] || (Math.random() * 0.8 - 0.4)
        }
        
        correlationData.push({
          x: var1,
          y: var2,
          value: Math.round(correlation * 100) / 100
        })
      })
    })

    return [
      {
        label: '相關性矩陣',
        value: 'correlation',
        data: correlationData,
        xKey: 'x',
        yKey: 'y',
        description: '業務指標間的相關性分析'
      }
    ]
  }

  static generateSalesMatrix(): DatasetOption<HeatmapDataPoint>[] {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月']
    const products = ['Product A', 'Product B', 'Product C', 'Product D']
    const salesData: HeatmapDataPoint[] = []
    
    months.forEach(month => {
      products.forEach(product => {
        salesData.push({
          x: month,
          y: product,
          value: Math.floor(Math.random() * 200) + 50
        })
      })
    })

    return [
      {
        label: '產品銷售矩陣',
        value: 'sales-matrix',
        data: salesData,
        xKey: 'x',
        yKey: 'y',
        description: '各產品月度銷售熱力圖'
      }
    ]
  }
}

// === 統計圖表資料生成器 ===
export class StatisticalDataGenerator {
  static generateBoxPlotData(): DatasetOption<any>[] {
    const generateDistribution = (mean: number, stdDev: number, size: number = 100) => {
      return Array.from({ length: size }, () => {
        // 使用 Box-Muller 變換生成正態分佈
        const u1 = Math.random()
        const u2 = Math.random()
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
        return mean + z0 * stdDev
      })
    }

    return [
      {
        label: '考試成績分佈',
        value: 'exam-scores',
        data: [
          { category: '數學', values: generateDistribution(75, 15) },
          { category: '英文', values: generateDistribution(68, 20) },
          { category: '科學', values: generateDistribution(72, 12) },
          { category: '社會', values: generateDistribution(70, 18) }
        ],
        xKey: 'category',
        yKey: 'values',
        description: '各科目考試成績的分佈情況'
      }
    ]
  }
}

// === 綜合資料生成工具 ===
export class DataGeneratorUtils {
  static getAllDatasets() {
    return {
      barChart: BarChartDataGenerator.generateBasic(),
      scatterPlot: [...ScatterPlotDataGenerator.generateCorrelation(), ...ScatterPlotDataGenerator.generateIris()],
      lineChart: LineChartDataGenerator.generateTimeSeries(),
      pieChart: PieChartDataGenerator.generateBasic(),
      heatmap: [...HeatmapDataGenerator.generateCorrelationMatrix(), ...HeatmapDataGenerator.generateSalesMatrix()],
      boxPlot: StatisticalDataGenerator.generateBoxPlotData()
    }
  }

  static getDatasetsByType<T>(type: keyof ReturnType<typeof DataGeneratorUtils.getAllDatasets>): DatasetOption<T>[] {
    return this.getAllDatasets()[type] as DatasetOption<T>[]
  }
}