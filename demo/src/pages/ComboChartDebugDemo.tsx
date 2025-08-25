import React, { useState, useMemo } from 'react'
import { DemoPageTemplate } from '@/components/ui/DemoPageTemplate'
import { ModernControlPanel } from '@/components/ui/ModernControlPanel'
import { EnhancedComboChart, type EnhancedComboData, type ComboChartSeries } from '../../../registry/components/composite/enhanced-combo-chart'

// ✅ 確認問題：5筆數據 + 大數值 = 只有點沒有線
// ✅ 解決方案：需要更多數據點才能正確生成線段
const debugData: EnhancedComboData[] = [
  { month: 'Jan', sales: 2800, target: 2400, growth: 8.5 },
  { month: 'Feb', sales: 2200, target: 2100, growth: -2.1 },
  { month: 'Mar', sales: 3200, target: 2800, growth: 12.3 },
  { month: 'Apr', sales: 2900, target: 2600, growth: 6.7 },
  { month: 'May', sales: 2100, target: 2200, growth: -4.2 },
  { month: 'Jun', sales: 3800, target: 3200, growth: 18.5 },
  { month: 'Jul', sales: 3400, target: 2900, growth: 15.2 },
  { month: 'Aug', sales: 2700, target: 2500, growth: 4.8 },
  { month: 'Sep', sales: 3100, target: 2700, growth: 9.8 },
  { month: 'Oct', sales: 2600, target: 2400, growth: 2.5 },
  { month: 'Nov', sales: 3600, target: 3000, growth: 16.7 },
  { month: 'Dec', sales: 4200, target: 3500, growth: 22.1 }
]

