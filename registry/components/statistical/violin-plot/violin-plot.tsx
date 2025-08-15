import React from 'react'
import { createChartComponent } from '../../core/base-chart/base-chart'
import { D3ViolinPlot } from './core/violin-plot'
import { ViolinPlotProps } from './types'

export const ViolinPlot = createChartComponent<ViolinPlotProps>(D3ViolinPlot)

export default ViolinPlot

// 為了向下兼容，也導出個別的組件
export { D3ViolinPlot } from './core/violin-plot'
export type { ViolinPlotProps, ProcessedViolinDataPoint, ViolinStatistics, DensityPoint } from './types'

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
  medianStroke: '#000',
  medianStrokeWidth: 3,
  statisticsMethod: 'tukey',
  meanStyle: 'diamond',
  animate: true,
  animationDuration: 1000,
  animationDelay: 100,
  interactive: true,
  showTooltip: true,
  colors: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554']
}