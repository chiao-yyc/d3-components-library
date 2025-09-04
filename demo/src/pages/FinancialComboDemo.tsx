import React, { useState, useMemo } from 'react'
import { MultiSeriesComboChartV2 } from '../../../registry/components/composite/multi-series-combo-chart-v2'
import { ModernControlPanel } from '../components/ui/ModernControlPanel'
import { DemoPageTemplate } from '../components/ui/DemoPageTemplate'
import { CodeExample } from '../components/ui/CodeExample'

const generateCandlestickData = () => {
  const dates = ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05', '2024-06', 
                 '2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12']
  
  let basePrice = 100
  return dates.map((date, i) => {
    const open = basePrice + (Math.random() - 0.5) * 5
    const close = open + (Math.random() - 0.5) * 8
    const high = Math.max(open, close) + Math.random() * 3
    const low = Math.min(open, close) - Math.random() * 3
    const volume = Math.floor(Math.random() * 50000) + 10000
    const ma20 = basePrice + Math.sin(i * 0.3) * 10
    const ma50 = basePrice + Math.sin(i * 0.15) * 8
    
    basePrice = close // 為下一根K棒設定基準價
    
    return {
      date,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
      ma20: Math.round(ma20 * 100) / 100,
      ma50: Math.round(ma50 * 100) / 100,
      rsi: Math.floor(Math.random() * 40) + 30, // RSI 30-70
      macd: (Math.random() - 0.5) * 2 // MACD -1 to 1
    }
  })
}

const generateCryptoData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`)
  
  let basePrice = 50000 // BTC價格基準
  return hours.map((hour, i) => {
    const price = basePrice + Math.sin(i * 0.2) * 2000 + (Math.random() - 0.5) * 1000
    const volume = Math.floor(Math.random() * 100) + 50
    const dominance = 40 + Math.sin(i * 0.1) * 5 // BTC市場主導率
    
    return {
      hour,
      price: Math.round(price),
      volume,
      dominance: Math.round(dominance * 10) / 10,
      fear: Math.floor(Math.random() * 40) + 30 // 恐懼貪婪指數
    }
  })
}

type FinancialScenario = 'stock' | 'crypto' | 'forex'

export const FinancialComboDemo: React.FC = () => {
  const [scenario, setScenario] = useState<FinancialScenario>('stock')
  const [showTechnicalIndicators, setShowTechnicalIndicators] = useState(true)
  const [showVolume, setShowVolume] = useState(true)
  const [animate, setAnimate] = useState(true)

  const candlestickData = useMemo(() => generateCandlestickData(), [])
  const cryptoData = useMemo(() => generateCryptoData(), [])
  
  const scenarioConfig = useMemo(() => {
    const configs = {
      stock: {
        title: '股票技術分析圖表',
        description: '結合K線圖、成交量、移動平均線和技術指標的完整股票分析',
        data: candlestickData,
        xKey: 'date',
        series: [
          // 主價格系列 - 使用收盤價代替Candlestick (因為primitives系統暫不支援K線)
          {
            type: 'area' as const,
            yKey: 'close',
            name: '股價',
            yAxis: 'left' as const,
            color: '#3b82f6',
            opacity: 0.3
          },
          {
            type: 'line' as const,
            yKey: 'ma20',
            name: 'MA20',
            yAxis: 'left' as const,
            color: '#f59e0b',
            strokeWidth: 2
          },
          {
            type: 'line' as const,
            yKey: 'ma50',
            name: 'MA50',
            yAxis: 'left' as const,
            color: '#10b981',
            strokeWidth: 2
          },
          ...(showVolume ? [{
            type: 'bar' as const,
            yKey: 'volume',
            name: '成交量',
            yAxis: 'right' as const,
            color: '#8b5cf6',
            opacity: 0.6
          }] : []),
          ...(showTechnicalIndicators ? [{
            type: 'line' as const,
            yKey: 'rsi',
            name: 'RSI',
            yAxis: 'right' as const,
            color: '#ef4444',
            strokeWidth: 1,
            strokeDasharray: '3,3'
          }] : [])
        ]
      },
      crypto: {
        title: '加密貨幣市場分析',
        description: '24小時加密貨幣價格走勢與市場指標組合分析',
        data: cryptoData,
        xKey: 'hour',
        series: [
          {
            type: 'line' as const,
            yKey: 'price',
            name: 'BTC價格',
            yAxis: 'left' as const,
            color: '#f59e0b',
            strokeWidth: 3
          },
          {
            type: 'area' as const,
            yKey: 'dominance',
            name: 'BTC主導率',
            yAxis: 'right' as const,
            color: '#3b82f6',
            opacity: 0.2
          },
          ...(showVolume ? [{
            type: 'bar' as const,
            yKey: 'volume',
            name: '交易量',
            yAxis: 'right' as const,
            color: '#10b981',
            opacity: 0.7
          }] : []),
          ...(showTechnicalIndicators ? [{
            type: 'scatter' as const,
            yKey: 'fear',
            name: '恐懼貪婪指數',
            yAxis: 'right' as const,
            color: '#ef4444',
            size: 4
          }] : [])
        ]
      },
      forex: {
        title: '外匯市場分析',
        description: '匯率走勢與經濟指標的關聯性分析',
        data: candlestickData.map((d, i) => ({
          ...d,
          rate: 1.2 + Math.sin(i * 0.2) * 0.1, // EUR/USD匯率
          spread: Math.random() * 0.002 + 0.001, // 點差
          cot: Math.random() * 100 // COT持倉數據
        })),
        xKey: 'date',
        series: [
          {
            type: 'line' as const,
            yKey: 'rate',
            name: 'EUR/USD匯率',
            yAxis: 'left' as const,
            color: '#3b82f6',
            strokeWidth: 3
          },
          {
            type: 'area' as const,
            yKey: 'spread',
            name: '點差',
            yAxis: 'right' as const,
            color: '#f59e0b',
            opacity: 0.4
          },
          ...(showTechnicalIndicators ? [{
            type: 'bar' as const,
            yKey: 'cot',
            name: 'COT持倉',
            yAxis: 'right' as const,
            color: '#10b981',
            opacity: 0.6
          }] : [])
        ]
      }
    }
    return configs[scenario]
  }, [scenario, showTechnicalIndicators, showVolume, candlestickData, cryptoData])

  const codeExample = `
