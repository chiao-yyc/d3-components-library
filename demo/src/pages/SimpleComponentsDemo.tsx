import { useState } from 'react'
import { AreaChart } from '../../../registry/components/basic/area-chart'
import { SidebarDemoPage } from '../components/common/DemoPageTemplate'
import { ControlPanel, ControlGroup, ControlItem, SelectControl } from '../components/common/ControlPanel'

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

  const charts = [
    { id: 'area', name: '區域圖', component: 'AreaChart' },
    // 其他圖表即將支援...
  ]

  const renderChart = () => {
    if (activeChart === 'area') {
      return (
        <AreaChart 
          data={areaData}
          variant={variant}
          width={800}
          height={400}
          stackMode={stackMode}
          onDataClick={(data) => alert(`點擊了: ${data.series} = ${data.y}`)}
        />
      )
    }
    
    return (
      <div className="text-center py-8 text-gray-500">
        <p>其他圖表正在開發中...</p>
      </div>
    )
  }

  const renderControls = () => {
    return (
      <ControlPanel title="圖表配置">
        <ControlGroup title="圖表類型">
          <ControlItem label="圖表">
            <SelectControl
              value={activeChart}
              onChange={(value) => setActiveChart(value)}
              options={charts.map(c => ({ value: c.id, label: c.name }))}
            />
          </ControlItem>
        </ControlGroup>
        
        <ControlGroup title="變體設定">
          <ControlItem label="變體">
            <SelectControl
              value={variant}
              onChange={(value) => setVariant(value as any)}
              options={[
                { value: 'default', label: '完整版' },
                { value: 'simple', label: '簡化版' },
                { value: 'stacked', label: '堆疊版' },
                { value: 'percent', label: '百分比版' }
              ]}
            />
          </ControlItem>
          
          {activeChart === 'area' && (
            <ControlItem label="堆疊模式">
              <SelectControl
                value={stackMode}
                onChange={(value) => setStackMode(value as any)}
                options={[
                  { value: 'none', label: '無堆疊' },
                  { value: 'stack', label: '堆疊' },
                  { value: 'percent', label: '百分比堆疊' }
                ]}
              />
            </ControlItem>
          )}
        </ControlGroup>
        
        <ControlGroup title="使用說明">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-2">使用方法</h4>
            <pre className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded overflow-x-auto">
{`import { AreaChart } from '@/components/ui/area-chart'

const data = [
  { x: new Date('2024-01-01'), y: 100, series: 'A' },
  { x: new Date('2024-01-02'), y: 120, series: 'A' }
]

<AreaChart 
  data={data} 
  variant="${variant}"
  stackMode="${stackMode}"
/>`}
            </pre>
          </div>
        </ControlGroup>
      </ControlPanel>
    )
  }

  return (
    <SidebarDemoPage
      title="簡化版圖表組件"
      description="專為快速使用和學習而設計的簡化圖表組件，提供最基本但完整的功能。"
      chart={renderChart()}
      chartTitle={`${charts.find(c => c.id === activeChart)?.name} - ${variant} 變體`}
      chartDescription="簡化版組件提供最少的屬性配置，即可創建美觀的圖表。"
      controls={renderControls()}
      data={areaData}
      dataTableTitle="範例數據"
      dataTableMaxRows={10}
      breadcrumb={[
        { label: '首頁', href: '/' },
        { label: '簡化組件' }
      ]}
    />
  )
}