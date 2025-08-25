import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart } from '@registry/components/basic/bar-chart'
console.log('🔍 BarChart imported:', BarChart)
import { LineChart } from '@registry/components/basic/line-chart'
import { AreaChart } from '@registry/components/basic/area-chart'
import { ScatterPlot } from '@registry/components/statistical/scatter-plot'
import { datasetOptions, colorSchemes } from '../data/sample-data'
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
  CodeExample,
} from '../components/ui'
import { DevicePhoneMobileIcon, ComputerDesktopIcon, DeviceTabletIcon } from '@heroicons/react/24/outline'

const CHART_COMPONENTS = {
  bar: BarChart,
  line: LineChart,
  area: AreaChart,
  scatter: ScatterPlot,
} as const

type ChartType = keyof typeof CHART_COMPONENTS

export default function ResponsiveChartDemo() {
  // 基本設定
  const [selectedChart, setSelectedChart] = useState<ChartType>('bar')
  const [selectedDataset, setSelectedDataset] = useState('basic')
  const [selectedColor, setSelectedColor] = useState('default')
  
  // 響應式設定
  const [aspect, setAspect] = useState(16/9)
  const [minWidth, setMinWidth] = useState(300)
  const [maxWidth, setMaxWidth] = useState(1200)
  const [minHeight, setMinHeight] = useState(200)
  
  // 容器寬度模擬
  const [containerWidth, setContainerWidth] = useState(75) // 百分比
  
  const currentDataset = datasetOptions.find(d => d.value === selectedDataset)!
  const ChartComponent = CHART_COMPONENTS[selectedChart]
  console.log('🔍 Selected ChartComponent:', ChartComponent, selectedChart)

  // 預設設備尺寸
  const devicePresets = {
    mobile: { width: 30, label: '手機', icon: DevicePhoneMobileIcon },
    tablet: { width: 60, label: '平板', icon: DeviceTabletIcon },
    desktop: { width: 100, label: '桌面', icon: ComputerDesktopIcon },
  }

  // 狀態顯示數據
  const statusItems = [
    { label: '圖表類型', value: selectedChart.toUpperCase() },
    { label: '容器寬度', value: `${containerWidth}%` },
    { label: '寬高比', value: `${aspect.toFixed(2)}:1` },
    { label: '最小寬度', value: `${minWidth}px` },
    { label: '最大寬度', value: `${maxWidth}px` }
  ]

  const codeExample = `import { ${selectedChart.charAt(0).toUpperCase() + selectedChart.slice(1)}Chart } from '@registry/components/...'

<${ChartComponent.name}
  data={data}
  xKey="${currentDataset.xKey}"
  yKey="${currentDataset.yKey}"
  responsive={true}
  aspect={${aspect}}
  minWidth={${minWidth}}
  maxWidth={${maxWidth}}
  minHeight={${minHeight}}
  colors={${JSON.stringify(colorSchemes[selectedColor as keyof typeof colorSchemes])}}
/>`

  return (
    <DemoPageTemplate
      title="響應式圖表系統"
      description="測試圖表在不同容器尺寸下的響應式行為，模擬移動端、平板和桌面環境"
    >
      {/* 控制面板 */}
      <ContentSection>
        <ModernControlPanel title="響應式控制面板">
          <div className="space-y-6">
            {/* 圖表選擇 */}
            <ControlGroup title="圖表選擇" icon="📊" cols={2}>
              <SelectControl
                label="圖表類型"
                value={selectedChart}
                onChange={(value) => setSelectedChart(value as ChartType)}
                options={Object.keys(CHART_COMPONENTS).map(type => ({
                  value: type,
                  label: type.charAt(0).toUpperCase() + type.slice(1)
                }))}
              />
              
              <SelectControl
                label="數據集"
                value={selectedDataset}
                onChange={setSelectedDataset}
                options={datasetOptions.map(opt => ({ value: opt.value, label: opt.label }))}
              />
            </ControlGroup>

            {/* 設備預設 */}
            <ControlGroup title="設備預設" icon="📱" cols={3}>
              {Object.entries(devicePresets).map(([key, preset]) => {
                const IconComponent = preset.icon
                return (
                  <button
                    key={key}
                    onClick={() => {
                      console.log('📱 Device preset clicked:', key, preset.width)
                      setContainerWidth(preset.width)
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all ${
                      containerWidth === preset.width
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                    <span className="text-sm font-medium">{preset.label}</span>
                    <span className="text-xs text-gray-500">{preset.width}%</span>
                  </button>
                )
              })}
            </ControlGroup>

            {/* 容器寬度調整 */}
            <ControlGroup title="容器寬度" icon="📏" cols={1}>
              <RangeSlider
                label="寬度百分比"
                value={containerWidth}
                min={20}
                max={100}
                step={5}
                onChange={(value) => {
                  console.log('🎛️ Container width slider changed:', value)
                  setContainerWidth(value)
                }}
                suffix="%"
              />
            </ControlGroup>

            {/* 響應式參數 */}
            <ControlGroup title="響應式參數" icon="⚙️" cols={2}>
              <RangeSlider
                label="寬高比"
                value={aspect}
                min={1}
                max={3}
                step={0.1}
                onChange={setAspect}
                suffix=":1"
              />
              
              <RangeSlider
                label="最小寬度"
                value={minWidth}
                min={200}
                max={500}
                step={25}
                onChange={setMinWidth}
                suffix="px"
              />
            </ControlGroup>

            <ControlGroup title="尺寸限制" icon="📐" cols={2}>
              <RangeSlider
                label="最大寬度"
                value={maxWidth}
                min={800}
                max={2000}
                step={100}
                onChange={setMaxWidth}
                suffix="px"
              />
              
              <RangeSlider
                label="最小高度"
                value={minHeight}
                min={150}
                max={400}
                step={25}
                onChange={setMinHeight}
                suffix="px"
              />
            </ControlGroup>
          </div>
        </ModernControlPanel>
      </ContentSection>

      {/* 響應式圖表展示 */}
      <ContentSection delay={0.1}>
        <ChartContainer
          title="響應式圖表測試"
          subtitle="調整容器寬度觀察圖表響應式行為"
        >
          {/* 可調整寬度的容器 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>容器寬度: {containerWidth}%</span>
              <span>當前設備: {
                containerWidth <= 35 ? '手機' : 
                containerWidth <= 70 ? '平板' : '桌面'
              }</span>
            </div>
            
            <div 
              className="transition-all duration-500 border-2 border-dashed border-gray-300 rounded-lg p-4"
              style={{ width: `${containerWidth}%` }}
              ref={(el) => {
                if (el) {
                  console.log('📦 Container div dimensions:', {
                    containerWidth: `${containerWidth}%`,
                    actualWidth: el.getBoundingClientRect().width,
                    actualHeight: el.getBoundingClientRect().height
                  })
                  
                  // 查找圖表 SVG 並記錄其尺寸
                  setTimeout(() => {
                    const svg = el.querySelector('svg')
                    if (svg) {
                      const svgRect = svg.getBoundingClientRect()
                      console.log('📊 Chart SVG dimensions:', {
                        svgWidth: svg.getAttribute('width'),
                        svgHeight: svg.getAttribute('height'),
                        actualSVGWidth: svgRect.width,
                        actualSVGHeight: svgRect.height,
                        overflowing: svgRect.width > el.getBoundingClientRect().width,
                        svgClasses: svg.className.baseVal || svg.className,
                        svgId: svg.id,
                        svgParent: svg.parentElement?.className
                      })
                      
                      // 檢查 SVG 是否有任何識別標記
                      const groups = svg.querySelectorAll('g')
                      console.log('📊 SVG structure:', {
                        totalGroups: groups.length,
                        groupClasses: Array.from(groups).map(g => g.className.baseVal || g.className)
                      })
                    } else {
                      console.log('❌ No SVG found in container')
                    }
                  }, 100)
                }
              }}
            >
              {/* Direct test with BarChart */}
              <BarChart
                key={`${selectedChart}-${aspect}`}
                data={currentDataset.data}
                xKey={currentDataset.xKey}
                yKey={currentDataset.yKey}
                width={undefined}  // 明確設置為 undefined 來觸發默認值
                height={undefined}
                responsive={true}
                aspect={aspect}
                minWidth={minWidth}
                maxWidth={maxWidth}
                minHeight={minHeight}
                containerWidth={containerWidth}
                colors={colorSchemes[selectedColor as keyof typeof colorSchemes]}
                animate={true}
                interactive={true}
                showTooltip={true}
              />
            </div>
          </div>
          
          <StatusDisplay items={statusItems} />
        </ChartContainer>
      </ContentSection>

      {/* 比較展示 */}
      <ContentSection delay={0.2}>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-6">固定 vs 響應式比較</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 固定尺寸 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <h4 className="font-semibold">固定尺寸模式</h4>
              </div>
              
              <div className="border border-red-200 rounded-lg p-4 overflow-x-auto">
                <ChartComponent
                  data={currentDataset.data.slice(0, 6)}
                  xKey={currentDataset.xKey}
                  yKey={currentDataset.yKey}
                  width={400}
                  height={250}
                  colors={['#ef4444', '#f87171', '#fca5a5']}
                  animate={false}
                />
              </div>
              
              <div className="text-sm text-gray-600">
                <p>• 固定寬度 400px</p>
                <p>• 容器變小時會出現滾動條</p>
                <p>• 不適應不同設備尺寸</p>
              </div>
            </div>

            {/* 響應式 */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <h4 className="font-semibold">響應式模式</h4>
              </div>
              
              <div className="border border-green-200 rounded-lg p-4">
                <ChartComponent
                  data={currentDataset.data.slice(0, 6)}
                  xKey={currentDataset.xKey}
                  yKey={currentDataset.yKey}
                  responsive={true}
                  aspect={1.6}
                  minWidth={250}
                  maxWidth={500}
                  colors={['#10b981', '#34d399', '#6ee7b7']}
                  animate={false}
                />
              </div>
              
              <div className="text-sm text-gray-600">
                <p>• 自動適應容器寬度</p>
                <p>• 保持設定的寬高比</p>
                <p>• 適合各種設備和佈局</p>
              </div>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* 代碼範例 */}
      <ContentSection delay={0.3}>
        <CodeExample
          title="響應式圖表使用範例"
          language="tsx"
          code={codeExample}
        />
      </ContentSection>

      {/* 最佳實踐 */}
      <ContentSection delay={0.4}>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">響應式圖表最佳實踐</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">設計原則</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  設定合理的寬高比（1.2-2.5:1）
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  定義最小和最大尺寸限制
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  考慮不同設備的顯示效果
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  保持文字和元素的可讀性
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">技術建議</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  使用 ResizeObserver 監聽容器變化
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  添加適當的防抖延遲避免過度更新
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  在 CSS Grid/Flexbox 佈局中測試
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full" />
                  考慮 SVG viewBox 作為補充方案
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ContentSection>
    </DemoPageTemplate>
  )
}