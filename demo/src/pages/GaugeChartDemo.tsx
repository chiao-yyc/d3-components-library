import { useState, useMemo } from 'react'
import { GaugeChart } from '@registry/components/basic/gauge-chart/gauge-chart'

// KPI 資料
const kpiData = [
  { metric: 'CPU 使用率', value: 78, unit: '%', min: 0, max: 100 },
  { metric: '記憶體使用率', value: 65, unit: '%', min: 0, max: 100 },
  { metric: '磁碟使用率', value: 42, unit: '%', min: 0, max: 100 },
  { metric: '網路頻寬', value: 156, unit: 'Mbps', min: 0, max: 200 }
]

// 業績資料  
const salesData = [
  { quarter: 'Q1', target: 1000000, actual: 850000, unit: '元' },
  { quarter: 'Q2', target: 1200000, actual: 1180000, unit: '元' },
  { quarter: 'Q3', target: 1100000, actual: 920000, unit: '元' },
  { quarter: 'Q4', target: 1500000, actual: 1320000, unit: '元' }
]

// 溫度資料
const temperatureData = [
  { sensor: '室內溫度', value: 23.5, unit: '°C', min: -10, max: 50 },
  { sensor: '室外溫度', value: 28.2, unit: '°C', min: -10, max: 50 },
  { sensor: 'CPU 溫度', value: 65.8, unit: '°C', min: 0, max: 100 },
  { sensor: '硬碟溫度', value: 42.1, unit: '°C', min: 0, max: 100 }
]

