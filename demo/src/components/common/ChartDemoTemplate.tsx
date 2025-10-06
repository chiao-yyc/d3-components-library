import React, { ReactNode } from 'react'
import { ChartDemoConfig, DatasetOption } from '../../hooks/useChartDemo'
import InteractiveTutorial from '../InteractiveTutorial'
import { ChartBarIcon } from '@heroicons/react/24/outline'

// === 教學步驟介面 ===
export interface TutorialStep {
  title: string
  content: string
  code?: string
  highlight?: string
}

// === 模板配置介面 ===
export interface ChartDemoTemplateProps<T = any> {
  // 基本資訊
  title: string
  description?: string
  children: ReactNode // 圖表組件
  
  // 資料和配置
  datasetOptions: DatasetOption<T>[]
  selectedDataset: string
  onDatasetChange: (dataset: string) => void
  config: ChartDemoConfig
  onConfigChange: (config: Partial<ChartDemoConfig>) => void
  currentDataset: DatasetOption<T>
  
  // 教學內容
  tutorialSteps?: TutorialStep[]
  
  // 自訂控制項
  customControls?: ReactNode
  
  // 顯示選項
  showDataTable?: boolean
  showCodeExample?: boolean
  codeExample?: string
}

// === 顏色方案配置 ===
const colorSchemes = {
  default: ['#3b82f6'],
  blue: ['#1e40af', '#3b82f6', '#60a5fa'],
  green: ['#059669', '#10b981', '#34d399'],
  red: ['#dc2626', '#ef4444', '#f87171'],
  purple: ['#7c3aed', '#8b5cf6', '#a78bfa'],
  gradient: ['#f59e0b', '#f97316', '#ef4444', '#ec4899', '#8b5cf6'],
  rainbow: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6']
}

export function ChartDemoTemplate<T = any>({
  title,
  description,
  children,
  datasetOptions,
  selectedDataset,
  onDatasetChange,
  config,
  onConfigChange,
  currentDataset,
  tutorialSteps = [],
  customControls,
  showDataTable = true,
  showCodeExample = true,
  codeExample
}: ChartDemoTemplateProps<T>) {
  
  const handleColorChange = (colorKey: string) => {
    const colors = colorSchemes[colorKey as keyof typeof colorSchemes]
    onConfigChange({ colors })
  }

  const selectedColorKey = Object.keys(colorSchemes).find(key => 
    JSON.stringify(colorSchemes[key as keyof typeof colorSchemes]) === JSON.stringify(config.colors)
  ) || 'default'

  return (
    <div className="px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* 頁面標題 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
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
                    onChange={(e) => onDatasetChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {datasetOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {currentDataset.description && (
                    <p className="text-xs text-gray-500 mt-1">{currentDataset.description}</p>
                  )}
                </div>

                {/* 顏色方案 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    顏色方案
                  </label>
                  <select 
                    value={selectedColorKey} 
                    onChange={(e) => handleColorChange(e.target.value)}
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
                    寬度: {config.width}px
                  </label>
                  <input
                    type="range"
                    min="400"
                    max="800"
                    value={config.width}
                    onChange={(e) => onConfigChange({ width: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    高度: {config.height}px
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="600"
                    value={config.height}
                    onChange={(e) => onConfigChange({ height: Number(e.target.value) })}
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
                        value={config.margin?.top || 20}
                        onChange={(e) => onConfigChange({ 
                          margin: { ...config.margin, top: Number(e.target.value) } 
                        })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">右</label>
                      <input
                        type="number"
                        value={config.margin?.right || 30}
                        onChange={(e) => onConfigChange({ 
                          margin: { ...config.margin, right: Number(e.target.value) } 
                        })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">下</label>
                      <input
                        type="number"
                        value={config.margin?.bottom || 40}
                        onChange={(e) => onConfigChange({ 
                          margin: { ...config.margin, bottom: Number(e.target.value) } 
                        })}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">左</label>
                      <input
                        type="number"
                        value={config.margin?.left || 50}
                        onChange={(e) => onConfigChange({ 
                          margin: { ...config.margin, left: Number(e.target.value) } 
                        })}
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
                        checked={config.showGrid}
                        onChange={(e) => onConfigChange({ showGrid: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">顯示網格</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showAxis}
                        onChange={(e) => onConfigChange({ showAxis: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">顯示軸線</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.showTooltip}
                        onChange={(e) => onConfigChange({ showTooltip: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">顯示提示</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.animate}
                        onChange={(e) => onConfigChange({ animate: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">動畫效果</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={config.interactive}
                        onChange={(e) => onConfigChange({ interactive: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">互動功能</span>
                    </label>
                  </div>
                </div>

                {/* 自訂控制項 */}
                {customControls && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      進階設定
                    </label>
                    {customControls}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 圖表顯示區 */}
          <div className="lg:col-span-2">
            {tutorialSteps.length > 0 ? (
              <InteractiveTutorial
                title={
                  <span className="flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5" />
                    圖表互動教學
                  </span>
                }
                steps={tutorialSteps}
              >
                <div className="flex justify-center">
                  <div className="bg-white rounded-lg p-6 border">
                    {children}
                  </div>
                </div>
              </InteractiveTutorial>
            ) : (
              <div className="flex justify-center">
                <div className="bg-white rounded-lg p-6 border">
                  {children}
                </div>
              </div>
            )}

            {/* 資料預覽 */}
            {showDataTable && (
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
                      {currentDataset.data.slice(0, 10).map((item, index) => (
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
                  {currentDataset.data.length > 10 && (
                    <p className="text-sm text-gray-500 mt-2">
                      顯示前 10 筆，共 {currentDataset.data.length} 筆資料
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* 程式碼範例 */}
            {showCodeExample && codeExample && (
              <div className="bg-white p-6 rounded-lg shadow-sm border mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  程式碼範例
                </h3>
                <pre className="bg-gray-50 rounded-lg p-4 overflow-x-auto text-sm">
                  <code>{codeExample}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}