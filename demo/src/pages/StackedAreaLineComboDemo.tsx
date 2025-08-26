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
  SparklesIcon,
  SignalIcon,
  GlobeAltIcon,
  BoltIcon
} from '@heroicons/react/24/outline'

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
  ]

  const [activeScenario, setActiveScenario] = useState<'traffic' | 'revenue' | 'energy'>('traffic')
  const [activeSeriesIds, setActiveSeriesIds] = useState<Set<string>>(new Set())
  const [stackOffset, setStackOffset] = useState<'none' | 'expand' | 'silhouette' | 'wiggle'>('none')
  const [stackOrder, setStackOrder] = useState<'none' | 'ascending' | 'descending' | 'insideOut'>('none')
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)
  const [showTooltips, setShowTooltips] = useState(true)

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
          title: '網站流量分析',
          subtitle: '多渠道流量堆疊與轉換率趨勢分析',
          leftAxis: { label: '訪問量' },
          rightAxis: { label: '轉換率 (%) / 停留時間 (分鐘)' },
          xAxis: { label: '月份' }
        }
      case 'revenue':
        return {
          title: '收入構成分析',
          subtitle: '產品線收入堆疊與增長率分析',
          leftAxis: { label: '收入 (萬元)' },
          rightAxis: { label: '增長率 (%) / 利潤率 (%)' },
          xAxis: { label: '月份' }
        }
      case 'energy':
        return {
          title: '能源消耗分析',
          subtitle: '能源來源堆疊與環保指標趨勢',
          leftAxis: { label: '能源占比 (%)' },
          rightAxis: { label: '碳排放 (萬噸) / 再生能源比例 (%)' },
          xAxis: { label: '季度' }
        }
      default:
        return {
          title: '網站流量分析',
          subtitle: '多渠道流量堆疊分析',
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
  const currentData = getCurrentData()

  const scenarios = [
    {
      id: 'traffic' as const,
      title: '流量分析',
      icon: GlobeAltIcon,
      description: '多渠道網站流量堆疊分析',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'revenue' as const,
      title: '收入構成',
      icon: BanknotesIcon,
      description: '產品線收入結構分析',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'energy' as const,
      title: '能源結構',
      icon: BoltIcon,
      description: '能源來源與環保趨勢',
      color: 'from-yellow-500 to-yellow-600'
    }
  ]

  const statisticsData = [
    {
      label: '資料點數',
      value: currentData.length,
      icon: SignalIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: '堆疊系列',
      value: currentSeries.filter(s => s.type === 'stackedArea').length,
      icon: ChartBarSquareIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: '趨勢線',
      value: currentSeries.filter(s => s.type === 'line').length,
      icon: SparklesIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: '總系列',
      value: currentSeries.length,
      icon: EyeIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  const features = [
    {
      title: '智能堆疊算法',
      description: '使用D3.js堆疊生成器實現精確的多層堆疊，支援多種偏移和排序模式',
      icon: SparklesIcon
    },
    {
      title: '多維度組合',
      description: '結合堆疊區域圖與趨勢線，同時展示構成關係和變化趨勢',
      icon: EyeIcon
    },
    {
      title: '動態系列控制',
      description: '支援即時切換系列顯示，靈活調整堆疊配置和排序方式',
      icon: CogIcon
    },
    {
      title: '雙軸指標對比',
      description: '左右雙軸支援不同量級指標同時展示，提供全面的數據洞察',
      icon: ComputerDesktopIcon
    }
  ]

  return (
    <DemoPageTemplate>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Stacked Area + Line 組合圖表
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          展示多系列數據的堆疊區域圖與趨勢線組合，支援多種堆疊模式和排序方式，適用於構成關係分析
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Panel - 1/4 width */}
        <div className="lg:col-span-1 space-y-6">
          {/* Scenario Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <ChartBarSquareIcon className="h-5 w-5 mr-2 text-blue-600" />
              場景選擇
            </h3>
            <div className="space-y-3">
              {scenarios.map((scenario) => {
                const Icon = scenario.icon
                return (
                  <motion.button
                    key={scenario.id}
                    onClick={() => {
                      setActiveScenario(scenario.id)
                      setActiveSeriesIds(new Set())
                    }}
                    className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                      activeScenario === scenario.id
                        ? `bg-gradient-to-r ${scenario.color} text-white shadow-lg`
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center mb-2">
                      <Icon className={`h-5 w-5 mr-2 ${
                        activeScenario === scenario.id ? 'text-white' : 'text-gray-600'
                      }`} />
                      <span className="font-medium">{scenario.title}</span>
                    </div>
                    <p className={`text-sm ${
                      activeScenario === scenario.id ? 'text-white/90' : 'text-gray-600'
                    }`}>
                      {scenario.description}
                    </p>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>

          {/* Stack Configuration */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">堆疊配置</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">堆疊模式</label>
                <select
                  value={stackOffset}
                  onChange={(e) => setStackOffset(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="none">原始順序</option>
                  <option value="ascending">升序排序</option>
                  <option value="descending">降序排序</option>
                  <option value="insideOut">內外排序</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">圖表統計</h3>
            <div className="grid grid-cols-2 gap-3">
              {statisticsData.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className={`${stat.bgColor} rounded-lg p-3 text-center`}
                  >
                    <Icon className={`h-5 w-5 ${stat.color} mx-auto mb-1`} />
                    <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-gray-600">{stat.label}</div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Modern Control Panel */}
          <ModernControlPanel
            animate={animate}
            onAnimateChange={setAnimate}
            interactive={interactive}
            onInteractiveChange={setInteractive}
            showTooltips={showTooltips}
            onShowTooltipsChange={setShowTooltips}
          />
        </div>

        {/* Right Panel - 3/4 width */}
        <div className="lg:col-span-3 space-y-6">
          {/* Chart Container */}
          <ChartContainer
            title={config.title}
            subtitle={config.subtitle}
            responsive={true}
            aspectRatio={16 / 9}
          >
            {({ width, height }) => (
              <EnhancedComboChart
                data={currentData}
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
                animate={animate}
                interactive={interactive}
              />
            )}
          </ChartContainer>

          {/* Data Table */}
          <DataTable
            title="數據一覽表"
            data={currentData.slice(0, 8)}
            columns={[
              {
                key: 'month',
                label: activeScenario === 'energy' ? '季度' : '月份',
                render: (value: any) => <span className="font-medium text-gray-900">{value}</span>
              },
              ...currentSeries.slice(0, 6).map(series => ({
                key: series.dataKey,
                label: series.name,
                render: (value: any) => (
                  <span className="text-gray-600">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                    {series.name.includes('率') || series.name.includes('比例') ? '%' : ''}
                  </span>
                )
              }))
            ]}
          />
        </div>
      </div>

      {/* Technical Features Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 mt-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-6">技術特色</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Code Example */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8"
      >
        <CodeExample
          title="堆疊區域 + 線條組合圖表使用範例"
          description="展示如何使用 stackedArea 系列創建堆疊區域圖表並結合線條趨勢分析"
          code={`import { EnhancedComboChart, type ComboChartSeries } from '../../../registry/components/composite'

const data = [
  { 
    month: 'Jan', 
    organic: 12000, 
    social: 8000, 
    paid: 5000, 
    direct: 15000, 
    conversionRate: 2.3, 
    avgSessionTime: 3.2 
  },
  { 
    month: 'Feb', 
    organic: 15000, 
    social: 9200, 
    paid: 5800, 
    direct: 16200, 
    conversionRate: 2.6, 
    avgSessionTime: 3.4 
  },
  // ...更多數據
]

const series: ComboChartSeries[] = [
  // 堆疊區域系列
  {
    type: 'stackedArea',
    dataKey: 'organic',
    name: '自然流量',
    yAxis: 'left',
    color: '#10b981',
    stackGroupKey: 'traffic',
    areaOpacity: 0.8,
    curve: 'monotone'
  },
  {
    type: 'stackedArea',
    dataKey: 'social',
    name: '社交媒體',
    yAxis: 'left',
    color: '#3b82f6',
    stackGroupKey: 'traffic',
    areaOpacity: 0.8,
    curve: 'monotone'
  },
  // 線條系列
  {
    type: 'line',
    dataKey: 'conversionRate',
    name: '轉換率',
    yAxis: 'right',
    color: '#ef4444',
    strokeWidth: 3,
    curve: 'monotone'
  }
]

<EnhancedComboChart
  data={data}
  series={series}
  xKey="month"
  width={800}
  height={500}
  leftAxis={{
    label: '流量數 (人次)',
    gridlines: true
  }}
  rightAxis={{
    label: '轉換率 (%) / 停留時間 (分)',
    gridlines: false
  }}
  xAxis={{
    label: '月份'
  }}
  animate={true}
  margin={{ top: 20, right: 100, bottom: 60, left: 80 }}
/>`}
          language="typescript"
        />
      </motion.div>
    </DemoPageTemplate>
  )
}

export default StackedAreaLineComboDemo