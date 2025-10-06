/**
 * ScatterPlotDemo - 現代化散點圖示例
 * 展示使用新設計系統的完整 Demo 頁面
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ScatterPlot } from '../components/ui'
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
import {
  CogIcon,
  ChartBarSquareIcon,
  SparklesIcon,
  PlayIcon,
  FunnelIcon,
  ChartBarIcon,
  ScaleIcon,
  SquaresPlusIcon,
  PaintBrushIcon
} from '@heroicons/react/24/outline'

// 生成相關性資料
const generateCorrelationData = (points: number = 50, correlation: number = 0.7) => {
  const data = []
  
  for (let i = 0; i < points; i++) {
    // 🔍 修改數據範圍讓軸線配置效果更明顯
    const x = Math.random() * 80 + 10  // 10-90 (遠離原點)
    const noise = (Math.random() - 0.5) * 30
    const y = x * correlation + noise + 30  // 約 30-120 (遠離零點)
    const size = Math.random() * 50 + 10
    const category = ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
    const species = ['setosa', 'versicolor', 'virginica'][Math.floor(Math.random() * 3)]
    
    data.push({
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      size: Math.round(size * 100) / 100,
      category,
      species,  // Added for group functionality
      label: `Point ${i + 1}`
    })
  }
  
  return data
}

// 生成鳶尾花數據集（類似參考文件）
const generateIrisData = () => {
  const species = ['setosa', 'versicolor', 'virginica']
  const data = []
  
  species.forEach((spec, specIndex) => {
    for (let i = 0; i < 50; i++) {
      // 為每個品種生成不同的特徵範圍
      let sepalLength, petalLength
      
      if (spec === 'setosa') {
        sepalLength = 4.5 + Math.random() * 1.5  // 4.5-6.0
        petalLength = 1 + Math.random() * 1.5    // 1.0-2.5
      } else if (spec === 'versicolor') {
        sepalLength = 5.5 + Math.random() * 1.5  // 5.5-7.0
        petalLength = 3 + Math.random() * 2      // 3.0-5.0
      } else {
        sepalLength = 6 + Math.random() * 2      // 6.0-8.0
        petalLength = 4.5 + Math.random() * 2.5  // 4.5-7.0
      }
      
      data.push({
        sepalLength: Math.round(sepalLength * 100) / 100,
        petalLength: Math.round(petalLength * 100) / 100,
        species: spec,
        id: `${spec}-${i + 1}`
      })
    }
  })
  
  return data
}

// 泡泡圖資料
const bubbleData = [
  { gdp: 1000, happiness: 7.5, population: 50, country: 'Norway' },
  { gdp: 2000, happiness: 7.8, population: 80, country: 'Denmark' },
  { gdp: 1500, happiness: 7.2, population: 60, country: 'Switzerland' },
  { gdp: 3000, happiness: 6.9, population: 320, country: 'USA' },
  { gdp: 800, happiness: 6.5, population: 45, country: 'South Korea' },
  { gdp: 1200, happiness: 7.0, population: 67, country: 'UK' },
  { gdp: 2500, happiness: 6.8, population: 83, country: 'Germany' },
  { gdp: 1800, happiness: 6.4, population: 127, country: 'Japan' },
  { gdp: 500, happiness: 5.8, population: 1400, country: 'China' },
  { gdp: 400, happiness: 4.2, population: 1380, country: 'India' },
]

export default function ScatterPlotDemo() {
  // 數據集狀態
  const [selectedDataset, setSelectedDataset] = useState<'correlation' | 'iris' | 'bubble'>('correlation')
  const [correlationData] = useState(generateCorrelationData())
  const [irisData] = useState(generateIrisData())
  
  // 圖表配置
  const [radius, setRadius] = useState(6)
  const [opacity, setOpacity] = useState(0.7)
  
  // 視覺效果
  const [showTrendline, setShowTrendline] = useState(false)
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)
  const [showTooltip, setShowTooltip] = useState(true)
  
  // 軸線配置（新增的統一軸線系統選項）
  const [showGrid, setShowGrid] = useState(false)
  const [xTickCount, setXTickCount] = useState(5)
  const [yTickCount, setYTickCount] = useState(5)
  
  // 新增：進階軸線配置
  const [includeOrigin, setIncludeOrigin] = useState(false)
  const [beginAtZero, setBeginAtZero] = useState(false)
  const [xAxisNice, setXAxisNice] = useState(true)
  const [yAxisNice, setYAxisNice] = useState(true)
  const [xAxisPadding, setXAxisPadding] = useState(0.05)
  const [yAxisPadding, setYAxisPadding] = useState(0.05)
  
  // 新增：軸線外觀配置
  const [axisIntersection, setAxisIntersection] = useState(true)
  const [tickSizeOuter, setTickSizeOuter] = useState(6)
  
  // 交互功能
  const [enableBrushZoom, setEnableBrushZoom] = useState(false)
  const [brushDirection, setBrushDirection] = useState<'x' | 'y' | 'xy'>('xy')
  const [enableCrosshair, setEnableCrosshair] = useState(false)
  const [enableDropShadow, setEnableDropShadow] = useState(false)
  const [enableGlowEffect, setEnableGlowEffect] = useState(false)
  
  // 群組功能
  const [enableGroupHighlight, setEnableGroupHighlight] = useState(false)
  const [enableGroupFilter, setEnableGroupFilter] = useState(false)
  const [showGroupLegend, setShowGroupLegend] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null)
  
  // 交互狀態
  const [zoomDomain, setZoomDomain] = useState<{ x?: [any, any]; y?: [any, any] } | null>(null)
  const [crosshairData, setCrosshairData] = useState<any>(null)
  
  // 邊距設定移除，使用系統預設

  // 獲取當前數據集
  const getCurrentData = () => {
    switch (selectedDataset) {
      case 'iris': return irisData
      case 'bubble': return bubbleData
      default: return correlationData
    }
  }
  
  const getCurrentConfig = () => {
    switch (selectedDataset) {
      case 'iris': 
        return { xAccessor: 'sepalLength', yAccessor: 'petalLength', colorAccessor: 'species' }
      case 'bubble':
        return { xAccessor: 'gdp', yAccessor: 'happiness', sizeAccessor: 'population', colorAccessor: 'country' }
      default:
        return { xAccessor: 'x', yAccessor: 'y', colorAccessor: 'category' }
    }
  }

  const currentData = getCurrentData()
  const currentConfig = getCurrentConfig()
  
  // 調試：檢查數據
  console.log('🧪 ScatterPlotDemo data:', currentData?.length, currentConfig);
  
  // 狀態顯示數據
  const statusItems = [
    { label: '數據集', value: selectedDataset === 'correlation' ? '相關性數據' : selectedDataset === 'iris' ? '鳶尾花數據' : 'GDP-幸福指數' },
    { label: '數據點數', value: currentData.length },
    { label: '圖表尺寸', value: '800 x 400', color: '#6b7280' },
    { label: '點大小', value: radius },
    { label: '軸線配置', value: includeOrigin ? '包含原點' : beginAtZero ? '從零開始' : '自動範圍', color: '#059669' },
    { label: '動畫', value: animate ? '開啟' : '關閉', color: animate ? '#10b981' : '#6b7280' }
  ]

  // 數據表格列定義
  const getTableColumns = (): DataTableColumn[] => {
    const config = getCurrentConfig()
    const columns: DataTableColumn[] = [
      { key: config.xAccessor as string, title: config.xAccessor as string, sortable: true, formatter: (value) => typeof value === 'number' ? value.toFixed(2) : value },
      { key: config.yAccessor as string, title: config.yAccessor as string, sortable: true, formatter: (value) => typeof value === 'number' ? value.toFixed(2) : value, align: 'right' }
    ]
    
    if (config.colorAccessor) {
      columns.push({ key: config.colorAccessor as string, title: config.colorAccessor as string, sortable: true })
    }
    
    if (config.sizeAccessor) {
      columns.push({ key: config.sizeAccessor as string, title: config.sizeAccessor as string, sortable: true, formatter: (value) => value.toLocaleString(), align: 'right' })
    }
    
    return columns
  }

  return (
    <DemoPageTemplate
      title="ScatterPlot Demo"
      description="現代化散點圖組件展示 - 支援群組功能、交互縮放和多種視覺效果"
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
            <ControlGroup title="基本設定" icon={<CogIcon className="w-4 h-4" />} cols={1}>
              <SelectControl
                label="數據集"
                value={selectedDataset}
                onChange={setSelectedDataset}
                options={[
                  { value: 'correlation', label: '相關性數據' },
                  { value: 'iris', label: '鳶尾花數據' },
                  { value: 'bubble', label: 'GDP-幸福指數' }
                ]}
              />
              
              <RangeSlider
                label="點大小"
                value={radius}
                min={2}
                max={15}
                step={1}
                onChange={setRadius}
                suffix="px"
              />
              
              <RangeSlider
                label="透明度"
                value={opacity}
                min={0.1}
                max={1}
                step={0.1}
                onChange={setOpacity}
              />
            </ControlGroup>



            {/* 基本功能 */}
            <ControlGroup title="基本功能" icon={<FunnelIcon className="w-4 h-4" />} cols={1}>
              <ToggleControl
                label="動畫效果"
                checked={animate}
                onChange={setAnimate}
                description="圖表進入和更新時的動畫效果"
              />
              
              <ToggleControl
                label="互動功能"
                checked={interactive}
                onChange={setInteractive}
                description="鼠標懸停和點擊交互"
              />
              
              <ToggleControl
                label="顯示提示"
                checked={showTooltip}
                onChange={setShowTooltip}
                description="懸停時顯示數據詳情"
              />
              
              <ToggleControl
                label="顯示趨勢線"
                checked={showTrendline}
                onChange={setShowTrendline}
                description="顯示數據趨勢線"
              />
              
              <ToggleControl
                label="顯示網格"
                checked={showGrid}
                onChange={setShowGrid}
                description="顯示軸線網格線"
              />
            </ControlGroup>

            {/* 軸線配置 */}
            <ControlGroup title="軸線設定" icon={<ChartBarIcon className="w-4 h-4" />} cols={1}>
              <RangeSlider
                label="X軸刻度數量"
                value={xTickCount}
                min={3}
                max={10}
                step={1}
                onChange={setXTickCount}
                suffix="個"
              />
              
              <RangeSlider
                label="Y軸刻度數量"
                value={yTickCount}
                min={3}
                max={10}
                step={1}
                onChange={setYTickCount}
                suffix="個"
              />
            </ControlGroup>

            {/* 新增：進階軸線配置 */}
            <ControlGroup title="進階軸線" icon={<ScaleIcon className="w-4 h-4" />} cols={1}>
              <ToggleControl
                label="包含原點"
                checked={includeOrigin}
                onChange={setIncludeOrigin}
                description="軸線範圍包含 (0,0) 點"
              />
              
              <ToggleControl
                label="從零開始"
                checked={beginAtZero}
                onChange={setBeginAtZero}
                description="數值軸從零開始"
              />
              
              <ToggleControl
                label="X軸美化刻度"
                checked={xAxisNice}
                onChange={setXAxisNice}
                description="使用 D3 nice() 產生友好刻度"
              />
              
              <ToggleControl
                label="Y軸美化刻度"
                checked={yAxisNice}
                onChange={setYAxisNice}
                description="使用 D3 nice() 產生友好刻度"
              />
              
              <RangeSlider
                label="X軸邊距"
                value={xAxisPadding}
                min={0}
                max={0.2}
                step={0.01}
                onChange={setXAxisPadding}
                suffix="%"
                description="預留空間避免數據點貼邊"
              />
              
              <RangeSlider
                label="Y軸邊距"
                value={yAxisPadding}
                min={0}
                max={0.2}
                step={0.01}
                onChange={setYAxisPadding}
                suffix="%"
                description="預留空間避免數據點貼邊"
              />
            </ControlGroup>

            {/* 新增：軸線外觀 */}
            <ControlGroup title="軸線外觀" icon={<SquaresPlusIcon className="w-4 h-4" />} cols={1}>
              <ToggleControl
                label="軸線相交"
                checked={axisIntersection}
                onChange={setAxisIntersection}
                description="X軸與Y軸在原點形成完整L型相交"
              />
              
              <RangeSlider
                label="軸線延伸長度"
                value={tickSizeOuter}
                min={0}
                max={10}
                step={1}
                onChange={setTickSizeOuter}
                suffix="px"
                description="調整軸線在數據範圍外的延伸長度"
              />
            </ControlGroup>

            {/* 交互功能 */}
            <ControlGroup title="交互功能" icon={<FunnelIcon className="w-4 h-4" />} cols={1}>
              <ToggleControl
                label="筆刷縮放"
                checked={enableBrushZoom}
                onChange={setEnableBrushZoom}
                description="拖拽選取區域進行縮放"
              />
              
              <SelectControl
                label="縮放方向"
                value={brushDirection}
                onChange={(value) => setBrushDirection(value as 'x' | 'y' | 'xy')}
                options={[
                  { value: 'x', label: 'X 軸' },
                  { value: 'y', label: 'Y 軸' },
                  { value: 'xy', label: 'XY 雙軸' }
                ]}
              />
              
              <ToggleControl
                label="十字游標"
                checked={enableCrosshair}
                onChange={setEnableCrosshair}
                description="顯示數據點詳細信息"
              />
              
              <ToggleControl
                label="陰影效果"
                checked={enableDropShadow}
                onChange={setEnableDropShadow}
                description="為數據點添加陰影"
              />
              
              <ToggleControl
                label="光暈效果"
                checked={enableGlowEffect}
                onChange={setEnableGlowEffect}
                description="為數據點添加光暈"
              />
            </ControlGroup>

            {/* 群組功能 */}
            <ControlGroup title="群組功能" icon={<PaintBrushIcon className="w-4 h-4" />} cols={1}>
              <ToggleControl
                label="群組高亮"
                checked={enableGroupHighlight}
                onChange={setEnableGroupHighlight}
                description="懸停時高亮同群組數據點"
              />
              
              <ToggleControl
                label="群組篩選"
                checked={enableGroupFilter}
                onChange={setEnableGroupFilter}
                description="點擊圖例篩選特定群組"
              />
              
              <ToggleControl
                label="顯示圖例"
                checked={showGroupLegend}
                onChange={setShowGroupLegend}
                description="顯示群組顏色圖例"
              />
            </ControlGroup>
            
            {/* 群組狀態顯示 */}
            {(selectedGroup || hoveredGroup) && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4 border border-emerald-100">
                <h4 className="font-semibold text-emerald-800 mb-2">群組狀態</h4>
                <div className="space-y-2 text-sm">
                  {selectedGroup && (
                    <div className="text-emerald-700">
                      <strong>選中群組:</strong> {String(selectedGroup)}
                    </div>
                  )}
                  {hoveredGroup && (
                    <div className="text-teal-700">
                      <strong>懸停群組:</strong> {String(hoveredGroup)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </ModernControlPanel>
        </div>

        {/* 主要內容區域 - 右側 3/4 */}
        <div className="lg:col-span-3 space-y-8">
          {/* 圖表展示 */}
        <ChartContainer
          title="圖表預覽"
          subtitle="即時預覽配置效果"
          actions={
            <div className="flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-600">散點圖</span>
              {enableBrushZoom && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">{brushDirection} 軸縮放</span>}
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
                    <strong>縮放範圍:</strong> 
                    {zoomDomain.x && ` X: ${zoomDomain.x[0]?.toFixed(2)} - ${zoomDomain.x[1]?.toFixed(2)}`}
                    {zoomDomain.y && ` Y: ${zoomDomain.y[0]?.toFixed(2)} - ${zoomDomain.y[1]?.toFixed(2)}`}
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
          
          <motion.div
            key={`${selectedDataset}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ScatterPlot
              data={currentData}
              xAccessor={currentConfig.xAccessor}
              yAccessor={currentConfig.yAccessor}
              colorAccessor={currentConfig.colorAccessor}
              sizeAccessor={currentConfig.sizeAccessor}
              width={800}
              height={400}
              pointRadius={radius}
              opacity={opacity}
              showTrendline={showTrendline}
              animate={animate}
              interactive={interactive}
              showTooltip={showTooltip}
              colors={selectedDataset === 'iris' ? ['#440154ff', '#21908dff', '#fde725ff'] : ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']}
              
              // 🔧 基本軸線系統配置
              showGrid={showGrid}
              showXAxis={true}
              showYAxis={true}
              xTickCount={xTickCount}
              yTickCount={yTickCount}
              xAxisLabel="X Axis"
              yAxisLabel="Y Axis"
              
              // ⚖️ 新增：統一軸線配置系統
              includeOrigin={includeOrigin}
              beginAtZero={beginAtZero}
              xAxis={{
                nice: xAxisNice,
                padding: xAxisPadding > 0 ? xAxisPadding : undefined
              }}
              yAxis={{
                nice: yAxisNice,
                padding: yAxisPadding > 0 ? yAxisPadding : undefined
              }}
              
              // 📐 新增：軸線外觀配置  
              axisConfig={{
                intersection: false, // 暫時停用複雜的相交邏輯
                tickSizeOuter: axisIntersection ? tickSizeOuter : 0,
                dynamicMargin: false
              }}
              
              onDataClick={(data) => console.log('Clicked:', data)}
              onDataHover={(data) => console.log('Hovered:', data)}
              onError={(error) => console.error('ScatterPlot Error:', error)}
              
              // 基本交互功能
              enableBrushZoom={enableBrushZoom}
              enableCrosshair={enableCrosshair}
            />
          </motion.div>
          
          <StatusDisplay items={statusItems} />
        </ChartContainer>

          {/* 數據詳情 */}
        <DataTable
          title="數據詳情"
          data={currentData}
          columns={getTableColumns()}
          maxRows={8}
          showIndex
        />

          {/* 代碼範例 */}
        <CodeExample
          title="使用範例"
          language="tsx"
          code={`import { ScatterPlot } from '@registry/components/statistical/scatter-plot'
import { ChartContainer } from '@registry/components'

// ${selectedDataset === 'correlation' ? '相關性數據' : selectedDataset === 'iris' ? '鳶尾花數據' : 'GDP-幸福指數數據'}
const data = [
  { ${currentConfig.xAccessor}: ${currentData[0]?.[currentConfig.xAccessor]}, ${currentConfig.yAccessor}: ${currentData[0]?.[currentConfig.yAccessor]}${currentConfig.colorAccessor ? `, ${currentConfig.colorAccessor}: '${currentData[0]?.[currentConfig.colorAccessor]}'` : ''}${currentConfig.sizeAccessor ? `, ${currentConfig.sizeAccessor}: ${currentData[0]?.[currentConfig.sizeAccessor]}` : ''} },
  // ... more data
]

<ChartContainer>
  <ScatterPlot
    data={data}
    xAccessor="${currentConfig.xAccessor}"
    yAccessor="${currentConfig.yAccessor}"${currentConfig.colorAccessor ? `\n    colorAccessor="${currentConfig.colorAccessor}"` : ''}${currentConfig.sizeAccessor ? `\n    sizeAccessor="${currentConfig.sizeAccessor}"` : ''}
    width={800}
    height={400}
    radius={${radius}}
    opacity={${opacity}}
    animate={${animate}}
    interactive={${interactive}}
    showTooltip={${showTooltip}}
    showTrendline={${showTrendline}}${showGrid ? `\n    showGrid={${showGrid}}` : ''}${xTickCount !== 5 ? `\n    xTickCount={${xTickCount}}` : ''}${yTickCount !== 5 ? `\n    yTickCount={${yTickCount}}` : ''}${includeOrigin ? `\n    includeOrigin={${includeOrigin}}` : ''}${beginAtZero ? `\n    beginAtZero={${beginAtZero}}` : ''}${(!xAxisNice || !yAxisNice || xAxisPadding > 0.05 || yAxisPadding > 0.05) ? `\n    xAxis={{ nice: ${xAxisNice}${xAxisPadding > 0.05 ? `, padding: ${xAxisPadding}` : ''} }}\n    yAxis={{ nice: ${yAxisNice}${yAxisPadding > 0.05 ? `, padding: ${yAxisPadding}` : ''} }}` : ''}${enableBrushZoom ? `\n    enableBrushZoom={${enableBrushZoom}}\n    brushZoomConfig={{ direction: '${brushDirection}' }}` : ''}${enableCrosshair ? `\n    enableCrosshair={${enableCrosshair}}` : ''}
    onDataClick={(data) => console.log('Clicked:', data)}
    onDataHover={(data) => console.log('Hovered:', data)}
  />
</ChartContainer>`}
        />
        </div>
      </div>

      {/* 功能說明 */}
      <ContentSection delay={0.4}>
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full" />
            <h3 className="text-xl font-semibold text-gray-800">ScatterPlot 功能特點</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">核心功能</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  支援多種數據集和映射模式
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full" />
                  智能群組高亮和篩選功能
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  筆刷縮放和十字游標交互
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  趨勢線和相關性分析
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">交互特性</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  多維度泡泡圖展示
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  視覺效果：陰影和光暈
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  響應式設計和動畫過渡
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  豐富的事件回調支援
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* 軸線配置示例 */}
      <ContentSection title="軸線配置示例" delay={0.5}>
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full" />
            <h3 className="text-xl font-semibold text-gray-800">統一軸線配置系統</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-emerald-800">Level 1: 簡單模式 (90% 用戶)</h4>
              <p className="text-sm text-emerald-700 mb-3">使用快捷配置，適用於大多數常見需求</p>
              <CodeExample
                language="tsx"
                code={`// 散點圖包含原點
<ScatterPlot includeOrigin={true} />

// 從零開始顯示  
<ScatterPlot beginAtZero={true} />

// 組合使用
<ScatterPlot 
  includeOrigin={true}
  beginAtZero={false}
/>`}
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-emerald-800">Level 2: 標準模式 (8% 用戶)</h4>
              <p className="text-sm text-emerald-700 mb-3">X 和 Y 軸需要不同配置時</p>
              <CodeExample
                language="tsx"
                code={`// X 軸自動，Y 軸包含原點
<ScatterPlot 
  xAxis={{ domain: 'auto' }}
  yAxis={{ includeOrigin: true }}
/>

// 調整軸線邊距和刻度
<ScatterPlot
  xAxis={{ padding: 0.1, nice: true }}
  yAxis={{ padding: 0.05, nice: false }}
/>`}
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-emerald-800">Level 3: 進階模式 (2% 用戶)</h4>
              <p className="text-sm text-emerald-700 mb-3">完全自定義域值範圍</p>
              <CodeExample
                language="tsx"
                code={`// 固定範圍
<ScatterPlot 
  xAxis={{ domain: [0, 100] }}
  yAxis={{ domain: [-50, 50] }}
/>

// 自定義邏輯
<ScatterPlot
  yAxis={{
    domain: (data) => {
      const values = data.map(d => d.y);
      const extent = d3.extent(values);
      return [extent[0] * 0.9, extent[1] * 1.1];
    }
  }}
/>`}
              />
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-emerald-100 rounded-lg">
            <h4 className="font-semibold text-emerald-800 mb-2">最佳實踐提示</h4>
            <ul className="text-sm text-emerald-700 space-y-1">
              <li>• <strong>散點圖</strong>：通常不需要 beginAtZero，重點在數據相關性</li>
              <li>• <strong>包含原點</strong>：當需要觀察數據相對於 (0,0) 的分布時使用</li>
              <li>• <strong>邊距設置</strong>：防止數據點貼邊，改善視覺效果</li>
              <li>• <strong>nice 刻度</strong>：使用 D3 的 nice() 產生更友好的刻度值</li>
            </ul>
          </div>
        </div>
      </ContentSection>
    </DemoPageTemplate>
  )
}