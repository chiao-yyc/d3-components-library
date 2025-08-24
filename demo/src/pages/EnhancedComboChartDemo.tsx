import React, { useState, useMemo } from 'react'

// 導入真正的增強版 ComboChart
import { EnhancedComboChart, type EnhancedComboData, type ComboChartSeries } from '../../../registry/components/composite'

// 生成示例數據
const generateSalesData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months.map((month, index) => ({
    month,
    revenue: Math.floor(Math.random() * 500000) + 300000, // 30-80萬
    profit: Math.floor(Math.random() * 100000) + 50000,   // 5-15萬  
    growthRate: (Math.random() * 30) - 5,                 // -5% to 25%
    marketShare: Math.random() * 15 + 20,                 // 20% to 35%
    customerCount: Math.floor(Math.random() * 2000) + 3000, // 3000-5000
    avgOrderValue: Math.floor(Math.random() * 200) + 150   // 150-350
  }))
}

const generatePerformanceData = () => {
  const quarters = ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024']
  return quarters.map(quarter => ({
    quarter,
    budget: Math.floor(Math.random() * 1000000) + 2000000,
    actual: Math.floor(Math.random() * 900000) + 1800000,
    efficiency: Math.random() * 20 + 80, // 80-100%
    satisfaction: Math.random() * 15 + 85 // 85-100
  }))
}

export const EnhancedComboChartDemo: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<'sales' | 'performance'>('sales')
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)
  const [selectedSeries, setSelectedSeries] = useState<string[]>([])

  // 銷售分析數據和配置
  const salesData = useMemo(() => generateSalesData(), [])
  const salesSeries: ComboChartSeries[] = [
    {
      type: 'bar',
      dataKey: 'revenue',
      name: '營收',
      yAxis: 'left',
      color: '#3b82f6',
      barOpacity: 0.8
    },
    {
      type: 'bar', 
      dataKey: 'profit',
      name: '利潤',
      yAxis: 'left',
      color: '#10b981',
      barOpacity: 0.8
    },
    {
      type: 'line',
      dataKey: 'growthRate',
      name: '成長率',
      yAxis: 'right',
      color: '#ef4444',
      strokeWidth: 3,
      showPoints: true,
      pointRadius: 4,
      curve: 'monotone'
    }
  ]

  // 績效分析數據和配置  
  const performanceData = useMemo(() => generatePerformanceData(), [])
  const performanceSeries: ComboChartSeries[] = [
    {
      type: 'bar',
      dataKey: 'budget',
      name: '預算',
      yAxis: 'left',
      color: '#6b7280',
      barOpacity: 0.6
    },
    {
      type: 'bar',
      dataKey: 'actual', 
      name: '實際',
      yAxis: 'left',
      color: '#3b82f6',
      barOpacity: 0.9
    },
    {
      type: 'line',
      dataKey: 'efficiency',
      name: '效率',
      yAxis: 'right',
      color: '#f59e0b',
      strokeWidth: 2,
      showPoints: true,
      curve: 'cardinal'
    },
    {
      type: 'line',
      dataKey: 'satisfaction',
      name: '滿意度',
      yAxis: 'right', 
      color: '#8b5cf6',
      strokeWidth: 2,
      showPoints: true,
      curve: 'monotone'
    }
  ]

  const currentData = activeScenario === 'sales' ? salesData : performanceData
  const currentSeries = activeScenario === 'sales' ? salesSeries : performanceSeries
  const currentXKey = activeScenario === 'sales' ? 'month' : 'quarter'

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          📊 Enhanced ComboChart 增強版組合圖表演示
        </h1>
        <p className="text-gray-600 mb-6">
          展示增強版 ComboChart 的進階功能：靈活數據映射、多軸配置、互動控制
        </p>

        {/* 場景選擇 */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveScenario('sales')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeScenario === 'sales'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            💰 銷售分析
          </button>
          <button
            onClick={() => setActiveScenario('performance')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeScenario === 'performance'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📊 績效分析
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 圖表區域 */}
          <div className="lg:col-span-3">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-4 text-gray-700">Production Chart</h4>
              <EnhancedComboChart
                data={currentData}
                series={visibleSeries}
                xKey={currentXKey}
                leftAxis={{
                  label: activeScenario === 'sales' ? '金額 (萬元)' : '預算 vs 實際 (萬元)',
                  gridlines: true
                }}
                rightAxis={{
                  label: activeScenario === 'sales' ? '成長率 (%)' : '績效指標 (%)',
                  gridlines: false
                }}
                xAxis={{
                  label: activeScenario === 'sales' ? '月份' : '季度',
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
                        {activeScenario === 'sales' ? '月份' : '季度'}
                      </th>
                      {currentSeries.map(series => (
                        <th key={series.dataKey} className="px-3 py-2 text-left font-medium text-gray-500">
                          {series.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentData.map((item, index) => (
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
                            {series.dataKey.includes('Rate') || series.dataKey.includes('efficiency') || series.dataKey.includes('satisfaction') ? '%' : ''}
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
                <div>Bar 系列: {visibleSeries.filter(s => s.type === 'bar').length}</div>
                <div>Line 系列: {visibleSeries.filter(s => s.type === 'line').length}</div>
                <div>左軸系列: {visibleSeries.filter(s => s.yAxis === 'left').length}</div>
                <div>右軸系列: {visibleSeries.filter(s => s.yAxis === 'right').length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 功能說明 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              增強功能特點
            </h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• <strong>靈活數據接口</strong>: 統一數據源，系列配置分離</li>
              <li>• <strong>精細軸線控制</strong>: 獨立的左右軸配置和格式化</li>
              <li>• <strong>智能比例尺</strong>: 自動檢測數據類型和範圍</li>
              <li>• <strong>豐富互動</strong>: 點擊、懸停事件處理</li>
              <li>• <strong>視覺自訂</strong>: 每個系列獨立的樣式配置</li>
            </ul>
          </div>

          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded">
            <h3 className="text-lg font-semibold text-green-900 mb-2">
              使用場景
            </h3>
            <ul className="text-green-800 space-y-1 text-sm">
              <li>• <strong>業務分析</strong>: 收入、利潤與成長率對比</li>
              <li>• <strong>績效監控</strong>: 預算執行與效率指標</li>
              <li>• <strong>市場分析</strong>: 銷量與市佔率趨勢</li>
              <li>• <strong>財務報表</strong>: 多維度財務數據視覺化</li>
              <li>• <strong>運營儀表板</strong>: KPI 監控與趨勢分析</li>
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
  { month: 'Jan', revenue: 500000, profit: 80000, growthRate: 12.5 },
  { month: 'Feb', revenue: 650000, profit: 95000, growthRate: 18.2 },
  // ...更多數據
]

const series = [
  { type: 'bar', dataKey: 'revenue', name: '營收', yAxis: 'left', color: '#3b82f6' },
  { type: 'bar', dataKey: 'profit', name: '利潤', yAxis: 'left', color: '#10b981' },
  { type: 'line', dataKey: 'growthRate', name: '成長率', yAxis: 'right', color: '#ef4444' }
]

<EnhancedComboChart
  data={data}
  series={series}
  xKey="month"
  leftAxis={{ label: '金額 (萬元)', gridlines: true }}
  rightAxis={{ label: '成長率 (%)', gridlines: false }}
  animate={true}
  interactive={true}
  onSeriesClick={(series, dataPoint) => console.log('Clicked:', series.name)}
/>`}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default EnhancedComboChartDemo