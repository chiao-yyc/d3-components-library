import React, { useState, useCallback, useMemo } from 'react'
import { EnhancedComboChart } from '../../../registry/components/composite/enhanced-combo-chart'
import type { ComboChartSeries } from '../../../registry/components/composite/types'

interface DataPoint {
  [key: string]: any
}

interface SeriesTemplate {
  id: string
  type: 'bar' | 'line' | 'area' | 'stackedArea' | 'scatter' | 'waterfall'
  name: string
  dataKey: string
  yAxis: 'left' | 'right'
  color: string
  category: 'primary' | 'secondary' | 'analysis'
  description: string
  config?: any
}

const DynamicComboDemo: React.FC = () => {
  // 豐富的示例數據
  const sampleData: DataPoint[] = [
    { month: '1月', sales: 120000, revenue: 148000, cost: 85000, profit: 63000, margin: 42.6, users: 2400, retention: 78, satisfaction: 4.2 },
    { month: '2月', sales: 135000, revenue: 162000, cost: 92000, profit: 70000, margin: 43.2, users: 2650, retention: 79, satisfaction: 4.3 },
    { month: '3月', sales: 158000, revenue: 189600, cost: 98000, profit: 91600, margin: 48.3, users: 2890, retention: 81, satisfaction: 4.4 },
    { month: '4月', sales: 142000, revenue: 170400, cost: 88000, profit: 82400, margin: 48.4, users: 3020, retention: 80, satisfaction: 4.1 },
    { month: '5月', sales: 168000, revenue: 201600, cost: 95000, profit: 106600, margin: 52.9, users: 3280, retention: 82, satisfaction: 4.5 },
    { month: '6月', sales: 185000, revenue: 222000, cost: 102000, profit: 120000, margin: 54.1, users: 3450, retention: 84, satisfaction: 4.6 },
    { month: '7月', sales: 198000, revenue: 237600, cost: 108000, profit: 129600, margin: 54.5, users: 3680, retention: 85, satisfaction: 4.7 },
    { month: '8月', sales: 175000, revenue: 210000, cost: 95000, profit: 115000, margin: 54.8, users: 3520, retention: 83, satisfaction: 4.4 },
    { month: '9月', sales: 208000, revenue: 249600, cost: 112000, profit: 137600, margin: 55.1, users: 3890, retention: 86, satisfaction: 4.8 },
    { month: '10月', sales: 225000, revenue: 270000, cost: 118000, profit: 152000, margin: 56.3, users: 4150, retention: 87, satisfaction: 4.9 },
    { month: '11月', sales: 248000, revenue: 297600, cost: 125000, profit: 172600, margin: 58.0, users: 4420, retention: 88, satisfaction: 5.0 },
    { month: '12月', sales: 265000, revenue: 318000, cost: 135000, profit: 183000, margin: 57.5, users: 4680, retention: 89, satisfaction: 5.1 },
  ]

  // 可用的系列模板
  const seriesTemplates: SeriesTemplate[] = [
    // 主要業務指標
    { id: 'sales-bar', type: 'bar', name: '銷售額', dataKey: 'sales', yAxis: 'left', color: '#3b82f6', category: 'primary', description: '月度銷售額（柱狀圖）' },
    { id: 'revenue-bar', type: 'bar', name: '營收', dataKey: 'revenue', yAxis: 'left', color: '#10b981', category: 'primary', description: '月度營收（柱狀圖）' },
    { id: 'cost-bar', type: 'bar', name: '成本', dataKey: 'cost', yAxis: 'left', color: '#ef4444', category: 'primary', description: '營運成本（柱狀圖）' },
    { id: 'profit-area', type: 'area', name: '利潤區域', dataKey: 'profit', yAxis: 'left', color: '#8b5cf6', category: 'primary', description: '利潤趨勢區域', config: { areaOpacity: 0.3 } },
    
    // 線性趨勢指標
    { id: 'margin-line', type: 'line', name: '利潤率', dataKey: 'margin', yAxis: 'right', color: '#f59e0b', category: 'secondary', description: '利潤率趨勢線', config: { strokeWidth: 3, showPoints: true } },
    { id: 'users-line', type: 'line', name: '用戶數', dataKey: 'users', yAxis: 'right', color: '#06b6d4', category: 'secondary', description: '用戶成長線', config: { strokeWidth: 2, showPoints: true } },
    { id: 'retention-line', type: 'line', name: '留存率', dataKey: 'retention', yAxis: 'right', color: '#84cc16', category: 'secondary', description: '用戶留存率', config: { strokeWidth: 2, curve: 'monotone' } },
    
    // 分析型散點圖
    { id: 'satisfaction-scatter', type: 'scatter', name: '滿意度', dataKey: 'satisfaction', yAxis: 'right', color: '#ec4899', category: 'analysis', description: '用戶滿意度散點', config: { scatterRadius: 6, scatterOpacity: 0.8 } },
    { id: 'profit-scatter', type: 'scatter', name: '利潤點', dataKey: 'profit', yAxis: 'left', color: '#f97316', category: 'analysis', description: '利潤分佈點', config: { scatterRadius: 5, scatterOpacity: 0.7 } },
  ]

  const [activeSeries, setActiveSeries] = useState<Set<string>>(new Set(['sales-bar', 'margin-line']))
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'primary' | 'secondary' | 'analysis'>('all')
  const [chartSettings, setChartSettings] = useState({
    animate: true,
    showGridlines: true,
    leftAxisLabel: '金額 (萬元)',
    rightAxisLabel: '比率(%) / 數量',
  })

  // 根據選擇的系列生成圖表配置
  const currentSeries = useMemo((): ComboChartSeries[] => {
    return Array.from(activeSeries)
      .map(seriesId => seriesTemplates.find(t => t.id === seriesId))
      .filter(Boolean)
      .map(template => ({
        type: template!.type,
        dataKey: template!.dataKey,
        name: template!.name,
        yAxis: template!.yAxis,
        color: template!.color,
        ...template!.config
      }))
  }, [activeSeries])

  // 篩選可用的系列模板
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') {
      return seriesTemplates
    }
    return seriesTemplates.filter(t => t.category === selectedCategory)
  }, [selectedCategory])

  // 切換系列
  const toggleSeries = useCallback((seriesId: string) => {
    setActiveSeries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(seriesId)) {
        newSet.delete(seriesId)
      } else {
        newSet.add(seriesId)
      }
      return newSet
    })
  }, [])

  // 預設配置
  const presetConfigurations = [
    {
      name: '銷售分析',
      series: ['sales-bar', 'margin-line', 'users-line'],
      description: '銷售額 + 利潤率 + 用戶成長'
    },
    {
      name: '財務概覽',
      series: ['revenue-bar', 'cost-bar', 'profit-area'],
      description: '營收 + 成本 + 利潤區域'
    },
    {
      name: '用戶體驗',
      series: ['users-line', 'retention-line', 'satisfaction-scatter'],
      description: '用戶數 + 留存率 + 滿意度'
    },
    {
      name: '全面儀表板',
      series: ['sales-bar', 'profit-area', 'margin-line', 'users-line', 'satisfaction-scatter'],
      description: '多維度業務分析組合'
    }
  ]

  const applyPreset = useCallback((preset: any) => {
    setActiveSeries(new Set(preset.series))
  }, [])

  const clearAllSeries = useCallback(() => {
    setActiveSeries(new Set())
  }, [])

  // 統計信息
  const stats = useMemo(() => {
    const typeCount = currentSeries.reduce((acc, series) => {
      acc[series.type] = (acc[series.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalSeries: currentSeries.length,
      typeCount,
      leftAxisSeries: currentSeries.filter(s => s.yAxis === 'left').length,
      rightAxisSeries: currentSeries.filter(s => s.yAxis === 'right').length,
    }
  }, [currentSeries])

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          動態組合圖表系統
        </h1>
        <p className="text-gray-600 mb-6">
          靈活的圖表組合系統，支援動態加載系列、即時配置調整和多種預設組合模式。
        </p>

        {/* 圖表配置控制 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">圖表設定</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="animate"
                  checked={chartSettings.animate}
                  onChange={(e) => setChartSettings(prev => ({ ...prev, animate: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="animate" className="text-sm text-gray-700">動畫效果</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="showGridlines"
                  checked={chartSettings.showGridlines}
                  onChange={(e) => setChartSettings(prev => ({ ...prev, showGridlines: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <label htmlFor="showGridlines" className="text-sm text-gray-700">顯示網格線</label>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">左軸標籤：</label>
                <input
                  type="text"
                  value={chartSettings.leftAxisLabel}
                  onChange={(e) => setChartSettings(prev => ({ ...prev, leftAxisLabel: e.target.value }))}
                  className="text-sm border border-gray-300 rounded px-2 py-1 w-32"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700">右軸標籤：</label>
                <input
                  type="text"
                  value={chartSettings.rightAxisLabel}
                  onChange={(e) => setChartSettings(prev => ({ ...prev, rightAxisLabel: e.target.value }))}
                  className="text-sm border border-gray-300 rounded px-2 py-1 w-32"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 預設配置 */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-medium text-blue-800 mb-3">快速配置</h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {presetConfigurations.map((preset, index) => (
              <button
                key={index}
                onClick={() => applyPreset(preset)}
                className="px-3 py-2 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="font-medium text-blue-700 text-sm">{preset.name}</div>
                <div className="text-xs text-blue-600">{preset.description}</div>
              </button>
            ))}
            <button
              onClick={clearAllSeries}
              className="px-3 py-2 bg-red-100 border border-red-200 rounded-lg hover:bg-red-200 transition-colors"
            >
              <div className="font-medium text-red-700 text-sm">清除全部</div>
              <div className="text-xs text-red-600">移除所有系列</div>
            </button>
          </div>
        </div>

        {/* 系列類別篩選 */}
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">系列類別</h3>
          <div className="flex gap-2">
            {[
              { key: 'all', label: '全部', desc: '所有可用系列' },
              { key: 'primary', label: '主要指標', desc: '核心業務數據' },
              { key: 'secondary', label: '次要指標', desc: '趨勢和比率' },
              { key: 'analysis', label: '分析型', desc: '散點和深度分析' },
            ].map((category) => (
              <button
                key={category.key}
                onClick={() => setSelectedCategory(category.key as any)}
                className={`px-3 py-2 rounded border transition-colors ${
                  selectedCategory === category.key
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="font-medium text-sm">{category.label}</div>
                <div className="text-xs opacity-75">{category.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 可用系列選擇 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">可用圖表系列</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => toggleSeries(template.id)}
                className={`p-3 rounded-lg border transition-all ${
                  activeSeries.has(template.id)
                    ? 'bg-white border-2 shadow-sm'
                    : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
                }`}
                style={{
                  borderColor: activeSeries.has(template.id) ? template.color : undefined
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: template.color }}
                  />
                  <span className="font-medium text-sm">{template.name}</span>
                  <span className="text-xs px-1 py-0.5 bg-gray-200 rounded">
                    {template.type}
                  </span>
                </div>
                <div className="text-xs text-gray-600 text-left">{template.description}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {template.yAxis === 'left' ? '左軸' : '右軸'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 當前配置統計 */}
        <div className="bg-white p-4 rounded-lg border mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">當前配置統計</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalSeries}</div>
              <div className="text-gray-600">總系列數</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.leftAxisSeries}</div>
              <div className="text-gray-600">左軸系列</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.rightAxisSeries}</div>
              <div className="text-gray-600">右軸系列</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{Object.keys(stats.typeCount).length}</div>
              <div className="text-gray-600">圖表類型</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(stats.typeCount).map(([type, count]) => (
              <span key={type} className="px-2 py-1 bg-gray-100 rounded text-xs">
                {type}: {count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 動態圖表 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">動態組合圖表</h2>
        
        {currentSeries.length > 0 ? (
          <div className="mb-4">
            <EnhancedComboChart
              data={sampleData}
              series={currentSeries}
              xKey="month"
              width={900}
              height={500}
              margin={{ top: 20, right: 80, bottom: 60, left: 80 }}
              leftAxis={{
                label: chartSettings.leftAxisLabel,
                gridlines: chartSettings.showGridlines,
              }}
              rightAxis={{
                label: chartSettings.rightAxisLabel,
                gridlines: false,
              }}
              xAxis={{
                label: '月份',
              }}
              animate={chartSettings.animate}
              className="dynamic-combo-chart"
            />
          </div>
        ) : (
          <div className="mb-4 h-[500px] flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">尚未選擇任何圖表系列</div>
              <div className="text-sm">請從上方選擇要顯示的圖表系列，或使用快速配置</div>
            </div>
          </div>
        )}
      </div>

      {/* 功能說明 */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">動態系統特色</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">🚀 動態加載</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• 即時系列添加/移除：無需重新載入頁面</li>
              <li>• 預設配置快速切換：一鍵應用常用組合</li>
              <li>• 系列類別篩選：依據業務需求分類選擇</li>
              <li>• 配置狀態即時統計：清晰掌握當前設定</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">⚡ 性能優化</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• React.memo 和 useMemo：減少不必要的重新渲染</li>
              <li>• useCallback 優化：避免函數重複創建</li>
              <li>• 智能更新機制：只更新變化的圖表元素</li>
              <li>• 漸進式載入：大數據集分批處理</li>
            </ul>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="font-medium text-gray-800 mb-3">📊 應用場景</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-blue-600 mb-1">🏢 企業儀表板</div>
              <div className="text-gray-600">多部門數據整合、KPI 監控、實時業務分析</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-green-600 mb-1">📈 數據探索</div>
              <div className="text-gray-600">彈性數據視覺化、假設驗證、趨勢發現</div>
            </div>
            <div className="bg-white p-3 rounded border">
              <div className="font-medium text-purple-600 mb-1">🎯 客製化報表</div>
              <div className="text-gray-600">用戶自定義圖表、個人化分析、動態報告</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DynamicComboDemo