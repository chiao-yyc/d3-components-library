// 新架構：使用 BaseChartCore + React 包裝層
import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { RadarChartCore, RadarChartCoreConfig } from './core/radar-chart-core';

// 向下兼容：支援舊版 props
import { RadarChartProps as LegacyRadarChartProps } from './core/types';

// 新的 props 介面
export interface RadarChartProps extends Omit<ReactChartWrapperProps, 'data' | 'groupBy'>, RadarChartCoreConfig {
  // 新架構不需要額外的 React 專用 props
}

// 創建基於 BaseChartCore 的組件
const RadarChartComponent = createReactChartWrapper(RadarChartCore as any);

// 主要導出
export const RadarChart = React.forwardRef<RadarChartCore, RadarChartProps>((props, ref) => {
  return <RadarChartComponent ref={ref} {...props} />;
});

RadarChart.displayName = 'RadarChart';

// 向下兼容導出
export const RadarChartLegacy = React.forwardRef<RadarChartCore, LegacyRadarChartProps & RadarChartProps>((props, ref) => {
  // 將舊版 props 轉換為新版本
  const {
    dataKey,
    labelKey,
    valueKeys,
    axes,
    ...modernProps
  } = props as any;

  const finalProps: RadarChartProps = {
    ...modernProps,
    // 映射舊版資料存取模式到新版
    labelAccessor: modernProps.labelAccessor || labelKey || 'label',
    axisKeys: modernProps.axisKeys || valueKeys || axes || [],
  };

  return <RadarChart ref={ref} {...finalProps} />;
});

RadarChartLegacy.displayName = 'RadarChartLegacy';

export default RadarChart;

// 為了向下兼容，也導出個別的組件
export { D3RadarChart } from './core/radar-chart'
export type { 
  RadarChartProps as LegacyRadarChartProps, 
  ProcessedRadarDataPoint as LegacyProcessedRadarDataPoint,
  RadarValue as LegacyRadarValue,
  RadarAxis as LegacyRadarAxis,
  RadarSeries as LegacySeries
} from './core/types'

// 導出新架構類型
export type {
  RadarChartCoreConfig,
  RadarChartData,
  ProcessedRadarDataPoint,
  RadarValue
} from './core/radar-chart-core'

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
  fontSize: 12,
  fontFamily: 'sans-serif',
  glowEffect: false,
  animate: true,
  animationDuration: 1000,
  animationDelay: 100,
  interactive: true,
  showTooltip: true,
  colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  colorScheme: 'custom'
}