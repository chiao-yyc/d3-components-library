import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BoxPlot } from '@registry/components/statistical/box-plot/box-plot'
import DemoPageTemplate from '../components/ui/DemoPageTemplate'
import ModernControlPanel, { ControlGroup, RangeSlider, SelectControl, ToggleControl } from '../components/ui/ModernControlPanel'
import DataTable from '../components/ui/DataTable'
import { designTokens } from '../design/design-tokens'
import { 
  ChartBarIcon,
  CogIcon,
  AdjustmentsHorizontalIcon,
  PaintBrushIcon,
  EyeIcon,
  Square3Stack3DIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline'

// 學生成績數據
const studentScoresData = [
  { subject: '數學', scores: [85, 92, 78, 88, 95, 82, 90, 87, 93, 86, 89, 91, 84, 96, 83, 88, 92, 85, 94, 87] },
  { subject: '英文', scores: [76, 88, 92, 85, 79, 91, 87, 83, 90, 86, 82, 89, 84, 93, 80, 88, 91, 85, 87, 89] },
  { subject: '物理', scores: [88, 91, 85, 89, 92, 87, 90, 86, 93, 84, 88, 91, 89, 94, 86, 90, 87, 92, 85, 88] },
  { subject: '化學', scores: [82, 85, 89, 91, 87, 84, 90, 88, 86, 92, 85, 89, 87, 91, 83, 88, 90, 86, 89, 85] },
  { subject: '生物', scores: [90, 87, 92, 89, 85, 91, 88, 86, 93, 87, 90, 89, 91, 85, 88, 92, 86, 89, 87, 90] }
]

// 公司薪資數據
const salaryData = [
  { department: '工程部', salaries: [75000, 85000, 92000, 68000, 78000, 95000, 88000, 82000, 90000, 76000, 87000, 91000, 79000, 86000, 83000] },
  { department: '銷售部', salaries: [65000, 72000, 85000, 78000, 82000, 68000, 75000, 88000, 71000, 79000, 86000, 73000, 81000, 77000, 84000] },
  { department: '行銷部', salaries: [68000, 75000, 82000, 71000, 78000, 85000, 72000, 79000, 86000, 74000, 81000, 88000, 76000, 83000, 80000] },
  { department: '人資部', salaries: [62000, 68000, 75000, 71000, 77000, 82000, 69000, 74000, 79000, 72000, 78000, 85000, 70000, 76000, 81000] },
  { department: '財務部', salaries: [70000, 77000, 84000, 72000, 79000, 86000, 74000, 81000, 88000, 76000, 83000, 90000, 78000, 85000, 82000] }
]

// 網站響應時間數據
const responseTimeData = [
  { server: 'Server A', times: [120, 135, 142, 128, 155, 138, 162, 145, 132, 148, 140, 158, 133, 151, 144] },
  { server: 'Server B', times: [98, 112, 125, 108, 135, 118, 142, 122, 115, 138, 125, 148, 119, 132, 128] },
  { server: 'Server C', times: [145, 162, 178, 155, 185, 168, 192, 175, 158, 182, 170, 188, 163, 178, 172] },
  { server: 'Server D', times: [88, 95, 102, 92, 108, 98, 115, 105, 89, 112, 101, 118, 94, 108, 103] }
]

// 實驗數據
const experimentData = [
  { condition: '對照組', measurements: [12.5, 13.2, 12.8, 13.5, 12.9, 13.1, 12.7, 13.4, 12.6, 13.0, 12.8, 13.3, 12.9, 13.2, 12.7] },
  { condition: '處理組A', measurements: [14.2, 15.1, 14.8, 15.5, 14.6, 15.2, 14.9, 15.8, 14.5, 15.0, 14.7, 15.4, 14.8, 15.3, 14.9] },
  { condition: '處理組B', measurements: [16.8, 17.5, 16.9, 17.8, 17.1, 17.6, 16.7, 17.9, 16.5, 17.2, 16.8, 17.7, 17.0, 17.4, 16.9] },
  { condition: '處理組C', measurements: [13.8, 14.5, 13.9, 14.8, 14.1, 14.6, 13.7, 14.9, 13.6, 14.2, 13.8, 14.7, 14.0, 14.4, 13.9] }
]

export default function BoxPlotDemo() {
  // 基本設定
  const [selectedDataset, setSelectedDataset] = useState('scores')
  const [chartWidth, setChartWidth] = useState(600)
  const [chartHeight, setChartHeight] = useState(500)
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical')
  
  // 箱體配置
  const [boxWidth, setBoxWidth] = useState(40)
  const [whiskerWidth, setWhiskerWidth] = useState(20)
  const [boxFillOpacity, setBoxFillOpacity] = useState(0.7)
  
  // 統計設定
  const [statisticsMethod, setStatisticsMethod] = useState<'standard' | 'tukey' | 'percentile'>('tukey')
  const [meanStyle, setMeanStyle] = useState<'circle' | 'diamond' | 'square'>('diamond')
  
  // 異常值設定
  const [outlierRadius, setOutlierRadius] = useState(3)
  
  // 樣式配置
  const [colorScheme, setColorScheme] = useState<'custom' | 'blues' | 'greens' | 'oranges' | 'reds' | 'purples'>('custom')
  
  // 顯示控制
  const [showOutliers, setShowOutliers] = useState(true)
  const [showMean, setShowMean] = useState(true)
  const [showMedian, setShowMedian] = useState(true)
  const [showWhiskers, setShowWhiskers] = useState(true)
  
  // 散點配置
  const [showAllPoints, setShowAllPoints] = useState(false)
  const [pointColorMode, setPointColorMode] = useState<'uniform' | 'by-value' | 'by-category'>('uniform')
  const [jitterWidth, setJitterWidth] = useState(0.6)
  const [pointRadius, setPointRadius] = useState(2)
  const [pointOpacity, setPointOpacity] = useState(0.6)
  
  // 動畫交互
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)

  // 當前資料和配置
  const { currentData, config, datasetInfo } = useMemo(() => {
    switch (selectedDataset) {
      case 'scores':
        return {
          currentData: studentScoresData,
          config: {
            title: '學生成績分佈分析',
            description: '不同科目的成績分佈統計比較',
            colors: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554']
          },
          datasetInfo: {
            name: '學生成績',
            description: '分析不同科目的成績分佈特徵和離群值',
            totalGroups: studentScoresData.length,
            features: ['成績分佈', '科目比較', '異常值檢測']
          }
        }
      
      case 'salary':
        return {
          currentData: salaryData,
          config: {
            title: '公司薪資分佈分析',
            description: '各部門薪資水平統計比較',
            colors: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b']
          },
          datasetInfo: {
            name: '公司薪資',
            description: '比較各部門的薪資分佈和薪資範圍',
            totalGroups: salaryData.length,
            features: ['薪資分析', '部門比較', '薪資公平性']
          }
        }
      
      case 'response':
        return {
          currentData: responseTimeData,
          config: {
            title: '伺服器響應時間分析',
            description: '不同伺服器的響應時間分佈',
            colors: ['#f59e0b', '#d97706', '#b45309', '#92400e']
          },
          datasetInfo: {
            name: '響應時間',
            description: '監控和比較各伺服器的性能表現',
            totalGroups: responseTimeData.length,
            features: ['性能監控', '伺服器比較', '延遲分析']
          }
        }
      
      case 'experiment':
        return {
          currentData: experimentData,
          config: {
            title: '實驗數據分佈分析',
            description: '不同實驗條件下的測量結果',
            colors: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6']
          },
          datasetInfo: {
            name: '實驗數據',
            description: '比較不同實驗條件的效果差異',
            totalGroups: experimentData.length,
            features: ['實驗分析', '條件比較', '統計顯著性']
          }
        }
      
      default:
        return {
          currentData: studentScoresData,
          config: { title: '箱形圖', description: '', colors: [] },
          datasetInfo: { name: '', description: '', totalGroups: 0, features: [] }
        }
    }
  }, [selectedDataset])

  // 數據鍵值映射
  const dataKeys = useMemo(() => {
    return {
      labelKey: selectedDataset === 'scores' ? 'subject' : 
               selectedDataset === 'salary' ? 'department' :
               selectedDataset === 'response' ? 'server' : 'condition',
      valuesKey: selectedDataset === 'scores' ? 'scores' : 
                selectedDataset === 'salary' ? 'salaries' :
                selectedDataset === 'response' ? 'times' : 'measurements'
    }
  }, [selectedDataset])

  // 統計摘要
  const statisticsSummary = useMemo(() => {
    const allStats = currentData.map((row: any) => {
      const values: number[] = row[dataKeys.valuesKey]
      const sorted = [...values].sort((a, b) => a - b)
      const n = sorted.length
      const q1 = sorted[Math.floor((n - 1) * 0.25)]
      const median = n % 2 === 0 
        ? (sorted[Math.floor(n / 2) - 1] + sorted[Math.floor(n / 2)]) / 2
        : sorted[Math.floor(n / 2)]
      const q3 = sorted[Math.floor((n - 1) * 0.75)]
      const mean = values.reduce((sum, val) => sum + val, 0) / n
      const iqr = q3 - q1
      const outliers = values.filter(val => val < q1 - 1.5 * iqr || val > q3 + 1.5 * iqr)
      
      return {
        label: row[dataKeys.labelKey],
        count: n,
        min: Math.min(...values),
        q1,
        median,
        q3,
        max: Math.max(...values),
        mean,
        outliers: outliers.length,
        iqr
      }
    })

    const totalSamples = allStats.reduce((sum, stat) => sum + stat.count, 0)
    const totalOutliers = allStats.reduce((sum, stat) => sum + stat.outliers, 0)
    const avgMedian = allStats.reduce((sum, stat) => sum + stat.median, 0) / allStats.length
    const avgMean = allStats.reduce((sum, stat) => sum + stat.mean, 0) / allStats.length

    return {
      stats: allStats,
      summary: {
        totalSamples,
        totalOutliers,
        avgMedian,
        avgMean,
        groups: allStats.length
      }
    }
  }, [currentData, dataKeys])

  // DataTable 欄位配置
  const dataTableColumns = [
    {
      key: 'label',
      title: '組別',
      sortable: true,
      align: 'left' as const
    },
    {
      key: 'count',
      title: '樣本數',
      sortable: true,
      align: 'center' as const,
      formatter: (value: number) => (
        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium">
          {value}
        </span>
      )
    },
    {
      key: 'min',
      title: '最小值',
      sortable: true,
      align: 'right' as const,
      formatter: (value: number) => value.toFixed(1)
    },
    {
      key: 'q1',
      title: 'Q1',
      sortable: true,
      align: 'right' as const,
      formatter: (value: number) => value.toFixed(1)
    },
    {
      key: 'median',
      title: '中位數',
      sortable: true,
      align: 'right' as const,
      formatter: (value: number) => (
        <span className="font-medium text-gray-900">
          {value.toFixed(1)}
        </span>
      )
    },
    {
      key: 'q3',
      title: 'Q3',
      sortable: true,
      align: 'right' as const,
      formatter: (value: number) => value.toFixed(1)
    },
    {
      key: 'max',
      title: '最大值',
      sortable: true,
      align: 'right' as const,
      formatter: (value: number) => value.toFixed(1)
    },
    {
      key: 'mean',
      title: '平均值',
      sortable: true,
      align: 'right' as const,
      formatter: (value: number) => (
        <span className="text-green-700 font-medium">
          {value.toFixed(1)}
        </span>
      )
    },
    {
      key: 'outliers',
      title: '異常值',
      sortable: true,
      align: 'center' as const,
      formatter: (value: number) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          value > 0 
            ? 'bg-red-100 text-red-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {value}
        </span>
      )
    }
  ]

  return (
    <DemoPageTemplate
      title="箱形圖展示"
      description="統計分析和數據分佈可視化工具，適用於比較多組數據的分佈特徵和異常值檢測"
    >
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* 控制面板 */}
        <div className="xl:col-span-1">
          <ModernControlPanel title="箱形圖設定" icon={<ChartBarIcon className="w-5 h-5" />}>
            <ControlGroup title="基本設定" icon={<CogIcon className="w-4 h-4" />} cols={1}>
              <SelectControl
                label="資料集"
                value={selectedDataset}
                onChange={setSelectedDataset}
                options={[
                  { value: 'scores', label: '學生成績' },
                  { value: 'salary', label: '公司薪資' },
                  { value: 'response', label: '響應時間' },
                  { value: 'experiment', label: '實驗數據' }
                ]}
              />
              <SelectControl
                label="圖表方向"
                value={orientation}
                onChange={setOrientation}
                options={[
                  { value: 'vertical', label: '垂直' },
                  { value: 'horizontal', label: '水平' }
                ]}
              />
            </ControlGroup>

            <ControlGroup title="尺寸配置" icon={<AdjustmentsHorizontalIcon className="w-4 h-4" />} cols={1}>
              <RangeSlider
                label="圖表寬度"
                value={chartWidth}
                onChange={setChartWidth}
                min={400}
                max={1000}
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

            <ControlGroup title="箱體配置" icon={<ChartBarIcon className="w-4 h-4" />} cols={1}>
              <RangeSlider
                label="箱體寬度"
                value={boxWidth}
                onChange={setBoxWidth}
                min={20}
                max={80}
                step={5}
                suffix="px"
              />
              <RangeSlider
                label="鬚線寬度"
                value={whiskerWidth}
                onChange={setWhiskerWidth}
                min={10}
                max={40}
                step={2}
                suffix="px"
              />
              <RangeSlider
                label="填充透明度"
                value={boxFillOpacity}
                onChange={setBoxFillOpacity}
                min={0.1}
                max={1}
                step={0.1}
                suffix="%"
              />
            </ControlGroup>

            <ControlGroup title="統計設定" icon={<CalculatorIcon className="w-4 h-4" />} cols={1}>
              <SelectControl
                label="統計方法"
                value={statisticsMethod}
                onChange={setStatisticsMethod}
                options={[
                  { value: 'tukey', label: 'Tukey方法' },
                  { value: 'standard', label: '標準方法' },
                  { value: 'percentile', label: '百分位數方法' }
                ]}
              />
              <SelectControl
                label="平均值標記"
                value={meanStyle}
                onChange={setMeanStyle}
                options={[
                  { value: 'diamond', label: '菱形' },
                  { value: 'circle', label: '圓形' },
                  { value: 'square', label: '方形' }
                ]}
              />
              <RangeSlider
                label="異常值半徑"
                value={outlierRadius}
                onChange={setOutlierRadius}
                min={1}
                max={8}
                step={0.5}
                suffix="px"
              />
            </ControlGroup>

            <ControlGroup title="樣式配置" icon={<PaintBrushIcon className="w-4 h-4" />} cols={1}>
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

            <ControlGroup title="顯示控制" icon={<EyeIcon className="w-4 h-4" />} cols={1}>
              <ToggleControl
                label="顯示異常值"
                checked={showOutliers}
                onChange={setShowOutliers}
              />
              <ToggleControl
                label="顯示平均值"
                checked={showMean}
                onChange={setShowMean}
              />
              <ToggleControl
                label="顯示中位數"
                checked={showMedian}
                onChange={setShowMedian}
              />
              <ToggleControl
                label="顯示鬚線"
                checked={showWhiskers}
                onChange={setShowWhiskers}
              />
            </ControlGroup>

            <ControlGroup title="散點配置" icon={<Square3Stack3DIcon className="w-4 h-4" />} cols={1}>
              <ToggleControl
                label="顯示所有散點"
                checked={showAllPoints}
                onChange={setShowAllPoints}
              />
              {showAllPoints && (
                <>
                  <SelectControl
                    label="散點顏色模式"
                    value={pointColorMode}
                    onChange={setPointColorMode}
                    options={[
                      { value: 'uniform', label: '統一顏色' },
                      { value: 'by-category', label: '依類別' },
                      { value: 'by-value', label: '依數值' }
                    ]}
                  />
                  <RangeSlider
                    label="散點擴散寬度"
                    value={jitterWidth}
                    onChange={setJitterWidth}
                    min={0.1}
                    max={1}
                    step={0.1}
                    suffix="%"
                  />
                  <RangeSlider
                    label="散點半徑"
                    value={pointRadius}
                    onChange={setPointRadius}
                    min={1}
                    max={5}
                    step={0.5}
                    suffix="px"
                  />
                  <RangeSlider
                    label="散點透明度"
                    value={pointOpacity}
                    onChange={setPointOpacity}
                    min={0.1}
                    max={1}
                    step={0.1}
                    suffix="%"
                  />
                </>
              )}
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
          
          {/* 統計摘要卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`${designTokens.colors.cardBg} backdrop-blur-md rounded-2xl border ${designTokens.colors.border} p-4 space-y-3 mt-4`}
          >
            <div className="flex items-center gap-2">
              <CalculatorIcon className="w-5 h-5 text-blue-500" />
              <h3 className={`${designTokens.typography.heading3} text-gray-800`}>
                統計摘要
              </h3>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">數據集</span>
                <span className="font-medium text-gray-900">{datasetInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">組別數</span>
                <span className="font-medium text-gray-900">{statisticsSummary.summary.groups}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">總樣本數</span>
                <span className="font-medium text-gray-900">{statisticsSummary.summary.totalSamples}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">總異常值</span>
                <span className="font-medium text-red-600">{statisticsSummary.summary.totalOutliers}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">平均中位數</span>
                <span className="font-medium text-gray-900">{statisticsSummary.summary.avgMedian.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">平均均值</span>
                <span className="font-medium text-green-700">{statisticsSummary.summary.avgMean.toFixed(1)}</span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-3">
              <div className="text-xs text-gray-500 mb-2">應用領域</div>
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

          {/* 箱形圖展示 */}
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
                    {config.title}
                  </h3>
                  <p className={`${designTokens.typography.body} text-gray-600 mt-1`}>
                    {config.description}
                  </p>
                </div>
                <div className="text-right text-sm text-gray-500">
                  {chartWidth} × {chartHeight}
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-center">
                <BoxPlot
                  data={currentData}
                  labelKey={dataKeys.labelKey}
                  valuesKey={dataKeys.valuesKey}
                  width={chartWidth}
                  height={chartHeight}
                  orientation={orientation}
                  boxWidth={boxWidth}
                  whiskerWidth={whiskerWidth}
                  showOutliers={showOutliers}
                  showMean={showMean}
                  showMedian={showMedian}
                  outlierRadius={outlierRadius}
                  meanStyle={meanStyle}
                  boxFillOpacity={boxFillOpacity}
                  statisticsMethod={statisticsMethod}
                  showWhiskers={showWhiskers}
                  colors={colorScheme === 'custom' ? config.colors : undefined}
                  colorScheme={colorScheme}
                  animate={animate}
                  interactive={interactive}
                  showAllPoints={showAllPoints}
                  pointColorMode={pointColorMode}
                  jitterWidth={jitterWidth}
                  pointRadius={pointRadius}
                  pointOpacity={pointOpacity}
                  onBoxClick={(data) => {
                    console.log('Box clicked:', data)
                  }}
                  onBoxHover={(data) => {
                    console.log('Box hovered:', data)
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* 統計數據表格 */}
          <DataTable
            title="統計摘要"
            data={statisticsSummary.stats}
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
                <code className="text-gray-800">{`import { BoxPlot } from '@registry/components/statistical/box-plot'

const data = [
  { ${dataKeys.labelKey}: '數學', ${dataKeys.valuesKey}: [85, 92, 78, 88, 95, 82, 90, 87] },
  { ${dataKeys.labelKey}: '英文', ${dataKeys.valuesKey}: [76, 88, 92, 85, 79, 91, 87, 83] },
  { ${dataKeys.labelKey}: '物理', ${dataKeys.valuesKey}: [88, 91, 85, 89, 92, 87, 90, 86] }
]

<BoxPlot
  data={data}
  labelKey="${dataKeys.labelKey}"
  valuesKey="${dataKeys.valuesKey}"
  width={${chartWidth}}
  height={${chartHeight}}
  orientation="${orientation}"
  boxWidth={${boxWidth}}
  whiskerWidth={${whiskerWidth}}
  showOutliers={${showOutliers}}
  showMean={${showMean}}
  showMedian={${showMedian}}
  meanStyle="${meanStyle}"
  boxFillOpacity={${boxFillOpacity}}
  statisticsMethod="${statisticsMethod}"
  showWhiskers={${showWhiskers}}
  colorScheme="${colorScheme}"
  animate={${animate}}
  interactive={${interactive}}${showAllPoints ? `
  showAllPoints={${showAllPoints}}
  pointColorMode="${pointColorMode}"
  jitterWidth={${jitterWidth}}
  pointRadius={${pointRadius}}
  pointOpacity={${pointOpacity}}` : ''}
  onBoxClick={(data) => console.log('Clicked:', data)}
  onBoxHover={(data) => console.log('Hovered:', data)}
/>`}</code>
              </pre>
            </div>
          </motion.div>
        </div>
      </div>
    </DemoPageTemplate>
  )
}