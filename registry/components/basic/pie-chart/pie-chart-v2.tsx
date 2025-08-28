/**
 * PieChart v2 - 使用新架構的圓餅圖組件
 * 核心邏輯在 PieChartCore 中實現，React 只負責包裝
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { PieChartCore, PieChartCoreConfig, LabelConfig, LegendConfig } from './core/pie-chart-core';

// 擴展 React props 接口
export interface PieChartV2Props extends ReactChartWrapperProps, PieChartCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
}

// 創建 PieChart 組件
const PieChartComponent = createReactChartWrapper(PieChartCore);

// 導出最終組件
export const PieChartV2 = React.forwardRef<PieChartCore, PieChartV2Props>((props, ref) => {
  return <PieChartComponent ref={ref} {...props} />;
});

PieChartV2.displayName = 'PieChartV2';

// 默認配置
export const defaultPieChartProps: Partial<PieChartV2Props> = {
  width: 500,
  height: 400,
  margin: { top: 20, right: 20, bottom: 20, left: 20 },
  
  // 數據映射默認值
  labelAccessor: 'label',
  valueAccessor: 'value',
  
  // 圓餅圖形狀默認值
  innerRadius: 0, // 實心圓餅圖
  outerRadius: undefined, // 自動計算
  cornerRadius: 0,
  startAngle: 0,
  endAngle: 2 * Math.PI,
  padAngle: 0,
  
  // 視覺樣式默認值
  colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
  strokeWidth: 1,
  strokeColor: 'white',
  
  // 標籤配置默認值
  labels: {
    show: true,
    position: 'outside',
    fontSize: 12,
    fontFamily: 'Arial, sans-serif',
    color: '#333',
    offset: 1.2,
    connector: {
      show: true,
      color: '#999',
      strokeWidth: 1
    }
  } as LabelConfig,
  
  // 圖例配置默認值
  legend: {
    show: false,
    position: 'right',
    itemWidth: 120,
    itemHeight: 20,
    spacing: 5,
    fontSize: 12,
    fontFamily: 'Arial, sans-serif',
    color: '#333'
  } as LegendConfig,
  
  // 排序默認值
  sortBy: 'none',
  sortOrder: 'desc',
  
  // 動畫默認值
  animationType: 'fade',
  animate: true,
  animationDuration: 750,
  
  // 響應式
  responsive: true
};

// 為向下兼容，提供舊 props 名稱的映射
export interface PieChartPropsLegacy {
  // 舊的 key-based 模式
  labelKey?: string;
  valueKey?: string;
  colorKey?: string;
  
  // 舊的 accessor-based 模式  
  labelAccessor?: (d: any) => string;
  valueAccessor?: (d: any) => number;
  colorAccessor?: (d: any) => string;
  
  // 舊的事件命名
  onSliceClick?: (data: any, event: Event) => void;
  onSliceHover?: (data: any, event: Event) => void;
  onArcClick?: (data: any, event: Event) => void;
  onArcHover?: (data: any, event: Event) => void;
  
  // 舊的配置名稱
  showLabels?: boolean; // 映射到 labels.show
  labelPosition?: string; // 映射到 labels.position
  showLegend?: boolean; // 映射到 legend.show
  legendPosition?: string; // 映射到 legend.position
  donutRatio?: number; // 映射到 innerRadius 計算
}

// 兼容性包裝器
export const PieChartWithLegacySupport = React.forwardRef<PieChartCore, 
  PieChartV2Props & PieChartPropsLegacy
>((props, ref) => {
  // 將舊的 props 轉換為新格式
  const {
    labelKey, valueKey, colorKey,
    labelAccessor, valueAccessor, colorAccessor,
    onSliceClick, onSliceHover, onArcClick, onArcHover,
    showLabels, labelPosition, showLegend, legendPosition, donutRatio,
    ...modernProps
  } = props;

  // 處理 donut ratio 到 innerRadius 的轉換
  const calculatedInnerRadius = React.useMemo(() => {
    if (modernProps.innerRadius !== undefined) return modernProps.innerRadius;
    if (donutRatio !== undefined) {
      const outerRadius = modernProps.outerRadius || Math.min((modernProps.width || 500), (modernProps.height || 400)) / 2 - 50;
      return outerRadius * donutRatio;
    }
    return 0;
  }, [modernProps.innerRadius, donutRatio, modernProps.outerRadius, modernProps.width, modernProps.height]);

  // 處理 key-based 模式到 mapping 的轉換
  const finalProps: PieChartV2Props = {
    ...modernProps,
    
    // 數據存取器映射
    labelAccessor: modernProps.labelAccessor || labelAccessor || labelKey || 'label',
    valueAccessor: modernProps.valueAccessor || valueAccessor || valueKey || 'value',
    colorAccessor: modernProps.colorAccessor || colorAccessor || colorKey,
    
    // 圓餅圖形狀映射
    innerRadius: calculatedInnerRadius,
    
    // 標籤配置映射
    labels: {
      ...defaultPieChartProps.labels,
      ...modernProps.labels,
      show: modernProps.labels?.show !== undefined ? modernProps.labels.show : (showLabels !== undefined ? showLabels : true),
      position: (modernProps.labels?.position || labelPosition || 'outside') as any,
    },
    
    // 圖例配置映射
    legend: {
      ...defaultPieChartProps.legend,
      ...modernProps.legend,
      show: modernProps.legend?.show !== undefined ? modernProps.legend.show : (showLegend !== undefined ? showLegend : false),
      position: (modernProps.legend?.position || legendPosition || 'right') as any,
    },
    
    // 事件名稱映射
    onSegmentClick: modernProps.onSegmentClick || onSliceClick || onArcClick,
    onSegmentHover: modernProps.onSegmentHover || onSliceHover || onArcHover,
  };

  return <PieChartV2 ref={ref} {...finalProps} />;
});

PieChartWithLegacySupport.displayName = 'PieChartWithLegacySupport';

// 專用變體組件
export const DonutChartV2 = React.forwardRef<PieChartCore, Omit<PieChartV2Props, 'innerRadius'> & { innerRadiusRatio?: number }>((props, ref) => {
  const { innerRadiusRatio = 0.5, ...restProps } = props;
  const outerRadius = restProps.outerRadius || Math.min((restProps.width || 500), (restProps.height || 400)) / 2 - 50;
  const innerRadius = outerRadius * innerRadiusRatio;
  
  return <PieChartV2 ref={ref} {...restProps} innerRadius={innerRadius} />;
});

DonutChartV2.displayName = 'DonutChartV2';

export const PieChartWithLegendV2 = React.forwardRef<PieChartCore, Omit<PieChartV2Props, 'legend'>>((props, ref) => {
  return <PieChartV2 ref={ref} {...props} legend={{ ...defaultPieChartProps.legend, show: true }} />;
});

PieChartWithLegendV2.displayName = 'PieChartWithLegendV2';

export const HalfPieChartV2 = React.forwardRef<PieChartCore, Omit<PieChartV2Props, 'startAngle' | 'endAngle'>>((props, ref) => {
  return <PieChartV2 ref={ref} {...props} startAngle={0} endAngle={Math.PI} />;
});

HalfPieChartV2.displayName = 'HalfPieChartV2';

export const PieChartNoLabelsV2 = React.forwardRef<PieChartCore, Omit<PieChartV2Props, 'labels'>>((props, ref) => {
  return <PieChartV2 ref={ref} {...props} labels={{ ...defaultPieChartProps.labels, show: false }} />;
});

PieChartNoLabelsV2.displayName = 'PieChartNoLabelsV2';

export const PieChartSortedV2 = React.forwardRef<PieChartCore, Omit<PieChartV2Props, 'sortBy' | 'sortOrder'>>((props, ref) => {
  return <PieChartV2 ref={ref} {...props} sortBy="value" sortOrder="desc" />;
});

PieChartSortedV2.displayName = 'PieChartSortedV2';