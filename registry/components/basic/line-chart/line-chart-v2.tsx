/**
 * LineChart v2 - 使用新架構的折線圖組件
 * 核心邏輯在 LineChartCore 中實現，React 只負責包裝
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { LineChartCore, LineChartCoreConfig, PointMarkerConfig } from './core/line-chart-core';

// 擴展 React props 接口，包含向下兼容的 key-based props
export interface LineChartV2Props extends ReactChartWrapperProps, LineChartCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
  
  // 向下兼容的 key-based 屬性
  xKey?: string;
  yKey?: string;
  seriesKey?: string;
  categoryKey?: string;
}

// 創建 LineChart 組件
const LineChartComponent = createReactChartWrapper(LineChartCore);

// 導出最終組件
export const LineChartV2 = React.forwardRef<LineChartCore, LineChartV2Props>((props, ref) => {
  // 處理向下兼容的 key-based props
  const {
    xKey, yKey, seriesKey, categoryKey,
    xAccessor, yAccessor, categoryAccessor,
    ...restProps
  } = props;

  // 映射 key-based props 到 accessor
  const finalProps: LineChartCoreConfig = {
    ...restProps,
    xAccessor: xAccessor || xKey || 'x',
    yAccessor: yAccessor || yKey || 'y',
    categoryAccessor: categoryAccessor || seriesKey || categoryKey,
  };


  return <LineChartComponent ref={ref} {...finalProps} />;
});

LineChartV2.displayName = 'LineChartV2';

// 默認配置
export const defaultLineChartProps: Partial<LineChartV2Props> = {
  width: 600,
  height: 400,
  margin: { top: 20, right: 20, bottom: 40, left: 40 },
  
  // 數據映射默認值
  xAccessor: 'x',
  yAccessor: 'y',
  
  // 線條樣式默認值
  curve: 'linear',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeOpacity: 1,
  
  // 點標記默認配置
  showPoints: false,
  pointMarker: {
    enabled: true,
    radius: 3,
    fillOpacity: 1,
    strokeWidth: 1,
    hoverRadius: 5
  } as PointMarkerConfig,
  
  // 連接線處理
  connectNulls: true,
  
  // 視覺樣式默認值
  colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  gradientStrokes: false,
  
  // 軸線配置默認值
  showXAxis: true,
  showYAxis: true,
  showGrid: false,
  
  // 特殊功能默認值
  enableBrushZoom: false,
  enableCrosshair: false,
  enableTooltip: true,
  enableLegend: false,
  
  // 高級功能默認值
  enableDropShadow: false,
  enableGlowEffect: false,
  clipPath: true,
  
  // 動畫
  animate: true,
  animationDuration: 750,
  
  // 響應式
  responsive: true
};

// 為向下兼容，提供舊 props 名稱的映射
export interface LineChartPropsLegacy {
  // 舊的 key-based 模式
  xKey?: string;
  yKey?: string;
  categoryKey?: string;
  
  // 舊的 accessor-based 模式  
  xAccessor?: (d: any) => number | string | Date;
  yAccessor?: (d: any) => number;
  categoryAccessor?: (d: any) => string | number;
  
  // 舊的事件命名
  onLineClick?: (data: any, event: Event) => void;
  onLineHover?: (data: any, event: Event) => void;
  onPointClick?: (data: any, event: Event) => void;
  onPointHover?: (data: any, event: Event) => void;
  
  // 舊的配置名稱
  interpolation?: string; // 映射到 curve
  lineWidth?: number; // 映射到 strokeWidth
  showMarkers?: boolean; // 映射到 showPoints
  markerRadius?: number; // 映射到 pointMarker.radius
}

// 兼容性包裝器
export const LineChartWithLegacySupport = React.forwardRef<LineChartCore, 
  LineChartV2Props & LineChartPropsLegacy
>((props, ref) => {
  // 將舊的 props 轉換為新格式
  const {
    xKey, yKey, categoryKey,
    xAccessor, yAccessor, categoryAccessor,
    onLineClick, onLineHover, onPointClick, onPointHover,
    interpolation, lineWidth, showMarkers, markerRadius,
    ...modernProps
  } = props;

  // 處理 key-based 模式到 mapping 的轉換
  const finalProps: LineChartV2Props = {
    ...modernProps,
    
    // 數據存取器映射
    xAccessor: modernProps.xAccessor || xAccessor || xKey || 'x',
    yAccessor: modernProps.yAccessor || yAccessor || yKey || 'y',
    categoryAccessor: modernProps.categoryAccessor || categoryAccessor || categoryKey,
    
    // 配置映射
    curve: modernProps.curve || interpolation || 'linear',
    strokeWidth: modernProps.strokeWidth || lineWidth || 2,
    showPoints: modernProps.showPoints !== undefined ? modernProps.showPoints : (showMarkers !== undefined ? showMarkers : false),
    
    // 點標記配置映射
    pointMarker: {
      ...defaultLineChartProps.pointMarker,
      ...modernProps.pointMarker,
      radius: modernProps.pointMarker?.radius || markerRadius || 3
    },
    
    // 事件名稱映射
    onDataClick: modernProps.onDataClick || onPointClick,
    onDataHover: modernProps.onDataHover || onPointHover,
    onLineClick: modernProps.onLineClick || onLineClick,
    onLineHover: modernProps.onLineHover || onLineHover,
  };

  return <LineChartV2 ref={ref} {...finalProps} />;
});

LineChartWithLegacySupport.displayName = 'LineChartWithLegacySupport';

// 專用變體組件
export const SmoothLineChartV2 = React.forwardRef<LineChartCore, Omit<LineChartV2Props, 'curve'>>((props, ref) => {
  return <LineChartV2 ref={ref} {...props} curve="monotone" />;
});

SmoothLineChartV2.displayName = 'SmoothLineChartV2';

export const SteppedLineChartV2 = React.forwardRef<LineChartCore, Omit<LineChartV2Props, 'curve'>>((props, ref) => {
  return <LineChartV2 ref={ref} {...props} curve="step" />;
});

SteppedLineChartV2.displayName = 'SteppedLineChartV2';

export const DottedLineChartV2 = React.forwardRef<LineChartCore, Omit<LineChartV2Props, 'strokeDasharray'>>((props, ref) => {
  return <LineChartV2 ref={ref} {...props} strokeDasharray="5,5" />;
});

DottedLineChartV2.displayName = 'DottedLineChartV2';

export const LineChartWithPointsV2 = React.forwardRef<LineChartCore, Omit<LineChartV2Props, 'showPoints'>>((props, ref) => {
  return <LineChartV2 ref={ref} {...props} showPoints={true} />;
});

LineChartWithPointsV2.displayName = 'LineChartWithPointsV2';

export const GradientLineChartV2 = React.forwardRef<LineChartCore, Omit<LineChartV2Props, 'gradientStrokes' | 'enableGlowEffect'>>((props, ref) => {
  return <LineChartV2 ref={ref} {...props} gradientStrokes={true} enableGlowEffect={true} />;
});

GradientLineChartV2.displayName = 'GradientLineChartV2';