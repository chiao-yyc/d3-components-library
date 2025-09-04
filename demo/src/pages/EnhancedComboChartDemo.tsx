import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

// 導入統一的 ComboChart (Primitives架構)
import { MultiSeriesComboChartV2, type ComboSeries } from '../../../registry/components/composite'
import { 
  DemoPageTemplate,
  ModernControlPanel,
  ControlGroup,
  SelectControl,
  ToggleControl,
  ChartContainer,
  StatusDisplay,
  DataTable,
  CodeExample,
  type DataTableColumn
} from '../components/ui'
import { CogIcon, PresentationChartBarIcon } from '@heroicons/react/24/outline'

// 生成示例數據
const generateSalesData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months.map((month, index) => ({
    month,
    revenue: Math.floor(Math.random() * 500000) + 300000, // 30-80萬
    profit: Math.floor(Math.random() * 100000) + 50000,   // 5-15萬  
    growthRate: (Math.random() * 30) - 5,                 // -5% to 25%
    marketShare: Math.random() * 15 + 20,                 // 20% to 35%
    customerCount: Math.floor(Math.random() * 2000) + 3000, // 3000-5000
    avgOrderValue: Math.floor(Math.random() * 200) + 150   // 150-350
  }))
}

const generatePerformanceData = () => {
  const quarters = ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024']
  return quarters.map(quarter => ({
    quarter,
    budget: Math.floor(Math.random() * 1000000) + 2000000,
    actual: Math.floor(Math.random() * 900000) + 1800000,
    efficiency: Math.random() * 20 + 80, // 80-100%
    satisfaction: Math.random() * 15 + 85 // 85-100
  }))
}

