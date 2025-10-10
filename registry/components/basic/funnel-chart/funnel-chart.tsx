/**
 * FunnelChart - 統一架構的漏斗圖組件
 * 核心邏輯在 FunnelChartCore 中實現，React 只負責包裝
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { FunnelChartCore, FunnelChartCoreConfig } from './core/funnel-chart-core';

// 擴展 React props 接口
export interface FunnelChartProps extends Omit<ReactChartWrapperProps, 'data' | 'groupBy'>, FunnelChartCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
}

// 創建 FunnelChart 組件
const FunnelChartComponent = createReactChartWrapper(FunnelChartCore);

// 導出最終組件
export const FunnelChart = React.forwardRef<FunnelChartCore, FunnelChartProps>((props, ref) => {
  return <FunnelChartComponent ref={ref} {...props} />;
});

FunnelChart.displayName = 'FunnelChart';

// 向下兼容導出
export const FunnelChartV2 = FunnelChart;

// 默認配置
export const defaultFunnelChartProps: Partial<FunnelChartProps> = {
  width: 400,
  height: 500,
  margin: { top: 20, right: 20, bottom: 20, left: 20 },
  direction: 'top',
  shape: 'trapezoid',
  gap: 4,
  cornerRadius: 0,
  proportionalMode: 'traditional',
  shrinkageType: 'percentage',
  shrinkageAmount: 0.1,
  minWidth: 50,
  colors: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554'],
  showLabels: true,
  showValues: true,
  showPercentages: true,
  showConversionRates: true,
  labelPosition: 'side',
  fontSize: 12,
  fontFamily: 'sans-serif',
  animate: true,
  animationDuration: 800,
  interactive: true,
  showTooltip: true
};

// 重新導出類型
export type { FunnelChartCoreConfig, FunnelDataPoint, FunnelSegment } from './core/funnel-chart-core';