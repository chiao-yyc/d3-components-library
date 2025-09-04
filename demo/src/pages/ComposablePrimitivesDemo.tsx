import React, { useState, useMemo } from 'react'
import { ChartContainer } from '@/components/ui/ChartContainer'
import { DemoPageTemplate } from '@/components/ui/DemoPageTemplate'
import { ModernControlPanel } from '@/components/ui/ModernControlPanel'
import { MultiSeriesComboChartV2, ComboSeries as ComboSeriesV2 } from '@/registry/components/composite'
import { AlignmentStrategy } from '@/registry/components/primitives/utils/positioning'
import * as d3 from 'd3'

const sampleData = [
  { x: 'Jan', y: 4000, trend: 4200, points: 3800 },
  { x: 'Feb', y: 3000, trend: 3100, points: 2900 },
  { x: 'Mar', y: 2000, trend: 2300, points: 2100 },
  { x: 'Apr', y: 2780, trend: 2600, points: 2850 },
  { x: 'May', y: 1890, trend: 2000, points: 1950 },
  { x: 'Jun', y: 2390, trend: 2200, points: 2450 },
  { x: 'Jul', y: 3490, trend: 3300, points: 3600 }
]

const colorThemes = {
  blue: { bar: '#3b82f6', line: '#ef4444', scatter: '#10b981' },
  purple: { bar: '#8b5cf6', line: '#f59e0b', scatter: '#ec4899' },
  green: { bar: '#10b981', line: '#6366f1', scatter: '#f97316' }
}

