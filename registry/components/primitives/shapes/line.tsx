/**
 * Line - 使用統一架構的線條圖形狀組件
 * 核心邏輯在 LineCore 中實現，React 只負責包裝
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { LineCore, LineCoreConfig, LineCoreData } from './core/line-core';

// 擴展 React props 接口
export interface LineProps extends Omit<ReactChartWrapperProps, 'data' | 'groupBy'>, LineCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
}

// 重新導出數據類型以保持向下兼容
export type LineShapeData = LineCoreData;

// 創建 Line 組件
const LineComponent = createReactChartWrapper(LineCore as any);

// 導出最終組件
export const Line = React.forwardRef<LineCore, LineProps>((props, ref) => {
  return <LineComponent ref={ref as any} {...props} />;
});

Line.displayName = 'Line';

// 默認配置 (使用函數形式以避免 HMR 問題)
const getDefaultLineProps = (): Partial<LineProps> => ({
  width: 600,
  height: 400,
  margin: { top: 20, right: 20, bottom: 40, left: 40 },
  
  // 視覺配置默認值
  color: '#3b82f6',
  strokeWidth: 2,
  opacity: 1,
  
  // 點配置默認值
  showPoints: false,
  pointRadius: 4,
  pointStrokeWidth: 1,
  pointStrokeColor: '#ffffff',
  
  // 佈局配置默認值
  alignment: 'center',
  
  // 動畫配置默認值
  animate: true,
  animationDuration: 300,
  animationEasing: 'ease-in-out',
  animationDelay: 0,
  drawAnimation: 'draw',
  
  // 交互配置默認值
  interactive: true,
  hoverEffect: true
});

// 導出默認配置
Line.defaultProps = getDefaultLineProps();