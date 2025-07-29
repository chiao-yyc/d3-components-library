import { useState, useMemo } from 'react'
import { FunnelChart } from '@registry/components/basic/funnel-chart/funnel-chart'

// 銷售漏斗資料
const salesFunnelData = [
  { stage: '潛在客戶', count: 10000, description: '初次接觸的潛在客戶' },
  { stage: '意向客戶', count: 5000, description: '表達購買意向的客戶' },
  { stage: '試用客戶', count: 2500, description: '開始試用產品的客戶' },
  { stage: '付費客戶', count: 1000, description: '完成付費的客戶' },
  { stage: '忠實客戶', count: 600, description: '長期使用的忠實客戶' }
]

// 網站轉換漏斗資料
const webFunnelData = [
  { stage: '訪問首頁', count: 50000, description: '網站首頁訪問量' },
  { stage: '瀏覽產品', count: 25000, description: '產品頁面瀏覽量' },
  { stage: '加入購物車', count: 8000, description: '加入購物車的用戶' },
  { stage: '開始結帳', count: 4000, description: '進入結帳流程的用戶' },
  { stage: '完成付款', count: 2800, description: '成功完成付款的用戶' }
]

// 招聘漏斗資料
const recruitmentFunnelData = [
  { stage: '履歷投遞', count: 1200, description: '收到的履歷數量' },
  { stage: '初步篩選', count: 600, description: '通過初步篩選的候選人' },
  { stage: '電話面試', count: 300, description: '電話面試的候選人' },
  { stage: '現場面試', count: 120, description: '現場面試的候選人' },
  { stage: '最終錄取', count: 50, description: '最終錄取的候選人' }
]

// 行銷活動漏斗資料
const marketingFunnelData = [
  { stage: '廣告曝光', count: 100000, description: '廣告總曝光次數' },
  { stage: '點擊廣告', count: 5000, description: '點擊廣告的用戶' },
  { stage: '註冊會員', count: 1500, description: '註冊成為會員的用戶' },
  { stage: '首次購買', count: 450, description: '完成首次購買的用戶' },
  { stage: '重複購買', count: 180, description: '有重複購買行為的用戶' }
]

