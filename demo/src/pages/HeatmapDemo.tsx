import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { HeatmapV2 as HeatMap } from '../../../registry/components/basic/heatmap'
import DemoPageTemplate from '../components/ui/DemoPageTemplate'
import ModernControlPanel, { ControlGroup, RangeSlider, SelectControl, ToggleControl } from '../components/ui/ModernControlPanel'
import DataTable from '../components/ui/DataTable'
import { designTokens } from '../design/design-tokens'
import { 
  Square3Stack3DIcon,
  ChartBarSquareIcon,
  CogIcon,
  EyeIcon,
  PaintBrushIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

// 相關性矩陣資料
const correlationData = [
  { var1: 'Sales', var2: 'Marketing', correlation: 0.85 },
  { var1: 'Sales', var2: 'Price', correlation: -0.62 },
  { var1: 'Sales', var2: 'Quality', correlation: 0.73 },
  { var1: 'Sales', var2: 'Service', correlation: 0.91 },
  { var1: 'Marketing', var2: 'Price', correlation: -0.45 },
  { var1: 'Marketing', var2: 'Quality', correlation: 0.56 },
  { var1: 'Marketing', var2: 'Service', correlation: 0.68 },
  { var1: 'Price', var2: 'Quality', correlation: -0.23 },
  { var1: 'Price', var2: 'Service', correlation: -0.34 },
  { var1: 'Quality', var2: 'Service', correlation: 0.79 },
  // 對角線 (自相關)
  { var1: 'Sales', var2: 'Sales', correlation: 1.0 },
  { var1: 'Marketing', var2: 'Marketing', correlation: 1.0 },
  { var1: 'Price', var2: 'Price', correlation: 1.0 },
  { var1: 'Quality', var2: 'Quality', correlation: 1.0 },
  { var1: 'Service', var2: 'Service', correlation: 1.0 },
  // 鏡射資料
  { var1: 'Marketing', var2: 'Sales', correlation: 0.85 },
  { var1: 'Price', var2: 'Sales', correlation: -0.62 },
  { var1: 'Quality', var2: 'Sales', correlation: 0.73 },
  { var1: 'Service', var2: 'Sales', correlation: 0.91 },
  { var1: 'Price', var2: 'Marketing', correlation: -0.45 },
  { var1: 'Quality', var2: 'Marketing', correlation: 0.56 },
  { var1: 'Service', var2: 'Marketing', correlation: 0.68 },
  { var1: 'Quality', var2: 'Price', correlation: -0.23 },
  { var1: 'Service', var2: 'Price', correlation: -0.34 },
  { var1: 'Service', var2: 'Quality', correlation: 0.79 }
]

// 銷售熱力圖資料
const salesData = [
  { month: '1月', product: 'Product A', sales: 120 },
  { month: '1月', product: 'Product B', sales: 89 },
  { month: '1月', product: 'Product C', sales: 156 },
  { month: '1月', product: 'Product D', sales: 78 },
  { month: '2月', product: 'Product A', sales: 135 },
  { month: '2月', product: 'Product B', sales: 92 },
  { month: '2月', product: 'Product C', sales: 168 },
  { month: '2月', product: 'Product D', sales: 85 },
  { month: '3月', product: 'Product A', sales: 148 },
  { month: '3月', product: 'Product B', sales: 110 },
  { month: '3月', product: 'Product C', sales: 145 },
  { month: '3月', product: 'Product D', sales: 95 },
  { month: '4月', product: 'Product A', sales: 162 },
  { month: '4月', product: 'Product B', sales: 125 },
  { month: '4月', product: 'Product C', sales: 178 },
  { month: '4月', product: 'Product D', sales: 88 },
  { month: '5月', product: 'Product A', sales: 155 },
  { month: '5月', product: 'Product B', sales: 118 },
  { month: '5月', product: 'Product C', sales: 192 },
  { month: '5月', product: 'Product D', sales: 102 },
  { month: '6月', product: 'Product A', sales: 178 },
  { month: '6月', product: 'Product B', sales: 135 },
  { month: '6月', product: 'Product C', sales: 205 },
  { month: '6月', product: 'Product D', sales: 115 }
]

// 評分矩陣資料
const ratingData = [
  { user: 'User 1', item: 'Item A', rating: 4.5 },
  { user: 'User 1', item: 'Item B', rating: 3.2 },
  { user: 'User 1', item: 'Item C', rating: 5.0 },
  { user: 'User 1', item: 'Item D', rating: 2.8 },
  { user: 'User 2', item: 'Item A', rating: 3.8 },
  { user: 'User 2', item: 'Item B', rating: 4.1 },
  { user: 'User 2', item: 'Item C', rating: 3.5 },
  { user: 'User 2', item: 'Item D', rating: 4.8 },
  { user: 'User 3', item: 'Item A', rating: 5.0 },
  { user: 'User 3', item: 'Item B', rating: 2.9 },
  { user: 'User 3', item: 'Item C', rating: 4.2 },
  { user: 'User 3', item: 'Item D', rating: 3.6 },
  { user: 'User 4', item: 'Item A', rating: 2.5 },
  { user: 'User 4', item: 'Item B', rating: 4.7 },
  { user: 'User 4', item: 'Item C', rating: 3.9 },
  { user: 'User 4', item: 'Item D', rating: 5.0 },
  { user: 'User 5', item: 'Item A', rating: 4.0 },
  { user: 'User 5', item: 'Item B', rating: 3.7 },
  { user: 'User 5', item: 'Item C', rating: 4.8 },
  { user: 'User 5', item: 'Item D', rating: 3.3 }
]

export default function HeatmapDemo() {
  // 基本設定
  const [selectedDataset, setSelectedDataset] = useState('correlation')
  const [chartWidth, setChartWidth] = useState(700)
  const [chartHeight, setChartHeight] = useState(500)
  
  // 樣式配置
  const [colorScheme, setColorScheme] = useState<'blues' | 'greens' | 'reds' | 'oranges' | 'purples' | 'greys'>('blues')
  const [cellRadius, setCellRadius] = useState(0)
  const [cellPadding, setCellPadding] = useState(2)
  
  // 軸線配置
  const [xAxisRotation, setXAxisRotation] = useState(-45)
  const [yAxisRotation, setYAxisRotation] = useState(0)
  
  // 顯示配置
  const [showValues, setShowValues] = useState(false)
  const [showLegend, setShowLegend] = useState(true)
  const [legendPosition, setLegendPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('right')
  
  // 動畫交互
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)

  // 當前資料和配置
  const { currentData, mapping, config, datasetInfo } = useMemo(() => {
    switch (selectedDataset) {
      case 'correlation':
        return {
          currentData: correlationData,
          mapping: { x: 'var1', y: 'var2', value: 'correlation' },
          config: {
            domain: [-1, 1] as [number, number],
            legendTitle: '相關係數',
            valueFormat: (d: number) => d.toFixed(2)
          },
          datasetInfo: {
            name: '相關性矩陣',
            description: '展示各變數間的相關性強度，數值範圍從 -1 到 1',
            totalPoints: correlationData.length,
            features: ['負相關檢測', '對角線自相關', '鏡射對稱性']
          }
        }
      
      case 'sales':
        return {
          currentData: salesData,
          mapping: { x: 'month', y: 'product', value: 'sales' },
          config: {
            domain: undefined,
            legendTitle: '銷售額',
            valueFormat: (d: number) => d.toFixed(0)
          },
          datasetInfo: {
            name: '產品銷售熱力圖',
            description: '展示不同產品在各月份的銷售表現',
            totalPoints: salesData.length,
            features: ['時間序列分析', '產品對比', '季節性趨勢']
          }
        }
      
      case 'rating':
        return {
          currentData: ratingData,
          mapping: { x: 'user', y: 'item', value: 'rating' },
          config: {
            domain: [1, 5] as [number, number],
            legendTitle: '評分',
            valueFormat: (d: number) => d.toFixed(1)
          },
          datasetInfo: {
            name: '用戶評分矩陣',
            description: '展示用戶對不同項目的評分分布',
            totalPoints: ratingData.length,
            features: ['推薦系統', '評分分析', '偏好模式']
          }
        }
      
      default:
        return {
          currentData: [],
          mapping: { x: 'x', y: 'y', value: 'value' },
          config: {},
          datasetInfo: { name: '', description: '', totalPoints: 0, features: [] }
        }
    }
  }, [selectedDataset])

  // 數據統計
  const dataStats = useMemo(() => {
    const values = currentData.map(d => d[mapping.value as keyof typeof d] as number)
    return {
      total: currentData.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      uniqueX: new Set(currentData.map(d => d[mapping.x as keyof typeof d])).size,
      uniqueY: new Set(currentData.map(d => d[mapping.y as keyof typeof d])).size
    }
  }, [currentData, mapping])

  // 控制面板配置
  const controlGroups = [
    {
      title: '基本設定',
      icon: CogIcon,
      controls: [
        {
          type: 'select' as const,
          label: '資料集',
          value: selectedDataset,
          onChange: setSelectedDataset,
          options: [
            { value: 'correlation', label: '相關性矩陣' },
            { value: 'sales', label: '產品銷售' },
            { value: 'rating', label: '用戶評分' }
          ]
        }
      ]
    },
    {
      title: '尺寸配置',
      icon: AdjustmentsHorizontalIcon,
      controls: [
        {
          type: 'range' as const,
          label: '圖表寬度',
          value: chartWidth,
          onChange: setChartWidth,
          min: 400,
          max: 1200,
          step: 50
        },
        {
          type: 'range' as const,
          label: '圖表高度',
          value: chartHeight,
          onChange: setChartHeight,
          min: 300,
          max: 800,
          step: 50
        }
      ]
    },
    {
      title: '樣式配置',
      icon: PaintBrushIcon,
      controls: [
        {
          type: 'select' as const,
          label: '顏色主題',
          value: colorScheme,
          onChange: setColorScheme,
          options: [
            { value: 'blues', label: '藍色系' },
            { value: 'greens', label: '綠色系' },
            { value: 'reds', label: '紅色系' },
            { value: 'oranges', label: '橙色系' },
            { value: 'purples', label: '紫色系' },
            { value: 'greys', label: '灰色系' }
          ]
        },
        {
          type: 'range' as const,
          label: '格子圓角',
          value: cellRadius,
          onChange: setCellRadius,
          min: 0,
          max: 10,
          step: 1,
          suffix: 'px'
        },
        {
          type: 'range' as const,
          label: '格子間距',
          value: cellPadding,
          onChange: setCellPadding,
          min: 0,
          max: 10,
          step: 1,
          suffix: 'px'
        }
      ]
    },
    {
      title: '軸線配置',
      icon: ChartBarSquareIcon,
      controls: [
        {
          type: 'range' as const,
          label: 'X軸標籤旋轉',
          value: xAxisRotation,
          onChange: setXAxisRotation,
          min: -90,
          max: 90,
          step: 15,
          suffix: '°'
        },
        {
          type: 'range' as const,
          label: 'Y軸標籤旋轉',
          value: yAxisRotation,
          onChange: setYAxisRotation,
          min: -90,
          max: 90,
          step: 15,
          suffix: '°'
        }
      ]
    },
    {
      title: '顯示配置',
      icon: EyeIcon,
      controls: [
        {
          type: 'toggle' as const,
          label: '顯示數值',
          value: showValues,
          onChange: setShowValues
        },
        {
          type: 'toggle' as const,
          label: '顯示圖例',
          value: showLegend,
          onChange: setShowLegend
        },
        {
          type: 'select' as const,
          label: '圖例位置',
          value: legendPosition,
          onChange: setLegendPosition,
          options: [
            { value: 'top', label: '上方' },
            { value: 'bottom', label: '下方' },
            { value: 'left', label: '左側' },
            { value: 'right', label: '右側' }
          ],
          disabled: !showLegend
        }
      ]
    },
    {
      title: '動畫交互',
      icon: Square3Stack3DIcon,
      controls: [
        {
          type: 'toggle' as const,
          label: '動畫效果',
          value: animate,
          onChange: setAnimate
        },
        {
          type: 'toggle' as const,
          label: '互動功能',
          value: interactive,
          onChange: setInteractive
        }
      ]
    }
  ]

  // DataTable 欄位配置
  const dataTableColumns = [
    {
      key: mapping.x,
      title: 'X軸',
      sortable: true,
      align: 'left' as const
    },
    {
      key: mapping.y,
      title: 'Y軸',
      sortable: true,
      align: 'left' as const
    },
    {
      key: mapping.value,
      title: '數值',
      sortable: true,
      align: 'right' as const,
      formatter: (value: number) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value > dataStats.avg 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {config.valueFormat ? config.valueFormat(value) : value.toFixed(2)}
        </span>
      )
    }
  ]

  return (
    <DemoPageTemplate
      title="熱力圖展示"
      description="矩陣數據視覺化工具，適用於相關性分析、銷售分布等多維度數據展示"
    >
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* 控制面板 */}
        <div className="xl:col-span-1">
          <ModernControlPanel title="熱力圖設定" icon={<Square3Stack3DIcon className="w-5 h-5" />}>
            <ControlGroup title="基本設定" icon={<CogIcon className="w-4 h-4" />} cols={1}>
              <SelectControl
                label="資料集"
                value={selectedDataset}
                onChange={setSelectedDataset}
                options={[
                  { value: 'correlation', label: '相關性矩陣' },
                  { value: 'sales', label: '產品銷售' },
                  { value: 'rating', label: '用戶評分' }
                ]}
              />
            </ControlGroup>

            <ControlGroup title="尺寸配置" icon={<AdjustmentsHorizontalIcon className="w-4 h-4" />} cols={1}>
              <RangeSlider
                label="圖表寬度"
                value={chartWidth}
                onChange={setChartWidth}
                min={400}
                max={1200}
                step={50}
              />
              <RangeSlider
                label="圖表高度"
                value={chartHeight}
                onChange={setChartHeight}
                min={300}
                max={800}
                step={50}
              />
            </ControlGroup>

            <ControlGroup title="樣式配置" icon={<PaintBrushIcon className="w-4 h-4" />} cols={1}>
              <SelectControl
                label="顏色主題"
                value={colorScheme}
                onChange={setColorScheme}
                options={[
                  { value: 'blues', label: '藍色系' },
                  { value: 'greens', label: '綠色系' },
                  { value: 'reds', label: '紅色系' },
                  { value: 'oranges', label: '橙色系' },
                  { value: 'purples', label: '紫色系' },
                  { value: 'greys', label: '灰色系' }
                ]}
              />
              <RangeSlider
                label="格子圓角"
                value={cellRadius}
                onChange={setCellRadius}
                min={0}
                max={10}
                step={1}
                suffix="px"
              />
              <RangeSlider
                label="格子間距"
                value={cellPadding}
                onChange={setCellPadding}
                min={0}
                max={10}
                step={1}
                suffix="px"
              />
            </ControlGroup>

            <ControlGroup title="軸線配置" icon={<ChartBarSquareIcon className="w-4 h-4" />} cols={1}>
              <RangeSlider
                label="X軸標籤旋轉"
                value={xAxisRotation}
                onChange={setXAxisRotation}
                min={-90}
                max={90}
                step={15}
                suffix="°"
              />
              <RangeSlider
                label="Y軸標籤旋轉"
                value={yAxisRotation}
                onChange={setYAxisRotation}
                min={-90}
                max={90}
                step={15}
                suffix="°"
              />
            </ControlGroup>

            <ControlGroup title="顯示配置" icon={<EyeIcon className="w-4 h-4" />} cols={1}>
              <ToggleControl
                label="顯示數值"
                checked={showValues}
                onChange={setShowValues}
              />
              <ToggleControl
                label="顯示圖例"
                checked={showLegend}
                onChange={setShowLegend}
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
            </ControlGroup>

            <ControlGroup title="動畫交互" icon={<Square3Stack3DIcon className="w-4 h-4" />} cols={1}>
              <ToggleControl
                label="動畫效果"
                checked={animate}
                onChange={setAnimate}
              />
              <ToggleControl
                label="互動功能"
                checked={interactive}
                onChange={setInteractive}
              />
            </ControlGroup>
          </ModernControlPanel>
          
          {/* 數據資訊卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`${designTokens.colors.cardBg} backdrop-blur-md rounded-2xl border ${designTokens.colors.border} p-4 space-y-3 mt-4`}
          >
            <div className="flex items-center gap-2">
              <ChartBarSquareIcon className="w-5 h-5 text-blue-500" />
              <h3 className={`${designTokens.typography.heading3} text-gray-800`}>
                數據統計
              </h3>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">數據集</span>
                <span className="font-medium text-gray-900">{datasetInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">總點數</span>
                <span className="font-medium text-gray-900">{dataStats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">X軸類別</span>
                <span className="font-medium text-gray-900">{dataStats.uniqueX}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Y軸類別</span>
                <span className="font-medium text-gray-900">{dataStats.uniqueY}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">數值範圍</span>
                <span className="font-medium text-gray-900">
                  {dataStats.min.toFixed(2)} ~ {dataStats.max.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">平均值</span>
                <span className="font-medium text-gray-900">{dataStats.avg.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-3">
              <div className="text-xs text-gray-500 mb-2">數據集特點</div>
              <div className="flex flex-wrap gap-1">
                {datasetInfo.features.map((feature, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* 主內容區 */}
        <div className="xl:col-span-3 space-y-6">
          {/* 圖表區域 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`${designTokens.colors.cardBg} backdrop-blur-md rounded-2xl border ${designTokens.colors.border} overflow-hidden`}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`${designTokens.typography.heading3} text-gray-800`}>
                    {datasetInfo.name}
                  </h3>
                  <p className={`${designTokens.typography.body} text-gray-600 mt-1`}>
                    {datasetInfo.description}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {chartWidth} × {chartHeight}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-center">
                <HeatMap
                  data={currentData}
                  mapping={mapping}
                  width={chartWidth}
                  height={chartHeight}
                  colorScheme={colorScheme}
                  cellRadius={cellRadius}
                  cellPadding={cellPadding}
                  showValues={showValues}
                  showLegend={showLegend}
                  legendPosition={legendPosition}
                  legendTitle={config.legendTitle}
                  xAxisRotation={xAxisRotation}
                  yAxisRotation={yAxisRotation}
                  animate={animate}
                  interactive={interactive}
                  domain={config.domain}
                  valueFormat={config.valueFormat}
                  onCellClick={(data) => {
                    console.log('Heatmap cell clicked:', data)
                  }}
                  onCellHover={(data) => {
                    console.log('Heatmap cell hovered:', data)
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* 數據表格 */}
          <DataTable
            title="數據詳情"
            data={currentData}
            columns={dataTableColumns}
            maxRows={10}
          />

          {/* 代碼示例 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className={`${designTokens.colors.cardBg} backdrop-blur-md rounded-2xl border ${designTokens.colors.border}`}
          >
            <div className="p-6 border-b border-gray-100">
              <h3 className={`${designTokens.typography.heading3} text-gray-800`}>
                代碼示例
              </h3>
            </div>
            <div className="p-6">
              <pre className={`${designTokens.colors.codeBg} rounded-xl p-4 overflow-x-auto text-sm`}>
                <code className="text-gray-800">{`import { HeatMap } from '@/components/ui'

const data = [
  { ${mapping.x}: 'A', ${mapping.y}: '1', ${mapping.value}: 0.8 },
  { ${mapping.x}: 'A', ${mapping.y}: '2', ${mapping.value}: 0.6 },
  { ${mapping.x}: 'B', ${mapping.y}: '1', ${mapping.value}: 0.9 },
  { ${mapping.x}: 'B', ${mapping.y}: '2', ${mapping.value}: 0.4 }
]

<HeatMap
  data={data}
  mapping={{ x: '${mapping.x}', y: '${mapping.y}', value: '${mapping.value}' }}
  width={${chartWidth}}
  height={${chartHeight}}
  colorScheme="${colorScheme}"
  cellRadius={${cellRadius}}
  cellPadding={${cellPadding}}
  showValues={${showValues}}
  showLegend={${showLegend}}
  legendPosition="${legendPosition}"
  xAxisRotation={${xAxisRotation}}
  yAxisRotation={${yAxisRotation}}
  animate={${animate}}
  interactive={${interactive}}
  onCellClick={(data) => console.log('Clicked:', data)}
  onCellHover={(data) => console.log('Hovered:', data)}
/>`}</code>
              </pre>
            </div>
          </motion.div>
        </div>
      </div>
    </DemoPageTemplate>
  )
}