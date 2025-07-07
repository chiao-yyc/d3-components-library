import React, { useState } from 'react'
import { EnhancedComboChart } from '../../../registry/components/composite/enhanced-combo-chart'
import type { ComboChartSeries } from '../../../registry/components/composite/types'

const MultiBarLineComboDemo: React.FC = () => {
  // 場景 1: 業務指標比較 - 多個業務部門的銷售與利潤
  const businessData = [
    { quarter: 'Q1', salesA: 120, salesB: 80, salesC: 95, profitMargin: 15.2, satisfaction: 4.2 },
    { quarter: 'Q2', salesA: 145, salesB: 110, salesC: 125, profitMargin: 18.5, satisfaction: 4.5 },
    { quarter: 'Q3', salesA: 180, salesB: 140, salesC: 160, profitMargin: 22.1, satisfaction: 4.7 },
    { quarter: 'Q4', salesA: 210, salesB: 175, salesC: 190, profitMargin: 25.8, satisfaction: 4.8 },
  ]

  // 場景 2: 系統監控 - 多個服務器的負載與響應時間
  const systemData = [
    { time: '00:00', server1: 65, server2: 45, server3: 55, avgResponse: 120, errorRate: 0.5 },
    { time: '06:00', server1: 80, server2: 60, server3: 70, avgResponse: 150, errorRate: 0.8 },
    { time: '12:00', server1: 95, server2: 85, server3: 90, avgResponse: 200, errorRate: 1.2 },
    { time: '18:00', server1: 75, server2: 55, server3: 65, avgResponse: 180, errorRate: 0.9 },
    { time: '24:00', server1: 50, server2: 35, server3: 45, avgResponse: 110, errorRate: 0.3 },
  ]

  // 場景 3: 金融分析 - 多個投資組合的表現與市場指標
  const financialData = [
    { month: 'Jan', portfolioA: 5.2, portfolioB: 3.8, portfolioC: 4.5, portfolioD: 6.1, marketIndex: 4.2, volatility: 12.5 },
    { month: 'Feb', portfolioA: 7.1, portfolioB: 5.4, portfolioC: 6.2, portfolioD: 8.3, marketIndex: 6.1, volatility: 15.2 },
    { month: 'Mar', portfolioA: 3.9, portfolioB: 2.7, portfolioC: 3.1, portfolioD: 4.8, marketIndex: 3.5, volatility: 18.7 },
    { month: 'Apr', portfolioA: 8.5, portfolioB: 6.9, portfolioC: 7.3, portfolioD: 9.2, marketIndex: 7.8, volatility: 14.1 },
    { month: 'May', portfolioA: 6.3, portfolioB: 4.8, portfolioC: 5.5, portfolioD: 7.4, marketIndex: 5.9, volatility: 16.8 },
    { month: 'Jun', portfolioA: 9.1, portfolioB: 7.6, portfolioC: 8.2, portfolioD: 10.5, marketIndex: 8.7, volatility: 13.3 },
  ]

  const [activeScenario, setActiveScenario] = useState<'business' | 'system' | 'financial'>('business')
  const [activeSeriesIds, setActiveSeriesIds] = useState<Set<string>>(new Set())

  // 業務場景配置
  const businessSeries: ComboChartSeries[] = [
    { type: 'bar', dataKey: 'salesA', name: '部門A銷售', yAxis: 'left', color: '#3b82f6', barGroupKey: 'sales' },
    { type: 'bar', dataKey: 'salesB', name: '部門B銷售', yAxis: 'left', color: '#8b5cf6', barGroupKey: 'sales' },
    { type: 'bar', dataKey: 'salesC', name: '部門C銷售', yAxis: 'left', color: '#10b981', barGroupKey: 'sales' },
    { type: 'line', dataKey: 'profitMargin', name: '利潤率', yAxis: 'right', color: '#f59e0b', strokeWidth: 3 },
    { type: 'line', dataKey: 'satisfaction', name: '客戶滿意度', yAxis: 'right', color: '#ef4444', strokeWidth: 2, curve: 'monotone' },
  ]

  // 系統監控場景配置
  const systemSeries: ComboChartSeries[] = [
    { type: 'bar', dataKey: 'server1', name: '服務器1負載', yAxis: 'left', color: '#3b82f6', barGroupKey: 'servers' },
    { type: 'bar', dataKey: 'server2', name: '服務器2負載', yAxis: 'left', color: '#8b5cf6', barGroupKey: 'servers' },
    { type: 'bar', dataKey: 'server3', name: '服務器3負載', yAxis: 'left', color: '#10b981', barGroupKey: 'servers' },
    { type: 'line', dataKey: 'avgResponse', name: '平均響應時間', yAxis: 'right', color: '#f59e0b', strokeWidth: 3 },
    { type: 'line', dataKey: 'errorRate', name: '錯誤率', yAxis: 'right', color: '#ef4444', strokeWidth: 2 },
  ]

  // 金融分析場景配置
  const financialSeries: ComboChartSeries[] = [
    { type: 'bar', dataKey: 'portfolioA', name: '投資組合A', yAxis: 'left', color: '#3b82f6', barGroupKey: 'portfolios' },
    { type: 'bar', dataKey: 'portfolioB', name: '投資組合B', yAxis: 'left', color: '#8b5cf6', barGroupKey: 'portfolios' },
    { type: 'bar', dataKey: 'portfolioC', name: '投資組合C', yAxis: 'left', color: '#10b981', barGroupKey: 'portfolios' },
    { type: 'bar', dataKey: 'portfolioD', name: '投資組合D', yAxis: 'left', color: '#f97316', barGroupKey: 'portfolios' },
    { type: 'line', dataKey: 'marketIndex', name: '市場指數', yAxis: 'left', color: '#1f2937', strokeWidth: 3 },
    { type: 'line', dataKey: 'volatility', name: '波動率', yAxis: 'right', color: '#ef4444', strokeWidth: 2 },
  ]

  const getCurrentData = () => {
    switch (activeScenario) {
      case 'business': return businessData
      case 'system': return systemData
      case 'financial': return financialData
      default: return businessData
    }
  }

  const getCurrentSeries = () => {
    const baseSeries = (() => {
      switch (activeScenario) {
        case 'business': return businessSeries
        case 'system': return systemSeries
        case 'financial': return financialSeries
        default: return businessSeries
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
      case 'business': return 'quarter'
      case 'system': return 'time'
      case 'financial': return 'month'
      default: return 'quarter'
    }
  }

  const getCurrentConfig = () => {
    switch (activeScenario) {
      case 'business':
        return {
          title: '業務指標分析 - Multi-Bar + Line',
          leftAxis: { label: '銷售額 (萬元)' },
          rightAxis: { label: '利潤率 (%) / 滿意度 (分)' },
          xAxis: { label: '季度' }
        }
      case 'system':
        return {
          title: '系統監控儀表板 - Multi-Bar + Line',
          leftAxis: { label: 'CPU 負載 (%)' },
          rightAxis: { label: '響應時間 (ms) / 錯誤率 (%)' },
          xAxis: { label: '時間' }
        }
      case 'financial':
        return {
          title: '投資組合分析 - Multi-Bar + Line',
          leftAxis: { label: '收益率 (%)' },
          rightAxis: { label: '波動率 (%)' },
          xAxis: { label: '月份' }
        }
      default:
        return {
          title: '業務指標分析',
          leftAxis: { label: '銷售額' },
          rightAxis: { label: '利潤率' },
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
          Multi-Bar + Line 組合圖表
        </h1>
        <p className="text-gray-600 mb-6">
          展示多個 Bar 系列與 Line 系列的組合，支援分組條形圖與雙軸配置。適用於比較多個類別數據的同時顯示趨勢指標。
        </p>

        {/* 場景選擇 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'business', label: '📊 業務指標', desc: '多部門銷售與KPI' },
            { key: 'system', label: '🖥️ 系統監控', desc: '多服務器負載監控' },
            { key: 'financial', label: '💰 金融分析', desc: '投資組合表現分析' },
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
            {(activeScenario === 'business' ? businessSeries : 
              activeScenario === 'system' ? systemSeries : financialSeries).map((series) => (
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
                  ({series.type === 'bar' ? '條' : '線'})
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
            className="multi-bar-line-combo"
          />
        </div>

        {/* 數據統計 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <div className="font-medium text-blue-800">Bar 系列數量</div>
            <div className="text-blue-600">
              {currentSeries.filter(s => s.type === 'bar').length} 個分組條形圖
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="font-medium text-green-800">Line 系列數量</div>
            <div className="text-green-600">
              {currentSeries.filter(s => s.type === 'line').length} 條趨勢線
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="font-medium text-purple-800">資料點數量</div>
            <div className="text-purple-600">
              {getCurrentData().length} 個時間點
            </div>
          </div>
        </div>
      </div>

      {/* 技術說明 */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">技術特色</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">🔧 Multi-Bar 分組渲染</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• 使用 barGroupKey 進行條形圖分組</li>
              <li>• 自動計算組內偏移量和條寬度</li>
              <li>• 支援無限數量的分組條形圖</li>
              <li>• 智能處理重疊和間距</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">📊 雙軸與圖層管理</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• 左右軸獨立配置和刻度</li>
              <li>• 智能圖層排序：area → bar → line</li>
              <li>• Z-index 管理確保線條可見性</li>
              <li>• 動畫和交互事件支援</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MultiBarLineComboDemo