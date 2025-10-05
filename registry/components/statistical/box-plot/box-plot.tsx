// 新架構：使用 BaseChartCore + React 包裝層
import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { BoxPlotCore, BoxPlotCoreConfig } from './core/box-plot-core';

// 向下兼容：支援舊版 props
import { BoxPlotProps as LegacyBoxPlotProps } from './types';

// 新的 props 介面
export interface BoxPlotProps extends Omit<ReactChartWrapperProps, 'data' | 'groupBy'>, BoxPlotCoreConfig {
  // 新架構不需要額外的 React 專用 props
}

// 創建基於 BaseChartCore 的組件
const BoxPlotComponent = createReactChartWrapper(BoxPlotCore);

// 主要導出
export const BoxPlot = React.forwardRef<BoxPlotCore, BoxPlotProps>((props, ref) => {
  // 處理 props 兼容性：valueAccessor -> valuesAccessor
  const { valueAccessor, ...otherProps } = props as any;
  const finalProps = {
    ...otherProps,
    // 如果有 valueAccessor 但沒有 valuesAccessor，將 valueAccessor 映射到 valuesAccessor
    valuesAccessor: otherProps.valuesAccessor || valueAccessor
  };
  
  return <BoxPlotComponent ref={ref} {...finalProps} />;
});

BoxPlot.displayName = 'BoxPlot';

// 向下兼容導出
export const BoxPlotLegacy = React.forwardRef<BoxPlotCore, LegacyBoxPlotProps & BoxPlotProps>((props, ref) => {
  // 將舊版 props 轉換為新版本
  const {
    labelKey,
    valuesKey,
    mapping,
    ...modernProps
  } = props as any;

  const finalProps: BoxPlotProps = {
    ...modernProps,
    // 映射舊版資料存取模式到新版
    labelAccessor: modernProps.labelAccessor || (mapping?.label) || labelKey || 'label',
    valuesAccessor: modernProps.valuesAccessor || (mapping?.values) || valuesKey || 'values',
  };

  return <BoxPlot ref={ref} {...finalProps} />;
});

BoxPlotLegacy.displayName = 'BoxPlotLegacy';

export default BoxPlot;

// 為了向下兼容，也導出個別的組件
export { D3BoxPlot } from './core/box-plot'
export type { 
  BoxPlotProps as LegacyBoxPlotProps, 
  ProcessedBoxPlotDataPoint as LegacyProcessedBoxPlotDataPoint, 
  BoxPlotStatistics as LegacyBoxPlotStatistics 
} from './types'

// 導出新架構類型
export type {
  BoxPlotCoreConfig,
  BoxPlotData,
  ProcessedBoxPlotDataPoint
} from './core/box-plot-core'

// 默認配置
export const defaultBoxPlotProps: Partial<BoxPlotProps> = {
  width: 500,
  height: 400,
  margin: { top: 20, right: 60, bottom: 60, left: 60 },
  orientation: 'vertical',
  boxWidth: 40,
  whiskerWidth: 20,
  showOutliers: true,
  showMean: true,
  showMedian: true,
  outlierRadius: 3,
  meanStyle: 'diamond',
  boxFillOpacity: 0.7,
  boxStroke: '#374151',
  boxStrokeWidth: 1,
  statisticsMethod: 'tukey',
  showWhiskers: true,
  showAllPoints: false,
  pointColorMode: 'uniform',
  jitterWidth: 0.6,
  pointRadius: 2,
  pointOpacity: 0.6,
  animate: true,
  animationDuration: 800,
  interactive: true,
  showTooltip: true,
  colors: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554']
}