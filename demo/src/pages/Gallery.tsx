import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BarChart } from '@registry/components/basic/bar-chart'
import { LineChart } from '@registry/components/basic/line-chart'
import { ScatterPlot } from '@registry/components/statistical/scatter-plot'
import { PieChart } from '@registry/components/basic/pie-chart'
import { AreaChart } from '@registry/components/basic/area-chart'
import { Heatmap } from '@registry/components/basic/heatmap'
import { FunnelChart } from '@registry/components/basic/funnel-chart'
import { ExactFunnelChart } from '@registry/components/basic/exact-funnel-chart'
import { basicBarData } from '../data/sample-data'
import { 
  DemoPageTemplate,
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
import { CogIcon, RectangleGroupIcon, ArrowLeftIcon, HomeIcon } from '@heroicons/react/24/outline'

// 生成範例資料
const timeSeriesData = [
  { date: '2024-01-01', value: 120 },
  { date: '2024-01-02', value: 150 },
  { date: '2024-01-03', value: 110 },
  { date: '2024-01-04', value: 180 },
  { date: '2024-01-05', value: 140 },
  { date: '2024-01-06', value: 160 },
  { date: '2024-01-07', value: 170 },
]

const scatterData = [
  { x: 10, y: 20, category: 'A' },
  { x: 15, y: 35, category: 'B' },
  { x: 20, y: 25, category: 'A' },
  { x: 25, y: 45, category: 'C' },
  { x: 30, y: 40, category: 'B' },
  { x: 35, y: 55, category: 'A' },
  { x: 40, y: 50, category: 'C' },
]

const pieData = [
  { category: '產品A', value: 45, region: '北部' },
  { category: '產品B', value: 32, region: '中部' },
  { category: '產品C', value: 28, region: '南部' },
  { category: '產品D', value: 21, region: '東部' },
]

const areaData = [
  { month: '1月', desktop: 45, mobile: 32 },
  { month: '2月', desktop: 48, mobile: 35 },
  { month: '3月', desktop: 52, mobile: 38 },
  { month: '4月', desktop: 49, mobile: 41 },
  { month: '5月', desktop: 55, mobile: 44 },
  { month: '6月', desktop: 58, mobile: 47 },
].flatMap(d => [
  { month: d.month, users: d.desktop, device: 'Desktop' },
  { month: d.month, users: d.mobile, device: 'Mobile' }
])

const heatmapData = [
  { x: 'Mon', y: 'A', value: 1 },
  { x: 'Mon', y: 'B', value: 3 },
  { x: 'Mon', y: 'C', value: 2 },
  { x: 'Tue', y: 'A', value: 4 },
  { x: 'Tue', y: 'B', value: 2 },
  { x: 'Tue', y: 'C', value: 5 },
  { x: 'Wed', y: 'A', value: 3 },
  { x: 'Wed', y: 'B', value: 1 },
  { x: 'Wed', y: 'C', value: 4 },
  { x: 'Thu', y: 'A', value: 5 },
  { x: 'Thu', y: 'B', value: 4 },
  { x: 'Thu', y: 'C', value: 2 },
  { x: 'Fri', y: 'A', value: 2 },
  { x: 'Fri', y: 'B', value: 5 },
  { x: 'Fri', y: 'C', value: 3 },
]

const funnelData = [
  { step: '瀏覽首頁', users: 10000 },
  { step: '查看產品', users: 5500 },
  { step: '加入購物車', users: 2100 },
  { step: '結帳流程', users: 800 },
  { step: '完成購買', users: 350 },
]

// Observable FunnelChart 專用數據格式
const observableFunnelData = [
  { step: 1, value: 10000, label: '瀏覽首頁' },
  { step: 2, value: 5500, label: '查看產品' },
  { step: 3, value: 2100, label: '加入購物車' },
  { step: 4, value: 800, label: '結帳流程' },
  { step: 5, value: 350, label: '完成購買' },
]

function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // 從 URL 參數初始化狀態
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || 'all')
  const [selectedChart, setSelectedChart] = useState<string>(searchParams.get('chart') || 'bar-basic')
  const [animate, setAnimate] = useState(searchParams.get('animate') !== 'false')
  const [interactive, setInteractive] = useState(searchParams.get('interactive') !== 'false')
  const [showGrid, setShowGrid] = useState(searchParams.get('grid') === 'true')
  const [isFromShowcase, setIsFromShowcase] = useState(searchParams.get('from') === 'showcase')

  // 圖表分類定義
  const categories = [
    { value: 'all', label: '全部圖表' },
    { value: 'basic', label: '基礎圖表' },
    { value: 'statistical', label: '統計圖表' },
    { value: 'special', label: '特殊圖表' }
  ]

  // 圖表選項定義
  const chartOptions = [
    { value: 'bar-basic', label: '基本長條圖', category: 'basic' },
    { value: 'bar-colorful', label: '多色長條圖', category: 'basic' },
    { value: 'line-basic', label: '基本折線圖', category: 'basic' },
    { value: 'line-area', label: '區域填充圖', category: 'basic' },
    { value: 'scatter-basic', label: '基本散點圖', category: 'statistical' },
    { value: 'scatter-category', label: '分類散點圖', category: 'statistical' },
    { value: 'pie-basic', label: '基本圓餅圖', category: 'basic' },
    { value: 'pie-donut', label: '甜甜圈圖', category: 'basic' },
    { value: 'area-multi', label: '多系列區域圖', category: 'basic' },
    { value: 'area-stacked', label: '堆疊區域圖', category: 'basic' },
    { value: 'heatmap-basic', label: '基本熱力圖', category: 'special' },
    { value: 'heatmap-rounded', label: '圓角熱力圖', category: 'special' },
    { value: 'funnel-basic', label: '基本漏斗圖', category: 'special' },
    { value: 'funnel-conversion', label: '轉換率漏斗圖', category: 'special' }
  ]

  // URL 參數同步 effect
  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedCategory !== 'all') params.set('category', selectedCategory)
    if (selectedChart !== 'bar-basic') params.set('chart', selectedChart)
    if (!animate) params.set('animate', 'false')
    if (!interactive) params.set('interactive', 'false')
    if (showGrid) params.set('grid', 'true')
    
    setSearchParams(params, { replace: true })
  }, [selectedCategory, selectedChart, animate, interactive, showGrid, setSearchParams])

  // 處理狀態變更的包裝函數
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
    // 如果新類別不包含當前選中的圖表，自動選擇該類別的第一個圖表
    const newFilteredOptions = value === 'all' ? chartOptions : chartOptions.filter(chart => chart.category === value)
    if (!newFilteredOptions.find(chart => chart.value === selectedChart)) {
      setSelectedChart(newFilteredOptions[0]?.value || 'bar-basic')
    }
  }

  // 過濾圖表選項
  const filteredChartOptions = selectedCategory === 'all' 
    ? chartOptions 
    : chartOptions.filter(chart => chart.category === selectedCategory)

  // 當前選中的圖表信息
  const currentChart = chartOptions.find(chart => chart.value === selectedChart)

  // 狀態顯示數據
  // 快捷鍵支援
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFromShowcase) {
        navigate('/charts-showcase')
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate, isFromShowcase])

  const statusItems = [
    { label: '當前圖表', value: currentChart?.label || '未選擇' },
    { label: '圖表類別', value: currentChart?.category || '未知', color: '#3b82f6' },
    { label: '總圖表數', value: filteredChartOptions.length, color: '#10b981' },
    { label: '動畫效果', value: animate ? '開啟' : '關閉', color: animate ? '#10b981' : '#6b7280' },
    { label: '交互功能', value: interactive ? '開啟' : '關閉', color: interactive ? '#10b981' : '#6b7280' }
  ]

  return (
    <DemoPageTemplate
      title="組件庫總覽"
      description="瀏覽所有可用的 D3 組件，包含基礎、統計和特殊圖表類型，支持即時配置和預覽"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 控制面板 - 左側 1/4 */}
        <div className="lg:col-span-1">
          <ModernControlPanel 
            title="圖表瀏覽器" 
            icon={<CogIcon className="w-5 h-5" />}
          >
            <div className="space-y-8">
              {/* 分類篩選 */}
              <ControlGroup title="圖表分類" icon="🗂️" cols={1}>
                <SelectControl
                  label="分類篩選"
                  value={selectedCategory}
                  onChange={setSelectedCategory}
                  options={categories}
                />
              </ControlGroup>

              {/* 圖表選擇 */}
              <ControlGroup title="圖表選擇" icon="📊" cols={1}>
                <SelectControl
                  label="選擇圖表"
                  value={selectedChart}
                  onChange={setSelectedChart}
                  options={filteredChartOptions}
                />
              </ControlGroup>

              {/* 全局設置 */}
              <ControlGroup title="全局設置" icon="⚙️" cols={1}>
                <ToggleControl
                  label="動畫效果"
                  checked={animate}
                  onChange={setAnimate}
                  description="所有圖表的動畫效果"
                />
                
                <ToggleControl
                  label="交互功能"
                  checked={interactive}
                  onChange={setInteractive}
                  description="懸停和點擊交互"
                />
                
                <ToggleControl
                  label="顯示網格"
                  checked={showGrid}
                  onChange={setShowGrid}
                  description="圖表背景網格"
                />
              </ControlGroup>
            </div>
          </ModernControlPanel>
        </div>

        {/* 主要內容區域 - 右側 3/4 */}
        <div className="lg:col-span-3 space-y-8">
          {/* 當前圖表展示 */}
          <ChartContainer
            title={`${currentChart?.label || '圖表預覽'}`}
            subtitle="即時配置效果預覽"
            actions={
              <div className="flex items-center gap-2">
                <RectangleGroupIcon className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-600">{currentChart?.category || '未知類別'}</span>
              </div>
            }
          >
            <motion.div
              key={selectedChart}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex justify-center"
            >
              {renderSelectedChart(selectedChart, { animate, interactive, showGrid })}
            </motion.div>
            
            <StatusDisplay items={statusItems} />
          </ChartContainer>

          {/* 圖表數據表 */}
          <DataTable
            title="當前圖表數據"
            data={getCurrentChartData(selectedChart)}
            columns={getCurrentChartColumns(selectedChart)}
            maxRows={6}
            showIndex
          />

          {/* 代碼範例 */}
          <CodeExample
            title="使用範例"
            language="tsx"
            code={generateCurrentCode(selectedChart, { animate, interactive, showGrid })}
          />

          {/* 組件特性說明 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
              <h3 className="text-xl font-semibold text-gray-800">組件庫特點</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white/80 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">📱 響應式設計</h4>
                <p className="text-sm text-gray-600">支援自訂寬度和高度，適應不同螢幕尺寸</p>
              </div>
              
              <div className="bg-white/80 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">🖱️ 互動功能</h4>
                <p className="text-sm text-gray-600">內建 hover 效果、工具提示和點擊事件</p>
              </div>
              
              <div className="bg-white/80 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">🎨 自訂配色</h4>
                <p className="text-sm text-gray-600">支援多種顏色主題和自訂配色方案</p>
              </div>
              
              <div className="bg-white/80 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">⚡ 動畫效果</h4>
                <p className="text-sm text-gray-600">平滑的進場動畫和過渡效果</p>
              </div>
              
              <div className="bg-white/80 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">🔧 高度可配置</h4>
                <p className="text-sm text-gray-600">豐富的配置選項，滿足各種業務需求</p>
              </div>
              
              <div className="bg-white/80 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">📘 TypeScript</h4>
                <p className="text-sm text-gray-600">完整的類型定義和智能提示</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DemoPageTemplate>
  )
}

// 渲染選中的圖表
function renderSelectedChart(chartId: string, options: { animate: boolean; interactive: boolean; showGrid: boolean }) {
  const { animate, interactive, showGrid } = options
  const commonProps = {
    width: 500,
    height: 300,
    animate,
    interactive,
    showGrid
  }

  switch (chartId) {
    case 'bar-basic':
      return (
        <BarChart
          data={basicBarData}
          xKey="category"
          yKey="value"
          colors={['#3b82f6']}
          {...commonProps}
        />
      )
    
    case 'bar-colorful':
      return (
        <BarChart
          data={basicBarData}
          xKey="category"
          yKey="value"
          colors={['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e']}
          {...commonProps}
        />
      )
    
    case 'line-basic':
      return (
        <LineChart
          data={timeSeriesData}
          xKey="date"
          yKey="value"
          colors={['#3b82f6']}
          curve="monotone"
          {...commonProps}
        />
      )
    
    case 'line-area':
      return (
        <LineChart
          data={timeSeriesData}
          xKey="date"
          yKey="value"
          colors={['#10b981']}
          curve="cardinal"
          showArea={true}
          areaOpacity={0.3}
          {...commonProps}
        />
      )
    
    case 'scatter-basic':
      return (
        <ScatterPlot
          data={scatterData}
          xKey="x"
          yKey="y"
          colors={['#3b82f6']}
          radius={6}
          {...commonProps}
        />
      )
    
    case 'scatter-category':
      return (
        <ScatterPlot
          data={scatterData}
          xKey="x"
          yKey="y"
          colorKey="category"
          colors={['#3b82f6', '#ef4444', '#10b981']}
          radius={7}
          {...commonProps}
        />
      )
    
    case 'pie-basic':
      return (
        <PieChart
          data={pieData}
          mapping={{ label: 'category', value: 'value' }}
          showLegend={true}
          legendPosition="bottom"
          {...commonProps}
        />
      )
    
    case 'pie-donut':
      return (
        <PieChart
          data={pieData}
          mapping={{ label: 'category', value: 'value', color: 'region' }}
          innerRadius={60}
          showLegend={true}
          legendPosition="bottom"
          showCenterText={true}
          {...commonProps}
        />
      )
    
    case 'area-multi':
      return (
        <AreaChart
          data={areaData}
          mapping={{ x: 'month', y: 'users', category: 'device' }}
          stackMode="none"
          gradient={true}
          showLegend={true}
          legendPosition="top"
          {...commonProps}
        />
      )
    
    case 'area-stacked':
      return (
        <AreaChart
          data={areaData}
          mapping={{ x: 'month', y: 'users', category: 'device' }}
          stackMode="stack"
          gradient={true}
          showLegend={true}
          legendPosition="top"
          {...commonProps}
        />
      )
    
    case 'heatmap-basic':
      return (
        <Heatmap
          data={heatmapData}
          mapping={{ x: 'x', y: 'y', value: 'value' }}
          colorScheme="blues"
          showLegend={true}
          legendPosition="right"
          {...commonProps}
        />
      )
    
    case 'heatmap-rounded':
      return (
        <Heatmap
          data={heatmapData}
          mapping={{ x: 'x', y: 'y', value: 'value' }}
          colorScheme="reds"
          cellRadius={4}
          showValues={true}
          showLegend={true}
          legendPosition="right"
          {...commonProps}
        />
      )
    
    case 'funnel-basic':
      return (
        <FunnelChart
          data={funnelData}
          labelKey="step"
          valueKey="users"
          colors={['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554']}
          showLabels={true}
          showValues={true}
          showPercentages={true}
          labelPosition="side"
          {...commonProps}
        />
      )
    
    case 'funnel-conversion':
      return (
        <FunnelChart
          data={funnelData}
          labelKey="step"
          valueKey="users"
          colors={['#10b981', '#059669', '#047857', '#065f46', '#064e3b']}
          showLabels={true}
          showValues={true}
          showConversionRates={true}
          labelPosition="side"
          colorScheme="greens"
          {...commonProps}
        />
      )
    
    default:
      return <div className="text-gray-500">請選擇一個圖表</div>
  }
}

// 獲取當前圖表數據
function getCurrentChartData(chartId: string) {
  switch (chartId) {
    case 'bar-basic':
    case 'bar-colorful':
      return basicBarData.slice(0, 5)
    case 'line-basic':
    case 'line-area':
      return timeSeriesData.slice(0, 5)
    case 'scatter-basic':
    case 'scatter-category':
      return scatterData.slice(0, 5)
    case 'pie-basic':
    case 'pie-donut':
      return pieData
    case 'area-multi':
    case 'area-stacked':
      return areaData.slice(0, 6)
    case 'heatmap-basic':
    case 'heatmap-rounded':
      return heatmapData.slice(0, 8)
    case 'funnel-basic':
    case 'funnel-conversion':
      return funnelData
    default:
      return []
  }
}

// 獲取當前圖表列定義
function getCurrentChartColumns(chartId: string): DataTableColumn[] {
  switch (chartId) {
    case 'bar-basic':
    case 'bar-colorful':
      return [
        { key: 'category', title: '類別', sortable: true },
        { key: 'value', title: '數值', sortable: true, align: 'right' }
      ]
    case 'line-basic':
    case 'line-area':
      return [
        { key: 'date', title: '日期', sortable: true },
        { key: 'value', title: '數值', sortable: true, align: 'right' }
      ]
    case 'scatter-basic':
    case 'scatter-category':
      return [
        { key: 'x', title: 'X 軸', sortable: true, align: 'right' },
        { key: 'y', title: 'Y 軸', sortable: true, align: 'right' },
        ...(chartId === 'scatter-category' ? [{ key: 'category', title: '分類', sortable: true }] : [])
      ]
    case 'pie-basic':
    case 'pie-donut':
      return [
        { key: 'category', title: '類別', sortable: true },
        { key: 'value', title: '數值', sortable: true, align: 'right' },
        { key: 'region', title: '區域', sortable: true }
      ]
    case 'area-multi':
    case 'area-stacked':
      return [
        { key: 'month', title: '月份', sortable: true },
        { key: 'users', title: '用戶數', sortable: true, align: 'right' },
        { key: 'device', title: '設備', sortable: true }
      ]
    case 'heatmap-basic':
    case 'heatmap-rounded':
      return [
        { key: 'x', title: 'X 軸', sortable: true },
        { key: 'y', title: 'Y 軸', sortable: true },
        { key: 'value', title: '數值', sortable: true, align: 'right' }
      ]
    case 'funnel-basic':
    case 'funnel-conversion':
      return [
        { key: 'step', title: '階段', sortable: false },
        { key: 'users', title: '用戶數', sortable: true, align: 'right', formatter: (value) => value.toLocaleString() }
      ]
    default:
      return []
  }
}

// 生成當前代碼範例
function generateCurrentCode(chartId: string, options: { animate: boolean; interactive: boolean; showGrid: boolean }): string {
  const { animate, interactive, showGrid } = options
  
  const getDataName = (chartId: string) => {
    if (chartId.startsWith('bar-')) return 'basicBarData'
    if (chartId.startsWith('line-')) return 'timeSeriesData'
    if (chartId.startsWith('scatter-')) return 'scatterData'
    if (chartId.startsWith('pie-')) return 'pieData'
    if (chartId.startsWith('area-')) return 'areaData'
    if (chartId.startsWith('heatmap-')) return 'heatmapData'
    if (chartId.startsWith('funnel-')) return 'funnelData'
    return 'data'
  }

  const componentMapping = {
    'bar-basic': 'BarChart',
    'bar-colorful': 'BarChart',
    'line-basic': 'LineChart',
    'line-area': 'LineChart',
    'scatter-basic': 'ScatterPlot',
    'scatter-category': 'ScatterPlot',
    'pie-basic': 'PieChart',
    'pie-donut': 'PieChart',
    'area-multi': 'AreaChart',
    'area-stacked': 'AreaChart',
    'heatmap-basic': 'Heatmap',
    'heatmap-rounded': 'Heatmap',
    'funnel-basic': 'FunnelChart',
    'funnel-conversion': 'FunnelChart'
  }

  const componentName = componentMapping[chartId as keyof typeof componentMapping] || 'Chart'
  const dataName = getDataName(chartId)

  return `import { ${componentName} } from '@registry/components'

const ${dataName} = [
  // 您的數據...
]

<${componentName}
  data={${dataName}}
  width={500}
  height={300}${animate ? `\n  animate={${animate}}` : ''}${interactive ? `\n  interactive={${interactive}}` : ''}${showGrid ? `\n  showGrid={${showGrid}}` : ''}
  // 其他特定配置...
/>`
}

export default Gallery