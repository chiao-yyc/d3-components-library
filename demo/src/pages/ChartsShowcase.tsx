/**
 * ChartsShowcase - 圖表總覽館
 * 一頁展示所有可用的 D3 圖表組件，提供快速總覽和比較功能
 * 結合現代化架構和原本「一覽所有圖表」的便利性
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
  RangeSlider,
  ChartContainer,
  StatusDisplay,
  CodeExample
} from '../components/ui'
import { CogIcon, RectangleStackIcon, EyeIcon, PlayIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

// 示範數據
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
  { month: '2024-01', desktop: 45, mobile: 32 },
  { month: '2024-02', desktop: 48, mobile: 35 },
  { month: '2024-03', desktop: 52, mobile: 38 },
  { month: '2024-04', desktop: 49, mobile: 41 },
  { month: '2024-05', desktop: 55, mobile: 44 },
  { month: '2024-06', desktop: 58, mobile: 47 },
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

const observableFunnelData = [
  { step: 1, value: 10000, label: '瀏覽首頁' },
  { step: 2, value: 5500, label: '查看產品' },
  { step: 3, value: 2100, label: '加入購物車' },
  { step: 4, value: 800, label: '結帳流程' },
  { step: 5, value: 350, label: '完成購買' },
]

export default function ChartsShowcase() {
  const navigate = useNavigate()
  
  // 全局控制狀態
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'basic' | 'statistical' | 'special'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)
  const [showGrid, setShowGrid] = useState(false)
  const [chartSize, setChartSize] = useState(280) // 統一圖表大小

  // 圖表配置定義
  const chartConfigs = [
    // 基礎圖表
    {
      id: 'bar-basic',
      title: '基本長條圖',
      category: 'basic',
      description: '簡單的長條圖，適合展示分類資料',
      component: (
        <BarChart
          data={basicBarData}
          xKey="category"
          yKey="value"
          width={chartSize}
          height={chartSize * 0.6}
          colors={['#3b82f6']}
          animate={animate}
          interactive={interactive}
          showGrid={showGrid}
        />
      )
    },
    {
      id: 'bar-colorful',
      title: '多色長條圖', 
      category: 'basic',
      description: '每根長條使用不同顏色的彩虹配色',
      component: (
        <BarChart
          data={basicBarData}
          xKey="category"
          yKey="value"
          width={chartSize}
          height={chartSize * 0.6}
          colors={['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e']}
          animate={animate}
          interactive={interactive}
          showGrid={showGrid}
        />
      )
    },
    {
      id: 'line-basic',
      title: '基本折線圖',
      category: 'basic',
      description: '時間序列資料的基本折線圖',
      component: (
        <LineChart
          data={timeSeriesData}
          xKey="date"
          yKey="value"
          width={chartSize}
          height={chartSize * 0.6}
          colors={['#3b82f6']}
          curve="monotone"
          animate={animate}
          interactive={interactive}
          showGrid={showGrid}
        />
      )
    },
    {
      id: 'line-area',
      title: '區域填充圖',
      category: 'basic',
      description: '帶有區域填充的平滑曲線圖',
      component: (
        <LineChart
          data={timeSeriesData}
          xKey="date"
          yKey="value"
          width={chartSize}
          height={chartSize * 0.6}
          colors={['#10b981']}
          curve="cardinal"
          showArea={true}
          areaOpacity={0.3}
          animate={animate}
          interactive={interactive}
          showGrid={showGrid}
        />
      )
    },
    {
      id: 'pie-basic',
      title: '基本圓餅圖',
      category: 'basic',
      description: '基本的圓餅圖，展示資料比例',
      component: (
        <PieChart
          data={pieData}
          mapping={{ label: 'category', value: 'value' }}
          width={chartSize}
          height={chartSize}
          showLegend={true}
          legendPosition="bottom"
          animate={animate}
          interactive={interactive}
        />
      )
    },
    {
      id: 'pie-donut',
      title: '甜甜圈圖',
      category: 'basic',
      description: '中空的甜甜圈樣式，帶有中心文字',
      component: (
        <PieChart
          data={pieData}
          mapping={{ label: 'category', value: 'value', color: 'region' }}
          width={chartSize}
          height={chartSize}
          innerRadius={60}
          showLegend={true}
          legendPosition="bottom"
          showCenterText={true}
          animate={animate}
          interactive={interactive}
        />
      )
    },
    {
      id: 'area-multi',
      title: '多系列區域圖',
      category: 'basic',
      description: '多系列的區域圖，展示不同類別趨勢',
      component: (
        <AreaChart
          data={areaData}
          mapping={{ x: 'month', y: 'users', category: 'device' }}
          width={chartSize}
          height={chartSize * 0.6}
          stackMode="none"
          gradient={true}
          showLegend={true}
          legendPosition="top"
          animate={animate}
          interactive={interactive}
        />
      )
    },
    {
      id: 'area-stacked',
      title: '堆疊區域圖',
      category: 'basic',
      description: '累積堆疊的區域圖，展示總量變化',
      component: (
        <AreaChart
          data={areaData}
          mapping={{ x: 'month', y: 'users', category: 'device' }}
          width={chartSize}
          height={chartSize * 0.6}
          stackMode="stack"
          gradient={true}
          showLegend={true}
          legendPosition="top"
          animate={animate}
          interactive={interactive}
        />
      )
    },
    // 統計圖表
    {
      id: 'scatter-basic',
      title: '基本散點圖',
      category: 'statistical',
      description: '基本的散點圖，展示兩個變數的關係',
      component: (
        <ScatterPlot
          data={scatterData}
          xKey="x"
          yKey="y"
          width={chartSize}
          height={chartSize * 0.6}
          colors={['#3b82f6']}
          radius={6}
          animate={animate}
          interactive={interactive}
          showGrid={showGrid}
        />
      )
    },
    {
      id: 'scatter-category',
      title: '分類散點圖',
      category: 'statistical',
      description: '使用顏色區分不同類別的散點圖',
      component: (
        <ScatterPlot
          data={scatterData}
          xKey="x"
          yKey="y"
          colorKey="category"
          width={chartSize}
          height={chartSize * 0.6}
          colors={['#3b82f6', '#ef4444', '#10b981']}
          radius={7}
          animate={animate}
          interactive={interactive}
          showGrid={showGrid}
        />
      )
    },
    // 特殊圖表
    {
      id: 'heatmap-basic',
      title: '基本熱力圖',
      category: 'special',
      description: '基本的熱力圖，展示矩陣資料',
      component: (
        <Heatmap
          data={heatmapData}
          mapping={{ x: 'x', y: 'y', value: 'value' }}
          width={chartSize}
          height={chartSize * 0.7}
          colorScheme="blues"
          showLegend={true}
          legendPosition="right"
          animate={animate}
          interactive={interactive}
        />
      )
    },
    {
      id: 'heatmap-rounded',
      title: '圓角熱力圖',
      category: 'special',
      description: '圓角格子和數值顯示的熱力圖',
      component: (
        <Heatmap
          data={heatmapData}
          mapping={{ x: 'x', y: 'y', value: 'value' }}
          width={chartSize}
          height={chartSize * 0.7}
          colorScheme="reds"
          cellRadius={4}
          showValues={true}
          showLegend={true}
          legendPosition="right"
          animate={animate}
          interactive={interactive}
        />
      )
    },
    {
      id: 'funnel-basic',
      title: '基本漏斗圖',
      category: 'special',
      description: '基本的漏斗圖，展示轉換流程',
      component: (
        <FunnelChart
          data={funnelData}
          labelKey="step"
          valueKey="users"
          width={chartSize}
          height={chartSize}
          colors={['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554']}
          showLabels={true}
          showValues={true}
          showPercentages={true}
          labelPosition="side"
          animate={animate}
          interactive={interactive}
        />
      )
    },
    {
      id: 'funnel-conversion',
      title: '轉換率漏斗圖',
      category: 'special',
      description: '顯示各階段轉換率的漏斗圖',
      component: (
        <FunnelChart
          data={funnelData}
          labelKey="step"
          valueKey="users"
          width={chartSize}
          height={chartSize}
          colors={['#10b981', '#059669', '#047857', '#065f46', '#064e3b']}
          showLabels={true}
          showValues={true}
          showConversionRates={true}
          labelPosition="side"
          colorScheme="greens"
          animate={animate}
          interactive={interactive}
        />
      )
    }
  ]

  // 過濾圖表
  const filteredCharts = chartConfigs.filter(chart => 
    categoryFilter === 'all' || chart.category === categoryFilter
  )

  // 分類統計
  const categoryStats = {
    total: chartConfigs.length,
    basic: chartConfigs.filter(c => c.category === 'basic').length,
    statistical: chartConfigs.filter(c => c.category === 'statistical').length,
    special: chartConfigs.filter(c => c.category === 'special').length
  }

  // 處理圖表點擊事件
  const handleChartClick = (chartId: string) => {
    // 跳轉到 Gallery 並附帶參數
    const params = new URLSearchParams({
      chart: chartId,
      from: 'showcase'
    })
    navigate(`/gallery?${params.toString()}`)
  }

  // 狀態顯示數據
  const statusItems = [
    { label: '顯示圖表', value: filteredCharts.length, color: '#3b82f6' },
    { label: '總圖表數', value: categoryStats.total, color: '#10b981' },
    { label: '檢視模式', value: viewMode === 'grid' ? '網格' : '列表', color: '#8b5cf6' },
    { label: '圖表尺寸', value: `${chartSize}px`, color: '#f59e0b' },
    { label: '動畫效果', value: animate ? '開啟' : '關閉', color: animate ? '#10b981' : '#6b7280' }
  ]

  return (
    <DemoPageTemplate
      title="圖表總覽館"
      description="一頁展示所有 D3 圖表組件，快速瀏覽和比較不同圖表類型的視覺效果"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 控制面板 - 左側 1/4 */}
        <div className="lg:col-span-1">
          <ModernControlPanel 
            title="總覽控制台" 
            icon={<CogIcon className="w-5 h-5" />}
          >
            <div className="space-y-8">
              {/* 分類篩選 */}
              <ControlGroup title="圖表分類" icon="🗂️" cols={1}>
                <SelectControl
                  label="分類篩選"
                  value={categoryFilter}
                  onChange={setCategoryFilter}
                  options={[
                    { value: 'all', label: `全部圖表 (${categoryStats.total})` },
                    { value: 'basic', label: `基礎圖表 (${categoryStats.basic})` },
                    { value: 'statistical', label: `統計圖表 (${categoryStats.statistical})` },
                    { value: 'special', label: `特殊圖表 (${categoryStats.special})` }
                  ]}
                />
              </ControlGroup>

              {/* 展示設置 */}
              <ControlGroup title="展示設置" icon="👁️" cols={1}>
                <SelectControl
                  label="檢視模式"
                  value={viewMode}
                  onChange={setViewMode}
                  options={[
                    { value: 'grid', label: '網格模式' },
                    { value: 'list', label: '列表模式' }
                  ]}
                />
                
                <RangeSlider
                  label="圖表尺寸"
                  value={chartSize}
                  onChange={setChartSize}
                  min={200}
                  max={400}
                  step={20}
                  suffix="px"
                  description="調整所有圖表的顯示大小"
                />
              </ControlGroup>

              {/* 全局功能 */}
              <ControlGroup title="全局功能" icon="⚙️" cols={1}>
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
                  description="圖表背景網格線"
                />
              </ControlGroup>
            </div>
          </ModernControlPanel>
        </div>

        {/* 主要內容區域 - 右側 3/4 */}
        <div className="lg:col-span-3 space-y-8">
          {/* 狀態顯示 */}
          <ChartContainer
            title="展示狀態"
            subtitle="當前總覽配置"
            actions={
              <div className="flex items-center gap-2">
                <RectangleStackIcon className="w-5 h-5 text-indigo-500" />
                <span className="text-sm text-gray-600">圖表總覽</span>
              </div>
            }
          >
            <StatusDisplay items={statusItems} />
          </ChartContainer>

          {/* 圖表展示區域 */}
          <div className="space-y-8">
            {['basic', 'statistical', 'special'].map(category => {
              const categoryCharts = filteredCharts.filter(chart => 
                categoryFilter === 'all' ? chart.category === category : chart.category === categoryFilter
              )
              
              if (categoryCharts.length === 0 && categoryFilter !== 'all') return null
              if (categoryCharts.length === 0) return null

              const categoryNames = {
                basic: '基礎圖表',
                statistical: '統計圖表', 
                special: '特殊圖表'
              }

              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {categoryNames[category as keyof typeof categoryNames]} ({categoryCharts.length})
                    </h2>
                    <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                  </div>
                  
                  <div className={`grid gap-6 ${
                    viewMode === 'grid' 
                      ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                      : 'grid-cols-1'
                  }`}>
                    {categoryCharts.map((chart) => (
                      <motion.div
                        key={chart.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
                      >
                        <div className="mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {chart.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {chart.description}
                          </p>
                        </div>
                        
                        <div className="flex justify-center mb-4 cursor-pointer" onClick={() => handleChartClick(chart.id)}>
                          {chart.component}
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <span className="bg-gray-100 px-2 py-1 rounded-full">
                            {chart.category}
                          </span>
                          <span>
                            {chartSize}×{Math.round(chartSize * (chart.id.includes('pie') || chart.id.includes('funnel') ? 1 : 0.6))}
                          </span>
                        </div>
                        
                        {/* 動作按鈕 */}
                        <motion.button
                          onClick={() => handleChartClick(chart.id)}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <PlayIcon className="w-4 h-4" />
                          進入實驗室
                          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* 使用說明 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <EyeIcon className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-semibold text-gray-800">使用說明</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">快速總覽</h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    一頁展示所有圖表類型和變體
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    按分類篩選：基礎、統計、特殊
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    點擊圖表或按鈕進入實驗室深度配置
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">深度探索</h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    點擊圖表可跳轉到詳細 Demo
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full" />
                    Gallery 頁面提供交互式配置
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                    各圖表專頁有完整功能展示
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