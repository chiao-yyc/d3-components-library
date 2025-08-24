/**
 * RadarChartDemo - 現代化雷達圖示例
 * 展示使用新設計系統的完整 Demo 頁面
 */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { RadarChart } from '@registry/components/statistical/radar-chart/radar-chart'
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
import { CogIcon, ChartPieIcon, SparklesIcon } from '@heroicons/react/24/outline'

// 員工技能評估數據
const skillAssessmentData = [
  {
    name: '張小明',
    技術能力: 85,
    溝通能力: 75,
    領導力: 60,
    創新思維: 90,
    團隊合作: 80,
    問題解決: 88
  },
  {
    name: '李小華',
    技術能力: 70,
    溝通能力: 95,
    領導力: 85,
    創新思維: 75,
    團隊合作: 90,
    問題解決: 80
  },
  {
    name: '王小美',
    技術能力: 95,
    溝通能力: 65,
    領導力: 70,
    創新思維: 85,
    團隊合作: 75,
    問題解決: 92
  }
]

// 產品特性比較數據
const productComparisonData = [
  {
    product: 'iPhone 15',
    效能: 95,
    相機: 90,
    電池: 80,
    設計: 95,
    價格: 60,
    生態系統: 95
  },
  {
    product: 'Samsung S24',
    效能: 90,
    相機: 95,
    電池: 85,
    設計: 85,
    價格: 70,
    生態系統: 80
  },
  {
    product: 'Google Pixel 8',
    效能: 85,
    相機: 100,
    電池: 75,
    設計: 80,
    價格: 80,
    生態系統: 85
  }
]

// 學科成績數據
const academicPerformanceData = [
  {
    student: '學生A',
    數學: 88,
    物理: 92,
    化學: 85,
    英文: 78,
    國文: 82,
    歷史: 75,
    地理: 80
  },
  {
    student: '學生B',
    數學: 75,
    物理: 80,
    化學: 78,
    英文: 95,
    國文: 90,
    歷史: 88,
    地理: 85
  },
  {
    student: '學生C',
    數學: 95,
    物理: 88,
    化學: 90,
    英文: 85,
    國文: 80,
    歷史: 70,
    地理: 75
  }
]

// 市場分析數據
const marketAnalysisData = [
  {
    company: '公司A',
    市場佔有率: 85,
    品牌知名度: 90,
    產品品質: 88,
    客戶滿意度: 82,
    創新能力: 75,
    財務狀況: 80,
    競爭優勢: 85
  },
  {
    company: '公司B',
    市場佔有率: 70,
    品牌知名度: 85,
    產品品質: 95,
    客戶滿意度: 90,
    創新能力: 88,
    財務狀況: 85,
    競爭優勢: 80
  },
  {
    company: '公司C',
    市場佔有率: 60,
    品牌知名度: 70,
    產品品質: 92,
    客戶滿意度: 88,
    創新能力: 95,
    財務狀況: 75,
    競爭優勢: 78
  }
]

