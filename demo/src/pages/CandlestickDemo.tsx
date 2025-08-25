/**
 * CandlestickDemo - 現代化K線圖示例
 * 展示使用新設計系統的完整 Demo 頁面
 */

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CandlestickChart } from '@registry/components/financial/candlestick-chart'
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
import { CogIcon, ChartBarSquareIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline'

// 生成模擬股票數據
function generateStockData(days: number = 60, initialPrice: number = 100) {
  const data = []
  let currentPrice = initialPrice
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    // 隨機變動 (-3% 到 +3%)
    const changePercent = (Math.random() - 0.5) * 0.06
    const change = currentPrice * changePercent
    
    // 計算開盤價（前一天收盤價的小幅變動）
    const gapPercent = (Math.random() - 0.5) * 0.02
    const open = currentPrice * (1 + gapPercent)
    
    // 計算收盤價
    const close = open + change
    
    // 計算最高價和最低價
    const volatility = Math.random() * 0.03 + 0.01
    const highExtra = Math.random() * volatility * currentPrice
    const lowExtra = Math.random() * volatility * currentPrice
    
    const high = Math.max(open, close) + highExtra
    const low = Math.min(open, close) - lowExtra
    
    // 生成成交量（1萬到10萬）
    const volume = Math.floor(Math.random() * 90000) + 10000
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
      change: Math.round((close - open) * 100) / 100,
      changePercent: open !== 0 ? Math.round(((close - open) / open) * 10000) / 100 : 0
    })
    
    currentPrice = close
  }
  
  return data
}

// 台積電模擬數據
const tsmc2024Data = [
  { date: '2024-01-02', open: 593, high: 598, low: 590, close: 596, volume: 15234567 },
  { date: '2024-01-03', open: 596, high: 605, low: 594, close: 602, volume: 18456789 },
  { date: '2024-01-04', open: 602, high: 608, low: 598, close: 599, volume: 16789123 },
  { date: '2024-01-05', open: 599, high: 610, low: 597, close: 607, volume: 20123456 },
  { date: '2024-01-08', open: 607, high: 615, low: 605, close: 612, volume: 22567890 },
  { date: '2024-01-09', open: 612, high: 620, low: 608, close: 618, volume: 19876543 },
  { date: '2024-01-10', open: 618, high: 625, low: 615, close: 622, volume: 21345678 },
  { date: '2024-01-11', open: 622, high: 628, low: 619, close: 624, volume: 17890123 },
  { date: '2024-01-12', open: 624, high: 632, low: 621, close: 629, volume: 23456789 },
  { date: '2024-01-15', open: 629, high: 635, low: 626, close: 631, volume: 20789012 },
  { date: '2024-01-16', open: 631, high: 638, low: 628, close: 635, volume: 24123456 },
  { date: '2024-01-17', open: 635, high: 642, low: 632, close: 639, volume: 22567890 },
  { date: '2024-01-18', open: 639, high: 645, low: 636, close: 641, volume: 21098765 },
  { date: '2024-01-19', open: 641, high: 648, low: 638, close: 644, volume: 25432109 },
  { date: '2024-01-22', open: 644, high: 650, low: 640, close: 647, volume: 23876543 },
  { date: '2024-01-23', open: 647, high: 653, low: 644, close: 649, volume: 22109876 },
  { date: '2024-01-24', open: 649, high: 655, low: 646, close: 651, volume: 26543210 },
  { date: '2024-01-25', open: 651, high: 658, low: 648, close: 654, volume: 24987654 },
  { date: '2024-01-26', open: 654, high: 660, low: 651, close: 657, volume: 23210987 },
  { date: '2024-01-29', open: 657, high: 663, low: 654, close: 659, volume: 27654321 }
].map(d => ({
  ...d,
  change: d.close - d.open,
  changePercent: d.open !== 0 ? Math.round(((d.close - d.open) / d.open) * 10000) / 100 : 0
}))

// 資料集選項
const datasetOptions = [
  { value: 'tsmc', label: '台積電 (2024年1月)', description: '真實台積電股價數據展示' },
  { value: 'tech', label: '科技股模擬', description: '高科技股票模擬走勢' },
  { value: 'crypto', label: '加密貨幣模擬', description: '比特幣等虛擬貨幣走勢' }
]

