import React, { useState } from 'react'
import { ResponsiveChartContainer } from '@registry/components/primitives/canvas/responsive-chart-container'
import { DemoPageTemplate, ContentSection, ModernControlPanel, ControlGroup, RangeSlider } from '../components/ui'

const SimpleChart: React.FC<{ width: number; height: number; title: string }> = ({ width, height, title }) => {
  return (
    <div className="relative">
      <svg width={width} height={height} style={{ border: '2px solid #3b82f6' }}>
        <rect width={width} height={height} fill="#f3f4f6" />
        <rect x={20} y={20} width={width - 40} height={height - 40} fill="#3b82f6" opacity={0.2} />
        <text x={width / 2} y={height / 2} textAnchor="middle" className="text-sm font-medium fill-gray-700">
          {title}
        </text>
        <text x={width / 2} y={height / 2 + 20} textAnchor="middle" className="text-xs fill-gray-500">
          {width} × {height}
        </text>
      </svg>
      <div className="absolute top-2 right-2 bg-white rounded px-2 py-1 text-xs border">
        {width} × {height}
      </div>
    </div>
  )
}

export default function ResponsiveTestDemo() {
  const [containerWidth, setContainerWidth] = useState(80) // 百分比
  const [aspect, setAspect] = useState(16/9)
  const [minWidth, setMinWidth] = useState(300)
  
  return (
    <DemoPageTemplate
      title="響應式容器測試"
      description="測試 ResponsiveChartContainer 的基本功能"
    >
      {/* 控制面板 */}
      <ContentSection>
        <ModernControlPanel title="測試控制">
          <ControlGroup title="容器設定" cols={3}>
            <RangeSlider
              label="容器寬度"
              value={containerWidth}
              min={30}
              max={100}
              step={10}
              onChange={setContainerWidth}
              suffix="%"
            />
            
            <RangeSlider
              label="寬高比"
              value={aspect}
              min={1}
              max={3}
              step={0.1}
              onChange={setAspect}
              suffix=":1"
            />
            
            <RangeSlider
              label="最小寬度"
              value={minWidth}
              min={200}
              max={500}
              step={50}
              onChange={setMinWidth}
              suffix="px"
            />
          </ControlGroup>
        </ModernControlPanel>
      </ContentSection>

      {/* 響應式測試 */}
      <ContentSection delay={0.1}>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4">響應式圖表測試</h3>
          
          <div className="space-y-6">
            <div className="text-sm text-gray-600 mb-2">
              容器寬度: {containerWidth}% | 寬高比: {aspect.toFixed(1)}:1 | 最小寬度: {minWidth}px
            </div>
            
            <div 
              className="border-2 border-dashed border-gray-300 rounded-lg p-4 transition-all duration-500"
              style={{ width: `${containerWidth}%` }}
            >
              <div className="text-xs text-gray-500 mb-2">響應式容器邊界</div>
              
              <ResponsiveChartContainer
                aspect={aspect}
                minWidth={minWidth}
                maxWidth={800}
                minHeight={200}
                className="border border-blue-300"
              >
                {(dimensions) => (
                  <SimpleChart 
                    width={dimensions.width} 
                    height={dimensions.height} 
                    title="響應式圖表"
                  />
                )}
              </ResponsiveChartContainer>
            </div>
          </div>
        </div>
      </ContentSection>

      {/* 固定尺寸對比 */}
      <ContentSection delay={0.2}>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4">固定尺寸對比</h3>
          
          <div 
            className="border-2 border-dashed border-red-300 rounded-lg p-4 overflow-x-auto"
            style={{ width: `${containerWidth}%` }}
          >
            <div className="text-xs text-gray-500 mb-2">固定尺寸容器 (會溢出)</div>
            <SimpleChart width={600} height={300} title="固定尺寸圖表" />
          </div>
        </div>
      </ContentSection>

      {/* 多個響應式圖表 */}
      <ContentSection delay={0.3}>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold mb-4">多圖表佈局測試</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-gray-300 rounded p-3">
              <div className="text-sm font-medium mb-2">圖表 1 (16:9)</div>
              <ResponsiveChartContainer aspect={16/9} minWidth={250} maxWidth={500}>
                {(dimensions) => (
                  <SimpleChart 
                    width={dimensions.width} 
                    height={dimensions.height} 
                    title="A"
                  />
                )}
              </ResponsiveChartContainer>
            </div>
            
            <div className="border border-gray-300 rounded p-3">
              <div className="text-sm font-medium mb-2">圖表 2 (4:3)</div>
              <ResponsiveChartContainer aspect={4/3} minWidth={250} maxWidth={500}>
                {(dimensions) => (
                  <SimpleChart 
                    width={dimensions.width} 
                    height={dimensions.height} 
                    title="B"
                  />
                )}
              </ResponsiveChartContainer>
            </div>
          </div>
        </div>
      </ContentSection>
    </DemoPageTemplate>
  )
}