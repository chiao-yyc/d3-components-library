import React from 'react'
import { BarChart } from '../components/ui'
import { useBarChartDemo } from '../hooks/useChartDemo'
import { ChartDemoTemplate, type TutorialStep } from '../components/common/ChartDemoTemplate'
import { ChartWrapper } from '../components/common/ErrorBoundary'
import { DataGeneratorUtils } from '../data/data-generators'

// === 教學步驟配置 ===
const tutorialSteps: TutorialStep[] = [
  {
    title: "認識長條圖組件",
    content: "長條圖是最常用的圖表類型之一，用於比較不同類別的數值。在左側控制面板中，你可以調整各種參數來自定義圖表的外觀和行為。",
    highlight: "嘗試更改資料集選項，觀察圖表如何即時更新"
  },
  {
    title: "調整圖表尺寸",
    content: "使用寬度和高度滑桿來調整圖表的尺寸。這對於適應不同的容器或螢幕尺寸非常有用。",
    code: `<BarChart
  data={data}
  width={600}
  height={400}
/>`,
    highlight: "寬度建議在 400-1200 像素之間，高度建議在 300-800 像素之間"
  },
  {
    title: "自定義顏色方案",
    content: "選擇不同的顏色方案來匹配你的設計風格。每個方案都經過精心設計，確保良好的視覺效果和無障礙性。",
    highlight: "顏色方案不僅影響美觀，也會影響圖表的可讀性"
  },
  {
    title: "配置互動功能",
    content: "啟用提示框、網格線等功能來增強用戶體驗。這些互動元素讓用戶能更好地理解數據。",
    code: `<BarChart
  data={data}
  showTooltip={true}
  showGrid={true}
  interactive={true}
/>`,
    highlight: "提示框會在滑鼠懸停時顯示詳細的數據信息"
  }
]

// === 程式碼範例 ===
const codeExample = `import { BarChart } from '../components/ui'
import { useBarChartDemo } from '../hooks/useChartDemo'
import { DataGeneratorUtils } from '../data/data-generators'

function MyBarChartDemo() {
  const datasetOptions = DataGeneratorUtils.getDatasetsByType('barChart')
  const {
    barChartProps,
    orientation,
    setOrientation,
    showLabels,
    setShowLabels
  } = useBarChartDemo(datasetOptions)

  return (
    <BarChart
      {...barChartProps}
      orientation={orientation}
      showLabels={showLabels}
    />
  )
}`

export default function BarChartDemoV2() {
  // 使用統一的資料生成器
  const datasetOptions = DataGeneratorUtils.getDatasetsByType('barChart')
  
  // 使用專用的 Hook 管理狀態
  const {
    selectedDataset,
    setSelectedDataset,
    config,
    updateConfig,
    currentDataset,
    barChartProps,
    orientation,
    setOrientation,
    showLabels,
    setShowLabels,
    labelPosition,
    setLabelPosition
  } = useBarChartDemo(datasetOptions)

  // 自訂控制項 - 長條圖特有的配置
  const customControls = (
    <div className="space-y-4">
      {/* 方向選擇 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          方向
        </label>
        <select 
          value={orientation} 
          onChange={(e) => setOrientation(e.target.value as 'vertical' | 'horizontal')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="vertical">垂直</option>
          <option value="horizontal">水平</option>
        </select>
      </div>

      {/* 標籤設定 */}
      <div>
        <label className="flex items-center mb-2">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
            className="mr-2"
          />
          <span className="text-sm text-gray-700">顯示標籤</span>
        </label>
        
        {showLabels && (
          <select 
            value={labelPosition} 
            onChange={(e) => setLabelPosition(e.target.value as 'top' | 'center' | 'bottom')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="top">頂部</option>
            <option value="center">中央</option>
            <option value="bottom">底部</option>
          </select>
        )}
      </div>
    </div>
  )

  return (
    <ChartDemoTemplate
      title="長條圖組件 Demo V2"
      description="使用統一架構重構的長條圖 Demo，展示新的開發模式"
      datasetOptions={datasetOptions}
      selectedDataset={selectedDataset}
      onDatasetChange={setSelectedDataset}
      config={config}
      onConfigChange={updateConfig}
      currentDataset={currentDataset}
      tutorialSteps={tutorialSteps}
      customControls={customControls}
      codeExample={codeExample}
      showDataTable={true}
      showCodeExample={true}
    >
      <ChartWrapper
        isEmpty={!currentDataset.data || currentDataset.data.length === 0}
        emptyTitle="無長條圖資料"
        emptyDescription="請選擇一個包含資料的資料集"
      >
        <BarChart
          {...barChartProps}
          orientation={orientation}
          showLabels={showLabels}
          labelPosition={labelPosition}
        />
      </ChartWrapper>
    </ChartDemoTemplate>
  )
}