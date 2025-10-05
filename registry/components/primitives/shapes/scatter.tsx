/**
 * Scatter - 使用統一架構的散點圖形狀組件
 * 核心邏輯在 ScatterCore 中實現，React 只負責包裝
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { ScatterCore, ScatterCoreConfig, ScatterCoreData } from './core/scatter-core';

// 擴展 React props 接口
export interface ScatterProps extends Omit<ReactChartWrapperProps, 'data' | 'groupBy'>, ScatterCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
}

// 重新導出數據類型以保持向下兼容
export type ScatterShapeData = ScatterCoreData;

// 創建 Scatter 組件
const ScatterComponent = createReactChartWrapper(ScatterCore as any);

// 導出最終組件
export const Scatter = React.forwardRef<ScatterCore, ScatterProps>((props, ref) => {
  return <ScatterComponent ref={ref as any} {...props} />;
});

Scatter.displayName = 'Scatter';

// 默認配置 (使用函數形式以避免 HMR 問題)
const getDefaultScatterProps = (): Partial<ScatterProps> => ({
  width: 600,
  height: 400,
  margin: { top: 20, right: 20, bottom: 40, left: 40 },
  
  // 視覺配置默認值
  color: '#3b82f6',
  opacity: 0.7,
  
  // 點配置默認值
  radius: 4,
  minPointSize: 2,
  maxPointSize: 20,
  
  // 描邊配置默認值
  strokeWidth: 1,
  strokeColor: '#ffffff',
  
  // 佈局配置默認值
  alignment: 'center',
  
  // 動畫配置默認值
  animate: true,
  animationDuration: 300,
  animationEasing: 'ease-in-out',
  animationDelay: 0,
  entranceAnimation: 'scale',
  
  // 交互配置默認值
  interactive: true,
  hoverEffect: true,
  hoverRadius: 6,
  
  // 趨勢線配置默認值
  showTrendline: false,
  trendlineColor: '#666666',
  trendlineWidth: 2,
  trendlineType: 'linear'
});

// 導出默認配置
Scatter.defaultProps = getDefaultScatterProps();