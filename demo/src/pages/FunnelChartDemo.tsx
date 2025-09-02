import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FunnelChart } from '@registry/components/basic/funnel-chart'
import { ExactFunnelChart } from '@registry/components/basic/exact-funnel-chart'
import DemoPageTemplate from '../components/ui/DemoPageTemplate'
import ModernControlPanel, { ControlGroup, RangeSlider, SelectControl, ToggleControl } from '../components/ui/ModernControlPanel'
import DataTable from '../components/ui/DataTable'
import { designTokens } from '../design/design-tokens'
import { 
  FunnelIcon,
  CogIcon,
  ChartBarSquareIcon,
  AdjustmentsHorizontalIcon,
  PaintBrushIcon,
  EyeIcon,
  Square3Stack3DIcon
} from '@heroicons/react/24/outline'

// 銷售漏斗資料
const salesFunnelData = [
  { stage: '潛在客戶', count: 10000, description: '初次接觸的潛在客戶' },
  { stage: '意向客戶', count: 5000, description: '表達購買意向的客戶' },
  { stage: '試用客戶', count: 2500, description: '開始試用產品的客戶' },
  { stage: '付費客戶', count: 1000, description: '完成付費的客戶' },
  { stage: '忠實客戶', count: 600, description: '長期使用的忠實客戶' }
]

// 網站轉換漏斗資料
const webFunnelData = [
  { stage: '訪問首頁', count: 50000, description: '網站首頁訪問量' },
  { stage: '瀏覽產品', count: 25000, description: '產品頁面瀏覽量' },
  { stage: '加入購物車', count: 8000, description: '加入購物車的用戶' },
  { stage: '開始結帳', count: 4000, description: '進入結帳流程的用戶' },
  { stage: '完成付款', count: 2800, description: '成功完成付款的用戶' }
]

// 招聘漏斗資料
const recruitmentFunnelData = [
  { stage: '履歷投遞', count: 1200, description: '收到的履歷數量' },
  { stage: '初步篩選', count: 600, description: '通過初步篩選的候選人' },
  { stage: '電話面試', count: 300, description: '電話面試的候選人' },
  { stage: '現場面試', count: 120, description: '現場面試的候選人' },
  { stage: '最終錄取', count: 50, description: '最終錄取的候選人' }
]

// 行銷活動漏斗資料
const marketingFunnelData = [
  { stage: '廣告曝光', count: 100000, description: '廣告總曝光次數' },
  { stage: '點擊廣告', count: 5000, description: '點擊廣告的用戶' },
  { stage: '註冊會員', count: 1500, description: '註冊成為會員的用戶' },
  { stage: '首次購買', count: 450, description: '完成首次購買的用戶' },
  { stage: '重複購買', count: 180, description: '有重複購買行為的用戶' }
]

