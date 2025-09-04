import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaLineComboChartV2 } from '../../../registry/components/composite'
import type { MultiSeriesComboChartV2Props, ComboSeriesV2 } from '../../../registry/components/composite'
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
  SignalIcon
} from '@heroicons/react/24/outline'

// 生成資源使用數據
const generateResourceData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  return hours.map(hour => ({
    hour: `${hour.toString().padStart(2, '0')}:00`,
    cpuUsage: Math.random() * 80 + 10, // 10-90%
    memoryUsage: Math.random() * 70 + 20, // 20-90%
    networkIn: Math.random() * 100 + 10, // 10-110 Mbps
    networkOut: Math.random() * 50 + 5, // 5-55 Mbps
    activeConnections: Math.floor(Math.random() * 200) + 50, // 50-250 connections
    responseTime: Math.random() * 500 + 100 // 100-600ms
  }))
}

// 生成銷售漏斗數據
const generateSalesFunnelData = () => {
  const stages = ['展示', '點擊', '訪問', '興趣', '考慮', '購買', '復購']
  const baseValue = 10000
  return stages.map((stage, index) => ({
    stage,
    count: Math.floor(baseValue * Math.pow(0.7, index)), // 遞減漏斗
    conversionRate: index === 0 ? 100 : Math.random() * 20 + 10, // 10-30%
    revenue: Math.floor(Math.random() * 50000) + 10000, // 1-6萬
    cost: Math.floor(Math.random() * 5000) + 1000 // 1000-6000
  }))
}

// 生成股票數據
const generateStockData = () => {
  const days = ['週一', '週二', '週三', '週四', '週五', '週六', '週日']
  let price = 100
  return days.map(day => {
    const change = (Math.random() - 0.5) * 10
    price += change
    const volume = Math.floor(Math.random() * 1000000) + 500000
    return {
      day,
      price: Math.round(price * 100) / 100,
      volume,
      movingAverage: price + (Math.random() - 0.5) * 5,
      bollinger: price + Math.random() * 3
    }
  })
}

