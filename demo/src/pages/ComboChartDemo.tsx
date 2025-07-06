import React, { useState } from 'react'
import { BarChart } from '../components/ui/bar-chart'
import { LineChart } from '../components/ui/line-chart'

interface SampleData {
  category: string
  date: string
  sales: number
  growth: number
}

const generateSampleData = (): SampleData[] => {
  const categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const months = [
    '2024-01-01', '2024-02-01', '2024-03-01', 
    '2024-04-01', '2024-05-01', '2024-06-01'
  ]
  
  return categories.map((cat, index) => ({
    category: cat,
    date: months[index],
    sales: Math.floor(Math.random() * 100) + 20,
    growth: Math.floor(Math.random() * 50) + 10
  }))
}

export const ComboChartDemo: React.FC = () => {
  const [data, setData] = useState<SampleData[]>(generateSampleData())
  const [showBarChart, setShowBarChart] = useState(true)
  const [showLineChart, setShowLineChart] = useState(true)

  const regenerateData = () => {
    setData(generateSampleData())
  }

  const barData = data.map(d => ({
    label: d.category,
    value: d.sales
  }))

  const lineData = data.map(d => ({
    x: d.date,
    y: d.growth,
    category: d.category
  }))

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          模組化組合圖表演示
        </h1>
        <p className="text-gray-600 mb-6">
          展示模組化組件系統的概念：將獨立的 Bar 和 Line 組件組合使用
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          <div className="lg:col-span-3 space-y-6">
            {/* Bar Chart Section */}
            {showBarChart && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  銷售數據 (Bar Chart)
                </h3>
                <div className="h-80">
                  <BarChart
                    data={barData}
                    animate={true}
                    interactive={true}
                    color="#3b82f6"
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Line Chart Section */}
            {showLineChart && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  成長率數據 (Line Chart)
                </h3>
                <div className="h-80">
                  <LineChart
                    data={lineData}
                    animate={true}
                    interactive={true}
                    colors={["#ef4444"]}
                    strokeWidth={3}
                    showDots={true}
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Combined Data Table */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                組合數據表
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        月份
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        銷售額
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        成長率 (%)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {data.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.sales}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.growth}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">控制項</h3>
            
            <div className="space-y-3">
              <button
                onClick={regenerateData}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
              >
                重新生成資料
              </button>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showBar"
                  checked={showBarChart}
                  onChange={(e) => setShowBarChart(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="showBar" className="text-sm text-gray-700">
                  顯示 Bar Chart
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showLine"
                  checked={showLineChart}
                  onChange={(e) => setShowLineChart(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="showLine" className="text-sm text-gray-700">
                  顯示 Line Chart
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            模組化組件系統概念展示
          </h3>
          <p className="text-blue-800 text-sm mb-3">
            這個展示頁面說明了模組化組件系統的核心概念，雖然目前使用獨立的圖表組件，
            但展示了如何將不同的圖表類型組合在同一個視圖中。
          </p>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• <strong>獨立組件</strong>: 每個圖表都是獨立的可重用組件</li>
            <li>• <strong>數據分離</strong>: 相同的數據源可以用於不同的視覺化</li>
            <li>• <strong>靈活組合</strong>: 可以選擇性地顯示或隱藏不同的圖表</li>
            <li>• <strong>統一介面</strong>: 所有圖表組件都有一致的 API</li>
          </ul>
        </div>

        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
          <h3 className="text-lg font-semibold text-green-900 mb-2">
            已實現的 Primitives 系統
          </h3>
          <p className="text-green-800 text-sm mb-3">
            在 registry/components/primitives 中，我們已經建立了完整的原子級組件系統：
          </p>
          <ul className="text-green-800 space-y-1 text-sm">
            <li>• <strong>ChartCanvas</strong>: 統一的 SVG 容器和維度管理</li>
            <li>• <strong>ScaleManager</strong>: 自動比例尺配置和協調</li>
            <li>• <strong>LayerManager</strong>: 圖層順序和渲染管理</li>
            <li>• <strong>Axis Components</strong>: 獨立的 X/Y 軸和雙軸組件</li>
            <li>• <strong>Shape Components</strong>: 原子級的 Bar, Line, Area 元素</li>
            <li>• <strong>ComboChart</strong>: 展示組合能力的範例組件</li>
          </ul>
          <p className="text-green-800 text-sm mt-3">
            這些組件可以像樂高積木一樣組合成任何需要的圖表類型！
          </p>
        </div>

        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            真正的模組化使用方式 (在 primitives 中實現)
          </h3>
          <pre className="text-sm text-gray-700 overflow-x-auto">
{`import { 
  ChartCanvas, 
  LayerManager, 
  XAxis, 
  DualAxis, 
  Bar, 
  Line 
} from '@/components/primitives'

<ChartCanvas width={800} height={400}>
  <LayerManager>
    <XAxis scale={xScale} label="月份" />
    <DualAxis 
      leftAxis={{ scale: barYScale, label: "銷售額" }}
      rightAxis={{ scale: lineYScale, label: "成長率" }}
    />
    <Bar data={barData} xScale={xScale} yScale={barYScale} />
    <Line data={lineData} xScale={xScale} yScale={lineYScale} />
  </LayerManager>
</ChartCanvas>`}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default ComboChartDemo