export const EnhancedComboChartDemo: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<'sales' | 'performance'>('sales')
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)
  const [selectedSeries, setSelectedSeries] = useState<string[]>([])

  // 銷售分析數據和配置
  const salesData = useMemo(() => generateSalesData(), [])
  const salesSeries: ComboSeries[] = [
    {
      type: 'bar',
      yKey: 'revenue',
      name: '營收',
      yAxis: 'left',
      color: '#3b82f6',
      barOpacity: 0.8
    },
    {
      type: 'bar', 
      yKey: 'profit',
      name: '利潤',
      yAxis: 'left',
      color: '#10b981',
      barOpacity: 0.8
    },
    {
      type: 'line',
      yKey: 'growthRate',
      name: '成長率',
      yAxis: 'right',
      color: '#ef4444',
      strokeWidth: 3,
      showPoints: true,
      pointRadius: 4,
      curve: 'monotone'
    }
  ]

  // 績效分析數據和配置  
  const performanceData = useMemo(() => generatePerformanceData(), [])
  const performanceSeries: ComboSeries[] = [
    {
      type: 'bar',
      yKey: 'budget',
      name: '預算',
      yAxis: 'left',
      color: '#6b7280',
      barOpacity: 0.6
    },
    {
      type: 'bar',
      yKey: 'actual', 
      name: '實際',
      yAxis: 'left',
      color: '#3b82f6',
      barOpacity: 0.9
    },
    {
      type: 'line',
      yKey: 'efficiency',
      name: '效率',
      yAxis: 'right',
      color: '#f59e0b',
      strokeWidth: 2,
      showPoints: true,
      curve: 'cardinal'
    },
    {
      type: 'line',
      yKey: 'satisfaction',
      name: '滿意度',
      yAxis: 'right', 
      color: '#8b5cf6',
      strokeWidth: 2,
      showPoints: true,
      curve: 'monotone'
    }
  ]

  const currentData = activeScenario === 'sales' ? salesData : performanceData
  const currentSeries = activeScenario === 'sales' ? salesSeries : performanceSeries
  const currentXKey = activeScenario === 'sales' ? 'month' : 'quarter'

  const handleSeriesClick = (series: ComboSeries, dataPoint: any, event: React.MouseEvent) => {
    console.log('Series clicked:', series.name, dataPoint)
    alert(`點擊了 ${series.name} 系列`)
  }

  const handleSeriesHover = (series: ComboSeries, dataPoint: any, event: React.MouseEvent) => {
    console.log('Series hovered:', series.name, dataPoint)
  }

  const toggleSeries = (seriesName: string) => {
    setSelectedSeries(prev => 
      prev.includes(seriesName) 
        ? prev.filter(name => name !== seriesName)
        : [...prev, seriesName]
    )
  }

  const visibleSeries = currentSeries.filter(s => 
    selectedSeries.length === 0 || selectedSeries.includes(s.name)
  )

  // 場景選項
  const scenarioOptions = [
    { value: 'sales', label: '💰 銷售分析' },
    { value: 'performance', label: '📊 績效分析' }
  ]

  // 狀態顯示數據
  const statusItems = [
    { label: '當前場景', value: scenarioOptions.find(s => s.value === activeScenario)?.label || '' },
    { label: '資料點數', value: currentData.length },
    { label: '系列數量', value: visibleSeries.length },
    { label: 'Bar 系列', value: visibleSeries.filter(s => s.type === 'bar').length },
    { label: 'Line 系列', value: visibleSeries.filter(s => s.type === 'line').length },
    { label: '左軸系列', value: visibleSeries.filter(s => s.yAxis === 'left').length },
    { label: '右軸系列', value: visibleSeries.filter(s => s.yAxis === 'right').length }
  ]

  // 數據表格列定義
  const tableColumns: DataTableColumn[] = [
    { key: currentXKey, title: '主鍵', sortable: true },
    { 
      key: activeScenario === 'sales' ? 'revenue' : 'budget', 
      title: '主要數值', 
      sortable: true,
      formatter: (value) => typeof value === 'number' ? value.toLocaleString() : value,
      align: 'right'
    },
    { 
      key: activeScenario === 'sales' ? 'profit' : 'actual', 
      title: '次要數值', 
      sortable: true,
      formatter: (value) => typeof value === 'number' ? value.toLocaleString() : value,
      align: 'right'
    },
    { 
      key: activeScenario === 'sales' ? 'growthRate' : 'efficiency', 
      title: '百分比指標', 
      sortable: true,
      formatter: (value) => `${Number(value).toFixed(1)}%`,
      align: 'right'
    }
  ]

  return (
    <DemoPageTemplate
      title="Enhanced ComboChart 增強版組合圖表演示"
      description="展示增強版 ComboChart 的進階功能：靈活數據映射、多軸配置、互動控制"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 控制面板 */}
        <div className="lg:col-span-1">
          <ModernControlPanel 
            title="配置中心" 
            icon={<CogIcon className="w-5 h-5" />}
          >
            <div className="space-y-8">
              {/* 場景選擇 */}
              <ControlGroup title="場景選擇" icon="🎯" cols={1}>
                <SelectControl
                  label="分析場景"
                  value={activeScenario}
                  onChange={(value) => {
                    setActiveScenario(value as any)
                    setSelectedSeries([])
                  }}
                  options={scenarioOptions}
                />
              </ControlGroup>

              {/* 系列控制 */}
              <ControlGroup title="系列選擇" icon="📊" cols={1}>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600 mb-3">選擇要顯示的圖表系列：</div>
                  <div className="grid grid-cols-1 gap-2">
                    {currentSeries.map(series => (
                      <button
                        key={series.name}
                        onClick={() => toggleSeries(series.name)}
                        className={`p-3 rounded-lg border-2 transition-colors text-left flex items-center gap-3 ${
                          selectedSeries.length === 0 || selectedSeries.includes(series.name)
                            ? 'bg-white border-2 text-gray-700'
                            : 'bg-gray-200 border-2 border-gray-300 text-gray-500'
                        }`}
                        style={{
                          borderColor: selectedSeries.length === 0 || selectedSeries.includes(series.name) 
                            ? series.color 
                            : undefined
                        }}
                      >
                        <div 
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: series.color }}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{series.name}</div>
                          <div className="text-xs opacity-60">({series.type === 'bar' ? '柱狀圖' : '線圖'})</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </ControlGroup>

              {/* 全域設定 */}
              <ControlGroup title="全域設定" icon="⚙️" cols={1}>
                <ToggleControl
                  label="動畫效果"
                  checked={animate}
                  onChange={setAnimate}
                  description="圖表轉場和更新動畫"
                />
                
                <ToggleControl
                  label="互動功能"
                  checked={interactive}
                  onChange={setInteractive}
                  description="啟用點擊和懸停事件"
                />
              </ControlGroup>
            </div>
          </ModernControlPanel>
        </div>

        {/* 主要內容區域 */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* 圖表展示 */}
          <motion.div
            key={activeScenario}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ChartContainer
              title={activeScenario === 'sales' ? '銷售業績分析' : '績效監控分析'}
              subtitle={`${visibleSeries.length} 個系列 | ${currentData.length} 個資料點`}
              responsive={true}
              aspectRatio={16 / 9}
              actions={
                <div className="flex items-center gap-2">
                  <PresentationChartBarIcon className="w-5 h-5 text-blue-500" />
                  <span className="text-sm text-gray-600">增強版組合圖表</span>
                </div>
              }
            >
              {({ width, height }) => (
                <motion.div
                  key={`${activeScenario}-${animate}-${interactive}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <MultiSeriesComboChartV2
                    data={currentData}
                    series={visibleSeries}
                    xAccessor={currentXKey}
                    width={width}
                    height={height}
                    leftAxisConfig={{
                      label: activeScenario === 'sales' ? '金額 (萬元)' : '預算 vs 實際 (萬元)',
                      tickCount: 5
                    }}
                    rightAxisConfig={{
                      label: activeScenario === 'sales' ? '成長率 (%)' : '績效指標 (%)',
                      tickCount: 5
                    }}
                    showGrid={true}
                    animate={animate}
                    interactive={interactive}
                    onSeriesClick={handleSeriesClick}
                    onSeriesHover={handleSeriesHover}
                  />
                </motion.div>
              )}
            </ChartContainer>
          </motion.div>

          {/* 狀態顯示 */}
          <StatusDisplay items={statusItems} />

          {/* 數據詳情 */}
          <DataTable
            title="數據詳情"
            data={currentData}
            columns={tableColumns}
            maxRows={8}
            showIndex
          />

          {/* 代碼範例 */}
          <CodeExample
            title="EnhancedComboChart 進階使用範例"
            description="展示如何使用增強版組合圖表的多種配置選項和互動功能"
            code={`import { MultiSeriesComboChartV2, type ComboSeries } from '../../../registry/components/composite'

const data = [
  { month: 'Jan', revenue: 500000, profit: 80000, growthRate: 12.5 },
  { month: 'Feb', revenue: 650000, profit: 95000, growthRate: 18.2 },
  // ...更多數據
]

const series: ComboSeries[] = [
  { 
    type: 'bar', 
    dataKey: 'revenue', 
    name: '營收', 
    yAxis: 'left', 
    color: '#3b82f6',
    barOpacity: 0.8
  },
  { 
    type: 'bar', 
    dataKey: 'profit', 
    name: '利潤', 
    yAxis: 'left', 
    color: '#10b981',
    barOpacity: 0.8
  },
  { 
    type: 'line', 
    dataKey: 'growthRate', 
    name: '成長率', 
    yAxis: 'right', 
    color: '#ef4444',
    strokeWidth: 3,
    showPoints: true,
    curve: 'monotone'
  }
]

<MultiSeriesComboChartV2
  data={data}
  series={series}
  xKey="month"
  width={800}
  height={500}
  leftAxis={{ 
    label: '金額 (萬元)', 
    gridlines: true 
  }}
  rightAxis={{ 
    label: '成長率 (%)', 
    gridlines: false 
  }}
  showGrid={true}
  animate={true}
  interactive={true}
  onSeriesClick={(series, dataPoint, event) => {
    console.log('Clicked:', series.name, dataPoint)
  }}
  onSeriesHover={(series, dataPoint, event) => {
    console.log('Hovered:', series.name, dataPoint)
  }}
/>`}
            language="typescript"
          />
        </div>
      </div>
    </DemoPageTemplate>
  )
}

export default EnhancedComboChartDemo