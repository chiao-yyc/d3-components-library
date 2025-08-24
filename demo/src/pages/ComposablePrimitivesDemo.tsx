import React, { useState, useMemo } from 'react'
import { ChartContainer } from '@/components/ui/ChartContainer'
import { DemoPageTemplate } from '@/components/ui/DemoPageTemplate'
import { ModernControlPanel } from '@/components/ui/ModernControlPanel'
import { ChartCanvas } from '@/registry/components/primitives/canvas'
import { Bar } from '@/registry/components/primitives/shapes/bar'
import { Line } from '@/registry/components/primitives/shapes/line'
import { Scatter } from '@/registry/components/primitives/shapes/scatter'
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

  // 創建 scales
  const { xScale, yScale } = useMemo(() => {
    const xScale = d3.scaleBand()
      .domain(sampleData.map(d => d.x))
      .range([0, 800 - 80 - 80])  // width - left margin - right margin
      .padding(0.1)
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(sampleData, d => Math.max(d.y, d.trend, d.points)) || 5000])
      .range([400 - 20 - 60, 0])  // height - top margin - bottom margin
      .nice()
    
    return { xScale, yScale }
  }, [])

  // 動態程式碼範例 - 反映當前選擇的組件和設定
  const codeExample = `
// 完全組合式圖表構建 - 使用 Primitives 直接組合
import React, { useMemo } from 'react'
import { ChartCanvas } from '@/registry/components/primitives/canvas'
import { ${[showBars && 'Bar', showLine && 'Line', showScatter && 'Scatter'].filter(Boolean).join(', ')} } from '@/registry/components/primitives/shapes'
import * as d3 from 'd3'

const sampleData = [
  { x: 'Jan', y: 4000, trend: 4200, points: 3800 },
  { x: 'Feb', y: 3000, trend: 3100, points: 2900 },
  // ... more data
]

function ComposableChart() {
  // 創建 scales
  const { xScale, yScale } = useMemo(() => {
    const xScale = d3.scaleBand()
      .domain(sampleData.map(d => d.x))
      .range([0, 640])  // 800 - margins
      .padding(0.1)
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(sampleData, d => Math.max(d.y, d.trend, d.points))])
      .range([320, 0])  // 400 - margins
      .nice()
    
    return { xScale, yScale }
  }, [])

  return (
    <ChartCanvas width={800} height={400} margin={{ top: 20, right: 80, bottom: 60, left: 80 }}>
      <svg width={800} height={400}>
        <g transform="translate(80, 20)">
          {/* 手動軸線渲染 */}
          <g transform="translate(0, 320)">
            {xScale.domain().map(tick => (
              <g key={tick}>
                <line x1={xScale(tick) + xScale.bandwidth() / 2} 
                      x2={xScale(tick) + xScale.bandwidth() / 2} 
                      y1={0} y2={5} stroke="#666" />
                <text x={xScale(tick) + xScale.bandwidth() / 2} 
                      y={20} textAnchor="middle" fontSize={12}>{tick}</text>
              </g>
            ))}
            <line x1={0} x2={640} y1={0} y2={0} stroke="#666" />
          </g>
          
          <g>
            {yScale.ticks(5).map(tick => (
              <g key={tick}>
                <line x1={-5} x2={0} y1={yScale(tick)} y2={yScale(tick)} stroke="#666" />
                <text x={-10} y={yScale(tick) + 4} textAnchor="end" fontSize={12}>{tick}</text>
                <line x1={0} x2={640} y1={yScale(tick)} y2={yScale(tick)} 
                      stroke="#e5e7eb" strokeDasharray="2,2" />
              </g>
            ))}
            <line x1={0} x2={0} y1={0} y2={320} stroke="#666" />
          </g>

          {/* 當前啟用的組件 - 主題: ${theme} 對齊: ${alignment} */}
          ${showBars ? `
          {/* 條形圖 - 銷售額 */}
          <Bar 
            data={sampleData.map(d => ({ x: d.x, y: d.y }))}
            xScale={xScale}
            yScale={yScale}
            alignment="${alignment}"
            barWidthRatio={${barWidthRatio}}
            color="${colors.bar}"
            animate={${animate}}
            animationDuration={600}
          />` : ''}
          ${showLine ? `
          {/* 線圖 - 趨勢線 */}
          <Line 
            data={sampleData.map(d => ({ x: d.x, y: d.trend }))}
            xScale={xScale}
            yScale={yScale}
            pointAlignment="${alignment}"
            color="${colors.line}"
            strokeWidth={3}
            showPoints={true}
            pointRadius={4}
            animate={${animate}}
            animationDuration={800}
          />` : ''}
          ${showScatter ? `
          {/* 散點圖 - 資料點 */}
          <Scatter 
            data={sampleData.map(d => ({ x: d.x, y: d.points }))}
            xScale={xScale}
            yScale={yScale}
            pointAlignment="${alignment}"
            color="${colors.scatter}"
            radius={6}
            opacity={0.8}
            animate={${animate}}
            animationDuration={1000}
          />` : ''}
        </g>
      </svg>
    </ChartCanvas>
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
      title="可組合元件演示"
      description="使用 Primitives 組件系統構建完全自定義的圖表，展示高度組合式架構"
      tags={['primitives', 'composable', 'flexible', 'modular']}
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
            <ChartContainer>
              <ChartCanvas 
                width={800} 
                height={400} 
                margin={{ top: 20, right: 80, bottom: 60, left: 80 }}
              >
                <svg width={800} height={400}>
                  <g transform="translate(80, 20)">
                    {/* 軸線 */}
                    <g transform={`translate(0, ${400 - 20 - 60})`}>
                      {xScale.domain().map((tick: any) => {
                        const x = xScale(tick)! + xScale.bandwidth()! / 2
                        return (
                          <g key={tick}>
                            <line x1={x} x2={x} y1={0} y2={5} stroke="#666" />
                            <text x={x} y={20} textAnchor="middle" fontSize={12} fill="#666">
                              {tick}
                            </text>
                          </g>
                        )
                      })}
                      <line x1={0} x2={800 - 80 - 80} y1={0} y2={0} stroke="#666" />
                    </g>
                    
                    <g>
                      {yScale.ticks(5).map((tick: any) => {
                        const y = yScale(tick)
                        return (
                          <g key={tick}>
                            <line x1={-5} x2={0} y1={y} y2={y} stroke="#666" />
                            <text x={-10} y={y + 4} textAnchor="end" fontSize={12} fill="#666">
                              {tick}
                            </text>
                            <line 
                              x1={0} 
                              x2={800 - 80 - 80} 
                              y1={y} 
                              y2={y} 
                              stroke="#e5e7eb" 
                              strokeDasharray="2,2" 
                            />
                          </g>
                        )
                      })}
                      <line x1={0} x2={0} y1={0} y2={400 - 20 - 60} stroke="#666" />
                    </g>

                    {/* 條形圖 - 銷售額 */}
                    {showBars && (
                      <Bar 
                        data={sampleData.map(d => ({ x: d.x, y: d.y }))}
                        xScale={xScale}
                        yScale={yScale}
                        alignment={alignment}
                        barWidthRatio={barWidthRatio}
                        color={colors.bar}
                        animate={animate}
                        animationDuration={600}
                      />
                    )}
                    
                    {/* 線圖 - 趨勢 */}
                    {showLine && (
                      <Line 
                        data={sampleData.map(d => ({ x: d.x, y: d.trend }))}
                        xScale={xScale}
                        yScale={yScale}
                        pointAlignment={alignment}
                        color={colors.line}
                        strokeWidth={3}
                        showPoints={true}
                        pointRadius={4}
                        animate={animate}
                        animationDuration={800}
                      />
                    )}
                    
                    {/* 散點圖 - 資料點 */}
                    {showScatter && (
                      <Scatter 
                        data={sampleData.map(d => ({ x: d.x, y: d.points }))}
                        xScale={xScale}
                        yScale={yScale}
                        pointAlignment={alignment}
                        color={colors.scatter}
                        radius={6}
                        opacity={0.8}
                        animate={animate}
                        animationDuration={1000}
                      />
                    )}
                  </g>
                </svg>
              </ChartCanvas>
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
                  {showBars && <li><code>&lt;Bar /&gt;</code> - 條形圖組件，顏色: {colors.bar}</li>}
                  {showLine && <li><code>&lt;Line /&gt;</code> - 線圖組件，顏色: {colors.line}</li>}
                  {showScatter && <li><code>&lt;Scatter /&gt;</code> - 散點圖組件，顏色: {colors.scatter}</li>}
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
              💡 優勢：每個組件獨立渲染，可任意組合，完全控制渲染順序和樣式
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