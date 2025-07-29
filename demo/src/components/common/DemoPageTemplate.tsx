import React, { ReactNode } from 'react'
import { PageHeader } from './PageHeader'
import { ChartContainer } from './ChartContainer'
import { ControlPanel } from './ControlPanel'
import { DataTable } from './DataTable'
import InteractiveTutorial from '../InteractiveTutorial'
import { cn } from '../../utils/cn'

interface DemoPageTemplateProps {
  title: string
  description?: string
  className?: string
  
  // 圖表相關
  chart: ReactNode
  chartTitle?: string
  chartDescription?: string
  chartActions?: ReactNode
  chartStats?: Array<{
    label: string
    value: string | number
    color?: string
    trend?: 'up' | 'down' | 'stable'
  }>
  chartLoading?: boolean
  chartError?: string
  
  // 控制面板
  controls?: ReactNode
  controlsTitle?: string
  controlsCollapsible?: boolean
  
  // 數據表格
  data?: any[]
  dataTableTitle?: string
  dataTableMaxRows?: number
  dataTableExcludeColumns?: string[]
  dataTableFormatters?: { [key: string]: (value: any) => string }
  
  // 教學功能
  tutorial?: Array<{
    title: string
    content: string
    code?: string
    highlight?: string
  }>
  
  // 佈局選項
  layout?: 'default' | 'sidebar' | 'fullwidth'
  showDataTable?: boolean
  
  // 頁面動作
  pageActions?: ReactNode
  
  // 麵包屑
  breadcrumb?: Array<{
    label: string
    href?: string
  }>
}

export function DemoPageTemplate({
  title,
  description,
  className,
  
  // 圖表
  chart,
  chartTitle,
  chartDescription,
  chartActions,
  chartStats,
  chartLoading,
  chartError,
  
  // 控制面板
  controls,
  controlsTitle,
  controlsCollapsible,
  
  // 數據表格
  data,
  dataTableTitle,
  dataTableMaxRows,
  dataTableExcludeColumns,
  dataTableFormatters,
  
  // 教學
  tutorial,
  
  // 佈局
  layout = 'default',
  showDataTable = true,
  
  // 頁面動作
  pageActions,
  
  // 麵包屑
  breadcrumb
}: DemoPageTemplateProps) {
  
  const renderChart = () => {
    const chartElement = tutorial ? (
      <InteractiveTutorial title={chartTitle || title} steps={tutorial}>
        {chart}
      </InteractiveTutorial>
    ) : (
      chart
    )
    
    return (
      <ChartContainer
        title={chartTitle}
        description={chartDescription}
        actions={chartActions}
        stats={chartStats}
        loading={chartLoading}
        error={chartError}
      >
        {chartElement}
      </ChartContainer>
    )
  }
  
  const renderControls = () => {
    if (!controls) return null
    
    return (
      <ControlPanel
        title={controlsTitle}
        collapsible={controlsCollapsible}
        className="sticky top-6"
      >
        {controls}
      </ControlPanel>
    )
  }
  
  const renderDataTable = () => {
    if (!showDataTable || !data || !data.length) return null
    
    return (
      <DataTable
        data={data}
        title={dataTableTitle}
        maxRows={dataTableMaxRows}
        excludeColumns={dataTableExcludeColumns}
        formatters={dataTableFormatters}
      />
    )
  }
  
  if (layout === 'sidebar') {
    return (
      <div className={cn('max-w-7xl mx-auto', className)}>
        <PageHeader
          title={title}
          description={description}
          actions={pageActions}
          breadcrumb={breadcrumb}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* 側邊欄控制面板 */}
          <div className="lg:col-span-1">
            {renderControls()}
          </div>
          
          {/* 主要內容 */}
          <div className="lg:col-span-3 space-y-6">
            {renderChart()}
            {renderDataTable()}
          </div>
        </div>
      </div>
    )
  }
  
  if (layout === 'fullwidth') {
    return (
      <div className={cn('max-w-full mx-auto px-6', className)}>
        <PageHeader
          title={title}
          description={description}
          actions={pageActions}
          breadcrumb={breadcrumb}
        />
        
        <div className="space-y-6">
          {controls && (
            <div className="flex justify-center">
              <div className="w-full max-w-4xl">
                {renderControls()}
              </div>
            </div>
          )}
          
          {renderChart()}
          
          {showDataTable && data && (
            <div className="flex justify-center">
              <div className="w-full max-w-6xl">
                {renderDataTable()}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }
  
  // 默認佈局
  return (
    <div className={cn('max-w-7xl mx-auto', className)}>
      <PageHeader
        title={title}
        description={description}
        actions={pageActions}
        breadcrumb={breadcrumb}
      />
      
      <div className="space-y-6">
        {/* 控制面板 */}
        {controls && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {renderControls()}
            </div>
          </div>
        )}
        
        {/* 圖表容器 */}
        {renderChart()}
        
        {/* 數據表格 */}
        {renderDataTable()}
      </div>
    </div>
  )
}

// 預設配置的變體
export function SimpleDemoPage({
  title,
  description,
  chart,
  data,
  controls,
  ...rest
}: Omit<DemoPageTemplateProps, 'layout'> & {
  layout?: never
}) {
  return (
    <DemoPageTemplate
      title={title}
      description={description}
      chart={chart}
      data={data}
      controls={controls}
      layout="default"
      {...rest}
    />
  )
}

export function SidebarDemoPage({
  title,
  description,
  chart,
  data,
  controls,
  ...rest
}: Omit<DemoPageTemplateProps, 'layout'> & {
  layout?: never
}) {
  return (
    <DemoPageTemplate
      title={title}
      description={description}
      chart={chart}
      data={data}
      controls={controls}
      layout="sidebar"
      {...rest}
    />
  )
}

export function FullwidthDemoPage({
  title,
  description,
  chart,
  data,
  controls,
  ...rest
}: Omit<DemoPageTemplateProps, 'layout'> & {
  layout?: never
}) {
  return (
    <DemoPageTemplate
      title={title}
      description={description}
      chart={chart}
      data={data}
      controls={controls}
      layout="fullwidth"
      {...rest}
    />
  )
}