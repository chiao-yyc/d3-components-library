/**
 * ScatterPlot - 使用統一架構的散點圖組件
 * 核心邏輯在 ScatterPlotCore 中實現，React 只負責包裝
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { ScatterPlotCore, ScatterPlotCoreConfig } from './core/scatter-plot-core';

// 擴展 React props 接口
export interface ScatterPlotProps extends ReactChartWrapperProps, ScatterPlotCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
}

// 創建 ScatterPlot 組件
const ScatterPlotComponent = createReactChartWrapper(ScatterPlotCore);

// 導出最終組件
export const ScatterPlot = React.forwardRef<ScatterPlotCore, ScatterPlotProps>((props, ref) => {
  return <ScatterPlotComponent ref={ref} {...props} />;
});

ScatterPlot.displayName = 'ScatterPlot';

// 默認配置 (使用函數形式以避免 HMR 問題)
const getDefaultScatterPlotProps = (): Partial<ScatterPlotProps> => ({
  width: 600,
  height: 400,
  margin: { top: 20, right: 20, bottom: 60, left: 60 },
  
  // 數據映射默認值
  xAccessor: 'x',
  yAccessor: 'y',
  
  // 視覺樣式默認值
  colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6'],
  pointRadius: 4,
  minPointSize: 2,
  maxPointSize: 20,
  opacity: 0.7,
  strokeWidth: 0,
  strokeColor: 'none',
  
  // 軸線配置默認值
  showXAxis: true,
  showYAxis: true,
  showGrid: false,
  
  // 特殊功能默認值
  showTrendline: false,
  enableBrushZoom: false,
  enableCrosshair: false,
  enableVoronoi: false,
  
  // 智能邊距功能（默認啟用）
  autoMargin: true,
  paddingRatio: 0.05,  // 5% 邊距
  minPadding: 5,       // 最小 5px
  
  // 動畫
  animate: true,
  animationDuration: 750,
  
  // 響應式
  responsive: true
});

export const defaultScatterPlotProps = getDefaultScatterPlotProps();

// 為向下兼容，提供舊 props 名稱的映射
export interface ScatterPlotPropsLegacy {
  // 舊的 key-based 模式
  xKey?: string;
  yKey?: string;
  sizeKey?: string;
  colorKey?: string;
  
  // 舊的 accessor-based 模式  
  xAccessor?: (d: any) => number | string | Date;
  yAccessor?: (d: any) => number;
  sizeAccessor?: (d: any) => number;
  colorAccessor?: (d: any) => string | number;
  
  // 舊的事件命名
  onPointClick?: (data: any, event: Event) => void;
  onPointHover?: (data: any, event: Event) => void;
}

// 兼容性包裝器
export const ScatterPlotWithLegacySupport = React.forwardRef<ScatterPlotCore, 
  ScatterPlotProps & ScatterPlotPropsLegacy
>((props, ref) => {
  // 將舊的 props 轉換為新格式
  const {
    xKey, yKey, sizeKey, colorKey,
    xAccessor, yAccessor, sizeAccessor, colorAccessor,
    onPointClick, onPointHover,
    ...modernProps
  } = props;

  // 處理 key-based 模式到 mapping 的轉換
  const finalProps: ScatterPlotProps = {
    ...modernProps,
    // 優先使用 mapping，然後是 accessor，最後是 key
    xAccessor: modernProps.xAccessor || xAccessor || xKey || 'x',
    yAccessor: modernProps.yAccessor || yAccessor || yKey || 'y',
    sizeAccessor: modernProps.sizeAccessor || sizeAccessor || sizeKey,
    colorAccessor: modernProps.colorAccessor || colorAccessor || colorKey,
    
    // 事件名稱映射
    onDataClick: modernProps.onDataClick || onPointClick,
    onDataHover: modernProps.onDataHover || onPointHover,
  };

  return <ScatterPlot ref={ref} {...finalProps} />;
});

ScatterPlotWithLegacySupport.displayName = 'ScatterPlotWithLegacySupport';

// 向下兼容：舊版名稱
export const ScatterPlotLegacy = React.forwardRef<ScatterPlotCore, ScatterPlotProps>((props, ref) => {
  return <ScatterPlot ref={ref} {...props} />;
});

ScatterPlotLegacy.displayName = 'ScatterPlotLegacy';

// 專用變體組件
export const BubbleChart = React.forwardRef<ScatterPlotCore, Omit<ScatterPlotProps, 'sizeAccessor'>>((props, ref) => {
  return <ScatterPlot ref={ref} {...props} sizeAccessor={props.sizeAccessor || 'value'} />;
});

BubbleChart.displayName = 'BubbleChart';

export const TrendlineScatterPlot = React.forwardRef<ScatterPlotCore, Omit<ScatterPlotProps, 'showTrendline'>>((props, ref) => {
  return <ScatterPlot ref={ref} {...props} showTrendline={true} />;
});

TrendlineScatterPlot.displayName = 'TrendlineScatterPlot';