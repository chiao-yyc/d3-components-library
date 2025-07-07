import React, { useState, useMemo } from 'react'

// 導入增強版 ComboChart
import { EnhancedComboChart, type EnhancedComboData, type ComboChartSeries } from '../../../registry/components/composite'

// 生成資源使用數據
const generateResourceData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  return hours.map(hour => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    cpuUsage: Math.random() * 80 + 10, // 10-90%
    memoryUsage: Math.random() * 70 + 20, // 20-90%
    networkIn: Math.random() * 100 + 10, // 10-110 Mbps
    networkOut: Math.random() * 50 + 5, // 5-55 Mbps
    activeConnections: Math.floor(Math.random() * 200) + 50, // 50-250 connections
    responseTime: Math.random() * 500 + 100 // 100-600ms
  }))
}

// 生成銷售漏斗數據
const generateSalesFunnelData = () => {
  const stages = ['展示', '點擊', '訪問', '興趣', '考慮', '購買', '復購']
  const baseValue = 10000
  return stages.map((stage, index) => ({
    stage,
    count: Math.floor(baseValue * Math.pow(0.7, index)), // 遞減漏斗
    conversionRate: index === 0 ? 100 : Math.random() * 20 + 10, // 10-30%
    revenue: Math.floor(Math.random() * 50000) + 10000, // 1-6萬
    cost: Math.floor(Math.random() * 5000) + 1000 // 1000-6000
  }))
}

// 生成股票數據
const generateStockData = () => {
  const days = ['週一', '週二', '週三', '週四', '週五', '週六', '週日']
  let price = 100
  return days.map(day => {
    const change = (Math.random() - 0.5) * 10
    price += change
    const volume = Math.floor(Math.random() * 1000000) + 500000
    return {
      day,
      price: Math.round(price * 100) / 100,
      volume,
      movingAverage: price + (Math.random() - 0.5) * 5,
      bollinger: price + Math.random() * 3
    }
  })
}

