/**
 * Heatmap - 熱力圖組件（統一版本）
 * 核心邏輯在 HeatmapCore 中實現，React 只負責包裝
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { HeatmapCore, HeatmapCoreConfig } from './core/heatmap-core';
import './heatmap.css';

// 擴展 React props 接口
export interface HeatmapProps extends Omit<ReactChartWrapperProps, 'data' | 'groupBy'>, HeatmapCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
  
  // 添加對舊版 mapping 的支援
  mapping?: {
    x?: string;
    y?: string;
    value?: string;
  };
}

// 創建 Heatmap 組件
const HeatmapComponent = createReactChartWrapper(HeatmapCore);

// 導出最終組件
export const Heatmap = React.forwardRef<HeatmapCore, HeatmapProps>((props, ref) => {
  // 處理 mapping prop 轉換為 accessor props
  const { mapping, ...otherProps } = props;
  
  const finalProps = {
    ...defaultHeatmapProps, // 先應用默認配置
    ...otherProps,          // 再應用用戶配置
    // 如果提供了 mapping，將其轉換為 accessor
    xAccessor: props.xAccessor || mapping?.x || 'x',
    yAccessor: props.yAccessor || mapping?.y || 'y',
    valueAccessor: props.valueAccessor || mapping?.value || 'value',
  };
  
  return <HeatmapComponent ref={ref} {...finalProps} />;
});

Heatmap.displayName = 'Heatmap';

// 默認配置 (使用函數形式以避免 HMR 問題)
const getDefaultHeatmapProps = (): Partial<HeatmapProps> => ({
  width: 600,
  height: 400,
  margin: { top: 40, right: 100, bottom: 60, left: 60 },
  
  // 數據存取默認值
  xAccessor: 'x',
  yAccessor: 'y',
  valueAccessor: 'value',
  
  // 熱力圖配置默認值
  cellPadding: 2, // 優化為 2，創造更好的視覺分離效果
  cellRadius: 3, // 現代化圓角設計，提升視覺質感
  
  // 顏色配置默認值
  colorScheme: 'blues',
  
  // 軸線配置默認值
  showXAxis: true,
  showYAxis: true,
  xAxisRotation: 0,
  yAxisRotation: 0,
  
  // 圖例配置默認值
  showLegend: true,
  legendPosition: 'right',
  legendTitle: 'Value',
  legendFormat: (d: number) => d.toFixed(2),
  
  // 標籤配置默認值
  showValues: false,
  textColor: '#000000',
  
  // 交互配置默認值
  interactive: true,
  enableTooltip: true,
  
  // 動畫配置默認值
  animate: true,
  animationDuration: 750
});

export const defaultHeatmapProps = getDefaultHeatmapProps();

// 為向下兼容，提供舊 props 名稱的映射
export interface HeatmapPropsLegacy {
  // 舊的 key-based 模式
  xKey?: string;
  yKey?: string;
  valueKey?: string;
  
  // 舊的事件命名
  onCellClick?: (data: any, event: Event) => void;
  onCellHover?: (data: any, event: Event) => void;
  
  // 舊的配置名稱
  showTooltip?: boolean; // 映射到 enableTooltip
  tooltipFormat?: (d: any) => string; // 自定義工具提示格式
}

// 兼容性包裝器
export const HeatmapWithLegacySupport = React.forwardRef<HeatmapCore, 
  HeatmapProps & HeatmapPropsLegacy
>((props, ref) => {
  // 將舊的 props 轉換為新格式
  const {
    xKey, yKey, valueKey,
    onCellClick, onCellHover,
    showTooltip, tooltipFormat,
    ...modernProps
  } = props;

  // 處理 key-based 模式到 accessor 的轉換
  const finalProps: HeatmapProps = {
    ...modernProps,
    
    // 數據存取器映射
    xAccessor: modernProps.xAccessor || xKey || 'x',
    yAccessor: modernProps.yAccessor || yKey || 'y',
    valueAccessor: modernProps.valueAccessor || valueKey || 'value',
    
    // 配置映射
    enableTooltip: modernProps.enableTooltip ?? showTooltip ?? true,
    
    // 事件名稱映射
    onDataClick: modernProps.onDataClick || onCellClick,
    onDataHover: modernProps.onDataHover || onCellHover,
  };

  return <Heatmap ref={ref} {...finalProps} />;
});

HeatmapWithLegacySupport.displayName = 'HeatmapWithLegacySupport';

// 專用變體組件
export const BluesHeatmap = React.forwardRef<HeatmapCore, Omit<HeatmapProps, 'colorScheme'>>((props, ref) => {
  return <Heatmap ref={ref} {...props} colorScheme="blues" />;
});

BluesHeatmap.displayName = 'BluesHeatmap';

export const GreensHeatmap = React.forwardRef<HeatmapCore, Omit<HeatmapProps, 'colorScheme'>>((props, ref) => {
  return <Heatmap ref={ref} {...props} colorScheme="greens" />;
});

GreensHeatmap.displayName = 'GreensHeatmap';

export const RedsHeatmap = React.forwardRef<HeatmapCore, Omit<HeatmapProps, 'colorScheme'>>((props, ref) => {
  return <Heatmap ref={ref} {...props} colorScheme="reds" />;
});

RedsHeatmap.displayName = 'RedsHeatmap';

export const ValueLabelHeatmap = React.forwardRef<HeatmapCore, Omit<HeatmapProps, 'showValues'>>((props, ref) => {
  return <Heatmap ref={ref} {...props} showValues={true} />;
});

ValueLabelHeatmap.displayName = 'ValueLabelHeatmap';

export const RoundedHeatmap = React.forwardRef<HeatmapCore, Omit<HeatmapProps, 'cellRadius'>>((props, ref) => {
  return <Heatmap ref={ref} {...props} cellRadius={4} />;
});

RoundedHeatmap.displayName = 'RoundedHeatmap';