import { useState, useMemo } from 'react'
import { AreaChart } from '@registry/components/area-chart/area-chart'

// 時間序列資料
const timeSeriesData = [
  { date: '2023-01', revenue: 120000, expenses: 80000, profit: 40000 },
  { date: '2023-02', revenue: 135000, expenses: 85000, profit: 50000 },
  { date: '2023-03', revenue: 148000, expenses: 92000, profit: 56000 },
  { date: '2023-04', revenue: 162000, expenses: 98000, profit: 64000 },
  { date: '2023-05', revenue: 155000, expenses: 95000, profit: 60000 },
  { date: '2023-06', revenue: 178000, expenses: 105000, profit: 73000 },
  { date: '2023-07', revenue: 186000, expenses: 110000, profit: 76000 },
  { date: '2023-08', revenue: 192000, expenses: 115000, profit: 77000 },
  { date: '2023-09', revenue: 205000, expenses: 120000, profit: 85000 },
  { date: '2023-10', revenue: 198000, expenses: 118000, profit: 80000 },
  { date: '2023-11', revenue: 215000, expenses: 125000, profit: 90000 },
  { date: '2023-12', revenue: 228000, expenses: 132000, profit: 96000 }
]

// 多系列資料
const multiSeriesData = [
  { month: '1月', desktop: 45, mobile: 32, tablet: 18 },
  { month: '2月', desktop: 48, mobile: 35, tablet: 22 },
  { month: '3月', desktop: 52, mobile: 38, tablet: 25 },
  { month: '4月', desktop: 49, mobile: 41, tablet: 28 },
  { month: '5月', desktop: 55, mobile: 44, tablet: 30 },
  { month: '6月', desktop: 58, mobile: 47, tablet: 32 }
]

// 產品銷售資料
const productData = [
  { quarter: 'Q1', productA: 125, productB: 98, productC: 87 },
  { quarter: 'Q2', productA: 142, productB: 112, productC: 95 },
  { quarter: 'Q3', productA: 156, productB: 125, productC: 108 },
  { quarter: 'Q4', productA: 168, productB: 138, productC: 122 }
]

