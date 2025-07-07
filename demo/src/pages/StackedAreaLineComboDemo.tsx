import React, { useState } from 'react'
import { EnhancedComboChart } from '../../../registry/components/composite/enhanced-combo-chart'
import type { ComboChartSeries } from '../../../registry/components/composite/types'

const StackedAreaLineComboDemo: React.FC = () => {
  // 場景 1: 網站流量分析 - 多個流量來源堆疊與轉換率趨勢
  const trafficData = [
    { month: 'Jan', organic: 12000, social: 8000, paid: 5000, direct: 15000, conversionRate: 2.3, avgSessionTime: 3.2 },
    { month: 'Feb', organic: 15000, social: 9200, paid: 5800, direct: 16200, conversionRate: 2.6, avgSessionTime: 3.4 },
    { month: 'Mar', organic: 16000, social: 11000, paid: 7500, direct: 18000, conversionRate: 3.1, avgSessionTime: 3.8 },
    { month: 'Apr', organic: 18500, social: 12200, paid: 7800, direct: 19200, conversionRate: 3.3, avgSessionTime: 3.9 },
    { month: 'May', organic: 20000, social: 14000, paid: 9000, direct: 21000, conversionRate: 3.8, avgSessionTime: 4.3 },
    { month: 'Jun', organic: 21500, social: 15200, paid: 9800, direct: 22500, conversionRate: 4.0, avgSessionTime: 4.5 },
    { month: 'Jul', organic: 22000, social: 15500, paid: 10000, direct: 23000, conversionRate: 4.2, avgSessionTime: 4.6 },
    { month: 'Aug', organic: 24000, social: 16800, paid: 11200, direct: 24500, conversionRate: 4.4, avgSessionTime: 4.7 },
    { month: 'Sep', organic: 25500, social: 17500, paid: 10800, direct: 25200, conversionRate: 4.1, avgSessionTime: 4.5 },
    { month: 'Oct', organic: 27000, social: 18200, paid: 12000, direct: 26000, conversionRate: 4.3, avgSessionTime: 4.8 },
    { month: 'Nov', organic: 28500, social: 19000, paid: 13500, direct: 27500, conversionRate: 4.6, avgSessionTime: 4.9 },
    { month: 'Dec', organic: 30000, social: 20000, paid: 15000, direct: 28000, conversionRate: 4.8, avgSessionTime: 5.0 },
  ]

  // 場景 2: 收入構成分析 - 多個產品線收入堆疊與增長率趨勢
  const revenueData = [
    { month: 'Jan', productA: 250, productB: 180, productC: 120, services: 80, growthRate: 15.2, profitMargin: 22.5 },
    { month: 'Feb', productA: 265, productB: 185, productC: 125, services: 85, growthRate: 16.1, profitMargin: 22.8 },
    { month: 'Mar', productA: 280, productB: 200, productC: 140, services: 95, growthRate: 18.7, profitMargin: 24.1 },
    { month: 'Apr', productA: 295, productB: 210, productC: 145, services: 100, growthRate: 19.5, profitMargin: 24.8 },
    { month: 'May', productA: 310, productB: 220, productC: 155, services: 105, growthRate: 21.2, profitMargin: 25.6 },
    { month: 'Jun', productA: 320, productB: 230, productC: 160, services: 110, growthRate: 22.3, profitMargin: 26.8 },
    { month: 'Jul', productA: 335, productB: 240, productC: 165, services: 115, growthRate: 23.1, profitMargin: 27.2 },
    { month: 'Aug', productA: 345, productB: 245, productC: 170, services: 120, growthRate: 24.5, profitMargin: 27.8 },
    { month: 'Sep', productA: 360, productB: 260, productC: 180, services: 130, growthRate: 25.9, profitMargin: 28.4 },
    { month: 'Oct', productA: 375, productB: 270, productC: 185, services: 135, growthRate: 26.8, profitMargin: 29.1 },
    { month: 'Nov', productA: 385, productB: 275, productC: 190, services: 140, growthRate: 27.5, profitMargin: 29.6 },
    { month: 'Dec', productA: 400, productB: 285, productC: 200, services: 145, growthRate: 28.2, profitMargin: 30.2 },
  ]

  // 場景 3: 能源消耗分析 - 多種能源來源堆疊與碳排放趨勢
  const energyData = [
    { month: 'Q1 2020', coal: 35, gas: 25, nuclear: 20, hydro: 12, solar: 5, wind: 3, carbonEmission: 450, renewableRatio: 20 },
    { month: 'Q2 2020', coal: 34, gas: 25, nuclear: 20, hydro: 12.5, solar: 5.5, wind: 3, carbonEmission: 445, renewableRatio: 21 },
    { month: 'Q3 2020', coal: 33, gas: 25.5, nuclear: 20, hydro: 13, solar: 5.5, wind: 3, carbonEmission: 440, renewableRatio: 21.5 },
    { month: 'Q4 2020', coal: 32, gas: 26, nuclear: 20, hydro: 13, solar: 6, wind: 3, carbonEmission: 430, renewableRatio: 22 },
    { month: 'Q1 2021', coal: 31, gas: 26.5, nuclear: 19.5, hydro: 13.5, solar: 6.5, wind: 3, carbonEmission: 425, renewableRatio: 23 },
    { month: 'Q2 2021', coal: 30, gas: 27, nuclear: 19, hydro: 14, solar: 7, wind: 3, carbonEmission: 420, renewableRatio: 24 },
    { month: 'Q3 2021', coal: 29, gas: 27, nuclear: 19, hydro: 14, solar: 8, wind: 3, carbonEmission: 405, renewableRatio: 25 },
    { month: 'Q4 2021', coal: 28, gas: 27.5, nuclear: 18.5, hydro: 14.5, solar: 8.5, wind: 3, carbonEmission: 400, renewableRatio: 26 },
    { month: 'Q1 2022', coal: 27, gas: 28, nuclear: 18, hydro: 15, solar: 9, wind: 3, carbonEmission: 390, renewableRatio: 27 },
    { month: 'Q2 2022', coal: 26, gas: 28, nuclear: 18, hydro: 15, solar: 10, wind: 3, carbonEmission: 380, renewableRatio: 28 },
    { month: 'Q3 2022', coal: 25, gas: 28.5, nuclear: 17.5, hydro: 15.5, solar: 10.5, wind: 3, carbonEmission: 375, renewableRatio: 29 },
    { month: 'Q4 2022', coal: 24, gas: 29, nuclear: 17, hydro: 16, solar: 11, wind: 3, carbonEmission: 365, renewableRatio: 30 },
    { month: 'Q1 2023', coal: 23, gas: 29, nuclear: 17, hydro: 16, solar: 12, wind: 3, carbonEmission: 355, renewableRatio: 31 },
    { month: 'Q2 2023', coal: 22, gas: 29.5, nuclear: 16.5, hydro: 16.5, solar: 12.5, wind: 3, carbonEmission: 350, renewableRatio: 32 },
    { month: 'Q3 2023', coal: 21, gas: 30, nuclear: 16, hydro: 17, solar: 13, wind: 3, carbonEmission: 345, renewableRatio: 33 },
    { month: 'Q4 2023', coal: 20, gas: 30, nuclear: 16, hydro: 17, solar: 14, wind: 3, carbonEmission: 330, renewableRatio: 34 },
  ]

  const [activeScenario, setActiveScenario] = useState<'traffic' | 'revenue' | 'energy'>('traffic')
  const [activeSeriesIds, setActiveSeriesIds] = useState<Set<string>>(new Set())
  const [stackOffset, setStackOffset] = useState<'none' | 'expand' | 'silhouette' | 'wiggle'>('none')
  const [stackOrder, setStackOrder] = useState<'none' | 'ascending' | 'descending' | 'insideOut'>('none')

  // 網站流量場景配置
  const trafficSeries: ComboChartSeries[] = [
    { type: 'stackedArea', dataKey: 'organic', name: '自然流量', yAxis: 'left', color: '#10b981', stackGroupKey: 'traffic', areaOpacity: 0.8, stackOrder, stackOffset, curve: 'monotone' },
    { type: 'stackedArea', dataKey: 'social', name: '社交媒體', yAxis: 'left', color: '#3b82f6', stackGroupKey: 'traffic', areaOpacity: 0.8, stackOrder, stackOffset, curve: 'monotone' },
    { type: 'stackedArea', dataKey: 'paid', name: '付費廣告', yAxis: 'left', color: '#f59e0b', stackGroupKey: 'traffic', areaOpacity: 0.8, stackOrder, stackOffset, curve: 'monotone' },
    { type: 'stackedArea', dataKey: 'direct', name: '直接流量', yAxis: 'left', color: '#8b5cf6', stackGroupKey: 'traffic', areaOpacity: 0.8, stackOrder, stackOffset, curve: 'monotone' },
    { type: 'line', dataKey: 'conversionRate', name: '轉換率', yAxis: 'right', color: '#ef4444', strokeWidth: 3, curve: 'monotone' },
    { type: 'line', dataKey: 'avgSessionTime', name: '平均停留時間', yAxis: 'right', color: '#f97316', strokeWidth: 2, curve: 'monotone' },
  ]

  // 收入構成場景配置
  const revenueSeries: ComboChartSeries[] = [
    { type: 'stackedArea', dataKey: 'productA', name: '產品線A', yAxis: 'left', color: '#3b82f6', stackGroupKey: 'revenue', areaOpacity: 0.8, stackOrder, stackOffset, curve: 'monotone' },
    { type: 'stackedArea', dataKey: 'productB', name: '產品線B', yAxis: 'left', color: '#10b981', stackGroupKey: 'revenue', areaOpacity: 0.8, stackOrder, stackOffset, curve: 'monotone' },
    { type: 'stackedArea', dataKey: 'productC', name: '產品線C', yAxis: 'left', color: '#f59e0b', stackGroupKey: 'revenue', areaOpacity: 0.8, stackOrder, stackOffset, curve: 'monotone' },
    { type: 'stackedArea', dataKey: 'services', name: '服務收入', yAxis: 'left', color: '#8b5cf6', stackGroupKey: 'revenue', areaOpacity: 0.8, stackOrder, stackOffset, curve: 'monotone' },
    { type: 'line', dataKey: 'growthRate', name: '增長率', yAxis: 'right', color: '#ef4444', strokeWidth: 3, curve: 'monotone' },
    { type: 'line', dataKey: 'profitMargin', name: '利潤率', yAxis: 'right', color: '#f97316', strokeWidth: 2, curve: 'monotone' },
  ]

  // 能源消耗場景配置
  const energySeries: ComboChartSeries[] = [
    { type: 'stackedArea', dataKey: 'coal', name: '煤炭', yAxis: 'left', color: '#374151', stackGroupKey: 'energy', areaOpacity: 0.8, stackOrder, stackOffset, curve: 'monotone' },
    { type: 'stackedArea', dataKey: 'gas', name: '天然氣', yAxis: 'left', color: '#6b7280', stackGroupKey: 'energy', areaOpacity: 0.8, stackOrder, stackOffset, curve: 'monotone' },
    { type: 'stackedArea', dataKey: 'nuclear', name: '核能', yAxis: 'left', color: '#fbbf24', stackGroupKey: 'energy', areaOpacity: 0.8, stackOrder, stackOffset, curve: 'monotone' },
    { type: 'stackedArea', dataKey: 'hydro', name: '水力', yAxis: 'left', color: '#3b82f6', stackGroupKey: 'energy', areaOpacity: 0.8, stackOrder, stackOffset, curve: 'monotone' },
    { type: 'stackedArea', dataKey: 'solar', name: '太陽能', yAxis: 'left', color: '#f59e0b', stackGroupKey: 'energy', areaOpacity: 0.8, stackOrder, stackOffset, curve: 'monotone' },
    { type: 'stackedArea', dataKey: 'wind', name: '風力', yAxis: 'left', color: '#10b981', stackGroupKey: 'energy', areaOpacity: 0.8, stackOrder, stackOffset, curve: 'monotone' },
    { type: 'line', dataKey: 'carbonEmission', name: '碳排放量', yAxis: 'right', color: '#ef4444', strokeWidth: 3, curve: 'monotone' },
    { type: 'line', dataKey: 'renewableRatio', name: '再生能源比例', yAxis: 'right', color: '#10b981', strokeWidth: 2, curve: 'monotone' },
  ]

  const getCurrentData = () => {
    switch (activeScenario) {
      case 'traffic': return trafficData
      case 'revenue': return revenueData
      case 'energy': return energyData
      default: return trafficData
    }
  }

  const getCurrentSeries = () => {
    const baseSeries = (() => {
      switch (activeScenario) {
        case 'traffic': return trafficSeries
        case 'revenue': return revenueSeries
        case 'energy': return energySeries
        default: return trafficSeries
      }
    })()

    // 如果有選擇的系列，只顯示選擇的系列
    if (activeSeriesIds.size > 0) {
      return baseSeries.filter(s => activeSeriesIds.has(s.dataKey))
    }
    return baseSeries
  }

  const getCurrentXKey = () => {
    return 'month' // 所有場景現在都使用 month 作為 X 軸
  }

  const getCurrentConfig = () => {
    switch (activeScenario) {
      case 'traffic':
        return {
          title: '網站流量分析 - Stacked Area + Line',
          leftAxis: { label: '訪問量' },
          rightAxis: { label: '轉換率 (%) / 停留時間 (分鐘)' },
          xAxis: { label: '月份' }
        }
      case 'revenue':
        return {
          title: '收入構成分析 - Stacked Area + Line',
          leftAxis: { label: '收入 (萬元)' },
          rightAxis: { label: '增長率 (%) / 利潤率 (%)' },
          xAxis: { label: '月份' }
        }
      case 'energy':
        return {
          title: '能源消耗分析 - Stacked Area + Line',
          leftAxis: { label: '能源占比 (%)' },
          rightAxis: { label: '碳排放 (萬噸) / 再生能源比例 (%)' },
          xAxis: { label: '季度' }
        }
      default:
        return {
          title: '網站流量分析',
          leftAxis: { label: '訪問量' },
          rightAxis: { label: '轉換率' },
          xAxis: { label: '月份' }
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
          Stacked Area + Line 組合圖表
        </h1>
        <p className="text-gray-600 mb-6">
          展示多系列數據的堆疊區域圖與趨勢線的組合，支援多種堆疊模式和排序方式。適用於分析構成關係與趨勢變化的複合數據。
        </p>

        {/* 場景選擇 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'traffic', label: '🌐 網站流量', desc: '多渠道流量堆疊分析' },
            { key: 'revenue', label: '💰 收入構成', desc: '產品線收入分析' },
            { key: 'energy', label: '⚡ 能源結構', desc: '能源來源與環保趨勢' },
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

        {/* 堆疊配置控制 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">堆疊配置</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">堆疊模式</label>
              <select
                value={stackOffset}
                onChange={(e) => setStackOffset(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="none">標準堆疊</option>
                <option value="expand">百分比堆疊</option>
                <option value="silhouette">對稱堆疊</option>
                <option value="wiggle">流圖模式</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
              <select
                value={stackOrder}
                onChange={(e) => setStackOrder(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="none">原始順序</option>
                <option value="ascending">升序排序</option>
                <option value="descending">降序排序</option>
                <option value="insideOut">內外排序</option>
              </select>
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
            {(activeScenario === 'traffic' ? trafficSeries : 
              activeScenario === 'revenue' ? revenueSeries : energySeries).map((series) => (
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
                  ({series.type === 'stackedArea' ? '堆疊' : '線'})
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
            className="stacked-area-line-combo"
          />
        </div>

        {/* 數據統計 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <div className="font-medium text-blue-800">堆疊區域系列</div>
            <div className="text-blue-600">
              {currentSeries.filter(s => s.type === 'stackedArea').length} 個堆疊層級
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
            <h4 className="font-medium text-gray-800 mb-2">🎯 堆疊區域算法</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• 使用 D3.js stack() 生成器進行精確堆疊</li>
              <li>• 支援多種堆疊偏移模式（標準、百分比、對稱、流圖）</li>
              <li>• 智能排序算法優化視覺層次</li>
              <li>• 自動處理缺失值和負值情況</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">📊 組合圖表系統</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• 智能圖層排序：stackedArea → area → bar → line</li>
              <li>• 雙軸支援不同單位的指標對比</li>
              <li>• 動態系列控制與實時更新</li>
              <li>• 響應式設計與交互事件支援</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StackedAreaLineComboDemo