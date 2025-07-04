import { useState } from 'react'
import { BarChart } from '@registry/components/bar-chart/bar-chart'
import { datasetOptions, colorSchemes } from '../data/sample-data'

function BarChartDemo() {
  const [selectedDataset, setSelectedDataset] = useState('basic')
  const [selectedColor, setSelectedColor] = useState('default')
  const [chartWidth, setChartWidth] = useState(600)
  const [chartHeight, setChartHeight] = useState(400)
  const [showGrid, setShowGrid] = useState(true)
  const [showAxis, setShowAxis] = useState(true)
  const [showTooltip, setShowTooltip] = useState(true)
  const [margin, setMargin] = useState({ top: 20, right: 30, bottom: 40, left: 40 })

  const currentDataset = datasetOptions.find(d => d.value === selectedDataset)!

  return (
    <div className="px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            長條圖組件 Demo
          </h1>
          <p className="text-gray-600">
            即時調整參數，預覽組件效果
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 控制面板 */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                控制面板
              </h3>
              
              <div className="space-y-6">
                {/* 資料集選擇 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    資料集
                  </label>
                  <select 
                    value={selectedDataset} 
                    onChange={(e) => setSelectedDataset(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {datasetOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 顏色方案 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    顏色方案
                  </label>
                  <select 
                    value={selectedColor} 
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.keys(colorSchemes).map(scheme => (
                      <option key={scheme} value={scheme}>
                        {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 尺寸設定 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    寬度: {chartWidth}px
                  </label>
                  <input
                    type="range"
                    min="400"
                    max="800"
                    value={chartWidth}
                    onChange={(e) => setChartWidth(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    高度: {chartHeight}px
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="600"
                    value={chartHeight}
                    onChange={(e) => setChartHeight(Number(e.target.value))}
                    className="w-full"
                  />
                </div>

                {/* 邊距設定 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    邊距設定
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">上</label>
                      <input
                        type="number"
                        value={margin.top}
                        onChange={(e) => setMargin(prev => ({ ...prev, top: Number(e.target.value) }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">右</label>
                      <input
                        type="number"
                        value={margin.right}
                        onChange={(e) => setMargin(prev => ({ ...prev, right: Number(e.target.value) }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">下</label>
                      <input
                        type="number"
                        value={margin.bottom}
                        onChange={(e) => setMargin(prev => ({ ...prev, bottom: Number(e.target.value) }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">左</label>
                      <input
                        type="number"
                        value={margin.left}
                        onChange={(e) => setMargin(prev => ({ ...prev, left: Number(e.target.value) }))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* 功能開關 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    功能開關
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={showGrid}
                        onChange={(e) => setShowGrid(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">顯示網格</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={showAxis}
                        onChange={(e) => setShowAxis(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">顯示軸線</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={showTooltip}
                        onChange={(e) => setShowTooltip(e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">顯示提示</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 圖表顯示區 */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                圖表預覽
              </h3>
              
              <div className="flex justify-center">
                <BarChart
                  data={currentDataset.data}
                  xKey={currentDataset.xKey}
                  yKey={currentDataset.yKey}
                  width={chartWidth}
                  height={chartHeight}
                  margin={margin}
                  colors={colorSchemes[selectedColor as keyof typeof colorSchemes]}
                  showGrid={showGrid}
                  showAxis={showAxis}
                  showTooltip={showTooltip}
                />
              </div>
            </div>

            {/* 資料預覽 */}
            <div className="bg-white p-6 rounded-lg shadow-sm border mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                資料預覽
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {currentDataset.xKey}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {currentDataset.yKey}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentDataset.data.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item[currentDataset.xKey as keyof typeof item]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item[currentDataset.yKey as keyof typeof item]}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BarChartDemo