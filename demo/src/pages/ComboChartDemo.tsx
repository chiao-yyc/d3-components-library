import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MultiSeriesComboChartV2 } from '../../../registry/components/composite'
import type { ComboSeries } from '../../../registry/components/composite'
import {
  DemoPageTemplate,
  ModernControlPanel,
  ChartContainer,
  DataTable,
  CodeExample
} from '../components/ui'
import {
  ChartBarSquareIcon,
  ComputerDesktopIcon,
  BanknotesIcon,
  CogIcon,
  EyeIcon,
  SparklesIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'

const ComboChartDemo: React.FC = () => {
  // 場景 1: 銷售與成長分析
  const salesData = [
    { month: 'Jan', sales: 120, growth: 15.2, profit: 25, conversion: 3.2 },
    { month: 'Feb', sales: 145, growth: 18.5, profit: 32, conversion: 3.5 },
    { month: 'Mar', sales: 168, growth: 22.1, profit: 38, conversion: 3.8 },
    { month: 'Apr', sales: 192, growth: 25.8, profit: 45, conversion: 4.1 },
    { month: 'May', sales: 218, growth: 28.2, profit: 52, conversion: 4.4 },
    { month: 'Jun', sales: 235, growth: 24.5, profit: 58, conversion: 4.2 }
  ]

  // 場景 2: 營收與獲利分析
  const revenueData = [
    { quarter: 'Q1', revenue: 350, profitMargin: 22.5, expenses: 275, roi: 18.2 },
    { quarter: 'Q2', revenue: 420, profitMargin: 24.8, expenses: 315, roi: 21.5 },
    { quarter: 'Q3', revenue: 480, profitMargin: 26.2, expenses: 355, roi: 23.8 },
    { quarter: 'Q4', revenue: 525, profitMargin: 28.1, expenses: 378, roi: 25.4 }
  ]

  // 場景 3: 流量與轉換分析
  const trafficData = [
    { week: 'W1', visitors: 2500, conversion: 2.1, revenue: 5250, satisfaction: 4.2 },
    { week: 'W2', visitors: 2800, conversion: 2.4, revenue: 6720, satisfaction: 4.3 },
    { week: 'W3', visitors: 3200, conversion: 2.8, revenue: 8960, satisfaction: 4.5 },
    { week: 'W4', visitors: 2900, conversion: 2.6, revenue: 7540, satisfaction: 4.4 }
  ]

  const [activeScenario, setActiveScenario] = useState<'sales' | 'revenue' | 'traffic'>('sales')
  const [activeSeriesIds, setActiveSeriesIds] = useState<Set<string>>(new Set())
  
  // 對齊測試功能
  const [alignment, setAlignment] = useState<'start' | 'center' | 'end'>('center')
  const [barWidthRatio, setBarWidthRatio] = useState(0.8)
  const [showAlignmentGuides, setShowAlignmentGuides] = useState(false)

  // 銷售場景配置
  const salesSeries: ComboSeries[] = [
    { type: 'bar', yKey: 'sales', name: '銷售額', yAxis: 'left', color: '#3b82f6' },
    { type: 'line', yKey: 'growth', name: '成長率', yAxis: 'right', color: '#ef4444', strokeWidth: 3 },
    { type: 'line', yKey: 'conversion', name: '轉換率', yAxis: 'right', color: '#10b981', strokeWidth: 2 }
  ]

  // 營收場景配置
  const revenueSeries: ComboSeries[] = [
    { type: 'bar', yKey: 'revenue', name: '營收', yAxis: 'left', color: '#059669' },
    { type: 'line', yKey: 'profitMargin', name: '利潤率', yAxis: 'right', color: '#dc2626', strokeWidth: 3 },
    { type: 'line', yKey: 'roi', name: 'ROI', yAxis: 'right', color: '#f59e0b', strokeWidth: 2 }
  ]

  // 流量場景配置
  const trafficSeries: ComboSeries[] = [
    { type: 'bar', yKey: 'visitors', name: '訪客數', yAxis: 'left', color: '#7c3aed' },
    { type: 'line', yKey: 'conversion', name: '轉換率', yAxis: 'right', color: '#f59e0b', strokeWidth: 3 },
    { type: 'line', yKey: 'satisfaction', name: '滿意度', yAxis: 'right', color: '#10b981', strokeWidth: 2 }
  ]

  const getCurrentData = () => {
    switch (activeScenario) {
      case 'sales': return salesData
      case 'revenue': return revenueData
      case 'traffic': return trafficData
      default: return salesData
    }
  }

  const getCurrentSeries = () => {
    const baseSeries = (() => {
      switch (activeScenario) {
        case 'sales': return salesSeries
        case 'revenue': return revenueSeries
        case 'traffic': return trafficSeries
        default: return salesSeries
      }
    })()

    if (activeSeriesIds.size > 0) {
      return baseSeries.filter(s => activeSeriesIds.has(s.yKey))
    }
    return baseSeries
  }

  const getCurrentXKey = () => {
    switch (activeScenario) {
      case 'sales': return 'month'
      case 'revenue': return 'quarter'
      case 'traffic': return 'week'
      default: return 'month'
    }
  }

  const getCurrentConfig = () => {
    switch (activeScenario) {
      case 'sales':
        return {
          title: '銷售與成長分析 - Bar + Line',
          leftAxis: { label: '銷售額 (萬元)' },
          rightAxis: { label: '百分比 (%)' },
          xAxis: { label: '月份' }
        }
      case 'revenue':
        return {
          title: '營收與獲利分析 - Bar + Line',
          leftAxis: { label: '營收 (萬元)' },
          rightAxis: { label: '百分比 (%)' },
          xAxis: { label: '季度' }
        }
      case 'traffic':
        return {
          title: '流量與轉換分析 - Bar + Line',
          leftAxis: { label: '訪客數' },
          rightAxis: { label: '評分/比率' },
          xAxis: { label: '週期' }
        }
      default:
        return {
          title: '組合圖表',
          leftAxis: { label: '數值' },
          rightAxis: { label: '比率' },
          xAxis: { label: '時間' }
        }
    }
  }

  const toggleSeries = (yKey: string) => {
    const newActiveIds = new Set(activeSeriesIds)
    if (newActiveIds.has(yKey)) {
      newActiveIds.delete(yKey)
    } else {
      newActiveIds.add(yKey)
    }
    setActiveSeriesIds(newActiveIds)
  }

  const resetSeries = () => {
    setActiveSeriesIds(new Set())
  }

  const config = getCurrentConfig()
  const currentSeries = getCurrentSeries()

  // 程式碼範例
  const codeExample = `import { MultiSeriesComboChartV2 } from '../../../registry/components/composite'
import type { ComboChartSeries } from '../../../registry/components/composite/types'

const data = [
  { month: 'Jan', sales: 120, growth: 15.2 },
  { month: 'Feb', sales: 145, growth: 18.5 },
  // ...更多資料
]

const series: ComboSeries[] = [
  { 
    type: 'bar', 
    yKey: 'sales', 
    name: '銷售額', 
    yAxis: 'left', 
    color: '#3b82f6' 
  },
  { 
    type: 'line', 
    yKey: 'growth', 
    name: '成長率', 
    yAxis: 'right', 
    color: '#ef4444', 
    strokeWidth: 3 
  }
]

<MultiSeriesComboChartV2
  data={data}
  series={series}
  xAccessor="month"
  width={800}
  height={500}
  leftAxisConfig={{ label: '銷售額 (萬元)', tickCount: 5 }}
  rightAxisConfig={{ label: '成長率 (%)' }}
  showGrid={true}
  animate={true}
/>`

  return (
    <DemoPageTemplate
      title="組合圖表演示"
      description="展示 Bar + Line 的基本組合圖表，支援雙軸配置、系列控制與對齊測試功能，適用於不同量綱數據的對比分析。包含對齊策略測試，確保組合圖表中各元素的視覺一致性。"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 控制面板 */}
        <div className="lg:col-span-1">
          <ModernControlPanel title="場景控制" icon={<CogIcon className="h-5 w-5" />}>
            <div className="space-y-6">
              
              {/* 場景選擇 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700">選擇演示場景</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { 
                      key: 'sales', 
                      label: '銷售分析', 
                      icon: <ChartBarSquareIcon className="h-4 w-4" />,
                      desc: '月度銷售與成長趨勢',
                      color: 'blue'
                    },
                    { 
                      key: 'revenue', 
                      label: '營收分析', 
                      icon: <BanknotesIcon className="h-4 w-4" />,
                      desc: '季度營收與獲利分析',
                      color: 'green' 
                    },
                    { 
                      key: 'traffic', 
                      label: '流量分析', 
                      icon: <ComputerDesktopIcon className="h-4 w-4" />,
                      desc: '週期流量與轉換分析',
                      color: 'purple'
                    },
                  ].map((scenario) => (
                    <motion.button
                      key={scenario.key}
                      onClick={() => {
                        setActiveScenario(scenario.key as any)
                        setActiveSeriesIds(new Set())
                      }}
                      whileHover={{ scale: 1.02, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                        activeScenario === scenario.key
                          ? `bg-${scenario.color}-100 border-${scenario.color}-300 text-${scenario.color}-700`
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {scenario.icon}
                        <span className="font-medium text-sm">{scenario.label}</span>
                      </div>
                      <div className="text-xs opacity-70">{scenario.desc}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 對齊測試控制 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FunnelIcon className="h-4 w-4 text-red-500" />
                  <h3 className="text-sm font-semibold text-gray-700">對齊測試</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">對齊策略</label>
                    <select
                      value={alignment}
                      onChange={(e) => setAlignment(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="start">左對齊 (Start)</option>
                      <option value="center">中心對齊 (Center)</option>
                      <option value="end">右對齊 (End)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-2 block">
                      條形寬度比例 ({(barWidthRatio * 100).toFixed(0)}%)
                    </label>
                    <input
                      type="range"
                      min="0.2"
                      max="1.0"
                      step="0.1"
                      value={barWidthRatio}
                      onChange={(e) => setBarWidthRatio(parseFloat(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="showAlignmentGuides"
                      checked={showAlignmentGuides}
                      onChange={(e) => setShowAlignmentGuides(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="showAlignmentGuides" className="text-xs text-gray-600">
                      顯示對齊輔助線
                    </label>
                  </div>
                </div>
              </div>

              {/* 系列控制 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EyeIcon className="h-4 w-4 text-purple-500" />
                    <h3 className="text-sm font-semibold text-gray-700">系列控制</h3>
                  </div>
                  <button
                    onClick={resetSeries}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
                  >
                    顯示全部
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {(activeScenario === 'sales' ? salesSeries :
                    activeScenario === 'revenue' ? revenueSeries : trafficSeries).map((series) => (
                    <motion.button
                      key={series.yKey}
                      onClick={() => toggleSeries(series.yKey)}
                      whileHover={{ x: 2 }}
                      className={`w-full p-2 rounded-lg text-xs transition-all duration-200 text-left ${
                        activeSeriesIds.size === 0 || activeSeriesIds.has(series.yKey)
                          ? 'bg-white border-2 shadow-sm'
                          : 'bg-gray-100 border border-gray-300 opacity-60'
                      }`}
                      style={{
                        borderColor: activeSeriesIds.size === 0 || activeSeriesIds.has(series.yKey) 
                          ? series.color 
                          : undefined
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-sm" 
                          style={{ backgroundColor: series.color }}
                        />
                        <span className="font-medium flex-1">{series.name}</span>
                        <span className="text-xs opacity-60">
                          ({series.type === 'bar' ? '柱' : '線'})
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
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
              title={`${config.title} ${showAlignmentGuides ? '(顯示對齊輔助線)' : ''}`}
              subtitle={`${currentSeries.length} 個系列 | ${getCurrentData().length} 個資料點 | 對齊策略: ${alignment === 'start' ? '左對齊' : alignment === 'center' ? '中心對齊' : '右對齊'}`}
              responsive={true}
              aspectRatio={16 / 9}
            >
              {({ width, height }) => (
                <MultiSeriesComboChartV2
                  data={getCurrentData()}
                  series={currentSeries}
                  xAccessor={getCurrentXKey()}
                  width={width}
                  height={height}
                  margin={{ top: 20, right: 80, bottom: 60, left: 80 }}
                  leftAxisConfig={{
                    label: config.leftAxis.label,
                    tickCount: 5
                  }}
                  rightAxisConfig={{
                    label: config.rightAxis.label,
                    tickCount: 5
                  }}
                  barWidth={barWidthRatio}
                  alignment={alignment}
                  showAlignmentGuides={showAlignmentGuides}
                  showGrid={true}
                  animate={true}
                  className="combo-chart-demo"
                />
              )}
            </ChartContainer>
          </motion.div>

          {/* 程式碼範例 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <CodeExample
              title="MultiSeriesComboChartV2 使用範例"
              description="展示如何使用 registry 的 MultiSeriesComboChartV2 組件創建 Bar + Line 組合圖表"
              code={codeExample}
              language="typescript"
            />
          </motion.div>

          {/* 數據統計卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <motion.div
              key="bar-series-card"
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <ChartBarSquareIcon className="h-4 w-4 text-white" />
                </div>
                <div className="font-semibold text-blue-800">Bar 系列</div>
              </div>
              <div className="text-blue-700 text-lg font-bold">
                {currentSeries.filter(s => s.type === 'bar').length} 個柱狀圖
              </div>
            </motion.div>

            <motion.div
              key="line-series-card"
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">~</span>
                </div>
                <div className="font-semibold text-green-800">Line 系列</div>
              </div>
              <div className="text-green-700 text-lg font-bold">
                {currentSeries.filter(s => s.type === 'line').length} 條趨勢線
              </div>
            </motion.div>

            <motion.div
              key="data-points-card"
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">#</span>
                </div>
                <div className="font-semibold text-purple-800">資料點</div>
              </div>
              <div className="text-purple-700 text-lg font-bold">
                {getCurrentData().length} 個時間點
              </div>
            </motion.div>
          </motion.div>

          {/* 資料表格 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <DataTable
              title={`${config.title} - 資料預覽`}
              description="當前場景的示範資料展示"
              data={getCurrentData()}
              columns={Object.keys(getCurrentData()[0] || {}).map(key => ({
                key,
                title: key,
                sortable: true
              }))}
            />
          </motion.div>
        </div>
      </div>
    </DemoPageTemplate>
  )
}

export default ComboChartDemo