// 顏色模式選項
const colorModeOptions = [
  { value: 'tw', label: '台股模式（紅漲綠跌）' },
  { value: 'us', label: '美股模式（綠漲紅跌）' },
  { value: 'custom', label: '自訂顏色' }
]

export default function CandlestickDemo() {
  // 基本設定
  const [selectedDataset, setSelectedDataset] = useState('tsmc')
  const [colorMode, setColorMode] = useState<'tw' | 'us' | 'custom'>('tw')
  
  // 圖表設定
  const [candleWidth, setCandleWidth] = useState(8)
  
  // 顯示選項
  const [showVolume, setShowVolume] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [showTooltip, setShowTooltip] = useState(true)
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)
  

  // 當前資料和配置
  const { currentData, config, analysis } = useMemo(() => {
    let data, title, description, priceUnit
    
    switch (selectedDataset) {
      case 'tsmc':
        data = tsmc2024Data
        title = '台積電股價走勢'
        description = '2024年1月台積電真實股價數據展示'
        priceUnit = 'TWD'
        break
      case 'tech':
        data = generateStockData(45, 150).map(d => ({
          ...d,
          change: d.close - d.open,
          changePercent: d.open !== 0 ? Math.round(((d.close - d.open) / d.open) * 10000) / 100 : 0
        }))
        title = '科技股模擬走勢'
        description = '高科技股票模擬數據，展示中等波動性'
        priceUnit = 'USD'
        break
      case 'crypto':
        data = generateStockData(30, 45000).map(d => ({
          date: d.date,
          open: Math.round(d.open * 450),
          high: Math.round(d.high * 450),
          low: Math.round(d.low * 450),
          close: Math.round(d.close * 450),
          volume: Math.floor(d.volume / 100),
          change: Math.round((d.close - d.open) * 450 * 100) / 100,
          changePercent: d.open !== 0 ? Math.round(((d.close - d.open) / d.open) * 10000) / 100 : 0
        }))
        title = '比特幣價格走勢'
        description = '加密貨幣模擬數據，展示高波動性特征'
        priceUnit = 'USD'
        break
      default:
        data = tsmc2024Data
        title = '台積電股價走勢'
        description = '2024年1月台積電真實股價數據展示'
        priceUnit = 'TWD'
    }

    // 統計分析
    const prices = data.map(d => d.close)
    const volumes = data.map(d => d.volume)
    const changes = data.map(d => d.change)
    
    const priceStats = {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((sum, p) => sum + p, 0) / prices.length,
      range: Math.max(...prices) - Math.min(...prices)
    }
    
    const volumeStats = {
      total: volumes.reduce((sum, v) => sum + v, 0),
      avg: volumes.reduce((sum, v) => sum + v, 0) / volumes.length,
      max: Math.max(...volumes)
    }
    
    const performanceStats = {
      totalChange: data[data.length - 1].close - data[0].open,
      totalChangePercent: data[0].open !== 0 ? 
        ((data[data.length - 1].close - data[0].open) / data[0].open) * 100 : 0,
      upDays: changes.filter(c => c > 0).length,
      downDays: changes.filter(c => c < 0).length,
      flatDays: changes.filter(c => c === 0).length
    }
    
    return {
      currentData: data,
      config: { title, description, priceUnit },
      analysis: {
        dataset: datasetOptions.find(d => d.value === selectedDataset)!,
        totalDays: data.length,
        priceStats,
        volumeStats,
        performanceStats
      }
    }
  }, [selectedDataset])


  // 狀態顯示數據
  const statusItems = [
    { label: '數據集', value: config.title },
    { label: '交易日數', value: analysis.totalDays },
    { label: '顏色模式', value: colorModeOptions.find(c => c.value === colorMode)?.label || '' },
    { label: '總漲跌', value: `${analysis.performanceStats.totalChangePercent.toFixed(2)}%`, 
      color: analysis.performanceStats.totalChange >= 0 ? '#10b981' : '#ef4444' },
    { label: '動畫', value: animate ? '開啟' : '關閉', color: animate ? '#10b981' : '#6b7280' }
  ]

  // 數據表格列定義
  const tableColumns: DataTableColumn[] = [
    { key: 'date', title: '日期', sortable: true },
    { 
      key: 'open', 
      title: '開盤', 
      sortable: true,
      formatter: (value) => value.toLocaleString(),
      align: 'right'
    },
    { 
      key: 'high', 
      title: '最高', 
      sortable: true,
      formatter: (value) => value.toLocaleString(),
      align: 'right'
    },
    { 
      key: 'low', 
      title: '最低', 
      sortable: true,
      formatter: (value) => value.toLocaleString(),
      align: 'right'
    },
    { 
      key: 'close', 
      title: '收盤', 
      sortable: true,
      formatter: (value) => value.toLocaleString(),
      align: 'right'
    },
    { 
      key: 'changePercent', 
      title: '漲跌幅', 
      sortable: true,
      formatter: (value) => `${value > 0 ? '+' : ''}${value.toFixed(2)}%`,
      align: 'right'
    },
    { 
      key: 'volume', 
      title: '成交量', 
      sortable: true,
      formatter: (value) => (value / 1000000).toFixed(1) + 'M',
      align: 'right'
    }
  ]

  return (
    <DemoPageTemplate
      title="CandlestickChart Demo"
      description="專業級K線圖組件展示 - 支援OHLC數據、成交量顯示和技術分析功能"
    >
      {/* 控制面板 */}
      <ContentSection>
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
                options={datasetOptions.map(opt => ({ value: opt.value, label: opt.label }))}
                description={datasetOptions.find(d => d.value === selectedDataset)?.description}
              />
              
              <SelectControl
                label="顏色模式"
                value={colorMode}
                onChange={(value) => setColorMode(value as 'tw' | 'us' | 'custom')}
                options={colorModeOptions}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  價格單位
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600">
                  {config.priceUnit}
                </div>
              </div>
            </ControlGroup>

            {/* 圖表配置 */}
            <ControlGroup title="圖表配置" icon="📊" cols={1}>
              <RangeSlider
                label="蠟燭寬度"
                value={candleWidth}
                min={4}
                max={16}
                step={1}
                onChange={setCandleWidth}
                suffix="px"
              />
            </ControlGroup>

            {/* 顯示選項 */}
            <ControlGroup title="顯示選項" icon="👁️" cols={2}>
              <ToggleControl
                label="顯示成交量"
                checked={showVolume}
                onChange={setShowVolume}
                description="在圖表下方顯示成交量柱狀圖"
              />
              
              <ToggleControl
                label="顯示格線"
                checked={showGrid}
                onChange={setShowGrid}
                description="顯示背景格線輔助線"
              />
              
              <ToggleControl
                label="工具提示"
                checked={showTooltip}
                onChange={setShowTooltip}
                description="懸停時顯示詳細價格信息"
              />
              
              <ToggleControl
                label="動畫效果"
                checked={animate}
                onChange={setAnimate}
                description="K線載入和更新動畫"
              />
            </ControlGroup>

            {/* 交互功能 */}
            <ControlGroup title="交互功能" icon="🎯" cols={1}>
              <ToggleControl
                label="互動功能"
                checked={interactive}
                onChange={setInteractive}
                description="啟用點擊和懸停交互功能"
              />
            </ControlGroup>
          </div>
        </ModernControlPanel>
      </ContentSection>

      {/* 圖表展示 */}
      <ContentSection delay={0.1}>
        <ChartContainer
          title="圖表預覽"
          subtitle={config.description}
          className="min-h-[420px]"
          actions={
            <div className="flex items-center gap-2">
              <CurrencyDollarIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">K線圖</span>
            </div>
          }
        >
          <div className="w-full overflow-hidden">
            <motion.div
              key={`${selectedDataset}-${colorMode}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <CandlestickChart
                data={currentData}
                colorMode={colorMode}
                showVolume={showVolume}
                showGrid={showGrid}
                showTooltip={showTooltip}
                animate={animate}
                interactive={interactive}
                onDataClick={(data) => {
                  if (interactive) {
                    console.log('K線點擊:', data)
                  }
                }}
              />
            </motion.div>
          </div>
          
          <StatusDisplay items={statusItems} />
        </ChartContainer>
      </ContentSection>

      {/* 統計分析 */}
      <ContentSection delay={0.2}>
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-blue-600 rounded-full" />
            <h3 className="text-xl font-semibold text-gray-800">市場統計分析</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 價格統計 */}
            <motion.div 
              className="p-5 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="font-semibold text-gray-900 mb-3">價格區間</h4>
              <div className="space-y-2 text-sm">
                <div>最高: <span className="font-medium text-green-600">{analysis.priceStats.max.toLocaleString()}</span></div>
                <div>最低: <span className="font-medium text-red-600">{analysis.priceStats.min.toLocaleString()}</span></div>
                <div>平均: <span className="font-medium">{Math.round(analysis.priceStats.avg).toLocaleString()}</span></div>
                <div>波幅: <span className="font-medium">{Math.round(analysis.priceStats.range).toLocaleString()}</span></div>
              </div>
            </motion.div>

            {/* 成交量統計 */}
            <motion.div 
              className="p-5 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="font-semibold text-gray-900 mb-3">成交量</h4>
              <div className="space-y-2 text-sm">
                <div>總量: <span className="font-medium">{(analysis.volumeStats.total / 1000000).toFixed(0)}M</span></div>
                <div>日均: <span className="font-medium">{(analysis.volumeStats.avg / 1000000).toFixed(1)}M</span></div>
                <div>最高: <span className="font-medium">{(analysis.volumeStats.max / 1000000).toFixed(1)}M</span></div>
              </div>
            </motion.div>

            {/* 績效統計 */}
            <motion.div 
              className="p-5 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="font-semibold text-gray-900 mb-3">整體績效</h4>
              <div className="space-y-2 text-sm">
                <div>總漲跌: <span className={`font-medium ${analysis.performanceStats.totalChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {analysis.performanceStats.totalChangePercent.toFixed(2)}%
                </span></div>
                <div>漲跌額: <span className="font-medium">{analysis.performanceStats.totalChange.toFixed(2)}</span></div>
              </div>
            </motion.div>

            {/* 交易日統計 */}
            <motion.div 
              className="p-5 bg-white/70 backdrop-blur-sm rounded-xl border border-white/20 shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h4 className="font-semibold text-gray-900 mb-3">交易統計</h4>
              <div className="space-y-2 text-sm">
                <div>上漲: <span className="font-medium text-green-600">{analysis.performanceStats.upDays}天</span></div>
                <div>下跌: <span className="font-medium text-red-600">{analysis.performanceStats.downDays}天</span></div>
                <div>平盤: <span className="font-medium text-gray-600">{analysis.performanceStats.flatDays}天</span></div>
              </div>
            </motion.div>
          </div>
        </div>
      </ContentSection>

      {/* 數據詳情 */}
      <ContentSection delay={0.3}>
        <DataTable
          title="數據詳情"
          data={currentData.slice(-10)}
          columns={tableColumns}
          maxRows={10}
          showIndex
        />
      </ContentSection>

      {/* 代碼範例 */}
      <ContentSection delay={0.4}>
        <CodeExample
          title="使用範例"
          language="tsx"
          code={`import { CandlestickChart } from '@registry/components/financial/candlestick-chart'

const data = [
  { date: '2024-01-02', open: 593, high: 598, low: 590, close: 596, volume: 15234567 },
  { date: '2024-01-03', open: 596, high: 605, low: 594, close: 602, volume: 18456789 },
  // ... more data
]

<CandlestickChart
  data={data}
  colorMode="${colorMode}"
  showVolume={${showVolume}}
  showGrid={${showGrid}}
  showTooltip={${showTooltip}}
  animate={${animate}}
  interactive={${interactive}}
  onDataClick={(data) => console.log('K線點擊:', data)}
/>`}
        />
      </ContentSection>

      {/* 功能說明 */}
      <ContentSection delay={0.5}>
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full" />
            <h3 className="text-xl font-semibold text-gray-800">CandlestickChart 功能特點</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">核心功能</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  完整OHLC數據支援
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  台股/美股顏色模式
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  成交量圖表整合
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  可調整蠟燭寬度
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">視覺特性</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  智能格線系統
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  詳細工具提示
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  平滑動畫效果
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  響應式設計
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">應用場景</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  股票技術分析
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full" />
                  外匯市場分析
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  加密貨幣監控
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-lime-500 rounded-full" />
                  商品期貨分析
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ContentSection>
    </DemoPageTemplate>
  )
}