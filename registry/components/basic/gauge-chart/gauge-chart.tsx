
// 新架構：使用 BaseChartCore + React 包裝層
import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { GaugeChartCore, GaugeChartCoreConfig } from './core/gauge-chart-core';

// 向下兼容：支援舊版 props
import { GaugeChartProps as LegacyGaugeChartProps } from './types';
import './gauge-chart.css';

// 新的 props 介面
export interface GaugeChartProps extends ReactChartWrapperProps, GaugeChartCoreConfig {
  // 新架構不需要額外的 React 專用 props
}

// 創建基於 BaseChartCore 的組件
const GaugeChartComponent = createReactChartWrapper(GaugeChartCore);

// 主要導出
export const GaugeChart = React.forwardRef<GaugeChartCore, GaugeChartProps>((props, ref) => {
  return <GaugeChartComponent ref={ref} {...props} />;
});

GaugeChart.displayName = 'GaugeChart';

// 向下兼容導出
export const GaugeChartLegacy = React.forwardRef<GaugeChartCore, LegacyGaugeChartProps & GaugeChartProps>((props, ref) => {
  // 將舊版 props 轉換為新版本
  const {
    valueKey,
    labelKey,
    mapping,
    ...modernProps
  } = props as any;

  const finalProps: GaugeChartProps = {
    ...modernProps,
    // 映射舊版資料存取模式到新版
    valueAccessor: modernProps.valueAccessor || (mapping?.value) || valueKey || 'value',
    labelAccessor: modernProps.labelAccessor || (mapping?.label) || labelKey || 'label',
  };

  return <GaugeChart ref={ref} {...finalProps} />;
});

GaugeChartLegacy.displayName = 'GaugeChartLegacy';

export default GaugeChart;

// 為了向下兼容，也導出個別的組件
export { D3GaugeChart } from './core/gauge-chart';
export type { 
  GaugeChartProps as LegacyGaugeChartProps, 
  ProcessedGaugeDataPoint as LegacyProcessedGaugeDataPoint,
  GaugeZone as LegacyGaugeZone,
  TickData as LegacyTickData
} from './types';

// 導出新架構類型
export type {
  GaugeChartCoreConfig,
  GaugeChartData,
  ProcessedGaugeDataPoint,
  GaugeZone,
  TickData
} from './core/gauge-chart-core';

// 默認配置
export const defaultGaugeChartProps: Partial<GaugeChartProps> = {
  width: 400,
  height: 300,
  margin: { top: 20, right: 20, bottom: 20, left: 20 },
  min: 0,
  max: 100,
  startAngle: -90,
  endAngle: 90,
  backgroundColor: '#e5e7eb',
  foregroundColor: '#3b82f6',
  needleColor: '#374151',
  needleWidth: 3,
  centerCircleRadius: 8,
  centerCircleColor: '#374151',
  showValue: true,
  showLabel: true,
  showTicks: true,
  showMinMax: true,
  tickCount: 5,
  fontSize: 14,
  fontFamily: 'sans-serif',
  animate: true,
  animationDuration: 1000,
  animationEasing: 'easeElasticOut',
  interactive: true,
  showTooltip: true,
  colors: ['#ef4444', '#f97316', '#f59e0b', '#22c55e']
};
