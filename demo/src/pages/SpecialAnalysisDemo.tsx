import React, { useState, useMemo } from 'react'
import { MultiSeriesComboChartV2 } from '../../../registry/components/composite/multi-series-combo-chart-v2'
import { ModernControlPanel } from '../components/ui/ModernControlPanel'
import { DemoPageTemplate } from '../components/ui/DemoPageTemplate'
import { CodeExample } from '../components/ui/CodeExample'

const generateWaterfallData = () => {
  return [
    { category: '起始值', value: 1000, type: 'start', cumulative: 1000 },
    { category: '增加A', value: 200, type: 'positive', cumulative: 1200 },
    { category: '增加B', value: 150, type: 'positive', cumulative: 1350 },
    { category: '減少C', value: -100, type: 'negative', cumulative: 1250 },
    { category: '增加D', value: 300, type: 'positive', cumulative: 1550 },
    { category: '減少E', value: -80, type: 'negative', cumulative: 1470 },
    { category: '最終值', value: 1470, type: 'end', cumulative: 1470 }
  ]
}

const generateConfidenceData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  return months.map((month, i) => {
    const actual = 50 + Math.sin(i * 0.5) * 20 + Math.random() * 10
    const confidence = Math.random() * 15 + 5
    return {
      month,
      actual: Math.round(actual),
      upper: Math.round(actual + confidence),
      lower: Math.round(actual - confidence),
      trend: Math.round(45 + i * 2.5),
      confidence: Math.round(confidence)
    }
  })
}

type AnalysisType = 'waterfall' | 'confidence'

export const SpecialAnalysisDemo: React.FC = () => {
  const [analysisType, setAnalysisType] = useState<AnalysisType>('waterfall')
  const [showTrend, setShowTrend] = useState(true)
  const [animate, setAnimate] = useState(true)

  const waterfallData = useMemo(() => generateWaterfallData(), [])
  const confidenceData = useMemo(() => generateConfidenceData(), [])

  const analysisConfig = useMemo(() => {
    const configs = {
      waterfall: {
        title: '瀑布圖累積分析',
        description: '瀑布圖展示數值的累積變化過程，結合趨勢線顯示整體走向',
        data: waterfallData,
        xKey: 'category',
        series: [
          {
            type: 'bar' as const,
            yKey: 'value',
            name: '變化值',
            yAxis: 'left' as const,
            color: '#3b82f6'
          },
          ...(showTrend ? [{
            type: 'line' as const,
            yKey: 'cumulative',
            name: '累積趨勢',
            yAxis: 'left' as const,
            color: '#ef4444',
            strokeWidth: 3
          }] : [])
        ]
      },
      confidence: {
        title: '置信區間分析',
        description: '面積圖展示置信區間，散點圖顯示實際數值',
        data: confidenceData,
        xKey: 'month',
        series: [
          {
            type: 'area' as const,
            yKey: 'upper',
            name: '上界',
            yAxis: 'left' as const,
            color: '#3b82f6',
            opacity: 0.2
          },
          {
            type: 'area' as const,
            yKey: 'lower',
            name: '下界',
            yAxis: 'left' as const,
            color: '#3b82f6',
            opacity: 0.2
          },
          {
            type: 'scatter' as const,
            yKey: 'actual',
            name: '實際值',
            yAxis: 'left' as const,
            color: '#ef4444',
            size: 6
          },
          ...(showTrend ? [{
            type: 'line' as const,
            yKey: 'trend',
            name: '趨勢線',
            yAxis: 'left' as const,
            color: '#10b981',
            strokeWidth: 2,
            strokeDasharray: '5,5'
          }] : [])
        ]
      }
    }
    return configs[analysisType]
  }, [analysisType, showTrend, waterfallData, confidenceData])

  const codeExample = `
// ${analysisConfig.title}
<MultiSeriesComboChartV2
  data={${analysisType === 'waterfall' ? 'waterfallData' : 'confidenceData'}}
  series={[
${analysisConfig.series.map(s => 
  `    { type: '${s.type}', yKey: '${s.yKey}', name: '${s.name}', color: '${s.color}', yAxis: '${s.yAxis}' }`
).join(',\\n')}
  ]}
  xAccessor="${analysisConfig.xKey}"
  animate={${animate}}
  interactive={true}
  leftAxis={{ label: '數值', gridlines: true }}
  xAxis={{ label: '${analysisType === 'waterfall' ? '類別' : '月份'}', gridlines: true }}
/>
`

  return (
    <DemoPageTemplate
      title="特殊分析組合圖表"
      description="專業的分析圖表組合，包括瀑布圖累積分析和置信區間分析"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* 圖表展示 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">{analysisConfig.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{analysisConfig.description}</p>
              </div>
              <div className="text-sm text-gray-500">
                {analysisConfig.series.length} 個系列
              </div>
            </div>
            <div className="w-full">
              <MultiSeriesComboChartV2
                data={analysisConfig.data}
                series={analysisConfig.series}
                xAccessor={analysisConfig.xKey}
                responsive={true}
                animate={animate}
                interactive={true}
                leftAxis={{
                  label: '數值',
                  gridlines: true
                }}
                xAxis={{
                  label: analysisType === 'waterfall' ? '類別' : '月份',
                  gridlines: true
                }}
              />
            </div>
          </div>

          {/* 數據摘要 */}
          {analysisType === 'waterfall' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">瀑布圖分析摘要</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">起始值:</span>
                  <span className="ml-2 font-medium">1,000</span>
                </div>
                <div>
                  <span className="text-gray-600">總增加:</span>
                  <span className="ml-2 font-medium text-green-600">+650</span>
                </div>
                <div>
                  <span className="text-gray-600">總減少:</span>
                  <span className="ml-2 font-medium text-red-600">-180</span>
                </div>
                <div>
                  <span className="text-gray-600">最終值:</span>
                  <span className="ml-2 font-medium">1,470</span>
                </div>
              </div>
            </div>
          )}
          
          <CodeExample code={codeExample} />
        </div>

        {/* 控制面板 */}
        <div className="space-y-6">
          <ModernControlPanel>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">分析類型</h4>
                <div className="space-y-2">
                  {[
                    { value: 'waterfall', label: '瀑布圖分析' },
                    { value: 'confidence', label: '置信區間分析' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="analysisType"
                        value={option.value}
                        checked={analysisType === option.value}
                        onChange={(e) => setAnalysisType(e.target.value as AnalysisType)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">展示選項</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={showTrend}
                      onChange={(e) => setShowTrend(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      {analysisType === 'waterfall' ? '累積趨勢線' : '趨勢線'}
                    </span>
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

          {/* 分析說明 */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-3">
              {analysisType === 'waterfall' ? '瀑布圖說明' : '置信區間說明'}
            </h4>
            <div className="space-y-2 text-sm text-gray-600">
              {analysisType === 'waterfall' ? (
                <>
                  <p>• 展示數值的累積變化過程</p>
                  <p>• 正值表示增加，負值表示減少</p>
                  <p>• 趨勢線顯示累積效果</p>
                  <p>• 適用於財務分析、流程分析</p>
                </>
              ) : (
                <>
                  <p>• 面積圖顯示不確定性範圍</p>
                  <p>• 散點圖標記實際觀測值</p>
                  <p>• 趨勢線展示整體走向</p>
                  <p>• 適用於預測分析、風險評估</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DemoPageTemplate>
  )
}

export default SpecialAnalysisDemo