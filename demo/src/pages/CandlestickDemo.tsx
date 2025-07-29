import { useState, useMemo } from 'react'
import { CandlestickChart } from '@registry/components/financial/candlestick-chart'

// 生成模擬股票數據
function generateStockData(days: number = 60, initialPrice: number = 100) {
  const data = []
  let currentPrice = initialPrice
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(startDate.getDate() + i)
    
    // 隨機變動 (-3% 到 +3%)
    const changePercent = (Math.random() - 0.5) * 0.06
    const change = currentPrice * changePercent
    
    // 計算開盤價（前一天收盤價的小幅變動）
    const gapPercent = (Math.random() - 0.5) * 0.02
    const open = currentPrice * (1 + gapPercent)
    
    // 計算收盤價
    const close = open + change
    
    // 計算最高價和最低價
    const volatility = Math.random() * 0.03 + 0.01
    const highExtra = Math.random() * volatility * currentPrice
    const lowExtra = Math.random() * volatility * currentPrice
    
    const high = Math.max(open, close) + highExtra
    const low = Math.min(open, close) - lowExtra
    
    // 生成成交量（1萬到10萬）
    const volume = Math.floor(Math.random() * 90000) + 10000
    
    data.push({
      date: date.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume
    })
    
    currentPrice = close
  }
  
  return data
}

// 台積電模擬數據
const tsmc2024Data = [
  { date: '2024-01-02', open: 593, high: 598, low: 590, close: 596, volume: 15234567 },
  { date: '2024-01-03', open: 596, high: 605, low: 594, close: 602, volume: 18456789 },
  { date: '2024-01-04', open: 602, high: 608, low: 598, close: 599, volume: 16789123 },
  { date: '2024-01-05', open: 599, high: 610, low: 597, close: 607, volume: 20123456 },
  { date: '2024-01-08', open: 607, high: 615, low: 605, close: 612, volume: 22567890 },
  { date: '2024-01-09', open: 612, high: 620, low: 608, close: 618, volume: 19876543 },
  { date: '2024-01-10', open: 618, high: 625, low: 615, close: 622, volume: 21345678 },
  { date: '2024-01-11', open: 622, high: 628, low: 619, close: 624, volume: 17890123 },
  { date: '2024-01-12', open: 624, high: 632, low: 621, close: 629, volume: 23456789 },
  { date: '2024-01-15', open: 629, high: 635, low: 626, close: 631, volume: 20789012 },
  { date: '2024-01-16', open: 631, high: 638, low: 628, close: 635, volume: 24123456 },
  { date: '2024-01-17', open: 635, high: 642, low: 632, close: 639, volume: 22567890 },
  { date: '2024-01-18', open: 639, high: 645, low: 636, close: 641, volume: 21098765 },
  { date: '2024-01-19', open: 641, high: 648, low: 638, close: 644, volume: 25432109 },
  { date: '2024-01-22', open: 644, high: 650, low: 640, close: 647, volume: 23876543 },
  { date: '2024-01-23', open: 647, high: 653, low: 644, close: 649, volume: 22109876 },
  { date: '2024-01-24', open: 649, high: 655, low: 646, close: 651, volume: 26543210 },
  { date: '2024-01-25', open: 651, high: 658, low: 648, close: 654, volume: 24987654 },
  { date: '2024-01-26', open: 654, high: 660, low: 651, close: 657, volume: 23210987 },
  { date: '2024-01-29', open: 657, high: 663, low: 654, close: 659, volume: 27654321 }
]

// 虛擬貨幣數據（較高波動性）
const btcSimData = generateStockData(30, 45000).map(d => ({
  ...d,
  open: Math.round(d.open * 450),
  high: Math.round(d.high * 450),
  low: Math.round(d.low * 450),
  close: Math.round(d.close * 450),
  volume: Math.floor(d.volume / 100)
}))