const AreaLineComboDemo: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<'resources' | 'sales' | 'stock'>('resources')
  const [activeSeriesIds, setActiveSeriesIds] = useState<Set<string>>(new Set())
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)
  const [showTooltips, setShowTooltips] = useState(true)
  const [selectedSeries, setSelectedSeries] = useState<string[]>([])

  // 系統資源監控數據和配置
  const resourceData = useMemo(() => generateResourceData(), [])
  const resourceSeries: ComboSeries[] = [
    {
      type: 'area',
      yKey: 'cpuUsage',
      name: 'CPU 使用率',
      yAxis: 'left',
      color: '#3b82f6',
      areaOpacity: 0.4,
      curve: 'monotone'
    },
    {
      type: 'area',
      yKey: 'memoryUsage', 
      name: '記憶體使用率',
      yAxis: 'left',
      color: '#10b981',
      areaOpacity: 0.3,
      curve: 'monotone'
    },
    {
      type: 'line',
      yKey: 'activeConnections',
      name: '活躍連接數',
      yAxis: 'right',
      color: '#ef4444',
      strokeWidth: 3,
      showPoints: true,
      pointRadius: 4,
      curve: 'cardinal'
    }
  ]

  // 銷售漏斗數據和配置
  const salesData = useMemo(() => generateSalesFunnelData(), [])
  const salesSeries: ComboSeries[] = [
    {
      type: 'area',
      yKey: 'count',
      name: '用戶數量',
      yAxis: 'left',
      color: '#6366f1',
      areaOpacity: 0.5,
      baseline: 0,
      gradient: {
        id: 'salesGradient',
        stops: [
          { offset: '0%', color: '#6366f1', opacity: 0.8 },
          { offset: '100%', color: '#6366f1', opacity: 0.1 }
        ]
      }
    },
    {
      type: 'line',
      yKey: 'conversionRate',
      name: '轉換率',
      yAxis: 'right',
      color: '#f59e0b',
      strokeWidth: 2,
      showPoints: true,
      pointRadius: 3,
      curve: 'linear'
    },
    {
      type: 'line',
      yKey: 'revenue',
      name: '收入',
      yAxis: 'right',
      color: '#ef4444',
      strokeWidth: 2,
      showPoints: false,
      curve: 'monotone'
    }
  ]

  // 股票數據和配置
  const stockData = useMemo(() => generateStockData(), [])
  const stockSeries: ComboSeries[] = [
    {
      type: 'area',
      yKey: 'volume',
      name: '成交量',
      yAxis: 'right',
      color: '#94a3b8',
      areaOpacity: 0.3,
      curve: 'step'
    },
    {
      type: 'line',
      yKey: 'price',
      name: '股價',
      yAxis: 'left',
      color: '#059669',
      strokeWidth: 3,
      showPoints: true,
      pointRadius: 3,
      curve: 'monotone'
    },
    {
      type: 'line',
      yKey: 'movingAverage',
      name: '移動平均',
      yAxis: 'left',
      color: '#dc2626',
      strokeWidth: 2,
      showPoints: false,
      curve: 'monotone'
    }
  ]

  const currentData = activeScenario === 'resources' 
    ? resourceData 
    : activeScenario === 'sales' 
    ? salesData 
    : stockData
  
  const currentSeries = activeScenario === 'resources' 
    ? resourceSeries 
    : activeScenario === 'sales' 
    ? salesSeries 
    : stockSeries

  const currentXKey = activeScenario === 'resources' 
    ? 'hour' 
    : activeScenario === 'sales' 
    ? 'stage' 
    : 'day'

  const handleSeriesClick = (series: ComboSeries, dataPoint: any, event: React.MouseEvent) => {
    console.log('Series clicked:', series.name, dataPoint)
    alert(`點擊了 ${series.name} 系列`)
  }

  const handleSeriesHover = (series: ComboSeries, dataPoint: any, event: React.MouseEvent) => {
    console.log('Series hovered:', series.name, dataPoint)
  }

  const toggleSeries = (seriesName: string) => {
    setSelectedSeries(prev => 
      prev.includes(seriesName) 
        ? prev.filter(name => name !== seriesName)
        : [...prev, seriesName]
    )
  }

  const visibleSeries = currentSeries.filter(s => 
    selectedSeries.length === 0 || selectedSeries.includes(s.name)
  )

  const scenarios = [
    {
      id: 'resources' as const,
      title: '系統監控',
      icon: ComputerDesktopIcon,
      description: '系統資源監控與性能分析',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'sales' as const,
      title: '銷售漏斗',
      icon: ChartBarSquareIcon,
      description: '銷售轉換率與收入分析',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'stock' as const,
      title: '股票分析',
      icon: BanknotesIcon,
      description: '股價走勢與成交量關係',
      color: 'from-green-500 to-green-600'
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
      label: '系列總數',
      value: visibleSeries.length,
      icon: ChartBarSquareIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Area 系列',
      value: visibleSeries.filter(s => s.type === 'area').length,
      icon: SparklesIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Line 系列',
      value: visibleSeries.filter(s => s.type === 'line').length,
      icon: EyeIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  const features = [
    {
      title: 'Area 圖層系統',
      description: '多層面積圖展示數據累積效果，支援透明度和漸變控制',
      icon: SparklesIcon
    },
    {
      title: '精準線條追蹤',
      description: '線條圖精確顯示關鍵指標變化，支援點標記和多種曲線',
      icon: EyeIcon
    },
    {
      title: '雙軸系統',
      description: '左右雙軸支援不同數量級數據同時展示和比較分析',
      icon: CogIcon
    },
    {
      title: '智能交互',
      description: '支援系列選擇、懸停提示和點擊事件的完整交互體驗',
      icon: ComputerDesktopIcon
    }
  ]

  const toggleSeriesVisibility = (seriesName: string) => {
    const newActiveIds = new Set(activeSeriesIds)
    if (newActiveIds.has(seriesName)) {
      newActiveIds.delete(seriesName)
    } else {
      newActiveIds.add(seriesName)
    }
    setActiveSeriesIds(newActiveIds)
  }

  return (
    <DemoPageTemplate>
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          Area + Line 組合圖表
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          結合面積圖的整體趨勢展示與線條圖的精確追蹤，打造多維度數據可視化體驗
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
                    onClick={() => setActiveScenario(scenario.id)}
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

          {/* Statistics Cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
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
                    transition={{ delay: 0.1 + index * 0.05 }}
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
            title={activeScenario === 'resources' 
              ? '系統資源使用監控' 
              : activeScenario === 'sales' 
              ? '銷售漏斗分析' 
              : '股票價格與成交量'}
            subtitle={activeScenario === 'resources'
              ? 'CPU、記憶體使用率與活躍連接數的即時監控'
              : activeScenario === 'sales'
              ? '銷售漏斗各階段轉換率與收入追蹤分析'
              : '股價走勢、成交量與技術指標的綜合分析'}
            responsive={true}
            aspectRatio={16 / 9}
          >
            {({ width, height }) => {
              // 分離 area 和 line series
              const areaSeries = visibleSeries.filter(s => s.type === 'area')
              const lineSeries = visibleSeries.filter(s => s.type === 'line')
              
              return (
                <AreaLineComboChartV2
                  data={currentData}
                  areaSeries={areaSeries.map(s => ({
                    name: s.name,
                    yKey: s.yKey,
                    yAxis: s.yAxis,
                    color: s.color,
                    areaOpacity: (s as any).areaOpacity || 0.4,
                    curve: (s as any).curve || 'monotone'
                  }))}
                  lineSeries={lineSeries.map(s => ({
                    name: s.name,
                    yKey: s.yKey,
                    yAxis: s.yAxis,
                    color: s.color,
                    strokeWidth: (s as any).strokeWidth || 2,
                    showPoints: (s as any).showPoints || false,
                    pointRadius: (s as any).pointRadius || 3,
                    curve: (s as any).curve || 'monotone'
                  }))}
                  xAccessor={currentXKey}
                  width={width}
                  height={height}
                  leftAxisConfig={{
                    label: activeScenario === 'resources' 
                      ? '使用率 (%)' 
                      : activeScenario === 'sales' 
                      ? '用戶數量' 
                      : '股價'
                  }}
                  rightAxisConfig={{
                    label: activeScenario === 'resources' 
                      ? '連接數' 
                      : activeScenario === 'sales' 
                      ? '轉換率 (%) / 收入' 
                      : '成交量'
                  }}
                  animate={animate}
                  interactive={interactive}
                  onDataClick={handleSeriesClick as any}
                  onDataHover={handleSeriesHover as any}
                />
              )
            }}
          </ChartContainer>

          {/* Data Table */}
          <DataTable
            title="數據一覽表"
            data={currentData.slice(0, 8)}
            columns={[
              {
                key: currentXKey,
                label: activeScenario === 'resources' ? '時間' : activeScenario === 'sales' ? '階段' : '日期',
                render: (value: any) => <span className="font-medium text-gray-900">{value}</span>
              },
              ...currentSeries.map(series => ({
                key: series.yKey,
                label: series.name,
                render: (value: any) => (
                  <span className="text-gray-600">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                    {(series.name.includes('率') || series.name.includes('使用')) ? '%' : ''}
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
          title="Area + Line 組合圖表使用範例"
          description="展示如何結合 Area 和 Line 系列來創建複合視覺化圖表"
          code={`import { EnhancedComboChart, type ComboChartSeries } from '../../../registry/components/composite'

const data = [
  { time: '00:00', cpu: 45, memory: 60, connections: 120 },
  { time: '01:00', cpu: 52, memory: 58, connections: 145 },
  { time: '02:00', cpu: 48, memory: 62, connections: 138 },
  // ...更多數據
]

const series: ComboChartSeries[] = [
  { 
    type: 'area', 
    dataKey: 'cpu', 
    name: 'CPU使用率', 
    yAxis: 'left', 
    color: '#3b82f6',
    areaOpacity: 0.4,
    curve: 'monotone'
  },
  { 
    type: 'area', 
    dataKey: 'memory', 
    name: '記憶體使用率', 
    yAxis: 'left', 
    color: '#10b981',
    areaOpacity: 0.3,
    curve: 'monotone'
  },
  { 
    type: 'line', 
    dataKey: 'connections', 
    name: '活躍連接數', 
    yAxis: 'right', 
    color: '#ef4444',
    strokeWidth: 3,
    showPoints: true,
    pointRadius: 4,
    curve: 'cardinal'
  }
]

<EnhancedComboChart
  data={data}
  series={series}
  xKey="time"
  width={800}
  height={500}
  leftAxis={{ 
    label: '使用率 (%)', 
    gridlines: true 
  }}
  rightAxis={{ 
    label: '連接數', 
    gridlines: false 
  }}
  xAxis={{ 
    label: '時間' 
  }}
  animate={true}
  interactive={true}
  onSeriesClick={(series, dataPoint) => {
    console.log('Clicked:', series.name, dataPoint)
  }}
/>`}
          language="typescript"
        />
      </motion.div>
    </DemoPageTemplate>
  )
}

export default AreaLineComboDemo