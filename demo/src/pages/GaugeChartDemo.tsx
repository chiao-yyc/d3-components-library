import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { GaugeChart } from '@registry/components/basic/gauge-chart/gauge-chart'
import { 
  DemoPageTemplate,
  ContentSection,
  ModernControlPanel,
  ControlGroup,
  RangeSlider,
  SelectControl,
  ToggleControl,
  ChartContainer,
  StatusDisplay,
  DataTable,
  CodeExample,
  type DataTableColumn
} from '../components/ui'
import { CogIcon, ChartBarSquareIcon } from '@heroicons/react/24/outline'

// KPI 資料
const kpiData = [
  { metric: 'CPU 使用率', value: 78, unit: '%', min: 0, max: 100, status: 'warning' },
  { metric: '記憶體使用率', value: 65, unit: '%', min: 0, max: 100, status: 'normal' },
  { metric: '磁碟使用率', value: 42, unit: '%', min: 0, max: 100, status: 'good' },
  { metric: '網路頻寬', value: 156, unit: 'Mbps', min: 0, max: 200, status: 'warning' }
]

// 業績資料  
const salesData = [
  { quarter: 'Q1', target: 1000000, actual: 850000, unit: '元', achievement: 85 },
  { quarter: 'Q2', target: 1200000, actual: 1180000, unit: '元', achievement: 98.3 },
  { quarter: 'Q3', target: 1100000, actual: 920000, unit: '元', achievement: 83.6 },
  { quarter: 'Q4', target: 1500000, actual: 1320000, unit: '元', achievement: 88 }
]

// 溫度資料
const temperatureData = [
  { sensor: '室內溫度', value: 23.5, unit: '°C', min: -10, max: 50, level: 'optimal' },
  { sensor: '室外溫度', value: 28.2, unit: '°C', min: -10, max: 50, level: 'normal' },
  { sensor: 'CPU 溫度', value: 65.8, unit: '°C', min: 0, max: 100, level: 'warm' },
  { sensor: '硬碟溫度', value: 42.1, unit: '°C', min: 0, max: 100, level: 'normal' }
]

// 資料集選項
const datasetOptions = [
  { value: 'kpi', label: '系統監控 KPI', description: 'CPU、記憶體、磁碟等系統指標' },
  { value: 'sales', label: '業績達成率', description: '季度目標達成情況' },
  { value: 'temperature', label: '溫度監控', description: '各種感測器溫度數據' }
]

