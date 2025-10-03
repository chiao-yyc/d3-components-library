/**
 * LineChart - 統一架構的折線圖組件
 * 核心邏輯在 LineChartCore 中實現，React 只負責包裝
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { LineChartCore, LineChartCoreConfig, PointMarkerConfig } from './core/line-chart-core';

// 擴展 React props 接口，包含向下兼容的 key-based props
export interface LineChartProps extends ReactChartWrapperProps, LineChartCoreConfig {
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
export const LineChart = React.forwardRef<LineChartCore, LineChartProps>((props, ref) => {
  // 處理向下兼容的 key-based props
  const {
    xKey, yKey, seriesKey, categoryKey,
    xAccessor, yAccessor, categoryAccessor,
    ...restProps
  } = props;

  // 映射 key-based props 到 accessor
  const finalProps: LineChartCoreConfig = {
    ...defaultLineChartProps,
    ...restProps,
    xAccessor: xAccessor || xKey || 'x',
    yAccessor: yAccessor || yKey || 'y',
    categoryAccessor: categoryAccessor || seriesKey || categoryKey,
  };

  return <LineChartComponent ref={ref} {...finalProps} />;
});

LineChart.displayName = 'LineChart';

// 默認配置
export const defaultLineChartProps: Partial<LineChartProps> = {
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
  animationDuration: 750
};

// 向下兼容：舊版 props 支援
export interface LineChartPropsLegacy {
  xKey?: string;
  yKey?: string;
  categoryKey?: string;
  xAccessor?: (d: unknown) => number | string | Date;
  yAccessor?: (d: unknown) => number;
  categoryAccessor?: (d: unknown) => string | number;
  onLineClick?: (data: unknown, event: Event) => void;
  onLineHover?: (data: unknown, event: Event) => void;
  onPointClick?: (data: unknown, event: Event) => void;
  onPointHover?: (data: unknown, event: Event) => void;
  interpolation?: string;
  lineWidth?: number;
  showMarkers?: boolean;
  markerRadius?: number;
}

// 兼容性包裝器
export const LineChartLegacy = React.forwardRef<LineChartCore, 
  LineChartProps & LineChartPropsLegacy
>((props, ref) => {
  const {
    xKey, yKey, categoryKey,
    xAccessor, yAccessor, categoryAccessor,
    onLineClick, onLineHover, onPointClick, onPointHover,
    interpolation, lineWidth, showMarkers, markerRadius,
    ...modernProps
  } = props;

  const finalProps: LineChartCoreConfig = {
    ...modernProps,
    xAccessor: xAccessor || xKey || 'x',
    yAccessor: yAccessor || yKey || 'y',
    categoryAccessor: categoryAccessor || categoryKey,
    curve: (interpolation as any) || modernProps.curve || 'linear',
    strokeWidth: lineWidth || modernProps.strokeWidth || 2,
    showPoints: showMarkers !== undefined ? showMarkers : modernProps.showPoints,
    pointMarker: {
      enabled: true,
      radius: markerRadius || 3,
      fillOpacity: 1,
      strokeWidth: 1,
      ...modernProps.pointMarker
    },
    onDataClick: onPointClick,
    onDataHover: onPointHover,
    onLineClick: onLineClick,
    onLineHover: onLineHover,
  };

  return <LineChart ref={ref} {...finalProps} />;
});

LineChartLegacy.displayName = 'LineChartLegacy';

// 專用變體組件
export const SmoothLineChart = React.forwardRef<LineChartCore, Omit<LineChartProps, 'curve'>>((props, ref) => {
  return <LineChart ref={ref} {...props} curve="monotone" />;
});

SmoothLineChart.displayName = 'SmoothLineChart';

export const SteppedLineChart = React.forwardRef<LineChartCore, Omit<LineChartProps, 'curve'>>((props, ref) => {
  return <LineChart ref={ref} {...props} curve="step" />;
});

SteppedLineChart.displayName = 'SteppedLineChart';

export const LineChartWithPoints = React.forwardRef<LineChartCore, Omit<LineChartProps, 'showPoints'>>((props, ref) => {
  return <LineChart ref={ref} {...props} showPoints={true} />;
});

LineChartWithPoints.displayName = 'LineChartWithPoints';