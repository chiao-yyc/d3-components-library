/**
 * BarChartDemo - 現代化長條圖示例
 * 展示使用新設計系統的完整 Demo 頁面
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart } from '../components/ui'
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
  DataTable,
  CodeExample,
  type DataTableColumn
} from '../components/ui'
import RelatedComponents from '../components/RelatedComponents'
import {
  CogIcon,
  ChartBarIcon,
  PaintBrushIcon,
  PlayIcon,
  FunnelIcon,
  TagIcon,
  ScaleIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline'

export default function BarChartDemo() {
  // 基本狀態
  const [selectedDataset, setSelectedDataset] = useState('basic')
  const [selectedColor, setSelectedColor] = useState('default')
  
  // 響應式設定
  const aspectRatio = 16/9
  
  // 圖表選項
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical')
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)
  const [showTooltip, setShowTooltip] = useState(true)
  const [showLabels, setShowLabels] = useState(false)
  const [labelPosition, setLabelPosition] = useState<'top' | 'center' | 'bottom'>('top')
  
  // 軸線配置（新增的統一軸線系統選項）
  const [showGrid, setShowGrid] = useState(false)
  const [xTickCount, setXTickCount] = useState(5)
  const [yTickCount, setYTickCount] = useState(5)
  
  // 新增：進階軸線配置（針對 BarChart 特性優化）
  const [beginAtZero, setBeginAtZero] = useState(true) // 柱狀圖默認從零開始
  const [yAxisNice, setYAxisNice] = useState(true)
  const [xAxisDomain, setXAxisDomain] = useState<'auto' | 'custom'>('auto')
  const [customXDomain, setCustomXDomain] = useState('')
  
  // 移除 margin 設定，使用系統預設以確保一致性

  const currentDataset = datasetOptions.find(d => d.value === selectedDataset)!

  // 狀態顯示數據
  const statusItems = [
    { label: '數據集', value: currentDataset.label },
    { label: '數據點數', value: currentDataset.data.length },
    { label: '圖表模式', value: '響應式', color: '#10b981' },
    { label: '圖表尺寸', value: `比例 ${aspectRatio.toFixed(2)}:1` },
    { label: '方向', value: orientation === 'vertical' ? '垂直' : '水平' },
    { label: 'Y軸起點', value: beginAtZero ? '從零開始' : '自動範圍', color: '#059669' },
    { label: '動畫', value: animate ? '開啟' : '關閉', color: animate ? '#10b981' : '#6b7280' }
  ]

  // 數據表格列定義
  const tableColumns: DataTableColumn[] = [
    { key: currentDataset.xKey, title: currentDataset.xKey, sortable: true },
    { 
      key: currentDataset.yKey, 
      title: currentDataset.yKey, 
      sortable: true,
      formatter: (value) => value.toLocaleString(),
      align: 'right'
    }
  ]

  return (
    <DemoPageTemplate
      title="BarChart Demo"
      description="現代化長條圖組件展示 - 支援多種配置選項和互動功能"
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
                label="資料集"
                value={selectedDataset}
                onChange={setSelectedDataset}
                options={datasetOptions.map(opt => ({ value: opt.value, label: opt.label }))}
              />
              
              <SelectControl
                label="顏色方案"
                value={selectedColor}
                onChange={setSelectedColor}
                options={Object.keys(colorSchemes).map(scheme => ({
                  value: scheme,
                  label: scheme.charAt(0).toUpperCase() + scheme.slice(1)
                }))}
              />
              
              <SelectControl
                label="方向"
                value={orientation}
                onChange={(value) => setOrientation(value as 'vertical' | 'horizontal')}
                options={[
                  { value: 'vertical', label: '垂直' },
                  { value: 'horizontal', label: '水平' }
                ]}
              />
            </ControlGroup>


            {/* 移除邊距設定控制項，統一使用系統預設 margin 以確保一致性 */}

            {/* 功能開關 */}
            <ControlGroup title="交互功能" icon={<FunnelIcon className="w-4 h-4" />} cols={1}>
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
                label="顯示標籤"
                checked={showLabels}
                onChange={setShowLabels}
                description="在條形上直接顯示數值"
              />
            </ControlGroup>

            {/* 標籤配置 */}
            {showLabels && (
              <ControlGroup title="標籤配置" icon={<TagIcon className="w-4 h-4" />} cols={1}>
                <SelectControl
                  label="標籤位置"
                  value={labelPosition}
                  onChange={(value) => setLabelPosition(value as 'top' | 'center' | 'bottom')}
                  options={[
                    { value: 'top', label: '頂部' },
                    { value: 'center', label: '中央' },
                    { value: 'bottom', label: '底部' }
                  ]}
                />
              </ControlGroup>
            )}

            {/* 軸線配置 */}
            <ControlGroup title="軸線配置" icon={<ChartBarIcon className="w-4 h-4" />} cols={1}>
              <ToggleControl
                label="顯示網格"
                checked={showGrid}
                onChange={setShowGrid}
                description="顯示背景網格線"
              />
              
              <RangeSlider
                label="X 軸刻度數"
                value={xTickCount}
                onChange={setXTickCount}
                min={2}
                max={10}
                step={1}
                description="調整 X 軸刻度標籤數量"
              />
              
              <RangeSlider
                label="Y 軸刻度數"
                value={yTickCount}
                onChange={setYTickCount}
                min={2}
                max={10}
                step={1}
                description="調整 Y 軸刻度標籤數量"
              />
            </ControlGroup>

            {/* 新增：進階軸線配置 */}
            <ControlGroup title="軸線行為" icon={<ScaleIcon className="w-4 h-4" />} cols={1}>
              <ToggleControl
                label="Y軸從零開始"
                checked={beginAtZero}
                onChange={setBeginAtZero}
                description="柱狀圖建議從零開始以正確顯示比例"
              />
              
              <ToggleControl
                label="Y軸美化刻度"
                checked={yAxisNice}
                onChange={setYAxisNice}
                description="使用 D3 nice() 產生友好的 Y 軸刻度"
              />
              
              <SelectControl
                label="X軸域值類型"
                value={xAxisDomain}
                onChange={(value) => setXAxisDomain(value as 'auto' | 'custom')}
                options={[
                  { value: 'auto', label: '自動 (適用類別軸)' },
                  { value: 'custom', label: '自定義域值' }
                ]}
                description="選擇 X 軸的域值計算方式"
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
          subtitle="即時預覽配置效果"
          actions={
            <div className="flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-gray-600">長條圖</span>
            </div>
          }
        >
          <motion.div
            key={`${orientation}-${aspectRatio}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <BarChart
              data={currentDataset.data}
              xKey={currentDataset.xKey}
              yKey={currentDataset.yKey}
              width={800}
              height={400}
              orientation={orientation}
              colors={colorSchemes[selectedColor as keyof typeof colorSchemes]}
              animate={animate}
              interactive={interactive}
              showTooltip={showTooltip}
              showLabels={showLabels}
              labelPosition={labelPosition}
              showGrid={showGrid}
              xTickCount={xTickCount}
              yTickCount={yTickCount}
              
              // ⚖️ 新增：統一軸線配置系統
              beginAtZero={beginAtZero}
              yAxis={{
                nice: yAxisNice
              }}
              xAxis={{
                domain: xAxisDomain === 'auto' ? 'auto' : undefined
              }}
              
              onDataClick={(data) => console.log('Clicked:', data)}
              onHover={(data) => console.log('Hovered:', data)}
            />
          </motion.div>
          
          <StatusDisplay items={statusItems} />
        </ChartContainer>

          {/* 數據詳情 */}
        <DataTable
          title="數據詳情"
          data={currentDataset.data}
          columns={tableColumns}
          maxRows={8}
          showIndex
        />

          {/* 代碼範例 */}
        <CodeExample
          title="使用範例"
          language="tsx"
          code={`import { BarChart } from '../../../registry/components/basic/bar-chart'
import { ChartContainer } from '@registry/components/ui'

const data = [
  { ${currentDataset.xKey}: '${currentDataset.data[0]?.[currentDataset.xKey]}', ${currentDataset.yKey}: ${currentDataset.data[0]?.[currentDataset.yKey]} },
  { ${currentDataset.xKey}: '${currentDataset.data[1]?.[currentDataset.xKey]}', ${currentDataset.yKey}: ${currentDataset.data[1]?.[currentDataset.yKey]} },
  // ... more data
]

// 響應式模式 - 自動適應容器大小
<ChartContainer
  responsive={true}
  aspectRatio={${aspectRatio}}
>
  {({ width, height }) => (
    <BarChart
      data={data}
      xKey="${currentDataset.xKey}"
      yKey="${currentDataset.yKey}"
      width={width}
      height={height}
      orientation="${orientation}"
      colors={${JSON.stringify(colorSchemes[selectedColor as keyof typeof colorSchemes], null, 2)}}
      animate={${animate}}
      interactive={${interactive}}
      showTooltip={${showTooltip}}
      showLabels={${showLabels}}
      labelPosition="${labelPosition}"
      showGrid={${showGrid}}
      xTickCount={${xTickCount}}
      yTickCount={${yTickCount}}${!beginAtZero ? `\n      beginAtZero={${beginAtZero}}` : ''}${!yAxisNice ? `\n      yAxis={{ nice: ${yAxisNice} }}` : ''}${xAxisDomain !== 'auto' ? `\n      xAxis={{ domain: '${xAxisDomain}' }}` : ''}
      onDataClick={(data) => console.log('Clicked:', data)}
      onHover={(data) => console.log('Hovered:', data)}
    />
  )}
</ChartContainer>`}
        />

          {/* 軸線配置系統示例 */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full" />
            <h3 className="text-xl font-semibold text-gray-800">統一軸線配置系統</h3>
          </div>
          
          <div className="space-y-4">
            <div className="bg-white/80 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <LightBulbIcon className="w-5 h-5" />
                BarChart 軸線特性
              </h4>
              <p className="text-gray-700 text-sm">
                柱狀圖通常需要 Y 軸從零開始，以正確顯示數據的比例關係。X 軸多為類別軸，使用自動域值配置。
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/80 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-2">🚀 簡單模式 (90%)</h5>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded">
{`<BarChart
  beginAtZero={true}
  data={data}
  xKey="category"
  yKey="value"
/>`}
                </div>
              </div>
              
              <div className="bg-white/80 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-2">⚙️ 標準模式 (8%)</h5>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded">
{`<BarChart
  yAxis={{
    beginAtZero: true,
    nice: true
  }}
  xAxis={{
    domain: 'auto'
  }}
/>`}
                </div>
              </div>
              
              <div className="bg-white/80 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-2">🔬 進階模式 (2%)</h5>
                <div className="text-xs font-mono bg-gray-100 p-2 rounded">
{`<BarChart
  yAxis={{
    domain: (values) => [
      0, 
      Math.max(...values) * 1.1
    ]
  }}
/>`}
                </div>
              </div>
            </div>
          </div>
        </div>

          {/* 功能說明 */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
            <h3 className="text-xl font-semibold text-gray-800">BarChart 功能特點</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">核心功能</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  支援垂直和水平方向顯示
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  豐富的顏色方案選擇
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  平滑的動畫過渡效果
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  靈活的標籤位置配置
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  統一軸線配置系統
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">軸線配置</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  Y軸自動從零開始
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  智能刻度美化 (nice)
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  X軸類別域值自動配置
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full" />
                  可自定義域值計算函數
                </li>
              </ul>
            </div>
          </div>
        </div>

          {/* 相關組件推薦 */}
          <RelatedComponents currentPath="/bar-chart" />
        </div>
      </div>
    </DemoPageTemplate>
  )
}
