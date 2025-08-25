import React, { useState, useMemo } from 'react'
import { ChartContainer } from '@/components/ui/ChartContainer'
import { DemoPageTemplate } from '@/components/ui/DemoPageTemplate'
import { ModernControlPanel } from '@/components/ui/ModernControlPanel'
import { ResponsiveChartContainer } from '@/registry/components/primitives/canvas/responsive-chart-container'
import { ChartCanvas } from '@/registry/components/primitives/canvas'
import { Bar } from '@/registry/components/primitives/shapes/bar'
import { Line } from '@/registry/components/primitives/shapes/line'
import { Scatter } from '@/registry/components/primitives/shapes/scatter'
import { AlignmentStrategy } from '@/registry/components/primitives/utils/positioning'
import * as d3 from 'd3'

const testData = [
  { category: 'A', barValue: 100, lineValue: 80, scatterValue: 90 },
  { category: 'B', barValue: 150, lineValue: 120, scatterValue: 135 },
  { category: 'C', barValue: 80, lineValue: 70, scatterValue: 75 },
  { category: 'D', barValue: 200, lineValue: 180, scatterValue: 190 },
  { category: 'E', barValue: 120, lineValue: 100, scatterValue: 110 }
]

export default function AlignmentTestDemo() {
  const [alignment, setAlignment] = useState<AlignmentStrategy>('center')
  const [barWidthRatio, setBarWidthRatio] = useState(0.6)
  const [showGrid, setShowGrid] = useState(true)
  const [showGuides, setShowGuides] = useState(false)

  // 響應式圖表組件
  const ResponsiveAlignmentChart: React.FC<{ width: number; height: number }> = ({ width, height }) => {
    // 使用 ChartCanvas 預設 margin: { top: 20, right: 20, bottom: 40, left: 40 }
    const margin = { top: 20, right: 20, bottom: 40, left: 40 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    // 創建響應式 scales
    const { xScale, yScale } = useMemo(() => {
      const xScale = d3.scaleBand()
        .domain(testData.map(d => d.category))
        .range([0, chartWidth])
        .padding(0.1)
      
      const yScale = d3.scaleLinear()
        .domain([0, d3.max(testData, d => Math.max(d.barValue, d.lineValue, d.scatterValue)) || 200])
        .range([chartHeight, 0])
        .nice()
      
      return { xScale, yScale }
    }, [chartWidth, chartHeight])

    // 生成對齊測試輔助線
    const AlignmentGuides: React.FC<{ xScale: any; height: number }> = ({ xScale, height }) => {
      if (!showGuides || !xScale.domain) return null
      
      return (
        <g className="alignment-guides">
          {xScale.domain().map((value: any) => {
            // 計算對齊位置
            let x: number
            const baseX = xScale(value)
            
            if (xScale.bandwidth) {
              const bandwidth = xScale.bandwidth()
              switch (alignment) {
                case 'start':
                  x = baseX
                  break
                case 'center':
                  x = baseX + bandwidth / 2
                  break
                case 'end':
                  x = baseX + bandwidth
                  break
                default:
                  x = baseX + bandwidth / 2
              }
            } else {
              x = baseX
            }
            
            return (
              <line
                key={value}
                x1={x}
                x2={x}
                y1={0}
                y2={height}
                stroke="#ff0000"
                strokeWidth={1}
                strokeDasharray="2,2"
                opacity={0.8}
              />
            )
          })}
        </g>
      )
    }

    return (
      <ChartCanvas 
        width={width} 
        height={height}
        margin={margin}
      >
        <svg width={width} height={height}>
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* X軸 */}
            <g transform={`translate(0, ${chartHeight})`}>
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
              <line x1={0} x2={chartWidth} y1={0} y2={0} stroke="#666" />
            </g>
            
            {/* Y軸 */}
            <g>
              {yScale.ticks(5).map((tick: any) => {
                const y = yScale(tick)
                return (
                  <g key={tick}>
                    <line x1={-5} x2={0} y1={y} y2={y} stroke="#666" />
                    <text x={-10} y={y + 4} textAnchor="end" fontSize={12} fill="#666">
                      {tick}
                    </text>
                    {showGrid && (
                      <line 
                        x1={0} 
                        x2={chartWidth} 
                        y1={y} 
                        y2={y} 
                        stroke="#e5e7eb" 
                        strokeDasharray="2,2" 
                      />
                    )}
                  </g>
                )
              })}
              <line x1={0} x2={0} y1={0} y2={chartHeight} stroke="#666" />
            </g>
            
            {/* 條形圖 */}
            <Bar 
              data={testData.map(d => ({ x: d.category, y: d.barValue }))}
              xScale={xScale}
              yScale={yScale}
              alignment={alignment}
              barWidthRatio={barWidthRatio}
              color="#3b82f6"
              opacity={0.8}
              animate={true}
              animationDuration={500}
            />
            
            {/* 線圖 */}
            <Line 
              data={testData.map(d => ({ x: d.category, y: d.lineValue }))}
              xScale={xScale}
              yScale={yScale}
              pointAlignment={alignment}
              color="#ef4444"
              strokeWidth={3}
              showPoints={true}
              pointRadius={5}
              animate={true}
              animationDuration={700}
            />
            
            {/* 散點圖 */}
            <Scatter 
              data={testData.map(d => ({ x: d.category, y: d.scatterValue }))}
              xScale={xScale}
              yScale={yScale}
              pointAlignment={alignment}
              color="#10b981"
              radius={8}
              opacity={0.9}
              strokeColor="white"
              strokeWidth={2}
              animate={true}
              animationDuration={900}
            />
            
            {/* 對齊輔助線 */}
            {showGuides && (
              <AlignmentGuides 
                xScale={xScale}
                height={chartHeight}
              />
            )}
          </g>
        </svg>
      </ChartCanvas>
    )
  }

  // 動態程式碼範例 - 根據控制面板設定同步更新
  const codeExample = `// 響應式對齊測試演示 - 使用 ResponsiveChartContainer + Primitives
import React, { useMemo } from 'react'
import { ResponsiveChartContainer } from '@/registry/components/primitives/canvas/responsive-chart-container'
import { ChartCanvas } from '@/registry/components/primitives/canvas'
import { Bar, Line, Scatter } from '@/registry/components/primitives/shapes'
import * as d3 from 'd3'

function ResponsiveAlignmentChart() {
  return (
    <ResponsiveChartContainer>
      {({ width, height }) => {
        // 創建響應式 scales 和渲染邏輯
        const margin = { top: 20, right: 20, bottom: 40, left: 40 }  // 使用系統預設
        const chartWidth = width - margin.left - margin.right
        const chartHeight = height - margin.top - margin.bottom

        // 條形圖 - 當前對齊策略: ${alignment}
        <Bar alignment="${alignment}" barWidthRatio={${barWidthRatio}} />
        
        // 線圖和散點圖 - 點對齊策略: ${alignment}
        <Line pointAlignment="${alignment}" />
        <Scatter pointAlignment="${alignment}" />
        
        ${showGuides ? '// 顯示對齊輔助線' : '// 隱藏對齊輔助線'}
        ${showGrid ? '// 顯示網格線' : '// 隱藏網格線'}
      }}
    </ResponsiveChartContainer>
  )
}`

  const alignmentDescription = {
    start: {
      title: '左對齊 (Start)',
      description: '所有元素對齊到 band 的左邊緣',
      details: '條形圖從左邊緣開始，線圖和散點圖的點位於左邊緣'
    },
    center: {
      title: '中心對齊 (Center)',  
      description: '所有元素對齊到 band 的中心',
      details: '條形圖居中顯示，線圖和散點圖的點位於中心位置'
    },
    end: {
      title: '右對齊 (End)',
      description: '所有元素對齊到 band 的右邊緣',
      details: '條形圖對齊到右邊緣，線圖和散點圖的點位於右邊緣'
    }
  }

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
      type: 'range' as const,
      label: `條形寬度比例 (${barWidthRatio})`,
      min: 0.2,
      max: 1.0,
      step: 0.1,
      value: barWidthRatio,
      onChange: (value: number) => setBarWidthRatio(value)
    },
    {
      type: 'checkbox' as const,
      label: '顯示網格線',
      checked: showGrid,
      onChange: (checked: boolean) => setShowGrid(checked)
    },
    {
      type: 'checkbox' as const,
      label: '顯示對齊輔助線',
      checked: showGuides,
      onChange: (checked: boolean) => setShowGuides(checked)
    }
  ]

  const currentAlignmentInfo = alignmentDescription[alignment]

  return (
    <DemoPageTemplate
      title="對齊問題測試頁面"
      description="驗證和測試 Primitives 組件的對齊一致性，展示統一對齊策略的效果"
      tags={['alignment', 'primitives', 'test', 'debugging']}
      codeExample={codeExample}
    >
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* 控制面板 */}
        <div className="xl:col-span-1 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <span className="text-red-500">🎯</span>
            對齊測試控制
          </h3>
          <ModernControlPanel controls={controls} />
          
          {/* 當前對齊策略說明 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-2">
              {currentAlignmentInfo.title}
            </h4>
            <p className="text-sm text-blue-800 mb-2">
              {currentAlignmentInfo.description}
            </p>
            <p className="text-xs text-blue-600">
              {currentAlignmentInfo.details}
            </p>
          </div>
        </div>

        {/* 測試圖表 */}
        <div className="xl:col-span-3">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <span className="text-green-500">🧪</span>
              對齊測試圖表 (響應式)
              {showGuides && (
                <span className="text-sm text-red-500 ml-2">
                  (紅色虛線 = 對齊參考線)
                </span>
              )}
            </h3>
            <ChartContainer>
              <ResponsiveChartContainer 
                minHeight={400}
                maxHeight={600}
              >
                {({ width, height }) => (
                  <ResponsiveAlignmentChart width={width} height={height} />
                )}
              </ResponsiveChartContainer>
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
              對齊: {alignment}
            </div>
            <div className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs font-medium">
              寬度: {barWidthRatio}
            </div>
            {showGrid && (
              <div className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                網格線
              </div>
            )}
            {showGuides && (
              <div className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                輔助線
              </div>
            )}
          </div>
        </h3>
        
        <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
          <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono leading-relaxed">
            <code>{codeExample}</code>
          </pre>
        </div>
        
        {/* 程式碼說明 */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-900 mb-2">
            📝 程式碼說明 - {currentAlignmentInfo.title}
          </h4>
          <div className="text-sm text-blue-800 space-y-2">
            <p><strong>當前設定:</strong></p>
            <ul className="ml-4 space-y-1 list-disc">
              <li><code>alignment="{alignment}"</code> - {currentAlignmentInfo.description}</li>
              <li><code>barWidthRatio={barWidthRatio}</code> - 條形寬度占 band 的 {(barWidthRatio * 100).toFixed(0)}%</li>
              <li><code>pointAlignment="{alignment}"</code> - 線圖和散點圖使用相同對齊策略</li>
              {showGrid && <li><code>gridlines=true</code> - 顯示 Y 軸網格線輔助對齊檢視</li>}
              {showGuides && <li><code>AlignmentGuides</code> - 紅色虛線顯示精確對齊位置</li>}
            </ul>
            <p className="mt-2"><strong>重要:</strong> {currentAlignmentInfo.details}</p>
          </div>
        </div>
      </div>

      {/* 測試結果分析 */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <span className="text-purple-500">✅</span>
              對齊驗證清單
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">條形圖使用統一對齊策略</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">線圖點與對齊策略一致</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">散點圖遵循相同對齊規則</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">視覺上完全對齊，無偏移</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">支援動態切換對齊策略</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">響應式容器自動調整尺寸</span>
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
              <span className="text-orange-500">🔧</span>
              技術實現細節
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• <strong>響應式容器</strong>：ResponsiveChartContainer</p>
              <p>• <strong>動態尺寸計算</strong>：chartWidth/chartHeight</p>
              <p>• <strong>統一工具函數</strong>：calculateAlignedPosition()</p>
              <p>• <strong>Band Scale 處理</strong>：自動檢測並計算偏移</p>
              <p>• <strong>條形特殊處理</strong>：calculateBarPosition()</p>
              <p>• <strong>一致性參數</strong>：alignment、pointAlignment</p>
              <p>• <strong>動態寬度控制</strong>：barWidthRatio 參數</p>
              <p>• <strong>視覺除錯</strong>：可選擇輔助線顯示</p>
            </div>
          </div>
        </div>
      </div>

      {/* 測試指南 */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <span className="text-blue-500">📋</span>
          測試使用指南
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold mb-2 text-gray-800">基本測試</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>切換不同對齊策略</li>
              <li>觀察所有組件是否一致對齊</li>
              <li>調整條形寬度比例</li>
              <li>驗證對齊不受寬度影響</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-gray-800">響應式測試</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>調整瀏覽器窗口大小</li>
              <li>驗證圖表自動調整尺寸</li>
              <li>確認對齊在不同尺寸下保持</li>
              <li>測試極窄和極寬容器</li>
            </ol>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-gray-800">問題診斷</h4>
            <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
              <li>如發現對齊偏差，檢查 positioning.ts</li>
              <li>確認所有組件使用相同 alignment 值</li>
              <li>檢查 Band Scale 的 padding 設定</li>
              <li>驗證計算邏輯符合預期</li>
            </ol>
          </div>
        </div>
      </div>
    </DemoPageTemplate>
  )
}