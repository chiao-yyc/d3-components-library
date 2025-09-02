/**
 * TreeMapV2 - 使用新架構的樹狀圖組件
 * 核心邏輯在 TreeMapCore 中實現，React 只負責包裝
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { TreeMapCore, TreeMapCoreConfig } from './core/tree-map-core';

// 擴展 React props 接口
export interface TreeMapV2Props extends ReactChartWrapperProps, TreeMapCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
}

// 創建 TreeMap 組件
const TreeMapComponent = createReactChartWrapper(TreeMapCore);

// 導出最終組件
export const TreeMapV2 = React.forwardRef<TreeMapCore, TreeMapV2Props>((props, ref) => {
  return <TreeMapComponent ref={ref} {...props} />;
});

TreeMapV2.displayName = 'TreeMapV2';

// 默認配置
export const defaultTreeMapProps: Partial<TreeMapV2Props> = {
  width: 600,
  height: 400,
  margin: { top: 20, right: 20, bottom: 20, left: 20 },
  
  // 數據配置默認值
  dataFormat: 'hierarchy',
  valueKey: 'value',
  nameKey: 'name',
  idKey: 'id',
  parentKey: 'parent',
  
  // 佈局配置默認值
  padding: 1,
  tile: 'squarify',
  round: true,
  
  // 顏色配置默認值
  colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
  colorStrategy: 'depth',
  
  // 標籤配置默認值
  showLabels: true,
  showValues: false,
  labelAlignment: 'center',
  fontSize: 12,
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  fontWeight: 'normal',
  labelColor: '#000000',
  minLabelSize: { width: 30, height: 20 },
  maxLabelLength: 15,
  
  // 樣式配置默認值
  strokeWidth: 1,
  strokeColor: '#ffffff',
  opacity: 1,
  rectRadius: 0,
  
  // 交互配置默認值
  interactive: true,
  enableTooltip: true,
  enableZoom: false,
  enableDrill: false,
  
  // 動畫配置默認值
  animate: true,
  animationDuration: 750,
  
  // 排序配置默認值
  sortBy: 'value',
  sortDirection: 'desc',
  
  // 響應式
  responsive: true
};

// 為向下兼容，提供舊 props 名稱的映射
export interface TreeMapPropsLegacy {
  // 舊的事件命名
  onNodeClick?: (data: any, event: Event) => void;
  onNodeHover?: (data: any, event: Event) => void;
  onNodeLeave?: (data: any, event: Event) => void;
  
  // 舊的配置名稱  
  tileType?: string; // 映射到 tile
  enableAnimation?: boolean; // 映射到 animate
  animationTime?: number; // 映射到 animationDuration
  colorScheme?: string[]; // 映射到 colors
}

// 兼容性包裝器
export const TreeMapWithLegacySupport = React.forwardRef<TreeMapCore, 
  TreeMapV2Props & TreeMapPropsLegacy
>((props, ref) => {
  // 將舊的 props 轉換為新格式
  const {
    onNodeClick, onNodeHover, onNodeLeave,
    tileType, enableAnimation, animationTime, colorScheme,
    ...modernProps
  } = props;

  // 處理 props 映射
  const finalProps: TreeMapV2Props = {
    ...modernProps,
    
    // 配置映射
    tile: modernProps.tile || (tileType as any) || 'squarify',
    animate: modernProps.animate ?? enableAnimation ?? true,
    animationDuration: modernProps.animationDuration || animationTime || 750,
    colors: modernProps.colors || colorScheme,
    
    // 事件名稱映射
    onDataClick: modernProps.onDataClick || onNodeClick,
    onDataHover: modernProps.onDataHover || onNodeHover,
  };

  return <TreeMapV2 ref={ref} {...finalProps} />;
});

TreeMapWithLegacySupport.displayName = 'TreeMapWithLegacySupport';

// 專用變體組件
export const HierarchyTreeMapV2 = React.forwardRef<TreeMapCore, Omit<TreeMapV2Props, 'dataFormat'>>((props, ref) => {
  return <TreeMapV2 ref={ref} {...props} dataFormat="hierarchy" />;
});

HierarchyTreeMapV2.displayName = 'HierarchyTreeMapV2';

export const StratifiedTreeMapV2 = React.forwardRef<TreeMapCore, Omit<TreeMapV2Props, 'dataFormat'>>((props, ref) => {
  return <TreeMapV2 ref={ref} {...props} dataFormat="stratified" />;
});

StratifiedTreeMapV2.displayName = 'StratifiedTreeMapV2';

export const ZoomableTreeMapV2 = React.forwardRef<TreeMapCore, Omit<TreeMapV2Props, 'enableZoom'>>((props, ref) => {
  return <TreeMapV2 ref={ref} {...props} enableZoom={true} />;
});

ZoomableTreeMapV2.displayName = 'ZoomableTreeMapV2';

export const DrillableTreeMapV2 = React.forwardRef<TreeMapCore, Omit<TreeMapV2Props, 'enableDrill'>>((props, ref) => {
  return <TreeMapV2 ref={ref} {...props} enableDrill={true} />;
});

DrillableTreeMapV2.displayName = 'DrillableTreeMapV2';