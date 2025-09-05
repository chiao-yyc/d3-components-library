import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { EnhancedComboChart } from '../../../registry/components/composite/enhanced-combo-chart'
import type { ComboChartSeries } from '../../../registry/components/composite/types'
import {
  DemoPageTemplate,
  ModernControlPanel,
  ChartContainer,
  DataTable,
  CodeExample
} from '../components/ui'
import {
  ChartBarSquareIcon,
  BanknotesIcon,
  ChartBarIcon,
  CogIcon,
  EyeIcon,
  SparklesIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

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
      color: '#8b5cf6', 
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
          title: '現金流瀑布分析 - Waterfall + Line',
          leftAxis: { label: '現金流 (萬元)' },
          rightAxis: { label: '燃燒率 / 資金跑道' },
          xAxis: { label: '時期' }
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
          title: '產品開發成本分析 - Waterfall + Line',
          leftAxis: { label: '開發成本 (萬元)' },
          rightAxis: { label: '進度(%) / 品質分數' },
          xAxis: { label: '開發階段' }
        }
      default:
        return {
          title: '現金流分析',
          leftAxis: { label: '現金流' },
          rightAxis: { label: '指標' },
          xAxis: { label: '時期' }
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
    <DemoPageTemplate
      title="Waterfall + Line 組合圖表 💧"
      description="展示瀑布圖與趨勢線的完美組合，支援累積效果展示、連接線配置和多種瀑布圖類型。適用於財務分析、預算管控和階段性成本追蹤。"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 控制面板 */}
        <div className="lg:col-span-1">
          <ModernControlPanel title="瀑布分析控制" icon={<CogIcon className="h-5 w-5" />}>
            <div className="space-y-6">
              
              {/* 場景選擇 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700">選擇分析場景</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { 
                      key: 'cashflow', 
                      label: '現金流分析', 
                      icon: <BanknotesIcon className="h-4 w-4" />,
                      desc: '現金流變化與資金管理',
                      color: 'blue'
                    },
                    { 
                      key: 'budget', 
                      label: '預算執行', 
                      icon: <ChartBarIcon className="h-4 w-4" />,
                      desc: '預算變動與執行效率',
                      color: 'green' 
                    },
                    { 
                      key: 'development', 
                      label: '專案開發', 
                      icon: <ChartBarSquareIcon className="h-4 w-4" />,
                      desc: '開發成本與進度品質',
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

              {/* 瀑布圖配置 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="h-4 w-4 text-green-500" />
                  <h3 className="text-sm font-semibold text-gray-700">瀑布圖配置</h3>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showConnectors"
                      checked={showConnectors}
                      onChange={(e) => setShowConnectors(e.target.checked)}
                      className="rounded border-gray-300 text-green-500 focus:ring-green-200"
                    />
                    <label htmlFor="showConnectors" className="text-sm text-gray-700 font-medium">顯示連接線</label>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <div className="font-medium mb-1">瀑布圖說明：</div>
                    <div className="space-y-1">
                      <div>• 綠色：正向貢獻</div>
                      <div>• 紅色：負向影響</div>
                      <div>• 藍色：總計數值</div>
                      <div>• 紫色：小計數值</div>
                    </div>
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
                  {(activeScenario === 'cashflow' ? cashFlowSeries : 
                    activeScenario === 'budget' ? budgetSeries : developmentSeries).map((series) => (
                    <motion.button
                      key={series.dataKey}
                      onClick={() => toggleSeries(series.dataKey)}
                      whileHover={{ x: 2 }}
                      className={`w-full p-2 rounded-lg text-xs transition-all duration-200 text-left ${
                        activeSeriesIds.size === 0 || activeSeriesIds.has(series.dataKey)
                          ? 'bg-white border-2 shadow-sm'
                          : 'bg-gray-100 border border-gray-300 opacity-60'
                      }`}
                      style={{
                        borderColor: activeSeriesIds.size === 0 || activeSeriesIds.has(series.dataKey) 
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
                          ({series.type === 'waterfall' ? '瀑布' : '線'})
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
              title={config.title}
              subtitle={`${currentSeries.length} 個系列 | ${getCurrentData().length} 個資料點`}
              responsive={true}
              aspectRatio={16 / 9}
            >
              {({ width, height }) => (
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
                  className="waterfall-line-combo"
                />
              )}
            </ChartContainer>
          </motion.div>

          {/* 數據統計卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <motion.div 
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <ChartBarIcon className="h-4 w-4 text-white" />
                </div>
                <div className="font-semibold text-blue-800">瀑布系列</div>
              </div>
              <div className="text-blue-700 text-lg font-bold">
                {currentSeries.filter(s => s.type === 'waterfall').length} 個瀑布圖系列
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">~</span>
                </div>
                <div className="font-semibold text-green-800">趨勢線系列</div>
              </div>
              <div className="text-green-700 text-lg font-bold">
                {currentSeries.filter(s => s.type === 'line').length} 條趨勢線
              </div>
            </motion.div>
            
            <motion.div 
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

          {/* 技術特色說明 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 backdrop-blur-sm border border-white/20"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">💧 技術特色</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-sm"
              >
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <ChartBarIcon className="h-5 w-5 text-blue-500" />
                  瀑布圖功能
                </h4>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></span>
                    累積效果：展示數值的逐步累積變化
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></span>
                    類型區分：正負值、總計、小計自動著色
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></span>
                    連接線：可選擇性顯示數值間的連結
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></span>
                    財務分析：最適合現金流和預算分析
                  </li>
                </ul>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-sm"
              >
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <AdjustmentsHorizontalIcon className="h-5 w-5 text-green-500" />
                  組合分析
                </h4>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></span>
                    雙軸配置：瀑布圖配合趨勢指標
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></span>
                    多場景應用：現金流、預算、專案成本
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></span>
                    智能連接：自動計算累積值和連接線
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></span>
                    動畫支援：流暢的瀑布效果動畫
                  </li>
                </ul>
              </motion.div>
            </div>
          </motion.div>

          {/* 資料表格 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <DataTable
              title={`${config.title} - 資料預覽`}
              description="當前場景的示範資料，展示前8筆記錄"
              data={getCurrentData().slice(0, 8)}
              columns={Object.keys(getCurrentData()[0] || {}).map(key => ({
                key,
                title: key,
                sortable: true
              }))}
            />
          </motion.div>

          {/* 程式碼範例 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <CodeExample
              title="瀑布 + 趨勢線組合圖表使用範例"
              description="展示如何使用 waterfall 系列結合趨勢線，支援累積效果與連接線配置"
              code={`import { EnhancedComboChart, type ComboChartSeries } from '../../../registry/components/composite'

const data = [
  { 
    period: '期初', 
    amount: 1000, 
    type: 'total', 
    cashBalance: 1000, 
    burnRate: 0 
  },
  { 
    period: 'Q1營收', 
    amount: 500, 
    type: 'positive', 
    cashBalance: 1500, 
    burnRate: -50 
  },
  { 
    period: 'Q1支出', 
    amount: -300, 
    type: 'negative', 
    cashBalance: 1200, 
    burnRate: -100 
  },
  // ...更多數據
]

const series: ComboChartSeries[] = [
  {
    type: 'waterfall',
    dataKey: 'amount',
    name: '現金流變化',
    yAxis: 'left',
    color: '#3b82f6',
    typeKey: 'type',
    waterfallOpacity: 0.8,
    // 瀑布圖顏色配置
    positiveColor: '#10b981',  // 正向貢獻
    negativeColor: '#ef4444',  // 負向影響
    totalColor: '#3b82f6',     // 總計
    subtotalColor: '#8b5cf6',  // 小計
    // 連接線配置
    showConnectors: true,
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
  }
]

<EnhancedComboChart
  data={data}
  series={series}
  xKey="period"
  width={800}
  height={500}
  leftAxis={{
    label: '現金流 (萬元)',
    gridlines: true
  }}
  rightAxis={{
    label: '燃燒率',
    gridlines: false
  }}
  xAxis={{
    label: '時期'
  }}
  animate={true}
  interactive={true}
  margin={{ top: 20, right: 80, bottom: 60, left: 100 }}
  onSeriesClick={(series, dataPoint) => {
    console.log('點擊了', series.name, dataPoint)
  }}
/>`}
              language="typescript"
            />
          </motion.div>
        </div>
      </div>
    </DemoPageTemplate>
  )
}

export default WaterfallLineComboDemo