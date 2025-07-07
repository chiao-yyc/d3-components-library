import React, { useState } from 'react'
import { EnhancedComboChart } from '../../../registry/components/composite/enhanced-combo-chart'
import type { ComboChartSeries } from '../../../registry/components/composite/types'

const TripleComboDemo: React.FC = () => {
  // 場景 1: 電商業務分析 - 銷售額(柱) + 成長區間(面) + 目標線(線)
  const ecommerceData = [
    { month: 'Q1', sales: 120000, growth_min: 110000, growth_max: 140000, target: 135000, conversion: 3.2, traffic: 45000 },
    { month: 'Q2', sales: 145000, growth_min: 130000, growth_max: 160000, target: 140000, conversion: 3.8, traffic: 52000 },
    { month: 'Q3', sales: 168000, growth_min: 150000, growth_max: 185000, target: 145000, conversion: 4.1, traffic: 58000 },
    { month: 'Q4', sales: 192000, growth_min: 175000, growth_max: 210000, target: 150000, conversion: 4.5, traffic: 65000 },
    { month: 'Q5', sales: 218000, growth_min: 200000, growth_max: 240000, target: 155000, conversion: 4.8, traffic: 72000 },
    { month: 'Q6', sales: 235000, growth_min: 220000, growth_max: 255000, target: 160000, conversion: 5.1, traffic: 78000 },
    { month: 'Q7', sales: 248000, growth_min: 235000, growth_max: 265000, target: 165000, conversion: 5.3, traffic: 82000 },
    { month: 'Q8', sales: 275000, growth_min: 260000, growth_max: 295000, target: 170000, conversion: 5.6, traffic: 88000 },
    { month: 'Q9', sales: 292000, growth_min: 280000, growth_max: 310000, target: 175000, conversion: 5.8, traffic: 94000 },
    { month: 'Q10', sales: 315000, growth_min: 300000, growth_max: 335000, target: 180000, conversion: 6.1, traffic: 98000 },
    { month: 'Q11', sales: 338000, growth_min: 320000, growth_max: 360000, target: 185000, conversion: 6.4, traffic: 105000 },
    { month: 'Q12', sales: 365000, growth_min: 345000, growth_max: 385000, target: 190000, conversion: 6.7, traffic: 112000 },
  ]

  // 場景 2: 專案預算管理 - 實際支出(柱) + 預算區間(面) + 預測線(線)
  const budgetData = [
    { phase: '需求分析', actual_cost: 25000, budget_min: 20000, budget_max: 30000, forecast: 28000, efficiency: 85, quality: 90 },
    { phase: '系統設計', actual_cost: 45000, budget_min: 40000, budget_max: 50000, forecast: 48000, efficiency: 88, quality: 92 },
    { phase: '前端開發', actual_cost: 78000, budget_min: 70000, budget_max: 85000, forecast: 82000, efficiency: 82, quality: 87 },
    { phase: '後端開發', actual_cost: 95000, budget_min: 85000, budget_max: 105000, forecast: 98000, efficiency: 86, quality: 89 },
    { phase: '整合測試', actual_cost: 65000, budget_min: 60000, budget_max: 75000, forecast: 70000, efficiency: 90, quality: 94 },
    { phase: '系統測試', actual_cost: 55000, budget_min: 50000, budget_max: 65000, forecast: 58000, efficiency: 88, quality: 93 },
    { phase: '使用者測試', actual_cost: 35000, budget_min: 30000, budget_max: 40000, forecast: 38000, efficiency: 92, quality: 96 },
    { phase: '部署上線', actual_cost: 28000, budget_min: 25000, budget_max: 35000, forecast: 32000, efficiency: 95, quality: 98 },
  ]

  // 場景 3: 社群媒體分析 - 互動數(柱) + 觸及範圍(面) + 參與率(線)
  const socialData = [
    { week: 'W1', interactions: 15000, reach_min: 180000, reach_max: 220000, engagement_rate: 3.2, followers: 25000, shares: 450 },
    { week: 'W2', interactions: 18500, reach_min: 210000, reach_max: 250000, engagement_rate: 3.8, followers: 26200, shares: 520 },
    { week: 'W3', interactions: 22000, reach_min: 240000, reach_max: 280000, engagement_rate: 4.1, followers: 27800, shares: 680 },
    { week: 'W4', interactions: 19500, reach_min: 220000, reach_max: 260000, engagement_rate: 3.9, followers: 28500, shares: 590 },
    { week: 'W5', interactions: 26000, reach_min: 280000, reach_max: 320000, engagement_rate: 4.5, followers: 30200, shares: 750 },
    { week: 'W6', interactions: 24500, reach_min: 270000, reach_max: 310000, engagement_rate: 4.3, followers: 31100, shares: 720 },
    { week: 'W7', interactions: 28000, reach_min: 310000, reach_max: 350000, engagement_rate: 4.8, followers: 32500, shares: 820 },
    { week: 'W8', interactions: 31500, reach_min: 340000, reach_max: 380000, engagement_rate: 5.1, followers: 34200, shares: 890 },
    { week: 'W9', interactions: 29000, reach_min: 320000, reach_max: 360000, engagement_rate: 4.9, followers: 35100, shares: 850 },
    { week: 'W10', interactions: 33500, reach_min: 360000, reach_max: 400000, engagement_rate: 5.3, followers: 36800, shares: 950 },
    { week: 'W11', interactions: 35000, reach_min: 380000, reach_max: 420000, engagement_rate: 5.5, followers: 38200, shares: 1020 },
    { week: 'W12', interactions: 38500, reach_min: 410000, reach_max: 450000, engagement_rate: 5.8, followers: 40100, shares: 1150 },
  ]

  const [activeScenario, setActiveScenario] = useState<'ecommerce' | 'budget' | 'social'>('ecommerce')
  const [activeSeriesIds, setActiveSeriesIds] = useState<Set<string>>(new Set())
  const [showAreaChart, setShowAreaChart] = useState(true)
  const [barOpacity, setBarOpacity] = useState(0.7)

  // 電商場景配置
  const ecommerceSeries: ComboChartSeries[] = [
    ...(showAreaChart ? [{
      type: 'area' as const,
      dataKey: 'growth_max',
      name: '成長預期區間',
      yAxis: 'left' as const,
      color: '#10b981',
      areaOpacity: 0.15,
      baseline: (d: any) => d.growth_min,
      gradient: {
        id: 'ecommerceGradient',
        stops: [
          { offset: '0%', color: '#10b981', opacity: 0.3 },
          { offset: '100%', color: '#059669', opacity: 0.05 }
        ]
      }
    }] : []),
    {
      type: 'bar',
      dataKey: 'sales',
      name: '實際銷售額',
      yAxis: 'left',
      color: '#3b82f6',
      barOpacity: barOpacity,
      barWidth: 0.6
    },
    {
      type: 'line',
      dataKey: 'target',
      name: '銷售目標',
      yAxis: 'left',
      color: '#ef4444',
      strokeWidth: 3,
      showPoints: true,
      pointRadius: 5,
      curve: 'monotone'
    },
    {
      type: 'line',
      dataKey: 'conversion',
      name: '轉換率(%)',
      yAxis: 'right',
      color: '#f59e0b',
      strokeWidth: 2,
      showPoints: true,
      pointRadius: 4,
      curve: 'monotone'
    }
  ]

  // 預算場景配置
  const budgetSeries: ComboChartSeries[] = [
    ...(showAreaChart ? [{
      type: 'area' as const,
      dataKey: 'budget_max',
      name: '預算範圍',
      yAxis: 'left' as const,
      color: '#8b5cf6',
      areaOpacity: 0.2,
      baseline: (d: any) => d.budget_min,
      gradient: {
        id: 'budgetGradient',
        stops: [
          { offset: '0%', color: '#8b5cf6', opacity: 0.4 },
          { offset: '100%', color: '#7c3aed', opacity: 0.05 }
        ]
      }
    }] : []),
    {
      type: 'bar',
      dataKey: 'actual_cost',
      name: '實際支出',
      yAxis: 'left',
      color: '#ef4444',
      barOpacity: barOpacity,
      barWidth: 0.5
    },
    {
      type: 'line',
      dataKey: 'forecast',
      name: '預測成本',
      yAxis: 'left',
      color: '#06b6d4',
      strokeWidth: 3,
      showPoints: true,
      pointRadius: 5,
      curve: 'monotone'
    },
    {
      type: 'line',
      dataKey: 'efficiency',
      name: '執行效率(%)',
      yAxis: 'right',
      color: '#10b981',
      strokeWidth: 2,
      showPoints: true,
      pointRadius: 4,
      curve: 'monotone'
    }
  ]

  // 社群場景配置
  const socialSeries: ComboChartSeries[] = [
    ...(showAreaChart ? [{
      type: 'area' as const,
      dataKey: 'reach_max',
      name: '觸及範圍',
      yAxis: 'left' as const,
      color: '#06b6d4',
      areaOpacity: 0.18,
      baseline: (d: any) => d.reach_min,
      gradient: {
        id: 'socialGradient',
        stops: [
          { offset: '0%', color: '#06b6d4', opacity: 0.35 },
          { offset: '100%', color: '#0891b2', opacity: 0.05 }
        ]
      }
    }] : []),
    {
      type: 'bar',
      dataKey: 'interactions',
      name: '互動數量',
      yAxis: 'left',
      color: '#ec4899',
      barOpacity: barOpacity,
      barWidth: 0.6
    },
    {
      type: 'line',
      dataKey: 'engagement_rate',
      name: '參與率(%)',
      yAxis: 'right',
      color: '#f59e0b',
      strokeWidth: 3,
      showPoints: true,
      pointRadius: 5,
      curve: 'monotone'
    },
    {
      type: 'line',
      dataKey: 'followers',
      name: '追蹤者數',
      yAxis: 'right',
      color: '#8b5cf6',
      strokeWidth: 2,
      showPoints: true,
      pointRadius: 4,
      curve: 'monotone'
    }
  ]

  const getCurrentData = () => {
    switch (activeScenario) {
      case 'ecommerce': return ecommerceData
      case 'budget': return budgetData
      case 'social': return socialData
      default: return ecommerceData
    }
  }

  const getCurrentSeries = () => {
    const baseSeries = (() => {
      switch (activeScenario) {
        case 'ecommerce': return ecommerceSeries
        case 'budget': return budgetSeries
        case 'social': return socialSeries
        default: return ecommerceSeries
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
      case 'ecommerce': return 'month'
      case 'budget': return 'phase'
      case 'social': return 'week'
      default: return 'month'
    }
  }

  const getCurrentConfig = () => {
    switch (activeScenario) {
      case 'ecommerce':
        return {
          title: '電商業務分析 - Bar + Area + Line 三重組合',
          leftAxis: { label: '銷售額 / 觸及數 (萬元)' },
          rightAxis: { label: '轉換率(%) / 流量' },
          xAxis: { label: '季度' }
        }
      case 'budget':
        return {
          title: '專案預算管理 - Bar + Area + Line 三重組合',
          leftAxis: { label: '成本支出 (萬元)' },
          rightAxis: { label: '效率(%) / 品質分數' },
          xAxis: { label: '專案階段' }
        }
      case 'social':
        return {
          title: '社群媒體分析 - Bar + Area + Line 三重組合',
          leftAxis: { label: '互動數 / 觸及數' },
          rightAxis: { label: '參與率(%) / 追蹤者數' },
          xAxis: { label: '週期' }
        }
      default:
        return {
          title: '電商業務分析',
          leftAxis: { label: '銷售額' },
          rightAxis: { label: '轉換率' },
          xAxis: { label: '季度' }
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
          Bar + Area + Line 三重組合圖表
        </h1>
        <p className="text-gray-600 mb-6">
          展示柱狀圖、區域圖與線圖的三重組合，適用於多維度業務分析、預算管理和績效追蹤。
        </p>

        {/* 場景選擇 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'ecommerce', label: '🛒 電商分析', desc: '銷售、成長與目標' },
            { key: 'budget', label: '💰 預算管理', desc: '支出、預算與效率' },
            { key: 'social', label: '📱 社群媒體', desc: '互動、觸及與參與' },
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

        {/* 三重組合配置 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">三重組合配置</h3>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showAreaChart"
                checked={showAreaChart}
                onChange={(e) => setShowAreaChart(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="showAreaChart" className="text-sm text-gray-700">顯示區域圖</label>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-700">柱狀圖透明度：</label>
              <input
                type="range"
                min="0.3"
                max="1"
                step="0.1"
                value={barOpacity}
                onChange={(e) => setBarOpacity(Number(e.target.value))}
                className="w-20"
              />
              <span className="text-xs text-gray-500">{barOpacity}</span>
            </div>
            <div className="text-xs text-gray-500">
              三重組合：區域圖提供範圍參考，柱狀圖顯示實際數值，線圖展示趨勢變化
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
            {(activeScenario === 'ecommerce' ? ecommerceSeries : 
              activeScenario === 'budget' ? budgetSeries : socialSeries).map((series) => (
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
                  ({series.type === 'area' ? '區域' : series.type === 'bar' ? '柱狀' : '線條'})
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
            className="triple-combo-chart"
          />
        </div>

        {/* 數據統計 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <div className="font-medium text-blue-800">區域圖系列</div>
            <div className="text-blue-600">
              {currentSeries.filter(s => s.type === 'area').length} 個區域圖
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="font-medium text-green-800">柱狀圖系列</div>
            <div className="text-green-600">
              {currentSeries.filter(s => s.type === 'bar').length} 個柱狀圖
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="font-medium text-purple-800">線圖系列</div>
            <div className="text-purple-600">
              {currentSeries.filter(s => s.type === 'line').length} 條線圖
            </div>
          </div>
          <div className="bg-orange-50 p-3 rounded">
            <div className="font-medium text-orange-800">總數據點</div>
            <div className="text-orange-600">
              {getCurrentData().length} 個數據點
            </div>
          </div>
        </div>
      </div>

      {/* 技術說明 */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">三重組合特色</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">📊 視覺層次</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• 區域圖：背景範圍參考，低透明度</li>
              <li>• 柱狀圖：主要數據呈現，中等透明度</li>
              <li>• 線圖：趨勢分析，高對比度顯示</li>
              <li>• 雙軸支援：不同單位數據同時展示</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">⚡ 互動功能</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• 圖層控制：獨立開關三種圖表類型</li>
              <li>• 透明度調整：優化視覺重疊效果</li>
              <li>• 系列篩選：靈活控制顯示內容</li>
              <li>• 場景切換：快速對比不同業務案例</li>
            </ul>
          </div>
        </div>

        {/* 應用場景說明 */}
        <div className="mt-6">
          <h4 className="font-medium text-gray-800 mb-3">🎯 業務應用場景</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-blue-600 mb-1">🛒 電商營運</div>
              <div className="text-gray-600">銷售分析、目標追蹤、成長預測、轉換優化</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-purple-600 mb-1">💰 專案管理</div>
              <div className="text-gray-600">預算控制、成本分析、效率監控、風險評估</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-cyan-600 mb-1">📱 社群經營</div>
              <div className="text-gray-600">互動分析、觸及監控、參與度優化、粉絲成長</div>
            </div>
          </div>
        </div>

        {/* 技術架構說明 */}
        <div className="mt-6">
          <h4 className="font-medium text-gray-800 mb-3">🔧 技術實現</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-white p-4 rounded border">
            <div>
              <div className="font-medium text-gray-700 mb-1">圖層渲染順序</div>
              <div className="text-gray-600">Area (背景) → Bar (中層) → Line (前景)</div>
            </div>
            <div>
              <div className="font-medium text-gray-700 mb-1">雙軸協調</div>
              <div className="text-gray-600">自動域值計算、獨立刻度、標籤對齊</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TripleComboDemo