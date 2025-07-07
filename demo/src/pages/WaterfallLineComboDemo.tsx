import React, { useState } from 'react'
import { EnhancedComboChart } from '../../../registry/components/composite/enhanced-combo-chart'
import type { ComboChartSeries } from '../../../registry/components/composite/types'

const WaterfallLineComboDemo: React.FC = () => {
  // 場景 1: 財務現金流分析 - 現金流變化與累積現金線
  const cashFlowData = [
    { period: '期初', amount: 1000, type: 'total', cashBalance: 1000, burnRate: 0, runway: 12 },
    { period: 'Q1營收', amount: 500, type: 'positive', cashBalance: 1500, burnRate: -50, runway: 15 },
    { period: 'Q1支出', amount: -300, type: 'negative', cashBalance: 1200, burnRate: -100, runway: 12 },
    { period: 'Q1小計', amount: 1200, type: 'subtotal', cashBalance: 1200, burnRate: -80, runway: 15 },
    { period: 'Q2營收', amount: 600, type: 'positive', cashBalance: 1800, burnRate: -40, runway: 18 },
    { period: 'Q2支出', amount: -400, type: 'negative', cashBalance: 1400, burnRate: -90, runway: 15.5 },
    { period: 'Q2小計', amount: 1400, type: 'subtotal', cashBalance: 1400, burnRate: -70, runway: 20 },
    { period: 'Q3營收', amount: 700, type: 'positive', cashBalance: 2100, burnRate: -30, runway: 24 },
    { period: 'Q3支出', amount: -450, type: 'negative', cashBalance: 1650, burnRate: -75, runway: 22 },
    { period: 'Q3小計', amount: 1650, type: 'subtotal', cashBalance: 1650, burnRate: -60, runway: 27.5 },
    { period: 'Q4營收', amount: 800, type: 'positive', cashBalance: 2450, burnRate: -25, runway: 32 },
    { period: 'Q4支出', amount: -500, type: 'negative', cashBalance: 1950, burnRate: -65, runway: 30 },
    { period: '年度總計', amount: 1950, type: 'total', cashBalance: 1950, burnRate: -50, runway: 39 },
  ]

  // 場景 2: 預算執行分析 - 預算變動與執行效率
  const budgetData = [
    { item: '原預算', amount: 10000, type: 'total', efficiency: 100, variance: 0 },
    { item: '人力成本', amount: -3000, type: 'negative', efficiency: 95, variance: -5 },
    { item: '辦公費用', amount: -1500, type: 'negative', efficiency: 88, variance: -12 },
    { item: '營銷費用', amount: -2000, type: 'negative', efficiency: 105, variance: 5 },
    { item: '研發投入', amount: -1800, type: 'negative', efficiency: 92, variance: -8 },
    { item: '運營小計', amount: 1700, type: 'subtotal', efficiency: 94, variance: -6 },
    { item: '緊急支出', amount: -300, type: 'negative', efficiency: 85, variance: -15 },
    { item: '新增收入', amount: 500, type: 'positive', efficiency: 110, variance: 10 },
    { item: '最終餘額', amount: 1900, type: 'total', efficiency: 96, variance: -4 },
  ]

  // 場景 3: 產品開發週期分析 - 開發成本與進度效率
  const developmentData = [
    { phase: '需求分析', cost: -50, type: 'negative', progress: 15, quality: 90 },
    { phase: '設計階段', cost: -80, type: 'negative', progress: 35, quality: 85 },
    { phase: '前端開發', cost: -120, type: 'negative', progress: 60, quality: 88 },
    { phase: '後端開發', cost: -150, type: 'negative', progress: 80, quality: 92 },
    { phase: '測試階段', cost: -100, type: 'negative', progress: 95, quality: 95 },
    { phase: '部署上線', cost: -30, type: 'negative', progress: 100, quality: 98 },
    { phase: '總開發成本', cost: -530, type: 'total', progress: 100, quality: 91 },
  ]

  const [activeScenario, setActiveScenario] = useState<'cashflow' | 'budget' | 'development'>('cashflow')
  const [activeSeriesIds, setActiveSeriesIds] = useState<Set<string>>(new Set())
  const [showConnectors, setShowConnectors] = useState(true)

  // 現金流場景配置
  const cashFlowSeries: ComboChartSeries[] = [
    { 
      type: 'waterfall', 
      dataKey: 'amount', 
      name: '現金流變化', 
      yAxis: 'left', 
      color: '#3b82f6',
      typeKey: 'type',
      waterfallOpacity: 0.8,
      positiveColor: '#10b981',
      negativeColor: '#ef4444',
      totalColor: '#3b82f6',
      subtotalColor: '#8b5cf6',
      showConnectors,
      connectorColor: '#6b7280',
      connectorDasharray: '3,3'
    },
    { 
      type: 'line', 
      dataKey: 'burnRate', 
      name: '燃燒率', 
      yAxis: 'right', 
      color: '#f59e0b', 
      strokeWidth: 3,
      curve: 'monotone' 
    },
    { 
      type: 'line', 
      dataKey: 'runway', 
      name: '資金跑道(月)', 
      yAxis: 'right', 
      color: '#10b981', 
      strokeWidth: 2,
      curve: 'monotone' 
    },
  ]

  // 預算場景配置
  const budgetSeries: ComboChartSeries[] = [
    { 
      type: 'waterfall', 
      dataKey: 'amount', 
      name: '預算變動', 
      yAxis: 'left', 
      color: '#8b5cf6',
      typeKey: 'type',
      waterfallOpacity: 0.8,
      positiveColor: '#10b981',
      negativeColor: '#ef4444',
      totalColor: '#3b82f6',
      subtotalColor: '#8b5cf6',
      showConnectors,
      connectorColor: '#6b7280',
      connectorDasharray: '2,4'
    },
    { 
      type: 'line', 
      dataKey: 'efficiency', 
      name: '執行效率(%)', 
      yAxis: 'right', 
      color: '#f59e0b', 
      strokeWidth: 3,
      curve: 'monotone' 
    },
    { 
      type: 'line', 
      dataKey: 'variance', 
      name: '差異率(%)', 
      yAxis: 'right', 
      color: '#ef4444', 
      strokeWidth: 2,
      curve: 'monotone' 
    },
  ]

  // 開發場景配置
  const developmentSeries: ComboChartSeries[] = [
    { 
      type: 'waterfall', 
      dataKey: 'cost', 
      name: '開發成本', 
      yAxis: 'left', 
      color: '#ef4444',
      typeKey: 'type',
      waterfallOpacity: 0.8,
      positiveColor: '#10b981',
      negativeColor: '#ef4444',
      totalColor: '#3b82f6',
      subtotalColor: '#8b5cf6',
      showConnectors,
      connectorColor: '#6b7280',
      connectorDasharray: '4,2'
    },
    { 
      type: 'line', 
      dataKey: 'progress', 
      name: '進度(%)', 
      yAxis: 'right', 
      color: '#10b981', 
      strokeWidth: 3,
      curve: 'monotone' 
    },
    { 
      type: 'line', 
      dataKey: 'quality', 
      name: '品質分數', 
      yAxis: 'right', 
      color: '#3b82f6', 
      strokeWidth: 2,
      curve: 'monotone' 
    },
  ]

  const getCurrentData = () => {
    switch (activeScenario) {
      case 'cashflow': return cashFlowData
      case 'budget': return budgetData
      case 'development': return developmentData
      default: return cashFlowData
    }
  }

  const getCurrentSeries = () => {
    const baseSeries = (() => {
      switch (activeScenario) {
        case 'cashflow': return cashFlowSeries
        case 'budget': return budgetSeries
        case 'development': return developmentSeries
        default: return cashFlowSeries
      }
    })()

    // 如果有選擇的系列，只顯示選擇的系列
    if (activeSeriesIds.size > 0) {
      return baseSeries.filter(s => activeSeriesIds.has(s.dataKey))
    }
    return baseSeries
  }

  const getCurrentXKey = () => {
    switch (activeScenario) {
      case 'cashflow': return 'period'
      case 'budget': return 'item'
      case 'development': return 'phase'
      default: return 'period'
    }
  }

  const getCurrentConfig = () => {
    switch (activeScenario) {
      case 'cashflow':
        return {
          title: '財務現金流分析 - Waterfall + Line',
          leftAxis: { label: '現金流量 (萬元)' },
          rightAxis: { label: '燃燒率 / 資金跑道' },
          xAxis: { label: '時間週期' }
        }
      case 'budget':
        return {
          title: '預算執行分析 - Waterfall + Line',
          leftAxis: { label: '預算金額 (萬元)' },
          rightAxis: { label: '執行效率(%) / 差異率(%)' },
          xAxis: { label: '預算項目' }
        }
      case 'development':
        return {
          title: '產品開發週期分析 - Waterfall + Line',
          leftAxis: { label: '開發成本 (萬元)' },
          rightAxis: { label: '進度(%) / 品質分數' },
          xAxis: { label: '開發階段' }
        }
      default:
        return {
          title: '財務現金流分析',
          leftAxis: { label: '現金流量' },
          rightAxis: { label: '燃燒率' },
          xAxis: { label: '時間週期' }
        }
    }
  }

  const toggleSeries = (dataKey: string) => {
    const newActiveIds = new Set(activeSeriesIds)
    if (newActiveIds.has(dataKey)) {
      newActiveIds.delete(dataKey)
    } else {
      newActiveIds.add(dataKey)
    }
    setActiveSeriesIds(newActiveIds)
  }

  const resetSeries = () => {
    setActiveSeriesIds(new Set())
  }

  const config = getCurrentConfig()
  const currentSeries = getCurrentSeries()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Waterfall + Line 組合圖表
        </h1>
        <p className="text-gray-600 mb-6">
          展示瀑布圖與趨勢線的組合，適用於現金流分析、預算執行和成本累積等財務場景。
        </p>

        {/* 場景選擇 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'cashflow', label: '💰 現金流分析', desc: '現金流變化與資金跑道' },
            { key: 'budget', label: '📊 預算執行', desc: '預算變動與執行效率' },
            { key: 'development', label: '🔧 開發週期', desc: '開發成本與進度品質' },
          ].map((scenario) => (
            <button
              key={scenario.key}
              onClick={() => {
                setActiveScenario(scenario.key as any)
                setActiveSeriesIds(new Set())
              }}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                activeScenario === scenario.key
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{scenario.label}</div>
              <div className="text-xs text-gray-500">{scenario.desc}</div>
            </button>
          ))}
        </div>

        {/* 瀑布圖配置 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">瀑布圖配置</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showConnectors"
                checked={showConnectors}
                onChange={(e) => setShowConnectors(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="showConnectors" className="text-sm text-gray-700">顯示連接線</label>
            </div>
            <div className="text-xs text-gray-500">
              連接線有助於追蹤累積值的變化軌跡
            </div>
          </div>
        </div>

        {/* 系列控制 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">系列控制</h3>
            <button
              onClick={resetSeries}
              className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              顯示全部
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(activeScenario === 'cashflow' ? cashFlowSeries : 
              activeScenario === 'budget' ? budgetSeries : developmentSeries).map((series) => (
              <button
                key={series.dataKey}
                onClick={() => toggleSeries(series.dataKey)}
                className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-2 ${
                  activeSeriesIds.size === 0 || activeSeriesIds.has(series.dataKey)
                    ? 'bg-white border-2 text-gray-700'
                    : 'bg-gray-200 border-2 border-gray-300 text-gray-500'
                }`}
                style={{
                  borderColor: activeSeriesIds.size === 0 || activeSeriesIds.has(series.dataKey) 
                    ? series.color 
                    : undefined
                }}
              >
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: series.color }}
                />
                {series.name}
                <span className="text-xs opacity-60">
                  ({series.type === 'waterfall' ? '瀑布' : '線'})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 圖表 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">{config.title}</h2>
        
        <div className="mb-4">
          <EnhancedComboChart
            data={getCurrentData()}
            series={currentSeries}
            xKey={getCurrentXKey()}
            width={900}
            height={500}
            margin={{ top: 20, right: 80, bottom: 60, left: 80 }}
            leftAxis={{
              label: config.leftAxis.label,
              gridlines: true,
            }}
            rightAxis={{
              label: config.rightAxis.label,
              gridlines: false,
            }}
            xAxis={{
              label: config.xAxis.label,
            }}
            animate={true}
            className="waterfall-line-combo"
          />
        </div>

        {/* 數據統計 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <div className="font-medium text-blue-800">瀑布圖系列</div>
            <div className="text-blue-600">
              {currentSeries.filter(s => s.type === 'waterfall').length} 個瀑布圖系列
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="font-medium text-green-800">趨勢線系列</div>
            <div className="text-green-600">
              {currentSeries.filter(s => s.type === 'line').length} 條趨勢線
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="font-medium text-purple-800">資料點數量</div>
            <div className="text-purple-600">
              {getCurrentData().length} 個數據點
            </div>
          </div>
        </div>
      </div>

      {/* 技術說明 */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">技術特色</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">💧 瀑布圖算法</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• 自動累積值計算：精確追蹤數值變化</li>
              <li>• 多類型支援：正值、負值、小計、總計</li>
              <li>• 視覺連接線：清晰顯示流向關係</li>
              <li>• 智能顏色編碼：自動區分不同類型</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">📈 組合圖表系統</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• 智能Y軸域值：考慮累積值範圍</li>
              <li>• 雙軸支援：瀑布圖配合趨勢指標</li>
              <li>• 動態交互：點擊獲取累積值信息</li>
              <li>• 響應式設計：適配不同螢幕尺寸</li>
            </ul>
          </div>
        </div>

        {/* 瀑布圖顏色說明 */}
        <div className="mt-6">
          <h4 className="font-medium text-gray-800 mb-3">🎨 顏色編碼說明</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span>正值增加</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span>負值減少</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>總計數值</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span>小計數值</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WaterfallLineComboDemo