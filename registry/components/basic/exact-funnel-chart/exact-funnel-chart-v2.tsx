/**
 * ExactFunnelChartV2 - 使用新架構的流線型漏斗圖組件
 * 核心邏輯在 ExactFunnelChartCore 中實現，React 只負責包裝
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { ExactFunnelChartCore, ExactFunnelChartCoreConfig } from './core/exact-funnel-core';

// 擴展 React props 接口
export interface ExactFunnelChartV2Props extends ReactChartWrapperProps, ExactFunnelChartCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
}

// 創建 ExactFunnelChart 組件
const ExactFunnelChartComponent = createReactChartWrapper(ExactFunnelChartCore);

// 導出最終組件
export const ExactFunnelChartV2 = React.forwardRef<ExactFunnelChartCore, ExactFunnelChartV2Props>((props, ref) => {
  return <ExactFunnelChartComponent ref={ref} {...props} />;
});

ExactFunnelChartV2.displayName = 'ExactFunnelChartV2';

// 默認配置
export const defaultExactFunnelChartProps: Partial<ExactFunnelChartV2Props> = {
  width: 600,
  height: 300,
  margin: { top: 80, right: 60, bottom: 40, left: 60 },
  background: '#2a2a2a',
  gradient1: '#FF6B6B',
  gradient2: '#4ECDC4',
  values: '#ffffff',
  labels: '#cccccc',
  percentages: '#888888',
  showBorder: false,
  borderColor: '#ffffff',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontSize: 22,
  labelFontSize: 14,
  percentageFontSize: 18,
  animate: true,
  animationDuration: 1000,
  interactive: true,
  showTooltip: true
};

// 重新導出類型
export type { 
  ExactFunnelChartCoreConfig, 
  ExactFunnelChartData, 
  ExactFunnelDataPoint 
} from './core/exact-funnel-core';