import { useState, useMemo } from 'react'
import { Heatmap } from '@registry/components/heatmap'

// 相關性矩陣資料
const correlationData = [
  { var1: 'Sales', var2: 'Marketing', correlation: 0.85 },
  { var1: 'Sales', var2: 'Price', correlation: -0.62 },
  { var1: 'Sales', var2: 'Quality', correlation: 0.73 },
  { var1: 'Sales', var2: 'Service', correlation: 0.91 },
  { var1: 'Marketing', var2: 'Price', correlation: -0.45 },
  { var1: 'Marketing', var2: 'Quality', correlation: 0.56 },
  { var1: 'Marketing', var2: 'Service', correlation: 0.68 },
  { var1: 'Price', var2: 'Quality', correlation: -0.23 },
  { var1: 'Price', var2: 'Service', correlation: -0.34 },
  { var1: 'Quality', var2: 'Service', correlation: 0.79 },
  // 對角線 (自相關)
  { var1: 'Sales', var2: 'Sales', correlation: 1.0 },
  { var1: 'Marketing', var2: 'Marketing', correlation: 1.0 },
  { var1: 'Price', var2: 'Price', correlation: 1.0 },
  { var1: 'Quality', var2: 'Quality', correlation: 1.0 },
  { var1: 'Service', var2: 'Service', correlation: 1.0 },
  // 鏡射資料
  { var1: 'Marketing', var2: 'Sales', correlation: 0.85 },
  { var1: 'Price', var2: 'Sales', correlation: -0.62 },
  { var1: 'Quality', var2: 'Sales', correlation: 0.73 },
  { var1: 'Service', var2: 'Sales', correlation: 0.91 },
  { var1: 'Price', var2: 'Marketing', correlation: -0.45 },
  { var1: 'Quality', var2: 'Marketing', correlation: 0.56 },
  { var1: 'Service', var2: 'Marketing', correlation: 0.68 },
  { var1: 'Quality', var2: 'Price', correlation: -0.23 },
  { var1: 'Service', var2: 'Price', correlation: -0.34 },
  { var1: 'Service', var2: 'Quality', correlation: 0.79 }
]

// 銷售熱力圖資料
const salesData = [
  { month: '1月', product: 'Product A', sales: 120 },
  { month: '1月', product: 'Product B', sales: 89 },
  { month: '1月', product: 'Product C', sales: 156 },
  { month: '1月', product: 'Product D', sales: 78 },
  { month: '2月', product: 'Product A', sales: 135 },
  { month: '2月', product: 'Product B', sales: 92 },
  { month: '2月', product: 'Product C', sales: 168 },
  { month: '2月', product: 'Product D', sales: 85 },
  { month: '3月', product: 'Product A', sales: 148 },
  { month: '3月', product: 'Product B', sales: 110 },
  { month: '3月', product: 'Product C', sales: 145 },
  { month: '3月', product: 'Product D', sales: 95 },
  { month: '4月', product: 'Product A', sales: 162 },
  { month: '4月', product: 'Product B', sales: 125 },
  { month: '4月', product: 'Product C', sales: 178 },
  { month: '4月', product: 'Product D', sales: 88 },
  { month: '5月', product: 'Product A', sales: 155 },
  { month: '5月', product: 'Product B', sales: 118 },
  { month: '5月', product: 'Product C', sales: 192 },
  { month: '5月', product: 'Product D', sales: 102 },
  { month: '6月', product: 'Product A', sales: 178 },
  { month: '6月', product: 'Product B', sales: 135 },
  { month: '6月', product: 'Product C', sales: 205 },
  { month: '6月', product: 'Product D', sales: 115 }
]

// 評分矩陣資料
const ratingData = [
  { user: 'User 1', item: 'Item A', rating: 4.5 },
  { user: 'User 1', item: 'Item B', rating: 3.2 },
  { user: 'User 1', item: 'Item C', rating: 5.0 },
  { user: 'User 1', item: 'Item D', rating: 2.8 },
  { user: 'User 2', item: 'Item A', rating: 3.8 },
  { user: 'User 2', item: 'Item B', rating: 4.1 },
  { user: 'User 2', item: 'Item C', rating: 3.5 },
  { user: 'User 2', item: 'Item D', rating: 4.8 },
  { user: 'User 3', item: 'Item A', rating: 5.0 },
  { user: 'User 3', item: 'Item B', rating: 2.9 },
  { user: 'User 3', item: 'Item C', rating: 4.2 },
  { user: 'User 3', item: 'Item D', rating: 3.6 },
  { user: 'User 4', item: 'Item A', rating: 2.5 },
  { user: 'User 4', item: 'Item B', rating: 4.7 },
  { user: 'User 4', item: 'Item C', rating: 3.9 },
  { user: 'User 4', item: 'Item D', rating: 5.0 },
  { user: 'User 5', item: 'Item A', rating: 4.0 },
  { user: 'User 5', item: 'Item B', rating: 3.7 },
  { user: 'User 5', item: 'Item C', rating: 4.8 },
  { user: 'User 5', item: 'Item D', rating: 3.3 }
]

