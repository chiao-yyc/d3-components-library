import React, { useState, useMemo } from 'react'
import { ViolinPlot } from '@registry/components/violin-plot/violin-plot'

// 生成正常分佈數據
function generateNormalData(mean: number, std: number, count: number): number[] {
  const data: number[] = []
  for (let i = 0; i < count; i++) {
    // Box-Muller 變換生成正常分佈
    const u1 = Math.random()
    const u2 = Math.random()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    data.push(mean + std * z0)
  }
  return data
}

// 生成偏態分佈數據
function generateSkewedData(base: number, skew: number, count: number): number[] {
  const data: number[] = []
  for (let i = 0; i < count; i++) {
    const normal = generateNormalData(0, 1, 1)[0]
    const skewed = base + Math.sign(normal) * Math.pow(Math.abs(normal), skew)
    data.push(skewed)
  }
  return data
}

// 生成雙峰分佈數據
function generateBimodalData(mean1: number, mean2: number, std1: number, std2: number, count: number): number[] {
  const data: number[] = []
  for (let i = 0; i < count; i++) {
    if (Math.random() < 0.5) {
      data.push(...generateNormalData(mean1, std1, 1))
    } else {
      data.push(...generateNormalData(mean2, std2, 1))
    }
  }
  return data
}

// 藥物試驗數據
const drugTrialData = [
  { 
    group: '安慰劑組', 
    measurements: generateNormalData(100, 15, 80).concat([
      // 添加一些異常值
      140, 145, 60, 55
    ])
  },
  { 
    group: '低劑量組', 
    measurements: generateNormalData(110, 12, 75).concat([125, 130]) 
  },
  { 
    group: '中劑量組', 
    measurements: generateNormalData(125, 18, 85).concat([160, 40]) 
  },
  { 
    group: '高劑量組', 
    measurements: generateBimodalData(135, 150, 10, 8, 70) 
  }
]

// 學習成效數據
const learningData = [
  { 
    method: '傳統教學', 
    scores: generateNormalData(75, 12, 100) 
  },
  { 
    method: '互動教學', 
    scores: generateSkewedData(80, 0.8, 95).map(x => Math.max(0, Math.min(100, x))) 
  },
  { 
    method: '個人化學習', 
    scores: generateBimodalData(70, 90, 8, 6, 90) 
  },
  { 
    method: 'AI輔助學習', 
    scores: generateNormalData(88, 10, 85).concat([95, 98, 99]) 
  }
]

// 財務收益數據
const financeData = [
  { 
    strategy: '保守型', 
    returns: generateNormalData(5, 3, 120) 
  },
  { 
    strategy: '平衡型', 
    returns: generateNormalData(8, 6, 110).concat([-15, -12, 25, 28]) 
  },
  { 
    strategy: '成長型', 
    returns: generateSkewedData(12, 1.2, 100).concat([-20, -25, 35, 40]) 
  },
  { 
    strategy: '積極型', 
    returns: generateBimodalData(15, -5, 12, 8, 95) 
  }
]

// 生物多樣性數據
const biodiversityData = [
  { 
    habitat: '原始森林', 
    species_count: generateNormalData(45, 8, 60) 
  },
  { 
    habitat: '次生林', 
    species_count: generateNormalData(32, 12, 65) 
  },
  { 
    habitat: '農田', 
    species_count: generateSkewedData(18, 1.5, 70) 
  },
  { 
    habitat: '城市公園', 
    species_count: generateBimodalData(15, 28, 4, 6, 55) 
  }
]

