import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MultiSeriesComboChartV2, type ComboSeries } from '../../../registry/components/composite'
import {
  DemoPageTemplate,
  ModernControlPanel,
  ChartContainer,
  DataTable,
  CodeExample
} from '../components/ui'
import {
  ChartBarSquareIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CogIcon,
  EyeIcon,
  SparklesIcon,
  CalculatorIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'

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
  const salesSeries: ComboSeries[] = [
    { 
      type: 'scatter', 
      yKey: 'revenue', 
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
      yKey: 'satisfaction', 
      name: '客戶滿意度', 
      yAxis: 'right', 
      color: '#10b981', 
      strokeWidth: 3,
      curve: 'monotone' 
    },
    { 
      type: 'line', 
      yKey: 'competitorPrice', 
      name: '競爭對手價格', 
      yAxis: 'right', 
      color: '#f59e0b', 
      strokeWidth: 2,
      curve: 'monotone' 
    },
  ]

  // 產品性能場景配置
  const productSeries: ComboSeries[] = [
    { 
      type: 'scatter', 
      yKey: 'performance', 
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
      yKey: 'userRating', 
      name: '用戶評分', 
      yAxis: 'right', 
      color: '#f59e0b', 
      strokeWidth: 3,
      curve: 'monotone' 
    },
  ]

  // 股票分析場景配置
  const stockSeries: ComboSeries[] = [
    { 
      type: 'scatter', 
      yKey: 'return', 
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
      yKey: 'dividendYield', 
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
      return baseSeries.filter(s => activeSeriesIds.has(s.yKey))
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

  const toggleSeries = (yKey: string) => {
    const newActiveIds = new Set(activeSeriesIds)
    if (newActiveIds.has(yKey)) {
      newActiveIds.delete(yKey)
    } else {
      newActiveIds.add(yKey)
    }
    setActiveSeriesIds(newActiveIds)
  }

  const resetSeries = () => {
    setActiveSeriesIds(new Set())
  }

  const config = getCurrentConfig()
  const currentSeries = getCurrentSeries()

  return (
    <DemoPageTemplate
      title="Scatter + Regression 組合圖表 🔬"
      description="展示散點圖與回歸線的完美組合，支援氣泡圖、分組著色和多種回歸分析。適用於相關性分析、趨勢預測和科學研究數據可視化。"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 控制面板 */}
        <div className="lg:col-span-1">
          <ModernControlPanel title="分析控制" icon={<CogIcon className="h-5 w-5" />}>
            <div className="space-y-6">

              {/* 場景選擇 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700">選擇分析場景</h3>
                </div>
                <div className="space-y-2">
                  {[
                    { 
                      key: 'sales', 
                      label: '銷售業績', 
                      icon: <ChartBarIcon className="h-4 w-4" />,
                      desc: '廣告投入vs銷售額分析',
                      color: 'blue'
                    },
                    { 
                      key: 'product', 
                      label: '產品性能', 
                      icon: <ChartBarSquareIcon className="h-4 w-4" />,
                      desc: '價格vs性能相關性',
                      color: 'green' 
                    },
                    { 
                      key: 'stock', 
                      label: '股票分析', 
                      icon: <CurrencyDollarIcon className="h-4 w-4" />,
                      desc: '風險vs收益平衡',
                      color: 'purple'
                    },
                  ].map((scenario) => (
                    <motion.button
                      key={scenario.key}
                      onClick={() => {
                        setActiveScenario(scenario.key as any)
                        setActiveSeriesIds(new Set())
                      }}
                      whileHover={{ scale: 1.02, x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full p-3 rounded-xl border-2 transition-all duration-200 text-left ${
                        activeScenario === scenario.key
                          ? `bg-${scenario.color}-100 border-${scenario.color}-300 text-${scenario.color}-700`
                          : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {scenario.icon}
                        <span className="font-medium text-sm">{scenario.label}</span>
                      </div>
                      <div className="text-xs opacity-70">{scenario.desc}</div>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* 回歸分析配置 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CalculatorIcon className="h-4 w-4 text-green-500" />
                  <h3 className="text-sm font-semibold text-gray-700">回歸分析配置</h3>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="showRegression"
                      checked={showRegression}
                      onChange={(e) => setShowRegression(e.target.checked)}
                      className="rounded border-gray-300 text-green-500 focus:ring-green-200"
                    />
                    <label htmlFor="showRegression" className="text-sm text-gray-700 font-medium">顯示回歸線</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">回歸類型</label>
                    <select
                      value={regressionType}
                      onChange={(e) => setRegressionType(e.target.value as any)}
                      disabled={!showRegression}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-green-200 focus:border-green-300"
                    >
                      <option value="linear">線性回歸</option>
                      <option value="polynomial">多項式回歸</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="showEquation"
                        checked={showEquation}
                        onChange={(e) => setShowEquation(e.target.checked)}
                        disabled={!showRegression}
                        className="rounded border-gray-300 text-green-500 focus:ring-green-200"
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
                        className="rounded border-gray-300 text-green-500 focus:ring-green-200"
                      />
                      <label htmlFor="showRSquared" className="text-sm text-gray-700">顯示 R² 值</label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 系列控制 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <EyeIcon className="h-4 w-4 text-purple-500" />
                    <h3 className="text-sm font-semibold text-gray-700">系列控制</h3>
                  </div>
                  <button
                    onClick={resetSeries}
                    className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
                  >
                    顯示全部
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {(activeScenario === 'sales' ? salesSeries : 
                    activeScenario === 'product' ? productSeries : stockSeries).map((series) => (
                    <motion.button
                      key={series.yKey}
                      onClick={() => toggleSeries(series.yKey)}
                      whileHover={{ x: 2 }}
                      className={`w-full p-2 rounded-lg text-xs transition-all duration-200 text-left ${
                        activeSeriesIds.size === 0 || activeSeriesIds.has(series.yKey)
                          ? 'bg-white border-2 shadow-sm'
                          : 'bg-gray-100 border border-gray-300 opacity-60'
                      }`}
                      style={{
                        borderColor: activeSeriesIds.size === 0 || activeSeriesIds.has(series.yKey) 
                          ? series.color 
                          : undefined
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-sm" 
                          style={{ backgroundColor: series.color }}
                        />
                        <span className="font-medium flex-1">{series.name}</span>
                        <span className="text-xs opacity-60">
                          ({series.type === 'scatter' ? '散點' : '線'})
                        </span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </ModernControlPanel>
        </div>

        {/* 主要內容區域 */}
        <div className="lg:col-span-3 space-y-8">

          {/* 圖表展示 */}
          <motion.div
            key={activeScenario}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ChartContainer 
              title={config.title}
              subtitle={`${currentSeries.length} 個系列 | ${getCurrentData().length} 個資料點`}
              responsive={true}
              aspectRatio={16 / 9}
            >
              {({ width, height }) => (
                <MultiSeriesComboChartV2
                  data={getCurrentData()}
                  series={currentSeries}
                  xAccessor={getCurrentXKey()}
                  width={width}
                  height={height}
                  margin={{ top: 20, right: 80, bottom: 60, left: 80 }}
                  leftAxis={{
                    label: config.leftAxis.label,
                    gridlines: true,
                  }}
                  rightAxis={{
                    label: config.rightAxis.label,
                    gridlines: false,
                  }}
                  showGrid={true}
                  animate={true}
                  className="scatter-regression-combo"
                />
              )}
            </ChartContainer>
          </motion.div>

          {/* 數據統計卡片 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <motion.div 
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <ChartBarSquareIcon className="h-4 w-4 text-white" />
                </div>
                <div className="font-semibold text-blue-800">散點圖系列</div>
              </div>
              <div className="text-blue-700 text-lg font-bold">
                {currentSeries.filter(s => s.type === 'scatter').length} 個散點圖系列
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">~</span>
                </div>
                <div className="font-semibold text-green-800">趨勢線系列</div>
              </div>
              <div className="text-green-700 text-lg font-bold">
                {currentSeries.filter(s => s.type === 'line').length} 條趨勢線
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ y: -2, scale: 1.02 }}
              className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">#</span>
                </div>
                <div className="font-semibold text-purple-800">資料點</div>
              </div>
              <div className="text-purple-700 text-lg font-bold">
                {getCurrentData().length} 個數據點
              </div>
            </motion.div>
          </motion.div>

          {/* 技術特色說明 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 backdrop-blur-sm border border-white/20"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">🔬 技術特色</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-sm"
              >
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <ChartBarSquareIcon className="h-5 w-5 text-blue-500" />
                  散點圖功能
                </h4>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></span>
                    支援氣泡圖：點的大小映射到數據維度
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></span>
                    分組著色：根據類別自動分配顏色
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></span>
                    交互事件：點擊和懸停事件處理
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0"></span>
                    自適應縮放：自動調整點的大小範圍
                  </li>
                </ul>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-sm"
              >
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <CalculatorIcon className="h-5 w-5 text-green-500" />
                  回歸分析
                </h4>
                <ul className="text-gray-600 space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></span>
                    線性回歸：最小二乘法計算趨勢線
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></span>
                    多項式回歸：支援二次曲線擬合
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></span>
                    R² 決定係數：評估回歸模型擬合度
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0"></span>
                    方程式顯示：實時顯示回歸方程
                  </li>
                </ul>
              </motion.div>
            </div>
          </motion.div>

          {/* 資料表格 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <DataTable
              title={`${config.title} - 資料預覽`}
              description="當前場景的示範資料，展示前8筆記錄"
              data={getCurrentData().slice(0, 8)}
              columns={Object.keys(getCurrentData()[0] || {}).map(key => ({
                key,
                title: key,
                sortable: true
              }))}
            />
          </motion.div>

          {/* 程式碼範例 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <CodeExample
              title="散點 + 回歸線組合圖表使用範例"
              description="展示如何使用 scatter 系列結合回歸分析，支援氣泡大小與回歸線顯示"
              code={`import { MultiSeriesComboChartV2, type ComboSeries } from '../../../registry/components/composite'

const data = [
  { 
    month: 'Jan', 
    adSpend: 5000, 
    revenue: 45000, 
    customerCount: 120, 
    satisfaction: 4.2 
  },
  { 
    month: 'Feb', 
    adSpend: 7200, 
    revenue: 62000, 
    customerCount: 145, 
    satisfaction: 4.3 
  },
  // ...更多數據
]

const series: ComboSeries[] = [
  {
    type: 'scatter',
    yKey: 'revenue',
    name: '廣告投入vs銷售額',
    yAxis: 'left',
    color: '#3b82f6',
    scatterRadius: 6,
    scatterOpacity: 0.7,
    // 使用客戶數量作為氣泡大小
    sizeKey: 'customerCount',
    sizeRange: [4, 16],
    // 回歸線設定
    showRegression: true,
    regressionType: 'linear',
    regressionColor: '#ef4444',
    regressionWidth: 2,
    showRSquared: true
  },
  {
    type: 'line',
    yKey: 'satisfaction',
    name: '客戶滿意度',
    yAxis: 'right',
    color: '#10b981',
    strokeWidth: 2,
    showPoints: true,
    pointRadius: 3,
    curve: 'monotone'
  }
]

<MultiSeriesComboChartV2
  data={data}
  series={series}
  xKey="month"
  width={800}
  height={500}
  leftAxis={{
    label: '銷售額 (元)',
    gridlines: true
  }}
  rightAxis={{
    label: '滿意度 (分)',
    gridlines: false
  }}
  showGrid={true}
  animate={true}
  interactive={true}
  margin={{ top: 20, right: 80, bottom: 60, left: 100 }}
  onSeriesClick={(series, dataPoint) => {
    console.log('點擊了', series.name, dataPoint)
  }}
/>`}
              language="typescript"
            />
          </motion.div>
        </div>
      </div>
    </DemoPageTemplate>
  )
}

export default ScatterRegressionComboDemo