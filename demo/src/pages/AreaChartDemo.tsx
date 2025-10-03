/**
 * AreaChartDemo - 現代化區域圖示例
 * 展示使用新設計系統的完整 Demo 頁面
 */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { AreaChart } from '@registry/components/basic/area-chart'
import { 
  DemoPageTemplate,
  ModernControlPanel,
  ControlGroup,
  RangeSlider,
  SelectControl,
  ToggleControl,
  ChartContainer,
  StatusDisplay,
  DataTable,
  CodeExample,
  ChartTooltip,
  type DataTableColumn
} from '../components/ui'
import { CogIcon, ChartBarIcon, SwatchIcon } from '@heroicons/react/24/outline'

// 時間序列資料
const timeSeriesData = [
  { date: '2023-01', revenue: 120000, expenses: 80000, profit: 40000 },
  { date: '2023-02', revenue: 135000, expenses: 85000, profit: 50000 },
  { date: '2023-03', revenue: 148000, expenses: 92000, profit: 56000 },
  { date: '2023-04', revenue: 162000, expenses: 98000, profit: 64000 },
  { date: '2023-05', revenue: 155000, expenses: 95000, profit: 60000 },
  { date: '2023-06', revenue: 178000, expenses: 105000, profit: 73000 },
  { date: '2023-07', revenue: 186000, expenses: 110000, profit: 76000 },
  { date: '2023-08', revenue: 192000, expenses: 115000, profit: 77000 },
  { date: '2023-09', revenue: 205000, expenses: 120000, profit: 85000 },
  { date: '2023-10', revenue: 198000, expenses: 118000, profit: 80000 },
  { date: '2023-11', revenue: 215000, expenses: 125000, profit: 90000 },
  { date: '2023-12', revenue: 228000, expenses: 132000, profit: 96000 }
]

// 多系列資料
const multiSeriesData = [
  { month: '2024-01', desktop: 45, mobile: 32, tablet: 18 },
  { month: '2024-02', desktop: 48, mobile: 35, tablet: 22 },
  { month: '2024-03', desktop: 52, mobile: 38, tablet: 25 },
  { month: '2024-04', desktop: 49, mobile: 41, tablet: 28 },
  { month: '2024-05', desktop: 55, mobile: 44, tablet: 30 },
  { month: '2024-06', desktop: 58, mobile: 47, tablet: 32 }
]

// 產品銷售資料
const productData = [
  { quarter: 'Q1', productA: 125, productB: 98, productC: 87 },
  { quarter: 'Q2', productA: 142, productB: 112, productC: 95 },
  { quarter: 'Q3', productA: 156, productB: 125, productC: 108 },
  { quarter: 'Q4', productA: 168, productB: 138, productC: 122 }
]

export default function AreaChartDemo() {
  // 基本設定
  const [selectedDataset, setSelectedDataset] = useState('timeSeries')
  const [stackMode, setStackMode] = useState<'none' | 'stack' | 'percent'>('none')
  const [curve, setCurve] = useState<'linear' | 'monotone' | 'cardinal' | 'basis' | 'step'>('monotone')
  const [colorScheme, setColorScheme] = useState<'custom' | 'category10' | 'set3' | 'pastel' | 'dark'>('custom')
  
  // 視覺設定
  const [fillOpacity, setFillOpacity] = useState(0.7)
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [gradient, setGradient] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [showDots, setShowDots] = useState(false)
  const [showLegend, setShowLegend] = useState(true)
  const [legendPosition, setLegendPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top')
  
  // 交互功能
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)
  const [enableBrushZoom, setEnableBrushZoom] = useState(false)
  const [enableCrosshair, setEnableCrosshair] = useState(false)
  
  // Tooltip 功能
  const [enableTooltip, setEnableTooltip] = useState(true)
  const [tooltipMode, setTooltipMode] = useState<'point' | 'vertical-line' | 'area'>('vertical-line')
  const [showCrosshair, setShowCrosshair] = useState(true)
  
  // 交互回調狀態
  const [zoomDomain, setZoomDomain] = useState<[any, any] | null>(null)
  
  // Tooltip 狀態
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const [tooltipContent, setTooltipContent] = useState('')

  // 當前資料和映射
  const { currentData, mapping, datasetInfo } = useMemo(() => {
    switch (selectedDataset) {
      case 'timeSeries':
        // 轉換為長格式用於多系列
        const transformed = timeSeriesData.flatMap(d => [
          { date: d.date, value: d.revenue, category: '營收' },
          { date: d.date, value: d.expenses, category: '支出' },
          { date: d.date, value: d.profit, category: '利潤' }
        ])
        return {
          currentData: transformed,
          mapping: { x: 'date', y: 'value', category: 'category' },
          datasetInfo: { name: '財務時間序列', points: timeSeriesData.length, series: 3 }
        }
      
      case 'multiSeries':
        const deviceData = multiSeriesData.flatMap(d => [
          { month: d.month, users: d.desktop, device: 'Desktop' },
          { month: d.month, users: d.mobile, device: 'Mobile' },
          { month: d.month, users: d.tablet, device: 'Tablet' }
        ])
        return {
          currentData: deviceData,
          mapping: { x: 'month', y: 'users', category: 'device' },
          datasetInfo: { name: '設備使用量', points: multiSeriesData.length, series: 3 }
        }
      
      case 'product':
        const productSales = productData.flatMap(d => [
          { quarter: d.quarter, sales: d.productA, product: 'Product A' },
          { quarter: d.quarter, sales: d.productB, product: 'Product B' },
          { quarter: d.quarter, sales: d.productC, product: 'Product C' }
        ])
        return {
          currentData: productSales,
          mapping: { x: 'quarter', y: 'sales', category: 'product' },
          datasetInfo: { name: '產品銷售', points: productData.length, series: 3 }
        }
      
      default:
        return {
          currentData: [],
          mapping: { x: 'x', y: 'y' },
          datasetInfo: { name: '', points: 0, series: 0 }
        }
    }
  }, [selectedDataset])

  // 狀態顯示數據
  const statusItems = [
    { label: '數據集', value: datasetInfo.name },
    { label: '數據點', value: datasetInfo.points },
    { label: '系列數', value: datasetInfo.series },
    { label: '堆疊模式', value: stackMode === 'none' ? '無' : stackMode === 'stack' ? '累積' : '百分比' },
    { label: '曲線類型', value: curve },
    { label: '動畫', value: animate ? '開啟' : '關閉', color: animate ? '#10b981' : '#6b7280' },
    { label: 'Tooltip', value: enableTooltip ? '開啟' : '關閉', color: enableTooltip ? '#10b981' : '#6b7280' }
  ]

  // 數據表格列定義
  const tableColumns: DataTableColumn[] = [
    { key: mapping.x, title: mapping.x, sortable: true },
    { 
      key: mapping.y, 
      title: mapping.y, 
      sortable: true,
      formatter: (value) => value.toLocaleString(),
      align: 'right'
    },
    { key: mapping.category || 'category', title: '類別', sortable: true }
  ]

  return (
    <DemoPageTemplate
      title="AreaChart Demo"
      description="現代化區域圖組件展示 - 支援堆疊模式、多系列資料和動畫效果"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 控制面板 - 1/4 width */}
        <div className="lg:col-span-1">
          <ModernControlPanel 
            title="控制面板" 
            icon={<CogIcon className="w-5 h-5" />}
          >
          <div className="space-y-8">
            {/* 基本設定 */}
            <ControlGroup title="基本設定" icon="⚙️" cols={3}>
              <SelectControl
                label="資料集"
                value={selectedDataset}
                onChange={setSelectedDataset}
                options={[
                  { value: 'timeSeries', label: '財務時間序列' },
                  { value: 'multiSeries', label: '設備使用量' },
                  { value: 'product', label: '產品銷售' }
                ]}
              />
              
              <SelectControl
                label="堆疊模式"
                value={stackMode}
                onChange={(value) => setStackMode(value as any)}
                options={[
                  { value: 'none', label: '無堆疊' },
                  { value: 'stack', label: '累積堆疊' },
                  { value: 'percent', label: '百分比堆疊' }
                ]}
              />
              
              <SelectControl
                label="曲線類型"
                value={curve}
                onChange={(value) => setCurve(value as any)}
                options={[
                  { value: 'linear', label: '線性' },
                  { value: 'monotone', label: '平滑' },
                  { value: 'cardinal', label: '基數樣條' },
                  { value: 'basis', label: '基樣條' },
                  { value: 'step', label: '階梯' }
                ]}
              />
            </ControlGroup>

            {/* 視覺配置 */}
            <ControlGroup title="視覺配置" icon="🎨" cols={3}>
              <RangeSlider
                label="填充透明度"
                value={fillOpacity}
                min={0.1}
                max={1}
                step={0.1}
                onChange={setFillOpacity}
              />
              
              <RangeSlider
                label="線條寬度"
                value={strokeWidth}
                min={1}
                max={5}
                onChange={setStrokeWidth}
                suffix="px"
              />
              
              <SelectControl
                label="顏色主題"
                value={colorScheme}
                onChange={(value) => setColorScheme(value as any)}
                options={[
                  { value: 'custom', label: '自訂' },
                  { value: 'category10', label: 'Category10' },
                  { value: 'set3', label: 'Set3' },
                  { value: 'pastel', label: 'Pastel' },
                  { value: 'dark', label: 'Dark' }
                ]}
              />
            </ControlGroup>

            {/* 顯示選項 */}
            <ControlGroup title="顯示選項" icon="👁️" cols={2}>
              <ToggleControl
                label="漸變填充"
                checked={gradient}
                onChange={setGradient}
                description="區域使用漸變填充效果"
              />
              
              <ToggleControl
                label="顯示網格"
                checked={showGrid}
                onChange={setShowGrid}
                description="顯示背景網格線"
              />
              
              <ToggleControl
                label="顯示資料點"
                checked={showDots}
                onChange={setShowDots}
                description="在線上顯示數據點"
              />
              
              <ToggleControl
                label="顯示圖例"
                checked={showLegend}
                onChange={setShowLegend}
                description="顯示系列圖例"
              />
            </ControlGroup>

            {/* 圖例配置 */}
            {showLegend && (
              <ControlGroup title="圖例配置" icon="📊" cols={1}>
                <SelectControl
                  label="圖例位置"
                  value={legendPosition}
                  onChange={(value) => setLegendPosition(value as any)}
                  options={[
                    { value: 'top', label: '上方' },
                    { value: 'bottom', label: '下方' },
                    { value: 'left', label: '左側' },
                    { value: 'right', label: '右側' }
                  ]}
                />
              </ControlGroup>
            )}

            {/* 交互功能 */}
            <ControlGroup title="交互功能" icon="🎯" cols={2}>
              <ToggleControl
                label="動畫效果"
                checked={animate}
                onChange={setAnimate}
                description="圖表進入和更新動畫"
              />
              
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
                description="顯示十字游標和數據詳情"
              />
            </ControlGroup>

            {/* Tooltip 配置 */}
            <ControlGroup title="Tooltip 配置" icon="💬" cols={2}>
              <ToggleControl
                label="啟用 Tooltip"
                checked={enableTooltip}
                onChange={setEnableTooltip}
                description="啟用區域圖 tooltip 功能"
              />
              
              {enableTooltip && (
                <>
                  <SelectControl
                    label="Tooltip 模式"
                    value={tooltipMode}
                    onChange={(value) => setTooltipMode(value as any)}
                    options={[
                      { value: 'point', label: '點模式' },
                      { value: 'vertical-line', label: '垂直線模式' },
                      { value: 'area', label: '區域模式' }
                    ]}
                  />
                  
                  <ToggleControl
                    label="顯示十字線"
                    checked={showCrosshair}
                    onChange={setShowCrosshair}
                    description="在 tooltip 中顯示十字定位線"
                  />
                </>
              )}
            </ControlGroup>
          </div>
          </ModernControlPanel>
        </div>

        {/* 主要內容區域 - 3/4 width */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* 圖表展示 */}
          <ChartContainer
            title="圖表預覽"
            subtitle="即時預覽配置效果"
            responsive={true}
            aspectRatio={16 / 9}
            actions={
              <div className="flex items-center gap-2">
                <SwatchIcon className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">區域圖</span>
              </div>
            }
          >
            {({ width, height }) => (
              <>
                <motion.div
                  key={`${selectedDataset}-${stackMode}-${curve}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <AreaChart
                    data={currentData}
                    mapping={mapping}
                    width={width}
                    height={height}
                    stackMode={stackMode}
                    curve={curve}
                    fillOpacity={fillOpacity}
                    strokeWidth={strokeWidth}
                    colorScheme={colorScheme}
                    gradient={gradient}
                    showGrid={showGrid}
                    showDots={showDots}
                    showLegend={showLegend}
                    legendPosition={legendPosition}
                    animate={animate}
                    interactive={interactive}
                    onDataClick={(data, series) => {
                      console.log('Area data clicked:', data, series)
                    }}
                    onDataHover={(data, series) => {
                      console.log('Area data hovered:', data, series)
                    }}
                    // 新增的交互功能
                    enableBrushZoom={enableBrushZoom}
                    onZoom={(domain) => {
                      setZoomDomain(domain)
                      console.log('AreaChart 縮放:', domain)
                    }}
                    onZoomReset={() => {
                      setZoomDomain(null)
                      console.log('AreaChart 縮放重置')
                    }}
                    enableCrosshair={enableCrosshair}
                    crosshairConfig={{
                      showCircle: true,
                      showLines: true,
                      showText: true,
                      formatText: (data) => `日期: ${data.x}\n數值: ${data.y.toFixed(2)}`
                    }}
                    // Tooltip 配置
                    enableTooltip={enableTooltip}
                    tooltipMode={tooltipMode}
                    showCrosshair={showCrosshair}
                    tooltipFormat={(data, x, category) => {
                      if (data.length === 0) return '';
                      
                      const header = `X: ${x}`;
                      const items = data.map(d => 
                        `${category ? `${d.category}: ` : ''}${d.value?.toLocaleString() || d.y?.toLocaleString()}`
                      ).join('\n');
                      
                      return `${header}\n${items}`;
                    }}
                    // Tooltip 回調
                    onTooltipShow={(x, y, content) => {
                      setTooltipPosition({ x, y })
                      setTooltipContent(content)
                      setTooltipVisible(true)
                    }}
                    onTooltipHide={() => {
                      setTooltipVisible(false)
                    }}
                  />
                </motion.div>
                
                {/* 交互狀態顯示 */}
                {zoomDomain && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      <span className="font-medium text-blue-800">縮放狀態</span>
                    </div>
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
                  </div>
                )}
              </>
            )}
          </ChartContainer>

          {/* 狀態顯示 */}
          <StatusDisplay items={statusItems} />

          {/* 數據詳情 */}
          <DataTable
            title="當前資料"
            data={currentData.slice(0, 15)}
            columns={tableColumns}
            maxRows={10}
            showIndex
          />

          {/* 代碼範例 */}
          <CodeExample
            title="使用範例"
            language="tsx"
            code={`import { AreaChart } from '@registry/components/basic/area-chart'

const data = [
  { date: '2023-01', revenue: 120000, category: '營收' },
  { date: '2023-01', expenses: 80000, category: '支出' },
  { date: '2023-02', revenue: 135000, category: '營收' },
  { date: '2023-02', expenses: 85000, category: '支出' }
  // ... more data
]

<AreaChart
  data={data}
  mapping={{ x: '${mapping.x}', y: '${mapping.y}', category: '${mapping.category}' }}
  width={800}
  height={400}
  stackMode="${stackMode}"
  curve="${curve}"
  fillOpacity={${fillOpacity}}
  strokeWidth={${strokeWidth}}
  colorScheme="${colorScheme}"
  gradient={${gradient}}
  showGrid={${showGrid}}
  showDots={${showDots}}
  showLegend={${showLegend}}
  legendPosition="${legendPosition}"
  animate={${animate}}
  interactive={${interactive}}
  enableBrushZoom={${enableBrushZoom}}
  enableCrosshair={${enableCrosshair}}
  onDataClick={(data, series) => console.log('Clicked:', data, series)}
  onZoom={(domain) => console.log('Zoom:', domain)}
/>`}
          />

          {/* 功能說明 */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full" />
              <h3 className="text-xl font-semibold text-gray-800">AreaChart 功能特點</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">核心功能</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    多種堆疊模式（無堆疊、累積、百分比）
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    豐富的曲線插值選項
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    漸變填充和透明度控制
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    靈活的圖例配置
                  </li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">交互特性</h4>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    筆刷縮放功能
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-500 rounded-full" />
                    十字游標數據追踪
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    多系列數據支援
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full" />
                    平滑動畫過渡
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tooltip 組件 */}
      <ChartTooltip
        visible={tooltipVisible}
        x={tooltipPosition.x}
        y={tooltipPosition.y}
        content={tooltipContent}
      />
    </DemoPageTemplate>
  )
}