export default function ViolinPlotDemo() {
  // 控制選項
  const [selectedDataset, setSelectedDataset] = useState('drug')
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical')
  const [violinWidth, setViolinWidth] = useState(80)
  const [resolution, setResolution] = useState(100)
  const [showBoxPlot, setShowBoxPlot] = useState(true)
  const [boxPlotWidth, setBoxPlotWidth] = useState(15)
  const [showMedian, setShowMedian] = useState(true)
  const [showMean, setShowMean] = useState(true)
  const [showQuartiles, setShowQuartiles] = useState(true)
  const [showOutliers, setShowOutliers] = useState(true)
  const [kdeMethod, setKdeMethod] = useState<'gaussian' | 'epanechnikov' | 'triangular'>('gaussian')
  const [smoothing, setSmoothing] = useState(1)
  const [violinFillOpacity, setViolinFillOpacity] = useState(0.7)
  const [colorScheme, setColorScheme] = useState<'custom' | 'blues' | 'greens' | 'oranges' | 'reds' | 'purples'>('custom')
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)

  // 當前資料和配置
  const { currentData, config } = useMemo(() => {
    switch (selectedDataset) {
      case 'drug':
        return {
          currentData: drugTrialData,
          config: {
            title: '藥物臨床試驗效果分析',
            description: '不同劑量組的療效分佈比較（包含雙峰分佈）',
            colors: ['#ef4444', '#f97316', '#eab308', '#22c55e'],
            yLabel: '療效指標',
            xLabel: '試驗組別'
          }
        }
      
      case 'learning':
        return {
          currentData: learningData,
          config: {
            title: '教學方法學習成效分析',
            description: '不同教學方法的學習成果分佈',
            colors: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'],
            yLabel: '學習成績',
            xLabel: '教學方法'
          }
        }
      
      case 'finance':
        return {
          currentData: financeData,
          config: {
            title: '投資策略收益分析',
            description: '不同投資策略的收益率分佈（含風險評估）',
            colors: ['#16a34a', '#0891b2', '#dc2626', '#7c2d12'],
            yLabel: '年化收益率 (%)',
            xLabel: '投資策略'
          }
        }
      
      case 'biodiversity':
        return {
          currentData: biodiversityData,
          config: {
            title: '棲息地生物多樣性分析',
            description: '不同棲息地的物種數量分佈',
            colors: ['#15803d', '#059669', '#ca8a04', '#9a3412'],
            yLabel: '物種數量',
            xLabel: '棲息地類型'
          }
        }
      
      default:
        return {
          currentData: drugTrialData,
          config: {
            title: '小提琴圖',
            description: '',
            colors: [],
            yLabel: '數值',
            xLabel: '分組'
          }
        }
    }
  }, [selectedDataset])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 標題 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Violin Plot Demo
        </h1>
        <p className="text-gray-600">
          小提琴圖組件展示 - 結合核密度估計和箱形圖的進階統計分析
        </p>
      </div>

      {/* 控制面板 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          圖表設定
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 資料集選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              資料集
            </label>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="drug">藥物試驗</option>
              <option value="learning">學習成效</option>
              <option value="finance">投資收益</option>
              <option value="biodiversity">生物多樣性</option>
            </select>
          </div>

          {/* 方向 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              圖表方向
            </label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vertical">垂直</option>
              <option value="horizontal">水平</option>
            </select>
          </div>

          {/* KDE 方法 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              核密度估計方法
            </label>
            <select
              value={kdeMethod}
              onChange={(e) => setKdeMethod(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="gaussian">高斯核</option>
              <option value="epanechnikov">Epanechnikov核</option>
              <option value="triangular">三角核</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {kdeMethod === 'gaussian' && '最常用，適合大多數數據分佈'}
              {kdeMethod === 'epanechnikov' && '理論上最優，邊界平滑'}
              {kdeMethod === 'triangular' && '簡單實用，計算快速'}
            </p>
          </div>

          {/* 小提琴寬度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              小提琴最大寬度 ({violinWidth}px)
            </label>
            <input
              type="range"
              min="40"
              max="120"
              value={violinWidth}
              onChange={(e) => setViolinWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 解析度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密度計算解析度 ({resolution})
            </label>
            <input
              type="range"
              min="50"
              max="200"
              value={resolution}
              onChange={(e) => setResolution(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              更高解析度 = 更平滑曲線，但計算較慢
            </p>
          </div>

          {/* 平滑因子 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              平滑因子 ({smoothing.toFixed(1)})
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={smoothing}
              onChange={(e) => setSmoothing(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              值越大 = 曲線越平滑，細節越少
            </p>
          </div>

          {/* 箱形圖寬度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              箱形圖寬度 ({boxPlotWidth}px)
            </label>
            <input
              type="range"
              min="5"
              max="30"
              value={boxPlotWidth}
              onChange={(e) => setBoxPlotWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 填充透明度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              填充透明度 ({(violinFillOpacity * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="0.3"
              max="1"
              step="0.1"
              value={violinFillOpacity}
              onChange={(e) => setViolinFillOpacity(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 顏色主題 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              顏色主題
            </label>
            <select
              value={colorScheme}
              onChange={(e) => setColorScheme(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="custom">自訂</option>
              <option value="blues">藍色系</option>
              <option value="greens">綠色系</option>
              <option value="oranges">橙色系</option>
              <option value="reds">紅色系</option>
              <option value="purples">紫色系</option>
            </select>
          </div>

          {/* 切換選項 */}
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showBoxPlot"
                checked={showBoxPlot}
                onChange={(e) => setShowBoxPlot(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showBoxPlot" className="text-sm text-gray-700">
                顯示箱形圖
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showMedian"
                checked={showMedian}
                onChange={(e) => setShowMedian(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showMedian" className="text-sm text-gray-700">
                顯示中位數
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showMean"
                checked={showMean}
                onChange={(e) => setShowMean(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showMean" className="text-sm text-gray-700">
                顯示平均值
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showQuartiles"
                checked={showQuartiles}
                onChange={(e) => setShowQuartiles(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showQuartiles" className="text-sm text-gray-700">
                顯示四分位數
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showOutliers"
                checked={showOutliers}
                onChange={(e) => setShowOutliers(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showOutliers" className="text-sm text-gray-700">
                顯示異常值
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="animate"
                checked={animate}
                onChange={(e) => setAnimate(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="animate" className="text-sm text-gray-700">
                動畫效果
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="interactive"
                checked={interactive}
                onChange={(e) => setInteractive(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="interactive" className="text-sm text-gray-700">
                互動功能
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 圖表展示 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {config.title}
        </h2>
        <p className="text-gray-600 mb-6">{config.description}</p>
        
        <div className="flex justify-center">
          <ViolinPlot
            data={currentData}
            labelKey={selectedDataset === 'drug' ? 'group' : 
                     selectedDataset === 'learning' ? 'method' :
                     selectedDataset === 'finance' ? 'strategy' : 'habitat'}
            valuesKey={selectedDataset === 'drug' ? 'measurements' : 
                      selectedDataset === 'learning' ? 'scores' :
                      selectedDataset === 'finance' ? 'returns' : 'species_count'}
            width={orientation === 'vertical' ? 700 : 800}
            height={orientation === 'vertical' ? 600 : 500}
            orientation={orientation}
            violinWidth={violinWidth}
            resolution={resolution}
            showBoxPlot={showBoxPlot}
            boxPlotWidth={boxPlotWidth}
            showMedian={showMedian}
            showMean={showMean}
            showQuartiles={showQuartiles}
            showOutliers={showOutliers}
            kdeMethod={kdeMethod}
            smoothing={smoothing}
            violinFillOpacity={violinFillOpacity}
            colors={colorScheme === 'custom' ? config.colors : undefined}
            colorScheme={colorScheme}
            animate={animate}
            interactive={interactive}
            onViolinClick={(data) => {
              console.log('Violin clicked:', data)
              alert(`點擊了: ${data.label}\n樣本數: ${data.statistics.count}\n中位數: ${data.statistics.median.toFixed(2)}\n平均值: ${data.statistics.mean?.toFixed(2)}\n標準差: ${data.statistics.std?.toFixed(2)}`)
            }}
            onViolinHover={(data) => {
              console.log('Violin hovered:', data)
            }}
          />
        </div>
      </div>

      {/* 分佈分析說明 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          分佈特徵分析
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentData.map((group: any, index: number) => {
            const values = selectedDataset === 'drug' ? group.measurements : 
                          selectedDataset === 'learning' ? group.scores :
                          selectedDataset === 'finance' ? group.returns : group.species_count
            
            const groupLabel = selectedDataset === 'drug' ? group.group : 
                             selectedDataset === 'learning' ? group.method :
                             selectedDataset === 'finance' ? group.strategy : group.habitat
            
            // 簡化統計計算
            const sorted = [...values].sort((a: number, b: number) => a - b)
            const n = sorted.length
            const mean = values.reduce((sum: number, val: number) => sum + val, 0) / n
            const median = n % 2 === 0 
              ? (sorted[Math.floor(n / 2) - 1] + sorted[Math.floor(n / 2)]) / 2
              : sorted[Math.floor(n / 2)]
            const variance = values.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / n
            const std = Math.sqrt(variance)
            
            // 偏度計算（簡化）
            const skewness = mean > median ? '右偏' : mean < median ? '左偏' : '對稱'
            
            return (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2" style={{ color: config.colors[index] }}>
                  {groupLabel}
                </h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>樣本數: {n}</div>
                  <div>平均值: {mean.toFixed(2)}</div>
                  <div>中位數: {median.toFixed(2)}</div>
                  <div>標準差: {std.toFixed(2)}</div>
                  <div>分佈特徵: {skewness}</div>
                  <div>範圍: {Math.min(...values).toFixed(2)} ~ {Math.max(...values).toFixed(2)}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 使用範例 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          程式碼範例
        </h2>
        
        <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm">
          <code>{`import { ViolinPlot } from '@registry/components/violin-plot'

const data = [
  { group: '對照組', measurements: [85, 92, 78, 88, 95, 82] },
  { group: '實驗組', measurements: [95, 98, 89, 92, 101, 88] }
]

<ViolinPlot
  data={data}
  labelKey="group"
  valuesKey="measurements"
  width={${orientation === 'vertical' ? 700 : 800}}
  height={${orientation === 'vertical' ? 600 : 500}}
  orientation="${orientation}"
  violinWidth={${violinWidth}}
  resolution={${resolution}}
  showBoxPlot={${showBoxPlot}}
  boxPlotWidth={${boxPlotWidth}}
  kdeMethod="${kdeMethod}"
  smoothing={${smoothing}}
  violinFillOpacity={${violinFillOpacity}}
  colorScheme="${colorScheme}"
  animate={${animate}}
  interactive={${interactive}}
  onViolinClick={(data) => console.log('Clicked:', data)}
/>`}</code>
        </pre>
      </div>

      {/* 小提琴圖解讀指南 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          小提琴圖解讀指南
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">圖形元素</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><strong>小提琴形狀:</strong> 顯示數據的密度分佈</li>
              <li><strong>寬度:</strong> 代表該數值出現的頻率</li>
              <li><strong>箱形圖:</strong> 顯示四分位數統計</li>
              <li><strong>中位數線:</strong> 粗黑線表示中位數</li>
              <li><strong>平均值點:</strong> 白色圓點表示平均值</li>
              <li><strong>異常值:</strong> 散點表示離群值</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">分析要點</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li><strong>對稱性:</strong> 形狀是否對稱</li>
              <li><strong>峰值:</strong> 單峰或多峰分佈</li>
              <li><strong>尾部:</strong> 長尾或短尾特徵</li>
              <li><strong>離散度:</strong> 分佈的集中程度</li>
              <li><strong>比較:</strong> 多組間的差異</li>
              <li><strong>異常值:</strong> 需要特別關注的數據點</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}