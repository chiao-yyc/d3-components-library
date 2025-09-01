/**
 * BarChart V2 - 使用新的 BaseChartCore 架構
 * 採用統一軸線系統和框架無關設計
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { BarChartCore, BarChartCoreConfig } from './core/bar-chart-core';

// 擴展 React props 接口
export interface BarChartV2Props extends ReactChartWrapperProps, BarChartCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
}

// 創建 BarChart 組件
const BarChartComponent = createReactChartWrapper(BarChartCore);

// 導出最終組件
export const BarChartV2 = React.forwardRef<BarChartCore, BarChartV2Props>((props, ref) => {
  return <BarChartComponent ref={ref} {...props} />;
});

BarChartV2.displayName = 'BarChartV2';

// 默認配置 (使用函數形式以避免 HMR 問題)
const getDefaultBarChartProps = (): Partial<BarChartV2Props> => ({
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

// 默認匯出
export default BarChartV2;