export default function RadarChartDemo() {
  // 基本設定
  const [selectedDataset, setSelectedDataset] = useState('skills')
  const [chartWidth, setChartWidth] = useState(600)
  const [chartHeight, setChartHeight] = useState(600)
  const [radius, setRadius] = useState(180)
  
  // 網格設定
  const [levels, setLevels] = useState(5)
  const [startAngle, setStartAngle] = useState(-90)
  const [clockwise, setClockwise] = useState(true)
  
  // 視覺元素
  const [showGrid, setShowGrid] = useState(true)
  const [showGridLabels, setShowGridLabels] = useState(true)
  const [showAxes, setShowAxes] = useState(true)
  const [showAxisLabels, setShowAxisLabels] = useState(true)
  const [showDots, setShowDots] = useState(true)
  const [showArea, setShowArea] = useState(true)
  
  // 樣式設定
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [areaOpacity, setAreaOpacity] = useState(0.25)
  const [dotRadius, setDotRadius] = useState(4)
  
  // 圖例設定
  const [showLegend, setShowLegend] = useState(true)
  const [legendPosition, setLegendPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('bottom')
  
  // 顏色和動畫
  const [colorScheme, setColorScheme] = useState<'custom' | 'blues' | 'greens' | 'oranges' | 'reds' | 'purples'>('custom')
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)

  // 當前資料和配置
  const { currentData, currentAxes, config } = useMemo(() => {
    switch (selectedDataset) {
      case 'skills':
        return {
          currentData: skillAssessmentData,
          currentAxes: ['技術能力', '溝通能力', '領導力', '創新思維', '團隊合作', '問題解決'],
          config: {
            title: '員工技能評估分析',
            description: '多維度技能能力雷達圖比較',
            colors: ['#3b82f6', '#ef4444', '#10b981'],
            labelKey: 'name'
          }
        }
      
      case 'products':
        return {
          currentData: productComparisonData,
          currentAxes: ['效能', '相機', '電池', '設計', '價格', '生態系統'],
          config: {
            title: '智慧手機產品比較',
            description: '多維度產品特性分析',
            colors: ['#374151', '#1f2937', '#6366f1'],
            labelKey: 'product'
          }
        }
      
      case 'academic':
        return {
          currentData: academicPerformanceData,
          currentAxes: ['數學', '物理', '化學', '英文', '國文', '歷史', '地理'],
          config: {
            title: '學科成績表現分析',
            description: '學生各科目成績雷達圖',
            colors: ['#f59e0b', '#8b5cf6', '#06b6d4'],
            labelKey: 'student'
          }
        }
      
      case 'market':
        return {
          currentData: marketAnalysisData,
          currentAxes: ['市場佔有率', '品牌知名度', '產品品質', '客戶滿意度', '創新能力', '財務狀況', '競爭優勢'],
          config: {
            title: '企業市場競爭力分析',
            description: '多維度企業競爭力評估',
            colors: ['#dc2626', '#059669', '#7c2d12'],
            labelKey: 'company'
          }
        }
      
      default:
        return {
          currentData: skillAssessmentData,
          currentAxes: ['技術能力', '溝通能力', '領導力', '創新思維', '團隊合作', '問題解決'],
          config: {
            title: '雷達圖',
            description: '',
            colors: [],
            labelKey: 'name'
          }
        }
    }
  }, [selectedDataset])

  // 狀態顯示數據
  const statusItems = [
    { label: '數據集', value: config.title },
    { label: '數據項目', value: currentData.length },
    { label: '維度數量', value: currentAxes.length },
    { label: '圖表尺寸', value: `${chartWidth} × ${chartHeight}` },
    { label: '動畫', value: animate ? '開啟' : '關閉', color: animate ? '#10b981' : '#6b7280' }
  ]

  // 數據表格列定義
  const getTableColumns = (): DataTableColumn[] => {
    const columns: DataTableColumn[] = [
      { key: config.labelKey, title: config.labelKey === 'name' ? '姓名' : config.labelKey === 'product' ? '產品' : config.labelKey === 'student' ? '學生' : config.labelKey === 'company' ? '公司' : '名稱', sortable: true }
    ]
    
    currentAxes.forEach(axis => {
      columns.push({
        key: axis,
        title: axis,
        sortable: true,
        formatter: (value) => value.toFixed(0),
        align: 'right'
      })
    })
    
    // 平均分欄位
    columns.push({
      key: '_average',
      title: '平均分',
      sortable: false,
      formatter: (value, row) => {
        if (!row) return '-'
        const values = currentAxes.map(axis => row[axis] || 0)
        const average = values.reduce((sum, val) => sum + val, 0) / values.length
        return average.toFixed(1)
      },
      align: 'right'
    })
    
    return columns
  }

  return (
    <DemoPageTemplate
      title="RadarChart Demo"
      description="現代化雷達圖組件展示 - 適用於多維數據可視化、能力評估和績效比較"
    >

      {/* 控制面板 */}
      <ContentSection>
        <ModernControlPanel 
          title="控制面板" 
          icon={<CogIcon className="w-5 h-5" />}
        >
          <div className="space-y-8">
            {/* 基本設定 */}
            <ControlGroup title="基本設定" icon="⚙️" cols={2}>
              <SelectControl
                label="數據集"
                value={selectedDataset}
                onChange={setSelectedDataset}
                options={[
                  { value: 'skills', label: '員工技能評估' },
                  { value: 'products', label: '產品特性比較' },
                  { value: 'academic', label: '學科成績表現' },
                  { value: 'market', label: '市場競爭分析' }
                ]}
              />
              
              <SelectControl
                label="顏色主題"
                value={colorScheme}
                onChange={setColorScheme}
                options={[
                  { value: 'custom', label: '自訂' },
                  { value: 'blues', label: '藍色系' },
                  { value: 'greens', label: '綠色系' },
                  { value: 'oranges', label: '橙色系' },
                  { value: 'reds', label: '紅色系' },
                  { value: 'purples', label: '紫色系' }
                ]}
              />
            </ControlGroup>

            {/* 尺寸設定 */}
            <ControlGroup title="尺寸配置" icon="📏" cols={3}>
              <RangeSlider
                label="圖表寬度"
                value={chartWidth}
                min={400}
                max={800}
                step={50}
                onChange={setChartWidth}
                suffix="px"
              />
              
              <RangeSlider
                label="圖表高度"
                value={chartHeight}
                min={400}
                max={800}
                step={50}
                onChange={setChartHeight}
                suffix="px"
              />
              
              <RangeSlider
                label="雷達半徑"
                value={radius}
                min={100}
                max={250}
                step={10}
                onChange={setRadius}
                suffix="px"
              />
            </ControlGroup>


            {/* 網格設定 */}
            <ControlGroup title="網格配置" icon="🕸️" cols={3}>
              <RangeSlider
                label="網格層級"
                value={levels}
                min={3}
                max={10}
                step={1}
                onChange={setLevels}
              />
              
              <RangeSlider
                label="起始角度"
                value={startAngle}
                min={-180}
                max={180}
                step={15}
                onChange={setStartAngle}
                suffix="°"
                description="-90° = 頂部開始"
              />
              
              <ToggleControl
                label="順時針方向"
                checked={clockwise}
                onChange={setClockwise}
                description="雷達圖方向設定"
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
                label="區域透明度"
                value={areaOpacity}
                min={0}
                max={0.8}
                step={0.05}
                onChange={setAreaOpacity}
                formatter={(value) => `${(value * 100).toFixed(0)}%`}
              />
              
              <RangeSlider
                label="數據點大小"
                value={dotRadius}
                min={2}
                max={8}
                step={1}
                onChange={setDotRadius}
                suffix="px"
              />
            </ControlGroup>

            {/* 圖例設定 */}
            <ControlGroup title="圖例配置" icon="📋" cols={2}>
              <ToggleControl
                label="顯示圖例"
                checked={showLegend}
                onChange={setShowLegend}
                description="顯示或隱藏圖例"
              />
              
              <SelectControl
                label="圖例位置"
                value={legendPosition}
                onChange={setLegendPosition}
                options={[
                  { value: 'top', label: '頂部' },
                  { value: 'bottom', label: '底部' },
                  { value: 'left', label: '左側' },
                  { value: 'right', label: '右側' }
                ]}
              />
            </ControlGroup>


            {/* 顯示選項 */}
            <ControlGroup title="顯示選項" icon="👁️" cols={2}>
              <ToggleControl
                label="顯示網格"
                checked={showGrid}
                onChange={setShowGrid}
                description="顯示雷達圖網格線"
              />
              
              <ToggleControl
                label="顯示網格標籤"
                checked={showGridLabels}
                onChange={setShowGridLabels}
                description="顯示網格數值標籤"
              />
              
              <ToggleControl
                label="顯示軸線"
                checked={showAxes}
                onChange={setShowAxes}
                description="顯示各維度軸線"
              />
              
              <ToggleControl
                label="顯示軸標籤"
                checked={showAxisLabels}
                onChange={setShowAxisLabels}
                description="顯示維度名稱標籤"
              />
              
              <ToggleControl
                label="顯示數據點"
                checked={showDots}
                onChange={setShowDots}
                description="顯示數據節點圓點"
              />
              
              <ToggleControl
                label="顯示區域填充"
                checked={showArea}
                onChange={setShowArea}
                description="填充雷達圖區域"
              />
            </ControlGroup>

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
            </ControlGroup>
          </div>
        </ModernControlPanel>
      </ContentSection>

      {/* 圖表展示 */}
      <ContentSection delay={0.1}>
        <ChartContainer
          title={config.title}
          subtitle={config.description}
          actions={
            <div className="flex items-center gap-2">
              <ChartPieIcon className="w-5 h-5 text-indigo-500" />
              <span className="text-sm text-gray-600">雷達圖</span>
            </div>
          }
        >
          <div className="flex justify-center">
            <motion.div
              key={`${chartWidth}-${chartHeight}-${selectedDataset}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <RadarChart
                data={currentData}
                axes={currentAxes}
                labelKey={config.labelKey}
                width={chartWidth}
                height={chartHeight}
                radius={radius}
                levels={levels}
                startAngle={startAngle}
                clockwise={clockwise}
                showGrid={showGrid}
                showGridLabels={showGridLabels}
                showAxes={showAxes}
                showAxisLabels={showAxisLabels}
                showDots={showDots}
                showArea={showArea}
                strokeWidth={strokeWidth}
                areaOpacity={areaOpacity}
                dotRadius={dotRadius}
                showLegend={showLegend}
                legendPosition={legendPosition}
                colors={colorScheme === 'custom' ? config.colors : undefined}
                colorScheme={colorScheme}
                animate={animate}
                interactive={interactive}
                onSeriesClick={(data) => {
                  console.log('Series clicked:', data)
                }}
                onSeriesHover={(data) => {
                  console.log('Series hovered:', data)
                }}
                onDotClick={(value, series) => {
                  console.log('Dot clicked:', value, series)
                }}
                onDotHover={(value, series) => {
                  if (value && series) {
                    console.log('Dot hovered:', value, series)
                  }
                }}
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
          data={currentData.map(row => ({ ...row, _average: 0 }))}
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
          code={`import { RadarChart } from '@registry/components/statistical/radar-chart'

// ${config.title}數據
const data = [
  { ${config.labelKey}: '${currentData[0]?.[config.labelKey]}', ${currentAxes.slice(0, 3).map(axis => `${axis}: ${currentData[0]?.[axis]}`).join(', ')} },
  { ${config.labelKey}: '${currentData[1]?.[config.labelKey]}', ${currentAxes.slice(0, 3).map(axis => `${axis}: ${currentData[1]?.[axis]}`).join(', ')} },
  // ... more data
]

const axes = ${JSON.stringify(currentAxes)}

<RadarChart
  data={data}
  axes={axes}
  labelKey="${config.labelKey}"
  width={${chartWidth}}
  height={${chartHeight}}
  radius={${radius}}
  levels={${levels}}
  startAngle={${startAngle}}
  clockwise={${clockwise}}
  showGrid={${showGrid}}
  showGridLabels={${showGridLabels}}
  showAxes={${showAxes}}
  showAxisLabels={${showAxisLabels}}
  showDots={${showDots}}
  showArea={${showArea}}
  strokeWidth={${strokeWidth}}
  areaOpacity={${areaOpacity}}
  dotRadius={${dotRadius}}
  showLegend={${showLegend}}
  legendPosition="${legendPosition}"
  colorScheme="${colorScheme}"
  animate={${animate}}
  interactive={${interactive}}
  onSeriesClick={(data) => console.log('Clicked:', data)}
  onDotClick={(value, series) => console.log('Dot:', value, series)}
/>`}
        />
      </ContentSection>

      {/* 功能說明 */}
      <ContentSection delay={0.4}>
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full" />
            <h3 className="text-xl font-semibold text-gray-800">RadarChart 功能特點</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">適用場景</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  人才評估：員工技能、能力評估
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  產品比較：多維度產品特性分析
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full" />
                  績效分析：團隊、部門績效對比
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  學習評量：學科成績、學習成果
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  市場分析：企業競爭力評估
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">設計要點</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  維度數量：建議 3-8 個，避免過於複雜
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  數值範圍：確保各維度數值在相同範圍
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  顏色選擇：使用對比明顯的顏色區分
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  透明度控制：避免重疊遮擋
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  互動體驗：提供詳細的提示信息
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ContentSection>
    </DemoPageTemplate>
  )
}