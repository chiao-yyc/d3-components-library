import React, { useState, useMemo } from 'react'
import { MultiSeriesComboChartV2 } from '../../../registry/components/composite/multi-series-combo-chart-v2'
import { ModernControlPanel } from '../components/ui/ModernControlPanel'
import { DemoPageTemplate } from '../components/ui/DemoPageTemplate'
import { CodeExample } from '../components/ui/CodeExample'

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

type ComboScenario = 'triple' | 'multiBar' | 'stackedArea'

export const AdvancedComboDemo: React.FC = () => {
  const [scenario, setScenario] = useState<ComboScenario>('triple')
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)

  const data = useMemo(() => generateDemoData(), [])

  const scenarioConfig = useMemo(() => {
    const configs = {
      triple: {
        title: '三重組合圖表',
        description: '柱狀圖 + 線圖 + 面積圖三種圖表類型疊加',
        series: [
          {
            type: 'bar' as const,
            yKey: 'profit',
            name: '利潤',
            yAxis: 'left' as const,
            color: '#10b981'
          },
          {
            type: 'line' as const,
            yKey: 'target',
            name: '目標',
            yAxis: 'left' as const,
            color: '#06b6d4',
            strokeWidth: 3
          },
          {
            type: 'area' as const,
            yKey: 'expenses',
            name: '支出',
            yAxis: 'left' as const,
            color: '#8b5cf6',
            opacity: 0.3
          }
        ]
      },
      multiBar: {
        title: '多組柱狀圖對比',
        description: '多組柱狀圖 + 趨勢線展示多維度數據比較',
        series: [
          {
            type: 'bar' as const,
            yKey: 'revenue',
            name: '營收',
            yAxis: 'left' as const,
            color: '#3b82f6'
          },
          {
            type: 'bar' as const,
            yKey: 'profit',
            name: '利潤',
            yAxis: 'left' as const,
            color: '#10b981'
          },
          {
            type: 'line' as const,
            yKey: 'efficiency',
            name: '效率',
            yAxis: 'right' as const,
            color: '#ef4444',
            strokeWidth: 2
          }
        ]
      },
      stackedArea: {
        title: '堆疊面積分析',
        description: '堆疊面積圖 + 趨勢線展示構成比例',
        series: [
          {
            type: 'area' as const,
            yKey: 'expenses',
            name: '支出',
            yAxis: 'left' as const,
            color: '#8b5cf6',
            opacity: 0.6,
            stack: 'stack1'
          },
          {
            type: 'area' as const,
            yKey: 'profit',
            name: '利潤',
            yAxis: 'left' as const,
            color: '#10b981',
            opacity: 0.6,
            stack: 'stack1'
          },
          {
            type: 'line' as const,
            yKey: 'target',
            name: '目標',
            yAxis: 'left' as const,
            color: '#f59e0b',
            strokeWidth: 3,
            strokeDasharray: '5,5'
          }
        ]
      }
    }
    return configs[scenario]
  }, [scenario])

  const codeExample = `
// ${scenarioConfig.title}
<MultiSeriesComboChartV2
  data={data}
  series={[
${scenarioConfig.series.map(s => 
  `    { type: '${s.type}', yKey: '${s.yKey}', name: '${s.name}', color: '${s.color}', yAxis: '${s.yAxis}' }`
).join(',\\n')}
  ]}
  xAccessor="month"
  animate={${animate}}
  interactive={${interactive}}
  leftAxis={{ label: '數值', gridlines: true }}
  ${scenarioConfig.series.some(s => s.yAxis === 'right') ? 'rightAxis={{ label: "效率 (%)", gridlines: false }}' : ''}
  xAxis={{ label: '月份', gridlines: true }}
/>
`

  return (
    <DemoPageTemplate
      title="進階組合圖表"
      description="探索複雜的多圖表類型組合，包括三重組合、多柱狀圖對比和堆疊面積分析"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* 圖表展示 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">{scenarioConfig.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{scenarioConfig.description}</p>
              </div>
              <div className="text-sm text-gray-500">
                {scenarioConfig.series.length} 個系列
              </div>
            </div>
            <div className="w-full">
              <MultiSeriesComboChartV2
                data={data}
                series={scenarioConfig.series}
                xAccessor="month"
                responsive={true}
                animate={animate}
                interactive={interactive}
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
          </div>
          
          <CodeExample code={codeExample} />
        </div>

        {/* 控制面板 */}
        <div className="space-y-6">
          <ModernControlPanel>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">組合場景</h4>
                <div className="space-y-2">
                  {[
                    { value: 'triple', label: '三重組合' },
                    { value: 'multiBar', label: '多柱狀圖' },
                    { value: 'stackedArea', label: '堆疊面積' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="scenario"
                        value={option.value}
                        checked={scenario === option.value}
                        onChange={(e) => setScenario(e.target.value as ComboScenario)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">圖表選項</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={animate}
                      onChange={(e) => setAnimate(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>動畫效果</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={interactive}
                      onChange={(e) => setInteractive(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>交互功能</span>
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

export default AdvancedComboDemo