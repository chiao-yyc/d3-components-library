import { useState } from 'react'
import { BarChart } from '@registry/components/basic/bar-chart'
import { processData } from '@registry/components/core/data-processor'

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

  // 測試資料處理
  const testResult = processData(sampleData, { autoDetect: true })
  console.log('Data processor test:', testResult)

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* 標題 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          🧪 模組化核心測試平台
        </h1>
        <p className="text-gray-600">
          測試新的核心模組：data-processor, color-scheme, chart-tooltip
        </p>
      </div>

      {/* 控制面板 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          組件配置
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 顏色方案 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              顏色方案
            </label>
            <select
              value={selectedScheme}
              onChange={(e) => setSelectedScheme(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="custom">自訂</option>
              <option value="blues">藍色系</option>
              <option value="greens">綠色系</option>
              <option value="oranges">橙色系</option>
              <option value="reds">紅色系</option>
              <option value="purples">紫色系</option>
              <option value="viridis">Viridis</option>
              <option value="plasma">Plasma</option>
            </select>
          </div>

          {/* 方向 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              方向
            </label>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vertical">垂直</option>
              <option value="horizontal">水平</option>
            </select>
          </div>

          {/* 動畫 */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="animate"
              checked={animate}
              onChange={(e) => setAnimate(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="animate" className="text-sm text-gray-700">
              啟用動畫效果
            </label>
          </div>
        </div>
      </div>

      {/* 測試圖表 1: 基本數據處理 (簡化版本) */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          測試 1: 基本數據處理 (簡化版本)
        </h2>
        <p className="text-gray-600 mb-4">
          使用簡化的 BarChart，X軸: category, Y軸: value
        </p>
        
        <div className="flex justify-center">
          <BarChart
            data={sampleData}
            width={600}
            height={400}
            animate={animate}
            orientation={orientation}
            onDataClick={(data) => {
              console.log('Clicked:', data)
              alert(`點擊了: ${data.category} - ${data.value}`)
            }}
          />
        </div>
      </div>

      {/* 測試圖表 1.5: 模組化版本 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          測試 1.5: 模組化版本 (data-processor)
        </h2>
        <p className="text-gray-600 mb-4">
          使用新的核心模組，X軸: category, Y軸: value
        </p>
        
        <div className="flex justify-center">
          <BarChart
            data={sampleData}
            width={600}
            height={400}
            colorScheme={selectedScheme}
            animate={animate}
            orientation={orientation}
            onDataClick={(data) => {
              console.log('Clicked:', data)
              alert(`點擊了: ${data.category} - ${data.value}`)
            }}
          />
        </div>
      </div>

      {/* 測試圖表 2: 指定欄位映射 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          測試 2: 指定欄位映射 (mapping)
        </h2>
        <p className="text-gray-600 mb-4">
          使用 mapping 指定 X軸: month, Y軸: revenue
        </p>
        
        <div className="flex justify-center">
          <BarChart
            data={testResult.data}
            mapping={{
              x: 'category', // Assuming 'category' is the x-axis for sampleData
              y: 'value'     // Assuming 'value' is the y-axis for sampleData
            }}
            width={600}
            height={400}
            orientation={orientation}
            colorScheme={selectedScheme}
            animate={animate}
          />
        </div>
      </div>

      {/* 測試圖表 3: Accessor 函數 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          測試 3: Accessor 函數處理
        </h2>
        <p className="text-gray-600 mb-4">
          使用 accessor 函數計算利潤: revenue - costs
        </p>
        
        <div className="flex justify-center">
          <BarChart
            data={salesData}
            xAccessor={(d) => d.month}
            yAccessor={(d) => d.revenue - d.costs}
            width={600}
            height={400}
            animate={animate}
            orientation={orientation}
          />
        </div>
      </div>

      {/* 模組資訊 */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          使用的核心模組
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">data-processor</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 自動欄位偵測</li>
              <li>• 多種映射方式</li>
              <li>• 資料清理和轉換</li>
              <li>• 統計資訊生成</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">color-scheme</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 多種預設調色板</li>
              <li>• 科學可視化色彩</li>
              <li>• 色彩插值</li>
              <li>• 無障礙支援</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">chart-tooltip</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• 自動位置調整</li>
              <li>• 多種顯示模式</li>
              <li>• 動畫效果</li>
              <li>• React Hook 整合</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}