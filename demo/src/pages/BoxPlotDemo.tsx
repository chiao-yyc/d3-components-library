import React, { useState, useMemo } from 'react'
import { BoxPlot } from '@registry/components/box-plot/box-plot'

// 學生成績數據
const studentScoresData = [
  { subject: '數學', scores: [85, 92, 78, 88, 95, 82, 90, 87, 93, 86, 89, 91, 84, 96, 83, 88, 92, 85, 94, 87] },
  { subject: '英文', scores: [76, 88, 92, 85, 79, 91, 87, 83, 90, 86, 82, 89, 84, 93, 80, 88, 91, 85, 87, 89] },
  { subject: '物理', scores: [88, 91, 85, 89, 92, 87, 90, 86, 93, 84, 88, 91, 89, 94, 86, 90, 87, 92, 85, 88] },
  { subject: '化學', scores: [82, 85, 89, 91, 87, 84, 90, 88, 86, 92, 85, 89, 87, 91, 83, 88, 90, 86, 89, 85] },
  { subject: '生物', scores: [90, 87, 92, 89, 85, 91, 88, 86, 93, 87, 90, 89, 91, 85, 88, 92, 86, 89, 87, 90] }
]

// 公司薪資數據
const salaryData = [
  { department: '工程部', salaries: [75000, 85000, 92000, 68000, 78000, 95000, 88000, 82000, 90000, 76000, 87000, 91000, 79000, 86000, 83000] },
  { department: '銷售部', salaries: [65000, 72000, 85000, 78000, 82000, 68000, 75000, 88000, 71000, 79000, 86000, 73000, 81000, 77000, 84000] },
  { department: '行銷部', salaries: [68000, 75000, 82000, 71000, 78000, 85000, 72000, 79000, 86000, 74000, 81000, 88000, 76000, 83000, 80000] },
  { department: '人資部', salaries: [62000, 68000, 75000, 71000, 77000, 82000, 69000, 74000, 79000, 72000, 78000, 85000, 70000, 76000, 81000] },
  { department: '財務部', salaries: [70000, 77000, 84000, 72000, 79000, 86000, 74000, 81000, 88000, 76000, 83000, 90000, 78000, 85000, 82000] }
]

// 網站響應時間數據
const responseTimeData = [
  { server: 'Server A', times: [120, 135, 142, 128, 155, 138, 162, 145, 132, 148, 140, 158, 133, 151, 144] },
  { server: 'Server B', times: [98, 112, 125, 108, 135, 118, 142, 122, 115, 138, 125, 148, 119, 132, 128] },
  { server: 'Server C', times: [145, 162, 178, 155, 185, 168, 192, 175, 158, 182, 170, 188, 163, 178, 172] },
  { server: 'Server D', times: [88, 95, 102, 92, 108, 98, 115, 105, 89, 112, 101, 118, 94, 108, 103] }
]

// 實驗數據
const experimentData = [
  { condition: '對照組', measurements: [12.5, 13.2, 12.8, 13.5, 12.9, 13.1, 12.7, 13.4, 12.6, 13.0, 12.8, 13.3, 12.9, 13.2, 12.7] },
  { condition: '處理組A', measurements: [14.2, 15.1, 14.8, 15.5, 14.6, 15.2, 14.9, 15.8, 14.5, 15.0, 14.7, 15.4, 14.8, 15.3, 14.9] },
  { condition: '處理組B', measurements: [16.8, 17.5, 16.9, 17.8, 17.1, 17.6, 16.7, 17.9, 16.5, 17.2, 16.8, 17.7, 17.0, 17.4, 16.9] },
  { condition: '處理組C', measurements: [13.8, 14.5, 13.9, 14.8, 14.1, 14.6, 13.7, 14.9, 13.6, 14.2, 13.8, 14.7, 14.0, 14.4, 13.9] }
]