export default function HeatmapDemo() {
  // 控制選項
  const [selectedDataset, setSelectedDataset] = useState('correlation')
  const [colorScheme, setColorScheme] = useState<'blues' | 'greens' | 'reds' | 'oranges' | 'purples' | 'greys'>('blues')
  const [cellRadius, setCellRadius] = useState(0)
  const [cellPadding, setCellPadding] = useState(2)
  const [showValues, setShowValues] = useState(false)
  const [showLegend, setShowLegend] = useState(true)
  const [legendPosition, setLegendPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('right')
  const [xAxisRotation, setXAxisRotation] = useState(-45)
  const [yAxisRotation, setYAxisRotation] = useState(0)
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)

  // 當前資料和配置
  const { currentData, mapping, config } = useMemo(() => {
    switch (selectedDataset) {
      case 'correlation':
        return {
          currentData: correlationData,
          mapping: { x: 'var1', y: 'var2', value: 'correlation' },
          config: {
            domain: [-1, 1] as [number, number],
            legendTitle: '相關係數',
            valueFormat: (d: number) => d.toFixed(2)
          }
        }
      
      case 'sales':
        return {
          currentData: salesData,
          mapping: { x: 'month', y: 'product', value: 'sales' },
          config: {
            domain: undefined,
            legendTitle: '銷售額',
            valueFormat: (d: number) => d.toFixed(0)
          }
        }
      
      case 'rating':
        return {
          currentData: ratingData,
          mapping: { x: 'user', y: 'item', value: 'rating' },
          config: {
            domain: [1, 5] as [number, number],
            legendTitle: '評分',
            valueFormat: (d: number) => d.toFixed(1)
          }
        }
      
      default:
        return {
          currentData: [],
          mapping: { x: 'x', y: 'y', value: 'value' },
          config: {}
        }
    }
  }, [selectedDataset])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 標題 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Heatmap Demo
        </h1>
        <p className="text-gray-600">
          熱力圖組件展示 - 適用於矩陣資料視覺化和相關性分析
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
              <option value="correlation">相關性矩陣</option>
              <option value="sales">產品銷售</option>
              <option value="rating">用戶評分</option>
            </select>
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
              <option value="blues">藍色</option>
              <option value="greens">綠色</option>
              <option value="reds">紅色</option>
              <option value="oranges">橙色</option>
              <option value="purples">紫色</option>
              <option value="greys">灰色</option>
            </select>
          </div>

          {/* 格子圓角 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              格子圓角 ({cellRadius}px)
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={cellRadius}
              onChange={(e) => setCellRadius(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 格子間距 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              格子間距 ({cellPadding}px)
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={cellPadding}
              onChange={(e) => setCellPadding(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* X軸旋轉 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              X軸標籤旋轉 ({xAxisRotation}°)
            </label>
            <input
              type="range"
              min="-90"
              max="90"
              value={xAxisRotation}
              onChange={(e) => setXAxisRotation(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Y軸旋轉 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Y軸標籤旋轉 ({yAxisRotation}°)
            </label>
            <input
              type="range"
              min="-90"
              max="90"
              value={yAxisRotation}
              onChange={(e) => setYAxisRotation(Number(e.target.value))}
              className="w-full"
            />
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
                id="showValues"
                checked={showValues}
                onChange={(e) => setShowValues(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showValues" className="text-sm text-gray-700">
                顯示數值
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
          <Heatmap
            data={currentData}
            mapping={mapping}
            width={700}
            height={500}
            colorScheme={colorScheme}
            cellRadius={cellRadius}
            cellPadding={cellPadding}
            showValues={showValues}
            showLegend={showLegend}
            legendPosition={legendPosition}
            legendTitle={config.legendTitle}
            xAxisRotation={xAxisRotation}
            yAxisRotation={yAxisRotation}
            animate={animate}
            interactive={interactive}
            domain={config.domain}
            valueFormat={config.valueFormat}
            onCellClick={(data) => {
              console.log('Heatmap cell clicked:', data)
              alert(`點擊了: (${data.x}, ${data.y}) = ${data.value}`)
            }}
            onCellHover={(data) => {
              console.log('Heatmap cell hovered:', data)
            }}
          />
        </div>
      </div>

      {/* 資料表格 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          當前資料 (前15筆)
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
              {currentData.slice(0, 15).map((row, index) => (
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
          
          {currentData.length > 15 && (
            <div className="text-center text-gray-500 text-sm mt-2">
              ... 還有 {currentData.length - 15} 筆資料
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
          <code>{`import { Heatmap } from '@registry/components/heatmap'

const data = [
  { x: 'A', y: '1', value: 0.8 },
  { x: 'A', y: '2', value: 0.6 },
  { x: 'B', y: '1', value: 0.9 },
  { x: 'B', y: '2', value: 0.4 }
]

<Heatmap
  data={data}
  mapping={{ x: 'x', y: 'y', value: 'value' }}
  width={700}
  height={500}
  colorScheme="${colorScheme}"
  cellRadius={${cellRadius}}
  cellPadding={${cellPadding}}
  showValues={${showValues}}
  showLegend={${showLegend}}
  legendPosition="${legendPosition}"
  xAxisRotation={${xAxisRotation}}
  yAxisRotation={${yAxisRotation}}
  animate={${animate}}
  interactive={${interactive}}
  onCellClick={(data) => console.log('Clicked:', data)}
/>`}</code>
        </pre>
      </div>
    </div>
  )
}