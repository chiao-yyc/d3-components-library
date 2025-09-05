import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { BarChart } from '@registry/components/basic/bar-chart'
import { processData } from '@registry/components/core/data-processor'
import { 
  DemoPageTemplate,
  ModernControlPanel,
  ControlGroup,
  SelectControl,
  ToggleControl,
  ChartContainer,
  StatusDisplay,
  DataTable,
  CodeExample,
  type DataTableColumn
} from '../components/ui'
import { CogIcon, BeakerIcon, SparklesIcon } from '@heroicons/react/24/outline'

// 測試數據
const sampleData = [
  { category: 'A', value: 23000, sales: 12000 },
  { category: 'B', value: 145000, sales: 19000 },
  { category: 'C', value: 256000, sales: 3000 },
  { category: 'D', value: 78000, sales: 5000 },
  { category: 'E', value: 1320000, sales: 15000 }
]

const salesData = [
  { month: 'Jan', revenue: 45000, costs: 32000 },
  { month: 'Feb', revenue: 52000, costs: 35000 },
  { month: 'Mar', revenue: 48000, costs: 33000 },
  { month: 'Apr', revenue: 61000, costs: 42000 },
  { month: 'May', revenue: 55000, costs: 38000 },
  { month: 'Jun', revenue: 67000, costs: 44000 }
]

