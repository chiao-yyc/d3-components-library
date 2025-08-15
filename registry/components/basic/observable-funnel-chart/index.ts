import React from 'react';
import './observable-funnel-chart.css';

export { ObservableFunnelChart } from './observable-funnel-chart';
export type { ObservableFunnelChartProps } from './types';
export type { 
  ObservableFunnelChartConfig,
  ObservableFunnelDataPoint,
  ProcessedObservableFunnelDataPoint 
} from './core/types';

export { D3ObservableFunnelChart } from './core';

// 提供一些預設變體
export const DarkObservableFunnelChart = (props: any) => {
  return React.createElement(ObservableFunnelChart, { 
    ...props, 
    background: '#1a1a1a',
    gradient1: '#FF6B6B',
    gradient2: '#4ECDC4' 
  });
};

export const LightObservableFunnelChart = (props: any) => {
  return React.createElement(ObservableFunnelChart, { 
    ...props, 
    background: '#ffffff',
    gradient1: '#3b82f6',
    gradient2: '#10b981',
    valueColor: '#1f2937',
    labelColor: '#374151',
    percentageColor: '#6b7280'
  });
};