import React, { useState, useMemo } from 'react'
import { EnhancedComboChart } from '../../../registry/components/composite/enhanced-combo-chart'
import { ModernControlPanel, StatusDisplay } from '../components/ui/ModernControlPanel'
import { DemoPageTemplate } from '../components/ui/DemoPageTemplate'
import { CodeExample } from '../components/ui/CodeExample'
import { CHART_LAYER_ORDER, getChartGroup, type ChartType } from '../../../registry/components/primitives/layouts/chart-layer-constants'

const generateDemoData = (points: number = 12) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const fixedData = [
    { revenue: 2800, profit: 850, expenses: 1650, target: 2400, growth: 8.5, efficiency: 92 },
    { revenue: 2200, profit: 620, expenses: 1580, target: 2100, growth: -2.1, efficiency: 78 },
    { revenue: 3200, profit: 950, expenses: 1750, target: 2800, growth: 12.3, efficiency: 95 },
    { revenue: 2900, profit: 780, expenses: 1820, target: 2600, growth: 6.7, efficiency: 85 },
    { revenue: 2100, profit: 580, expenses: 1520, target: 2200, growth: -4.2, efficiency: 72 },
    { revenue: 3800, profit: 1200, expenses: 1900, target: 3200, growth: 18.5, efficiency: 98 },
    { revenue: 3400, profit: 1050, expenses: 1850, target: 2900, growth: 15.2, efficiency: 88 },
    { revenue: 2700, profit: 720, expenses: 1680, target: 2500, growth: 4.8, efficiency: 82 },
    { revenue: 3100, profit: 890, expenses: 1750, target: 2700, growth: 9.8, efficiency: 90 },
    { revenue: 2600, profit: 680, expenses: 1620, target: 2400, growth: 2.5, efficiency: 79 },
    { revenue: 3600, profit: 1150, expenses: 1880, target: 3000, growth: 16.7, efficiency: 94 },
    { revenue: 4200, profit: 1400, expenses: 2000, target: 3500, growth: 22.1, efficiency: 96 }
  ]
  
  return Array.from({ length: points }, (_, i) => ({
    month: months[i % 12],
    ...fixedData[i % fixedData.length]
  }))
}

export const LayerOrderDebugDemo: React.FC = () => {
  const [selectedChartTypes, setSelectedChartTypes] = useState<ChartType[]>(['stackedArea', 'bar', 'scatter', 'line'])
  const [showLayerInfo, setShowLayerInfo] = useState(true)
  const [autoReorder, setAutoReorder] = useState(true)

  const data = useMemo(() => generateDemoData(), [])

  const allChartTypes: ChartType[] = ['stackedArea', 'area', 'bar', 'waterfall', 'scatter', 'line']

  const series = useMemo(() => {
    const seriesMap: Record<ChartType, any> = {
      stackedArea: { 
        type: 'stackedArea' as const,
        dataKey: 'expenses',
        name: '支出',
        yAxis: 'left',
        color: '#8b5cf6', 
        opacity: 0.3,
        stack: 'default'
      },
      area: { 
        type: 'area' as const,
        dataKey: 'revenue',
        name: '營收',
        yAxis: 'left',
        color: '#f59e0b', 
        opacity: 0.4 
      },
      bar: { 
        type: 'bar' as const,
        dataKey: 'profit',
        name: '利潤',
        yAxis: 'left',
        color: '#10b981',
        barOpacity: 0.8
      },
      waterfall: { 
        type: 'waterfall' as const,
        dataKey: 'growth',
        name: '成長率',
        yAxis: 'left',
        color: '#3b82f6',
        typeKey: 'type',
        opacity: 0.7
      },
      scatter: { 
        type: 'scatter' as const,
        dataKey: 'efficiency',
        name: '效率',
        yAxis: 'right',
        color: '#ef4444',
        size: 8
      },
      line: { 
        type: 'line' as const,
        dataKey: 'target',
        name: '目標',
        yAxis: 'left',
        color: '#06b6d4', 
        strokeWidth: 4,
        lineOpacity: 0.9
      }
    }

    return selectedChartTypes.map(type => seriesMap[type]).filter(Boolean)
  }, [selectedChartTypes])

  const layerOrderInfo = useMemo(() => {
    return selectedChartTypes.map(type => ({
      type,
      order: CHART_LAYER_ORDER[type],
      group: getChartGroup(type),
      selected: true
    })).sort((a, b) => a.order - b.order)
  }, [selectedChartTypes])

  const handleChartTypeToggle = (chartType: ChartType) => {
    setSelectedChartTypes(prev => 
      prev.includes(chartType)
        ? prev.filter(t => t !== chartType)
        : [...prev, chartType]
    )
  }

  const codeExample = `
// 當前圖層配置 (渲染順序: 底層 → 頂層)
const selectedChartTypes = [${selectedChartTypes.map(t => `'${t}'`).join(', ')}]

// 標準化圖層順序 (自動排序: ${autoReorder ? '開啟' : '關閉'})
${layerOrderInfo.map(info => 
  `// ${info.type}: 順序 ${info.order} (${info.group} 組)`
).join('\n')}

