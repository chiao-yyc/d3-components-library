
import React from 'react';
import './scatter-plot.css';

// 主版本 (新架構) - 推薦使用
export { 
  ScatterPlotV2, 
  ScatterPlotWithLegacySupport,
  defaultScatterPlotProps 
} from './scatter-plot-v2';

// 舊版本 (向下兼容，已棄用) 
export { ScatterPlot as ScatterPlotLegacy } from './scatter-plot-legacy';

// 預設導出指向新版本
export { ScatterPlotV2 as ScatterPlot } from './scatter-plot-v2';
export type { ScatterPlotProps } from './types';
// 舊的 D3ScatterPlot 已棄用，請使用 ScatterPlotCore
// export { D3ScatterPlot } from './core';
// export type { ScatterPlotConfig as D3ScatterPlotConfig } from './core';
export type { ScatterPlotV2Props } from './scatter-plot-v2';
export { ScatterPlotCore } from './core/scatter-plot-core';
export type { 
  ScatterPlotCoreConfig, 
  ScatterPlotData, 
  ProcessedScatterDataPoint 
} from './core/scatter-plot-core';

// 專用變體組件 (使用新架構)
export const BubbleChart = (props: any) => {
  return React.createElement(ScatterPlot, { 
    ...props, 
    sizeAccessor: props.sizeAccessor || props.sizeKey || 'value',
    pointRadius: props.pointRadius || props.radius
  });
};

export const TrendlineScatterPlot = (props: any) => {
  return React.createElement(ScatterPlot, { ...props, showTrendline: true });
};

// 新版本的專用變體組件
export const BubbleChartV2 = (props: any) => {
  return React.createElement(ScatterPlotV2, { 
    ...props, 
    sizeAccessor: props.sizeAccessor || props.sizeKey || 'value' 
  });
};

export const TrendlineScatterPlotV2 = (props: any) => {
  return React.createElement(ScatterPlotV2, { ...props, showTrendline: true });
};