export default function AreaChartDemo() {
  // 控制選項
  const [selectedDataset, setSelectedDataset] = useState('timeSeries')
  const [stackMode, setStackMode] = useState<'none' | 'stack' | 'percent'>('none')
  const [curve, setCurve] = useState<'linear' | 'monotone' | 'cardinal' | 'basis' | 'step'>('monotone')
  const [fillOpacity, setFillOpacity] = useState(0.7)
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [colorScheme, setColorScheme] = useState<'custom' | 'category10' | 'set3' | 'pastel' | 'dark'>('custom')
  const [gradient, setGradient] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [showDots, setShowDots] = useState(false)
  const [showLegend, setShowLegend] = useState(true)
  const [legendPosition, setLegendPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top')
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)

  // 當前資料和映射
  const { currentData, mapping } = useMemo(() => {
    switch (selectedDataset) {
      case 'timeSeries':
        // 轉換為長格式用於多系列
        const transformed = timeSeriesData.flatMap(d => [
          { date: d.date, value: d.revenue, category: '營收' },
          { date: d.date, value: d.expenses, category: '支出' },
          { date: d.date, value: d.profit, category: '利潤' }
        ])
        return {
          currentData: transformed,
          mapping: { x: 'date', y: 'value', category: 'category' }
        }
      
      case 'multiSeries':
        const deviceData = multiSeriesData.flatMap(d => [
          { month: d.month, users: d.desktop, device: 'Desktop' },
          { month: d.month, users: d.mobile, device: 'Mobile' },
          { month: d.month, users: d.tablet, device: 'Tablet' }
        ])
        return {
          currentData: deviceData,
          mapping: { x: 'month', y: 'users', category: 'device' }
        }
      
      case 'product':
        const productSales = productData.flatMap(d => [
          { quarter: d.quarter, sales: d.productA, product: 'Product A' },
          { quarter: d.quarter, sales: d.productB, product: 'Product B' },
          { quarter: d.quarter, sales: d.productC, product: 'Product C' }
        ])
        return {
          currentData: productSales,
          mapping: { x: 'quarter', y: 'sales', category: 'product' }
        }
      
      default:
        return {
          currentData: [],
          mapping: { x: 'x', y: 'y' }
        }
    }
  }, [selectedDataset])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 標題 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Area Chart Demo
        </h1>
        <p className="text-gray-600">
          區域圖組件展示 - 支援堆疊模式、多系列資料和動畫效果
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
              <option value="timeSeries">財務時間序列</option>
              <option value="multiSeries">設備使用量</option>
              <option value="product">產品銷售</option>
            </select>
          </div>

          {/* 堆疊模式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              堆疊模式
            </label>
            <select
              value={stackMode}
              onChange={(e) => setStackMode(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">無堆疊</option>
              <option value="stack">累積堆疊</option>
              <option value="percent">百分比堆疊</option>
            </select>
          </div>

          {/* 曲線類型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              曲線類型
            </label>
            <select
              value={curve}
              onChange={(e) => setCurve(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="linear">線性</option>
              <option value="monotone">平滑</option>
              <option value="cardinal">基數樣條</option>
              <option value="basis">基樣條</option>
              <option value="step">階梯</option>
            </select>
          </div>

          {/* 填充透明度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              填充透明度 ({fillOpacity.toFixed(1)})
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={fillOpacity}
              onChange={(e) => setFillOpacity(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 線條寬度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              線條寬度 ({strokeWidth}px)
            </label>
            <input
              type="range"
              min="1"
              max="5"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
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
              <option value="category10">Category10</option>
              <option value="set3">Set3</option>
              <option value="pastel">Pastel</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          {/* 圖例位置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              圖例位置
            </label>
            <select
              value={legendPosition}
              onChange={(e) => setLegendPosition(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="top">上方</option>
              <option value="bottom">下方</option>
              <option value="left">左側</option>
              <option value="right">右側</option>
            </select>
          </div>

          {/* 切換選項 */}
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="gradient"
                checked={gradient}
                onChange={(e) => setGradient(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="gradient" className="text-sm text-gray-700">
                漸變填充
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showGrid"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showGrid" className="text-sm text-gray-700">
                顯示網格
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showDots"
                checked={showDots}
                onChange={(e) => setShowDots(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showDots" className="text-sm text-gray-700">
                顯示資料點
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showLegend"
                checked={showLegend}
                onChange={(e) => setShowLegend(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showLegend" className="text-sm text-gray-700">
                顯示圖例
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
          圖表預覽
        </h2>
        
        <div className="flex justify-center">
          <AreaChart
            data={currentData}
            mapping={mapping}
            width={800}
            height={400}
            stackMode={stackMode}
            curve={curve}
            fillOpacity={fillOpacity}
            strokeWidth={strokeWidth}
            colorScheme={colorScheme}
            gradient={gradient}
            showGrid={showGrid}
            showDots={showDots}
            showLegend={showLegend}
            legendPosition={legendPosition}
            animate={animate}
            interactive={interactive}
            onDataClick={(data, series) => {
              console.log('Area data clicked:', data, series)
              alert(`點擊了: ${series} - ${String(data.x)} (${data.y})`)
            }}
            onDataHover={(data, series) => {
              console.log('Area data hovered:', data, series)
            }}
          />
        </div>
      </div>

      {/* 資料表格 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          當前資料 (前10筆)
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                {Object.keys(currentData[0] || {}).map(key => (
                  <th key={key} className="px-4 py-2 text-left font-medium text-gray-700">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.slice(0, 10).map((row, index) => (
                <tr key={index} className="border-t border-gray-200">
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="px-4 py-2 text-gray-900">
                      {typeof value === 'number' ? value.toLocaleString() : String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          
          {currentData.length > 10 && (
            <div className="text-center text-gray-500 text-sm mt-2">
              ... 還有 {currentData.length - 10} 筆資料
            </div>
          )}
        </div>
      </div>

      {/* 使用範例 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          程式碼範例
        </h2>
        
        <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm">
          <code>{`import { AreaChart } from '@registry/components/area-chart'

const data = [
  { date: '2023-01', revenue: 120000, category: '營收' },
  { date: '2023-01', expenses: 80000, category: '支出' },
  { date: '2023-02', revenue: 135000, category: '營收' },
  { date: '2023-02', expenses: 85000, category: '支出' }
]

<AreaChart
  data={data}
  mapping={{ x: 'date', y: 'value', category: 'category' }}
  width={800}
  height={400}
  stackMode="${stackMode}"
  curve="${curve}"
  fillOpacity={${fillOpacity}}
  strokeWidth={${strokeWidth}}
  colorScheme="${colorScheme}"
  gradient={${gradient}}
  showGrid={${showGrid}}
  showDots={${showDots}}
  showLegend={${showLegend}}
  legendPosition="${legendPosition}"
  animate={${animate}}
  interactive={${interactive}}
  onDataClick={(data, series) => console.log('Clicked:', data, series)}
/>`}</code>
        </pre>
      </div>
    </div>
  )
}