export default function FunnelChartDemo() {
  // 控制選項
  const [selectedDataset, setSelectedDataset] = useState('sales')
  const [shape, setShape] = useState<'trapezoid' | 'rectangle' | 'curved'>('trapezoid')
  const [direction, setDirection] = useState<'top' | 'bottom' | 'left' | 'right'>('top')
  const [proportionalMode, setProportionalMode] = useState<'traditional' | 'height' | 'area' | 'consistent'>('traditional')
  const [shrinkageType, setShrinkageType] = useState<'fixed' | 'percentage' | 'data-driven'>('percentage')
  const [shrinkageAmount, setShrinkageAmount] = useState(0.1)
  const [minWidth, setMinWidth] = useState(50)
  const [gap, setGap] = useState(4)
  const [cornerRadius, setCornerRadius] = useState(0)
  const [showLabels, setShowLabels] = useState(true)
  const [showValues, setShowValues] = useState(true)
  const [showPercentages, setShowPercentages] = useState(true)
  const [showConversionRates, setShowConversionRates] = useState(true)
  const [labelPosition, setLabelPosition] = useState<'inside' | 'outside' | 'side'>('side')
  const [colorScheme, setColorScheme] = useState<'custom' | 'blues' | 'greens' | 'oranges' | 'reds' | 'purples'>('custom')
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)

  // 當前資料和配置
  const { currentData, config } = useMemo(() => {
    switch (selectedDataset) {
      case 'sales':
        return {
          currentData: salesFunnelData,
          config: {
            title: '銷售漏斗分析',
            description: '從潛在客戶到忠實客戶的轉換流程',
            colors: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554']
          }
        }
      
      case 'web':
        return {
          currentData: webFunnelData,
          config: {
            title: '網站轉換漏斗',
            description: '網站訪問到完成購買的轉換流程',
            colors: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b']
          }
        }
      
      case 'recruitment':
        return {
          currentData: recruitmentFunnelData,
          config: {
            title: '招聘漏斗分析',
            description: '從履歷投遞到最終錄取的篩選流程',
            colors: ['#f59e0b', '#d97706', '#b45309', '#92400e', '#78350f']
          }
        }
      
      case 'marketing':
        return {
          currentData: marketingFunnelData,
          config: {
            title: '行銷活動漏斗',
            description: '從廣告曝光到重複購買的轉換流程',
            colors: ['#8b5cf6', '#7c3aed', '#6d28d9', '#5b21b6', '#4c1d95']
          }
        }
      
      default:
        return {
          currentData: salesFunnelData,
          config: {
            title: '漏斗圖',
            description: '',
            colors: []
          }
        }
    }
  }, [selectedDataset])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 標題 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Funnel Chart Demo
        </h1>
        <p className="text-gray-600">
          漏斗圖組件展示 - 適用於轉換率分析和流程追蹤
        </p>
      </div>

      {/* 控制面板 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          圖表設定
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 資料集選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              資料集
            </label>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="sales">銷售漏斗</option>
              <option value="web">網站轉換</option>
              <option value="recruitment">招聘流程</option>
              <option value="marketing">行銷活動</option>
            </select>
          </div>

          {/* 形狀類型 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              形狀類型
            </label>
            <select
              value={shape}
              onChange={(e) => setShape(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="trapezoid">梯形</option>
              <option value="rectangle">矩形</option>
              <option value="curved">曲線</option>
            </select>
          </div>

          {/* 方向 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              漏斗方向
            </label>
            <select
              value={direction}
              onChange={(e) => setDirection(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="top">向下收縮（傳統漏斗）</option>
              <option value="bottom">向上收縮（倒置漏斗）</option>
              <option value="left">向右收縮（橫向）</option>
              <option value="right">向左收縮（橫向）</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {direction === 'top' && '適用於銷售漏斗、用戶流失分析'}
              {direction === 'bottom' && '適用於用戶增長、收入提升過程'}
              {direction === 'left' && '適用於時間線流程、從左到右的工作流'}
              {direction === 'right' && '適用於從右到左的流程圖'}
            </p>
          </div>

          {/* 比例模式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              比例模式
            </label>
            <select
              value={proportionalMode}
              onChange={(e) => setProportionalMode(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="traditional">傳統模式</option>
              <option value="height">高度比例</option>
              <option value="area">面積比例</option>
              <option value="consistent">一致收縮（推薦）</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {proportionalMode === 'traditional' && '寬度按資料比例，高度相等（經典漏斗圖）'}
              {proportionalMode === 'height' && '高度按資料比例，寬度自然遞減（保持漏斗形狀）'}
              {proportionalMode === 'area' && '真正的面積比例，精確反映資料關係'}
              {proportionalMode === 'consistent' && '一致的收縮比例和斜邊角度，視覺效果最佳'}
            </p>
          </div>

          {/* 收縮類型（僅在一致收縮模式下顯示）*/}
          {proportionalMode === 'consistent' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                收縮類型
              </label>
              <select
                value={shrinkageType}
                onChange={(e) => setShrinkageType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="percentage">比例收縮</option>
                <option value="fixed">固定收縮</option>
                <option value="data-driven">數據驅動</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {shrinkageType === 'percentage' && '每層按百分比收縮'}
                {shrinkageType === 'fixed' && '每層固定像素收縮'}
                {shrinkageType === 'data-driven' && '根據資料比例自動計算收縮率'}
              </p>
            </div>
          )}

          {/* 收縮量（僅在一致收縮模式下顯示）*/}
          {proportionalMode === 'consistent' && shrinkageType !== 'data-driven' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                收縮量 ({shrinkageType === 'percentage' ? `${(shrinkageAmount * 100).toFixed(0)}%` : `${shrinkageAmount}px`})
              </label>
              <input
                type="range"
                min={shrinkageType === 'percentage' ? "0.05" : "10"}
                max={shrinkageType === 'percentage' ? "0.3" : "50"}
                step={shrinkageType === 'percentage' ? "0.01" : "1"}
                value={shrinkageAmount}
                onChange={(e) => setShrinkageAmount(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* 最小寬度（僅在一致收縮模式下顯示）*/}
          {proportionalMode === 'consistent' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                最小寬度 ({minWidth}px)
              </label>
              <input
                type="range"
                min="20"
                max="150"
                value={minWidth}
                onChange={(e) => setMinWidth(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}

          {/* 段落間隙 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              段落間隙 ({gap}px)
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={gap}
              onChange={(e) => setGap(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 圓角半徑 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              圓角半徑 ({cornerRadius}px)
            </label>
            <input
              type="range"
              min="0"
              max="20"
              value={cornerRadius}
              onChange={(e) => setCornerRadius(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 標籤位置 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              標籤位置
            </label>
            <select
              value={labelPosition}
              onChange={(e) => setLabelPosition(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="side">側邊</option>
              <option value="inside">內部</option>
              <option value="outside">外部</option>
            </select>
          </div>

          {/* 顏色主題 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              顏色主題
            </label>
            <select
              value={colorScheme}
              onChange={(e) => setColorScheme(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="custom">自訂</option>
              <option value="blues">藍色系</option>
              <option value="greens">綠色系</option>
              <option value="oranges">橙色系</option>
              <option value="reds">紅色系</option>
              <option value="purples">紫色系</option>
            </select>
          </div>

          {/* 切換選項 */}
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showLabels"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showLabels" className="text-sm text-gray-700">
                顯示標籤
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showValues"
                checked={showValues}
                onChange={(e) => setShowValues(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showValues" className="text-sm text-gray-700">
                顯示數值
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showPercentages"
                checked={showPercentages}
                onChange={(e) => setShowPercentages(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showPercentages" className="text-sm text-gray-700">
                顯示百分比
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showConversionRates"
                checked={showConversionRates}
                onChange={(e) => setShowConversionRates(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showConversionRates" className="text-sm text-gray-700">
                顯示轉換率
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="animate"
                checked={animate}
                onChange={(e) => setAnimate(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="animate" className="text-sm text-gray-700">
                動畫效果
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="interactive"
                checked={interactive}
                onChange={(e) => setInteractive(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="interactive" className="text-sm text-gray-700">
                互動功能
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 圖表展示 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {config.title}
        </h2>
        <p className="text-gray-600 mb-6">{config.description}</p>
        
        <div className="flex justify-center">
          <FunnelChart
            data={currentData}
            labelKey="stage"
            valueKey="count"
            width={500}
            height={600}
            shape={shape}
            direction={direction}
            proportionalMode={proportionalMode}
            shrinkageType={shrinkageType}
            shrinkageAmount={shrinkageAmount}
            minWidth={minWidth}
            gap={gap}
            cornerRadius={cornerRadius}
            colors={colorScheme === 'custom' ? config.colors : undefined}
            colorScheme={colorScheme}
            showLabels={showLabels}
            showValues={showValues}
            showPercentages={showPercentages}
            showConversionRates={showConversionRates}
            labelPosition={labelPosition}
            animate={animate}
            interactive={interactive}
            onSegmentClick={(data) => {
              console.log('Segment clicked:', data)
              alert(`點擊了: ${data.label} (${data.value.toLocaleString()})`)
            }}
            onSegmentHover={(data) => {
              console.log('Segment hovered:', data)
            }}
          />
        </div>
      </div>

      {/* 資料表格 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          當前資料
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-2 text-left font-medium text-gray-700">階段</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">數量</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">佔比</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">轉換率</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">描述</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, index) => {
                const maxValue = Math.max(...currentData.map(d => d.count))
                const percentage = (row.count / maxValue) * 100
                const conversionRate = index === 0 ? 100 : (row.count / currentData[index - 1].count) * 100
                
                return (
                  <tr key={index} className="border-t border-gray-200">
                    <td className="px-4 py-2 text-gray-900 font-medium">{row.stage}</td>
                    <td className="px-4 py-2 text-gray-900">{row.count.toLocaleString()}</td>
                    <td className="px-4 py-2 text-gray-900">{percentage.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-gray-900">{conversionRate.toFixed(1)}%</td>
                    <td className="px-4 py-2 text-gray-600">{row.description}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 使用範例 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          程式碼範例
        </h2>
        
        <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm">
          <code>{`import { FunnelChart } from '@registry/components/basic/funnel-chart'

const data = [
  { stage: '潛在客戶', count: 10000 },
  { stage: '意向客戶', count: 5000 },
  { stage: '試用客戶', count: 2500 },
  { stage: '付費客戶', count: 1000 },
  { stage: '忠實客戶', count: 600 }
]

<FunnelChart
  data={data}
  labelKey="stage"
  valueKey="count"
  width={500}
  height={600}
  shape="${shape}"
  direction="${direction}"
  proportionalMode="${proportionalMode}"${proportionalMode === 'consistent' ? `
  shrinkageType="${shrinkageType}"
  shrinkageAmount={${shrinkageAmount}}
  minWidth={${minWidth}}` : ''}
  gap={${gap}}
  cornerRadius={${cornerRadius}}
  colorScheme="${colorScheme}"
  showLabels={${showLabels}}
  showValues={${showValues}}
  showPercentages={${showPercentages}}
  showConversionRates={${showConversionRates}}
  labelPosition="${labelPosition}"
  animate={${animate}}
  interactive={${interactive}}
  onSegmentClick={(data) => console.log('Clicked:', data)}
/>`}</code>
        </pre>
      </div>
    </div>
  )
}