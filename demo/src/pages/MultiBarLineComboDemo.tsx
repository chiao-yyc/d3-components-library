import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
  ComputerDesktopIcon,
  BanknotesIcon,
  CogIcon,
  EyeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

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
    <DemoPageTemplate
      title="Multi-Bar + Line 組合圖表 📊"
      description="展示多個 Bar 系列與 Line 系列的完美組合，支援智能分組條形圖與雙軸配置，適用於企業級多維度數據比較與趨勢分析。"
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
                      key: 'business', 
                      label: '業務指標', 
                      icon: <ChartBarSquareIcon className="h-4 w-4" />,
                      desc: '多部門銷售與KPI',
                      color: 'blue'
                    },
                    { 
                      key: 'system', 
                      label: '系統監控', 
                      icon: <ComputerDesktopIcon className="h-4 w-4" />,
                      desc: '多服務器負載監控',
                      color: 'green' 
                    },
                    { 
                      key: 'financial', 
                      label: '金融分析', 
                      icon: <BanknotesIcon className="h-4 w-4" />,
                      desc: '投資組合表現分析',
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
                  {(activeScenario === 'business' ? businessSeries : 
                    activeScenario === 'system' ? systemSeries : financialSeries).map((series) => (
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
                          ({series.type === 'bar' ? '條' : '線'})
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
              description={`${currentSeries.length} 個系列 | ${getCurrentData().length} 個資料點`}
            >
              <div className="h-[600px] w-full bg-gradient-to-br from-gray-50 to-white rounded-lg p-6">
                <EnhancedComboChart
                  data={getCurrentData()}
                  series={currentSeries}
                  xKey={getCurrentXKey()}
                  width={800}
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
                  <ChartBarSquareIcon className="h-4 w-4 text-white" />
                </div>
                <div className="font-semibold text-blue-800">Bar 系列</div>
              </div>
              <div className="text-blue-700 text-lg font-bold">
                {currentSeries.filter(s => s.type === 'bar').length} 個分組條形圖
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
                <div className="font-semibold text-green-800">Line 系列</div>
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
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">🔧 技術特色</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-sm"
              >
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <ChartBarSquareIcon className="h-5 w-5 text-blue-500" />
                  Multi-Bar 分組渲染
                </h4>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></span>
                    使用 barGroupKey 進行條形圖分組
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></span>
                    自動計算組內偏移量和條寬度
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></span>
                    支援無限數量的分組條形圖
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></span>
                    智能處理重疊和間距
                  </li>
                </ul>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-sm"
              >
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CogIcon className="h-5 w-5 text-purple-500" />
                  雙軸與圖層管理
                </h4>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"></span>
                    左右軸獨立配置和刻度
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"></span>
                    智能圖層排序：area → bar → line
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"></span>
                    Z-index 管理確保線條可見性
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 flex-shrink-0"></span>
                    動畫和交互事件支援
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
        </div>
      </div>
    </DemoPageTemplate>
  )
}

export default MultiBarLineComboDemo