import React, { useState, useMemo } from 'react'
import { MultiSeriesComboChartV2 } from '../../../registry/components/composite/multi-series-combo-chart-v2'
import { ModernControlPanel } from '../components/ui/ModernControlPanel'
import { DemoPageTemplate } from '../components/ui/DemoPageTemplate'
import { CodeExample } from '../components/ui/CodeExample'
import { CHART_LAYER_ORDER, getChartGroup, type ChartType } from '../../../registry/components/primitives/layouts/chart-layer-constants'

const generateDebugData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  return months.map((month, i) => ({
    month,
    bar1: 100 + Math.sin(i * 0.5) * 30,
    bar2: 80 + Math.cos(i * 0.3) * 25,
    line1: 120 + i * 5,
    line2: 90 + Math.sin(i * 0.2) * 40,
    area1: 60 + Math.random() * 20,
    scatter1: 150 + Math.random() * 50,
    efficiency: 70 + Math.random() * 30
  }))
}

type DebugMode = 'layerOrder' | 'seriesDebug' | 'dataDebug'
type ChartTypeOption = 'bar' | 'line' | 'area' | 'scatter'

export const ComboDebugToolsDemo: React.FC = () => {
  const [debugMode, setDebugMode] = useState<DebugMode>('layerOrder')
  const [selectedCharts, setSelectedCharts] = useState<ChartTypeOption[]>(['bar', 'line', 'area'])
  const [showDebugInfo, setShowDebugInfo] = useState(true)
  const [animate, setAnimate] = useState(false)

  const data = useMemo(() => generateDebugData(), [])

  const chartTypeConfigs: Record<ChartTypeOption, any> = {
    bar: { 
      type: 'bar' as const,
      yKey: 'bar1',
      name: '柱狀圖',
      yAxis: 'left' as const,
      color: '#3b82f6'
    },
    line: { 
      type: 'line' as const,
      yKey: 'line1',
      name: '線圖',
      yAxis: 'left' as const,
      color: '#ef4444',
      strokeWidth: 3
    },
    area: { 
      type: 'area' as const,
      yKey: 'area1',
      name: '面積圖',
      yAxis: 'left' as const,
      color: '#10b981',
      opacity: 0.4
    },
    scatter: { 
      type: 'scatter' as const,
      yKey: 'scatter1',
      name: '散點圖',
      yAxis: 'right' as const,
      color: '#f59e0b',
      size: 6
    }
  }

  const currentSeries = selectedCharts.map(chart => chartTypeConfigs[chart])

  const layerOrderInfo = useMemo(() => {
    return selectedCharts.map(type => ({
      type,
      order: CHART_LAYER_ORDER[type as ChartType] || 0,
      group: getChartGroup(type as ChartType),
      config: chartTypeConfigs[type]
    })).sort((a, b) => a.order - b.order)
  }, [selectedCharts])

  const debugInfo = useMemo(() => {
    const modes = {
      layerOrder: {
        title: '圖層順序調試',
        description: '檢查圖表圖層的渲染順序和 z-index 設置',
        content: (
          <div className="space-y-4">
            <h5 className="font-medium">當前圖層順序 (底層 → 頂層):</h5>
            <div className="space-y-2">
              {layerOrderInfo.map((info, index) => (
                <div key={info.type} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      #{index + 1}
                    </span>
                    <span className="font-medium capitalize">{info.type}</span>
                    <span className="text-sm text-gray-500">
                      ({info.group} 組)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">zIndex: {info.order}</span>
                    <div 
                      className="w-4 h-4 rounded" 
                      style={{ backgroundColor: info.config.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            {layerOrderInfo.length === 0 && (
              <p className="text-gray-500 text-center py-4">請選擇至少一種圖表類型</p>
            )}
          </div>
        )
      },
      seriesDebug: {
        title: '系列配置調試',
        description: '檢查每個系列的配置參數和數據映射',
        content: (
          <div className="space-y-4">
            <h5 className="font-medium">系列配置詳情:</h5>
            <div className="space-y-3">
              {currentSeries.map((series, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2 mb-2">
                    <div 
                      className="w-3 h-3 rounded" 
                      style={{ backgroundColor: series.color }}
                    />
                    <span className="font-medium">{series.name}</span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div><strong>Type:</strong> {series.type}</div>
                    <div><strong>YKey:</strong> {series.yKey}</div>
                    <div><strong>YAxis:</strong> {series.yAxis}</div>
                    <div><strong>Color:</strong> {series.color}</div>
                    {series.opacity && <div><strong>Opacity:</strong> {series.opacity}</div>}
                    {series.strokeWidth && <div><strong>StrokeWidth:</strong> {series.strokeWidth}</div>}
                    {series.size && <div><strong>Size:</strong> {series.size}</div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      },
      dataDebug: {
        title: '數據結構調試',
        description: '檢查數據結構和數據映射是否正確',
        content: (
          <div className="space-y-4">
            <h5 className="font-medium">數據樣本 (前3筆):</h5>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">月份</th>
                    {selectedCharts.map(chart => (
                      <th key={chart} className="text-left p-2">
                        {chartTypeConfigs[chart].yKey}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 3).map((row, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2 font-medium">{row.month}</td>
                      {selectedCharts.map(chart => (
                        <td key={chart} className="p-2">
                          {Math.round(row[chartTypeConfigs[chart].yKey as keyof typeof row] as number)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="text-sm text-gray-600">
              <div><strong>總數據筆數:</strong> {data.length}</div>
              <div><strong>選中系列數:</strong> {currentSeries.length}</div>
              <div><strong>X軸字段:</strong> month</div>
            </div>
          </div>
        )
      }
    }
    return modes[debugMode]
  }, [debugMode, layerOrderInfo, currentSeries, data, selectedCharts])

  const codeExample = `
// 調試模式: ${debugInfo.title}
<MultiSeriesComboChartV2
  data={debugData}
  series={[
${currentSeries.map(s => 
  `    { type: '${s.type}', yKey: '${s.yKey}', name: '${s.name}', color: '${s.color}', yAxis: '${s.yAxis}' }`
).join(',\\n')}
  ]}
  xAccessor="month"
  animate={${animate}}
  interactive={true}
  leftAxis={{ label: '主軸數值', gridlines: true }}
  rightAxis={{ label: '副軸數值', gridlines: false }}
  xAxis={{ label: '月份', gridlines: true }}
/>
`

  const handleChartToggle = (chart: ChartTypeOption) => {
    setSelectedCharts(prev => 
      prev.includes(chart) 
        ? prev.filter(c => c !== chart)
        : [...prev, chart]
    )
  }

  return (
    <DemoPageTemplate
      title="組合圖表調試工具"
      description="專業的調試工具，幫助開發者檢查圖層順序、系列配置和數據結構"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* 圖表展示 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">{debugInfo.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{debugInfo.description}</p>
              </div>
              <div className="text-sm text-gray-500">
                {currentSeries.length} 個系列
              </div>
            </div>
            <div className="w-full">
              <MultiSeriesComboChartV2
                data={data}
                series={currentSeries}
                xAccessor="month"
                responsive={true}
                animate={animate}
                interactive={true}
                leftAxis={{
                  label: '主軸數值',
                  gridlines: true
                }}
                rightAxis={{
                  label: '副軸數值',
                  gridlines: false
                }}
                xAxis={{
                  label: '月份',
                  gridlines: true
                }}
              />
            </div>
          </div>

          {/* 調試信息面板 */}
          {showDebugInfo && (
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              {debugInfo.content}
            </div>
          )}
          
          <CodeExample code={codeExample} />
        </div>

        {/* 控制面板 */}
        <div className="space-y-6">
          <ModernControlPanel>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">調試模式</h4>
                <div className="space-y-2">
                  {[
                    { value: 'layerOrder', label: '圖層順序' },
                    { value: 'seriesDebug', label: '系列配置' },
                    { value: 'dataDebug', label: '數據結構' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="debugMode"
                        value={option.value}
                        checked={debugMode === option.value}
                        onChange={(e) => setDebugMode(e.target.value as DebugMode)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">圖表類型</h4>
                <div className="space-y-2">
                  {(['bar', 'line', 'area', 'scatter'] as ChartTypeOption[]).map(chart => (
                    <label key={chart} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedCharts.includes(chart)}
                        onChange={() => handleChartToggle(chart)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded" 
                          style={{ backgroundColor: chartTypeConfigs[chart].color }}
                        />
                        <span className="capitalize">{chart}</span>
                      </div>
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
                      checked={showDebugInfo}
                      onChange={(e) => setShowDebugInfo(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>顯示調試資訊</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={animate}
                      onChange={(e) => setAnimate(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>動畫效果</span>
                  </label>
                </div>
              </div>
            </div>
          </ModernControlPanel>
        </div>
      </div>
    </DemoPageTemplate>
  )
}

export default ComboDebugToolsDemo