export default function ComposablePrimitivesDemo() {
  const [alignment, setAlignment] = useState<AlignmentStrategy>('center')
  const [theme, setTheme] = useState<keyof typeof colorThemes>('blue')
  const [showBars, setShowBars] = useState(true)
  const [showLine, setShowLine] = useState(true)
  const [showScatter, setShowScatter] = useState(true)
  const [barWidthRatio, setBarWidthRatio] = useState(0.6)
  const [animate, setAnimate] = useState(true)

  const colors = colorThemes[theme]

  // 根據用戶選擇動態生成系列配置
  const generateSeries = useMemo((): ComboSeriesV2[] => {
    const series: ComboSeriesV2[] = []
    
    if (showBars) {
      series.push({
        name: '銷售額',
        type: 'bar',
        yKey: 'y',
        yAxis: 'left',
        color: colors.bar,
        visible: true
      })
    }
    
    if (showLine) {
      series.push({
        name: '趨勢線', 
        type: 'line',
        yKey: 'trend',
        yAxis: 'left',
        color: colors.line,
        visible: true
      })
    }
    
    if (showScatter) {
      series.push({
        name: '資料點',
        type: 'scatter', 
        yKey: 'points',
        yAxis: 'right',
        color: colors.scatter,
        visible: true
      })
    }
    
    return series
  }, [showBars, showLine, showScatter, colors])

  // 動態程式碼範例 - 反映當前選擇的組件和設定
  const codeExample = `
// 使用 MultiSeriesComboChartV2 實現可組合圖表
import React, { useMemo } from 'react'
import { MultiSeriesComboChartV2, ComboSeries } from '@/registry/components/composite'
import { ChartContainer } from '@/components/ui/ChartContainer'

const sampleData = [
  { x: 'Jan', y: 4000, trend: 4200, points: 3800 },
  { x: 'Feb', y: 3000, trend: 3100, points: 2900 },
  { x: 'Mar', y: 2000, trend: 2300, points: 2100 },
  // ... more data
]

const colorThemes = {
  ${theme}: { bar: '${colors.bar}', line: '${colors.line}', scatter: '${colors.scatter}' }
}

function ComposableChart() {
  // 動態生成系列配置
  const generateSeries = useMemo((): ComboSeries[] => {
    const series: ComboSeries[] = []
    
    ${showBars ? `// 條形圖系列
    series.push({
      name: '銷售額',
      type: 'bar',
      yKey: 'y',
      yAxis: 'left',
      color: '${colors.bar}',
      visible: true
    })` : ''}
    
    ${showLine ? `// 線圖系列  
    series.push({
      name: '趨勢線',
      type: 'line', 
      yKey: 'trend',
      yAxis: 'left',
      color: '${colors.line}',
      visible: true
    })` : ''}
    
    ${showScatter ? `// 散點圖系列
    series.push({
      name: '資料點',
      type: 'scatter',
      yKey: 'points', 
      yAxis: 'right',
      color: '${colors.scatter}',
      visible: true
    })` : ''}
    
    return series
  }, [])

  return (
    <ChartContainer responsive={true} aspectRatio={16/9}>
      {({ width, height }) => (
        <MultiSeriesComboChartV2
          data={sampleData}
          series={generateSeries}
          xAccessor="x"
          width={width}
          height={height}
          leftAxisConfig={{
            label: '銷售額 / 趨勢',
            tickCount: 6
          }}
          rightAxisConfig={{
            label: '資料點', 
            tickCount: 6
          }}
          animate={${animate}}
          interactive={true}
          barWidth={${barWidthRatio}}
          colors={['${colors.bar}', '${colors.line}', '${colors.scatter}']}
          onDataClick={(data, event) => {
            console.log('點擊了數據點:', data)
          }}
        />
      )}
    </ChartContainer>
  )
}`

  const controls = [
    {
      type: 'select' as const,
      label: '對齊策略',
      value: alignment,
      options: [
        { label: '左對齊 (Start)', value: 'start' },
        { label: '中心對齊 (Center)', value: 'center' },
        { label: '右對齊 (End)', value: 'end' }
      ],
      onChange: (value: string) => setAlignment(value as AlignmentStrategy)
    },
    {
      type: 'select' as const,
      label: '顏色主題',
      value: theme,
      options: [
        { label: '藍色系', value: 'blue' },
        { label: '紫色系', value: 'purple' },
        { label: '綠色系', value: 'green' }
      ],
      onChange: (value: string) => setTheme(value as keyof typeof colorThemes)
    },
    {
      type: 'range' as const,
      label: `條形寬度 (${barWidthRatio})`,
      min: 0.2,
      max: 1.0,
      step: 0.1,
      value: barWidthRatio,
      onChange: (value: number) => setBarWidthRatio(value)
    },
    {
      type: 'checkbox' as const,
      label: '顯示條形圖',
      checked: showBars,
      onChange: (checked: boolean) => setShowBars(checked)
    },
    {
      type: 'checkbox' as const,
      label: '顯示線圖',
      checked: showLine,
      onChange: (checked: boolean) => setShowLine(checked)
    },
    {
      type: 'checkbox' as const,
      label: '顯示散點圖',
      checked: showScatter,
      onChange: (checked: boolean) => setShowScatter(checked)
    },
    {
      type: 'checkbox' as const,
      label: '開啟動畫',
      checked: animate,
      onChange: (checked: boolean) => setAnimate(checked)
    }
  ]

  return (
    <DemoPageTemplate
      title="可組合圖表系統"
      description="使用 MultiSeriesComboChart 動態組合不同圖表類型，展示現代化的組合式架構"
      tags={['combo', 'composable', 'series', 'modular']}
      codeExample={codeExample}
    >
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* 控制面板 */}
        <div className="xl:col-span-1 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <span className="text-blue-500">🎛️</span>
            組合控制
          </h3>
          <ModernControlPanel controls={controls} />
        </div>

        {/* 組合式圖表 */}
        <div className="xl:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <span className="text-green-500">🧩</span>
              可組合圖表
            </h3>
            <ChartContainer
              responsive={true}
              aspectRatio={16/9}
            >
              {({ width, height }) => (
                <MultiSeriesComboChartV2
                  data={sampleData}
                  series={generateSeries}
                  xAccessor="x"
                  width={width}
                  height={height}
                  leftAxisConfig={{
                    label: '銷售額 / 趨勢',
                    tickCount: 6
                  }}
                  rightAxisConfig={{
                    label: '資料點',
                    tickCount: 6
                  }}
                  animate={animate}
                  interactive={true}
                  barWidth={barWidthRatio}
                  colors={[colors.bar, colors.line, colors.scatter]}
                  onDataClick={(data, event) => {
                    console.log('點擊了數據點:', data)
                  }}
                />
              )}
            </ChartContainer>
          </div>
        </div>
      </div>

      {/* 動態程式碼展示區域 */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <span className="text-green-500">💻</span>
          即時程式碼範例
          <div className="ml-auto flex items-center gap-2 text-sm">
            <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
              {theme} 主題
            </div>
            <div className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
              {alignment} 對齊
            </div>
            <div className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs font-medium">
              {[showBars && '條形', showLine && '線圖', showScatter && '散點'].filter(Boolean).join(' + ')}
            </div>
            {animate && (
              <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                動畫
              </div>
            )}
          </div>
        </h3>
        
        <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
            <code>{codeExample}</code>
          </pre>
        </div>
        
        {/* 組合說明 */}
        <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <h4 className="font-semibold text-indigo-900 mb-2">
            🧩 當前組合配置
          </h4>
          <div className="text-sm text-indigo-800 space-y-2">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p><strong>啟用組件:</strong></p>
                <ul className="ml-4 space-y-1 list-disc">
                  {showBars && <li><code>type: 'bar'</code> - 條形圖系列，顏色: {colors.bar}</li>}
                  {showLine && <li><code>type: 'line'</code> - 線圖系列，顏色: {colors.line}</li>}
                  {showScatter && <li><code>type: 'scatter'</code> - 散點圖系列，顏色: {colors.scatter}</li>}
                </ul>
              </div>
              <div>
                <p><strong>共享設定:</strong></p>
                <ul className="ml-4 space-y-1 list-disc">
                  <li><code>alignment="{alignment}"</code> - 統一對齊策略</li>
                  <li><code>barWidthRatio={barWidthRatio}</code> - 條形寬度比例</li>
                  <li><code>animate={animate ? 'true' : 'false'}</code> - 動畫開關</li>
                  <li><code>theme="{theme}"</code> - {theme === 'blue' ? '藍色系' : theme === 'purple' ? '紫色系' : '綠色系'}</li>
                </ul>
              </div>
            </div>
            <p className="mt-2 font-medium">
              💡 優勢：透過系列配置實現組合式圖表，統一軸線系統，高效渲染
            </p>
          </div>
        </div>
      </div>

      {/* 組合特點說明 */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <span className="text-purple-500">⚡</span>
            組合優勢
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold">完全控制</h4>
                <p className="text-sm text-gray-600">直接控制每個圖形元素的行為和樣式</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold">極致彈性</h4>
                <p className="text-sm text-gray-600">任意組合不同類型的圖形元素</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold">高效能</h4>
                <p className="text-sm text-gray-600">只載入和渲染實際需要的組件</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <span className="text-indigo-500">🔧</span>
            使用建議
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold">進階開發者</h4>
                <p className="text-sm text-gray-600">需要完全自定義圖表行為時使用</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold">複雜需求</h4>
                <p className="text-sm text-gray-600">當現有圖表組件無法滿足需求時</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-pink-500 rounded-full mt-2"></div>
              <div>
                <h4 className="font-semibold">效能最佳化</h4>
                <p className="text-sm text-gray-600">需要極致效能和載入時間優化</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DemoPageTemplate>
  )
}