export default function CandlestickDemo() {
  const [selectedDataset, setSelectedDataset] = useState('tsmc')
  const [colorMode, setColorMode] = useState<'tw' | 'us' | 'custom'>('tw')
  const [showVolume, setShowVolume] = useState(true)
  // 簡化版本暫時移除複雜配置

  // 選擇數據集
  const currentData = useMemo(() => {
    let data
    switch (selectedDataset) {
      case 'tsmc':
        data = tsmc2024Data
        break
      case 'tech':
        data = generateStockData(45, 150)
        break
      case 'crypto':
        data = btcSimData
        break
      default:
        data = tsmc2024Data
    }
    return data
  }, [selectedDataset])

  // 統計數據
  const dataStats = useMemo(() => {
    if (!currentData.length) return null
    
    const prices = currentData.map(d => d.close)
    const volumes = currentData.map(d => d.volume)
    
    return {
      count: currentData.length,
      priceRange: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      },
      totalVolume: volumes.reduce((sum, v) => sum + v, 0),
      avgVolume: volumes.reduce((sum, v) => sum + v, 0) / volumes.length
    }
  }, [currentData])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* 標題 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          K線圖（蠟燭圖）示範
        </h1>
        <p className="text-gray-600">
          專業級股市 K線圖組件，支援 OHLC 數據、成交量顯示和技術分析功能
        </p>
      </div>

      {/* 控制面板 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          圖表配置
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 數據集選擇 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              數據集
            </label>
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tsmc">台積電 (2024年1月)</option>
              <option value="tech">科技股模擬</option>
              <option value="crypto">比特幣模擬</option>
            </select>
          </div>

          {/* 顏色模式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              顏色模式
            </label>
            <select
              value={colorMode}
              onChange={(e) => setColorMode(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="tw">台股模式（紅漲綠跌）</option>
              <option value="us">美股模式（綠漲紅跌）</option>
              <option value="custom">自訂顏色</option>
            </select>
          </div>

          {/* 功能開關 */}
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showVolume}
                onChange={(e) => setShowVolume(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">顯示成交量（開發中）</span>
            </label>
          </div>
        </div>
      </div>

      {/* 主要 K線圖 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedDataset === 'tsmc' ? '台積電股價走勢' : 
           selectedDataset === 'tech' ? '科技股模擬走勢' : 
           '比特幣價格走勢'}
        </h2>
        
        <div className="flex justify-center">
          <CandlestickChart
            data={currentData}
            width={900}
            height={600}
            colorMode={colorMode}
            onCandleClick={(data) => {
              const change = data.close - data.open
              const changePercent = data.open !== 0 ? (change / data.open) * 100 : 0
              alert(`${new Date(data.date).toLocaleDateString()}\n開盤: ${data.open}\n收盤: ${data.close}\n漲跌: ${change.toFixed(2)} (${changePercent.toFixed(2)}%)`)
            }}
          />
        </div>
      </div>

      {/* 統計資訊 */}
      {dataStats && (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            數據統計
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{dataStats.count}</div>
              <div className="text-sm text-gray-600">交易日數</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {dataStats.priceRange.max.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">最高價</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {dataStats.priceRange.min.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">最低價</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(dataStats.avgVolume).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">平均成交量</div>
            </div>
          </div>
        </div>
      )}

      {/* 不同配置展示 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 美股風格 */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-md font-semibold text-gray-900 mb-3">
            美股風格（綠漲紅跌）
          </h3>
          <CandlestickChart
            data={currentData.slice(-15)}
            width={400}
            height={300}
            colorMode="us"
          />
        </div>

        {/* 極簡風格 */}
        <div className="bg-white rounded-lg border p-4">
          <h3 className="text-md font-semibold text-gray-900 mb-3">
            極簡風格（自訂顏色）
          </h3>
          <CandlestickChart
            data={currentData.slice(-15)}
            width={400}
            height={300}
            colorMode="tw"
          />
        </div>
      </div>

      {/* 功能說明 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          K線圖功能特色
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">📊 完整 OHLC 數據</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 開盤價、最高價、最低價、收盤價</li>
              <li>• 自動數據驗證和清理</li>
              <li>• 支援多種日期格式</li>
              <li>• 智能欄位偵測</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">🎨 彈性視覺配置</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 台股/美股顏色模式</li>
              <li>• 可調整蠟燭寬度</li>
              <li>• 成交量圖表整合</li>
              <li>• 格線和軸線設定</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">⚡ 互動功能</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 詳細數據提示框</li>
              <li>• 點擊和懸停事件</li>
              <li>• 平滑動畫效果</li>
              <li>• 響應式設計</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 技術說明 */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          K線圖說明
        </h2>
        
        <div className="prose text-sm text-gray-600">
          <p>
            K線圖（Candlestick Chart），又稱蠟燭圖或陰陽燭，是股票、期貨、外匯等金融市場中最常用的價格走勢圖表。
            每根K線包含四個重要價格：開盤價（Open）、最高價（High）、最低價（Low）、收盤價（Close），簡稱 OHLC。
          </p>
          
          <p className="mt-3">
            <strong>顏色慣例：</strong>
          </p>
          <ul className="mt-1">
            <li><strong>台股模式：</strong>紅色代表上漲，綠色代表下跌</li>
            <li><strong>美股模式：</strong>綠色代表上漲，紅色代表下跌</li>
            <li><strong>十字星：</strong>開盤價與收盤價相近，表示市場猶豫不決</li>
          </ul>
        </div>
      </div>
    </div>
  )
}