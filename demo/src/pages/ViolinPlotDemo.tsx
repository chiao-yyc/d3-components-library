import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ViolinPlot } from '@registry/components/statistical/violin-plot'
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
  CodeExample
} from '../components/ui'
import { CogIcon, ChartPieIcon, ChartBarIcon, MusicalNoteIcon, CubeIcon, EyeIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/outline'

// 生成正常分佈數據
function generateNormalData(mean: number, std: number, count: number): number[] {
  const data: number[] = []
  for (let i = 0; i < count; i++) {
    // Box-Muller 變換生成正常分佈
    const u1 = Math.random()
    const u2 = Math.random()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    data.push(mean + std * z0)
  }
  return data
}

// 生成偏態分佈數據
function generateSkewedData(base: number, skew: number, count: number): number[] {
  const data: number[] = []
  for (let i = 0; i < count; i++) {
    const normal = generateNormalData(0, 1, 1)[0]
    const skewed = base + Math.sign(normal) * Math.pow(Math.abs(normal), skew)
    data.push(skewed)
  }
  return data
}

// 生成雙峰分佈數據
function generateBimodalData(mean1: number, mean2: number, std1: number, std2: number, count: number): number[] {
  const data: number[] = []
  for (let i = 0; i < count; i++) {
    if (Math.random() < 0.5) {
      data.push(...generateNormalData(mean1, std1, 1))
    } else {
      data.push(...generateNormalData(mean2, std2, 1))
    }
  }
  return data
}

// 藥物試驗數據
const drugTrialData = [
  { 
    group: '安慰劑組', 
    measurements: generateNormalData(100, 15, 80).concat([
      // 添加一些異常值
      140, 145, 60, 55
    ])
  },
  { 
    group: '低劑量組', 
    measurements: generateNormalData(110, 12, 75).concat([125, 130]) 
  },
  { 
    group: '中劑量組', 
    measurements: generateNormalData(125, 18, 85).concat([160, 40]) 
  },
  { 
    group: '高劑量組', 
    measurements: generateBimodalData(135, 150, 10, 8, 70) 
  }
]

// 學習成效數據
const learningData = [
  { 
    method: '傳統教學', 
    scores: generateNormalData(75, 12, 100) 
  },
  { 
    method: '互動教學', 
    scores: generateSkewedData(80, 0.8, 95).map(x => Math.max(0, Math.min(100, x))) 
  },
  { 
    method: '個人化學習', 
    scores: generateBimodalData(70, 90, 8, 6, 90) 
  },
  { 
    method: 'AI輔助學習', 
    scores: generateNormalData(88, 10, 85).concat([95, 98, 99]) 
  }
]

// 財務收益數據
const financeData = [
  { 
    strategy: '保守型', 
    returns: generateNormalData(5, 3, 120) 
  },
  { 
    strategy: '平衡型', 
    returns: generateNormalData(8, 6, 110).concat([-15, -12, 25, 28]) 
  },
  { 
    strategy: '成長型', 
    returns: generateSkewedData(12, 1.2, 100).concat([-20, -25, 35, 40]) 
  },
  { 
    strategy: '積極型', 
    returns: generateBimodalData(15, -5, 12, 8, 95) 
  }
]

// 生物多樣性數據
const biodiversityData = [
  { 
    habitat: '原始森林', 
    species_count: generateNormalData(45, 8, 60) 
  },
  { 
    habitat: '次生林', 
    species_count: generateNormalData(32, 12, 65) 
  },
  { 
    habitat: '農田', 
    species_count: generateSkewedData(18, 1.5, 70) 
  },
  { 
    habitat: '城市公園', 
    species_count: generateBimodalData(15, 28, 4, 6, 55) 
  }
]

export default function ViolinPlotDemo() {
  // 基本設定
  const [selectedDataset, setSelectedDataset] = useState('drug')
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical')
  
  // 小提琴配置
  const [violinWidth, setViolinWidth] = useState(80)
  const [resolution, setResolution] = useState(100)
  const [violinFillOpacity, setViolinFillOpacity] = useState(0.7)
  
  // 核密度估計
  const [kdeMethod, setKdeMethod] = useState<'gaussian' | 'epanechnikov' | 'triangular'>('gaussian')
  const [smoothing, setSmoothing] = useState(1)
  
  // 箱形圖配置
  const [showBoxPlot, setShowBoxPlot] = useState(true)
  const [boxPlotWidth, setBoxPlotWidth] = useState(15)
  
  // 樣式配置
  const [colorScheme, setColorScheme] = useState<'custom' | 'blues' | 'greens' | 'oranges' | 'reds' | 'purples'>('custom')
  
  // 顯示控制
  const [showMedian, setShowMedian] = useState(true)
  const [showMean, setShowMean] = useState(true)
  const [showQuartiles, setShowQuartiles] = useState(true)
  const [showOutliers, setShowOutliers] = useState(true)
  
  // 動畫交互
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)

  // 當前資料和配置
  const { currentData, config } = useMemo(() => {
    switch (selectedDataset) {
      case 'drug':
        return {
          currentData: drugTrialData,
          config: {
            title: '藥物臨床試驗效果分析',
            description: '不同劑量組的療效分佈比較（包含雙峰分佈）',
            colors: ['#ef4444', '#f97316', '#eab308', '#22c55e'],
            yLabel: '療效指標',
            xLabel: '試驗組別'
          },
          datasetInfo: {
            name: '藥物試驗',
            description: '分析不同劑量對治療效果的影響，包含雙峰分佈',
            totalGroups: drugTrialData.length,
            features: ['劑量反應', '雙峰分佈', '療效評估']
          }
        }
      
      case 'learning':
        return {
          currentData: learningData,
          config: {
            title: '教學方法學習成效分析',
            description: '不同教學方法的學習成果分佈',
            colors: ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981'],
            yLabel: '學習成績',
            xLabel: '教學方法'
          },
          datasetInfo: {
            name: '學習成效',
            description: '比較傳統與現代教學方法的學習效果',
            totalGroups: learningData.length,
            features: ['教學評估', '個人化學習', '成效對比']
          }
        }
      
      case 'finance':
        return {
          currentData: financeData,
          config: {
            title: '投資策略收益分析',
            description: '不同投資策略的收益率分佈（含風險評估）',
            colors: ['#16a34a', '#0891b2', '#dc2626', '#7c2d12'],
            yLabel: '年化收益率 (%)',
            xLabel: '投資策略'
          },
          datasetInfo: {
            name: '投資收益',
            description: '分析不同風險級別投資策略的收益分佈',
            totalGroups: financeData.length,
            features: ['風險評估', '收益分析', '策略比較']
          }
        }
      
      case 'biodiversity':
        return {
          currentData: biodiversityData,
          config: {
            title: '棲息地生物多樣性分析',
            description: '不同棲息地的物種數量分佈',
            colors: ['#15803d', '#059669', '#ca8a04', '#9a3412'],
            yLabel: '物種數量',
            xLabel: '棲息地類型'
          },
          datasetInfo: {
            name: '生物多樣性',
            description: '評估不同環境對生物多樣性的影響',
            totalGroups: biodiversityData.length,
            features: ['生態評估', '環境影響', '物種保護']
          }
        }
      
      default:
        return {
          currentData: drugTrialData,
          config: { title: '小提琴圖', description: '', colors: [], yLabel: '數值', xLabel: '分組' },
          datasetInfo: { name: '', description: '', totalGroups: 0, features: [] }
        }
    }
  }, [selectedDataset])

  // 數據鍵值映射
  const dataKeys = useMemo(() => {
    return {
      labelKey: selectedDataset === 'drug' ? 'group' : 
               selectedDataset === 'learning' ? 'method' :
               selectedDataset === 'finance' ? 'strategy' : 'habitat',
      valuesKey: selectedDataset === 'drug' ? 'measurements' : 
                selectedDataset === 'learning' ? 'scores' :
                selectedDataset === 'finance' ? 'returns' : 'species_count'
    }
  }, [selectedDataset])

  // 分佈分析
  const distributionAnalysis = useMemo(() => {
    const analysis = currentData.map((group: any) => {
      const values = group[dataKeys.valuesKey]
      const groupLabel = group[dataKeys.labelKey]
      
      // 統計計算
      const sorted = [...values].sort((a: number, b: number) => a - b)
      const n = sorted.length
      const mean = values.reduce((sum: number, val: number) => sum + val, 0) / n
      const median = n % 2 === 0 
        ? (sorted[Math.floor(n / 2) - 1] + sorted[Math.floor(n / 2)]) / 2
        : sorted[Math.floor(n / 2)]
      const variance = values.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / n
      const std = Math.sqrt(variance)
      
      // 分佈特徵
      const skewness = mean > median ? '右偏' : mean < median ? '左偏' : '對稱'
      const range = [Math.min(...values), Math.max(...values)]
      
      return {
        label: groupLabel,
        count: n,
        mean: mean,
        median: median,
        std: std,
        skewness: skewness,
        min: range[0],
        max: range[1],
        range: range[1] - range[0]
      }
    })

    const totalSamples = analysis.reduce((sum, stat) => sum + stat.count, 0)
    const avgMean = analysis.reduce((sum, stat) => sum + stat.mean, 0) / analysis.length
    const avgStd = analysis.reduce((sum, stat) => sum + stat.std, 0) / analysis.length

    return {
      groups: analysis,
      summary: {
        totalSamples,
        avgMean,
        avgStd,
        groups: analysis.length
      }
    }
  }, [currentData, dataKeys])

  return (
    <DemoPageTemplate
      title="ViolinPlot Demo"
      description="小提琴圖組件展示 - 結合核密度估計和箱形圖的進階統計分析"
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
                options={[
                  { value: 'drug', label: '藥物試驗' },
                  { value: 'learning', label: '學習成效' },
                  { value: 'finance', label: '投資收益' },
                  { value: 'biodiversity', label: '生物多樣性' }
                ]}
              />
              
              <SelectControl
                label="圖表方向"
                value={orientation}
                onChange={(value) => setOrientation(value as 'vertical' | 'horizontal')}
                options={[
                  { value: 'vertical', label: '垂直' },
                  { value: 'horizontal', label: '水平' }
                ]}
              />
              
              <SelectControl
                label="顏色主題"
                value={colorScheme}
                onChange={(value) => setColorScheme(value as any)}
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

            {/* KDE 設定 */}
            <ControlGroup title="核密度估計" icon={<ChartBarIcon className="w-4 h-4" />} cols={1}>
              <SelectControl
                label="KDE 方法"
                value={kdeMethod}
                onChange={(value) => setKdeMethod(value as any)}
                options={[
                  { value: 'gaussian', label: '高斯核 (最常用)' },
                  { value: 'epanechnikov', label: 'Epanechnikov (最優)' },
                  { value: 'triangular', label: '三角核 (快速)' }
                ]}
              />
              
              <RangeSlider
                label="解析度"
                value={resolution}
                min={50}
                max={200}
                step={10}
                onChange={setResolution}
              />
            </ControlGroup>

            {/* 小提琴設定 */}
            <ControlGroup title="小提琴配置" icon={<MusicalNoteIcon className="w-4 h-4" />} cols={1}>
              <RangeSlider
                label="最大寬度"
                value={violinWidth}
                min={40}
                max={120}
                step={5}
                onChange={setViolinWidth}
                suffix="px"
              />
              
              <RangeSlider
                label="平滑因子"
                value={smoothing}
                min={0.5}
                max={2}
                step={0.1}
                onChange={setSmoothing}
              />
              
              <RangeSlider
                label="填充透明度"
                value={violinFillOpacity}
                min={0.3}
                max={1}
                step={0.1}
                onChange={setViolinFillOpacity}
              />
            </ControlGroup>

            {/* 箱形圖設定 */}
            <ControlGroup title="箱形圖配置" icon={<CubeIcon className="w-4 h-4" />} cols={1}>
              <RangeSlider
                label="箱形圖寬度"
                value={boxPlotWidth}
                min={5}
                max={30}
                step={1}
                onChange={setBoxPlotWidth}
                suffix="px"
              />
            </ControlGroup>

            {/* 顯示選項 */}
            <ControlGroup title="顯示選項" icon={<EyeIcon className="w-4 h-4" />} cols={1}>
              <ToggleControl
                label="顯示箱形圖"
                checked={showBoxPlot}
                onChange={setShowBoxPlot}
                description="在小提琴中央顯示箱形圖"
              />
              
              <ToggleControl
                label="顯示中位數"
                checked={showMedian}
                onChange={setShowMedian}
                description="顯示中位數線"
              />
              
              <ToggleControl
                label="顯示平均值"
                checked={showMean}
                onChange={setShowMean}
                description="顯示平均值點"
              />
              
              <ToggleControl
                label="顯示四分位數"
                checked={showQuartiles}
                onChange={setShowQuartiles}
                description="顯示25%和75%分位數"
              />
            </ControlGroup>

            {/* 高級選項 */}
            <ControlGroup title="進階功能" icon={<WrenchScrewdriverIcon className="w-4 h-4" />} cols={2}>
              <ToggleControl
                label="顯示異常值"
                checked={showOutliers}
                onChange={setShowOutliers}
                description="顯示統計異常值點"
              />
              
              <ToggleControl
                label="動畫效果"
                checked={animate}
                onChange={setAnimate}
                description="圖表載入和更新動畫"
              />
              
              <ToggleControl
                label="互動功能"
                checked={interactive}
                onChange={setInteractive}
                description="懸停和點擊交互"
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
          subtitle={config.description}
          actions={
            <div className="flex items-center gap-2">
              <ChartPieIcon className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-gray-600">小提琴圖</span>
            </div>
          }
        >
          <div className="flex justify-center">
            <motion.div
              key={`${orientation}-${selectedDataset}-${violinWidth}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ViolinPlot
                data={currentData}
                labelAccessor={dataKeys.labelKey}
                valuesAccessor={dataKeys.valuesKey}
                width={800}
                height={500}
                orientation={orientation}
                violinWidth={violinWidth}
                resolution={resolution}
                showBoxPlot={showBoxPlot}
                boxPlotWidth={boxPlotWidth}
                showMedian={showMedian}
                showMean={showMean}
                showQuartiles={showQuartiles}
                showOutliers={showOutliers}
                kdeMethod={kdeMethod}
                smoothing={smoothing}
                violinFillOpacity={violinFillOpacity}
                colors={colorScheme === 'custom' ? config.colors : undefined}
                animate={animate}
                interactive={interactive}
                onDataClick={(data) => {
                  console.log('Violin clicked:', data)
                }}
                onDataHover={(data) => {
                  console.log('Violin hovered:', data)
                }}
              />
            </motion.div>
          </div>
          
          <StatusDisplay items={[
            { label: '數據集', value: config.title },
            { label: '分組數', value: currentData.length },
            { label: '圖表方向', value: orientation === 'vertical' ? '垂直' : '水平' },
            { label: 'KDE方法', value: kdeMethod },
            { label: '動畫', value: animate ? '開啟' : '關閉', color: animate ? '#10b981' : '#6b7280' }
          ]} />
        </ChartContainer>
          
          {/* 統計分析 */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full" />
            <h3 className="text-xl font-semibold text-gray-800">分佈特徵分析</h3>
          </div>
          
          {distributionAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentData.map((group: any, index: number) => {
                const values = group[dataKeys.valuesKey]
                const groupLabel = group[dataKeys.labelKey]
                
                const sorted = [...values].sort((a: number, b: number) => a - b)
                const n = sorted.length
                const mean = values.reduce((sum: number, val: number) => sum + val, 0) / n
                const median = n % 2 === 0 
                  ? (sorted[Math.floor(n / 2) - 1] + sorted[Math.floor(n / 2)]) / 2
                  : sorted[Math.floor(n / 2)]
                const variance = values.reduce((sum: number, val: number) => sum + Math.pow(val - mean, 2), 0) / n
                const std = Math.sqrt(variance)
                const skewness = mean > median ? '右偏' : mean < median ? '左偏' : '對稱'
                
                return (
                  <motion.div 
                    key={index} 
                    className="p-5 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: config.colors[index] }}
                      />
                      <h4 className="font-semibold text-gray-900">{groupLabel}</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                      <div>樣本數: <span className="font-medium">{n}</span></div>
                      <div>平均值: <span className="font-medium">{mean.toFixed(2)}</span></div>
                      <div>中位數: <span className="font-medium">{median.toFixed(2)}</span></div>
                      <div>標準差: <span className="font-medium">{std.toFixed(2)}</span></div>
                      <div>分佈: <span className="font-medium">{skewness}</span></div>
                      <div>範圍: <span className="font-medium">{Math.min(...values).toFixed(2)} ~ {Math.max(...values).toFixed(2)}</span></div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

          {/* 代碼範例 */}
          <CodeExample
          title="使用範例"
          language="tsx"
          code={`import { ViolinPlot } from '@registry/components/statistical/violin-plot'

const data = [
  { ${dataKeys.labelKey}: '對照組', ${dataKeys.valuesKey}: [85, 92, 78, 88, 95, 82] },
  { ${dataKeys.labelKey}: '實驗組', ${dataKeys.valuesKey}: [95, 98, 89, 92, 101, 88] }
]

<ChartContainer responsive={true} aspectRatio={16/9}>
  {({ width, height }) => (
    <ViolinPlot
      data={data}
      labelAccessor="${dataKeys.labelKey}"
  valuesAccessor="${dataKeys.valuesKey}"
  width={width}
  height={height}
  orientation="${orientation}"
  violinWidth={${violinWidth}}
  resolution={${resolution}}
  showBoxPlot={${showBoxPlot}}
  boxPlotWidth={${boxPlotWidth}}
  kdeMethod="${kdeMethod}"
  smoothing={${smoothing}}
  violinFillOpacity={${violinFillOpacity}}
  colorScheme="${colorScheme}"
  animate={${animate}}
  interactive={${interactive}}
      onViolinClick={(data) => console.log('Clicked:', data)}
    />
  )}
</ChartContainer>`}
          />
        </div>
      </div>
    </DemoPageTemplate>
  )
}