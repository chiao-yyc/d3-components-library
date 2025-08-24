import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AreaChart } from '../../../registry/components/basic/area-chart'
import {
  DemoPageTemplate,
  ModernControlPanel,
  ChartContainer,
  DataTable,
  CodeExample
} from '../components/ui'
import {
  ChartBarSquareIcon,
  SparklesIcon,
  CogIcon,
  BeakerIcon,
  BookOpenIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'

// 示範數據
const areaData = [
  { x: new Date('2024-01-01'), y: 100, series: 'A' },
  { x: new Date('2024-01-02'), y: 120, series: 'A' },
  { x: new Date('2024-01-03'), y: 80, series: 'A' },
  { x: new Date('2024-01-04'), y: 150, series: 'A' },
  { x: new Date('2024-01-05'), y: 200, series: 'A' },
  { x: new Date('2024-01-01'), y: 80, series: 'B' },
  { x: new Date('2024-01-02'), y: 90, series: 'B' },
  { x: new Date('2024-01-03'), y: 110, series: 'B' },
  { x: new Date('2024-01-04'), y: 95, series: 'B' },
  { x: new Date('2024-01-05'), y: 130, series: 'B' }
]

export default function SimpleComponentsDemo() {
  const [activeChart, setActiveChart] = useState('area')
  const [variant, setVariant] = useState<'default' | 'simple' | 'stacked' | 'percent'>('simple')
  const [stackMode, setStackMode] = useState<'none' | 'stack' | 'percent'>('none')
  const [showUsageCode, setShowUsageCode] = useState(false)

  const charts = [
    { id: 'area', name: '區域圖', component: 'AreaChart' },
    // 其他圖表即將支援...
  ]

  const renderChart = () => {
    if (activeChart === 'area') {
      return (
        <motion.div
          key={`${variant}-${stackMode}`}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full h-full flex items-center justify-center"
        >
          <AreaChart 
            data={areaData}
            variant={variant}
            width={800}
            height={400}
            stackMode={stackMode}
            onDataClick={(data) => {
              console.log('Chart clicked:', data)
              // 使用更現代的通知方式，而非 alert
            }}
          />
        </motion.div>
      )
    }
    
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
      >
        <RocketLaunchIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p className="text-lg font-medium">其他圖表正在開發中...</p>
        <p className="text-sm mt-2">即將支援更多簡化版圖表組件</p>
      </motion.div>
    )
  }

  const currentUsageCode = `import { AreaChart } from '@/components/ui/area-chart'

const data = [
  { x: new Date('2024-01-01'), y: 100, series: 'A' },
  { x: new Date('2024-01-02'), y: 120, series: 'A' }
]

<AreaChart 
  data={data} 
  variant="${variant}"
  stackMode="${stackMode}"
/>`

  return (
    <DemoPageTemplate
      title="簡化版圖表組件 🚀"
      description="專為快速使用和學習而設計的簡化圖表組件，提供最基本但完整的功能，讓您在幾行程式碼內就能創建專業圖表。"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 控制面板 */}
        <div className="lg:col-span-1">
          <ModernControlPanel title="配置選項" icon={<CogIcon className="h-5 w-5" />}>
            <div className="space-y-6">
              
              {/* 圖表類型 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <ChartBarSquareIcon className="h-4 w-4 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700">圖表類型</h3>
                </div>
                <select
                  value={activeChart}
                  onChange={(e) => setActiveChart(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm
                            focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  {charts.map(chart => (
                    <option key={chart.id} value={chart.id}>{chart.name}</option>
                  ))}
                </select>
              </div>

              {/* 變體設定 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4 text-purple-500" />
                  <h3 className="text-sm font-semibold text-gray-700">變體</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'default', label: '完整版', color: 'blue' },
                    { value: 'simple', label: '簡化版', color: 'green' },
                    { value: 'stacked', label: '堆疊版', color: 'purple' },
                    { value: 'percent', label: '百分比版', color: 'orange' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setVariant(option.value as any)}
                      className={`p-2 rounded-lg text-xs transition-all duration-200 ${
                        variant === option.value
                          ? `bg-${option.color}-100 border-2 border-${option.color}-300 text-${option.color}-700`
                          : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 堆疊模式 */}
              {activeChart === 'area' && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <BeakerIcon className="h-4 w-4 text-amber-500" />
                    <h3 className="text-sm font-semibold text-gray-700">堆疊模式</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: 'none', label: '無堆疊' },
                      { value: 'stack', label: '堆疊' },
                      { value: 'percent', label: '百分比堆疊' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setStackMode(option.value as any)}
                        className={`p-2 rounded-lg text-xs transition-all duration-200 ${
                          stackMode === option.value
                            ? 'bg-amber-100 border-2 border-amber-300 text-amber-700'
                            : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* 使用說明按鈕 */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowUsageCode(!showUsageCode)}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-purple-50 
                            border border-blue-200 rounded-xl text-blue-700 hover:from-blue-100 hover:to-purple-100 
                            transition-all duration-200 text-sm font-medium"
                >
                  <BookOpenIcon className="h-4 w-4" />
                  {showUsageCode ? '隱藏' : '顯示'} 程式碼
                </button>
              </div>
            </div>
          </ModernControlPanel>
        </div>

        {/* 主要內容區域 */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* 圖表展示 */}
          <ChartContainer 
            title={`${charts.find(c => c.id === activeChart)?.name} - ${variant} 變體`}
            description="簡化版組件提供最少的屬性配置，即可創建美觀的圖表"
          >
            <div className="h-[500px] w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-white rounded-lg">
              {renderChart()}
            </div>
          </ChartContainer>

          {/* 程式碼範例 */}
          <AnimatePresence>
            {showUsageCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CodeExample
                  title="使用範例"
                  description={`當前配置：變體=${variant}, 堆疊模式=${stackMode}`}
                  language="typescript"
                  code={currentUsageCode}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 設計特色 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8 backdrop-blur-sm border border-white/20"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              ✨ 簡化版設計哲學
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-sm text-center"
              >
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RocketLaunchIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">🚀 快速上手</h3>
                <p className="text-sm text-gray-600">
                  最少的配置屬性，幾行程式碼即可創建專業圖表
                </p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-sm text-center"
              >
                <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <SparklesIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">✨ 智慧預設</h3>
                <p className="text-sm text-gray-600">
                  內建最佳實踐設定，自動適配常見使用場景
                </p>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-sm text-center"
              >
                <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CogIcon className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">🔧 彈性擴展</h3>
                <p className="text-sm text-gray-600">
                  需要時可輕鬆升級到完整版，保持 API 相容性
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* 資料表格 */}
          <DataTable
            title="範例數據"
            description={`${charts.find(c => c.id === activeChart)?.name} 使用的示範資料`}
            data={areaData.slice(0, 10)}
            columns={[
              { key: 'x', title: 'X 軸 (時間)', sortable: true },
              { key: 'y', title: 'Y 軸 (數值)', sortable: true },
              { key: 'series', title: '系列', sortable: true }
            ]}
          />
        </div>
      </div>
    </DemoPageTemplate>
  )
}