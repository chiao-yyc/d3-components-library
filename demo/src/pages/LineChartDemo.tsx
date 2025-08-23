import { useState } from 'react'
import { LineChart } from '@registry/components/basic/line-chart'

// 生成範例資料
const generateTimeSeriesData = (points: number = 30) => {
  const data = []
  const startDate = new Date('2024-01-01')
  
  for (let i = 0; i < points; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    const value = 100 + Math.sin(i * 0.1) * 20 + Math.random() * 10
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(value * 100) / 100,
      category: i % 3 === 0 ? 'A' : i % 3 === 1 ? 'B' : 'C'
    })
  }
  
  return data
}

const multiSeriesData = [
  { date: '2024-01-01', sales: 120, profit: 30, series: 'Sales' },
  { date: '2024-01-02', sales: 150, profit: 45, series: 'Sales' },
  { date: '2024-01-03', sales: 110, profit: 25, series: 'Sales' },
  { date: '2024-01-04', sales: 180, profit: 60, series: 'Sales' },
  { date: '2024-01-05', sales: 140, profit: 35, series: 'Sales' },
  { date: '2024-01-01', sales: 80, profit: 20, series: 'Marketing' },
  { date: '2024-01-02', sales: 95, profit: 28, series: 'Marketing' },
  { date: '2024-01-03', sales: 75, profit: 15, series: 'Marketing' },
  { date: '2024-01-04', sales: 120, profit: 40, series: 'Marketing' },
  { date: '2024-01-05', sales: 100, profit: 25, series: 'Marketing' },
]

