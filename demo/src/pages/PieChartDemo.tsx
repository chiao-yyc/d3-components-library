import { useState, useMemo } from 'react'
import { PieChart } from '@registry/components/basic/pie-chart'

// 範例資料
const sampleData = [
  { category: '產品A', sales: 45000, region: '北部' },
  { category: '產品B', sales: 32000, region: '中部' },
  { category: '產品C', sales: 28000, region: '南部' },
  { category: '產品D', sales: 21000, region: '東部' },
  { category: '產品E', sales: 15000, region: '北部' },
  { category: '產品F', sales: 12000, region: '中部' }
]

const marketShareData = [
  { company: 'Company A', share: 35.2 },
  { company: 'Company B', share: 23.8 },
  { company: 'Company C', share: 18.5 },
  { company: 'Company D', share: 12.1 },
  { company: '其他', share: 10.4 }
]

const expenseData = [
  { category: '薪資', amount: 45000, type: '固定成本' },
  { category: '租金', amount: 12000, type: '固定成本' },
  { category: '材料', amount: 28000, type: '變動成本' },
  { category: '行銷', amount: 15000, type: '變動成本' },
  { category: '水電', amount: 8000, type: '固定成本' },
  { category: '其他', amount: 6000, type: '變動成本' }
]

export default function PieChartDemo() {
  // 控制選項
  const [selectedDataset, setSelectedDataset] = useState('sales')
  const [innerRadius, setInnerRadius] = useState(0)
  const [showLabels, setShowLabels] = useState(true)
  const [showLegend, setShowLegend] = useState(true)
  const [legendPosition, setLegendPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('right')
  const [colorScheme, setColorScheme] = useState<'custom' | 'category10' | 'set3' | 'pastel' | 'dark'>('custom')
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)
  const [showPercentages, setShowPercentages] = useState(true)
  const [labelThreshold, setLabelThreshold] = useState(5)
  const [showCenterText, setShowCenterText] = useState(true)
  const [hoverEffect, setHoverEffect] = useState<'lift' | 'scale' | 'glow' | 'none'>('lift')

  // 當前資料
  const currentData = useMemo(() => {
    switch (selectedDataset) {
      case 'sales':
        return sampleData
      case 'market':
        return marketShareData
      case 'expense':
        return expenseData
      default:
        return sampleData
    }
  }, [selectedDataset])

  // 資料映射
  const mapping = useMemo(() => {
    switch (selectedDataset) {
      case 'sales':
        return { label: 'category', value: 'sales', color: 'region' }
      case 'market':
        return { label: 'company', value: 'share', color: 'company' }
      case 'expense':
        return { label: 'category', value: 'amount', color: 'type' }
      default:
        return { label: 'category', value: 'sales' }
    }
  }, [selectedDataset])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 標題 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Pie Chart Demo
        </h1>
        <p className="text-gray-600">
          圓餅圖組件展示 - 支援甜甜圈模式、動畫和互動功能
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
              <option value="sales">產品銷售額</option>
              <option value="market">市場佔有率</option>
              <option value="expense">支出分析</option>
            </select>
          </div>

          {/* 內半徑 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              內半徑 ({innerRadius})
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={innerRadius}
              onChange={(e) => setInnerRadius(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">
              0 = 圓餅圖, &gt;0 = 甜甜圈圖
            </div>
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

          {/* 標籤閾值 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              標籤顯示閾值 ({labelThreshold}%)
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={labelThreshold}
              onChange={(e) => setLabelThreshold(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 懸停效果 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              懸停效果
            </label>
            <select
              value={hoverEffect}
              onChange={(e) => setHoverEffect(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="lift">上升</option>
              <option value="scale">縮放</option>
              <option value="glow">光暈</option>
              <option value="none">無</option>
            </select>
          </div>

          {/* 切換選項 */}
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showLabels"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showLabels" className="text-sm text-gray-700">
                顯示標籤
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
                id="showPercentages"
                checked={showPercentages}
                onChange={(e) => setShowPercentages(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showPercentages" className="text-sm text-gray-700">
                顯示百分比
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
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showCenterText"
                checked={showCenterText}
                onChange={(e) => setShowCenterText(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showCenterText" className="text-sm text-gray-700">
                顯示中心文字 (甜甜圈)
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
          <PieChart
            data={currentData}
            mapping={mapping}
            width={600}
            height={400}
            innerRadius={innerRadius}
            colorScheme={colorScheme}
            showLabels={showLabels}
            showLegend={showLegend}
            legendPosition={legendPosition}
            showPercentages={showPercentages}
            labelThreshold={labelThreshold}
            animate={animate}
            interactive={interactive}
            showCenterText={showCenterText}
            hoverEffect={hoverEffect}
            onSliceClick={(data) => {
              console.log('Pie slice clicked:', data)
              alert(`點擊了: ${data.label} (${data.value})`)
            }}
            onSliceHover={(data) => {
              console.log('Pie slice hovered:', data)
            }}
          />
        </div>
      </div>

      {/* 資料表格 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          當前資料
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
              {currentData.map((row, index) => (
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
        </div>
      </div>

      {/* 使用範例 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          程式碼範例
        </h2>
        
        <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm">
          <code>{`import { PieChart } from '@registry/components/basic/pie-chart'

const data = [
  { category: '產品A', sales: 45000 },
  { category: '產品B', sales: 32000 },
  { category: '產品C', sales: 28000 }
]

<PieChart
  data={data}
  mapping={{ label: 'category', value: 'sales' }}
  width={600}
  height={400}
  innerRadius={${innerRadius}}
  colorScheme="${colorScheme}"
  showLabels={${showLabels}}
  showLegend={${showLegend}}
  legendPosition="${legendPosition}"
  animate={${animate}}
  interactive={${interactive}}
  onSliceClick={(data) => console.log('Clicked:', data)}
/>`}</code>
        </pre>
      </div>
    </div>
  )
}