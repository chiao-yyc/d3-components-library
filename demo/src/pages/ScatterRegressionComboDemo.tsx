import React, { useState } from 'react'
import { EnhancedComboChart } from '../../../registry/components/composite/enhanced-combo-chart'
import type { ComboChartSeries } from '../../../registry/components/composite/types'

const ScatterRegressionComboDemo: React.FC = () => {
  // 場景 1: 銷售業績分析 - 廣告投入 vs 銷售額，氣泡大小代表客戶數量
  const salesData = [
    { month: 'Jan', adSpend: 5000, revenue: 45000, customerCount: 120, satisfaction: 4.2, competitorPrice: 520 },
    { month: 'Feb', adSpend: 7200, revenue: 62000, customerCount: 145, satisfaction: 4.3, competitorPrice: 515 },
    { month: 'Mar', adSpend: 6800, revenue: 58000, customerCount: 138, satisfaction: 4.1, competitorPrice: 525 },
    { month: 'Apr', adSpend: 9500, revenue: 78000, customerCount: 172, satisfaction: 4.4, competitorPrice: 510 },
    { month: 'May', adSpend: 8900, revenue: 74000, customerCount: 165, satisfaction: 4.5, competitorPrice: 505 },
    { month: 'Jun', adSpend: 11200, revenue: 89000, customerCount: 195, satisfaction: 4.6, competitorPrice: 500 },
    { month: 'Jul', adSpend: 10800, revenue: 85000, customerCount: 188, satisfaction: 4.4, competitorPrice: 508 },
    { month: 'Aug', adSpend: 12500, revenue: 96000, customerCount: 210, satisfaction: 4.7, competitorPrice: 495 },
    { month: 'Sep', adSpend: 13200, revenue: 102000, customerCount: 225, satisfaction: 4.6, competitorPrice: 498 },
    { month: 'Oct', adSpend: 15000, revenue: 115000, customerCount: 248, satisfaction: 4.8, competitorPrice: 490 },
    { month: 'Nov', adSpend: 14500, revenue: 110000, customerCount: 242, satisfaction: 4.7, competitorPrice: 492 },
    { month: 'Dec', adSpend: 16800, revenue: 125000, customerCount: 265, satisfaction: 4.9, competitorPrice: 485 },
  ]

  // 場景 2: 產品性能分析 - 價格 vs 性能分數，不同產品類別分組
  const productData = [
    { product: 'A1', price: 299, performance: 78, category: 'Basic', marketShare: 12, userRating: 4.1 },
    { product: 'A2', price: 399, performance: 85, category: 'Basic', marketShare: 15, userRating: 4.3 },
    { product: 'A3', price: 499, performance: 88, category: 'Basic', marketShare: 18, userRating: 4.4 },
    { product: 'B1', price: 599, performance: 92, category: 'Premium', marketShare: 22, userRating: 4.5 },
    { product: 'B2', price: 699, performance: 94, category: 'Premium', marketShare: 25, userRating: 4.6 },
    { product: 'B3', price: 799, performance: 96, category: 'Premium', marketShare: 28, userRating: 4.7 },
    { product: 'C1', price: 899, performance: 97, category: 'Pro', marketShare: 32, userRating: 4.8 },
    { product: 'C2', price: 999, performance: 98, category: 'Pro', marketShare: 35, userRating: 4.8 },
    { product: 'C3', price: 1199, performance: 99, category: 'Pro', marketShare: 38, userRating: 4.9 },
    { product: 'D1', price: 1399, performance: 99.5, category: 'Enterprise', marketShare: 42, userRating: 4.9 },
    { product: 'D2', price: 1599, performance: 99.8, category: 'Enterprise', marketShare: 45, userRating: 5.0 },
    { product: 'D3', price: 1899, performance: 99.9, category: 'Enterprise', marketShare: 48, userRating: 5.0 },
  ]

  // 場景 3: 股票分析 - 風險 vs 收益率，氣泡大小代表市值
  const stockData = [
    { stock: 'AAPL', risk: 0.15, return: 0.22, marketCap: 2800, sector: 'Technology', dividendYield: 0.6 },
    { stock: 'MSFT', risk: 0.18, return: 0.25, marketCap: 2400, sector: 'Technology', dividendYield: 0.8 },
    { stock: 'GOOGL', risk: 0.22, return: 0.28, marketCap: 1600, sector: 'Technology', dividendYield: 0.0 },
    { stock: 'AMZN', risk: 0.28, return: 0.18, marketCap: 1400, sector: 'Technology', dividendYield: 0.0 },
    { stock: 'TSLA', risk: 0.45, return: 0.65, marketCap: 800, sector: 'Automotive', dividendYield: 0.0 },
    { stock: 'JPM', risk: 0.25, return: 0.15, marketCap: 450, sector: 'Finance', dividendYield: 2.8 },
    { stock: 'JNJ', risk: 0.12, return: 0.08, marketCap: 420, sector: 'Healthcare', dividendYield: 2.6 },
    { stock: 'V', risk: 0.20, return: 0.18, marketCap: 480, sector: 'Finance', dividendYield: 0.6 },
    { stock: 'PG', risk: 0.10, return: 0.06, marketCap: 380, sector: 'Consumer', dividendYield: 2.4 },
    { stock: 'UNH', risk: 0.16, return: 0.14, marketCap: 520, sector: 'Healthcare', dividendYield: 1.3 },
    { stock: 'HD', risk: 0.22, return: 0.16, marketCap: 350, sector: 'Retail', dividendYield: 2.2 },
    { stock: 'MA', risk: 0.19, return: 0.17, marketCap: 370, sector: 'Finance', dividendYield: 0.5 },
  ]

  const [activeScenario, setActiveScenario] = useState<'sales' | 'product' | 'stock'>('sales')
  const [activeSeriesIds, setActiveSeriesIds] = useState<Set<string>>(new Set())
  const [showRegression, setShowRegression] = useState(true)
  const [regressionType, setRegressionType] = useState<'linear' | 'polynomial'>('linear')
  const [showEquation, setShowEquation] = useState(false)
  const [showRSquared, setShowRSquared] = useState(true)

  // 銷售業績場景配置
  const salesSeries: ComboChartSeries[] = [
    { 
      type: 'scatter', 
      dataKey: 'revenue', 
      name: '廣告投入vs銷售額', 
      yAxis: 'left', 
      color: '#3b82f6',
      scatterRadius: 6,
      scatterOpacity: 0.7,
      sizeKey: 'customerCount',
      sizeRange: [4, 16],
      showRegression,
      regressionType,
      regressionColor: '#ef4444',
      regressionWidth: 2,
      showEquation,
      showRSquared
    },
    { 
      type: 'line', 
      dataKey: 'satisfaction', 
      name: '客戶滿意度', 
      yAxis: 'right', 
      color: '#10b981', 
      strokeWidth: 3,
      curve: 'monotone' 
    },
    { 
      type: 'line', 
      dataKey: 'competitorPrice', 
      name: '競爭對手價格', 
      yAxis: 'right', 
      color: '#f59e0b', 
      strokeWidth: 2,
      curve: 'monotone' 
    },
  ]

  // 產品性能場景配置
  const productSeries: ComboChartSeries[] = [
    { 
      type: 'scatter', 
      dataKey: 'performance', 
      name: '價格vs性能', 
      yAxis: 'left', 
      color: '#8b5cf6',
      scatterRadius: 8,
      scatterOpacity: 0.8,
      groupKey: 'category',
      sizeKey: 'marketShare',
      sizeRange: [6, 18],
      showRegression,
      regressionType,
      regressionColor: '#ef4444',
      regressionWidth: 2,
      showEquation,
      showRSquared
    },
    { 
      type: 'line', 
      dataKey: 'userRating', 
      name: '用戶評分', 
      yAxis: 'right', 
      color: '#f59e0b', 
      strokeWidth: 3,
      curve: 'monotone' 
    },
  ]

  // 股票分析場景配置
  const stockSeries: ComboChartSeries[] = [
    { 
      type: 'scatter', 
      dataKey: 'return', 
      name: '風險vs收益', 
      yAxis: 'left', 
      color: '#ef4444',
      scatterRadius: 8,
      scatterOpacity: 0.7,
      groupKey: 'sector',
      sizeKey: 'marketCap',
      sizeRange: [8, 20],
      showRegression,
      regressionType,
      regressionColor: '#3b82f6',
      regressionWidth: 3,
      showEquation,
      showRSquared
    },
    { 
      type: 'line', 
      dataKey: 'dividendYield', 
      name: '股息率', 
      yAxis: 'right', 
      color: '#10b981', 
      strokeWidth: 2,
      curve: 'monotone' 
    },
  ]

  const getCurrentData = () => {
    switch (activeScenario) {
      case 'sales': return salesData
      case 'product': return productData
      case 'stock': return stockData
      default: return salesData
    }
  }

  const getCurrentSeries = () => {
    const baseSeries = (() => {
      switch (activeScenario) {
        case 'sales': return salesSeries
        case 'product': return productSeries
        case 'stock': return stockSeries
        default: return salesSeries
      }
    })()

    // 如果有選擇的系列，只顯示選擇的系列
    if (activeSeriesIds.size > 0) {
      return baseSeries.filter(s => activeSeriesIds.has(s.dataKey))
    }
    return baseSeries
  }

  const getCurrentXKey = () => {
    switch (activeScenario) {
      case 'sales': return 'adSpend'
      case 'product': return 'price'
      case 'stock': return 'risk'
      default: return 'adSpend'
    }
  }

  const getCurrentConfig = () => {
    switch (activeScenario) {
      case 'sales':
        return {
          title: '銷售業績分析 - Scatter + Regression + Line',
          leftAxis: { label: '銷售額 (元)' },
          rightAxis: { label: '滿意度分數 / 競爭對手價格' },
          xAxis: { label: '廣告投入 (元)' }
        }
      case 'product':
        return {
          title: '產品性能分析 - Scatter + Regression + Line',
          leftAxis: { label: '性能分數' },
          rightAxis: { label: '用戶評分' },
          xAxis: { label: '價格 (元)' }
        }
      case 'stock':
        return {
          title: '股票風險收益分析 - Scatter + Regression + Line',
          leftAxis: { label: '年化收益率 (%)' },
          rightAxis: { label: '股息率 (%)' },
          xAxis: { label: '年化波動率 (風險)' }
        }
      default:
        return {
          title: '銷售業績分析',
          leftAxis: { label: '銷售額' },
          rightAxis: { label: '滿意度' },
          xAxis: { label: '廣告投入' }
        }
    }
  }

  const toggleSeries = (dataKey: string) => {
    const newActiveIds = new Set(activeSeriesIds)
    if (newActiveIds.has(dataKey)) {
      newActiveIds.delete(dataKey)
    } else {
      newActiveIds.add(dataKey)
    }
    setActiveSeriesIds(newActiveIds)
  }

  const resetSeries = () => {
    setActiveSeriesIds(new Set())
  }

  const config = getCurrentConfig()
  const currentSeries = getCurrentSeries()

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Scatter + Regression Line 組合圖表
        </h1>
        <p className="text-gray-600 mb-6">
          展示散點圖與回歸線的組合，支援氣泡圖、分組著色和多種回歸分析。適用於相關性分析和趨勢預測。
        </p>

        {/* 場景選擇 */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'sales', label: '📈 銷售業績', desc: '廣告投入vs銷售額分析' },
            { key: 'product', label: '📊 產品性能', desc: '價格vs性能相關性' },
            { key: 'stock', label: '💹 股票分析', desc: '風險vs收益平衡' },
          ].map((scenario) => (
            <button
              key={scenario.key}
              onClick={() => {
                setActiveScenario(scenario.key as any)
                setActiveSeriesIds(new Set())
              }}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                activeScenario === scenario.key
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div className="font-medium">{scenario.label}</div>
              <div className="text-xs text-gray-500">{scenario.desc}</div>
            </button>
          ))}
        </div>

        {/* 回歸分析配置 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">回歸分析配置</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showRegression"
                checked={showRegression}
                onChange={(e) => setShowRegression(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="showRegression" className="text-sm text-gray-700">顯示回歸線</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">回歸類型</label>
              <select
                value={regressionType}
                onChange={(e) => setRegressionType(e.target.value as any)}
                disabled={!showRegression}
                className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="linear">線性回歸</option>
                <option value="polynomial">多項式回歸</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showEquation"
                checked={showEquation}
                onChange={(e) => setShowEquation(e.target.checked)}
                disabled={!showRegression}
                className="rounded border-gray-300"
              />
              <label htmlFor="showEquation" className="text-sm text-gray-700">顯示方程式</label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showRSquared"
                checked={showRSquared}
                onChange={(e) => setShowRSquared(e.target.checked)}
                disabled={!showRegression}
                className="rounded border-gray-300"
              />
              <label htmlFor="showRSquared" className="text-sm text-gray-700">顯示 R² 值</label>
            </div>
          </div>
        </div>

        {/* 系列控制 */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-700">系列控制</h3>
            <button
              onClick={resetSeries}
              className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
            >
              顯示全部
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {(activeScenario === 'sales' ? salesSeries : 
              activeScenario === 'product' ? productSeries : stockSeries).map((series) => (
              <button
                key={series.dataKey}
                onClick={() => toggleSeries(series.dataKey)}
                className={`px-3 py-1 rounded text-xs transition-colors flex items-center gap-2 ${
                  activeSeriesIds.size === 0 || activeSeriesIds.has(series.dataKey)
                    ? 'bg-white border-2 text-gray-700'
                    : 'bg-gray-200 border-2 border-gray-300 text-gray-500'
                }`}
                style={{
                  borderColor: activeSeriesIds.size === 0 || activeSeriesIds.has(series.dataKey) 
                    ? series.color 
                    : undefined
                }}
              >
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: series.color }}
                />
                {series.name}
                <span className="text-xs opacity-60">
                  ({series.type === 'scatter' ? '散點' : '線'})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 圖表 */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">{config.title}</h2>
        
        <div className="mb-4">
          <EnhancedComboChart
            data={getCurrentData()}
            series={currentSeries}
            xKey={getCurrentXKey()}
            width={900}
            height={500}
            margin={{ top: 20, right: 80, bottom: 60, left: 80 }}
            leftAxis={{
              label: config.leftAxis.label,
              gridlines: true,
            }}
            rightAxis={{
              label: config.rightAxis.label,
              gridlines: false,
            }}
            xAxis={{
              label: config.xAxis.label,
            }}
            animate={true}
            className="scatter-regression-combo"
          />
        </div>

        {/* 數據統計 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <div className="font-medium text-blue-800">散點圖系列</div>
            <div className="text-blue-600">
              {currentSeries.filter(s => s.type === 'scatter').length} 個散點圖系列
            </div>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <div className="font-medium text-green-800">趨勢線系列</div>
            <div className="text-green-600">
              {currentSeries.filter(s => s.type === 'line').length} 條趨勢線
            </div>
          </div>
          <div className="bg-purple-50 p-3 rounded">
            <div className="font-medium text-purple-800">資料點數量</div>
            <div className="text-purple-600">
              {getCurrentData().length} 個數據點
            </div>
          </div>
        </div>
      </div>

      {/* 技術說明 */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">技術特色</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h4 className="font-medium text-gray-800 mb-2">🎯 散點圖功能</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• 支援氣泡圖：點的大小映射到數據維度</li>
              <li>• 分組著色：根據類別自動分配顏色</li>
              <li>• 交互事件：點擊和懸停事件處理</li>
              <li>• 自適應縮放：自動調整點的大小範圍</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-800 mb-2">📈 回歸分析</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• 線性回歸：最小二乘法計算趨勢線</li>
              <li>• 多項式回歸：支援二次曲線擬合</li>
              <li>• R² 決定係數：評估回歸模型擬合度</li>
              <li>• 方程式顯示：實時顯示回歸方程</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScatterRegressionComboDemo