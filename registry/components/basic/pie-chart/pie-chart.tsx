
/**
 * PieChart - 統一架構的圓餅圖組件
 * 核心邏輯在 PieChartCore 中實現，React 只負責包裝
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { PieChartCore, PieChartCoreConfig, LabelConfig, LegendConfig } from './core/pie-chart-core';

// 擴展 React props 接口
export interface PieChartProps extends PieChartCoreConfig, ReactChartWrapperProps {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義

  // 添加對舊版 mapping 的支援
  mapping?: {
    label?: string;
    value?: string;
    color?: string;
  };
}

// 創建 PieChart 組件
const PieChartComponent = createReactChartWrapper(PieChartCore);

// 導出最終組件
export const PieChart = React.forwardRef<PieChartCore, PieChartProps>((props, ref) => {
  // 處理 mapping prop 轉換為 accessor props
  const { mapping, ...otherProps } = props;
  
  const finalProps = {
    ...defaultPieChartProps, // 先應用默認配置
    ...otherProps,           // 再應用用戶配置
    // 如果提供了 mapping，將其轉換為 accessor
    labelAccessor: props.labelAccessor || mapping?.label || 'label',
    valueAccessor: props.valueAccessor || mapping?.value || 'value',
    colorAccessor: props.colorAccessor || mapping?.color,
  };
  
  return <PieChartComponent ref={ref} {...finalProps} />;
});

PieChart.displayName = 'PieChart';

// 舊版 props 接口
interface LegacyPieChartProps {
  labelKey?: string;
  valueKey?: string;
  colorKey?: string;
  labelAccessor?: string | ((d: any) => string);
  valueAccessor?: string | ((d: any) => number);
  colorAccessor?: string | ((d: any) => string);
}

// 向下兼容導出
export const PieChartLegacy = React.forwardRef<PieChartCore, LegacyPieChartProps & PieChartProps>((props, ref) => {
  // 將舊版 props 轉換為新版本
  const {
    labelKey,
    valueKey,
    colorKey,
    labelAccessor: legacyLabelAccessor,
    valueAccessor: legacyValueAccessor,
    colorAccessor: legacyColorAccessor,
    ...modernProps
  } = props;

  const finalProps: PieChartProps = {
    ...modernProps,
    // 映射舊版資料存取模式到新版
    labelAccessor: modernProps.labelAccessor || legacyLabelAccessor || labelKey || 'label',
    valueAccessor: modernProps.valueAccessor || legacyValueAccessor || valueKey || 'value',
    colorAccessor: modernProps.colorAccessor || legacyColorAccessor || colorKey,
  };

  return <PieChart ref={ref} {...finalProps} />;
});

PieChartLegacy.displayName = 'PieChartLegacy';

// 默認配置
export const defaultPieChartProps: Partial<PieChartProps> = {
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
  
  // Tooltip 默認值
  enableTooltip: true
};

// 專用變體組件
export const DonutChart = React.forwardRef<PieChartCore, Omit<PieChartProps, 'innerRadius'> & { innerRadiusRatio?: number }>((props, ref) => {
  const { innerRadiusRatio = 0.5, ...restProps } = props;
  const outerRadius = restProps.outerRadius || Math.min((restProps.width || 500), (restProps.height || 400)) / 2 - 50;
  const innerRadius = outerRadius * innerRadiusRatio;
  
  return <PieChart ref={ref} {...restProps} innerRadius={innerRadius} />;
});

DonutChart.displayName = 'DonutChart';

export const PieChartWithLegend = React.forwardRef<PieChartCore, Omit<PieChartProps, 'legend'>>((props, ref) => {
  return <PieChart ref={ref} {...props} legend={{ ...defaultPieChartProps.legend, show: true }} />;
});

PieChartWithLegend.displayName = 'PieChartWithLegend';

export const HalfPieChart = React.forwardRef<PieChartCore, Omit<PieChartProps, 'startAngle' | 'endAngle'>>((props, ref) => {
  return <PieChart ref={ref} {...props} startAngle={0} endAngle={Math.PI} />;
});

HalfPieChart.displayName = 'HalfPieChart';

export const PieChartNoLabels = React.forwardRef<PieChartCore, Omit<PieChartProps, 'labels'>>((props, ref) => {
  return <PieChart ref={ref} {...props} labels={{ ...defaultPieChartProps.labels, show: false }} />;
});

PieChartNoLabels.displayName = 'PieChartNoLabels';

export const PieChartSorted = React.forwardRef<PieChartCore, Omit<PieChartProps, 'sortBy' | 'sortOrder'>>((props, ref) => {
  return <PieChart ref={ref} {...props} sortBy="value" sortOrder="desc" />;
});

PieChartSorted.displayName = 'PieChartSorted';
