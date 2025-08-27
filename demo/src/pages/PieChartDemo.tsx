/**
 * PieChartDemo - 現代化圓餅圖示例
 * 展示使用新設計系統的完整 Demo 頁面
 */

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { PieChart } from '../components/ui'
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
  type DataTableColumn
} from '../components/ui'
import { CogIcon, ChartPieIcon, SparklesIcon } from '@heroicons/react/24/outline'

// 範例資料
const sampleData = [
  { category: '產品A', sales: 45000, region: '北部' },
  { category: '產品B', sales: 32000, region: '中部' },
  { category: '產品C', sales: 28000, region: '南部' },
  { category: '產品D', sales: 21000, region: '東部' },
  { category: '產品E', sales: 15000, region: '北部' },
  { category: '產品F', sales: 12000, region: '中部' }
]

const marketShareData = [
  { company: 'Company A', share: 35.2 },
  { company: 'Company B', share: 23.8 },
  { company: 'Company C', share: 18.5 },
  { company: 'Company D', share: 12.1 },
  { company: '其他', share: 10.4 }
]

const expenseData = [
  { category: '薪資', amount: 45000, type: '固定成本' },
  { category: '租金', amount: 12000, type: '固定成本' },
  { category: '材料', amount: 28000, type: '變動成本' },
  { category: '行銷', amount: 15000, type: '變動成本' },
  { category: '水電', amount: 8000, type: '固定成本' },
  { category: '其他', amount: 6000, type: '變動成本' }
]

