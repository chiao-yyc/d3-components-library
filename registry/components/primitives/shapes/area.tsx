/**
 * Area - 使用統一架構的面積圖形狀組件
 * 核心邏輯在 AreaCore 中實現，React 只負責包裝
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { AreaCore, AreaCoreConfig, AreaCoreData } from './core/area-core';

// 擴展 React props 接口
export interface AreaProps extends Omit<ReactChartWrapperProps, 'data' | 'groupBy'>, AreaCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
}

// 重新導出數據類型以保持向下兼容
export type AreaShapeData = AreaCoreData;

// 創建 Area 組件
const AreaComponent = createReactChartWrapper(AreaCore as any);

// 導出最終組件
export const Area = React.forwardRef<AreaCore, AreaProps>((props, ref) => {
  const Component = AreaComponent as any;
  return <Component ref={ref as any} {...props} />;
});

Area.displayName = 'Area';

// 默認配置
const getDefaultAreaProps = (): Partial<AreaProps> => ({
  width: 600,
  height: 400,
  margin: { top: 20, right: 20, bottom: 40, left: 40 },
  
  color: '#3b82f6',
  opacity: 0.7,
  baseline: 0,
  showLine: false,
  lineWidth: 2,
  animate: true,
  animationDuration: 300,
  interactive: true,
  hoverEffect: true
});

Area.defaultProps = getDefaultAreaProps();