
// 新架構：使用 BaseChartCore + React 包裝層
import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { PieChartCore, PieChartCoreConfig } from './core/pie-chart-core';

// 向下兼容：支援舊版 props
import { PieChartProps as LegacyPieChartProps } from './types';

// 新的 props 介面
export interface PieChartProps extends ReactChartWrapperProps, PieChartCoreConfig {
  // 新架構不需要額外的 React 專用 props
}

// 創建基於 BaseChartCore 的組件
const PieChartComponent = createReactChartWrapper(PieChartCore);

// 主要導出
export const PieChart = React.forwardRef<PieChartCore, PieChartProps>((props, ref) => {
  return <PieChartComponent ref={ref} {...props} />;
});

PieChart.displayName = 'PieChart';

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
