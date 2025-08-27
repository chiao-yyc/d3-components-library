/**
 * ScatterPlotDemo - 現代化散點圖示例
 * 展示使用新設計系統的完整 Demo 頁面
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ScatterPlot } from '@registry/components/statistical/scatter-plot'
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
import { CogIcon, ChartBarSquareIcon, SparklesIcon, PlayIcon } from '@heroicons/react/24/outline'

// 生成相關性資料
const generateCorrelationData = (points: number = 50, correlation: number = 0.7) => {
  const data = []
  
  for (let i = 0; i < points; i++) {
    const x = Math.random() * 100
    const noise = (Math.random() - 0.5) * 30
    const y = x * correlation + noise + 20
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
  const [chartWidth, setChartWidth] = useState(800)
  const [chartHeight, setChartHeight] = useState(400)
  const [radius, setRadius] = useState(6)
  const [opacity, setOpacity] = useState(0.7)
  
  // 視覺效果
  const [showTrendline, setShowTrendline] = useState(false)
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)
  const [showTooltip, setShowTooltip] = useState(true)
  
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
        return { xKey: 'sepalLength', yKey: 'petalLength', groupBy: 'species' }
      case 'bubble':
        return { xKey: 'gdp', yKey: 'happiness', sizeKey: 'population', colorKey: 'country' }
      default:
        return { xKey: 'x', yKey: 'y', colorKey: 'category' }
    }
  }

  const currentData = getCurrentData()
  const currentConfig = getCurrentConfig()
  
  // 狀態顯示數據
  const statusItems = [
    { label: '數據集', value: selectedDataset === 'correlation' ? '相關性數據' : selectedDataset === 'iris' ? '鳶尾花數據' : 'GDP-幸福指數' },
    { label: '數據點數', value: currentData.length },
    { label: '圖表尺寸', value: `${chartWidth} × ${chartHeight}` },
    { label: '點大小', value: radius },
    { label: '動畫', value: animate ? '開啟' : '關閉', color: animate ? '#10b981' : '#6b7280' }
  ]

  // 數據表格列定義
  const getTableColumns = (): DataTableColumn[] => {
    const config = getCurrentConfig()
    const columns: DataTableColumn[] = [
      { key: config.xKey, title: config.xKey, sortable: true, formatter: (value) => typeof value === 'number' ? value.toFixed(2) : value },
      { key: config.yKey, title: config.yKey, sortable: true, formatter: (value) => typeof value === 'number' ? value.toFixed(2) : value, align: 'right' }
    ]
    
    if (config.groupBy) {
      columns.push({ key: config.groupBy, title: config.groupBy, sortable: true })
    }
    
    if (config.sizeKey) {
      columns.push({ key: config.sizeKey, title: config.sizeKey, sortable: true, formatter: (value) => value.toLocaleString(), align: 'right' })
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
            <ControlGroup title="基本設定" icon="⚙️" cols={1}>
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

            {/* 尺寸設定 */}
            <ControlGroup title="尺寸配置" icon="📏" cols={1}>
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


            {/* 基本功能 */}
            <ControlGroup title="基本功能" icon="🎯" cols={1}>
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
            </ControlGroup>

            {/* 交互功能 */}
            <ControlGroup title="交互功能" icon="🎯" cols={1}>
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
            <ControlGroup title="群組功能" icon="🎨" cols={1}>
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
          
          <div className="flex justify-center">
            <motion.div
              key={`${chartWidth}-${chartHeight}-${selectedDataset}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ScatterPlot
                data={currentData}
                xKey={currentConfig.xKey}
                yKey={currentConfig.yKey}
                colorKey={currentConfig.colorKey}
                sizeKey={currentConfig.sizeKey}
                groupBy={currentConfig.groupBy}
                width={chartWidth}
                height={chartHeight}
                radius={radius}
                opacity={opacity}
                showTrendline={showTrendline}
                animate={animate}
                interactive={interactive}
                showTooltip={showTooltip}
                colors={selectedDataset === 'iris' ? ['#440154ff', '#21908dff', '#fde725ff'] : ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6']}
                onDataClick={(data) => console.log('Clicked:', data)}
                onHover={(data) => console.log('Hovered:', data)}
                
                // 交互功能
                enableBrushZoom={enableBrushZoom}
                brushZoomConfig={{
                  direction: brushDirection,
                  resetOnDoubleClick: true
                }}
                onZoom={(domain) => {
                  setZoomDomain(domain)
                  console.log('ScatterPlot 縮放:', domain)
                }}
                onZoomReset={() => {
                  setZoomDomain(null)
                  console.log('ScatterPlot 縮放重置')
                }}
                enableCrosshair={enableCrosshair}
                crosshairConfig={{
                  showCircle: true,
                  showLines: true,
                  showText: true,
                  formatText: (data) => `X: ${data[currentConfig.xKey]?.toFixed?.(2) || data[currentConfig.xKey]}\nY: ${data[currentConfig.yKey]?.toFixed?.(2) || data[currentConfig.yKey]}`
                }}
                enableDropShadow={enableDropShadow}
                enableGlowEffect={enableGlowEffect}
                glowColor="#3b82f6"
                
                // 群組功能
                enableGroupHighlight={enableGroupHighlight && !!currentConfig.groupBy}
                enableGroupFilter={enableGroupFilter && !!currentConfig.groupBy}
                showGroupLegend={showGroupLegend && !!currentConfig.groupBy}
                groupColors={selectedDataset === 'iris' ? ['#440154ff', '#21908dff', '#fde725ff'] : ['#3b82f6', '#ef4444', '#10b981']}
                onGroupSelect={(group, isSelected) => {
                  setSelectedGroup(isSelected ? group : null)
                  console.log('群組選擇:', group, isSelected)
                }}
                onGroupHover={(group) => {
                  setHoveredGroup(group)
                  console.log('群組懸停:', group)
                }}
              />
            </motion.div>
          </div>
          
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

// ${selectedDataset === 'correlation' ? '相關性數據' : selectedDataset === 'iris' ? '鳶尾花數據' : 'GDP-幸福指數數據'}
const data = [
  { ${currentConfig.xKey}: ${currentData[0]?.[currentConfig.xKey]}, ${currentConfig.yKey}: ${currentData[0]?.[currentConfig.yKey]}${currentConfig.groupBy ? `, ${currentConfig.groupBy}: '${currentData[0]?.[currentConfig.groupBy]}'` : ''}${currentConfig.sizeKey ? `, ${currentConfig.sizeKey}: ${currentData[0]?.[currentConfig.sizeKey]}` : ''} },
  // ... more data
]

<ScatterPlot
  data={data}
  xKey="${currentConfig.xKey}"
  yKey="${currentConfig.yKey}"${currentConfig.colorKey ? `\n  colorKey="${currentConfig.colorKey}"` : ''}${currentConfig.sizeKey ? `\n  sizeKey="${currentConfig.sizeKey}"` : ''}${currentConfig.groupBy ? `\n  groupBy="${currentConfig.groupBy}"` : ''}
  width={${chartWidth}}
  height={${chartHeight}}
  radius={${radius}}
  opacity={${opacity}}
  animate={${animate}}
  interactive={${interactive}}
  showTooltip={${showTooltip}}
  showTrendline={${showTrendline}}${currentConfig.groupBy ? `\n  enableGroupHighlight={${enableGroupHighlight}}\n  enableGroupFilter={${enableGroupFilter}}\n  showGroupLegend={${showGroupLegend}}` : ''}${enableBrushZoom ? `\n  enableBrushZoom={${enableBrushZoom}}\n  brushZoomConfig={{ direction: '${brushDirection}' }}` : ''}${enableCrosshair ? `\n  enableCrosshair={${enableCrosshair}}` : ''}
  onDataClick={(data) => console.log('Clicked:', data)}
  onHover={(data) => console.log('Hovered:', data)}
/>`}
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
    </DemoPageTemplate>
  )
}