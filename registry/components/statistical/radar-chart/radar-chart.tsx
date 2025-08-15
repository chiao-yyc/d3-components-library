import React from 'react'
import { createChartComponent } from '../../core/base-chart/base-chart'
import { D3RadarChart } from './core/radar-chart'
import { RadarChartProps } from './core/types'

export const RadarChart = createChartComponent<RadarChartProps>(D3RadarChart)

export default RadarChart

// 為了向下兼容，也導出個別的組件
export { D3RadarChart } from './core/radar-chart'
export type { 
  RadarChartProps, 
  ProcessedRadarDataPoint,
  RadarValue,
  RadarAxis,
  RadarSeries
} from './core/types'

// 默認配置
export const defaultRadarChartProps: Partial<RadarChartProps> = {
  width: 500,
  height: 500,
  margin: { top: 60, right: 60, bottom: 60, left: 60 },
  radius: undefined, // 自動計算
  levels: 5,
  startAngle: -90,
  clockwise: true,
  interpolation: 'linear-closed',
  showGrid: true,
  showGridLabels: true,
  showAxes: true,
  showAxisLabels: true,
  showDots: true,
  showArea: true,
  minValue: 0,
  maxValue: undefined, // 自動縮放
  autoScale: true,
  scaleType: 'linear',
  gridStroke: '#e5e7eb',
  gridStrokeWidth: 1,
  gridOpacity: 0.7,
  axisStroke: '#9ca3af',
  axisStrokeWidth: 1,
  strokeWidth: 2,
  areaOpacity: 0.25,
  dotRadius: 4,
  dotStroke: '#fff',
  dotStrokeWidth: 2,
  axisLabelOffset: 20,
  gridLabelOffset: 10,
  fontSize: 12,
  fontFamily: 'sans-serif',
  glowEffect: false,
  animate: true,
  animationDuration: 1000,
  animationDelay: 100,
  interactive: true,
  showTooltip: true,
  showLegend: true,
  legendPosition: 'bottom',
  colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  colorScheme: 'custom'
}