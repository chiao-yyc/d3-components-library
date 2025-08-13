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

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">LineChart Demo</h1>
        <p className="text-gray-600">展示 LineChart 組件的各種功能和配置選項</p>
      </div>

      {/* 控制面板 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">控制面板</h3>
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
        </div>
      </div>

      {/* 基本時間序列圖表 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold mb-4">基本時間序列圖表</h3>
        <LineChart
          data={timeSeriesData}
          xKey="date"
          yKey="value"
          width={800}
          height={400}
          curve={curve}
          showDots={showDots}
          showArea={showArea}
          animate={animate}
          colors={['#3b82f6']}
          onDataClick={(data) => console.log('Clicked:', data)}
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
    </div>
  )
}