export default function GaugeChartDemo() {
  // 基本設定
  const [selectedDataset, setSelectedDataset] = useState('kpi')
  const [selectedIndex, setSelectedIndex] = useState(0)
  
  // 儀表盤設定
  const [startAngle, setStartAngle] = useState(-90)
  const [endAngle, setEndAngle] = useState(90)
  const [tickCount, setTickCount] = useState(5)
  const [cornerRadius, setCornerRadius] = useState(0)
  
  // 顏色設定
  const [needleColor, setNeedleColor] = useState('#374151')
  const [backgroundColor, setBackgroundColor] = useState('#e5e7eb')
  const [foregroundColor, setForegroundColor] = useState('#3b82f6')
  const [useZones, setUseZones] = useState(false)
  
  // 顯示選項
  const [showValue, setShowValue] = useState(true)
  const [showLabel, setShowLabel] = useState(true)
  const [showTicks, setShowTicks] = useState(true)
  const [showMinMax, setShowMinMax] = useState(true)
  
  // 交互功能
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)

  // 當前資料和配置
  const { currentData, config, analysis } = useMemo(() => {
    let data, configData, title, description
    
    switch (selectedDataset) {
      case 'kpi':
        const kpi = kpiData[selectedIndex]
        data = [kpi]
        title = kpi.metric
        description = `目前 ${kpi.metric} 為 ${kpi.value}${kpi.unit}`
        configData = {
          mapping: { value: 'value', label: 'metric' },
          min: kpi.min,
          max: kpi.max,
          valueFormat: (value: number) => `${value.toFixed(1)}${kpi.unit}`,
          zones: useZones ? [
            { min: kpi.min, max: kpi.max * 0.6, color: '#22c55e', label: '良好' },
            { min: kpi.max * 0.6, max: kpi.max * 0.8, color: '#f59e0b', label: '警告' },
            { min: kpi.max * 0.8, max: kpi.max, color: '#ef4444', label: '危險' }
          ] : undefined
        }
        break
      
      case 'sales':
        const sales = salesData[selectedIndex]
        const percentage = (sales.actual / sales.target) * 100
        data = [{ ...sales, percentage }]
        title = `${sales.quarter} 業績達成`
        description = `目標 ${(sales.target / 10000).toFixed(0)}萬，實際 ${(sales.actual / 10000).toFixed(0)}萬`
        configData = {
          mapping: { value: 'percentage', label: 'quarter' },
          min: 0,
          max: 120,
          valueFormat: (value: number) => `${value.toFixed(1)}%`,
          zones: useZones ? [
            { min: 0, max: 80, color: '#ef4444', label: '未達標' },
            { min: 80, max: 100, color: '#f59e0b', label: '接近目標' },
            { min: 100, max: 120, color: '#22c55e', label: '超標' }
          ] : undefined
        }
        break
      
      case 'temperature':
        const temp = temperatureData[selectedIndex]
        data = [temp]
        title = temp.sensor
        description = `目前溫度 ${temp.value}${temp.unit}`
        configData = {
          mapping: { value: 'value', label: 'sensor' },
          min: temp.min,
          max: temp.max,
          valueFormat: (value: number) => `${value.toFixed(1)}${temp.unit}`,
          zones: useZones ? [
            { min: temp.min, max: temp.min + (temp.max - temp.min) * 0.6, color: '#3b82f6', label: '正常' },
            { min: temp.min + (temp.max - temp.min) * 0.6, max: temp.min + (temp.max - temp.min) * 0.8, color: '#f59e0b', label: '偏高' },
            { min: temp.min + (temp.max - temp.min) * 0.8, max: temp.max, color: '#ef4444', label: '過熱' }
          ] : undefined
        }
        break
      
      default:
        return { currentData: [], config: {}, analysis: null }
    }
    
    return {
      currentData: data,
      config: { ...configData, title, description },
      analysis: {
        dataset: datasetOptions.find(d => d.value === selectedDataset)!,
        totalItems: selectedDataset === 'kpi' ? kpiData.length : 
                   selectedDataset === 'sales' ? salesData.length : temperatureData.length,
        currentIndex: selectedIndex + 1
      }
    }
  }, [selectedDataset, selectedIndex, useZones])

  // 狀態顯示數據
  const statusItems = [
    { label: '數據集', value: analysis?.dataset.label || '' },
    { label: '當前項目', value: `${analysis?.currentIndex}/${analysis?.totalItems}` },
    { label: '角度範圍', value: `${startAngle}° ~ ${endAngle}°` },
    { label: '區間顏色', value: useZones ? '開啟' : '關閉', color: useZones ? '#10b981' : '#6b7280' },
    { label: '動畫', value: animate ? '開啟' : '關閉', color: animate ? '#10b981' : '#6b7280' }
  ]

  // 數據表格列定義
  const tableColumns: DataTableColumn[] = [
    { 
      key: selectedDataset === 'kpi' ? 'metric' : 
           selectedDataset === 'sales' ? 'quarter' : 'sensor', 
      title: '項目', 
      sortable: true 
    },
    { 
      key: selectedDataset === 'kpi' ? 'value' :
           selectedDataset === 'sales' ? 'achievement' : 'value',
      title: selectedDataset === 'sales' ? '達成率 (%)' : '數值', 
      sortable: true,
      formatter: (value, row) => {
        if (selectedDataset === 'kpi') {
          return `${value}${row?.unit || ''}`
        } else if (selectedDataset === 'sales') {
          return `${value}%`
        } else {
          return `${value}${row?.unit || ''}`
        }
      },
      align: 'right'
    }
  ]

  const tableData = selectedDataset === 'kpi' ? kpiData :
                   selectedDataset === 'sales' ? salesData :
                   temperatureData

  return (
    <DemoPageTemplate
      title="GaugeChart Demo"
      description="儀表盤組件展示 - 支援多區間、動畫效果和自訂樣式"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 控制面板 - 左側 1/4 */}
        <div className="lg:col-span-1">
          <ModernControlPanel 
          title="控制面板" 
          icon={<CogIcon className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* 基本設定 */}
            <ControlGroup title="基本設定" icon="⚙️" cols={1}>
              <SelectControl
                label="資料集"
                value={selectedDataset}
                onChange={(value) => {
                  setSelectedDataset(value)
                  setSelectedIndex(0)
                }}
                options={datasetOptions.map(opt => ({ value: opt.value, label: opt.label }))}
                description={datasetOptions.find(d => d.value === selectedDataset)?.description}
              />
              
              <SelectControl
                label="項目選擇"
                value={selectedIndex.toString()}
                onChange={(value) => setSelectedIndex(parseInt(value))}
                options={
                  selectedDataset === 'kpi' ? kpiData.map((item, index) => ({ 
                    value: index.toString(), 
                    label: item.metric 
                  })) :
                  selectedDataset === 'sales' ? salesData.map((item, index) => ({ 
                    value: index.toString(), 
                    label: `${item.quarter} (${item.achievement}%)` 
                  })) :
                  temperatureData.map((item, index) => ({ 
                    value: index.toString(), 
                    label: `${item.sensor} (${item.value}${item.unit})` 
                  }))
                }
              />
              
              <ToggleControl
                label="使用區間顏色"
                checked={useZones}
                onChange={setUseZones}
                description="依據數值範圍顯示不同顏色"
              />
            </ControlGroup>

            {/* 儀表盤配置 */}
            <ControlGroup title="儀表盤配置" icon="📊" cols={1}>
              <RangeSlider
                label="起始角度"
                value={startAngle}
                min={-180}
                max={0}
                step={15}
                onChange={setStartAngle}
                suffix="°"
              />
              
              <RangeSlider
                label="結束角度"
                value={endAngle}
                min={0}
                max={180}
                step={15}
                onChange={setEndAngle}
                suffix="°"
              />
              
              <RangeSlider
                label="刻度數量"
                value={tickCount}
                min={3}
                max={10}
                step={1}
                onChange={setTickCount}
              />
            </ControlGroup>

            {/* 樣式設定 */}
            <ControlGroup title="樣式配置" icon="🎨" cols={1}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  指針顏色
                </label>
                <input
                  type="color"
                  value={needleColor}
                  onChange={(e) => setNeedleColor(e.target.value)}
                  className="w-full h-10 rounded border border-gray-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  背景顏色
                </label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full h-10 rounded border border-gray-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  前景顏色
                </label>
                <input
                  type="color"
                  value={foregroundColor}
                  onChange={(e) => setForegroundColor(e.target.value)}
                  className="w-full h-10 rounded border border-gray-300"
                />
              </div>
            </ControlGroup>

            {/* 顯示選項 */}
            <ControlGroup title="顯示選項" icon="👁️" cols={2}>
              <ToggleControl
                label="顯示數值"
                checked={showValue}
                onChange={setShowValue}
                description="在儀表盤中央顯示數值"
              />
              
              <ToggleControl
                label="顯示標籤"
                checked={showLabel}
                onChange={setShowLabel}
                description="顯示指標名稱"
              />
              
              <ToggleControl
                label="顯示刻度"
                checked={showTicks}
                onChange={setShowTicks}
                description="顯示刻度線和數字"
              />
              
              <ToggleControl
                label="顯示最小最大值"
                checked={showMinMax}
                onChange={setShowMinMax}
                description="顯示數值範圍"
              />
            </ControlGroup>

            {/* 交互功能 */}
            <ControlGroup title="交互功能" icon="🎯" cols={2}>
              <ToggleControl
                label="動畫效果"
                checked={animate}
                onChange={setAnimate}
                description="指針移動動畫效果"
              />
              
              <ToggleControl
                label="互動功能"
                checked={interactive}
                onChange={setInteractive}
                description="鼠標懸停效果"
              />
            </ControlGroup>
          </div>
        </ModernControlPanel>
        </div>

        {/* 主要內容區域 - 右側 3/4 */}
        <div className="lg:col-span-3 space-y-8">
          {/* 圖表展示 */}
        <ChartContainer
          title="圖表預覽"
          subtitle={config.description}
          actions={
            <div className="flex items-center gap-2">
              <ChartBarSquareIcon className="w-5 h-5 text-orange-500" />
              <span className="text-sm text-gray-600">儀表盤</span>
            </div>
          }
        >
          <div className="flex justify-center">
            <motion.div
              key={`${selectedDataset}-${selectedIndex}-${startAngle}-${endAngle}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <GaugeChart
                data={currentData}
                mapping={config.mapping}
                min={config.min}
                max={config.max}
                width={400}
                height={300}
                startAngle={startAngle}
                endAngle={endAngle}
                showValue={showValue}
                showLabel={showLabel}
                showTicks={showTicks}
                showMinMax={showMinMax}
                tickCount={tickCount}
                animate={animate}
                interactive={interactive}
                needleColor={needleColor}
                backgroundColor={backgroundColor}
                foregroundColor={foregroundColor}
                zones={config.zones}
                cornerRadius={cornerRadius}
                valueFormat={config.valueFormat}
                onValueChange={(value) => console.log('Value changed:', value)}
              />
            </motion.div>
          </div>
          
          <StatusDisplay items={statusItems} />
        </ChartContainer>

          {/* 數據詳情 */}
        <DataTable
          title="數據詳情"
          data={tableData}
          columns={tableColumns}
          maxRows={8}
          showIndex
        />

          {/* 代碼範例 */}
        <CodeExample
          title="使用範例"
          language="tsx"
          code={`import { GaugeChart } from '@registry/components/basic/gauge-chart/gauge-chart'

const data = [{
  ${config.mapping?.label || 'label'}: '${config.title}',
  ${config.mapping?.value || 'value'}: ${currentData[0]?.[config.mapping?.value || 'value'] || 0}
}]

<GaugeChart
  data={data}
  mapping={{ value: '${config.mapping?.value}', label: '${config.mapping?.label}' }}
  min={${config.min}}
  max={${config.max}}
  width={400}
  height={300}
  startAngle={${startAngle}}
  endAngle={${endAngle}}
  showValue={${showValue}}
  showLabel={${showLabel}}
  showTicks={${showTicks}}
  showMinMax={${showMinMax}}
  tickCount={${tickCount}}
  animate={${animate}}
  interactive={${interactive}}
  needleColor="${needleColor}"
  backgroundColor="${backgroundColor}"
  foregroundColor="${foregroundColor}"
  ${useZones && config.zones ? `zones={${JSON.stringify(config.zones, null, 2)}}` : ''}
  onValueChange={(value) => console.log('Value changed:', value)}
/>`}
        />

          {/* 功能說明 */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 border border-orange-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-orange-500 to-amber-600 rounded-full" />
            <h3 className="text-xl font-semibold text-gray-800">GaugeChart 功能特點</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">核心功能</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  可自訂角度範圍和刻度數量
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  支援多區間顏色配置
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  豐富的顯示選項控制
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  平滑的指針動畫效果
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">應用場景</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  系統監控儀表板
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  KPI 達成率展示
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  設備狀態監控
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  績效評估顯示
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