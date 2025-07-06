import { useState } from 'react'
import {
  BarChartSimple,
  SimpleLineChart,
  SimplePieChart,
  SimpleScatterPlot,
  SimpleAreaChart,
  SimpleHeatmap,
  SimpleCandlestick
} from '@registry/components/simple'

// 示範數據
const barData = [
  { x: 'A', y: 100 },
  { x: 'B', y: 200 },
  { x: 'C', y: 150 },
  { x: 'D', y: 300 },
  { x: 'E', y: 250 }
]

const lineData = [
  { x: new Date('2024-01-01'), y: 100 },
  { x: new Date('2024-01-02'), y: 120 },
  { x: new Date('2024-01-03'), y: 80 },
  { x: new Date('2024-01-04'), y: 150 },
  { x: new Date('2024-01-05'), y: 200 }
]

const pieData = [
  { label: 'Chrome', value: 60 },
  { label: 'Firefox', value: 25 },
  { label: 'Safari', value: 10 },
  { label: 'Edge', value: 5 }
]

const scatterData = [
  { x: 10, y: 20, size: 5 },
  { x: 20, y: 30, size: 8 },
  { x: 30, y: 25, size: 6 },
  { x: 40, y: 40, size: 10 },
  { x: 50, y: 35, size: 7 }
]

const areaData = [
  { x: new Date('2024-01-01'), y: 100, series: 'A' },
  { x: new Date('2024-01-02'), y: 120, series: 'A' },
  { x: new Date('2024-01-03'), y: 80, series: 'A' },
  { x: new Date('2024-01-01'), y: 80, series: 'B' },
  { x: new Date('2024-01-02'), y: 90, series: 'B' },
  { x: new Date('2024-01-03'), y: 110, series: 'B' }
]

const heatmapData = [
  { x: 'Mon', y: 'Morning', value: 5 },
  { x: 'Mon', y: 'Afternoon', value: 8 },
  { x: 'Mon', y: 'Evening', value: 3 },
  { x: 'Tue', y: 'Morning', value: 7 },
  { x: 'Tue', y: 'Afternoon', value: 9 },
  { x: 'Tue', y: 'Evening', value: 4 },
  { x: 'Wed', y: 'Morning', value: 6 },
  { x: 'Wed', y: 'Afternoon', value: 7 },
  { x: 'Wed', y: 'Evening', value: 2 }
]

const candlestickData = [
  { date: '2024-01-01', open: 100, high: 110, low: 95, close: 105 },
  { date: '2024-01-02', open: 105, high: 115, low: 100, close: 108 },
  { date: '2024-01-03', open: 108, high: 112, low: 102, close: 107 },
  { date: '2024-01-04', open: 107, high: 120, low: 105, close: 118 },
  { date: '2024-01-05', open: 118, high: 125, low: 115, close: 122 }
]

