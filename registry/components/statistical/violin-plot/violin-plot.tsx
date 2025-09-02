// 新架構：使用 BaseChartCore + React 包裝層
import React from 'react'
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper'
import { ViolinPlotCore, ViolinPlotCoreConfig } from './core/violin-plot-core'

// 向下兼容：支援舊版 props
import { ViolinPlotProps as LegacyViolinPlotProps } from './types'

// 新的 props 介面
export interface ViolinPlotProps extends ReactChartWrapperProps, ViolinPlotCoreConfig {
  // 新架構不需要額外的 React 專用 props
}

// 創建基於 BaseChartCore 的組件
const ViolinPlotComponent = createReactChartWrapper(ViolinPlotCore)

// 主要導出
export const ViolinPlot = React.forwardRef<ViolinPlotCore, ViolinPlotProps>((props, ref) => {
  // 處理 props 兼容性
  const mergedProps = { ...defaultViolinPlotProps, ...props }
  return <ViolinPlotComponent ref={ref} {...mergedProps} />
})

ViolinPlot.displayName = 'ViolinPlot'

// 向下兼容導出
export const ViolinPlotLegacy = React.forwardRef<ViolinPlotCore, LegacyViolinPlotProps & ViolinPlotProps>((props, ref) => {
  // 將舊版 props 轉換為新版本
  const {
    labelKey,
    valuesKey,
    mapping,
    ...modernProps
  } = props as any

  const finalProps: ViolinPlotProps = {
    ...modernProps,
    // 映射舊版資料存取模式到新版
    labelAccessor: modernProps.labelAccessor || (mapping?.label) || labelKey || 'label',
    valuesAccessor: modernProps.valuesAccessor || (mapping?.values) || valuesKey || 'values',
  }

  return <ViolinPlot ref={ref} {...finalProps} />
})

ViolinPlotLegacy.displayName = 'ViolinPlotLegacy'

export default ViolinPlot

// 為了向下兼容，導出舊版類型
export type { 
  ViolinPlotProps as LegacyViolinPlotProps, 
  ProcessedViolinDataPoint as LegacyProcessedViolinDataPoint, 
  ViolinStatistics as LegacyViolinStatistics 
} from './types'

// 導出新架構類型
export type {
  ViolinPlotCoreConfig,
  ViolinPlotData,
  ProcessedViolinDataPoint,
  DensityPoint
} from './core/violin-plot-core'

// 默認配置
export const defaultViolinPlotProps: Partial<ViolinPlotProps> = {
  width: 600,
  height: 500,
  margin: { top: 20, right: 60, bottom: 60, left: 60 },
  orientation: 'vertical',
  violinWidth: 80,
  resolution: 100,
  showBoxPlot: true,
  boxPlotWidth: 15,
  showMedian: true,
  showMean: true,
  showQuartiles: true,
  showOutliers: true,
  kdeMethod: 'gaussian',
  smoothing: 1,
  violinFillOpacity: 0.7,
  violinStroke: '#374151',
  violinStrokeWidth: 1,
  boxPlotStroke: '#374151',
  boxPlotStrokeWidth: 2,
  boxPlotFillOpacity: 0.7,
  medianStroke: '#000',
  medianStrokeWidth: 3,
  statisticsMethod: 'tukey',
  meanStyle: 'diamond',
  outlierRadius: 3,
  jitterWidth: 0.6,
  animate: true,
  animationDuration: 800,
  animationDelay: 0,
  interactive: true,
  showTooltip: true,
  showXAxis: true,
  showYAxis: true,
  showGrid: true,
  colors: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554']
}