export default function FunnelChartDemo() {
  // 基本設定
  const [selectedDataset, setSelectedDataset] = useState('sales')
  const [chartWidth, setChartWidth] = useState(500)
  const [chartHeight, setChartHeight] = useState(600)
  
  // 形狀配置
  const [shape, setShape] = useState<'trapezoid' | 'rectangle' | 'curved'>('trapezoid')
  const [direction, setDirection] = useState<'top' | 'bottom' | 'left' | 'right'>('top')
  const [proportionalMode, setProportionalMode] = useState<'traditional' | 'height' | 'area' | 'consistent'>('traditional')
  
  // 收縮設定 (僅一致模式)
  const [shrinkageType, setShrinkageType] = useState<'fixed' | 'percentage' | 'data-driven'>('percentage')
  const [shrinkageAmount, setShrinkageAmount] = useState(0.1)
  const [minWidth, setMinWidth] = useState(50)
  
  // 樣式配置
  const [gap, setGap] = useState(4)
  const [cornerRadius, setCornerRadius] = useState(0)
  const [colorScheme, setColorScheme] = useState<'custom' | 'blues' | 'greens' | 'oranges' | 'reds' | 'purples'>('custom')
  
  // 標籤顯示
  const [showLabels, setShowLabels] = useState(true)
  const [showValues, setShowValues] = useState(true)
  const [showPercentages, setShowPercentages] = useState(true)
  const [showConversionRates, setShowConversionRates] = useState(true)
  const [labelPosition, setLabelPosition] = useState<'inside' | 'outside' | 'side'>('side')
  
  // 動畫交互
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)

  // 當前資料和配置
  const { currentData, config, datasetInfo } = useMemo(() => {
    switch (selectedDataset) {
      case 'sales':
        return {
          currentData: salesFunnelData,
          config: {
            title: '銷售漏斗分析',
            description: '從潛在客戶到忠實客戶的轉換流程',
            colors: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554']
          },
          datasetInfo: {
            name: '銷售漏斗',
            description: '展示客戶從初次接觸到成為忠實客戶的轉換流程',
            totalStages: salesFunnelData.length,
            features: ['客戶生命週期', '轉換率追蹤', '銷售效率分析']
          }
        }
      
      case 'web':
        return {
          currentData: webFunnelData,
          config: {
            title: '網站轉換漏斗',
            description: '網站訪問到完成購買的轉換流程',
            colors: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b']
          },
          datasetInfo: {
            name: '網站轉換',
            description: '追蹤用戶在網站上的行為轉換路徑',
            totalStages: webFunnelData.length,
            features: ['用戶行為分析', '購買轉換', '流程優化']
          }
        }
      
      case 'recruitment':
        return {
          currentData: recruitmentFunnelData,
          config: {
            title: '招聘漏斗分析',
            description: '從履歷投遞到最終錄取的篩選流程',
            colors: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f']
          },
          datasetInfo: {
            name: '招聘流程',
            description: '展示招聘過程中各階段的候選人篩選情況',
            totalStages: recruitmentFunnelData.length,
            features: ['人才篩選', '面試效率', '錄取率分析']
          }
        }
      
      case 'marketing':
        return {
          currentData: marketingFunnelData,
          config: {
            title: '行銷活動漏斗',
            description: '從廣告曝光到重複購買的轉換流程',
            colors: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95']
          },
          datasetInfo: {
            name: '行銷漏斗',
            description: '分析行銷活動中從曝光到最終轉換的各階段表現',
            totalStages: marketingFunnelData.length,
            features: ['廣告效果', '轉換追蹤', 'ROI 分析']
          }
        }
      
      default:
        return {
          currentData: salesFunnelData,
          config: { title: '漏斗圖', description: '', colors: [] },
          datasetInfo: { name: '', description: '', totalStages: 0, features: [] }
        }
    }
  }, [selectedDataset])

  // 數據統計
  const dataStats = useMemo(() => {
    const values = currentData.map(d => d.count)
    const totalConversion = currentData.length > 0 ? (currentData[currentData.length - 1].count / currentData[0].count) * 100 : 0
    const maxLoss = Math.max(...currentData.slice(0, -1).map((d, i) => 
      ((d.count - currentData[i + 1].count) / d.count) * 100
    ))
    
    return {
      totalStart: values[0] || 0,
      totalEnd: values[values.length - 1] || 0,
      totalConversion: totalConversion,
      maxStepLoss: maxLoss,
      avgConversion: currentData.slice(1).reduce((acc, curr, i) => 
        acc + ((curr.count / currentData[i].count) * 100), 0) / Math.max(1, currentData.length - 1)
    }
  }, [currentData])

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
            { value: 'sales', label: '銷售漏斗' },
            { value: 'web', label: '網站轉換' },
            { value: 'recruitment', label: '招聘流程' },
            { value: 'marketing', label: '行銷活動' }
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
          min: 300,
          max: 800,
          step: 50
        },
        {
          type: 'range' as const,
          label: '圖表高度',
          value: chartHeight,
          onChange: setChartHeight,
          min: 400,
          max: 900,
          step: 50
        }
      ]
    },
    {
      title: '形狀配置',
      icon: FunnelIcon,
      controls: [
        {
          type: 'select' as const,
          label: '形狀類型',
          value: shape,
          onChange: setShape,
          options: [
            { value: 'trapezoid', label: '梯形' },
            { value: 'rectangle', label: '矩形' },
            { value: 'curved', label: '曲線' }
          ]
        },
        {
          type: 'select' as const,
          label: '漏斗方向',
          value: direction,
          onChange: setDirection,
          options: [
            { value: 'top', label: '向下收縮（傳統）' },
            { value: 'bottom', label: '向上收縮（倒置）' },
            { value: 'left', label: '向右收縮（橫向）' },
            { value: 'right', label: '向左收縮（橫向）' }
          ]
        },
        {
          type: 'select' as const,
          label: '比例模式',
          value: proportionalMode,
          onChange: setProportionalMode,
          options: [
            { value: 'traditional', label: '傳統模式' },
            { value: 'height', label: '高度比例' },
            { value: 'area', label: '面積比例' },
            { value: 'consistent', label: '一致收縮' }
          ]
        }
      ]
    },
    {
      title: '收縮設定',
      icon: AdjustmentsHorizontalIcon,
      isVisible: proportionalMode === 'consistent',
      controls: [
        {
          type: 'select' as const,
          label: '收縮類型',
          value: shrinkageType,
          onChange: setShrinkageType,
          options: [
            { value: 'percentage', label: '比例收縮' },
            { value: 'fixed', label: '固定收縮' },
            { value: 'data-driven', label: '數據驅動' }
          ]
        },
        {
          type: 'range' as const,
          label: shrinkageType === 'percentage' ? '收縮比例' : '收縮量',
          value: shrinkageAmount,
          onChange: setShrinkageAmount,
          min: shrinkageType === 'percentage' ? 0.05 : 10,
          max: shrinkageType === 'percentage' ? 0.3 : 50,
          step: shrinkageType === 'percentage' ? 0.01 : 1,
          suffix: shrinkageType === 'percentage' ? '%' : 'px',
          disabled: shrinkageType === 'data-driven'
        },
        {
          type: 'range' as const,
          label: '最小寬度',
          value: minWidth,
          onChange: setMinWidth,
          min: 20,
          max: 150,
          step: 5,
          suffix: 'px'
        }
      ]
    },
    {
      title: '樣式配置',
      icon: PaintBrushIcon,
      controls: [
        {
          type: 'range' as const,
          label: '段落間隙',
          value: gap,
          onChange: setGap,
          min: 0,
          max: 20,
          step: 1,
          suffix: 'px'
        },
        {
          type: 'range' as const,
          label: '圓角半徑',
          value: cornerRadius,
          onChange: setCornerRadius,
          min: 0,
          max: 20,
          step: 1,
          suffix: 'px'
        },
        {
          type: 'select' as const,
          label: '顏色主題',
          value: colorScheme,
          onChange: setColorScheme,
          options: [
            { value: 'custom', label: '自訂' },
            { value: 'blues', label: '藍色系' },
            { value: 'greens', label: '綠色系' },
            { value: 'oranges', label: '橙色系' },
            { value: 'reds', label: '紅色系' },
            { value: 'purples', label: '紫色系' }
          ]
        }
      ]
    },
    {
      title: '標籤顯示',
      icon: EyeIcon,
      controls: [
        {
          type: 'toggle' as const,
          label: '顯示標籤',
          value: showLabels,
          onChange: setShowLabels
        },
        {
          type: 'toggle' as const,
          label: '顯示數值',
          value: showValues,
          onChange: setShowValues
        },
        {
          type: 'toggle' as const,
          label: '顯示百分比',
          value: showPercentages,
          onChange: setShowPercentages
        },
        {
          type: 'toggle' as const,
          label: '顯示轉換率',
          value: showConversionRates,
          onChange: setShowConversionRates
        },
        {
          type: 'select' as const,
          label: '標籤位置',
          value: labelPosition,
          onChange: setLabelPosition,
          options: [
            { value: 'side', label: '側邊' },
            { value: 'inside', label: '內部' },
            { value: 'outside', label: '外部' }
          ],
          disabled: !showLabels
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
      key: 'stage',
      title: '階段',
      sortable: true,
      align: 'left' as const
    },
    {
      key: 'count',
      title: '數量',
      sortable: true,
      align: 'right' as const,
      formatter: (value: number) => (
        <span className="font-medium text-gray-900">
          {value.toLocaleString()}
        </span>
      )
    },
    {
      key: 'percentage',
      title: '佔比',
      align: 'right' as const,
      formatter: (value: number, row: any) => {
        const maxValue = Math.max(...currentData.map(d => d.count))
        const percentage = (row.count / maxValue) * 100
        return (
          <span className="text-sm font-medium text-blue-600">
            {percentage.toFixed(1)}%
          </span>
        )
      }
    },
    {
      key: 'conversion',
      title: '轉換率',
      align: 'right' as const,
      formatter: (value: number, row: any) => {
        const index = currentData.findIndex(d => d.stage === row.stage)
        const conversionRate = index === 0 ? 100 : (row.count / currentData[index - 1].count) * 100
        return (
          <span className={`px-2 py-1 rounded text-xs font-medium ${
            conversionRate >= 50 
              ? 'bg-green-100 text-green-800' 
              : conversionRate >= 25 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {conversionRate.toFixed(1)}%
          </span>
        )
      }
    },
    {
      key: 'description',
      title: '描述',
      align: 'left' as const
    }
  ]

  return (
    <DemoPageTemplate
      title="漏斗圖展示"
      description="轉換率分析工具，適用於銷售漏斗、用戶轉換路徑、招聘流程等多階段數據追蹤"
    >
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* 控制面板 */}
        <div className="xl:col-span-1">
          <ModernControlPanel title="漏斗圖設定" icon={<FunnelIcon className="w-5 h-5" />}>
            <ControlGroup title="基本設定" icon={<CogIcon className="w-4 h-4" />} cols={1}>
              <SelectControl
                label="資料集"
                value={selectedDataset}
                onChange={setSelectedDataset}
                options={[
                  { value: 'sales', label: '銷售漏斗' },
                  { value: 'web', label: '網站轉換' },
                  { value: 'recruitment', label: '招聘流程' },
                  { value: 'marketing', label: '行銷活動' }
                ]}
              />
            </ControlGroup>

            <ControlGroup title="尺寸配置" icon={<AdjustmentsHorizontalIcon className="w-4 h-4" />} cols={1}>
              <RangeSlider
                label="圖表寬度"
                value={chartWidth}
                onChange={setChartWidth}
                min={300}
                max={800}
                step={50}
              />
              <RangeSlider
                label="圖表高度"
                value={chartHeight}
                onChange={setChartHeight}
                min={400}
                max={900}
                step={50}
              />
            </ControlGroup>

            <ControlGroup title="形狀配置" icon={<FunnelIcon className="w-4 h-4" />} cols={1}>
              <SelectControl
                label="形狀類型"
                value={shape}
                onChange={setShape}
                options={[
                  { value: 'trapezoid', label: '梯形' },
                  { value: 'rectangle', label: '矩形' },
                  { value: 'curved', label: '曲線' }
                ]}
              />
              <SelectControl
                label="漏斗方向"
                value={direction}
                onChange={setDirection}
                options={[
                  { value: 'top', label: '向下收縮（傳統）' },
                  { value: 'bottom', label: '向上收縮（倒置）' },
                  { value: 'left', label: '向右收縮（橫向）' },
                  { value: 'right', label: '向左收縮（橫向）' }
                ]}
              />
              <SelectControl
                label="比例模式"
                value={proportionalMode}
                onChange={setProportionalMode}
                options={[
                  { value: 'traditional', label: '傳統模式' },
                  { value: 'height', label: '高度比例' },
                  { value: 'area', label: '面積比例' },
                  { value: 'consistent', label: '一致收縮' }
                ]}
              />
            </ControlGroup>

            {proportionalMode === 'consistent' && (
              <ControlGroup title="收縮設定" icon={<AdjustmentsHorizontalIcon className="w-4 h-4" />} cols={1}>
                <SelectControl
                  label="收縮類型"
                  value={shrinkageType}
                  onChange={setShrinkageType}
                  options={[
                    { value: 'percentage', label: '比例收縮' },
                    { value: 'fixed', label: '固定收縮' },
                    { value: 'data-driven', label: '數據驅動' }
                  ]}
                />
                {shrinkageType !== 'data-driven' && (
                  <RangeSlider
                    label={shrinkageType === 'percentage' ? '收縮比例' : '收縮量'}
                    value={shrinkageAmount}
                    onChange={setShrinkageAmount}
                    min={shrinkageType === 'percentage' ? 0.05 : 10}
                    max={shrinkageType === 'percentage' ? 0.3 : 50}
                    step={shrinkageType === 'percentage' ? 0.01 : 1}
                    suffix={shrinkageType === 'percentage' ? '%' : 'px'}
                  />
                )}
                <RangeSlider
                  label="最小寬度"
                  value={minWidth}
                  onChange={setMinWidth}
                  min={20}
                  max={150}
                  step={5}
                  suffix="px"
                />
              </ControlGroup>
            )}

            <ControlGroup title="樣式配置" icon={<PaintBrushIcon className="w-4 h-4" />} cols={1}>
              <RangeSlider
                label="段落間隙"
                value={gap}
                onChange={setGap}
                min={0}
                max={20}
                step={1}
                suffix="px"
              />
              <RangeSlider
                label="圓角半徑"
                value={cornerRadius}
                onChange={setCornerRadius}
                min={0}
                max={20}
                step={1}
                suffix="px"
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

            <ControlGroup title="標籤顯示" icon={<EyeIcon className="w-4 h-4" />} cols={1}>
              <ToggleControl
                label="顯示標籤"
                checked={showLabels}
                onChange={setShowLabels}
              />
              <ToggleControl
                label="顯示數值"
                checked={showValues}
                onChange={setShowValues}
              />
              <ToggleControl
                label="顯示百分比"
                checked={showPercentages}
                onChange={setShowPercentages}
              />
              <ToggleControl
                label="顯示轉換率"
                checked={showConversionRates}
                onChange={setShowConversionRates}
              />
              <SelectControl
                label="標籤位置"
                value={labelPosition}
                onChange={setLabelPosition}
                options={[
                  { value: 'side', label: '側邊' },
                  { value: 'inside', label: '內部' },
                  { value: 'outside', label: '外部' }
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
          
          {/* 統計資訊卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`${designTokens.colors.cardBg} backdrop-blur-md rounded-2xl border ${designTokens.colors.border} p-4 space-y-3 mt-4`}
          >
            <div className="flex items-center gap-2">
              <ChartBarSquareIcon className="w-5 h-5 text-blue-500" />
              <h3 className={`${designTokens.typography.heading3} text-gray-800`}>
                轉換統計
              </h3>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">漏斗階段</span>
                <span className="font-medium text-gray-900">{datasetInfo.totalStages}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">起始數量</span>
                <span className="font-medium text-gray-900">{dataStats.totalStart.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最終數量</span>
                <span className="font-medium text-gray-900">{dataStats.totalEnd.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">總轉換率</span>
                <span className={`font-medium ${
                  dataStats.totalConversion >= 20 ? 'text-green-600' :
                  dataStats.totalConversion >= 10 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {dataStats.totalConversion.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">最大流失率</span>
                <span className="font-medium text-red-600">{dataStats.maxStepLoss.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">平均轉換率</span>
                <span className="font-medium text-gray-900">{dataStats.avgConversion.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="border-t border-gray-100 pt-3">
              <div className="text-xs text-gray-500 mb-2">應用場景</div>
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

          {/* 傳統漏斗圖展示 */}
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
                <FunnelChart
                  data={currentData}
                  labelKey="stage"
                  valueKey="count"
                  width={chartWidth}
                  height={chartHeight}
                  shape={shape}
                  direction={direction}
                  proportionalMode={proportionalMode}
                  shrinkageType={shrinkageType}
                  shrinkageAmount={shrinkageAmount}
                  minWidth={minWidth}
                  gap={gap}
                  cornerRadius={cornerRadius}
                  colors={colorScheme === 'custom' ? config.colors : undefined}
                  colorScheme={colorScheme}
                  showLabels={showLabels}
                  showValues={showValues}
                  showPercentages={showPercentages}
                  showConversionRates={showConversionRates}
                  labelPosition={labelPosition}
                  animate={animate}
                  interactive={interactive}
                  onSegmentClick={(data) => {
                    console.log('Segment clicked:', data)
                  }}
                  onSegmentHover={(data) => {
                    console.log('Segment hovered:', data)
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* 數據表格 */}
          <DataTable
            title="漏斗數據詳情"
            data={currentData}
            columns={dataTableColumns}
            maxRows={10}
          />

          {/* 流線型漏斗展示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`${designTokens.colors.cardBg} backdrop-blur-md rounded-2xl border ${designTokens.colors.border}`}
          >
            <div className="p-6 border-b border-gray-100">
              <h3 className={`${designTokens.typography.heading3} text-gray-800`}>
                流線型漏斗圖
              </h3>
              <p className={`${designTokens.typography.body} text-gray-600 mt-1`}>
                採用平滑曲線設計的現代漏斗圖，支援漸變效果和動畫
              </p>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">調查問卷轉換</h4>
                  <ExactFunnelChart
                    data={[
                      { step: 1, value: 62259, label: 'Survey Started' },
                      { step: 2, value: 25465, label: 'Completed Survey' },
                      { step: 3, value: 405, label: 'Click End Card*' }
                    ]}
                    width={350}
                    height={200}
                    background="#f5f5f5"
                    gradient1="#FF6B6B"
                    gradient2="#4ECDC4"
                    values="#333333"
                    labels="#555555"
                    percentages="#666666"
                  />
                </div>

                <div className="text-center">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">產品試用流程</h4>
                  <ExactFunnelChart
                    data={[
                      { step: 1, value: 15000, label: 'Trial Sign Up' },
                      { step: 2, value: 8500, label: 'Active Trial' },
                      { step: 3, value: 3200, label: 'Feature Usage' },
                      { step: 4, value: 1800, label: 'Conversion' }
                    ]}
                    width={350}
                    height={200}
                    background="#f9f9f9"
                    gradient1="#8B5CF6"
                    gradient2="#06B6D4"
                    values="#333333"
                    labels="#555555"
                    percentages="#666666"
                  />
                </div>
              </div>
            </div>
          </motion.div>

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
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">傳統漏斗圖</h4>
                  <pre className={`${designTokens.colors.codeBg} rounded-xl p-4 overflow-x-auto text-sm`}>
                    <code className="text-gray-800">{`import { FunnelChart } from '@registry/components/basic/funnel-chart'

const data = [
  { stage: '潛在客戶', count: 10000 },
  { stage: '意向客戶', count: 5000 },
  { stage: '試用客戶', count: 2500 },
  { stage: '付費客戶', count: 1000 },
  { stage: '忠實客戶', count: 600 }
]

<FunnelChart
  data={data}
  labelKey="stage"
  valueKey="count"
  width={${chartWidth}}
  height={${chartHeight}}
  shape="${shape}"
  direction="${direction}"
  proportionalMode="${proportionalMode}"${proportionalMode === 'consistent' ? `
  shrinkageType="${shrinkageType}"
  shrinkageAmount={${shrinkageAmount}}
  minWidth={${minWidth}}` : ''}
  gap={${gap}}
  cornerRadius={${cornerRadius}}
  colorScheme="${colorScheme}"
  showLabels={${showLabels}}
  showValues={${showValues}}
  showPercentages={${showPercentages}}
  showConversionRates={${showConversionRates}}
  labelPosition="${labelPosition}"
  animate={${animate}}
  interactive={${interactive}}
  onSegmentClick={(data) => console.log('Clicked:', data)}
/>`}</code>
                  </pre>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">流線型漏斗圖</h4>
                  <pre className={`${designTokens.colors.codeBg} rounded-xl p-4 overflow-x-auto text-sm`}>
                    <code className="text-gray-800">{`import { ExactFunnelChartV2 as ExactFunnelChart } from '@registry/components/basic/exact-funnel-chart'

const surveyData = [
  { step: 1, value: 62259, label: 'Survey Started' },
  { step: 2, value: 25465, label: 'Completed Survey' },
  { step: 3, value: 405, label: 'Click End Card*' }
]

<ExactFunnelChart
  data={surveyData}
  width={350}
  height={200}
  background="#2a2a2a"
  gradient1="#FF6B6B"
  gradient2="#4ECDC4"
  values="#ffffff"
  labels="#cccccc"
  percentages="#888888"
/>`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DemoPageTemplate>
  )
}