export default function PieChartDemo() {
  // 基本設定
  const [selectedDataset, setSelectedDataset] = useState('sales')
  
  // 半徑設定
  const [innerRadius, setInnerRadius] = useState(0)
  const [outerRadius, setOuterRadius] = useState(120)
  const [cornerRadius, setCornerRadius] = useState(0)
  const [padAngle, setPadAngle] = useState(0)
  
  // 顏色和主題
  const [colorScheme, setColorScheme] = useState<'custom' | 'category10' | 'set3' | 'pastel' | 'dark'>('custom')
  
  // 標籤和圖例
  const [showLabels, setShowLabels] = useState(true)
  const [showLegend, setShowLegend] = useState(true)
  const [legendPosition, setLegendPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('right')
  const [showPercentages, setShowPercentages] = useState(true)
  const [labelThreshold, setLabelThreshold] = useState(5)
  const [showCenterText, setShowCenterText] = useState(true)
  
  // 動畫和交互
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)
  const [animationType, setAnimationType] = useState<'fade' | 'scale' | 'rotate' | 'sweep'>('sweep')
  const [hoverEffect, setHoverEffect] = useState<'lift' | 'scale' | 'glow' | 'none'>('lift')

  // 當前資料
  const currentData = useMemo(() => {
    switch (selectedDataset) {
      case 'sales':
        return sampleData
      case 'market':
        return marketShareData
      case 'expense':
        return expenseData
      default:
        return sampleData
    }
  }, [selectedDataset])

  // 資料映射
  const mapping = useMemo(() => {
    switch (selectedDataset) {
      case 'sales':
        return { label: 'category', value: 'sales', color: 'region' }
      case 'market':
        return { label: 'company', value: 'share', color: 'company' }
      case 'expense':
        return { label: 'category', value: 'amount', color: 'type' }
      default:
        return { label: 'category', value: 'sales' }
    }
  }, [selectedDataset])

  // 狀態顯示數據
  const statusItems = [
    { label: '數據集', value: selectedDataset === 'sales' ? '產品銷售額' : selectedDataset === 'market' ? '市場佔有率' : '支出分析' },
    { label: '數據項目', value: currentData.length },
    { label: '圖表類型', value: innerRadius > 0 ? '甜甜圓圖' : '圓餅圖' },
    { label: '動畫', value: animate ? '開啟' : '關閉', color: animate ? '#10b981' : '#6b7280' }
  ]

  // 數據表格列定義
  const getTableColumns = (): DataTableColumn[] => {
    const columns: DataTableColumn[] = []
    
    if (currentData.length > 0) {
      Object.keys(currentData[0]).forEach(key => {
        const isNumeric = typeof currentData[0][key as keyof typeof currentData[0]] === 'number'
        columns.push({
          key,
          title: key,
          sortable: true,
          formatter: isNumeric ? (value) => value.toLocaleString() : undefined,
          align: isNumeric ? 'right' : 'left'
        })
      })
    }
    
    return columns
  }

  // 計算總計
  const getDatasetTotal = () => {
    const valueKey = mapping.value
    return currentData.reduce((sum, item) => sum + (item[valueKey as keyof typeof item] as number), 0)
  }

  return (
    <DemoPageTemplate
      title="PieChart Demo"
      description="現代化圓餅圖組件展示 - 支援甜甜圈模式、豐富的動畫效果和互動功能"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 控制面板 */}
        <div className="lg:col-span-1">
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
                  { value: 'sales', label: '產品銷售額' },
                  { value: 'market', label: '市場佔有率' },
                  { value: 'expense', label: '支出分析' }
                ]}
              />
              
              <SelectControl
                label="顏色主題"
                value={colorScheme}
                onChange={setColorScheme}
                options={[
                  { value: 'custom', label: '自訂' },
                  { value: 'category10', label: 'Category10' },
                  { value: 'set3', label: 'Set3' },
                  { value: 'pastel', label: 'Pastel' },
                  { value: 'dark', label: 'Dark' }
                ]}
              />
            </ControlGroup>


            {/* 半徑配置 */}
            <ControlGroup title="半徑配置" icon="⚪" cols={4}>
              <RangeSlider
                label="內半徑"
                value={innerRadius}
                min={0}
                max={100}
                step={5}
                onChange={setInnerRadius}
                description="0 = 圓餅圖, >0 = 甜甜圈圖"
              />
              
              <RangeSlider
                label="外半徑"
                value={outerRadius}
                min={80}
                max={200}
                step={10}
                onChange={setOuterRadius}
              />
              
              <RangeSlider
                label="圓角半徑"
                value={cornerRadius}
                min={0}
                max={10}
                step={1}
                onChange={setCornerRadius}
              />
              
              <RangeSlider
                label="扇形間距"
                value={padAngle}
                min={0}
                max={0.1}
                step={0.005}
                onChange={setPadAngle}
                formatter={(value) => value.toFixed(3)}
              />
            </ControlGroup>

            {/* 標籤和圖例 */}
            <ControlGroup title="標籤圖例" icon="📝" cols={3}>
              <ToggleControl
                label="顯示標籤"
                checked={showLabels}
                onChange={setShowLabels}
                description="在扇形上顯示數據標籤"
              />
              
              <ToggleControl
                label="顯示圖例"
                checked={showLegend}
                onChange={setShowLegend}
                description="顯示圖表圖例"
              />
              
              <SelectControl
                label="圖例位置"
                value={legendPosition}
                onChange={setLegendPosition}
                options={[
                  { value: 'top', label: '上方' },
                  { value: 'bottom', label: '下方' },
                  { value: 'left', label: '左側' },
                  { value: 'right', label: '右側' }
                ]}
              />
              
              <ToggleControl
                label="顯示百分比"
                checked={showPercentages}
                onChange={setShowPercentages}
                description="在標籤中顯示百分比"
              />
              
              <RangeSlider
                label="標籤顯示閾值"
                value={labelThreshold}
                min={0}
                max={20}
                step={1}
                onChange={setLabelThreshold}
                suffix="%"
                description="小於此百分比的標籤不顯示"
              />
              
              <ToggleControl
                label="中心文字"
                checked={showCenterText}
                onChange={setShowCenterText}
                description="甜甜圈圖中心顯示文字"
              />
            </ControlGroup>

            {/* 動畫和交互 */}
            <ControlGroup title="動畫交互" icon="🎬" cols={2}>
              <ToggleControl
                label="動畫效果"
                checked={animate}
                onChange={setAnimate}
                description="圖表進入和更新動畫"
              />
              
              <SelectControl
                label="動畫類型"
                value={animationType}
                onChange={setAnimationType}
                options={[
                  { value: 'fade', label: '淡入' },
                  { value: 'scale', label: '縮放' },
                  { value: 'rotate', label: '旋轉' },
                  { value: 'sweep', label: '掃描' }
                ]}
              />
              
              <ToggleControl
                label="互動功能"
                checked={interactive}
                onChange={setInteractive}
                description="鼠標懸停和點擊交互"
              />
              
              <SelectControl
                label="懸停效果"
                value={hoverEffect}
                onChange={setHoverEffect}
                options={[
                  { value: 'lift', label: '上升' },
                  { value: 'scale', label: '縮放' },
                  { value: 'glow', label: '光暈' },
                  { value: 'none', label: '無' }
                ]}
              />
            </ControlGroup>
          </div>
        </ModernControlPanel>
        </div>

        {/* 主要內容區域 */}
        <div className="lg:col-span-3 space-y-8">
          {/* 圖表展示 */}
          <ChartContainer
            title="圖表預覽"
            subtitle="即時預覽配置效果"
            responsive={true}
            aspectRatio={16 / 9}
            actions={
              <div className="flex items-center gap-2">
                <ChartPieIcon className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-600">{innerRadius > 0 ? '甜甜圈圖' : '圓餅圖'}</span>
              </div>
            }
          >
            {({ width, height }) => (
              <div className="flex justify-center">
                <motion.div
                  key={`${selectedDataset}-${innerRadius}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <PieChart
                data={currentData}
                mapping={mapping}
                width={width}
                height={height}
                innerRadius={innerRadius}
                outerRadius={Math.min(width, height) * 0.35}
                cornerRadius={cornerRadius}
                padAngle={padAngle}
                colorScheme={colorScheme}
                showLabels={showLabels}
                showLegend={showLegend}
                legendPosition={legendPosition}
                showPercentages={showPercentages}
                labelThreshold={labelThreshold}
                animate={animate}
                animationType={animationType}
                interactive={interactive}
                showCenterText={showCenterText}
                hoverEffect={hoverEffect}
                onSliceClick={(data) => {
                  console.log('Pie slice clicked:', data)
                }}
                onSliceHover={(data) => {
                  console.log('Pie slice hovered:', data)
                }}
                />
              </motion.div>
              </div>
            )}
          </ChartContainer>
          
          <StatusDisplay items={statusItems} />

          {/* 數據詳情 */}
          <DataTable
            title="數據詳情"
            data={currentData}
            columns={getTableColumns()}
            maxRows={8}
            showIndex
          />
        
        {/* 數據統計摘要 */}
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
          <h4 className="font-semibold text-purple-800 mb-3">數據摘要</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{currentData.length}</div>
              <div className="text-purple-700">項目數量</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-pink-600">{getDatasetTotal().toLocaleString()}</div>
              <div className="text-pink-700">數據總計</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-indigo-600">{(getDatasetTotal() / currentData.length).toFixed(0)}</div>
              <div className="text-indigo-700">平均值</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-teal-600">{Math.max(...currentData.map(item => item[mapping.value as keyof typeof item] as number)).toLocaleString()}</div>
              <div className="text-teal-700">最大值</div>
            </div>
          </div>
          </div>

          {/* 代碼範例 */}
          <CodeExample
          title="使用範例"
          language="tsx"
          code={`import { PieChart } from '../components/ui'

// ${selectedDataset === 'sales' ? '產品銷售額' : selectedDataset === 'market' ? '市場佔有率' : '支出分析'}數據
const data = [
  { ${mapping.label}: '${currentData[0]?.[mapping.label as keyof typeof currentData[0]]}', ${mapping.value}: ${currentData[0]?.[mapping.value as keyof typeof currentData[0]]}${mapping.color ? `, ${mapping.color}: '${currentData[0]?.[mapping.color as keyof typeof currentData[0]]}'` : ''} },
  { ${mapping.label}: '${currentData[1]?.[mapping.label as keyof typeof currentData[1]]}', ${mapping.value}: ${currentData[1]?.[mapping.value as keyof typeof currentData[1]]}${mapping.color ? `, ${mapping.color}: '${currentData[1]?.[mapping.color as keyof typeof currentData[1]]}'` : ''} },
  // ... more data
]

<ChartContainer responsive={true} aspectRatio={16/9}>
  {({ width, height }) => (
    <PieChart
      data={data}
      mapping={{
        label: '${mapping.label}',
        value: '${mapping.value}'${mapping.color ? `,\n        color: '${mapping.color}'` : ''}
      }}
      width={width}
      height={height}
      innerRadius={${innerRadius}}
      outerRadius={Math.min(width, height) * 0.35}
      cornerRadius={${cornerRadius}}
      padAngle={${padAngle}}
      colorScheme="${colorScheme}"
      showLabels={${showLabels}}
      showLegend={${showLegend}}
      legendPosition="${legendPosition}"
      showPercentages={${showPercentages}}
      labelThreshold={${labelThreshold}}
      animate={${animate}}
      animationType="${animationType}"
      interactive={${interactive}}
      showCenterText={${showCenterText}}
      hoverEffect="${hoverEffect}"
      onSliceClick={(data) => console.log('Clicked:', data)}
      onSliceHover={(data) => console.log('Hovered:', data)}
    />
  )}
</ChartContainer>`}
          />

          {/* 功能說明 */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full" />
            <h3 className="text-xl font-semibold text-gray-800">PieChart 功能特點</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">核心功能</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  圓餅圖和甜甜圈圖模式切換
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full" />
                  豐富的顏色主題和配色方案
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  靈活的半徑和間距配置
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  智能標籤顯示和閾值控制
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">交互特性</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  多種動畫類型：淡入、縮放、旋轉、掃描
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  懸停效果：上升、縮放、光暈
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  圓角和扇形間距自定義
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  中心文字和圖例位置配置
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