import React, { useState, useCallback, useMemo } from 'react'
import { motion } from 'framer-motion'
import { MultiSeriesComboChartV2, type ComboSeries } from '../../../registry/components/composite'
import { 
  DemoPageTemplate,
  ContentSection,
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
import { CogIcon, ChartBarSquareIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'

interface DataPoint {
  [key: string]: any
}

interface SeriesTemplate {
  id: string
  type: 'bar' | 'line' | 'area' | 'stackedArea' | 'scatter' | 'waterfall'
  name: string
  dataKey: string
  yAxis: 'left' | 'right'
  color: string
  category: 'primary' | 'secondary' | 'analysis'
  description: string
  config?: any
}

const DynamicComboDemo: React.FC = () => {
  // 豐富的示例數據
  const sampleData: DataPoint[] = [
    { month: '1月', sales: 120000, revenue: 148000, cost: 85000, profit: 63000, margin: 42.6, users: 2400, retention: 78, satisfaction: 4.2 },
    { month: '2月', sales: 135000, revenue: 162000, cost: 92000, profit: 70000, margin: 43.2, users: 2650, retention: 79, satisfaction: 4.3 },
    { month: '3月', sales: 158000, revenue: 189600, cost: 98000, profit: 91600, margin: 48.3, users: 2890, retention: 81, satisfaction: 4.4 },
    { month: '4月', sales: 142000, revenue: 170400, cost: 88000, profit: 82400, margin: 48.4, users: 3020, retention: 80, satisfaction: 4.1 },
    { month: '5月', sales: 168000, revenue: 201600, cost: 95000, profit: 106600, margin: 52.9, users: 3280, retention: 82, satisfaction: 4.5 },
    { month: '6月', sales: 185000, revenue: 222000, cost: 102000, profit: 120000, margin: 54.1, users: 3450, retention: 84, satisfaction: 4.6 },
    { month: '7月', sales: 198000, revenue: 237600, cost: 108000, profit: 129600, margin: 54.5, users: 3680, retention: 85, satisfaction: 4.7 },
    { month: '8月', sales: 175000, revenue: 210000, cost: 95000, profit: 115000, margin: 54.8, users: 3520, retention: 83, satisfaction: 4.4 },
    { month: '9月', sales: 208000, revenue: 249600, cost: 112000, profit: 137600, margin: 55.1, users: 3890, retention: 86, satisfaction: 4.8 },
    { month: '10月', sales: 225000, revenue: 270000, cost: 118000, profit: 152000, margin: 56.3, users: 4150, retention: 87, satisfaction: 4.9 },
    { month: '11月', sales: 248000, revenue: 297600, cost: 125000, profit: 172600, margin: 58.0, users: 4420, retention: 88, satisfaction: 5.0 },
    { month: '12月', sales: 265000, revenue: 318000, cost: 135000, profit: 183000, margin: 57.5, users: 4680, retention: 89, satisfaction: 5.1 },
  ]

  // 可用的系列模板
  const seriesTemplates: SeriesTemplate[] = [
    // 主要業務指標
    { id: 'sales-bar', type: 'bar', name: '銷售額', dataKey: 'sales', yAxis: 'left', color: '#3b82f6', category: 'primary', description: '月度銷售額（柱狀圖）' },
    { id: 'revenue-bar', type: 'bar', name: '營收', dataKey: 'revenue', yAxis: 'left', color: '#10b981', category: 'primary', description: '月度營收（柱狀圖）' },
    { id: 'cost-bar', type: 'bar', name: '成本', dataKey: 'cost', yAxis: 'left', color: '#ef4444', category: 'primary', description: '營運成本（柱狀圖）' },
    { id: 'profit-area', type: 'area', name: '利潤區域', dataKey: 'profit', yAxis: 'left', color: '#8b5cf6', category: 'primary', description: '利潤趨勢區域', config: { areaOpacity: 0.3 } },
    
    // 線性趨勢指標
    { id: 'margin-line', type: 'line', name: '利潤率', dataKey: 'margin', yAxis: 'right', color: '#f59e0b', category: 'secondary', description: '利潤率趨勢線', config: { strokeWidth: 3, showPoints: true } },
    { id: 'users-line', type: 'line', name: '用戶數', dataKey: 'users', yAxis: 'right', color: '#06b6d4', category: 'secondary', description: '用戶成長線', config: { strokeWidth: 2, showPoints: true } },
    { id: 'retention-line', type: 'line', name: '留存率', dataKey: 'retention', yAxis: 'right', color: '#84cc16', category: 'secondary', description: '用戶留存率', config: { strokeWidth: 2, curve: 'monotone' } },
    
    // 分析型散點圖
    { id: 'satisfaction-scatter', type: 'scatter', name: '滿意度', dataKey: 'satisfaction', yAxis: 'right', color: '#ec4899', category: 'analysis', description: '用戶滿意度散點', config: { scatterRadius: 6, scatterOpacity: 0.8 } },
    { id: 'profit-scatter', type: 'scatter', name: '利潤點', dataKey: 'profit', yAxis: 'left', color: '#f97316', category: 'analysis', description: '利潤分佈點', config: { scatterRadius: 5, scatterOpacity: 0.7 } },
  ]

  const [activeSeries, setActiveSeries] = useState<Set<string>>(new Set(['sales-bar', 'margin-line']))
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'primary' | 'secondary' | 'analysis'>('all')
  const [chartSettings, setChartSettings] = useState({
    animate: true,
    showGridlines: true,
    leftAxisLabel: '金額 (萬元)',
    rightAxisLabel: '比率(%) / 數量',
  })

  // 根據選擇的系列生成圖表配置
  const currentSeries = useMemo((): ComboSeries[] => {
    return Array.from(activeSeries)
      .map(seriesId => seriesTemplates.find(t => t.id === seriesId))
      .filter(Boolean)
      .map(template => ({
        type: template!.type,
        yKey: template!.dataKey,
        name: template!.name,
        yAxis: template!.yAxis,
        color: template!.color,
        ...template!.config
      }))
  }, [activeSeries])

  // 篩選可用的系列模板
  const filteredTemplates = useMemo(() => {
    if (selectedCategory === 'all') {
      return seriesTemplates
    }
    return seriesTemplates.filter(t => t.category === selectedCategory)
  }, [selectedCategory])

  // 切換系列
  const toggleSeries = useCallback((seriesId: string) => {
    setActiveSeries(prev => {
      const newSet = new Set(prev)
      if (newSet.has(seriesId)) {
        newSet.delete(seriesId)
      } else {
        newSet.add(seriesId)
      }
      return newSet
    })
  }, [])

  // 預設配置
  const presetConfigurations = [
    {
      name: '銷售分析',
      series: ['sales-bar', 'margin-line', 'users-line'],
      description: '銷售額 + 利潤率 + 用戶成長'
    },
    {
      name: '財務概覽',
      series: ['revenue-bar', 'cost-bar', 'profit-area'],
      description: '營收 + 成本 + 利潤區域'
    },
    {
      name: '用戶體驗',
      series: ['users-line', 'retention-line', 'satisfaction-scatter'],
      description: '用戶數 + 留存率 + 滿意度'
    },
    {
      name: '全面儀表板',
      series: ['sales-bar', 'profit-area', 'margin-line', 'users-line', 'satisfaction-scatter'],
      description: '多維度業務分析組合'
    }
  ]

  const applyPreset = useCallback((preset: any) => {
    setActiveSeries(new Set(preset.series))
  }, [])

  const clearAllSeries = useCallback(() => {
    setActiveSeries(new Set())
  }, [])

  // 統計信息
  const stats = useMemo(() => {
    const typeCount = currentSeries.reduce((acc, series) => {
      acc[series.type] = (acc[series.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      totalSeries: currentSeries.length,
      typeCount,
      leftAxisSeries: currentSeries.filter(s => s.yAxis === 'left').length,
      rightAxisSeries: currentSeries.filter(s => s.yAxis === 'right').length,
    }
  }, [currentSeries])

  const categoryOptions = [
    { value: 'all', label: '全部', desc: '所有可用系列' },
    { value: 'primary', label: '主要指標', desc: '核心業務數據' },
    { value: 'secondary', label: '次要指標', desc: '趨勢和比率' },
    { value: 'analysis', label: '分析型', desc: '散點和深度分析' },
  ]

  // 狀態顯示數據
  const statusItems = [
    { label: '總系列數', value: stats.totalSeries },
    { label: '左軸系列', value: stats.leftAxisSeries },
    { label: '右軸系列', value: stats.rightAxisSeries },
    { label: '圖表類型', value: Object.keys(stats.typeCount).length },
    { label: '當前類別', value: categoryOptions.find(c => c.value === selectedCategory)?.label || '' },
    { label: '動畫狀態', value: chartSettings.animate ? '開啟' : '關閉' }
  ]

  // 數據表格列定義
  const tableColumns: DataTableColumn[] = [
    { key: 'month', title: '月份', sortable: true },
    { 
      key: 'sales', 
      title: '銷售額', 
      sortable: true,
      formatter: (value) => `$${value.toLocaleString()}`,
      align: 'right'
    },
    { 
      key: 'revenue', 
      title: '營收', 
      sortable: true,
      formatter: (value) => `$${value.toLocaleString()}`,
      align: 'right'
    },
    { 
      key: 'profit', 
      title: '利潤', 
      sortable: true,
      formatter: (value) => `$${value.toLocaleString()}`,
      align: 'right'
    },
    { 
      key: 'margin', 
      title: '利潤率', 
      sortable: true,
      formatter: (value) => `${value.toFixed(1)}%`,
      align: 'right'
    }
  ]

  return (
    <DemoPageTemplate
      title="動態組合圖表系統"
      description="靈活的圖表組合系統，支援動態加載系列、即時配置調整和多種預設組合模式"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 控制面板 */}
        <div className="lg:col-span-1">
          <ModernControlPanel 
            title="動態配置中心" 
            icon={<AdjustmentsHorizontalIcon className="w-5 h-5" />}
          >
          <div className="space-y-8">
            {/* 快速配置 */}
            <ControlGroup title="快速配置" icon="⚡" cols={1}>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {presetConfigurations.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => applyPreset(preset)}
                      className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <div className="font-medium text-blue-700 text-sm">{preset.name}</div>
                      <div className="text-xs text-blue-600">{preset.description}</div>
                    </button>
                  ))}
                  <button
                    onClick={clearAllSeries}
                    className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <div className="font-medium text-red-700 text-sm">清除全部</div>
                    <div className="text-xs text-red-600">移除所有系列</div>
                  </button>
                </div>
              </div>
            </ControlGroup>

            {/* 圖表設定 */}
            <ControlGroup title="圖表設定" icon="📊" cols={2}>
              <ToggleControl
                label="動畫效果"
                checked={chartSettings.animate}
                onChange={(checked) => setChartSettings(prev => ({ ...prev, animate: checked }))}
                description="圖表轉場和更新動畫"
              />
              
              <ToggleControl
                label="顯示網格線"
                checked={chartSettings.showGridlines}
                onChange={(checked) => setChartSettings(prev => ({ ...prev, showGridlines: checked }))}
                description="顯示背景網格線輔助線"
              />
            </ControlGroup>

            {/* 軸線設定 */}
            <ControlGroup title="軸線設定" icon="🎯" cols={2}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">左軸標籤</label>
                <input
                  type="text"
                  value={chartSettings.leftAxisLabel}
                  onChange={(e) => setChartSettings(prev => ({ ...prev, leftAxisLabel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="輸入左軸標籤"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">右軸標籤</label>
                <input
                  type="text"
                  value={chartSettings.rightAxisLabel}
                  onChange={(e) => setChartSettings(prev => ({ ...prev, rightAxisLabel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="輸入右軸標籤"
                />
              </div>
            </ControlGroup>

            {/* 系列類別篩選 */}
            <ControlGroup title="系列類別篩選" icon="🎨" cols={1}>
              <SelectControl
                label="系列類別"
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value as any)}
                options={categoryOptions}
                description="依據業務需求篩選系列類型"
              />
            </ControlGroup>

            {/* 可用系列選擇 */}
            <ControlGroup title="可用圖表系列" icon="📋" cols={1}>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  點擊下方系列來動態添加或移除至圖表中
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => toggleSeries(template.id)}
                      className={`p-3 rounded-lg border transition-all ${
                        activeSeries.has(template.id)
                          ? 'bg-white border-2 shadow-sm'
                          : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
                      }`}
                      style={{
                        borderColor: activeSeries.has(template.id) ? template.color : undefined
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: template.color }}
                        />
                        <span className="font-medium text-sm">{template.name}</span>
                        <span className="text-xs px-1 py-0.5 bg-gray-200 rounded">
                          {template.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 text-left">{template.description}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {template.yAxis === 'left' ? '左軸' : '右軸'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </ControlGroup>
          </div>
          </ModernControlPanel>
        </div>

        {/* 主要內容區域 */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* 圖表展示 */}
          <motion.div
            key={activeSeries.size}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
        <ChartContainer
          title="動態組合圖表"
          subtitle={currentSeries.length > 0 ? `${stats.totalSeries} 個系列，${stats.leftAxisSeries} 左軸 + ${stats.rightAxisSeries} 右軸` : '尚未選擇系列'}
          responsive={true}
          aspectRatio={16 / 9}
          actions={
            <div className="flex items-center gap-2">
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-green-500" />
              <span className="text-sm text-gray-600">動態配置</span>
            </div>
          }
        >
          {({ width, height }) => (
            <>
              {currentSeries.length > 0 ? (
                <motion.div
                  key={`${activeSeries.size}-${chartSettings.animate}-${chartSettings.showGridlines}`}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <MultiSeriesComboChartV2
                    data={sampleData}
                    series={currentSeries}
                    xAccessor="month"
                    width={width}
                    height={height}
                    margin={{ top: 20, right: 80, bottom: 60, left: 80 }}
                    leftAxisConfig={{
                      label: chartSettings.leftAxisLabel,
                      tickCount: 5
                    }}
                    rightAxisConfig={{
                      label: chartSettings.rightAxisLabel,
                      tickCount: 5
                    }}
                    showGrid={chartSettings.showGridlines}
                    animate={chartSettings.animate}
                    className="dynamic-combo-chart"
                  />
                </motion.div>
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
                  <div className="text-center text-gray-500">
                    <AdjustmentsHorizontalIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <div className="text-lg font-medium mb-2">尚未選擇任何圖表系列</div>
                    <div className="text-sm">請從上方選擇要顯示的圖表系列，或使用快速配置</div>
                  </div>
                </div>
              )}
            </>
          )}
        </ChartContainer>
          </motion.div>

          {/* 狀態顯示 */}
          {currentSeries.length > 0 && <StatusDisplay items={statusItems} />}

          {/* 數據詳情 */}
          <DataTable
            title="數據詳情"
            data={sampleData}
            columns={tableColumns}
            maxRows={8}
            showIndex
          />

          {/* 代碼範例 */}
        <CodeExample
          title="使用範例"
          language="tsx"
          code={`import React, { useState } from 'react'
import { MultiSeriesComboChartV2, type ComboSeries } from '../../../registry/components/composite'

const DynamicComboDemo: React.FC = () => {
  const [selectedChartTypes, setSelectedChartTypes] = useState<Set<string>>(new Set(['bar', 'line']))
  
  const data = [
    { month: 'Jan', sales: 120, growth: 15.2, profit: 25 },
    // ...更多數據
  ]

  // 動態系列配置
  const availableSeries = {
    bar: {
      type: 'bar' as const,
      yKey: 'sales',
      name: '銷售額',
      yAxis: 'left' as const,
      color: '#3b82f6'
    },
    line: {
      type: 'line' as const,
      yKey: 'growth',
      name: '成長率',
      yAxis: 'right' as const,
      color: '#ef4444',
      strokeWidth: 3
    }
  }

  const series: ComboSeries[] = Array.from(selectedChartTypes)
    .map(type => availableSeries[type as keyof typeof availableSeries])
    .filter(Boolean)

  return (
    <MultiSeriesComboChartV2
      data={data}
      series={series}
      xAccessor="month"
      width={800}
      height={500}
      leftAxisConfig={{ label: "銷售額/利潤", tickCount: 5 }}
      rightAxisConfig={{ label: "成長率 (%)", tickCount: 5 }}
      showGrid={true}
      animate={true}
      interactive={true}
    />
  )
}`}
          />

          {/* 功能說明 */}
        <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-6 border border-green-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-8 bg-gradient-to-b from-green-500 to-teal-600 rounded-full" />
            <h3 className="text-xl font-semibold text-gray-800">動態組合圖表系統功能特點</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">動態加載</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  即時系列添加/移除
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-teal-500 rounded-full" />
                  預設配置快速切換
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  系列類別篩選
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                  即時狀態統計
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">性能優化</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full" />
                  React.memo 和 useMemo
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-pink-500 rounded-full" />
                  useCallback 優化
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  智能更新機制
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full" />
                  漸進式載入
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">應用場景</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  企業儀表板
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-lime-500 rounded-full" />
                  數據探索分析
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full" />
                  客製化報表
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-amber-500 rounded-full" />
                  動態數據視覺化
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

export default DynamicComboDemo