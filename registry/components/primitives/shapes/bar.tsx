/**
 * Bar - 使用統一架構的條形圖形狀組件
 * 核心邏輯在 BarCore 中實現，React 只負責包裝
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { BarCore, BarCoreConfig, BarCoreData } from './core/bar-core';

// 擴展 React props 接口
export interface BarProps extends ReactChartWrapperProps, BarCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
}

// 重新導出數據類型以保持向下兼容
export type BarShapeData = BarCoreData;

// 創建 Bar 組件
const BarComponent = createReactChartWrapper(BarCore);

// 導出最終組件
export const Bar = React.forwardRef<BarCore, BarProps>((props, ref) => {
  return <BarComponent ref={ref} {...props} />;
});

Bar.displayName = 'Bar';

// 默認配置 (使用函數形式以避免 HMR 問題)
const getDefaultBarProps = (): Partial<BarProps> => ({
  width: 400,
  height: 300,
  margin: { top: 20, right: 20, bottom: 40, left: 40 },
  
  // 視覺配置默認值
  color: '#3b82f6',
  opacity: 1,
  orientation: 'vertical',
  
  // 佈局配置默認值
  alignment: 'center',
  barWidthRatio: 0.8,
  
  // 動畫配置默認值
  animate: true,
  animationDuration: 300,
  animationEasing: 'ease-in-out',
  
  // 交互配置默認值
  interactive: true,
  hoverEffect: true,
  
  // 樣式配置默認值
  strokeWidth: 0,
  strokeColor: 'none',
  cornerRadius: 0
});

// 導出默認配置
Bar.defaultProps = getDefaultBarProps();