<EnhancedComboChart
  data={data}
  series={[
${series.map(s => `    { type: '${s.type}', dataKey: '${s.dataKey}', name: '${s.name}', color: '${s.color}', yAxis: '${s.yAxis}' }`).join(',\n')}
  ]}
  xKey="month"
  width={800}
  height={400}
/>
`

  return (
    <DemoPageTemplate
      title="圖層順序調試工具"
      description="視覺化圖表圖層順序系統，調試和驗證 combo 圖表的正確渲染順序"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* 圖表展示 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">圖層疊加效果</h3>
              <div className="text-sm text-gray-500">
                已選擇 {selectedChartTypes.length} 種圖表類型
              </div>
            </div>
            <div className="w-full">
              <EnhancedComboChart
                data={data}
                series={series}
                xKey="month"
                responsive={true}
                animate={false}
                interactive={true}
                leftAxis={{
                  label: '數值',
                  gridlines: true
                }}
                rightAxis={{
                  label: '效率 (%)',
                  gridlines: false
                }}
                xAxis={{
                  label: '月份',
                  gridlines: true
                }}
              />
            </div>
            
            <StatusDisplay items={[
              { label: '選擇圖表數', value: selectedChartTypes.length, color: '#3b82f6' },
              { label: '自動排序', value: autoReorder ? '開啟' : '關閉', color: autoReorder ? '#10b981' : '#6b7280' },
              { label: '圖層資訊', value: showLayerInfo ? '顯示' : '隱藏', color: showLayerInfo ? '#10b981' : '#6b7280' },
              { label: '總圖層數', value: layerOrderInfo.length, color: '#8b5cf6' }
            ]} />
          </div>

          {/* 圖層順序資訊 */}
          {showLayerInfo && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">圖層渲染順序</h3>
              <div className="space-y-2">
                {layerOrderInfo.map((info, index) => (
                  <div key={info.type} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center space-x-3">
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                      <span className="font-medium capitalize">{info.type}</span>
                      <span className="text-sm text-gray-500">
                        ({info.group} 組)
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      zIndex: {info.order}
                    </div>
                  </div>
                ))}
              </div>
              {layerOrderInfo.length === 0 && (
                <p className="text-gray-500 text-center py-4">請選擇至少一種圖表類型</p>
              )}
            </div>
          )}
          
          <CodeExample code={codeExample} />
        </div>

        {/* 控制面板 */}
        <div className="space-y-6">
          <ModernControlPanel>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">圖表類型選擇</h4>
                <div className="space-y-2">
                  {allChartTypes.map(chartType => (
                    <label key={chartType} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedChartTypes.includes(chartType)}
                        onChange={() => handleChartTypeToggle(chartType)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="capitalize">{chartType}</span>
                      <span className="text-xs text-gray-500 ml-auto">
                        #{CHART_LAYER_ORDER[chartType]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">調試選項</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={showLayerInfo}
                      onChange={(e) => setShowLayerInfo(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>顯示圖層資訊</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={autoReorder}
                      onChange={(e) => setAutoReorder(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>自動排序</span>
                  </label>
                </div>
              </div>
            </div>
          </ModernControlPanel>

          {/* 圖層順序參考 */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-3">標準圖層順序</h4>
            <div className="space-y-1 text-sm">
              {Object.entries(CHART_LAYER_ORDER)
                .sort(([,a], [,b]) => a - b)
                .map(([type, order]) => (
                  <div key={type} className="flex justify-between">
                    <span className="capitalize">{type}</span>
                    <span className="text-gray-500">#{order}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </DemoPageTemplate>
  )
}

export default LayerOrderDebugDemo