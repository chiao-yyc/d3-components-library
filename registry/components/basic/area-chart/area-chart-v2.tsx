/**
 * AreaChart v2 - 使用新架構的區域圖組件
 * 核心邏輯在 AreaChartCore 中實現，React 只負責包裝
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { AreaChartCore, AreaChartCoreConfig } from './core/area-chart-core';

// 擴展 React props 接口
export interface AreaChartV2Props extends ReactChartWrapperProps, AreaChartCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
}

// 創建 AreaChart 組件
const AreaChartComponent = createReactChartWrapper(AreaChartCore);

// 導出最終組件
export const AreaChartV2 = React.forwardRef<AreaChartCore, AreaChartV2Props>((props, ref) => {
  return <AreaChartComponent ref={ref} {...props} />;
});

AreaChartV2.displayName = 'AreaChartV2';

// 默認配置
export const defaultAreaChartProps: Partial<AreaChartV2Props> = {
  width: 600,
  height: 400,
  margin: { top: 20, right: 20, bottom: 40, left: 40 },
  
  // 數據映射默認值
  xAccessor: 'x',
  yAccessor: 'y',
  
  // 區域圖專用默認值
  stackMode: 'none',
  curve: 'linear',
  fillOpacity: 0.6,
  strokeWidth: 2,
  
  // 視覺樣式默認值
  colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  showPoints: false,
  pointRadius: 3,
  gradientFill: false,
  
  // 軸線配置默認值
  showXAxis: true,
  showYAxis: true,
  showGrid: false,
  
  // 特殊功能默認值
  enableBrushZoom: false,
  enableCrosshair: false,
  enableTooltip: true,
  
  // 動畫
  animate: true,
  animationDuration: 750,
  
  // 響應式
  responsive: true
};

// 為向下兼容，提供舊 props 名稱的映射
export interface AreaChartPropsLegacy {
  // 舊的 key-based 模式
  xKey?: string;
  yKey?: string;
  categoryKey?: string;
  
  // 舊的 accessor-based 模式  
  xAccessor?: (d: any) => number | string | Date;
  yAccessor?: (d: any) => number;
  categoryAccessor?: (d: any) => string | number;
  
  // 舊的事件命名
  onAreaClick?: (data: any, event: Event) => void;
  onAreaHover?: (data: any, event: Event) => void;
  
  // 舊的配置名稱
  stacked?: boolean; // 映射到 stackMode: 'normal'
  interpolation?: string; // 映射到 curve
  opacity?: number; // 映射到 fillOpacity
}

// 兼容性包裝器
export const AreaChartWithLegacySupport = React.forwardRef<AreaChartCore, 
  AreaChartV2Props & AreaChartPropsLegacy
>((props, ref) => {
  // 將舊的 props 轉換為新格式
  const {
    xKey, yKey, categoryKey,
    xAccessor, yAccessor, categoryAccessor,
    onAreaClick, onAreaHover,
    stacked, interpolation, opacity,
    ...modernProps
  } = props;

  // 處理 key-based 模式到 mapping 的轉換
  const finalProps: AreaChartV2Props = {
    ...modernProps,
    
    // 數據存取器映射
    xAccessor: modernProps.xAccessor || xAccessor || xKey || 'x',
    yAccessor: modernProps.yAccessor || yAccessor || yKey || 'y',
    categoryAccessor: modernProps.categoryAccessor || categoryAccessor || categoryKey,
    
    // 配置映射
    stackMode: modernProps.stackMode || (stacked ? 'normal' : 'none'),
    curve: modernProps.curve || interpolation || 'linear',
    fillOpacity: modernProps.fillOpacity || opacity || 0.6,
    
    // 事件名稱映射
    onDataClick: modernProps.onDataClick || onAreaClick,
    onDataHover: modernProps.onDataHover || onAreaHover,
  };

  return <AreaChartV2 ref={ref} {...finalProps} />;
});

AreaChartWithLegacySupport.displayName = 'AreaChartWithLegacySupport';

// 專用變體組件
export const StackedAreaChartV2 = React.forwardRef<AreaChartCore, Omit<AreaChartV2Props, 'stackMode'>>((props, ref) => {
  return <AreaChartV2 ref={ref} {...props} stackMode="normal" />;
});

StackedAreaChartV2.displayName = 'StackedAreaChartV2';

export const PercentStackedAreaChartV2 = React.forwardRef<AreaChartCore, Omit<AreaChartV2Props, 'stackMode'>>((props, ref) => {
  return <AreaChartV2 ref={ref} {...props} stackMode="percent" />;
});

PercentStackedAreaChartV2.displayName = 'PercentStackedAreaChartV2';

export const SmoothAreaChartV2 = React.forwardRef<AreaChartCore, Omit<AreaChartV2Props, 'curve'>>((props, ref) => {
  return <AreaChartV2 ref={ref} {...props} curve="monotone" />;
});

SmoothAreaChartV2.displayName = 'SmoothAreaChartV2';