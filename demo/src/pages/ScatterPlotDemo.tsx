import { useState } from 'react'
import { ScatterPlot } from '../components/ui/scatter-plot'

// 生成相關性資料
const generateCorrelationData = (points: number = 50, correlation: number = 0.7) => {
  const data = []
  
  for (let i = 0; i < points; i++) {
    const x = Math.random() * 100
    const noise = (Math.random() - 0.5) * 30
    const y = x * correlation + noise + 20
    const size = Math.random() * 50 + 10
    const category = ['A', 'B', 'C'][Math.floor(Math.random() * 3)]
    
    data.push({
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      size: Math.round(size * 100) / 100,
      category,
      label: `Point ${i + 1}`
    })
  }
  
  return data
}

// 泡泡圖資料
const bubbleData = [
  { gdp: 1000, happiness: 7.5, population: 50, country: 'Norway' },
  { gdp: 2000, happiness: 7.8, population: 80, country: 'Denmark' },
  { gdp: 1500, happiness: 7.2, population: 60, country: 'Switzerland' },
  { gdp: 3000, happiness: 6.9, population: 320, country: 'USA' },
  { gdp: 800, happiness: 6.5, population: 45, country: 'South Korea' },
  { gdp: 1200, happiness: 7.0, population: 67, country: 'UK' },
  { gdp: 2500, happiness: 6.8, population: 83, country: 'Germany' },
  { gdp: 1800, happiness: 6.4, population: 127, country: 'Japan' },
  { gdp: 500, happiness: 5.8, population: 1400, country: 'China' },
  { gdp: 400, happiness: 4.2, population: 1380, country: 'India' },
]

export default function ScatterPlotDemo() {
  const [correlationData] = useState(generateCorrelationData())
  const [showTrendline, setShowTrendline] = useState(false)
  const [animate, setAnimate] = useState(false)
  const [opacity, setOpacity] = useState(0.7)

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">ScatterPlot Demo</h1>
        <p className="text-gray-600">展示 ScatterPlot 組件的各種功能和配置選項</p>
      </div>

      {/* 控制面板 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">控制面板</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showTrendline"
              checked={showTrendline}
              onChange={(e) => setShowTrendline(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="showTrendline" className="text-sm font-medium text-gray-700">
              顯示趨勢線
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              透明度: {opacity}
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* 基本散點圖 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold mb-4">基本散點圖</h3>
        <ScatterPlot
          data={correlationData}
          xKey="x"
          yKey="y"
          width={800}
          height={400}
          radius={6}
          opacity={opacity}
          showTrendline={showTrendline}
          animate={animate}
          colors={['#3b82f6']}
          onDataClick={(data) => console.log('Clicked:', data)}
        />
      </div>

      {/* 顏色分類散點圖 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold mb-4">顏色分類散點圖</h3>
        <ScatterPlot
          data={correlationData}
          xKey="x"
          yKey="y"
          colorKey="category"
          width={800}
          height={400}
          radius={7}
          opacity={0.8}
          colors={['#3b82f6', '#ef4444', '#10b981']}
          animate={animate}
        />
      </div>

      {/* 泡泡圖 (大小映射) */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold mb-4">泡泡圖 - GDP vs 幸福指數</h3>
        <p className="text-sm text-gray-600 mb-4">
          泡泡大小代表人口數量，顏色代表不同國家
        </p>
        <ScatterPlot
          data={bubbleData}
          xKey="gdp"
          yKey="happiness"
          sizeKey="population"
          colorKey="country"
          width={800}
          height={500}
          sizeRange={[8, 25]}
          opacity={0.7}
          colors={['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280']}
          showTrendline={true}
          tooltipFormat={(d) => `
            <div>
              <div><strong>${d.originalData.country}</strong></div>
              <div>GDP: $${d.x.toFixed(0)} per capita</div>
              <div>Happiness: ${d.y.toFixed(1)}</div>
              <div>Population: ${d.originalData.population}M</div>
            </div>
          `}
        />
      </div>

      {/* 相關性分析 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-xl font-semibold mb-4">相關性分析（含趨勢線）</h3>
        <ScatterPlot
          data={correlationData}
          xKey="x"
          yKey="y"
          width={800}
          height={400}
          radius={5}
          opacity={0.6}
          showTrendline={true}
          trendlineColor="#ef4444"
          trendlineWidth={3}
          colors={['#6366f1']}
        />
      </div>

      {/* 程式碼範例 */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold mb-4">使用範例</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">基本散點圖</h4>
            <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`<ScatterPlot
  data={data}
  xKey="x"
  yKey="y"
  radius={6}
  opacity={0.7}
  colors={['#3b82f6']}
/>`}
            </pre>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">泡泡圖</h4>
            <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
{`<ScatterPlot
  data={data}
  xKey="gdp"
  yKey="happiness"
  sizeKey="population"
  colorKey="country"
  sizeRange={[8, 25]}
  showTrendline={true}
/>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}