export default function GaugeChartDemo() {
  // 控制選項
  const [selectedDataset, setSelectedDataset] = useState('kpi')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [startAngle, setStartAngle] = useState(-90)
  const [endAngle, setEndAngle] = useState(90)
  const [showValue, setShowValue] = useState(true)
  const [showLabel, setShowLabel] = useState(true)
  const [showTicks, setShowTicks] = useState(true)
  const [showMinMax, setShowMinMax] = useState(true)
  const [tickCount, setTickCount] = useState(5)
  const [animate, setAnimate] = useState(true)
  const [interactive, setInteractive] = useState(true)
  const [needleColor, setNeedleColor] = useState('#374151')
  const [backgroundColor, setBackgroundColor] = useState('#e5e7eb')
  const [foregroundColor, setForegroundColor] = useState('#3b82f6')
  const [useZones, setUseZones] = useState(false)
  const [cornerRadius, setCornerRadius] = useState(0)

  // 當前資料和配置
  const { currentData, config } = useMemo(() => {
    switch (selectedDataset) {
      case 'kpi':
        const kpi = kpiData[selectedIndex]
        return {
          currentData: [kpi],
          config: {
            mapping: { value: 'value', label: 'metric' },
            min: kpi.min,
            max: kpi.max,
            valueFormat: (value: number) => `${value.toFixed(1)}${kpi.unit}`,
            zones: useZones ? [
              { min: kpi.min, max: kpi.max * 0.6, color: '#22c55e', label: '良好' },
              { min: kpi.max * 0.6, max: kpi.max * 0.8, color: '#f59e0b', label: '警告' },
              { min: kpi.max * 0.8, max: kpi.max, color: '#ef4444', label: '危險' }
            ] : undefined
          }
        }
      
      case 'sales':
        const sales = salesData[selectedIndex]
        const percentage = (sales.actual / sales.target) * 100
        return {
          currentData: [{ ...sales, percentage }],
          config: {
            mapping: { value: 'percentage', label: 'quarter' },
            min: 0,
            max: 120,
            valueFormat: (value: number) => `${value.toFixed(1)}%`,
            zones: useZones ? [
              { min: 0, max: 80, color: '#ef4444', label: '未達標' },
              { min: 80, max: 100, color: '#f59e0b', label: '接近目標' },
              { min: 100, max: 120, color: '#22c55e', label: '超標' }
            ] : undefined
          }
        }
      
      case 'temperature':
        const temp = temperatureData[selectedIndex]
        return {
          currentData: [temp],
          config: {
            mapping: { value: 'value', label: 'sensor' },
            min: temp.min,
            max: temp.max,
            valueFormat: (value: number) => `${value.toFixed(1)}${temp.unit}`,
            zones: useZones ? [
              { min: temp.min, max: temp.min + (temp.max - temp.min) * 0.6, color: '#3b82f6', label: '正常' },
              { min: temp.min + (temp.max - temp.min) * 0.6, max: temp.min + (temp.max - temp.min) * 0.8, color: '#f59e0b', label: '偏高' },
              { min: temp.min + (temp.max - temp.min) * 0.8, max: temp.max, color: '#ef4444', label: '過熱' }
            ] : undefined
          }
        }
      
      default:
        return {
          currentData: [],
          config: {}
        }
    }
  }, [selectedDataset, selectedIndex, useZones])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* 標題 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gauge Chart Demo
        </h1>
        <p className="text-gray-600">
          儀表盤組件展示 - 支援多區間、動畫效果和自訂樣式
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
              onChange={(e) => {
                setSelectedDataset(e.target.value)
                setSelectedIndex(0)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="kpi">系統監控 KPI</option>
              <option value="sales">業績達成率</option>
              <option value="temperature">溫度監控</option>
            </select>
          </div>

          {/* 資料項目選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              資料項目
            </label>
            <select
              value={selectedIndex}
              onChange={(e) => setSelectedIndex(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {selectedDataset === 'kpi' && kpiData.map((item, i) => (
                <option key={i} value={i}>{item.metric}</option>
              ))}
              {selectedDataset === 'sales' && salesData.map((item, i) => (
                <option key={i} value={i}>{item.quarter}</option>
              ))}
              {selectedDataset === 'temperature' && temperatureData.map((item, i) => (
                <option key={i} value={i}>{item.sensor}</option>
              ))}
            </select>
          </div>

          {/* 起始角度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              起始角度 ({startAngle}°)
            </label>
            <input
              type="range"
              min="-180"
              max="180"
              step="15"
              value={startAngle}
              onChange={(e) => setStartAngle(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 結束角度 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              結束角度 ({endAngle}°)
            </label>
            <input
              type="range"
              min="-180"
              max="180"
              step="15"
              value={endAngle}
              onChange={(e) => setEndAngle(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 刻度數量 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              刻度數量 ({tickCount})
            </label>
            <input
              type="range"
              min="3"
              max="10"
              value={tickCount}
              onChange={(e) => setTickCount(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 圓角半徑 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              圓角半徑 ({cornerRadius})
            </label>
            <input
              type="range"
              min="0"
              max="10"
              value={cornerRadius}
              onChange={(e) => setCornerRadius(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* 指針顏色 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              指針顏色
            </label>
            <div className="flex space-x-2">
              {['#374151', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6'].map(color => (
                <button
                  key={color}
                  onClick={() => setNeedleColor(color)}
                  className={`w-8 h-8 rounded border-2 ${needleColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* 背景顏色 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              背景顏色
            </label>
            <div className="flex space-x-2">
              {['#e5e7eb', '#f3f4f6', '#d1d5db', '#9ca3af'].map(color => (
                <button
                  key={color}
                  onClick={() => setBackgroundColor(color)}
                  className={`w-8 h-8 rounded border-2 ${backgroundColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* 前景顏色 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              前景顏色
            </label>
            <div className="flex space-x-2">
              {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => (
                <button
                  key={color}
                  onClick={() => setForegroundColor(color)}
                  className={`w-8 h-8 rounded border-2 ${foregroundColor === color ? 'border-gray-800' : 'border-gray-300'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* 切換選項 */}
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="useZones"
                checked={useZones}
                onChange={(e) => setUseZones(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="useZones" className="text-sm text-gray-700">
                使用多區間
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showValue"
                checked={showValue}
                onChange={(e) => setShowValue(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showValue" className="text-sm text-gray-700">
                顯示數值
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showLabel"
                checked={showLabel}
                onChange={(e) => setShowLabel(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showLabel" className="text-sm text-gray-700">
                顯示標籤
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showTicks"
                checked={showTicks}
                onChange={(e) => setShowTicks(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showTicks" className="text-sm text-gray-700">
                顯示刻度
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showMinMax"
                checked={showMinMax}
                onChange={(e) => setShowMinMax(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="showMinMax" className="text-sm text-gray-700">
                顯示最值
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
          圖表預覽
        </h2>
        
        <div className="flex justify-center">
          <GaugeChart
            data={currentData}
            mapping={config.mapping}
            min={config.min}
            max={config.max}
            width={400}
            height={350}
            startAngle={startAngle}
            endAngle={endAngle}
            zones={config.zones}
            cornerRadius={cornerRadius}
            needleColor={needleColor}
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            showValue={showValue}
            showLabel={showLabel}
            showTicks={showTicks}
            showMinMax={showMinMax}
            tickCount={tickCount}
            animate={animate}
            interactive={interactive}
            valueFormat={config.valueFormat}
            onValueChange={(value) => {
              console.log('Value changed:', value)
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
                {Object.keys(currentData[0] || {}).map(key => (
                  <th key={key} className="px-4 py-2 text-left font-medium text-gray-700">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentData.map((row, index) => (
                <tr key={index} className="border-t border-gray-200">
                  {Object.values(row).map((value, i) => (
                    <td key={i} className="px-4 py-2 text-gray-900">
                      {typeof value === 'number' ? value.toLocaleString() : String(value)}
                    </td>
                  ))}
                </tr>
              ))}
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
          <code>{`import { GaugeChart } from '@registry/components/basic/gauge-chart'

const data = [{
  metric: 'CPU 使用率',
  value: 78,
  unit: '%'
}]

<GaugeChart
  data={data}
  mapping={{ value: 'value', label: 'metric' }}
  min={0}
  max={100}
  width={400}
  height={300}
  startAngle={${startAngle}}
  endAngle={${endAngle}}
  zones={${useZones ? '[{min:0,max:60,color:"green"},{min:60,max:80,color:"yellow"},{min:80,max:100,color:"red"}]' : 'undefined'}}
  needleColor="${needleColor}"
  backgroundColor="${backgroundColor}"
  foregroundColor="${foregroundColor}"
  showValue={${showValue}}
  showTicks={${showTicks}}
  animate={${animate}}
  interactive={${interactive}}
  valueFormat={(value) => \`\${value.toFixed(1)}%\`}
/>`}</code>
        </pre>
      </div>
    </div>
  )
}