export default function BoxPlotDemo() {
  // 控制選項
  const [selectedDataset, setSelectedDataset] = useState('scores')
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical')
  const [boxWidth, setBoxWidth] = useState(40)
  const [whiskerWidth, setWhiskerWidth] = useState(20)
  const [showOutliers, setShowOutliers] = useState(true)
  const [showMean, setShowMean] = useState(true)
  const [showMedian, setShowMedian] = useState(true)
  const [outlierRadius, setOutlierRadius] = useState(3)
  const [meanStyle, setMeanStyle] = useState<'circle' | 'diamond' | 'square'>('diamond')
  const [boxFillOpacity, setBoxFillOpacity] = useState(0.7)
  const [statisticsMethod, setStatisticsMethod] = useState<'standard' | 'tukey' | 'percentile'>('tukey')
  const [showQuartiles, setShowQuartiles] = useState(true)
  const [showWhiskers, setShowWhiskers] = useState(true)
  const [colorScheme, setColorScheme] = useState<'custom' | 'blues' | 'greens' | 'oranges' | 'reds' | 'purples'>('custom')
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)

  // 當前資料和配置
  const { currentData, config } = useMemo(() => {
    switch (selectedDataset) {
      case 'scores':
        return {
          currentData: studentScoresData,
          config: {
            title: '學生成績分佈分析',
            description: '不同科目的成績分佈統計',
            colors: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554']
          }
        }
      
      case 'salary':
        return {
          currentData: salaryData,
          config: {
            title: '公司薪資分佈分析',
            description: '各部門薪資水平統計比較',
            colors: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b']
          }
        }
      
      case 'response':
        return {
          currentData: responseTimeData,
          config: {
            title: '伺服器響應時間分析',
            description: '不同伺服器的響應時間分佈',
            colors: ['#f59e0b', '#d97706', '#b45309', '#92400e']
          }
        }
      
      case 'experiment':
        return {
          currentData: experimentData,
          config: {
            title: '實驗數據分佈分析',
            description: '不同實驗條件下的測量結果',
            colors: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6']
          }
        }
      
      default:
        return {
          currentData: studentScoresData,
          config: {
            title: '箱形圖',
            description: '',
            colors: []
          }
        }
    }
  }, [selectedDataset])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 標題 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Box Plot Demo
        </h1>
        <p className="text-gray-600">
          箱形圖組件展示 - 適用於統計分析和數據分佈可視化
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
              <option value="scores">學生成績</option>
              <option value="salary">公司薪資</option>
              <option value="response">響應時間</option>
              <option value="experiment">實驗數據</option>
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

          {/* 統計方法 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              統計方法
            </label>
            <select
              value={statisticsMethod}
              onChange={(e) => setStatisticsMethod(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tukey">Tukey方法</option>
              <option value="standard">標準方法</option>
              <option value="percentile">百分位數方法</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {statisticsMethod === 'tukey' && 'IQR * 1.5 規則檢測異常值'}
              {statisticsMethod === 'standard' && '使用最小值和最大值'}
              {statisticsMethod === 'percentile' && '基於百分位數計算'}
            </p>
          </div>

          {/* 箱體寬度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              箱體寬度 ({boxWidth}px)
            </label>
            <input
              type="range"
              min="20"
              max="80"
              value={boxWidth}
              onChange={(e) => setBoxWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 鬚線寬度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              鬚線寬度 ({whiskerWidth}px)
            </label>
            <input
              type="range"
              min="10"
              max="40"
              value={whiskerWidth}
              onChange={(e) => setWhiskerWidth(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 異常值半徑 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              異常值半徑 ({outlierRadius}px)
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={outlierRadius}
              onChange={(e) => setOutlierRadius(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 平均值樣式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              平均值標記
            </label>
            <select
              value={meanStyle}
              onChange={(e) => setMeanStyle(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="diamond">菱形</option>
              <option value="circle">圓形</option>
              <option value="square">方形</option>
            </select>
          </div>

          {/* 填充透明度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              填充透明度 ({(boxFillOpacity * 100).toFixed(0)}%)
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={boxFillOpacity}
              onChange={(e) => setBoxFillOpacity(Number(e.target.value))}
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
                id="showWhiskers"
                checked={showWhiskers}
                onChange={(e) => setShowWhiskers(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showWhiskers" className="text-sm text-gray-700">
                顯示鬚線
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
          <BoxPlot
            data={currentData}
            labelKey={selectedDataset === 'scores' ? 'subject' : 
                     selectedDataset === 'salary' ? 'department' :
                     selectedDataset === 'response' ? 'server' : 'condition'}
            valuesKey={selectedDataset === 'scores' ? 'scores' : 
                      selectedDataset === 'salary' ? 'salaries' :
                      selectedDataset === 'response' ? 'times' : 'measurements'}
            width={orientation === 'vertical' ? 600 : 700}
            height={orientation === 'vertical' ? 500 : 400}
            orientation={orientation}
            boxWidth={boxWidth}
            whiskerWidth={whiskerWidth}
            showOutliers={showOutliers}
            showMean={showMean}
            showMedian={showMedian}
            outlierRadius={outlierRadius}
            meanStyle={meanStyle}
            boxFillOpacity={boxFillOpacity}
            statisticsMethod={statisticsMethod}
            showQuartiles={showQuartiles}
            showWhiskers={showWhiskers}
            colors={colorScheme === 'custom' ? config.colors : undefined}
            colorScheme={colorScheme}
            animate={animate}
            interactive={interactive}
            onBoxClick={(data) => {
              console.log('Box clicked:', data)
              alert(`點擊了: ${data.label}\n中位數: ${data.statistics.median.toFixed(2)}\n平均值: ${data.statistics.mean?.toFixed(2)}\n異常值: ${data.statistics.outliers.length}個`)
            }}
            onBoxHover={(data) => {
              console.log('Box hovered:', data)
            }}
          />
        </div>
      </div>

      {/* 統計摘要表格 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          統計摘要
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left font-medium text-gray-700">組別</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">樣本數</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">最小值</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Q1</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">中位數</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">Q3</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">最大值</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">平均值</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">異常值</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((row: any, index: number) => {
                const values: number[] = selectedDataset === 'scores' ? row.scores : 
                              selectedDataset === 'salary' ? row.salaries :
                              selectedDataset === 'response' ? row.times : row.measurements
                
                // 計算統計數據（簡化版本）
                const sorted = [...values].sort((a: number, b: number) => a - b)
                const n = sorted.length
                const q1 = sorted[Math.floor((n - 1) * 0.25)]
                const median = n % 2 === 0 
                  ? (sorted[Math.floor(n / 2) - 1] + sorted[Math.floor(n / 2)]) / 2
                  : sorted[Math.floor(n / 2)]
                const q3 = sorted[Math.floor((n - 1) * 0.75)]
                const mean = values.reduce((sum: number, val: number) => sum + val, 0) / n
                const iqr = q3 - q1
                const lowerFence = q1 - 1.5 * iqr
                const upperFence = q3 + 1.5 * iqr
                const outliers = values.filter((val: number) => val < lowerFence || val > upperFence)
                
                const label = selectedDataset === 'scores' ? row.subject : 
                             selectedDataset === 'salary' ? row.department :
                             selectedDataset === 'response' ? row.server : row.condition
                
                return (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="px-4 py-2 text-gray-900 font-medium">{label}</td>
                    <td className="px-4 py-2 text-gray-900">{n}</td>
                    <td className="px-4 py-2 text-gray-900">{Math.min(...values).toFixed(1)}</td>
                    <td className="px-4 py-2 text-gray-900">{q1.toFixed(1)}</td>
                    <td className="px-4 py-2 text-gray-900">{median.toFixed(1)}</td>
                    <td className="px-4 py-2 text-gray-900">{q3.toFixed(1)}</td>
                    <td className="px-4 py-2 text-gray-900">{Math.max(...values).toFixed(1)}</td>
                    <td className="px-4 py-2 text-gray-900">{mean.toFixed(1)}</td>
                    <td className="px-4 py-2 text-gray-900">{outliers.length}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 使用範例 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          程式碼範例
        </h2>
        
        <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm">
          <code>{`import { BoxPlot } from '@registry/components/box-plot'

const data = [
  { subject: '數學', scores: [85, 92, 78, 88, 95, 82, 90, 87] },
  { subject: '英文', scores: [76, 88, 92, 85, 79, 91, 87, 83] },
  { subject: '物理', scores: [88, 91, 85, 89, 92, 87, 90, 86] }
]

<BoxPlot
  data={data}
  labelKey="subject"
  valuesKey="scores"
  width={${orientation === 'vertical' ? 600 : 700}}
  height={${orientation === 'vertical' ? 500 : 400}}
  orientation="${orientation}"
  boxWidth={${boxWidth}}
  whiskerWidth={${whiskerWidth}}
  showOutliers={${showOutliers}}
  showMean={${showMean}}
  showMedian={${showMedian}}
  meanStyle="${meanStyle}"
  boxFillOpacity={${boxFillOpacity}}
  statisticsMethod="${statisticsMethod}"
  colorScheme="${colorScheme}"
  animate={${animate}}
  interactive={${interactive}}
  onBoxClick={(data) => console.log('Clicked:', data)}
/>`}</code>
        </pre>
      </div>
    </div>
  )
}