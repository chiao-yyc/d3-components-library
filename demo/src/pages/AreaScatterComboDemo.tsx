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
  ChartContainer,
  StatusDisplay,
  DataTable,
  CodeExample,
  type DataTableColumn
} from '../components/ui'
import { CogIcon, ChartBarSquareIcon, MapIcon, FunnelIcon, ChartBarIcon, PaintBrushIcon } from '@heroicons/react/24/outline'

const AreaScatterComboDemo: React.FC = () => {
  // 場景 1: 氣溫預測與實際觀測 - 預測區間 + 實際測量點
  const temperatureData = [
    { month: '1月', forecast: 15, confidence_low: 12, confidence_high: 18, actual: 14.2, humidity: 65, rainfall: 45 },
    { month: '2月', forecast: 18, confidence_low: 15, confidence_high: 21, actual: 17.8, humidity: 62, rainfall: 38 },
    { month: '3月', forecast: 22, confidence_low: 19, confidence_high: 25, actual: 21.5, humidity: 58, rainfall: 42 },
    { month: '4月', forecast: 26, confidence_low: 23, confidence_high: 29, actual: 25.8, humidity: 55, rainfall: 35 },
    { month: '5月', forecast: 30, confidence_low: 27, confidence_high: 33, actual: 29.2, humidity: 60, rainfall: 28 },
    { month: '6月', forecast: 34, confidence_low: 31, confidence_high: 37, actual: 33.5, humidity: 68, rainfall: 15 },
    { month: '7月', forecast: 36, confidence_low: 33, confidence_high: 39, actual: 35.8, humidity: 72, rainfall: 8 },
    { month: '8月', forecast: 35, confidence_low: 32, confidence_high: 38, actual: 34.9, humidity: 70, rainfall: 12 },
    { month: '9月', forecast: 31, confidence_low: 28, confidence_high: 34, actual: 30.7, humidity: 64, rainfall: 25 },
    { month: '10月', forecast: 26, confidence_low: 23, confidence_high: 29, actual: 26.3, humidity: 59, rainfall: 32 },
    { month: '11月', forecast: 21, confidence_low: 18, confidence_high: 24, actual: 20.5, humidity: 63, rainfall: 40 },
    { month: '12月', forecast: 17, confidence_low: 14, confidence_high: 20, actual: 16.8, humidity: 67, rainfall: 48 },
  ]

  // 場景 2: 股票價格走勢 - 價格區間 + 成交量熱點
  const stockData = [
    { date: 'W1', price_area: 100, support: 95, resistance: 105, volume_points: 98, transaction_size: 1200, volatility: 5.2 },
    { date: 'W2', price_area: 103, support: 98, resistance: 108, volume_points: 105, transaction_size: 1800, volatility: 6.1 },
    { date: 'W3', price_area: 108, support: 103, resistance: 113, volume_points: 110, transaction_size: 2100, volatility: 7.3 },
    { date: 'W4', price_area: 112, support: 107, resistance: 117, volume_points: 114, transaction_size: 1950, volatility: 4.8 },
    { date: 'W5', price_area: 115, support: 110, resistance: 120, volume_points: 118, transaction_size: 2300, volatility: 5.9 },
    { date: 'W6', price_area: 118, support: 113, resistance: 123, volume_points: 121, transaction_size: 2650, volatility: 6.7 },
    { date: 'W7', price_area: 122, support: 117, resistance: 127, volume_points: 125, transaction_size: 2150, volatility: 5.4 },
    { date: 'W8', price_area: 119, support: 114, resistance: 124, volume_points: 122, transaction_size: 1890, volatility: 4.9 },
    { date: 'W9', price_area: 125, support: 120, resistance: 130, volume_points: 128, transaction_size: 2800, volatility: 7.1 },
    { date: 'W10', price_area: 130, support: 125, resistance: 135, volume_points: 132, transaction_size: 3200, volatility: 8.2 },
    { date: 'W11', price_area: 128, support: 123, resistance: 133, volume_points: 130, transaction_size: 2900, volatility: 6.8 },
    { date: 'W12', price_area: 135, support: 130, resistance: 140, volume_points: 137, transaction_size: 3500, volatility: 9.1 },
  ]

  // 場景 3: 人口密度分析 - 密度分佈區域 + 城市中心點
  const populationData = [
    { region: '北區', density_area: 8500, min_density: 7200, max_density: 9800, city_centers: 8200, urban_score: 85, growth_rate: 2.3 },
    { region: '東區', density_area: 6200, min_density: 5100, max_density: 7300, city_centers: 6800, urban_score: 72, growth_rate: 1.8 },
    { region: '南區', density_area: 7800, min_density: 6900, max_density: 8700, city_centers: 7500, urban_score: 78, growth_rate: 2.1 },
    { region: '西區', density_area: 5900, min_density: 4800, max_density: 7000, city_centers: 6200, urban_score: 68, growth_rate: 1.5 },
    { region: '中區', density_area: 12000, min_density: 11200, max_density: 12800, city_centers: 11800, urban_score: 95, growth_rate: 3.2 },
    { region: '新區', density_area: 3200, min_density: 2500, max_density: 3900, city_centers: 3500, urban_score: 45, growth_rate: 4.1 },
    { region: '老區', density_area: 9200, min_density: 8500, max_density: 9900, city_centers: 9000, urban_score: 82, growth_rate: 0.8 },
    { region: '港區', density_area: 4800, min_density: 4100, max_density: 5500, city_centers: 4900, urban_score: 58, growth_rate: 1.9 },
  ]

  const [activeScenario, setActiveScenario] = useState<'temperature' | 'stock' | 'population'>('temperature')
  const [activeSeriesIds, setActiveSeriesIds] = useState<Set<string>>(new Set())
  const [showConfidenceArea, setShowConfidenceArea] = useState(true)
  const [scatterSizeMode, setScatterSizeMode] = useState<'fixed' | 'dynamic'>('dynamic')
  const [areaMode, setAreaMode] = useState<'interval' | 'traditional'>('interval')

  // 氣溫場景配置
  const temperatureSeries: ComboChartSeries[] = [
    ...(showConfidenceArea ? [{
      type: 'area' as const,
      dataKey: areaMode === 'interval' ? 'confidence_high' : 'forecast',
      name: areaMode === 'interval' ? '預測信心區間' : '預測溫度區域',
      yAxis: 'left' as const,
      color: '#3b82f6',
      areaOpacity: areaMode === 'interval' ? 0.2 : 0.3,
      baseline: areaMode === 'interval' ? (d: any) => d.confidence_low : 0, // 區間模式用動態基線，傳統模式從0開始
      gradient: {
        id: 'temperatureGradient',
        stops: [
          { offset: '0%', color: '#3b82f6', opacity: 0.4 },
          { offset: '100%', color: '#1e40af', opacity: 0.1 }
        ]
      }
    }] : []),
    {
      type: 'scatter',
      dataKey: 'actual',
      name: '實際溫度',
      yAxis: 'left',
      color: '#ef4444',
      scatterRadius: scatterSizeMode === 'fixed' ? 6 : undefined,
      sizeKey: scatterSizeMode === 'dynamic' ? 'humidity' : undefined,
      sizeRange: [4, 12],
      scatterOpacity: 0.8,
      strokeColor: '#dc2626',
      scatterStrokeWidth: 2
    },
    {
      type: 'scatter',
      dataKey: 'forecast',
      name: '預測溫度',
      yAxis: 'left',
      color: '#10b981',
      scatterRadius: 5,
      scatterOpacity: 0.7,
      strokeColor: '#059669',
      scatterStrokeWidth: 1
    }
  ]

  // 股票場景配置  
  const stockSeries: ComboChartSeries[] = [
    ...(showConfidenceArea ? [{
      type: 'area' as const,
      dataKey: areaMode === 'interval' ? 'resistance' : 'price_area',
      name: areaMode === 'interval' ? '價格區間' : '價格趨勢區域',
      yAxis: 'left' as const,
      color: '#8b5cf6',
      areaOpacity: areaMode === 'interval' ? 0.25 : 0.3,
      baseline: areaMode === 'interval' ? (d: any) => d.support : 0, // 區間模式用動態基線，傳統模式從0開始
      gradient: {
        id: 'stockGradient',
        stops: [
          { offset: '0%', color: '#8b5cf6', opacity: 0.4 },
          { offset: '100%', color: '#7c3aed', opacity: 0.1 }
        ]
      }
    }] : []),
    {
      type: 'scatter',
      dataKey: 'volume_points',
      name: '成交量熱點',
      yAxis: 'left',
      color: '#f59e0b',
      sizeKey: scatterSizeMode === 'dynamic' ? 'transaction_size' : undefined,
      sizeRange: [6, 18],
      scatterRadius: scatterSizeMode === 'fixed' ? 8 : undefined,
      scatterOpacity: 0.8,
      strokeColor: '#d97706',
      scatterStrokeWidth: 2
    }
  ]

  // 人口場景配置
  const populationSeries: ComboChartSeries[] = [
    ...(showConfidenceArea ? [{
      type: 'area' as const,
      dataKey: areaMode === 'interval' ? 'max_density' : 'density_area',
      name: areaMode === 'interval' ? '密度分佈區間' : '人口密度區域',
      yAxis: 'left' as const,
      color: '#06b6d4',
      areaOpacity: areaMode === 'interval' ? 0.3 : 0.4,
      baseline: areaMode === 'interval' ? (d: any) => d.min_density : 0, // 區間模式用動態基線，傳統模式從0開始
      gradient: {
        id: 'populationGradient',
        stops: [
          { offset: '0%', color: '#06b6d4', opacity: 0.5 },
          { offset: '100%', color: '#0891b2', opacity: 0.1 }
        ]
      }
    }] : []),
    {
      type: 'scatter',
      dataKey: 'city_centers',
      name: '城市中心',
      yAxis: 'left',
      color: '#ec4899',
      sizeKey: scatterSizeMode === 'dynamic' ? 'urban_score' : undefined,
      sizeRange: [8, 20],
      scatterRadius: scatterSizeMode === 'fixed' ? 10 : undefined,
      scatterOpacity: 0.7,
      strokeColor: '#db2777',
      scatterStrokeWidth: 2
    }
  ]

  const getCurrentData = () => {
    switch (activeScenario) {
      case 'temperature': return temperatureData
      case 'stock': return stockData
      case 'population': return populationData
      default: return temperatureData
    }
  }

  const getCurrentSeries = () => {
    const baseSeries = (() => {
      switch (activeScenario) {
        case 'temperature': return temperatureSeries
        case 'stock': return stockSeries
        case 'population': return populationSeries
        default: return temperatureSeries
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
      case 'temperature': return 'month'
      case 'stock': return 'date'
      case 'population': return 'region'
      default: return 'month'
    }
  }

  const getCurrentConfig = () => {
    switch (activeScenario) {
      case 'temperature':
        return {
          title: '氣溫預測與實際觀測 - Area + Scatter',
          leftAxis: { label: '溫度 (°C)' },
          rightAxis: { label: '濕度(%) / 降雨量(mm)' },
          xAxis: { label: '月份' }
        }
      case 'stock':
        return {
          title: '股票價格走勢分析 - Area + Scatter',
          leftAxis: { label: '股價 ($)' },
          rightAxis: { label: '波動率(%) / 成交量倍數' },
          xAxis: { label: '週期' }
        }
      case 'population':
        return {
          title: '人口密度分析 - Area + Scatter',
          leftAxis: { label: '人口密度 (人/km²)' },
          rightAxis: { label: '城市化分數 / 成長率(%)' },
          xAxis: { label: '區域' }
        }
      default:
        return {
          title: '氣溫預測與實際觀測',
          leftAxis: { label: '溫度 (°C)' },
          rightAxis: { label: '濕度(%)' },
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

  const scenarioOptions = [
    { value: 'temperature', label: '🌡️ 氣溫預測', desc: '預測區間與實際觀測' },
    { value: 'stock', label: '📈 股票分析', desc: '價格區間與成交熱點' },
    { value: 'population', label: '🏙️ 人口密度', desc: '密度分佈與城市中心' },
  ]

  const areaModeOptions = [
    { value: 'interval', label: '區間帶狀' },
    { value: 'traditional', label: '傳統區域' }
  ]

  const sizeOptions = [
    { value: 'fixed', label: '固定大小' },
    { value: 'dynamic', label: '動態大小' }
  ]

  // 狀態顯示數據
  const statusItems = [
    { label: '當前場景', value: scenarioOptions.find(s => s.value === activeScenario)?.label || '' },
    { label: '資料點數', value: getCurrentData().length },
    { label: '區域系列', value: currentSeries.filter(s => s.type === 'area').length },
    { label: '散點系列', value: currentSeries.filter(s => s.type === 'scatter').length },
    { label: '區域模式', value: areaModeOptions.find(a => a.value === areaMode)?.label || '' }
  ]

  // 數據表格列定義
  const tableColumns: DataTableColumn[] = [
    { key: getCurrentXKey(), title: '主鍵', sortable: true },
    { 
      key: activeScenario === 'temperature' ? 'forecast' : activeScenario === 'stock' ? 'price_area' : 'density_area', 
      title: '區域值', 
      sortable: true,
      formatter: (value) => typeof value === 'number' ? value.toLocaleString() : value,
      align: 'right'
    },
    { 
      key: activeScenario === 'temperature' ? 'actual' : activeScenario === 'stock' ? 'volume_points' : 'city_centers', 
      title: '散點值', 
      sortable: true,
      formatter: (value) => typeof value === 'number' ? value.toLocaleString() : value,
      align: 'right'
    }
  ]

  return (
    <DemoPageTemplate
      title="Area + Scatter 組合圖表"
      description="展示區域圖與散點圖的組合，適用於趨勢區間分析、信心區間顯示和關鍵數據點標記"
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
            <ControlGroup title="場景選擇" icon={<FunnelIcon className="w-4 h-4" />} cols={1}>
              <SelectControl
                label="數據場景"
                value={activeScenario}
                onChange={(value) => {
                  setActiveScenario(value as any)
                  setActiveSeriesIds(new Set())
                }}
                options={scenarioOptions.map(s => ({ value: s.value, label: s.label }))}
                description={scenarioOptions.find(s => s.value === activeScenario)?.desc}
              />
            </ControlGroup>

            {/* 圖表配置 */}
            <ControlGroup title="圖表配置" icon={<ChartBarIcon className="w-4 h-4" />} cols={2}>
              <ToggleControl
                label="顯示區域圖"
                checked={showConfidenceArea}
                onChange={setShowConfidenceArea}
                description="顯示背景區域圖層"
              />
              
              <SelectControl
                label="區域模式"
                value={areaMode}
                onChange={(value) => setAreaMode(value as 'interval' | 'traditional')}
                options={areaModeOptions}
                disabled={!showConfidenceArea}
              />
              
              <SelectControl
                label="散點大小"
                value={scatterSizeMode}
                onChange={(value) => setScatterSizeMode(value as 'fixed' | 'dynamic')}
                options={sizeOptions}
              />
            </ControlGroup>

            {/* 系列控制 */}
            <ControlGroup title="系列控制" icon={<PaintBrushIcon className="w-4 h-4" />} cols={1}>
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
                  {(activeScenario === 'temperature' ? temperatureSeries : 
                    activeScenario === 'stock' ? stockSeries : populationSeries).map((series) => (
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
                        ({series.type === 'area' ? '區域' : '散點'})
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
          subtitle={`${currentSeries.filter(s => s.type === 'area').length} 個區域系列 + ${currentSeries.filter(s => s.type === 'scatter').length} 個散點系列`}
          responsive={true}
          aspectRatio={16 / 9}
          actions={
            <div className="flex items-center gap-2">
              <MapIcon className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">區域散點組合</span>
            </div>
          }
        >
          {({ width, height }) => (
            <motion.div
              key={`${activeScenario}-${areaMode}-${scatterSizeMode}`}
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
                className="area-scatter-combo"
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
    time: '00:00', 
    cpuMin: 20, 
    cpuMax: 45, 
    memoryUsage: 60, 
    alerts: 2, 
    performance: 85 
  },
  // ...更多數據
]

const series: ComboChartSeries[] = [
  // 背景區域系列
  {
    type: 'area',
    dataKey: 'cpuMax',
    name: 'CPU使用率範圍',
    yAxis: 'left',
    color: '#3b82f6',
    areaOpacity: 0.3,
    baseline: (d: any) => d.cpuMin,
    curve: 'monotone'
  },
  // 散點系列
  {
    type: 'scatter',
    dataKey: 'performance',
    name: '效能指標',
    yAxis: 'right',
    color: '#ef4444',
    scatterRadius: 6,
    sizeKey: 'alerts',
    sizeRange: [4, 12]
  }
]

<EnhancedComboChart
  data={data}
  series={series}
  xKey="time"
  width={${getCurrentData().length * 50}}
  height={400}
  leftAxis={{ label: "使用率 (%)", gridlines: true }}
  rightAxis={{ label: "效能指標 (%)", gridlines: false }}
  animate={true}
  interactive={true}
/>`}
          />

          {/* 功能說明 */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full" />
            <h3 className="text-xl font-semibold text-gray-800">Area + Scatter 組合圖表功能特點</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">區域圖功能</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  區間帶狀模式
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  傳統區域模式
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  動態基線計算
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  漸層填充效果
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">散點圖功能</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  多維度數據映射
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  動態尺寸調整
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  邊框樣式控制
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  交互式數據探索
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">應用場景</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  氣象預測分析
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full" />
                  金融價格區間
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-lime-500 rounded-full" />
                  人口密度分佈
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  系統監控分析
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

export default AreaScatterComboDemo