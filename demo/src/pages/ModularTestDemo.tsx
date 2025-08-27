import { useState } from 'react'
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
  const [selectedTest, setSelectedTest] = useState<'basic' | 'modular' | 'mapping' | 'accessor'>('basic')
  const [showTooltip, setShowTooltip] = useState(true)
  const [interactive, setInteractive] = useState(true)

  // 測試資料處理
  const testResult = processData(sampleData, { autoDetect: true })
  console.log('Data processor test:', testResult)

  // 獲取當前測試數據
  const getCurrentTestData = () => {
    switch (selectedTest) {
      case 'basic':
      case 'modular':
        return sampleData
      case 'mapping':
        return testResult.data
      case 'accessor':
        return salesData
      default:
        return sampleData
    }
  }

  const currentTestData = getCurrentTestData()

  // 狀態顯示數據
  const statusItems = [
    { label: '測試類型', value: selectedTest === 'basic' ? '基本數據處理' : selectedTest === 'modular' ? '模組化版本' : selectedTest === 'mapping' ? '欄位映射' : 'Accessor 函數' },
    { label: '數據點數', value: currentTestData.length },
    { label: '顏色方案', value: selectedScheme },
    { label: '方向', value: orientation === 'vertical' ? '垂直' : '水平' },
    { label: '動畫', value: animate ? '開啟' : '關閉', color: animate ? '#10b981' : '#6b7280' }
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
      title="🧪 模組化核心測試平台"
      description="測試新的核心模組：data-processor, color-scheme, chart-tooltip"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* 控制面板 - 1/4 width */}
        <div className="lg:col-span-1">
          <ModernControlPanel 
            title="測試配置" 
            icon={<CogIcon className="w-5 h-5" />}
          >
            <div className="space-y-8">
              {/* 測試類型選擇 */}
              <ControlGroup title="測試類型" icon="🧪" cols={1}>
                <SelectControl
                  label="測試模式"
                  value={selectedTest}
                  onChange={setSelectedTest}
                  options={[
                    { value: 'basic', label: '基本數據處理' },
                    { value: 'modular', label: '模組化版本' },
                    { value: 'mapping', label: '欄位映射' },
                    { value: 'accessor', label: 'Accessor 函數' }
                  ]}
                />
              </ControlGroup>

              {/* 基本設定 */}
              <ControlGroup title="基本設定" icon="⚙️" cols={1}>
                <SelectControl
                  label="顏色方案"
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

              {/* 交互功能 */}
              <ControlGroup title="交互功能" icon="🎯" cols={1}>
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
                  description="鼠標懸停和點擊交互"
                />
                
                <ToggleControl
                  label="顯示提示"
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
                    data={sampleData}
                    width={width}
                    height={height}
                    animate={animate}
                    orientation={orientation}
                    interactive={interactive}
                    showTooltip={showTooltip}
                    onDataClick={(data) => {
                      console.log('Basic test clicked:', data)
                    }}
                  />
                )}
                
                {selectedTest === 'modular' && (
                  <BarChart
                    data={sampleData}
                    width={width}
                    height={height}
                    colorScheme={selectedScheme}
                    animate={animate}
                    orientation={orientation}
                    interactive={interactive}
                    showTooltip={showTooltip}
                    onDataClick={(data) => {
                      console.log('Modular test clicked:', data)
                    }}
                  />
                )}
                
                {selectedTest === 'mapping' && (
                  <BarChart
                    data={testResult.data}
                    mapping={{
                      x: 'category',
                      y: 'value'
                    }}
                    width={width}
                    height={height}
                    orientation={orientation}
                    colorScheme={selectedScheme}
                    animate={animate}
                    interactive={interactive}
                    showTooltip={showTooltip}
                  />
                )}
                
                {selectedTest === 'accessor' && (
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
                  />
                )}
              </motion.div>
            )}
          </ChartContainer>

          {/* 狀態顯示 */}
          <StatusDisplay items={statusItems} />

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
            title="使用範例"
            language="tsx"
            code={`import { BarChart } from '@registry/components/basic/bar-chart'
import { processData } from '@registry/components/core/data-processor'

// ${selectedTest === 'basic' ? '基本數據處理測試' : selectedTest === 'modular' ? '模組化版本測試' : selectedTest === 'mapping' ? '欄位映射測試' : 'Accessor 函數測試'}
${selectedTest === 'basic' ? `<BarChart
  data={sampleData}
  width={800}
  height={400}
  animate={${animate}}
  orientation="${orientation}"
  interactive={${interactive}}
  showTooltip={${showTooltip}}
  onDataClick={(data) => console.log('Clicked:', data)}
/>` : ''}
${selectedTest === 'modular' ? `<BarChart
  data={sampleData}
  width={800}
  height={400}
  colorScheme="${selectedScheme}"
  animate={${animate}}
  orientation="${orientation}"
  interactive={${interactive}}
  showTooltip={${showTooltip}}
  onDataClick={(data) => console.log('Clicked:', data)}
/>` : ''}
${selectedTest === 'mapping' ? `const testResult = processData(sampleData, { autoDetect: true })

<BarChart
  data={testResult.data}
  mapping={{
    x: 'category',
    y: 'value'
  }}
  width={800}
  height={400}
  orientation="${orientation}"
  colorScheme="${selectedScheme}"
  animate={${animate}}
/>` : ''}
${selectedTest === 'accessor' ? `<BarChart
  data={salesData}
  xAccessor={(d) => d.month}
  yAccessor={(d) => d.revenue - d.costs}
  width={800}
  height={400}
  animate={${animate}}
  orientation="${orientation}"
/>` : ''}`}
          />

          {/* 功能說明 */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-2 h-8 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-full" />
              <h3 className="text-xl font-semibold text-gray-800">核心模組功能</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm">
                <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <SparklesIcon className="h-5 h-5 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2 text-center">data-processor</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 自動欄位偵測</li>
                  <li>• 多種映射方式</li>
                  <li>• 資料清理和轉換</li>
                  <li>• 統計資訊生成</li>
                </ul>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm">
                <div className="bg-green-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <SparklesIcon className="h-5 h-5 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2 text-center">color-scheme</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 多種預設調色板</li>
                  <li>• 科學可視化色彩</li>
                  <li>• 色彩插值</li>
                  <li>• 無障礙支援</li>
                </ul>
              </div>
              
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/50 shadow-sm">
                <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <SparklesIcon className="h-5 h-5 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-800 mb-2 text-center">chart-tooltip</h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 自動位置調整</li>
                  <li>• 多種顯示模式</li>
                  <li>• 動畫效果</li>
                  <li>• React Hook 整合</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DemoPageTemplate>
  )
}