export default function ComboChartDebugDemo() {
  const [showBars, setShowBars] = useState(true)
  const [showLines, setShowLines] = useState(true)
  const [showPoints, setShowPoints] = useState(true)
  const [lineStrokeWidth, setLineStrokeWidth] = useState(3)
  const [animate, setAnimate] = useState(false)  // 🔧 暫時關閉動畫，避免 Line 渲染問題
  const [interactive, setInteractive] = useState(true)
  const [forceRerender, setForceRerender] = useState(0)  // 🔄 強制重新渲染的 key

  // 🎛️ 細緻圖層控制狀態
  const [barControls, setBarControls] = useState({
    opacity: 0.8,
    animate: false,
    interactive: true
  })
  
  const [lineControls, setLineControls] = useState({
    opacity: 0.9,
    animate: false,
    interactive: true,
    strokeWidth: 4
  })

  // 構建系列配置
  const series: ComboChartSeries[] = useMemo(() => {
    const result: ComboChartSeries[] = []
    
    if (showBars) {
      result.push({
        type: 'bar',
        dataKey: 'sales',
        name: '銷售額',
        yAxis: 'left',
        color: '#3b82f6',
        barOpacity: barControls.opacity,
        // 個別控制（EnhancedComboChart 尚未支援個別控制，先用全域設定）
      })
    }
    
    if (showLines) {
      result.push({
        type: 'line',
        dataKey: 'target',
        name: '目標',
        yAxis: 'left',
        color: '#06b6d4',
        strokeWidth: lineControls.strokeWidth,
        lineOpacity: lineControls.opacity,
        showPoints: showPoints,
        pointRadius: 4,
        curve: 'monotone'
      })
      
      result.push({
        type: 'line',
        dataKey: 'growth',
        name: '成長率',
        yAxis: 'right',
        color: '#10b981',
        strokeWidth: lineStrokeWidth,
        lineOpacity: 0.9,
        showPoints: showPoints,
        pointRadius: 5,
        curve: 'cardinal'
      })
    }
    
    return result
  }, [showBars, showLines, showPoints, lineStrokeWidth, barControls, lineControls])

  const codeExample = `
// Combo Chart 除錯範例
import { EnhancedComboChart } from '@/registry/components/composite'

const series = [
  {
    type: 'bar',
    dataKey: 'sales',
    name: '銷售額',
    yAxis: 'left',
    color: '#3b82f6'
  },
  {
    type: 'line',
    dataKey: 'target', 
    name: '目標線',
    yAxis: 'left',
    color: '#ef4444',
    strokeWidth: ${lineStrokeWidth},
    showPoints: ${showPoints},
    curve: 'monotone'
  }
]

<EnhancedComboChart
  data={data}
  series={series}
  xKey="month"
  width={800}
  height={400}
  animate={${animate}}
  interactive={${interactive}}
  leftAxis={{ label: "數值" }}
  rightAxis={{ label: "成長率 (%)" }}
/>`

  // 🎛️ 細緻控制面板配置
  const generalControls = [
    {
      type: 'checkbox' as const,
      label: '顯示條形圖',
      checked: showBars,
      onChange: (checked: boolean) => setShowBars(checked)
    },
    {
      type: 'checkbox' as const,
      label: '顯示線圖',
      checked: showLines,
      onChange: (checked: boolean) => setShowLines(checked)
    },
    {
      type: 'checkbox' as const,
      label: '顯示數據點',
      checked: showPoints,
      onChange: (checked: boolean) => setShowPoints(checked)
    }
  ]

  const barSpecificControls = [
    {
      type: 'range' as const,
      label: `條形透明度 (${Math.round(barControls.opacity * 100)}%)`,
      min: 0.1,
      max: 1,
      step: 0.1,
      value: barControls.opacity,
      onChange: (value: number) => setBarControls(prev => ({ ...prev, opacity: value }))
    },
    {
      type: 'checkbox' as const,
      label: '條形動畫 ⚠️',
      checked: barControls.animate,
      onChange: (checked: boolean) => {
        setBarControls(prev => ({ ...prev, animate: checked }))
        setForceRerender(prev => prev + 1)  // 觸發重新渲染
      }
    },
    {
      type: 'checkbox' as const,
      label: '條形互動',
      checked: barControls.interactive,
      onChange: (checked: boolean) => setBarControls(prev => ({ ...prev, interactive: checked }))
    }
  ]

  const lineSpecificControls = [
    {
      type: 'range' as const,
      label: `線條透明度 (${Math.round(lineControls.opacity * 100)}%)`,
      min: 0.1,
      max: 1,
      step: 0.1,
      value: lineControls.opacity,
      onChange: (value: number) => setLineControls(prev => ({ ...prev, opacity: value }))
    },
    {
      type: 'range' as const,
      label: `線條粗細 (${lineControls.strokeWidth}px)`,
      min: 1,
      max: 10,
      step: 1,
      value: lineControls.strokeWidth,
      onChange: (value: number) => setLineControls(prev => ({ ...prev, strokeWidth: value }))
    },
    {
      type: 'checkbox' as const,
      label: '線條動畫 ⚠️',
      checked: lineControls.animate,
      onChange: (checked: boolean) => {
        setLineControls(prev => ({ ...prev, animate: checked }))
        setForceRerender(prev => prev + 1)  // 觸發重新渲染
      }
    },
    {
      type: 'checkbox' as const,
      label: '線條互動',
      checked: lineControls.interactive,
      onChange: (checked: boolean) => setLineControls(prev => ({ ...prev, interactive: checked }))
    }
  ]

  const globalControls = [
    {
      type: 'checkbox' as const,
      label: '全域動畫 ⚠️',
      checked: animate,
      onChange: (checked: boolean) => {
        setAnimate(checked)
        // 強制重新渲染來觸發動畫
        setForceRerender(prev => prev + 1)
      }
    },
    {
      type: 'checkbox' as const,
      label: '全域互動',
      checked: interactive,
      onChange: (checked: boolean) => setInteractive(checked)
    }
  ]

  return (
    <DemoPageTemplate
      title="Combo Chart 除錯工具"
      description="專門用來診斷和調試 combo 圖表中線段不顯示等問題的工具"
      tags={['combo', 'debug', 'line', 'troubleshooting']}
      codeExample={codeExample}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 控制面板 - 使用固定高度和滾動 */}
        <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-sm border max-h-[600px] overflow-y-auto sticky top-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <span className="text-orange-500">🔧</span>
            除錯控制
          </h3>
          
          {/* 一般控制 */}
          <div className="mb-4">
            <h4 className="font-medium mb-2 text-gray-700">一般設定</h4>
            <ModernControlPanel controls={generalControls} />
          </div>

          {/* 全域控制 */}
          <div className="mb-4">
            <h4 className="font-medium mb-2 text-gray-700">全域設定</h4>
            <ModernControlPanel controls={globalControls} />
          </div>

          {/* 🎛️ 進階控制 (摺疊) */}
          <details className="mb-4">
            <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
              🎛️ 進階控制
            </summary>
            <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-100">
              {/* 條形圖控制 */}
              {showBars && (
                <div>
                  <h5 className="font-medium mb-2 text-blue-700 text-sm">📊 條形圖</h5>
                  <ModernControlPanel controls={barSpecificControls} />
                </div>
              )}

              {/* 線圖控制 */}
              {showLines && (
                <div>
                  <h5 className="font-medium mb-2 text-cyan-700 text-sm">📈 線圖</h5>
                  <ModernControlPanel controls={lineSpecificControls} />
                </div>
              )}
            </div>
          </details>
          
          {/* 除錯信息 */}
          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2 text-sm">即時狀態</h4>
            <div className="text-xs text-yellow-800 space-y-1">
              <p>條形圖: {showBars ? '✓' : '✗'} | 線圖: {showLines ? '✓' : '✗'} | 數據點: {showPoints ? '✓' : '✗'}</p>
              <p>動畫: {animate ? '✓' : '✗'} | 重新渲染: {forceRerender} 次</p>
            </div>
          </div>
        </div>

        {/* 主圖表 */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <span className="text-blue-500">📊</span>
            Combo Chart 除錯視圖
          </h3>
          <div className="w-full">
            <EnhancedComboChart
              key={`combo-chart-${forceRerender}`}  // 🔄 強制重新渲染觸發動畫
              data={debugData}
              series={series}
              xKey="month"
              responsive={true}
              margin={{ top: 20, right: 80, bottom: 60, left: 80 }}
              animate={animate}
              interactive={interactive}
              leftAxis={{
                label: "數值",
                gridlines: true
              }}
              rightAxis={{
                label: "成長率 (%)",
                gridlines: false
              }}
              xAxis={{
                label: "月份",
                gridlines: true
              }}
              onSeriesClick={(series, dataPoint, event) => {
                console.log('Series clicked:', { series: series.name, dataPoint })
              }}
              onSeriesHover={(series, dataPoint, event) => {
                console.log('Series hovered:', { series: series.name, dataPoint })
              }}
            />
          </div>
        </div>
      </div>

      {/* 問題診斷指南 */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <span className="text-red-500">🩺</span>
            問題診斷步驟
          </h3>
          <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
            <li><strong>檢查數據</strong>：確認數據格式是否正確</li>
            <li><strong>開啟瀏覽器開發工具</strong>：查看控制台錯誤</li>
            <li><strong>檢查 SVG 元素</strong>：查看 path 元素是否存在</li>
            <li><strong>驗證比例尺</strong>：確認 xScale 和 yScale 正常</li>
            <li><strong>測試單一線圖</strong>：關閉條形圖，只顯示線圖</li>
            <li><strong>調整線條粗細</strong>：嘗試增加線條粗細</li>
            <li><strong>檢查圖層順序</strong>：確認線圖沒被其他元素覆蓋</li>
          </ol>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <span className="text-green-500">💡</span>
            常見問題與解決方案
          </h3>
          <div className="text-sm text-gray-600 space-y-3">
            <div>
              <strong className="text-gray-800">問題：線段不顯示</strong>
              <ul className="ml-4 mt-1 space-y-1 list-disc list-inside">
                <li>檢查 stroke 顏色是否與背景色相同</li>
                <li>確認 stroke-width &gt; 0</li>
                <li>驗證 opacity 設定</li>
              </ul>
            </div>
            <div>
              <strong className="text-gray-800">問題：只顯示點，沒有線</strong>
              <ul className="ml-4 mt-1 space-y-1 list-disc list-inside">
                <li>檢查數據是否已正確排序</li>
                <li>確認 path 的 d 屬性有值</li>
                <li>檢查 curve 函數是否正確</li>
              </ul>
            </div>
            <div>
              <strong className="text-gray-800">問題：線段被覆蓋</strong>
              <ul className="ml-4 mt-1 space-y-1 list-disc list-inside">
                <li>調整圖層 z-index</li>
                <li>檢查條形圖的 opacity 設定</li>
                <li>確認 LayerManager 的順序</li>
              </ul>
            </div>
            <div>
              <strong className="text-gray-800">限制：個別動畫控制</strong>
              <ul className="ml-4 mt-1 space-y-1 list-disc list-inside">
                <li>⚠️ 標記的動畫控制會觸發整個圖表重新渲染</li>
                <li>個別圖表類型的動畫控制尚未實現</li>
                <li>目前使用全域動畫設定</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 技術細節 */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <span className="text-purple-500">🔍</span>
          技術實現細節
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <h4 className="font-semibold mb-2 text-gray-800">Line 組件配置</h4>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
{JSON.stringify(series.filter(s => s.type === 'line'), null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-gray-800">測試數據結構</h4>
            <pre className="text-xs bg-gray-50 p-3 rounded overflow-x-auto">
{JSON.stringify(debugData.slice(0, 2), null, 2)}
            </pre>
          </div>
          <div>
            <h4 className="font-semibold mb-2 text-gray-800">除錯提示</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 打開瀏覽器開發工具</li>
              <li>• 查看 Console 輸出</li>
              <li>• 檢查 SVG 結構</li>
              <li>• 驗證 CSS 樣式</li>
              <li>• 測試不同配置組合</li>
            </ul>
          </div>
        </div>
      </div>
    </DemoPageTemplate>
  )
}