// ${scenarioConfig.title}
<MultiSeriesComboChartV2
  data={${scenario}Data}
  series={[
${scenarioConfig.series.map(s => 
  `    { type: '${s.type}', yKey: '${s.yKey}', name: '${s.name}', color: '${s.color}', yAxis: '${s.yAxis}' }`
).join(',\\n')}
  ]}
  xAccessor="${scenarioConfig.xKey}"
  animate={${animate}}
  interactive={true}
  leftAxis={{ label: '價格', gridlines: true }}
  rightAxis={{ label: '指標', gridlines: false }}
  xAxis={{ label: '時間', gridlines: true }}
/>
`

  return (
    <DemoPageTemplate
      title="金融圖表組合"
      description="專業金融市場分析圖表，整合價格走勢、技術指標和市場數據"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          {/* 圖表展示 */}
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-semibold">{scenarioConfig.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{scenarioConfig.description}</p>
              </div>
              <div className="text-sm text-gray-500">
                {scenarioConfig.series.length} 個系列
              </div>
            </div>
            <div className="w-full">
              <MultiSeriesComboChartV2
                data={scenarioConfig.data}
                series={scenarioConfig.series}
                xAccessor={scenarioConfig.xKey}
                responsive={true}
                animate={animate}
                interactive={true}
                leftAxis={{
                  label: scenario === 'crypto' ? 'BTC價格 (USD)' : scenario === 'forex' ? '匯率' : '股價 (元)',
                  gridlines: true
                }}
                rightAxis={{
                  label: '技術指標 / 成交量',
                  gridlines: false
                }}
                xAxis={{
                  label: scenario === 'crypto' ? '小時' : '時間',
                  gridlines: true
                }}
              />
            </div>
          </div>

          {/* 市場摘要 */}
          {scenario === 'stock' && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">技術分析摘要</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">當前價格:</span>
                  <span className="ml-2 font-medium">{candlestickData[candlestickData.length - 1]?.close}</span>
                </div>
                <div>
                  <span className="text-gray-600">MA20:</span>
                  <span className="ml-2 font-medium">{candlestickData[candlestickData.length - 1]?.ma20}</span>
                </div>
                <div>
                  <span className="text-gray-600">RSI:</span>
                  <span className="ml-2 font-medium">{candlestickData[candlestickData.length - 1]?.rsi}</span>
                </div>
                <div>
                  <span className="text-gray-600">成交量:</span>
                  <span className="ml-2 font-medium">{candlestickData[candlestickData.length - 1]?.volume?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
          
          <CodeExample code={codeExample} />
        </div>

        {/* 控制面板 */}
        <div className="space-y-6">
          <ModernControlPanel>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-3">市場類型</h4>
                <div className="space-y-2">
                  {[
                    { value: 'stock', label: '股票市場' },
                    { value: 'crypto', label: '加密貨幣' },
                    { value: 'forex', label: '外匯市場' }
                  ].map(option => (
                    <label key={option.value} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="scenario"
                        value={option.value}
                        checked={scenario === option.value}
                        onChange={(e) => setScenario(e.target.value as FinancialScenario)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">指標選項</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={showTechnicalIndicators}
                      onChange={(e) => setShowTechnicalIndicators(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>技術指標</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={showVolume}
                      onChange={(e) => setShowVolume(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>成交量</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={animate}
                      onChange={(e) => setAnimate(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>動畫效果</span>
                  </label>
                </div>
              </div>
            </div>
          </ModernControlPanel>

          {/* 金融指標說明 */}
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium mb-3">金融指標說明</h4>
            <div className="space-y-2 text-sm text-gray-600">
              {scenario === 'stock' && (
                <>
                  <p>• <strong>MA20/50:</strong> 20日/50日移動平均線</p>
                  <p>• <strong>RSI:</strong> 相對強弱指標 (0-100)</p>
                  <p>• <strong>成交量:</strong> 交易活躍度指標</p>
                </>
              )}
              {scenario === 'crypto' && (
                <>
                  <p>• <strong>BTC主導率:</strong> 比特幣市值占比</p>
                  <p>• <strong>恐懼貪婪指數:</strong> 市場情緒指標</p>
                  <p>• <strong>24H交易量:</strong> 市場活躍度</p>
                </>
              )}
              {scenario === 'forex' && (
                <>
                  <p>• <strong>點差:</strong> 買賣價格差</p>
                  <p>• <strong>COT:</strong> 持倉報告數據</p>
                  <p>• <strong>匯率走勢:</strong> 貨幣對價格變化</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </DemoPageTemplate>
  )
}

export default FinancialComboDemo