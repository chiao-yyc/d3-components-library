import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { EnhancedComboChart } from '../../../registry/components/composite/enhanced-combo-chart'
import type { ComboChartSeries } from '../../../registry/components/composite/types'
import { 
  DemoPageTemplate,
  ContentSection,
  ModernControlPanel,
  ControlGroup,
  SelectControl,
  ToggleControl,
  RangeSlider,
  ChartContainer,
  StatusDisplay,
  DataTable,
  CodeExample,
  type DataTableColumn
} from '../components/ui'
import { CogIcon, ChartBarSquareIcon, PresentationChartBarIcon } from '@heroicons/react/24/outline'

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

  const scenarioOptions = [
    { value: 'ecommerce', label: '🛒 電商分析', desc: '銷售、成長與目標' },
    { value: 'budget', label: '💰 預算管理', desc: '支出、預算與效率' },
    { value: 'social', label: '📱 社群媒體', desc: '互動、觸及與參與' },
  ]

  // 狀態顯示數據
  const statusItems = [
    { label: '當前場景', value: scenarioOptions.find(s => s.value === activeScenario)?.label || '' },
    { label: '資料點數', value: getCurrentData().length },
    { label: '區域系列', value: currentSeries.filter(s => s.type === 'area').length },
    { label: '柱狀系列', value: currentSeries.filter(s => s.type === 'bar').length },
    { label: '線條系列', value: currentSeries.filter(s => s.type === 'line').length },
    { label: '柱狀透明度', value: `${Math.round(barOpacity * 100)}%` }
  ]

  // 數據表格列定義
  const tableColumns: DataTableColumn[] = [
    { key: getCurrentXKey(), title: '主鍵', sortable: true },
    { 
      key: activeScenario === 'ecommerce' ? 'sales' : activeScenario === 'budget' ? 'actual_cost' : 'interactions', 
      title: '主要數值', 
      sortable: true,
      formatter: (value) => typeof value === 'number' ? value.toLocaleString() : value,
      align: 'right'
    },
    { 
      key: activeScenario === 'ecommerce' ? 'target' : activeScenario === 'budget' ? 'forecast' : 'engagement_rate', 
      title: '目標/趨勢', 
      sortable: true,
      formatter: (value) => typeof value === 'number' ? value.toLocaleString() : value,
      align: 'right'
    }
  ]

  return (
    <DemoPageTemplate
      title="Bar + Area + Line 三重組合圖表"
      description="展示柱狀圖、區域圖與線圖的三重組合，適用於多維度業務分析、預算管理和績效追蹤"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 控制面板 */}
        <div className="lg:col-span-1">
          <ModernControlPanel 
            title="控制面板" 
            icon={<CogIcon className="w-5 h-5" />}
          >
          <div className="space-y-8">
            {/* 場景選擇 */}
            <ControlGroup title="場景選擇" icon="🎯" cols={1}>
              <SelectControl
                label="分析場景"
                value={activeScenario}
                onChange={(value) => {
                  setActiveScenario(value as any)
                  setActiveSeriesIds(new Set())
                }}
                options={scenarioOptions.map(s => ({ value: s.value, label: s.label }))}
                description={scenarioOptions.find(s => s.value === activeScenario)?.desc}
              />
            </ControlGroup>

            {/* 三重組合配置 */}
            <ControlGroup title="三重組合配置" icon="📊" cols={2}>
              <ToggleControl
                label="顯示區域圖"
                checked={showAreaChart}
                onChange={setShowAreaChart}
                description="顯示背景範圍參考區域"
              />
              
              <RangeSlider
                label="柱狀圖透明度"
                value={barOpacity}
                min={0.3}
                max={1}
                step={0.1}
                onChange={setBarOpacity}
                suffix="%"
                description="調整柱狀圖透明度以優化視覺層次"
              />
            </ControlGroup>

            {/* 系列控制 */}
            <ControlGroup title="系列控制" icon="🎨" cols={1}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">可見系列</span>
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
            </ControlGroup>
          </div>
          </ModernControlPanel>
        </div>

        {/* 主要內容區域 */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* 圖表展示 */}
          <motion.div
            key={activeScenario}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
        <ChartContainer
          title={config.title}
          subtitle={`${currentSeries.filter(s => s.type === 'area').length}區域 + ${currentSeries.filter(s => s.type === 'bar').length}柱狀 + ${currentSeries.filter(s => s.type === 'line').length}線條 三重組合`}
          responsive={true}
          aspectRatio={16 / 9}
          actions={
            <div className="flex items-center gap-2">
              <PresentationChartBarIcon className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-600">三重組合圖表</span>
            </div>
          }
        >
          {({ width, height }) => (
            <motion.div
              key={`${activeScenario}-${barOpacity}-${showAreaChart}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <EnhancedComboChart
                data={getCurrentData()}
                series={currentSeries}
                xKey={getCurrentXKey()}
                width={width}
                height={height}
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
            </motion.div>
          )}
        </ChartContainer>
          </motion.div>

          {/* 狀態顯示 */}
          <StatusDisplay items={statusItems} />

          {/* 數據詳情 */}
          <DataTable
            title="數據詳情"
            data={getCurrentData()}
            columns={tableColumns}
            maxRows={8}
            showIndex
          />

          {/* 代碼範例 */}
        <CodeExample
          title="使用範例"
          language="tsx"
          code={`import { EnhancedComboChart, type ComboChartSeries } from '../../../registry/components/composite'

const data = [
  { 
    month: 'Q1', 
    sales: 120000, 
    growth_min: 110000, 
    growth_max: 140000, 
    target: 135000, 
    conversion: 3.2 
  },
  // ...更多數據
]

const series: ComboChartSeries[] = [
  // Area 系列 - 背景區間
  {
    type: 'area',
    dataKey: 'growth_max',
    name: '成長預期區間',
    yAxis: 'left',
    color: '#10b981',
    areaOpacity: 0.15,
    baseline: (d: any) => d.growth_min
  },
  // Bar 系列 - 主要數據
  {
    type: 'bar',
    dataKey: 'sales',
    name: '實際銷售額',
    yAxis: 'left',
    color: '#3b82f6',
    barOpacity: 0.7,
    barWidth: 0.6
  },
  // Line 系列 - 目標/趨勢
  {
    type: 'line',
    dataKey: 'target',
    name: '目標線',
    yAxis: 'left',
    color: '#ef4444',
    strokeWidth: 3,
    showPoints: true
  }
]

<EnhancedComboChart
  data={data}
  series={series}
  xKey="month"
  width={${getCurrentData().length * 80}}
  height={500}
  leftAxis={{ label: "${config.leftAxis.label}", gridlines: true }}
  rightAxis={{ label: "${config.rightAxis.label}", gridlines: false }}
  animate={true}
  interactive={true}
/>`}
          />

          {/* 功能說明 */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full" />
            <h3 className="text-xl font-semibold text-gray-800">三重組合圖表功能特點</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">視覺層次</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  背景區域參考
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  主要數據柱狀圖
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  趨勢線分析
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  雙軸數據支援
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">互動功能</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  圖層獨立控制
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  透明度調整
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  系列篩選
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  場景快速切換
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">應用場景</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  電商業務分析
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full" />
                  專案預算管理
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-lime-500 rounded-full" />
                  社群媒體監控
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  多維度分析
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        </div>
      </div>
    </DemoPageTemplate>
  )
}

export default TripleComboDemo