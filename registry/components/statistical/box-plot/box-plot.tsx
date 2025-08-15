import React from 'react'
import { createChartComponent } from '../../core/base-chart/base-chart'
import { D3BoxPlot } from './core/box-plot'
import { BoxPlotProps } from './types'

export const BoxPlot = createChartComponent<BoxPlotProps>(D3BoxPlot)

export default BoxPlot

// 為了向下兼容，也導出個別的組件
export { D3BoxPlot } from './core/box-plot'
export type { BoxPlotProps, ProcessedBoxPlotDataPoint, BoxPlotStatistics } from './types'

// 默認配置
export const defaultBoxPlotProps: Partial<BoxPlotProps> = {
  width: 500,
  height: 400,
  margin: { top: 20, right: 60, bottom: 60, left: 60 },
  orientation: 'vertical',
  boxWidth: 40,
  whiskerWidth: 20,
  showOutliers: true,
  showMean: true,
  showMedian: true,
  outlierRadius: 3,
  meanStyle: 'diamond',
  boxFillOpacity: 0.7,
  boxStroke: '#374151',
  boxStrokeWidth: 1,
  statisticsMethod: 'tukey',
  showWhiskers: true,
  showAllPoints: false,
  pointColorMode: 'uniform',
  jitterWidth: 0.6,
  pointRadius: 2,
  pointOpacity: 0.6,
  animate: true,
  animationDuration: 800,
  interactive: true,
  showTooltip: true,
  colors: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554']
}