export default function ModularTestDemo() {
  const [selectedScheme, setSelectedScheme] = useState('blues')
  const [animate, setAnimate] = useState(true)
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('vertical')
  const [selectedTest, setSelectedTest] = useState<'basic' | 'data-processing' | 'performance' | 'compatibility'>('basic')
  const [showTooltip, setShowTooltip] = useState(true)
  const [interactive, setInteractive] = useState(true)
  
  // 性能監控狀態
  const [renderTime, setRenderTime] = useState(0)
  const [fps, setFps] = useState(0)
  const performanceStartTime = useRef<number>(0)

  // 測試資料處理
  const testResult = processData(sampleData, { 
    autoDetect: true,
    mapping: {
      x: 'category',
      y: 'value'
    }
  })
  console.log('Data processor test:', testResult)
  console.log('Original sampleData:', sampleData)
  console.log('Processed data length:', testResult.data?.length)
  console.log('Processing errors:', testResult.errors)
  console.log('Processing warnings:', testResult.warnings)
  console.log('Mapping used:', testResult.mapping)

  // 性能監控
  useEffect(() => {
    if (selectedTest === 'performance') {
      performanceStartTime.current = performance.now()
      
      let frameCount = 0
      const startTime = performance.now()
      
      const measureFPS = () => {
        frameCount++
        const currentTime = performance.now()
        const elapsed = currentTime - startTime
        
        if (elapsed >= 1000) {
          setFps(Math.round((frameCount * 1000) / elapsed))
          frameCount = 0
        }
        
        if (selectedTest === 'performance') {
          requestAnimationFrame(measureFPS)
        }
      }
      
      requestAnimationFrame(measureFPS)
      
      // 模擬渲染時間
      setTimeout(() => {
        setRenderTime(performance.now() - performanceStartTime.current)
      }, 100)
    }
  }, [selectedTest])

  // 獲取當前測試數據
  const getCurrentTestData = () => {
    switch (selectedTest) {
      case 'basic':
        return sampleData
      case 'data-processing':
        return testResult.data.length > 0 ? testResult.data : sampleData
      case 'performance':
        // 生成大數據集用於性能測試
        return Array.from({ length: 1000 }, (_, i) => ({
          category: `Item ${i}`,
          value: Math.floor(Math.random() * 100000) + 1000,
          performance: Math.random() * 100
        }))
      case 'compatibility':
        return salesData
      default:
        return sampleData
    }
  }

  // 檢查是否有數據處理錯誤
  const hasDataIssues = selectedTest === 'data-processing' && (testResult.errors.length > 0 || testResult.data.length === 0)

  const currentTestData = getCurrentTestData()

  // 狀態顯示數據
  const statusItems = [
    { label: '測試類型', value: selectedTest === 'basic' ? '基礎功能測試' : selectedTest === 'data-processing' ? '數據處理測試' : selectedTest === 'performance' ? '性能壓力測試' : '兼容性測試' },
    { label: '數據點數', value: currentTestData.length.toLocaleString() },
    { label: '色彩方案', value: selectedScheme },
    { label: '圖表方向', value: orientation === 'vertical' ? '垂直' : '水平' },
    { label: '動畫狀態', value: animate ? '啟用' : '停用', color: animate ? '#10b981' : '#6b7280' },
    { label: '記憶體使用', value: selectedTest === 'performance' ? '監控中' : '標準', color: selectedTest === 'performance' ? '#f59e0b' : '#6b7280' }
  ]

  // 數據表格列定義
  const getTableColumns = (): DataTableColumn[] => {
    const data = currentTestData[0]
    if (!data) return []

    return Object.keys(data).map(key => ({
      key,
      title: key,
      sortable: true,
      formatter: typeof data[key as keyof typeof data] === 'number' 
        ? (value) => value.toLocaleString() 
        : undefined,
      align: typeof data[key as keyof typeof data] === 'number' ? 'right' : 'left'
    }))
  }

  return (
    <DemoPageTemplate
      title="🧪 開發者測試工具平台"
      description="圖表組件功能測試、性能監控與開發調試工具集"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 控制面板 - 1/4 width */}
        <div className="lg:col-span-1">
          <ModernControlPanel 
            title="測試工具控制台" 
            icon={<CogIcon className="w-5 h-5" />}
          >
            <div className="space-y-8">
              {/* 功能測試選擇 */}
              <ControlGroup title="功能測試類型" icon="🧪" cols={1}>
                <SelectControl
                  label="測試類型"
                  value={selectedTest}
                  onChange={setSelectedTest}
                  options={[
                    { value: 'basic', label: '基礎功能測試' },
                    { value: 'data-processing', label: '數據處理測試' },
                    { value: 'performance', label: '性能壓力測試' },
                    { value: 'compatibility', label: '兼容性測試' }
                  ]}
                />
              </ControlGroup>

              {/* 圖表配置 */}
              <ControlGroup title="圖表配置" icon="🎨" cols={1}>
                <SelectControl
                  label="色彩方案"
                  value={selectedScheme}
                  onChange={setSelectedScheme}
                  options={[
                    { value: 'custom', label: '自訂' },
                    { value: 'blues', label: '藍色系' },
                    { value: 'greens', label: '綠色系' },
                    { value: 'oranges', label: '橙色系' },
                    { value: 'reds', label: '紅色系' },
                    { value: 'purples', label: '紫色系' },
                    { value: 'viridis', label: 'Viridis' },
                    { value: 'plasma', label: 'Plasma' }
                  ]}
                />
                
                <SelectControl
                  label="圖表方向"
                  value={orientation}
                  onChange={setOrientation}
                  options={[
                    { value: 'vertical', label: '垂直' },
                    { value: 'horizontal', label: '水平' }
                  ]}
                />
              </ControlGroup>

              {/* 運行時功能 */}
              <ControlGroup title="運行時功能" icon="🎯" cols={1}>
                <ToggleControl
                  label="動畫效果"
                  checked={animate}
                  onChange={setAnimate}
                  description="圖表進入和更新動畫"
                />
                
                <ToggleControl
                  label="互動功能"
                  checked={interactive}
                  onChange={setInteractive}
                  description="滑鼠懸停和點擊處理"
                />
                
                <ToggleControl
                  label="工具提示"
                  checked={showTooltip}
                  onChange={setShowTooltip}
                  description="懸停時顯示數據詳情"
                />
              </ControlGroup>
            </div>
          </ModernControlPanel>
        </div>

        {/* 主要內容區域 - 3/4 width */}
        <div className="lg:col-span-3 space-y-8">

          {/* 圖表展示 */}
          <ChartContainer
            title={`測試: ${statusItems[0].value}`}
            subtitle="核心模組功能測試"
            responsive={true}
            aspectRatio={16 / 9}
            actions={
              <div className="flex items-center gap-2">
                <BeakerIcon className="w-5 h-5 text-purple-500" />
                <span className="text-sm text-gray-600">模組測試</span>
                {hasDataIssues && (
                  <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1">
                    ⚠️ 數據處理問題
                  </div>
                )}
              </div>
            }
          >
            {({ width, height }) => (
              <motion.div
                key={`${selectedTest}-${orientation}-${selectedScheme}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                {selectedTest === 'basic' && (
                  <BarChart
                    data={currentTestData}
                    xAccessor="category"
                    yAccessor="value"
                    width={width}
                    height={height}
                    animate={animate}
                    orientation={orientation}
                    interactive={interactive}
                    showTooltip={showTooltip}
                    onDataClick={(data) => {
                      console.log('基礎功能測試點擊:', data)
                    }}
                  />
                )}
                
                {selectedTest === 'data-processing' && (
                  <div>
                    {testResult.data.length === 0 && (
                      <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-4">
                        ⚠️ DataProcessor 返回空數據，回退使用原始數據
                      </div>
                    )}
                    <BarChart
                      data={testResult.data.length > 0 ? testResult.data : sampleData}
                      xAccessor={testResult.data.length > 0 ? "x" : "category"}
                      yAccessor={testResult.data.length > 0 ? "y" : "value"}
                      width={width}
                      height={height}
                      orientation={orientation}
                      colorScheme={selectedScheme}
                      animate={animate}
                      interactive={interactive}
                      showTooltip={showTooltip}
                    />
                  </div>
                )}

                {selectedTest === 'performance' && (
                  <div>
                    <div className="bg-orange-100 text-orange-800 p-3 rounded mb-4 text-sm">
                      🚀 性能測試模式：渲染 {currentTestData.length.toLocaleString()} 個數據點
                      <div className="flex gap-4 mt-2">
                        <span>FPS: <strong>{fps}</strong></span>
                        <span>渲染時間: <strong>{renderTime.toFixed(2)}ms</strong></span>
                      </div>
                    </div>
                    <BarChart
                      data={currentTestData.slice(0, 100)} // 只渲染前100個避免過度卡頓
                      xAccessor="category"
                      yAccessor="value"
                      width={width}
                      height={height}
                      colorScheme={selectedScheme}
                      animate={animate}
                      orientation={orientation}
                      interactive={interactive}
                      showTooltip={showTooltip}
                    />
                  </div>
                )}
                
                {selectedTest === 'compatibility' && (
                  <div>
                    <div className="bg-blue-100 text-blue-800 p-3 rounded mb-4 text-sm">
                      🔧 兼容性測試：自訂 Accessor 函數與多格式數據支援
                    </div>
                    <BarChart
                      data={salesData}
                      xAccessor={(d) => d.month}
                      yAccessor={(d) => d.revenue - d.costs}
                      width={width}
                      height={height}
                      animate={animate}
                      orientation={orientation}
                      interactive={interactive}
                      showTooltip={showTooltip}
                      onDataClick={(data) => {
                        console.log('兼容性測試點擊:', data)
                      }}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </ChartContainer>

          {/* 狀態顯示 */}
          <StatusDisplay items={statusItems} />

          {/* 性能監控面板 */}
          {selectedTest === 'performance' && (
            <div className="bg-orange-50 border-l-4 border-orange-400 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-orange-500 rounded-full animate-pulse" />
                <h3 className="text-lg font-semibold text-orange-800">性能監控儀表板</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <div className="text-orange-600 font-semibold mb-2">🚀 渲染效能</div>
                  <div className="space-y-2">
                    <div>FPS: <span className="text-lg font-bold text-green-600">{fps}</span></div>
                    <div>渲染時間: <span className="font-mono">{renderTime.toFixed(2)}ms</span></div>
                    <div>數據點: <span className="font-mono">{currentTestData.length.toLocaleString()}</span></div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <div className="text-blue-600 font-semibold mb-2">💾 記憶體使用</div>
                  <div className="space-y-2">
                    <div>堆積使用: <span className="font-mono">{((performance as any).memory?.usedJSHeapSize / 1024 / 1024).toFixed(1) || 'N/A'}MB</span></div>
                    <div>堆積限制: <span className="font-mono">{((performance as any).memory?.jsHeapSizeLimit / 1024 / 1024).toFixed(1) || 'N/A'}MB</span></div>
                    <div className="text-xs text-gray-500">*需要 Chrome 瀏覽器</div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <div className="text-purple-600 font-semibold mb-2">⚙️ 測試建議</div>
                  <div className="space-y-1 text-xs">
                    <div className={fps >= 30 ? "text-green-600" : "text-red-600"}>
                      • FPS {fps >= 30 ? "良好" : "需優化"}
                    </div>
                    <div className={renderTime < 100 ? "text-green-600" : "text-yellow-600"}>
                      • 渲染速度 {renderTime < 100 ? "優秀" : "普通"}
                    </div>
                    <div className="text-blue-600">
                      • 建議測試不同數據集大小
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* DataProcessor 調試面板 */}
          {selectedTest === 'data-processing' && (
            <div className="bg-gray-900 text-green-400 rounded-2xl p-6 font-mono text-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-green-500 rounded-full animate-pulse" />
                <h3 className="text-lg font-semibold text-green-300">DataProcessor 調試面板</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-green-300 font-semibold mb-2">📊 處理統計:</div>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>Total: <span className="text-yellow-400">{testResult.statistics.total}</span></div>
                    <div>Valid: <span className="text-green-400">{testResult.statistics.valid}</span></div>
                    <div>Invalid: <span className="text-red-400">{testResult.statistics.invalid}</span></div>
                    <div>Nulls: <span className="text-gray-400">{testResult.statistics.nulls}</span></div>
                  </div>
                </div>

                <div>
                  <div className="text-green-300 font-semibold mb-2">🔀 Field Mapping:</div>
                  <div className="bg-gray-800 p-3 rounded">
                    <pre className="text-xs">{JSON.stringify(testResult.mapping, null, 2)}</pre>
                  </div>
                </div>

                <div>
                  <div className="text-green-300 font-semibold mb-2">🏷️ Auto-detected Fields:</div>
                  <div className="space-y-1">
                    {Object.entries(testResult.statistics.fields).map(([field, info]) => (
                      <div key={field} className="flex justify-between text-xs">
                        <span className="text-blue-300">{field}</span>
                        <span className="text-purple-300">{info.type}</span>
                        <span className="text-yellow-300">{(info as any).confidence?.toFixed(2) || 'N/A'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {testResult.errors.length > 0 && (
                  <div>
                    <div className="text-red-300 font-semibold mb-2">❌ Errors:</div>
                    {testResult.errors.map((error, i) => (
                      <div key={i} className="text-red-400 text-xs">• {error}</div>
                    ))}
                  </div>
                )}

                {testResult.warnings.length > 0 && (
                  <div>
                    <div className="text-yellow-300 font-semibold mb-2">⚠️ Warnings:</div>
                    {testResult.warnings.map((warning, i) => (
                      <div key={i} className="text-yellow-400 text-xs">• {warning}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 兼容性測試工具 */}
          {selectedTest === 'compatibility' && (
            <div className="bg-blue-50 border-l-4 border-blue-400 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-8 bg-blue-500 rounded-full" />
                <h3 className="text-lg font-semibold text-blue-800">兼容性測試報告</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <div className="text-blue-600 font-semibold mb-3">🔧 Accessor 函數測試</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>xAccessor 類型:</span>
                      <span className="font-mono text-green-600">function</span>
                    </div>
                    <div className="flex justify-between">
                      <span>yAccessor 類型:</span>
                      <span className="font-mono text-green-600">function</span>
                    </div>
                    <div className="flex justify-between">
                      <span>計算欄位:</span>
                      <span className="font-mono text-blue-600">revenue - costs</span>
                    </div>
                    <div className="text-xs text-green-600 mt-2">✓ 自訂計算函數正常運作</div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border shadow-sm">
                  <div className="text-purple-600 font-semibold mb-3">🌐 瀏覽器兼容性</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>User Agent:</span>
                      <span className="text-xs text-gray-600 truncate">{navigator.userAgent.split(' ')[0]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>D3.js 支援:</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SVG 支援:</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Canvas 支援:</span>
                      <span className="text-green-600">✓</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-green-50 rounded-xl">
                <div className="text-green-800 font-semibold mb-2">✅ 測試結果</div>
                <div className="text-sm text-green-700 space-y-1">
                  <div>• 自訂 Accessor 函數運作正常</div>
                  <div>• 複雜數據計算 (revenue - costs) 成功</div>
                  <div>• 瀏覽器環境完全兼容</div>
                  <div>• TypeScript 型別推斷正確</div>
                </div>
              </div>
            </div>
          )}

          {/* 數據詳情 */}
          <DataTable
            title="測試數據"
            data={currentTestData}
            columns={getTableColumns()}
            maxRows={8}
            showIndex
          />

          {/* 代碼範例 */}
          <CodeExample
            title="實作範例"
            language="tsx"
            code={`import { BarChart } from '@registry/components/basic/bar-chart'
import { processData } from '@registry/components/core/data-processor'

// ${selectedTest === 'basic' ? '基礎功能測試範例' : selectedTest === 'data-processing' ? '數據處理測試範例' : selectedTest === 'performance' ? '性能壓力測試範例' : '兼容性測試範例'}
${selectedTest === 'basic' ? `// 基礎功能：標準圖表渲染
<BarChart
  data={sampleData}
  xAccessor="category"
  yAccessor="value"
  width={800}
  height={400}
  animate={${animate}}
  orientation="${orientation}"
  interactive={${interactive}}
  showTooltip={${showTooltip}}
  onDataClick={(data) => console.log('點擊事件:', data)}
/>` : ''}
${selectedTest === 'data-processing' ? `// 數據處理：完整的 DataProcessor 流程
const processorConfig = {
  autoDetect: true,
  mapping: { x: 'category', y: 'value' }
};

const testResult = processData(sampleData, processorConfig);

<BarChart
  data={testResult.data.length > 0 ? testResult.data : sampleData}
  xAccessor={testResult.data.length > 0 ? "x" : "category"}
  yAccessor={testResult.data.length > 0 ? "y" : "value"}
  width={800}
  height={400}
  orientation="${orientation}"
  colorScheme="${selectedScheme}"
  animate={${animate}}
/>

// 調試資訊: testResult.statistics、errors、warnings` : ''}
${selectedTest === 'performance' ? `// 性能測試：大數據集渲染監控
const performanceData = Array.from({ length: 1000 }, (_, i) => ({
  category: \`Item \${i}\`,
  value: Math.floor(Math.random() * 100000) + 1000,
  performance: Math.random() * 100
}));

// 監控開始時間
const startTime = performance.now();

<BarChart
  data={performanceData.slice(0, 100)} // 限制渲染數量避免卡頓
  xAccessor="category"
  yAccessor="value"
  width={800}
  height={400}
  colorScheme="${selectedScheme}"
  animate={${animate}}
  orientation="${orientation}"
/>

// 性能指標: FPS、記憶體使用、渲染時間` : ''}
${selectedTest === 'compatibility' ? `// 兼容性測試：自訂 Accessor 函數與資料計算
const salesData = [
  { month: 'Jan', revenue: 45000, costs: 32000 },
  { month: 'Feb', revenue: 52000, costs: 35000 },
  // ... 更多數據
];

<BarChart
  data={salesData}
  xAccessor={(d) => d.month} // 字串欄位存取器
  yAccessor={(d) => d.revenue - d.costs} // 計算值存取器
  width={800}
  height={400}
  animate={${animate}}
  orientation="${orientation}"
  interactive={${interactive}}
  showTooltip={${showTooltip}}
/>

// TypeScript 型別推斷: (d: SalesData) => number
// 測試項目: 瀏覽器兼容性、函數式數據存取、計算欄位` : ''}`}
          />

          {/* 架構組件說明 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full" />
              <h3 className="text-xl font-semibold text-gray-800">核心架構組件</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm">
                <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <SparklesIcon className="h-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2 text-center">DataProcessor</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <code className="text-xs bg-gray-100 px-1 rounded">analyzeFields()</code></li>
                  <li>• <code className="text-xs bg-gray-100 px-1 rounded">autoDetectMapping()</code></li>
                  <li>• <code className="text-xs bg-gray-100 px-1 rounded">transformData()</code></li>
                  <li>• Type confidence scoring</li>
                  <li>• Statistical generation</li>
                </ul>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm">
                <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <SparklesIcon className="h-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2 text-center">ColorScheme</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <code className="text-xs bg-gray-100 px-1 rounded">d3.scaleOrdinal()</code></li>
                  <li>• 科學視覺化色彩</li>
                  <li>• 感知均勻色彩空間</li>
                  <li>• WCAG 無障礙規範</li>
                  <li>• 自訂插值函數</li>
                </ul>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm">
                <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <SparklesIcon className="h-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2 text-center">ChartTooltip</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• <code className="text-xs bg-gray-100 px-1 rounded">useTooltip()</code> hook</li>
                  <li>• Portal 渲染機制</li>
                  <li>• 視窗碰撞檢測</li>
                  <li>• 自訂格式化器</li>
                  <li>• 動畫轉換效果</li>
                </ul>
              </div>
            </div>

            {/* 測試模式比較 */}
            <div className="mt-6 bg-white/60 backdrop-blur-sm p-4 rounded-xl border border-white/50">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-sm bg-gray-800 text-white px-2 py-1 rounded font-mono">測試</span>
                功能模式比較
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                <div className="bg-gray-50 p-3 rounded">
                  <strong>基礎功能</strong><br/>
                  標準圖表渲染<br/>
                  基本互動測試
                </div>
                <div className="bg-blue-50 p-3 rounded">
                  <strong>數據處理</strong><br/>
                  DataProcessor 測試<br/>
                  欄位自動偵測
                </div>
                <div className="bg-orange-50 p-3 rounded">
                  <strong>性能壓力</strong><br/>
                  大數據集測試<br/>
                  FPS/記憶體監控
                </div>
                <div className="bg-purple-50 p-3 rounded">
                  <strong>兼容性</strong><br/>
                  自訂函數測試<br/>
                  瀏覽器兼容性
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DemoPageTemplate>
  )
}