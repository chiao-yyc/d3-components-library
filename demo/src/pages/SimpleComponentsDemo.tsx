import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AreaChart } from '../../../registry/components/basic/area-chart';
import {
  DemoPageTemplate,
  ModernControlPanel,
  ControlGroup,
  ChartContainer,
  DataTable,
  CodeExample
} from '../components/ui';
import {
  ChartBarSquareIcon,
  SparklesIcon,
  CogIcon,
  BeakerIcon,
  BookOpenIcon,
  RocketLaunchIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

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
];

export default function SimpleComponentsDemo() {
  const [variant, setVariant] = useState<'default' | 'simple' | 'stacked' | 'percent'>('simple');
  const [stackMode, setStackMode] = useState<'none' | 'stack' | 'percent'>('none');
  const [showUsageCode, setShowUsageCode] = useState(false);


  const currentUsageCode = `import { AreaChart } from '@/components/ui/area-chart';

const data = [
  { x: new Date('2024-01-01'), y: 100, series: 'A' },
  { x: new Date('2024-01-02'), y: 120, series: 'A' }
];

<AreaChart 
  data={data} 
  variant="${variant}"
  stackMode="${stackMode}"
/>`;

  return (
    <DemoPageTemplate
      title="簡化組件 (Layer 1)"
      description="專為快速開發和學習而設計的預製圖表層。提供最基本但完整的功能，讓您在幾行程式碼內就能創建專業圖表。"
      breadcrumb={[
        { label: '首頁', href: '/' },
        { label: '核心架構' },
        { label: '簡化組件' }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 控制面板 */}
        <div className="lg:col-span-1">
          <ModernControlPanel title="配置選項" icon={<CogIcon className="h-5 w-5" />}>
            <div className="space-y-6">
              {/* 變體設定 */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4 text-purple-500" />
                  <h3 className="text-sm font-semibold text-gray-700">變體 (Variant)</h3>
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
              <div className="space-y-3">
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
                          ? `bg-amber-100 border-2 border-amber-300 text-amber-700`
                          : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

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
            title={`區域圖 (AreaChart) - ${variant} 變體`}
            description="展示簡化版組件如何透過單一 variant 屬性切換不同的預設配置。"
            responsive={true}
            aspectRatio={16 / 9}
          >
            {({ width, height }) => (
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
                  width={width}
                  height={height}
                  stackMode={stackMode}
                  onDataClick={(data) => {
                    console.log('Chart clicked:', data);
                  }}
                />
              </motion.div>
            )}
          </ChartContainer>

          {/* 導航到下一層 */}
          <Link to="/composable-primitives" className="block p-6 bg-white rounded-lg shadow-sm border hover:shadow-lg hover:border-blue-300 transition-all group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">進階：完全組合式 (Layer 2)</h3>
                <p className="text-gray-600 mt-1">需要更高自由度？了解如何使用基礎元件從零開始構建圖表。</p>
              </div>
              <ArrowRightIcon className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>

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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }}
                className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-sm text-center"
              >
                <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RocketLaunchIcon className="h-6 h-6 text-blue-600" />
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
                  <SparklesIcon className="h-6 h-6 text-green-600" />
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
                  <CogIcon className="h-6 h-6 text-purple-600" />
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
            description={`AreaChart 使用的示範資料`}
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
  );
}