export default function LineChartDemo() {
  const [timeSeriesData] = useState(generateTimeSeriesData())
  const [curve, setCurve] = useState<'linear' | 'monotone' | 'cardinal' | 'basis' | 'step'>('monotone')
  const [showDots, setShowDots] = useState(false)
  const [showArea, setShowArea] = useState(false)
  const [animate, setAnimate] = useState(false)
  const [showGrid, setShowGrid] = useState(false)  // 新增：LineChart 支援網格線顯示
  
  // 新增的交互功能狀態
  const [enableBrushZoom, setEnableBrushZoom] = useState(false)
  const [enableCrosshair, setEnableCrosshair] = useState(false)
  const [enableDropShadow, setEnableDropShadow] = useState(false)
  const [enableGlowEffect, setEnableGlowEffect] = useState(false)
  
  // 交互回調狀態
  const [zoomDomain, setZoomDomain] = useState<[any, any] | null>(null)
  const [crosshairData, setCrosshairData] = useState<any>(null)

  // 交互回調函數
  const handleZoom = (domain: [any, any]) => {
    setZoomDomain(domain)
    console.log('縮放域值:', domain)
  }

  const handleZoomReset = () => {
    setZoomDomain(null)
    console.log('縮放重置')
  }

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LineChart Demo</h1>
        <p className="text-gray-600">展示 LineChart 組件的各種功能和配置選項</p>
      </div>

      {/* 控制面板 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">控制面板</h3>
        
        {/* 基本配置 */}
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-800 mb-3">基本配置</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">曲線類型</label>
              <select 
                value={curve} 
                onChange={(e) => setCurve(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="linear">Linear</option>
                <option value="monotone">Monotone</option>
                <option value="cardinal">Cardinal</option>
                <option value="basis">Basis</option>
                <option value="step">Step</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showDots"
                checked={showDots}
                onChange={(e) => setShowDots(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showDots" className="text-sm font-medium text-gray-700">
                顯示資料點
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showArea"
                checked={showArea}
                onChange={(e) => setShowArea(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showArea" className="text-sm font-medium text-gray-700">
                區域填充
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="animate"
                checked={animate}
                onChange={(e) => setAnimate(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="animate" className="text-sm font-medium text-gray-700">
                動畫效果
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showGrid"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="showGrid" className="text-sm font-medium text-gray-700">
                顯示網格
              </label>
            </div>
          </div>
        </div>

        {/* 交互功能 */}
        <div className="mb-4">
          <h4 className="text-md font-medium text-gray-800 mb-3">交互功能 (新增)</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableBrushZoom"
                checked={enableBrushZoom}
                onChange={(e) => setEnableBrushZoom(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="enableBrushZoom" className="text-sm font-medium text-gray-700">
                筆刷縮放
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableCrosshair"
                checked={enableCrosshair}
                onChange={(e) => setEnableCrosshair(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="enableCrosshair" className="text-sm font-medium text-gray-700">
                十字游標
              </label>
            </div>
            
          </div>
        </div>

        {/* 視覺效果 */}
        <div>
          <h4 className="text-md font-medium text-gray-800 mb-3">視覺效果 (新增)</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableDropShadow"
                checked={enableDropShadow}
                onChange={(e) => setEnableDropShadow(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="enableDropShadow" className="text-sm font-medium text-gray-700">
                陰影效果
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableGlowEffect"
                checked={enableGlowEffect}
                onChange={(e) => setEnableGlowEffect(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="enableGlowEffect" className="text-sm font-medium text-gray-700">
                光暈效果
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* 基本時間序列圖表 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold mb-4">
          基本時間序列圖表 
          {enableBrushZoom && <span className="text-sm text-blue-600 ml-2">(可筆刷縮放)</span>}
          {enableCrosshair && <span className="text-sm text-green-600 ml-2">(十字游標)</span>}
        </h3>
        
        {/* 交互狀態顯示 */}
        {(zoomDomain || crosshairData) && (
          <div className="mb-4 p-3 bg-blue-50 rounded text-sm">
            {zoomDomain && (
              <div className="text-blue-700">
                <strong>縮放範圍:</strong> {
                  zoomDomain[0] instanceof Date 
                    ? zoomDomain[0].toLocaleDateString() 
                    : zoomDomain[0]?.toString()
                } 到 {
                  zoomDomain[1] instanceof Date 
                    ? zoomDomain[1].toLocaleDateString() 
                    : zoomDomain[1]?.toString()
                }
              </div>
            )}
            {crosshairData && (
              <div className="text-green-700">
                <strong>游標數據:</strong> X: {crosshairData.x}, Y: {crosshairData.y}
              </div>
            )}
          </div>
        )}
        
        <LineChart
          data={timeSeriesData}
          xKey="date"
          yKey="value"
          width={800}
          height={400}
          curve={curve}
          showDots={showDots}
          showArea={showArea}
          showGrid={showGrid}
          animate={animate}
          colors={['#3b82f6']}
          onDataClick={(data) => console.log('Clicked:', data)}
          
          // 新增的交互功能 props
          enableBrushZoom={enableBrushZoom}
          onZoom={handleZoom}
          onZoomReset={handleZoomReset}
          enableCrosshair={enableCrosshair}
          enableDropShadow={enableDropShadow}
          enableGlowEffect={enableGlowEffect}
          glowColor="#3b82f6"
        />
      </div>

      {/* 交互功能示範圖表 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-blue-200">
        <h3 className="text-xl font-semibold mb-4 text-blue-800">🎯 交互功能示範圖表</h3>
        <div className="mb-4 p-4 bg-blue-50 rounded-lg text-sm text-blue-700">
          <p className="font-medium mb-2">使用說明:</p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>筆刷縮放:</strong> 啟用後可在圖表上拖拽選取區域進行縮放，雙擊重置</li>
            <li><strong>十字游標:</strong> 啟用後滑鼠移動時顯示最近數據點的詳細信息</li>
            <li><strong>陰影效果:</strong> 為線條添加陰影，增強視覺深度</li>
            <li><strong>光暈效果:</strong> 為線條添加光暈，創造發光效果</li>
          </ul>
        </div>
        
        <LineChart
          data={timeSeriesData.slice(0, 20)}  // 使用較少數據點以便清楚看到效果
          xKey="date"
          yKey="value"
          width={800}
          height={400}
          curve="monotone"
          showDots={true}
          showArea={true}
          areaOpacity={0.1}
          colors={['#3b82f6']}
          strokeWidth={3}
          
          // 全部交互功能開啟
          enableBrushZoom={enableBrushZoom}
          onZoom={(domain) => console.log('示範圖表縮放:', domain)}
          onZoomReset={() => console.log('示範圖表縮放重置')}
          enableCrosshair={enableCrosshair}
          crosshairConfig={{
            showCircle: true,
            showLines: true,
            showText: true,
            formatText: (data) => `日期: ${data.x}\n數值: ${data.y.toFixed(2)}`
          }}
          enableDropShadow={enableDropShadow}
          enableGlowEffect={enableGlowEffect}
          glowColor="#3b82f6"
        />
      </div>

      {/* 多系列圖表 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold mb-4">多系列圖表</h3>
        <LineChart
          data={multiSeriesData}
          xKey="date"
          yKey="sales"
          seriesKey="series"
          width={800}
          height={400}
          curve="monotone"
          showDots={true}
          colors={['#3b82f6', '#ef4444', '#10b981']}
          animate={animate}
        />
      </div>

      {/* 平滑曲線區域圖 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold mb-4">平滑曲線區域圖</h3>
        <LineChart
          data={timeSeriesData}
          xKey="date"
          yKey="value"
          width={800}
          height={400}
          curve="cardinal"
          showArea={true}
          areaOpacity={0.2}
          showDots={false}
          colors={['#10b981']}
          strokeWidth={3}
        />
      </div>

      {/* 階梯圖 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold mb-4">階梯圖</h3>
        <LineChart
          data={timeSeriesData.slice(0, 15)}
          xKey="date"
          yKey="value"
          width={800}
          height={400}
          curve="step"
          showDots={true}
          dotRadius={5}
          colors={['#f59e0b']}
          strokeWidth={2}
        />
      </div>

      {/* 程式碼範例 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">使用範例</h3>
        
        {/* 基本用法 */}
        <div className="mb-6">
          <h4 className="text-lg font-medium mb-2">基本用法</h4>
          <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`import { LineChart } from './components/ui/line-chart'

const data = [
  { date: '2024-01-01', value: 120 },
  { date: '2024-01-02', value: 150 },
  { date: '2024-01-03', value: 110 }
]

<LineChart
  data={data}
  xKey="date"
  yKey="value"
  curve="monotone"
  showDots={true}
  animate={true}
  colors={['#3b82f6']}
/>`}
          </pre>
        </div>

        {/* 交互功能用法 */}
        <div>
          <h4 className="text-lg font-medium mb-2">交互功能用法 (新增)</h4>
          <pre className="bg-gray-800 text-green-400 p-4 rounded text-sm overflow-x-auto">
{`<LineChart
  data={data}
  xKey="date"
  yKey="value"
  
  // 筆刷縮放功能
  enableBrushZoom={true}
  onZoom={(domain) => console.log('縮放域值:', domain)}
  onZoomReset={() => console.log('縮放重置')}
  
  // 十字游標功能
  enableCrosshair={true}
  crosshairConfig={{
    showCircle: true,
    showLines: true,
    showText: true,
    formatText: (data) => \`X: \${data.x}, Y: \${data.y}\`
  }}
  
  // 視覺效果增強
  enableDropShadow={true}
  enableGlowEffect={true}
  glowColor="#3b82f6"
  
  // 數據存取器 (用於十字游標)
  dataAccessor={(d) => d.x}
/>`}
          </pre>
        </div>
      </div>
    </div>
  )
}