import React, { useState, useMemo } from 'react'
import { ChartContainer } from '@/components/ui/ChartContainer'
import { DemoPageTemplate } from '@/components/ui/DemoPageTemplate'
import { ModernControlPanel } from '@/components/ui/ModernControlPanel'
import { EnhancedComboChart, type EnhancedComboData, type ComboChartSeries } from '@/registry/components/composite'

// 簡單的測試數據
const debugData: EnhancedComboData[] = [
  { month: 'Jan', sales: 100, target: 120, growth: 5 },
  { month: 'Feb', sales: 150, target: 140, growth: 10 },
  { month: 'Mar', sales: 120, target: 130, growth: -2 },
  { month: 'Apr', sales: 180, target: 160, growth: 15 },
  { month: 'May', sales: 200, target: 190, growth: 8 }
]

export default function ComboChartDebugDemo() {
  const [showBars, setShowBars] = useState(true)
  const [showLines, setShowLines] = useState(true)
  const [showPoints, setShowPoints] = useState(true)
  const [lineStrokeWidth, setLineStrokeWidth] = useState(3)
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)

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
        barOpacity: 0.8
      })
    }
    
    if (showLines) {
      result.push({
        type: 'line',
        dataKey: 'target',
        name: '目標線',
        yAxis: 'left',
        color: '#ef4444',
        strokeWidth: lineStrokeWidth,
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
        showPoints: showPoints,
        pointRadius: 5,
        curve: 'cardinal'
      })
    }
    
    return result
  }, [showBars, showLines, showPoints, lineStrokeWidth])

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

  const controls = [
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
    },
    {
      type: 'range' as const,
      label: `線條粗細 (${lineStrokeWidth}px)`,
      min: 1,
      max: 10,
      step: 1,
      value: lineStrokeWidth,
      onChange: (value: number) => setLineStrokeWidth(value)
    },
    {
      type: 'checkbox' as const,
      label: '開啟動畫',
      checked: animate,
      onChange: (checked: boolean) => setAnimate(checked)
    },
    {
      type: 'checkbox' as const,
      label: '互動功能',
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
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* 控制面板 */}
        <div className="xl:col-span-1 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
            <span className="text-orange-500">🔧</span>
            除錯控制
          </h3>
          <ModernControlPanel controls={controls} />
          
          {/* 除錯信息 */}
          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-900 mb-2">除錯信息</h4>
            <div className="text-sm text-yellow-800 space-y-1">
              <p>• 系列數量: {series.length}</p>
              <p>• 條形圖: {showBars ? '✓' : '✗'}</p>
              <p>• 線圖: {showLines ? '✓' : '✗'}</p>
              <p>• 數據點: {showPoints ? '✓' : '✗'}</p>
              <p>• 線條粗細: {lineStrokeWidth}px</p>
            </div>
          </div>
        </div>

        {/* 主圖表 */}
        <div className="xl:col-span-3 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <span className="text-blue-500">📊</span>
            Combo Chart 除錯視圖
          </h3>
          <ChartContainer>
            <EnhancedComboChart
              data={debugData}
              series={series}
              xKey="month"
              width={800}
              height={400}
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
              onSeriesClick={(series, dataPoint, event) => {
                console.log('Series clicked:', { series: series.name, dataPoint })
              }}
              onSeriesHover={(series, dataPoint, event) => {
                console.log('Series hovered:', { series: series.name, dataPoint })
              }}
            />
          </ChartContainer>
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