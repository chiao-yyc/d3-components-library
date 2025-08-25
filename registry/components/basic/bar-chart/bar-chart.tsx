import React from 'react';
import { createChartComponent } from '../../core/base-chart/base-chart';
import { D3BarChart } from './core/bar-chart';
import { BarChartProps } from './types';

console.log('🎯 BarChart module loaded, creating component with createChartComponent')

// 直接使用 createChartComponent 並添加調試
export const BarChart = (() => {
  console.log('🎯 BarChart: About to call createChartComponent')
  const Component = createChartComponent<BarChartProps>(D3BarChart);
  console.log('🎯 BarChart: createChartComponent returned:', Component)
  return Component;
})();