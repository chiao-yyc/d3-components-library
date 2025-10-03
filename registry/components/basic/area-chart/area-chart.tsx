/**
 * AreaChart - 統一架構的面積圖組件
 * 核心邏輯在 AreaChartCore 中實現，React 只負責包裝
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { AreaChartCore, AreaChartCoreConfig } from './core/area-chart-core';

// 擴展 React props 接口
export interface AreaChartProps extends ReactChartWrapperProps, AreaChartCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
  
  // 添加對舊版 mapping 的支援
  mapping?: {
    x?: string;
    y?: string;
    category?: string;
  };
}

// 創建 AreaChart 組件
const AreaChartComponent = createReactChartWrapper(AreaChartCore);

// 導出最終組件
export const AreaChart = React.forwardRef<AreaChartCore, AreaChartProps>((props, ref) => {
  // 處理 mapping prop 轉換為 accessor props
  const { mapping, ...otherProps } = props;
  
  const finalProps = {
    ...defaultAreaChartProps, // 先應用默認配置
    ...otherProps,            // 再應用用戶配置
    // 如果提供了 mapping，將其轉換為 accessor
    xAccessor: props.xAccessor || mapping?.x || 'x',
    yAccessor: props.yAccessor || mapping?.y || 'y',
    categoryAccessor: props.categoryAccessor || mapping?.category,
  };
  
  return <AreaChartComponent ref={ref} {...finalProps} />;
});

AreaChart.displayName = 'AreaChart';

// 默認配置
export const defaultAreaChartProps: Partial<AreaChartProps> = {
  width: 800,
  height: 400,
  margin: { top: 20, right: 30, bottom: 40, left: 50 },
  
  // 數據映射默認值
  xAccessor: 'x',
  yAccessor: 'y',
  
  // 面積圖樣式默認值
  colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  fillOpacity: 0.6,
  strokeWidth: 2,
  
  // 動畫默認值
  animate: true,
  animationDuration: 750,

  // 交互
  interactive: true,
  enableTooltip: true,
};

// 向下兼容：舊版 props 支援
export interface AreaChartPropsLegacy {
  xKey?: string;
  yKey?: string;
  categoryKey?: string;
  xAccessor?: (d: unknown) => unknown;
  yAccessor?: (d: unknown) => unknown;
  categoryAccessor?: (d: unknown) => unknown;
}

// 兼容性包裝器
export const AreaChartLegacy = React.forwardRef<AreaChartCore, 
  AreaChartProps & AreaChartPropsLegacy
>((props, ref) => {
  // 將舊的 props 轉換為新格式
  const {
    xKey, yKey, categoryKey,
    xAccessor, yAccessor, categoryAccessor,
    ...modernProps
  } = props;

  const finalProps: AreaChartProps = {
    ...modernProps,

    // 數據存取器映射
    xAccessor: xAccessor || xKey || 'x',
    yAccessor: yAccessor || yKey || 'y',
    categoryAccessor: categoryAccessor || categoryKey,
  };

  return <AreaChart ref={ref} {...finalProps} />;
});

AreaChartLegacy.displayName = 'AreaChartLegacy';

// 專用變體組件
export const StackedAreaChart = React.forwardRef<AreaChartCore, Omit<AreaChartProps, 'stackMode'>>((props, ref) => {
  return <AreaChart ref={ref} {...props} stackMode="normal" />;
});

StackedAreaChart.displayName = 'StackedAreaChart';

export const StreamgraphChart = React.forwardRef<AreaChartCore, Omit<AreaChartProps, 'stackMode'>>((props, ref) => {
  return <AreaChart ref={ref} {...props} stackMode="streamgraph" />;
});

StreamgraphChart.displayName = 'StreamgraphChart';