export const AreaLineComboDemo: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<'resources' | 'sales' | 'stock'>('resources')
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)
  const [selectedSeries, setSelectedSeries] = useState<string[]>([])

  // 系統資源監控數據和配置
  const resourceData = useMemo(() => generateResourceData(), [])
  const resourceSeries: ComboChartSeries[] = [
    {
      type: 'area',
      dataKey: 'cpuUsage',
      name: 'CPU 使用率',
      yAxis: 'left',
      color: '#3b82f6',
      areaOpacity: 0.4,
      curve: 'monotone'
    },
    {
      type: 'area',
      dataKey: 'memoryUsage', 
      name: '記憶體使用率',
      yAxis: 'left',
      color: '#10b981',
      areaOpacity: 0.3,
      curve: 'monotone'
    },
    {
      type: 'line',
      dataKey: 'activeConnections',
      name: '活躍連接數',
      yAxis: 'right',
      color: '#ef4444',
      strokeWidth: 3,
      showPoints: true,
      pointRadius: 4,
      curve: 'cardinal'
    }
  ]

  // 銷售漏斗數據和配置
  const salesData = useMemo(() => generateSalesFunnelData(), [])
  const salesSeries: ComboChartSeries[] = [
    {
      type: 'area',
      dataKey: 'count',
      name: '用戶數量',
      yAxis: 'left',
      color: '#6366f1',
      areaOpacity: 0.5,
      baseline: 0,
      gradient: {
        id: 'salesGradient',
        stops: [
          { offset: '0%', color: '#6366f1', opacity: 0.8 },
          { offset: '100%', color: '#6366f1', opacity: 0.1 }
        ]
      }
    },
    {
      type: 'line',
      dataKey: 'conversionRate',
      name: '轉換率',
      yAxis: 'right',
      color: '#f59e0b',
      strokeWidth: 2,
      showPoints: true,
      pointRadius: 3,
      curve: 'linear'
    },
    {
      type: 'line',
      dataKey: 'revenue',
      name: '收入',
      yAxis: 'right',
      color: '#ef4444',
      strokeWidth: 2,
      showPoints: false,
      curve: 'monotone'
    }
  ]

  // 股票數據和配置
  const stockData = useMemo(() => generateStockData(), [])
  const stockSeries: ComboChartSeries[] = [
    {
      type: 'area',
      dataKey: 'volume',
      name: '成交量',
      yAxis: 'right',
      color: '#94a3b8',
      areaOpacity: 0.3,
      curve: 'step'
    },
    {
      type: 'line',
      dataKey: 'price',
      name: '股價',
      yAxis: 'left',
      color: '#059669',
      strokeWidth: 3,
      showPoints: true,
      pointRadius: 3,
      curve: 'monotone'
    },
    {
      type: 'line',
      dataKey: 'movingAverage',
      name: '移動平均',
      yAxis: 'left',
      color: '#dc2626',
      strokeWidth: 2,
      showPoints: false,
      curve: 'monotone'
    }
  ]

  const currentData = activeScenario === 'resources' 
    ? resourceData 
    : activeScenario === 'sales' 
    ? salesData 
    : stockData
  
  const currentSeries = activeScenario === 'resources' 
    ? resourceSeries 
    : activeScenario === 'sales' 
    ? salesSeries 
    : stockSeries

  const currentXKey = activeScenario === 'resources' 
    ? 'hour' 
    : activeScenario === 'sales' 
    ? 'stage' 
    : 'day'

  const handleSeriesClick = (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => {
    console.log('Series clicked:', series.name, dataPoint)
    alert(`點擊了 ${series.name} 系列`)
  }

  const handleSeriesHover = (series: ComboChartSeries, dataPoint: any, event: React.MouseEvent) => {
    console.log('Series hovered:', series.name, dataPoint)
  }

  const toggleSeries = (seriesName: string) => {
    setSelectedSeries(prev => 
      prev.includes(seriesName) 
        ? prev.filter(name => name !== seriesName)
        : [...prev, seriesName]
    )
  }

  const visibleSeries = currentSeries.filter(s => 
    selectedSeries.length === 0 || selectedSeries.includes(s.name)
  )

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Area + Line 組合圖表演示
        </h1>
        <p className="text-gray-600 mb-6">
          展示 Area 和 Line 圖表的組合應用：系統監控、銷售分析、股票追蹤
        </p>

        {/* 場景選擇 */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveScenario('resources')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeScenario === 'resources'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            🖥️ 系統監控
          </button>
          <button
            onClick={() => setActiveScenario('sales')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeScenario === 'sales'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📊 銷售漏斗
          </button>
          <button
            onClick={() => setActiveScenario('stock')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeScenario === 'stock'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📈 股票分析
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 圖表區域 */}
          <div className="lg:col-span-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-4 text-gray-700">
                {activeScenario === 'resources' && '系統資源使用監控'}
                {activeScenario === 'sales' && '銷售漏斗分析'}
                {activeScenario === 'stock' && '股票價格與成交量'}
              </h4>
              <EnhancedComboChart
                data={currentData}
                series={visibleSeries}
                xKey={currentXKey}
                leftAxis={{
                  label: activeScenario === 'resources' 
                    ? '使用率 (%)' 
                    : activeScenario === 'sales' 
                    ? '用戶數量' 
                    : '股價',
                  gridlines: true
                }}
                rightAxis={{
                  label: activeScenario === 'resources' 
                    ? '連接數' 
                    : activeScenario === 'sales' 
                    ? '轉換率 (%) / 收入' 
                    : '成交量',
                  gridlines: false
                }}
                xAxis={{
                  label: activeScenario === 'resources' 
                    ? '時間' 
                    : activeScenario === 'sales' 
                    ? '銷售階段' 
                    : '日期',
                  gridlines: true
                }}
                animate={animate}
                interactive={interactive}
                onSeriesClick={handleSeriesClick}
                onSeriesHover={handleSeriesHover}
                width={600}
                height={400}
              />
            </div>

            {/* 數據表格 */}
            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                數據一覽表
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500">
                        {activeScenario === 'resources' ? '時間' : activeScenario === 'sales' ? '階段' : '日期'}
                      </th>
                      {currentSeries.map(series => (
                        <th key={series.dataKey} className="px-3 py-2 text-left font-medium text-gray-500">
                          {series.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentData.slice(0, 8).map((item, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 font-medium text-gray-900">
                          {item[currentXKey]}
                        </td>
                        {currentSeries.map(series => (
                          <td key={series.dataKey} className="px-3 py-2 text-gray-500">
                            {typeof item[series.dataKey] === 'number' 
                              ? item[series.dataKey].toLocaleString()
                              : item[series.dataKey]
                            }
                            {series.name.includes('率') || series.name.includes('使用') ? '%' : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 控制面板 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">控制面板</h3>
            
            {/* 系列選擇 */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                顯示系列
              </label>
              {currentSeries.map(series => (
                <div key={series.name} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`series-${series.name}`}
                    checked={selectedSeries.length === 0 || selectedSeries.includes(series.name)}
                    onChange={() => toggleSeries(series.name)}
                    className="rounded"
                  />
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: series.color }}
                  />
                  <label htmlFor={`series-${series.name}`} className="text-sm text-gray-700">
                    {series.name} ({series.type})
                  </label>
                </div>
              ))}
            </div>

            {/* 全域設定 */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="animate"
                  checked={animate}
                  onChange={(e) => setAnimate(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="animate" className="text-sm text-gray-700">
                  動畫效果
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="interactive"
                  checked={interactive}
                  onChange={(e) => setInteractive(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="interactive" className="text-sm text-gray-700">
                  互動功能
                </label>
              </div>
            </div>

            {/* 統計資訊 */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">圖表統計</h4>
              <div className="text-xs text-gray-600 space-y-1">
                <div>資料點數: {currentData.length}</div>
                <div>系列數量: {visibleSeries.length}</div>
                <div>Area 系列: {visibleSeries.filter(s => s.type === 'area').length}</div>
                <div>Line 系列: {visibleSeries.filter(s => s.type === 'line').length}</div>
                <div>左軸系列: {visibleSeries.filter(s => s.yAxis === 'left').length}</div>
                <div>右軸系列: {visibleSeries.filter(s => s.yAxis === 'right').length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 應用說明 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Area + Line 組合特點
            </h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• <strong>面積圖層</strong>: 展示數據的累積效果和整體趨勢</li>
              <li>• <strong>線條層</strong>: 精確顯示關鍵指標的變化軌跡</li>
              <li>• <strong>漸變填充</strong>: 支援自定義漸變增強視覺效果</li>
              <li>• <strong>透明度控制</strong>: 多層次數據展示不互相遮擋</li>
              <li>• <strong>基線設定</strong>: 靈活的面積圖基準線配置</li>
            </ul>
          </div>

          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              典型應用場景
            </h3>
            <ul className="text-green-800 space-y-1 text-sm">
              <li>• <strong>系統監控</strong>: 資源使用率與性能指標</li>
              <li>• <strong>銷售分析</strong>: 漏斗轉換與收入追蹤</li>
              <li>• <strong>股票分析</strong>: 價格走勢與成交量關係</li>
              <li>• <strong>網站流量</strong>: 訪問量與轉換率分析</li>
              <li>• <strong>財務報表</strong>: 收支結構與利潤率變化</li>
            </ul>
          </div>
        </div>

        {/* 程式碼範例 */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            使用範例
          </h3>
          <pre className="text-sm text-gray-700 overflow-x-auto">
{`import { EnhancedComboChart } from '@/components/composite'

const data = [
  { time: '00:00', cpu: 45, memory: 60, connections: 120 },
  { time: '01:00', cpu: 52, memory: 58, connections: 145 },
  // ...更多數據
]

const series = [
  { 
    type: 'area', 
    dataKey: 'cpu', 
    name: 'CPU使用率', 
    yAxis: 'left', 
    color: '#3b82f6',
    areaOpacity: 0.4 
  },
  { 
    type: 'area', 
    dataKey: 'memory', 
    name: '記憶體', 
    yAxis: 'left', 
    color: '#10b981',
    areaOpacity: 0.3 
  },
  { 
    type: 'line', 
    dataKey: 'connections', 
    name: '連接數', 
    yAxis: 'right', 
    color: '#ef4444',
    strokeWidth: 3 
  }
]

<EnhancedComboChart
  data={data}
  series={series}
  xKey="time"
  leftAxis={{ label: '使用率 (%)', gridlines: true }}
  rightAxis={{ label: '連接數', gridlines: false }}
  animate={true}
  interactive={true}
/>`}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default AreaLineComboDemo