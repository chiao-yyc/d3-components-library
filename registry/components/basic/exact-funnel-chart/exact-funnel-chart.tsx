/**
 * ExactFunnelChart - 統一架構的流線型漏斗圖組件
 * 核心邏輯在 ExactFunnelChartCore 中實現，React 只負責包裝
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { ExactFunnelChartCore, ExactFunnelChartCoreConfig } from './core/exact-funnel-core';

// 擴展 React props 接口
export interface ExactFunnelChartProps extends ReactChartWrapperProps, ExactFunnelChartCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
}

// 創建 ExactFunnelChart 組件
const ExactFunnelChartComponent = createReactChartWrapper(ExactFunnelChartCore);

// 導出最終組件
export const ExactFunnelChart = React.forwardRef<ExactFunnelChartCore, ExactFunnelChartProps>((props, ref) => {
  // 合併默認配置
  const mergedProps = { ...defaultExactFunnelChartProps, ...props };
  return <ExactFunnelChartComponent ref={ref} {...mergedProps} />;
});

ExactFunnelChart.displayName = 'ExactFunnelChart';

// 向下兼容導出
export const ExactFunnelChartV2 = ExactFunnelChart;

// 默認配置
export const defaultExactFunnelChartProps: Partial<ExactFunnelChartProps> = {
  width: 600,
  height: 300,
  margin: { top: 80, right: 60, bottom: 40, left: 60 },
  background: '#f5f5f5',
  gradient1: '#FF6B6B',
  gradient2: '#4ECDC4',
  values: '#333333',
  labels: '#555555',
  percentages: '#666666',
  showBorder: false,
  borderColor: '#ffffff',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontSize: 22,
  labelFontSize: 14,
  percentageFontSize: 18,
  animate: true,
  animationDuration: 1000,
  interactive: true,
  showTooltip: true,
  // 設置默認數據存取器
  stepKey: 'step',
  valueKey: 'value',
  labelKey: 'label'
};

// 重新導出類型
export type { 
  ExactFunnelChartCoreConfig, 
  ExactFunnelChartData, 
  ExactFunnelDataPoint 
} from './core/exact-funnel-core';

// 為了向下兼容，保留舊版本接口類型
export type ExactFunnelChartV2Props = ExactFunnelChartProps;