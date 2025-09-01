/**
 * ViolinPlot V2 - 使用新的 BaseChartCore 架構
 * 採用統一軸線系統和框架無關設計
 */

import React from 'react';
import { createReactChartWrapper, ReactChartWrapperProps } from '../../core/base-chart/react-chart-wrapper';
import { ViolinPlotCore, ViolinPlotCoreConfig } from './core/violin-plot-core';

// 擴展 React props 接口
export interface ViolinPlotV2Props extends ReactChartWrapperProps, ViolinPlotCoreConfig {
  // React 專用 props 已經在 ReactChartWrapperProps 中定義
}

// 創建 ViolinPlot 組件
const ViolinPlotComponent = createReactChartWrapper(ViolinPlotCore);

// 導出最終組件
export const ViolinPlotV2 = React.forwardRef<ViolinPlotCore, ViolinPlotV2Props>((props, ref) => {
  return <ViolinPlotComponent ref={ref} {...props} />;
});

ViolinPlotV2.displayName = 'ViolinPlotV2';

// 默認配置 (使用函數形式以避免 HMR 問題)
const getDefaultViolinPlotProps = (): Partial<ViolinPlotV2Props> => ({
  width: 600,
  height: 500,
  margin: { top: 20, right: 60, bottom: 60, left: 60 },
  
  // 小提琴圖配置默認值
  orientation: 'vertical',
  violinWidth: 80,
  resolution: 100,
  kdeMethod: 'gaussian',
  smoothing: 1,
  
  // BoxPlot 配置默認值
  showBoxPlot: true,
  boxPlotWidth: 15,
  showMedian: true,
  showMean: true,
  showQuartiles: true,
  showOutliers: true,
  showWhiskers: true,
  
  // 軸線配置默認值
  showXAxis: true,
  showYAxis: true,
  showGrid: false,
  
  // 視覺樣式默認值
  colors: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a', '#172554'],
  violinFillOpacity: 0.7,
  violinStroke: '#374151',
  violinStrokeWidth: 1,
  boxPlotStroke: '#374151',
  boxPlotStrokeWidth: 2,
  medianStroke: '#000',
  medianStrokeWidth: 3,
  meanStyle: 'diamond',
  
  // 統計配置默認值
  statisticsMethod: 'tukey',
  
  // 動畫配置默認值
  animate: true,
  animationDuration: 1000,
  animationDelay: 100,
});

// 默認匯出
export default ViolinPlotV2;

// 重新導出類型
export type { 
  ViolinPlotCoreConfig, 
  ViolinPlotData, 
  ProcessedViolinDataPoint, 
  DensityPoint 
} from './core/violin-plot-core';