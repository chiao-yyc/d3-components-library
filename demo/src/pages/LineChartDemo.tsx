/**
 * LineChartDemo - 現代化折線圖示例
 * 展示使用新設計系統的完整 Demo 頁面
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { LineChart } from '@registry/components/basic/line-chart'
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
import { CogIcon, ChartBarIcon, SparklesIcon } from '@heroicons/react/24/outline'

// 生成範例資料
const generateTimeSeriesData = (points: number = 30) => {
  const data = []
  const startDate = new Date('2024-01-01')
  
  for (let i = 0; i < points; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    const value = 100 + Math.sin(i * 0.1) * 20 + Math.random() * 10
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100,
      category: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C'
    })
  }
  
  return data
}

const multiSeriesData = [
  { date: '2024-01-01', sales: 120, profit: 30, series: 'Sales' },
  { date: '2024-01-02', sales: 150, profit: 45, series: 'Sales' },
  { date: '2024-01-03', sales: 110, profit: 25, series: 'Sales' },
  { date: '2024-01-04', sales: 180, profit: 60, series: 'Sales' },
  { date: '2024-01-05', sales: 140, profit: 35, series: 'Sales' },
  { date: '2024-01-01', sales: 80, profit: 20, series: 'Marketing' },
  { date: '2024-01-02', sales: 95, profit: 28, series: 'Marketing' },
  { date: '2024-01-03', sales: 75, profit: 15, series: 'Marketing' },
  { date: '2024-01-04', sales: 120, profit: 40, series: 'Marketing' },
  { date: '2024-01-05', sales: 100, profit: 25, series: 'Marketing' },
]

export default function LineChartDemo() {
  // 數據集狀態
  const [selectedDataset, setSelectedDataset] = useState<'timeSeries' | 'multiSeries'>('timeSeries')
  const [timeSeriesData] = useState(generateTimeSeriesData())
  
  // 圖表配置
  const [chartWidth, setChartWidth] = useState(800)
  const [chartHeight, setChartHeight] = useState(400)
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [dotRadius, setDotRadius] = useState(4)
  const [areaOpacity, setAreaOpacity] = useState(0.2)
  
  // 樣式設定
  const [curve, setCurve] = useState<'linear' | 'monotone' | 'cardinal' | 'basis' | 'step'>('monotone')
  const [showDots, setShowDots] = useState(false)
  const [showArea, setShowArea] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  
  // 交互功能
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)
  const [enableBrushZoom, setEnableBrushZoom] = useState(false)
  const [enableCrosshair, setEnableCrosshair] = useState(false)
  const [enableDropShadow, setEnableDropShadow] = useState(false)
  const [enableGlowEffect, setEnableGlowEffect] = useState(false)
  
  // 交互狀態
  const [zoomDomain, setZoomDomain] = useState<[any, any] | null>(null)
  const [crosshairData, setCrosshairData] = useState<any>(null)
  
  // 邊距設定

  // 交互回調函數
  const handleZoom = (domain: [any, any]) => {
    setZoomDomain(domain)
    console.log('縮放域值:', domain)
  }

  const handleZoomReset = () => {
    setZoomDomain(null)
    console.log('縮放重置')
  }

  // 獲取當前數據集
  const getCurrentData = () => {
    return selectedDataset === 'multiSeries' ? multiSeriesData : timeSeriesData
  }
  
  const getCurrentConfig = () => {
    return selectedDataset === 'multiSeries' 
      ? { xKey: 'date', yKey: 'sales', seriesKey: 'series' }
      : { xKey: 'date', yKey: 'value' }
  }

  const currentData = getCurrentData()
  const currentConfig = getCurrentConfig()
  
  // 狀態顯示數據
  const statusItems = [
    { label: '數據集', value: selectedDataset === 'timeSeries' ? '時間序列' : '多系列' },
    { label: '數據點數', value: currentData.length },
    { label: '圖表尺寸', value: `${chartWidth} × ${chartHeight}` },
    { label: '曲線類型', value: curve },
    { label: '動畫', value: animate ? '開啟' : '關閉', color: animate ? '#10b981' : '#6b7280' }
  ]

  // 數據表格列定義
  const getTableColumns = (): DataTableColumn[] => {
    const config = getCurrentConfig()
    const columns: DataTableColumn[] = [
      { key: config.xKey, title: '日期', sortable: true },
      { key: config.yKey, title: '數值', sortable: true, formatter: (value) => value.toFixed(2), align: 'right' }
    ]
    
    if (config.seriesKey) {
      columns.push({ key: config.seriesKey, title: '系列', sortable: true })
    }
    
    return columns
  }

  return (
    <DemoPageTemplate
      title="LineChart Demo"
      description="現代化折線圖組件展示 - 支持時間序列、多系列數據和豐富的交互功能"
    >
      {/* 控制面板 */}
      <ContentSection>
        <ModernControlPanel 
          title="控制面板" 
          icon={<CogIcon className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* 基本設定 */}
            <ControlGroup title="基本設定" icon="⚙️" cols={3}>
              <SelectControl
                label="數據集"
                value={selectedDataset}
                onChange={setSelectedDataset}
                options={[
                  { value: 'timeSeries', label: '時間序列數據' },
                  { value: 'multiSeries', label: '多系列數據' }
                ]}
              />
              
              <SelectControl
                label="曲線類型"
                value={curve}
                onChange={setCurve}
                options={[
                  { value: 'linear', label: 'Linear (直線)' },
                  { value: 'monotone', label: 'Monotone (平滑)' },
                  { value: 'cardinal', label: 'Cardinal (圓滑)' },
                  { value: 'basis', label: 'Basis (基礎)' },
                  { value: 'step', label: 'Step (階梯)' }
                ]}
              />
            </ControlGroup>

            {/* 尺寸設定 */}
            <ControlGroup title="尺寸配置" icon="📏" cols={2}>
              <RangeSlider
                label="寬度"
                value={chartWidth}
                min={600}
                max={1000}
                step={50}
                onChange={setChartWidth}
                suffix="px"
              />
              
              <RangeSlider
                label="高度"
                value={chartHeight}
                min={300}
                max={600}
                step={25}
                onChange={setChartHeight}
                suffix="px"
              />
            </ControlGroup>

            {/* 樣式設定 */}
            <ControlGroup title="樣式配置" icon="🎨" cols={3}>
              <RangeSlider
                label="線條寬度"
                value={strokeWidth}
                min={1}
                max={5}
                step={0.5}
                onChange={setStrokeWidth}
                suffix="px"
              />
              
              <RangeSlider
                label="點大小"
                value={dotRadius}
                min={2}
                max={8}
                step={1}
                onChange={setDotRadius}
                suffix="px"
              />
              
              <RangeSlider
                label="區域透明度"
                value={areaOpacity}
                min={0.1}
                max={0.8}
                step={0.1}
                onChange={setAreaOpacity}
                formatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
            </ControlGroup>


            {/* 顯示選項 */}
            <ControlGroup title="顯示選項" icon="👁️" cols={2}>
              <ToggleControl
                label="顯示數據點"
                checked={showDots}
                onChange={setShowDots}
                description="在折線上顯示數據點"
              />
              
              <ToggleControl
                label="區域填充"
                checked={showArea}
                onChange={setShowArea}
                description="填充線條下方區域"
              />
              
              <ToggleControl
                label="顯示網格"
                checked={showGrid}
                onChange={setShowGrid}
                description="顯示背景網格線"
              />
              
              <ToggleControl
                label="動畫效果"
                checked={animate}
                onChange={setAnimate}
                description="圖表進入和更新動畫"
              />
            </ControlGroup>

            {/* 交互功能 */}
            <ControlGroup title="交互功能" icon="🎯" cols={2}>
              <ToggleControl
                label="互動功能"
                checked={interactive}
                onChange={setInteractive}
                description="鼠標懸停和點擊交互"
              />
              
              <ToggleControl
                label="筆刷縮放"
                checked={enableBrushZoom}
                onChange={setEnableBrushZoom}
                description="拖拽選取區域進行縮放"
              />
              
              <ToggleControl
                label="十字游標"
                checked={enableCrosshair}
                onChange={setEnableCrosshair}
                description="顯示數據點詳細信息"
              />
            </ControlGroup>

            {/* 視覺效果 */}
            <ControlGroup title="視覺效果" icon="✨" cols={2}>
              <ToggleControl
                label="陰影效果"
                checked={enableDropShadow}
                onChange={setEnableDropShadow}
                description="為線條添加陰影"
              />
              
              <ToggleControl
                label="光暈效果"
                checked={enableGlowEffect}
                onChange={setEnableGlowEffect}
                description="為線條添加光暈"
              />
            </ControlGroup>
          </div>
        </ModernControlPanel>
      </ContentSection>

      {/* 圖表展示 */}
      <ContentSection delay={0.1}>
        <ChartContainer
          title="圖表預覽"
          subtitle="即時預覽配置效果"
          actions={
            <div className="flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">折線圖</span>
              {enableBrushZoom && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">筆刷縮放</span>}
              {enableCrosshair && <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">十字游標</span>}
            </div>
          }
        >
          {/* 交互狀態顯示 */}
          {(zoomDomain || crosshairData) && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-blue-800 mb-2">交互狀態</h4>
              <div className="space-y-2 text-sm">
                {zoomDomain && (
                  <div className="text-blue-700">
                    <strong>縮放範圍:</strong> {
                      zoomDomain[0] instanceof Date 
                        ? zoomDomain[0].toLocaleDateString() 
                        : zoomDomain[0]?.toString()
                    } 到 {
                      zoomDomain[1] instanceof Date 
                        ? zoomDomain[1].toLocaleDateString() 
                        : zoomDomain[1]?.toString()
                    }
                  </div>
                )}
                {crosshairData && (
                  <div className="text-green-700">
                    <strong>游標數據:</strong> X: {crosshairData.x}, Y: {crosshairData.y}
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="flex justify-center">
            <motion.div
              key={`${chartWidth}-${chartHeight}-${selectedDataset}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <LineChart
                data={currentData}
                xKey={currentConfig.xKey}
                yKey={currentConfig.yKey}
                seriesKey={currentConfig.seriesKey}
                width={chartWidth}
                height={chartHeight}
                curve={curve}
                showDots={showDots}
                showArea={showArea}
                showGrid={showGrid}
                animate={animate}
                interactive={interactive}
                strokeWidth={strokeWidth}
                dotRadius={dotRadius}
                areaOpacity={areaOpacity}
                colors={selectedDataset === 'multiSeries' ? ['#3b82f6', '#ef4444', '#10b981'] : ['#3b82f6']}
                onDataClick={(data) => console.log('Clicked:', data)}
                onHover={(data) => console.log('Hovered:', data)}
                
                // 交互功能
                enableBrushZoom={enableBrushZoom}
                onZoom={handleZoom}
                onZoomReset={handleZoomReset}
                enableCrosshair={enableCrosshair}
                enableDropShadow={enableDropShadow}
                enableGlowEffect={enableGlowEffect}
                glowColor="#3b82f6"
              />
            </motion.div>
          </div>
          
          <StatusDisplay items={statusItems} />
        </ChartContainer>
      </ContentSection>

      {/* 數據詳情 */}
      <ContentSection delay={0.2}>
        <DataTable
          title="數據詳情"
          data={currentData}
          columns={getTableColumns()}
          maxRows={8}
          showIndex
        />
      </ContentSection>

      {/* 代碼範例 */}
      <ContentSection delay={0.3}>
        <CodeExample
          title="使用範例"
          language="tsx"
          code={`import { LineChart } from '@registry/components/basic/line-chart'

// ${selectedDataset === 'timeSeries' ? '時間序列' : '多系列'}數據
const data = [
  { ${currentConfig.xKey}: '${currentData[0]?.[currentConfig.xKey]}', ${currentConfig.yKey}: ${currentData[0]?.[currentConfig.yKey]}${currentConfig.seriesKey ? `, ${currentConfig.seriesKey}: '${currentData[0]?.[currentConfig.seriesKey]}'` : ''} },
  { ${currentConfig.xKey}: '${currentData[1]?.[currentConfig.xKey]}', ${currentConfig.yKey}: ${currentData[1]?.[currentConfig.yKey]}${currentConfig.seriesKey ? `, ${currentConfig.seriesKey}: '${currentData[1]?.[currentConfig.seriesKey]}'` : ''} },
  // ... more data
]

<LineChart
  data={data}
  xKey="${currentConfig.xKey}"
  yKey="${currentConfig.yKey}"${currentConfig.seriesKey ? `\n  seriesKey="${currentConfig.seriesKey}"` : ''}
  width={${chartWidth}}
  height={${chartHeight}}
  curve="${curve}"
  showDots={${showDots}}
  showArea={${showArea}}
  showGrid={${showGrid}}
  animate={${animate}}
  interactive={${interactive}}
  strokeWidth={${strokeWidth}}
  dotRadius={${dotRadius}}
  areaOpacity={${areaOpacity}}${enableBrushZoom ? `\n  enableBrushZoom={${enableBrushZoom}}\n  onZoom={(domain) => console.log('縮放:', domain)}\n  onZoomReset={() => console.log('重置縮放')}` : ''}${enableCrosshair ? `\n  enableCrosshair={${enableCrosshair}}` : ''}${enableDropShadow ? `\n  enableDropShadow={${enableDropShadow}}` : ''}${enableGlowEffect ? `\n  enableGlowEffect={${enableGlowEffect}}\n  glowColor="#3b82f6"` : ''}
  onDataClick={(data) => console.log('Clicked:', data)}
  onHover={(data) => console.log('Hovered:', data)}
/>`}
        />
      </ContentSection>

      {/* 功能說明 */}
      <ContentSection delay={0.4}>
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-cyan-600 rounded-full" />
            <h3 className="text-xl font-semibold text-gray-800">LineChart 功能特點</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">核心功能</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  多種曲線類型：直線、平滑、階梯等
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  時間序列和多系列數據支持
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  面積填充和數據點顯示
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  靈活的樣式和尺寸配置
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">交互特性</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  筆刷縮放：拖拽選取區域縮放
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full" />
                  十字游標：精確數據點定位
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  視覺效果：陰影和光暈增強
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  響應式設計和平滑動畫
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ContentSection>
    </DemoPageTemplate>
  )
}