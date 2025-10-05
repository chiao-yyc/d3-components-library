/**
 * BarChart - 使用統一架構的長條圖組件
 * 採用統一軸線系統和框架無關設計
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { BarChartCore, BarChartCoreConfig } from './core/bar-chart-core';

// 擴展 React props 接口，包含向下兼容的 key-based props
export interface BarChartProps extends Omit<ReactChartWrapperProps, 'data' | 'groupBy'>, BarChartCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義

  // 向下兼容的 key-based 屬性
  xKey?: string;
  yKey?: string;
}

// 創建 BarChart 組件
const BarChartComponent = createReactChartWrapper(BarChartCore);

// 導出最終組件
export const BarChart = React.forwardRef<BarChartCore, BarChartProps>((props, ref) => {
  // 處理向下兼容的 key-based props
  const {
    xKey, yKey,
    xAccessor, yAccessor,
    ...restProps
  } = props;

  // 映射 key-based props 到 mapping 系統
  const finalProps: BarChartCoreConfig = {
    ...defaultBarChartProps,
    ...restProps,
    xAccessor: xAccessor || (xKey ? (d: unknown) => (d as Record<string, unknown>)[xKey] : undefined),
    yAccessor: yAccessor || (yKey ? (d: unknown) => (d as Record<string, unknown>)[yKey] : undefined),
  };

  return <BarChartComponent ref={ref} {...finalProps} />;
});

BarChart.displayName = 'BarChart';

// 默認配置 (使用函數形式以避免 HMR 問題)
const getDefaultBarChartProps = (): Partial<BarChartProps> => ({
  width: 600,
  height: 400,
  margin: { top: 20, right: 20, bottom: 60, left: 60 },
  
  // 軸線配置默認值
  showXAxis: true,
  showYAxis: true,
  showGrid: false,
  xTickCount: 5,
  yTickCount: 5,
  
  // 視覺樣式默認值
  orientation: 'vertical',
  colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  animate: true,
  interactive: true,
  
  // 標籤配置默認值
  showLabels: false,
  labelPosition: 'top',
  barOpacity: 0.8,
});

export const defaultBarChartProps = getDefaultBarChartProps();

// 向下兼容：舊版名稱
export const BarChartLegacy = React.forwardRef<BarChartCore, BarChartProps>((props, ref) => {
  return <BarChart ref={ref} {...props} />;
});

BarChartLegacy.displayName = 'BarChartLegacy';

// 專用變體組件
export const HorizontalBarChart = React.forwardRef<BarChartCore, Omit<BarChartProps, 'orientation'>>((props, ref) => {
  return <BarChart ref={ref} {...props} orientation="horizontal" />;
});

HorizontalBarChart.displayName = 'HorizontalBarChart';

export const StackedBarChart = React.forwardRef<BarChartCore, BarChartProps>((props, ref) => {
  return <BarChart ref={ref} {...props} />;
});

StackedBarChart.displayName = 'StackedBarChart';

// 默認匯出
export default BarChart;