export default function SimpleComponentsDemo() {
  const [activeTab, setActiveTab] = useState('bar')

  const tabs = [
    { id: 'bar', name: '柱狀圖', component: 'BarChartSimple' },
    { id: 'line', name: '線圖', component: 'SimpleLineChart' },
    { id: 'pie', name: '餅圖', component: 'SimplePieChart' },
    { id: 'scatter', name: '散佈圖', component: 'SimpleScatterPlot' },
    { id: 'area', name: '面積圖', component: 'SimpleAreaChart' },
    { id: 'heatmap', name: '熱力圖', component: 'SimpleHeatmap' },
    { id: 'candlestick', name: 'K線圖', component: 'SimpleCandlestick' }
  ]

  const renderChart = () => {
    switch (activeTab) {
      case 'bar':
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">使用方法</h4>
              <pre className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
{`import { BarChartSimple } from '@registry/components/simple'

const data = [
  { x: 'A', y: 100 },
  { x: 'B', y: 200 }
]

<BarChartSimple data={data} />`}
              </pre>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <BarChartSimple 
                data={barData}
                width={600}
                height={300}
                onDataClick={(data) => alert(`點擊了: ${data.x} = ${data.y}`)}
              />
            </div>
          </div>
        )
      
      case 'line':
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">使用方法</h4>
              <pre className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
{`import { SimpleLineChart } from '@registry/components/simple'

const data = [
  { x: new Date('2024-01-01'), y: 100 },
  { x: new Date('2024-01-02'), y: 120 }
]

<SimpleLineChart data={data} showDots={true} />`}
              </pre>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <SimpleLineChart 
                data={lineData}
                width={600}
                height={300}
                showDots={true}
                showArea={false}
                curve="monotone"
                onDataClick={(data) => alert(`點擊了: ${data.x} = ${data.y}`)}
              />
            </div>
          </div>
        )
      
      case 'pie':
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">使用方法</h4>
              <pre className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
{`import { SimplePieChart } from '@registry/components/simple'

const data = [
  { label: 'Chrome', value: 60 },
  { label: 'Firefox', value: 25 }
]

<SimplePieChart data={data} showLegend={true} />`}
              </pre>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <SimplePieChart 
                data={pieData}
                width={500}
                height={400}
                showLegend={true}
                showPercentages={true}
                onSliceClick={(data) => alert(`點擊了: ${data.label} = ${data.value}`)}
              />
            </div>
          </div>
        )
      
      case 'scatter':
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">使用方法</h4>
              <pre className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
{`import { SimpleScatterPlot } from '@registry/components/simple'

const data = [
  { x: 10, y: 20, size: 5 },
  { x: 20, y: 30, size: 8 }
]

<SimpleScatterPlot data={data} showTrendLine={true} />`}
              </pre>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <SimpleScatterPlot 
                data={scatterData}
                width={600}
                height={400}
                showTrendLine={true}
                showGrid={true}
                xLabel="X 軸值"
                yLabel="Y 軸值"
                onDotClick={(data) => alert(`點擊了: (${data.x}, ${data.y})`)}
              />
            </div>
          </div>
        )
      
      case 'area':
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">使用方法</h4>
              <pre className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
{`import { SimpleAreaChart } from '@registry/components/simple'

const data = [
  { x: new Date('2024-01-01'), y: 100, series: 'A' },
  { x: new Date('2024-01-02'), y: 120, series: 'A' }
]

<SimpleAreaChart data={data} stackMode="none" />`}
              </pre>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <SimpleAreaChart 
                data={areaData}
                width={600}
                height={300}
                stackMode="none"
                showLine={true}
                areaOpacity={0.6}
                onAreaClick={(data) => alert(`點擊了: ${data.series} = ${data.y}`)}
              />
            </div>
          </div>
        )
      
      case 'heatmap':
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">使用方法</h4>
              <pre className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
{`import { SimpleHeatmap } from '@registry/components/simple'

const data = [
  { x: 'Mon', y: 'Morning', value: 5 },
  { x: 'Mon', y: 'Afternoon', value: 8 }
]

<SimpleHeatmap data={data} colorScheme="blues" />`}
              </pre>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <SimpleHeatmap 
                data={heatmapData}
                width={500}
                height={300}
                colorScheme="blues"
                showValues={true}
                onCellClick={(data) => alert(`點擊了: ${data.x}, ${data.y} = ${data.value}`)}
              />
            </div>
          </div>
        )
      
      case 'candlestick':
        return (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">使用方法</h4>
              <pre className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
{`import { SimpleCandlestick } from '@registry/components/simple'

const data = [
  { date: '2024-01-01', open: 100, high: 110, low: 95, close: 105 }
]

<SimpleCandlestick data={data} colorMode="tw" />`}
              </pre>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <SimpleCandlestick 
                data={candlestickData}
                width={600}
                height={300}
                colorMode="tw"
                onCandleClick={(data) => alert(`點擊了: ${data.date} 收盤價 ${data.close}`)}
              />
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* 標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            簡化版圖表組件
          </h1>
          <p className="text-gray-600">
            專為快速使用和學習而設計的簡化圖表組件，提供最基本但完整的功能
          </p>
        </div>

        {/* 特色說明 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">🚀 快速上手</h3>
            <p className="text-sm text-gray-600">
              最少的屬性配置，即可創建美觀的圖表
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">📝 學習友好</h3>
            <p className="text-sm text-gray-600">
              清晰的 API 設計，適合學習 D3.js 和 React
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">🎨 美觀設計</h3>
            <p className="text-sm text-gray-600">
              內建美觀的預設樣式和配色方案
            </p>
          </div>
        </div>

        {/* 標籤導航 */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
                <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                  {tab.component}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* 圖表展示 */}
        <div className="space-y-6">
          {renderChart()}
        </div>

        {/* 底部說明 */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 使用提示</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• 所有簡化組件都支援基本的互動功能（點擊、懸停）</li>
            <li>• 可通過 className 屬性自定義樣式</li>
            <li>• 支援 TypeScript，提供完整的類型定義</li>
            <li>• 如需更高級功能，請使用完整版組件</li>
          </ul>
        </div>
      </div>
    </div>
  )
}